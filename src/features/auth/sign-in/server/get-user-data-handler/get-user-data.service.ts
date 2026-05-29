import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { IGetUserDataResponseData, TUserRole } from "../../interfaces"
import type { IUsuarioBasicProfile } from "./types"

type TGetUserDataServiceResult =
  | { ok: true; data: IGetUserDataResponseData }
  | { ok: false; message: string; status: number }

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

async function fetchNegocioNombre(
  usuarioId: string,
  rol: TUserRole | undefined
): Promise<string | undefined> {
  if (rol === "tendero") {
    const { data } = await supabaseAdmin
      .from("tenderos")
      .select("nombre_tienda")
      .eq("usuario_id", usuarioId)
      .maybeSingle()
    return data?.nombre_tienda ?? undefined
  }

  if (rol === "proveedor") {
    const { data } = await supabaseAdmin
      .from("proveedores")
      .select("nombre_empresa")
      .eq("usuario_id", usuarioId)
      .maybeSingle()
    return data?.nombre_empresa ?? undefined
  }

  return undefined
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
    .select("nombre, apellido, roles(nombre)")
    .eq("id", authUser.id)
    .maybeSingle()

  const profile = usuario as IUsuarioBasicProfile | null
  const rol = pickRolNombre(profile)
  const negocio = await fetchNegocioNombre(authUser.id, rol)

  return {
    ok: true,
    data: {
      isAuthenticated: true,
      nombre: buildFullName(profile),
      email: authUser.email ?? undefined,
      rol,
      negocio,
    },
  }
}
