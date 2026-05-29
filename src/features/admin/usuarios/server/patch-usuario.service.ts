import { supabaseAdmin } from "@/lib/supabase/admin"
import type { IUsuarioAdmin, TPatchUsuarioBody } from "../interfaces"
import { USUARIOS_ADMIN_MESSAGES } from "./types"
import { getUsuarioAdminService } from "./get-usuario.service"
import { mapRol, pickRelationField, type TRawUsuario } from "./usuario-mapper"

type TPatchUsuarioServiceResult =
  | { ok: true; data: IUsuarioAdmin }
  | { ok: false; message: string; status: number }

export async function patchUsuarioAdminService(
  usuarioId: string,
  body: TPatchUsuarioBody
): Promise<TPatchUsuarioServiceResult> {
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

  const nombre = body.nombre?.trim()
  const apellido = body.apellido?.trim() ?? null
  const telefono = body.telefono?.trim() ?? null
  const negocio = body.negocio?.trim()

  if (nombre !== undefined && !nombre) {
    return {
      ok: false,
      message: USUARIOS_ADMIN_MESSAGES.nombreRequired,
      status: 400,
    }
  }

  if (negocio !== undefined && !negocio) {
    return {
      ok: false,
      message: USUARIOS_ADMIN_MESSAGES.negocioRequired,
      status: 400,
    }
  }

  const usuarioUpdate: Record<string, string | null> = {}
  if (nombre !== undefined) usuarioUpdate.nombre = nombre
  if (body.apellido !== undefined) usuarioUpdate.apellido = apellido
  if (body.telefono !== undefined) usuarioUpdate.telefono = telefono

  if (Object.keys(usuarioUpdate).length > 0) {
    const { error } = await supabaseAdmin
      .from("usuarios")
      .update(usuarioUpdate)
      .eq("id", usuarioId)

    if (error) {
      console.error("Error al actualizar usuario:", error)
      return {
        ok: false,
        message: USUARIOS_ADMIN_MESSAGES.updateFailed,
        status: 500,
      }
    }
  }

  if (negocio !== undefined) {
    if (rol === "tendero") {
      const { error } = await supabaseAdmin
        .from("tenderos")
        .update({ nombre_tienda: negocio })
        .eq("usuario_id", usuarioId)

      if (error) {
        console.error("Error al actualizar tendero:", error)
        return {
          ok: false,
          message: USUARIOS_ADMIN_MESSAGES.updateFailed,
          status: 500,
        }
      }
    } else {
      const { error } = await supabaseAdmin
        .from("proveedores")
        .update({ nombre_empresa: negocio })
        .eq("usuario_id", usuarioId)

      if (error) {
        console.error("Error al actualizar proveedor:", error)
        return {
          ok: false,
          message: USUARIOS_ADMIN_MESSAGES.updateFailed,
          status: 500,
        }
      }
    }
  }

  const refreshed = await getUsuarioAdminService(usuarioId)
  if (!refreshed.ok) {
    return refreshed
  }

  return { ok: true, data: refreshed.data }
}
