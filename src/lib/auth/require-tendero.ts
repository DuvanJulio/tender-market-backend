import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import { supabaseAdmin } from "@/lib/supabase/admin"

export type TTenderoContext = {
  userId: string
  tenderoId: number
  nombreTienda: string
}

type TRequireTenderoResult =
  | { ok: true; context: TTenderoContext }
  | { ok: false; message: string; status: number }

export async function requireTenderoFromRequest(
  request: Request
): Promise<TRequireTenderoResult> {
  const authUser = await getAuthUserFromRequest(request)

  if (!authUser) {
    return {
      ok: false,
      message: "No autenticado",
      status: 401,
    }
  }

  const { data: usuario, error: usuarioError } = await supabaseAdmin
    .from("usuarios")
    .select("id, roles(nombre), estados_usuarios(nombre)")
    .eq("id", authUser.id)
    .maybeSingle()

  if (usuarioError || !usuario) {
    return {
      ok: false,
      message: "Usuario no encontrado",
      status: 403,
    }
  }

  const roles = usuario.roles as
    | { nombre: string }
    | { nombre: string }[]
    | null
  const rolNombre = Array.isArray(roles) ? roles[0]?.nombre : roles?.nombre

  if (rolNombre !== "tendero") {
    return {
      ok: false,
      message: "Acceso solo para tenderos",
      status: 403,
    }
  }

  const estados = usuario.estados_usuarios as
    | { nombre: string }
    | { nombre: string }[]
    | null
  const estadoNombre = Array.isArray(estados)
    ? estados[0]?.nombre
    : estados?.nombre

  if (estadoNombre && estadoNombre !== "activo") {
    return {
      ok: false,
      message: "Tu cuenta de tendero no está activa",
      status: 403,
    }
  }

  const { data: tendero, error: tenderoError } = await supabaseAdmin
    .from("tenderos")
    .select("id, nombre_tienda")
    .eq("usuario_id", authUser.id)
    .maybeSingle()

  if (tenderoError || !tendero) {
    return {
      ok: false,
      message: "Perfil de tendero no encontrado",
      status: 403,
    }
  }

  return {
    ok: true,
    context: {
      userId: authUser.id,
      tenderoId: tendero.id as number,
      nombreTienda: tendero.nombre_tienda as string,
    },
  }
}
