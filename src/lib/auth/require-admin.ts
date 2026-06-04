import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import { supabaseAdmin } from "@/lib/supabase/admin"

export type TAdminContext = {
  userId: string
}

type TRequireAdminResult =
  | { ok: true; context: TAdminContext }
  | { ok: false; message: string; status: number }

export async function requireAdminFromRequest(
  request: Request
): Promise<TRequireAdminResult> {
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
    .select("id, roles(nombre)")
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

  if (rolNombre !== "admin") {
    return {
      ok: false,
      message: "Acceso solo para administradores",
      status: 403,
    }
  }

  return {
    ok: true,
    context: {
      userId: authUser.id,
    },
  }
}
