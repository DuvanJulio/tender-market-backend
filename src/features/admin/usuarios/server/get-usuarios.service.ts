import { supabaseAdmin } from "@/lib/supabase/admin"
import type { IUsuarioAdmin } from "../interfaces"
import { USUARIOS_ADMIN_MESSAGES } from "./types"
import {
  mapRol,
  mapUsuarioAdminRow,
  pickRelationField,
  type TProveedorProfile,
  type TRawUsuario,
  type TTenderoProfile,
} from "./usuario-mapper"

type TGetUsuariosAdminServiceResult =
  | { ok: true; data: IUsuarioAdmin[] }
  | { ok: false; message: string; status: number }

async function buildEmailByUserIdMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  let page = 1
  const perPage = 200

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    })

    if (error) {
      console.warn("No se pudieron cargar emails de auth:", error.message)
      break
    }

    for (const user of data.users) {
      if (user.email) map.set(user.id, user.email)
    }

    if (data.users.length < perPage) break
    page += 1
  }

  return map
}

async function loadCiudadByDireccionId(
  direccionIds: number[]
): Promise<Map<number, string>> {
  const map = new Map<number, string>()
  if (direccionIds.length === 0) return map

  const { data, error } = await supabaseAdmin
    .from("direcciones")
    .select("id, ciudades(nombre)")
    .in("id", direccionIds)

  if (error) {
    console.warn("Ciudades por dirección no disponibles:", error.message)
    return map
  }

  for (const row of data ?? []) {
    const ciudad = pickRelationField(
      row.ciudades as { nombre: string } | { nombre: string }[] | null
    )
    if (ciudad) map.set(row.id as number, ciudad)
  }

  return map
}

export async function fetchUsuariosAdminContext(usuarioIds: string[]) {
  const [emailMap, tenderosRes, proveedoresRes] = await Promise.all([
    buildEmailByUserIdMap(),
    usuarioIds.length > 0
      ? supabaseAdmin
          .from("tenderos")
          .select(
            "usuario_id, nombre_tienda, direccion_id, direcciones(ciudades(nombre))"
          )
          .in("usuario_id", usuarioIds)
      : Promise.resolve({ data: [], error: null }),
    usuarioIds.length > 0
      ? supabaseAdmin
          .from("proveedores")
          .select(
            "usuario_id, nombre_empresa, direccion_id, direcciones(ciudades(nombre))"
          )
          .in("usuario_id", usuarioIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  const tenderoByUserId = new Map<string, TTenderoProfile>()
  for (const row of (tenderosRes.data ?? []) as TTenderoProfile[]) {
    tenderoByUserId.set(row.usuario_id, row)
  }

  const proveedorByUserId = new Map<string, TProveedorProfile>()
  for (const row of (proveedoresRes.data ?? []) as TProveedorProfile[]) {
    proveedorByUserId.set(row.usuario_id, row)
  }

  const direccionIds = [
    ...new Set(
      [...(tenderosRes.data ?? []), ...(proveedoresRes.data ?? [])]
        .map((p) => p.direccion_id as number | null)
        .filter((id): id is number => typeof id === "number")
    ),
  ]

  const ciudadByDireccionId = await loadCiudadByDireccionId(direccionIds)

  return { emailMap, tenderoByUserId, proveedorByUserId, ciudadByDireccionId }
}

export async function getUsuariosAdminService(): Promise<TGetUsuariosAdminServiceResult> {
  const { data: rows, error } = await supabaseAdmin
    .from("usuarios")
    .select(
      "id, nombre, apellido, telefono, created_at, roles(nombre), estados_usuarios(nombre)"
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error al cargar usuarios:", error)
    return {
      ok: false,
      message: USUARIOS_ADMIN_MESSAGES.loadFailed,
      status: 500,
    }
  }

  const usuariosRaw = (rows ?? []) as TRawUsuario[]
  const usuariosFiltrados = usuariosRaw.filter((row) => {
    const rol = pickRelationField(row.roles)
    return rol === "tendero" || rol === "proveedor"
  })

  const context = await fetchUsuariosAdminContext(
    usuariosFiltrados.map((u) => u.id)
  )

  const data: IUsuarioAdmin[] = usuariosFiltrados.flatMap((row) => {
    const rol = pickRelationField(row.roles)
    const mapped = mapUsuarioAdminRow(row, {
      email: context.emailMap.get(row.id) ?? null,
      tendero:
        rol === "tendero"
          ? context.tenderoByUserId.get(row.id)
          : undefined,
      proveedor:
        rol === "proveedor"
          ? context.proveedorByUserId.get(row.id)
          : undefined,
      ciudadByDireccionId: context.ciudadByDireccionId,
    })
    return mapped ? [mapped] : []
  })

  return { ok: true, data }
}
