import { supabaseAdmin } from "@/lib/supabase/admin"
import {
  buildPaginationMeta,
  getPaginationRange,
  type IPaginatedResult,
} from "@/lib/pagination"
import type { IUsuarioAdmin } from "../interfaces"
import { USUARIOS_ADMIN_MESSAGES } from "./types"
import {
  mapUsuarioAdminRow,
  pickRelationField,
  type TProveedorProfile,
  type TRawUsuario,
  type TTenderoProfile,
} from "./usuario-mapper"

export type TGetUsuariosAdminQuery = {
  page: number
  pageSize: number
  search?: string
  rol?: "tendero" | "proveedor"
  estado?: "activo" | "pendiente" | "inactivo"
}

type TGetUsuariosAdminServiceResult =
  | { ok: true; data: IPaginatedResult<IUsuarioAdmin> }
  | { ok: false; message: string; status: number }

const BLOQUEADO_ESTADO_ID = 4

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

async function resolveRolIds(): Promise<Map<string, number>> {
  const { data } = await supabaseAdmin
    .from("roles")
    .select("id, nombre")
    .in("nombre", ["tendero", "proveedor"])

  const map = new Map<string, number>()
  for (const row of data ?? []) {
    if (row.nombre === "tendero" || row.nombre === "proveedor") {
      map.set(row.nombre, row.id)
    }
  }
  return map
}

export async function getUsuariosAdminService(
  query: TGetUsuariosAdminQuery
): Promise<TGetUsuariosAdminServiceResult> {
  const { page, pageSize, search, rol, estado } = query
  const { from, to } = getPaginationRange(page, pageSize)

  const rolIdsByNombre = await resolveRolIds()
  const allowedRolIds = [...rolIdsByNombre.values()]

  if (allowedRolIds.length === 0) {
    return {
      ok: true,
      data: {
        items: [],
        pagination: buildPaginationMeta(page, pageSize, 0),
      },
    }
  }

  let dbQuery = supabaseAdmin
    .from("usuarios")
    .select(
      "id, nombre, apellido, telefono, created_at, roles!inner(nombre), estados_usuarios!inner(nombre)",
      { count: "exact" }
    )
    .in("rol_id", allowedRolIds)
    .order("created_at", { ascending: false })

  if (rol) {
    const rolId = rolIdsByNombre.get(rol)
    if (rolId) dbQuery = dbQuery.eq("rol_id", rolId)
  }

  if (estado === "pendiente") {
    dbQuery = dbQuery.eq("estado_id", 1)
  } else if (estado === "activo") {
    dbQuery = dbQuery.eq("estado_id", 2)
  } else if (estado === "inactivo") {
    dbQuery = dbQuery.in("estado_id", [3, BLOQUEADO_ESTADO_ID])
  }

  const searchTerm = search?.trim()
  if (searchTerm) {
    const pattern = `%${searchTerm}%`
    dbQuery = dbQuery.or(
      `nombre.ilike.${pattern},apellido.ilike.${pattern},telefono.ilike.${pattern}`
    )
  }

  const { data: rows, error, count } = await dbQuery.range(from, to)

  if (error) {
    console.error("Error al cargar usuarios:", error)
    return {
      ok: false,
      message: USUARIOS_ADMIN_MESSAGES.loadFailed,
      status: 500,
    }
  }

  const usuariosRaw = (rows ?? []) as TRawUsuario[]
  const total = count ?? 0

  const context = await fetchUsuariosAdminContext(
    usuariosRaw.map((u) => u.id)
  )

  const items: IUsuarioAdmin[] = usuariosRaw.flatMap((row) => {
    const rolNombre = pickRelationField(row.roles)
    const mapped = mapUsuarioAdminRow(row, {
      email: context.emailMap.get(row.id) ?? null,
      tendero:
        rolNombre === "tendero"
          ? context.tenderoByUserId.get(row.id)
          : undefined,
      proveedor:
        rolNombre === "proveedor"
          ? context.proveedorByUserId.get(row.id)
          : undefined,
      ciudadByDireccionId: context.ciudadByDireccionId,
    })
    return mapped ? [mapped] : []
  })

  return {
    ok: true,
    data: {
      items,
      pagination: buildPaginationMeta(page, pageSize, total),
    },
  }
}
