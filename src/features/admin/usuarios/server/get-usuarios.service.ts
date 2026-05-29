import { supabaseAdmin } from "@/lib/supabase/admin"
import type { IUsuarioAdminDetalle } from "../interfaces"
import { USUARIOS_ADMIN_MESSAGES } from "./types"
import {
  buildFullName,
  mapEstado,
  mapRol,
  pickRelationField,
  type TRawUsuario,
} from "./usuario-mapper"

type TGetUsuarioServiceResult =
  | { ok: true; data: IUsuarioAdminDetalle }
  | { ok: false; message: string; status: number }

type TRawUsuarioDetalle = TRawUsuario & {
  last_login: string | null
  updated_at: string
}

type TRawDireccion = {
  direccion: string
  barrio: string | null
  ciudades:
    | { nombre: string; departamentos: { nombre: string } | null }
    | { nombre: string; departamentos: { nombre: string } | null }[]
    | null
}

function pickDepartamento(
  ciudades: TRawDireccion["ciudades"]
): string | null {
  if (!ciudades) return null
  const ciudad = Array.isArray(ciudades) ? ciudades[0] : ciudades
  const dept = ciudad?.departamentos
  if (!dept) return null
  return Array.isArray(dept) ? dept[0]?.nombre ?? null : dept.nombre ?? null
}

function pickCiudadNombreDetalle(
  ciudades: TRawDireccion["ciudades"]
): string | null {
  if (!ciudades) return null
  const ciudad = Array.isArray(ciudades) ? ciudades[0] : ciudades
  return ciudad?.nombre ?? null
}

export async function getUsuarioAdminService(
  usuarioId: string
): Promise<TGetUsuarioServiceResult> {
  if (!usuarioId) {
    return {
      ok: false,
      message: USUARIOS_ADMIN_MESSAGES.notFound,
      status: 400,
    }
  }

  const { data: row, error } = await supabaseAdmin
    .from("usuarios")
    .select(
      "id, nombre, apellido, telefono, created_at, updated_at, last_login, roles(nombre), estados_usuarios(nombre)"
    )
    .eq("id", usuarioId)
    .maybeSingle()

  if (error || !row) {
    return {
      ok: false,
      message: USUARIOS_ADMIN_MESSAGES.notFound,
      status: 404,
    }
  }

  const usuario = row as TRawUsuarioDetalle
  const rolNombre = pickRelationField(usuario.roles)
  const rol = mapRol(rolNombre)

  if (!rol) {
    return {
      ok: false,
      message: USUARIOS_ADMIN_MESSAGES.notFound,
      status: 404,
    }
  }

  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(
    usuarioId
  )

  let nit: string | null = null
  let nombreTienda: string | null = null
  let nombreEmpresa: string | null = null
  let nombreContacto: string | null = null
  let telefonoNegocio: string | null = null
  let direccion: string | null = null
  let barrio: string | null = null
  let ciudad: string | null = null
  let departamento: string | null = null

  if (rol === "tendero") {
    const { data: tendero } = await supabaseAdmin
      .from("tenderos")
      .select(
        "nombre_tienda, telefono, nit, direcciones(direccion, barrio, ciudades(nombre, departamentos(nombre)))"
      )
      .eq("usuario_id", usuarioId)
      .maybeSingle()

    if (tendero) {
      nombreTienda = tendero.nombre_tienda ?? null
      nit = tendero.nit ?? null
      telefonoNegocio = tendero.telefono ?? null
      const dir = tendero.direcciones as unknown as
        | TRawDireccion
        | TRawDireccion[]
        | null
      const dirRow = Array.isArray(dir) ? dir[0] : dir
      if (dirRow) {
        direccion = dirRow.direccion ?? null
        barrio = dirRow.barrio ?? null
        ciudad = pickCiudadNombreDetalle(dirRow.ciudades)
        departamento = pickDepartamento(dirRow.ciudades)
      }
    }
  } else {
    const { data: proveedor } = await supabaseAdmin
      .from("proveedores")
      .select(
        "nombre_empresa, nombre_contacto, telefono, nit, direcciones(direccion, barrio, ciudades(nombre, departamentos(nombre)))"
      )
      .eq("usuario_id", usuarioId)
      .maybeSingle()

    if (proveedor) {
      nombreEmpresa = proveedor.nombre_empresa ?? null
      nombreContacto = proveedor.nombre_contacto ?? null
      nit = proveedor.nit ?? null
      telefonoNegocio = proveedor.telefono ?? null
      const dir = proveedor.direcciones as unknown as
        | TRawDireccion
        | TRawDireccion[]
        | null
      const dirRow = Array.isArray(dir) ? dir[0] : dir
      if (dirRow) {
        direccion = dirRow.direccion ?? null
        barrio = dirRow.barrio ?? null
        ciudad = pickCiudadNombreDetalle(dirRow.ciudades)
        departamento = pickDepartamento(dirRow.ciudades)
      }
    }
  }

  if (!direccion && (rol === "tendero" || rol === "proveedor")) {
    const table = rol === "tendero" ? "tenderos" : "proveedores"
    const { data: profile } = await supabaseAdmin
      .from(table)
      .select("direccion_id")
      .eq("usuario_id", usuarioId)
      .maybeSingle()

    if (profile?.direccion_id) {
      const { data: dirRow } = await supabaseAdmin
        .from("direcciones")
        .select("direccion, barrio, ciudades(nombre, departamentos(nombre))")
        .eq("id", profile.direccion_id)
        .maybeSingle()

      if (dirRow) {
        direccion = dirRow.direccion ?? null
        barrio = dirRow.barrio ?? null
        const ciudadesRaw = dirRow.ciudades as unknown as TRawDireccion["ciudades"]
        ciudad = pickCiudadNombreDetalle(ciudadesRaw)
        departamento = pickDepartamento(ciudadesRaw)
      }
    }
  }

  const negocio =
    rol === "tendero"
      ? (nombreTienda ?? "—")
      : (nombreEmpresa ?? "—")

  const data: IUsuarioAdminDetalle = {
    id: usuario.id,
    nombre: buildFullName(usuario.nombre, usuario.apellido),
    nombre_pila: usuario.nombre ?? "",
    apellido: usuario.apellido,
    email: authUser.user?.email ?? null,
    telefono: usuario.telefono,
    rol,
    negocio,
    ciudad,
    estado: mapEstado(pickRelationField(usuario.estados_usuarios)),
    pedidos: 0,
    total_gastado: 0,
    fecha_registro: usuario.created_at,
    fecha_actualizacion: usuario.updated_at,
    ultimo_acceso: usuario.last_login,
    nit,
    nombre_tienda: nombreTienda,
    nombre_empresa: nombreEmpresa,
    nombre_contacto: nombreContacto,
    telefono_negocio: telefonoNegocio,
    direccion,
    barrio,
    departamento,
  }

  return { ok: true, data }
}
