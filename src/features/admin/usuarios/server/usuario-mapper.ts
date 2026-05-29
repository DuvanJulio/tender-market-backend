import type {
  IUsuarioAdmin,
  TUsuarioEstadoAdmin,
  TUsuarioRolAdmin,
} from "../interfaces"

export const ESTADO_ID_BY_NOMBRE: Record<TUsuarioEstadoAdmin, number> = {
  pendiente: 1,
  activo: 2,
  inactivo: 3,
}

export type TRawUsuario = {
  id: string
  nombre: string | null
  apellido: string | null
  telefono: string | null
  created_at: string
  roles: { nombre: string } | { nombre: string }[] | null
  estados_usuarios: { nombre: string } | { nombre: string }[] | null
}

export type TTenderoProfile = {
  usuario_id: string
  nombre_tienda: string
  direccion_id: number | null
  direcciones:
    | { ciudades: { nombre: string } | { nombre: string }[] | null }
    | { ciudades: { nombre: string } | { nombre: string }[] | null }[]
    | null
}

export type TProveedorProfile = {
  usuario_id: string
  nombre_empresa: string
  direccion_id: number | null
  direcciones:
    | { ciudades: { nombre: string } | { nombre: string }[] | null }
    | { ciudades: { nombre: string } | { nombre: string }[] | null }[]
    | null
}

export function pickRelationField<T extends { nombre: string }>(
  relation: T | T[] | null | undefined
): string | null {
  if (!relation) return null
  const item = Array.isArray(relation) ? relation[0] : relation
  return item?.nombre ?? null
}

export function pickCiudadNombre(
  direcciones: TTenderoProfile["direcciones"]
): string | null {
  if (!direcciones) return null
  const dir = Array.isArray(direcciones) ? direcciones[0] : direcciones
  if (!dir?.ciudades) return null
  return pickRelationField(dir.ciudades)
}

export function buildFullName(
  nombre: string | null,
  apellido: string | null
): string {
  return [nombre, apellido].filter(Boolean).join(" ").trim() || "Sin nombre"
}

/** En admin solo exponemos 3 estados; bloqueado legacy se muestra como inactivo. */
export function mapEstado(nombre: string | null): TUsuarioEstadoAdmin {
  if (nombre === "bloqueado") return "inactivo"

  const valid: TUsuarioEstadoAdmin[] = ["activo", "pendiente", "inactivo"]
  if (nombre && valid.includes(nombre as TUsuarioEstadoAdmin)) {
    return nombre as TUsuarioEstadoAdmin
  }
  return "pendiente"
}

export function mapRol(nombre: string | null): TUsuarioRolAdmin | null {
  if (nombre === "tendero" || nombre === "proveedor") return nombre
  return null
}

export function mapUsuarioAdminRow(
  row: TRawUsuario,
  context: {
    email: string | null
    tendero?: TTenderoProfile
    proveedor?: TProveedorProfile
    ciudadByDireccionId: Map<number, string>
  }
): IUsuarioAdmin | null {
  const rolNombre = pickRelationField(row.roles)
  const rol = mapRol(rolNombre)
  if (!rol) return null

  const estado = mapEstado(pickRelationField(row.estados_usuarios))
  let negocio = "—"
  let ciudad: string | null = null

  if (rol === "tendero" && context.tendero) {
    negocio = context.tendero.nombre_tienda ?? "—"
    ciudad =
      pickCiudadNombre(context.tendero.direcciones) ??
      (context.tendero.direccion_id
        ? (context.ciudadByDireccionId.get(context.tendero.direccion_id) ?? null)
        : null)
  } else if (rol === "proveedor" && context.proveedor) {
    negocio = context.proveedor.nombre_empresa ?? "—"
    ciudad =
      pickCiudadNombre(context.proveedor.direcciones) ??
      (context.proveedor.direccion_id
        ? (context.ciudadByDireccionId.get(context.proveedor.direccion_id) ??
          null)
        : null)
  }

  return {
    id: row.id,
    nombre: buildFullName(row.nombre, row.apellido),
    nombre_pila: row.nombre ?? "",
    apellido: row.apellido,
    email: context.email,
    telefono: row.telefono,
    rol,
    negocio,
    ciudad,
    estado,
    pedidos: 0,
    total_gastado: 0,
    fecha_registro: row.created_at,
  }
}
