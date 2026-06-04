import { supabaseAdmin } from "@/lib/supabase/admin"
import type { ICreateNotificacionInput } from "../interfaces"

export async function createNotificacionService(
  input: ICreateNotificacionInput
): Promise<boolean> {
  const { error } = await supabaseAdmin.from("notificaciones").insert({
    usuario_id: input.usuario_id,
    tipo: input.tipo,
    titulo: input.titulo,
    mensaje: input.mensaje,
    pedido_codigo: input.pedido_codigo ?? null,
    leida: false,
  })

  if (error) {
    console.warn(
      "No se pudo crear notificación:",
      error.message,
      error.code,
      error.details
    )
    return false
  }

  return true
}

export async function getUsuarioIdFromTenderoId(
  tenderoId: number
): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("tenderos")
    .select("usuario_id")
    .eq("id", tenderoId)
    .maybeSingle()

  return (data?.usuario_id as string | null) ?? null
}

export async function getUsuarioIdFromProveedorId(
  proveedorId: number
): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("proveedores")
    .select("usuario_id")
    .eq("id", proveedorId)
    .maybeSingle()

  return (data?.usuario_id as string | null) ?? null
}
