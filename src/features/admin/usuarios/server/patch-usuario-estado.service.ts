import { supabaseAdmin } from "@/lib/supabase/admin"
import type {
  TPatchUsuarioEstadoBody,
  TUsuarioEstadoAdmin,
} from "../interfaces"
import { USUARIOS_ADMIN_MESSAGES } from "./types"
import { ESTADO_ID_BY_NOMBRE, pickRelationField } from "./usuario-mapper"

type TPatchUsuarioEstadoServiceResult =
  | {
      ok: true
      data: {
        id: string
        estado: TUsuarioEstadoAdmin
        estado_anterior: TUsuarioEstadoAdmin
      }
    }
  | { ok: false; message: string; status: number }

const TARGET_ESTADOS: TUsuarioEstadoAdmin[] = ["activo", "inactivo"]

function normalizeDbEstado(nombre: string | null): TUsuarioEstadoAdmin | "bloqueado" {
  if (nombre === "bloqueado") return "bloqueado"
  if (nombre === "activo" || nombre === "inactivo" || nombre === "pendiente") {
    return nombre
  }
  return "pendiente"
}

function canTransitionTo(
  current: TUsuarioEstadoAdmin | "bloqueado",
  target: TUsuarioEstadoAdmin
): boolean {
  if (target === "activo") {
    return (
      current === "pendiente" ||
      current === "inactivo" ||
      current === "bloqueado"
    )
  }

  if (target === "inactivo") {
    return current === "activo"
  }

  return false
}

export async function patchUsuarioEstadoService(
  usuarioId: string,
  body: TPatchUsuarioEstadoBody
): Promise<TPatchUsuarioEstadoServiceResult> {
  if (!usuarioId) {
    return {
      ok: false,
      message: USUARIOS_ADMIN_MESSAGES.notFound,
      status: 400,
    }
  }

  if (!TARGET_ESTADOS.includes(body.estado)) {
    return {
      ok: false,
      message: USUARIOS_ADMIN_MESSAGES.invalidEstado,
      status: 400,
    }
  }

  const { data: usuario } = await supabaseAdmin
    .from("usuarios")
    .select("id, estados_usuarios(nombre)")
    .eq("id", usuarioId)
    .maybeSingle()

  if (!usuario) {
    return {
      ok: false,
      message: USUARIOS_ADMIN_MESSAGES.notFound,
      status: 404,
    }
  }

  const currentRaw = pickRelationField(
    usuario.estados_usuarios as { nombre: string } | { nombre: string }[] | null
  )
  const current = normalizeDbEstado(currentRaw)
  const estadoAnterior: TUsuarioEstadoAdmin =
    current === "bloqueado" ? "inactivo" : current

  if (!canTransitionTo(current, body.estado)) {
    return {
      ok: false,
      message: USUARIOS_ADMIN_MESSAGES.invalidTransition,
      status: 409,
    }
  }

  const estadoId = ESTADO_ID_BY_NOMBRE[body.estado]

  const { error } = await supabaseAdmin
    .from("usuarios")
    .update({ estado_id: estadoId })
    .eq("id", usuarioId)

  if (error) {
    console.error("Error al actualizar estado:", error)
    return {
      ok: false,
      message: USUARIOS_ADMIN_MESSAGES.estadoUpdateFailed,
      status: 500,
    }
  }

  return {
    ok: true,
    data: {
      id: usuarioId,
      estado: body.estado,
      estado_anterior: estadoAnterior,
    },
  }
}
