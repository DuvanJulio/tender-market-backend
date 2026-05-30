import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import { supabaseAdmin } from "@/lib/supabase/admin"

export type TProveedorContext = {
  userId: string
  proveedorId: number
  proveedorNombre: string
}

type TRequireProveedorResult =
  | { ok: true; context: TProveedorContext }
  | { ok: false; message: string; status: number }

export async function requireProveedorFromRequest(
  request: Request
): Promise<TRequireProveedorResult> {
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

  if (rolNombre !== "proveedor") {
    return {
      ok: false,
      message: "Acceso solo para proveedores",
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
      message: "Tu cuenta de proveedor no está activa",
      status: 403,
    }
  }

  const { data: proveedor, error: proveedorError } = await supabaseAdmin
    .from("proveedores")
    .select("id, nombre_empresa")
    .eq("usuario_id", authUser.id)
    .maybeSingle()

  if (proveedorError || !proveedor) {
    return {
      ok: false,
      message: "Perfil de proveedor no encontrado",
      status: 403,
    }
  }

  return {
    ok: true,
    context: {
      userId: authUser.id,
      proveedorId: proveedor.id as number,
      proveedorNombre: proveedor.nombre_empresa as string,
    },
  }
}
