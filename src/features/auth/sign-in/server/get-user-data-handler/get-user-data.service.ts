import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { IGetUserDataResponseData, TUserRole } from "../../interfaces"
import type { IUsuarioBasicProfile } from "./types"

type TGetUserDataServiceResult =
  | { ok: true; data: IGetUserDataResponseData }
  | { ok: false; message: string; status: number }

type TDireccionRow = {
  direccion: string
  barrio: string | null
  ciudades: { nombre: string } | { nombre: string }[] | null
}

function buildFullName(usuario: IUsuarioBasicProfile | null): string | undefined {
  if (!usuario) return undefined

  const parts = [usuario.nombre, usuario.apellido].filter(Boolean)
  return parts.length > 0 ? parts.join(" ") : undefined
}

function pickRolNombre(profile: IUsuarioBasicProfile | null): TUserRole | undefined {
  const roles = profile?.roles
  if (!roles) return undefined
  const nombre = Array.isArray(roles) ? roles[0]?.nombre : roles.nombre
  if (nombre === "tendero" || nombre === "proveedor" || nombre === "admin") {
    return nombre
  }
  return undefined
}

function formatDireccion(direccion: TDireccionRow | null | undefined) {
  if (!direccion) {
    return { direccion: undefined, barrio: undefined, ciudad: undefined }
  }

  const ciudad = direccion.ciudades
    ? Array.isArray(direccion.ciudades)
      ? direccion.ciudades[0]?.nombre
      : direccion.ciudades.nombre
    : undefined

  return {
    direccion: direccion.direccion ?? undefined,
    barrio: direccion.barrio ?? undefined,
    ciudad: ciudad ?? undefined,
  }
}

async function fetchRoleProfile(
  usuarioId: string,
  rol: TUserRole | undefined
): Promise<{
  negocio?: string
  telefono_negocio?: string
  nit?: string | null
  nombre_contacto?: string | null
  direccion?: string
  barrio?: string
  ciudad?: string
}> {
  if (rol === "tendero") {
    const { data } = await supabaseAdmin
      .from("tenderos")
      .select(
        "nombre_tienda, telefono, nit, direcciones(direccion, barrio, ciudades(nombre))"
      )
      .eq("usuario_id", usuarioId)
      .maybeSingle()

    const direcciones = data?.direcciones as TDireccionRow | TDireccionRow[] | null
    const dir = Array.isArray(direcciones) ? direcciones[0] : direcciones
    const address = formatDireccion(dir)

    return {
      negocio: data?.nombre_tienda ?? undefined,
      telefono_negocio: (data?.telefono as string | null) ?? undefined,
      nit: (data?.nit as string | null) ?? null,
      ...address,
    }
  }

  if (rol === "proveedor") {
    const { data } = await supabaseAdmin
      .from("proveedores")
      .select(
        "nombre_empresa, nombre_contacto, telefono, nit, direcciones(direccion, barrio, ciudades(nombre))"
      )
      .eq("usuario_id", usuarioId)
      .maybeSingle()

    const direcciones = data?.direcciones as TDireccionRow | TDireccionRow[] | null
    const dir = Array.isArray(direcciones) ? direcciones[0] : direcciones
    const address = formatDireccion(dir)

    return {
      negocio: data?.nombre_empresa ?? undefined,
      telefono_negocio: (data?.telefono as string | null) ?? undefined,
      nit: (data?.nit as string | null) ?? null,
      nombre_contacto: (data?.nombre_contacto as string | null) ?? null,
      ...address,
    }
  }

  return {}
}

export async function getUserDataService(
  request: Request
): Promise<TGetUserDataServiceResult> {
  const authUser = await getAuthUserFromRequest(request)

  if (!authUser) {
    return {
      ok: true,
      data: { isAuthenticated: false },
    }
  }

  const { data: usuario } = await supabaseAdmin
    .from("usuarios")
    .select("nombre, apellido, telefono, roles(nombre)")
    .eq("id", authUser.id)
    .maybeSingle()

  const profile = usuario as IUsuarioBasicProfile | null
  const rol = pickRolNombre(profile)
  const roleProfile = await fetchRoleProfile(authUser.id, rol)

  return {
    ok: true,
    data: {
      isAuthenticated: true,
      nombre: profile?.nombre ?? undefined,
      apellido: profile?.apellido ?? undefined,
      nombre_completo: buildFullName(profile),
      email: authUser.email ?? undefined,
      telefono: (profile?.telefono as string | null) ?? undefined,
      rol,
      negocio: roleProfile.negocio,
      telefono_negocio: roleProfile.telefono_negocio,
      nit: roleProfile.nit ?? undefined,
      nombre_contacto: roleProfile.nombre_contacto ?? undefined,
      direccion: roleProfile.direccion,
      barrio: roleProfile.barrio,
      ciudad: roleProfile.ciudad,
    },
  }
}
