import { supabaseAdmin } from "@/lib/supabase/admin"
import { USUARIOS_ADMIN_MESSAGES } from "./types"
import { mapRol, pickRelationField, type TRawUsuario } from "./usuario-mapper"

type TDeleteUsuarioServiceResult =
  | { ok: true; id: string }
  | { ok: false; message: string; status: number }

export async function deleteUsuarioAdminService(
  usuarioId: string
): Promise<TDeleteUsuarioServiceResult> {
  if (!usuarioId) {
    return {
      ok: false,
      message: USUARIOS_ADMIN_MESSAGES.notFound,
      status: 400,
    }
  }

  const { data: row } = await supabaseAdmin
    .from("usuarios")
    .select("id, roles(nombre)")
    .eq("id", usuarioId)
    .maybeSingle()

  if (!row) {
    return {
      ok: false,
      message: USUARIOS_ADMIN_MESSAGES.notFound,
      status: 404,
    }
  }

  const rol = mapRol(pickRelationField((row as TRawUsuario).roles))
  if (!rol) {
    return {
      ok: false,
      message: USUARIOS_ADMIN_MESSAGES.notFound,
      status: 404,
    }
  }

  if (rol === "proveedor") {
    const { data: proveedor } = await supabaseAdmin
      .from("proveedores")
      .select("id")
      .eq("usuario_id", usuarioId)
      .maybeSingle()

    if (proveedor) {
      const { count, error: productsError } = await supabaseAdmin
        .from("productos")
        .select("id", { count: "exact", head: true })
        .eq("proveedor_id", proveedor.id)

      if (productsError) {
        console.error("Error al validar productos:", productsError)
        return {
          ok: false,
          message: USUARIOS_ADMIN_MESSAGES.deleteFailed,
          status: 500,
        }
      }

      if ((count ?? 0) > 0) {
        return {
          ok: false,
          message: USUARIOS_ADMIN_MESSAGES.hasProducts,
          status: 409,
        }
      }
    }
  }

  await supabaseAdmin.from("tenderos").delete().eq("usuario_id", usuarioId)
  await supabaseAdmin.from("proveedores").delete().eq("usuario_id", usuarioId)

  const { error: usuarioError } = await supabaseAdmin
    .from("usuarios")
    .delete()
    .eq("id", usuarioId)

  if (usuarioError) {
    console.error("Error al eliminar usuario:", usuarioError)
    return {
      ok: false,
      message: USUARIOS_ADMIN_MESSAGES.deleteFailed,
      status: 500,
    }
  }

  const { error: authError } =
    await supabaseAdmin.auth.admin.deleteUser(usuarioId)

  if (authError) {
    console.warn("Usuario de BD eliminado; auth:", authError.message)
  }

  return { ok: true, id: usuarioId }
}
