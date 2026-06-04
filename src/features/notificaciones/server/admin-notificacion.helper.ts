import { supabaseAdmin } from "@/lib/supabase/admin"
import type { TNotificacionTipo } from "../interfaces"
import { createNotificacionService } from "./create-notificacion.service"

export async function getAdminUsuarioIds(): Promise<string[]> {
  const { data: usuarios, error } = await supabaseAdmin
    .from("usuarios")
    .select("id, roles!inner(nombre)")
    .eq("roles.nombre", "admin")

  if (error) {
    console.warn("getAdminUsuarioIds:", error.message)
    return []
  }

  return (usuarios ?? []).map((row) => row.id as string)
}

async function notifyAllAdmins(params: {
  tipo: TNotificacionTipo
  titulo: string
  mensaje: string
  pedido_codigo?: string | null
}) {
  const adminIds = await getAdminUsuarioIds()
  if (adminIds.length === 0) {
    console.warn(
      "notifyAllAdmins: no hay usuarios con rol admin; no se crean notificaciones"
    )
    return
  }

  await Promise.all(
    adminIds.map((usuario_id) =>
      createNotificacionService({
        usuario_id,
        tipo: params.tipo,
        titulo: params.titulo,
        mensaje: params.mensaje,
        pedido_codigo: params.pedido_codigo ?? null,
      })
    )
  )
}

export async function notifyAdminsUsuarioPendiente(params: {
  rol: "tendero" | "proveedor"
  nombre: string
}) {
  const rolLabel = params.rol === "tendero" ? "tendero" : "proveedor"

  await notifyAllAdmins({
    tipo: "usuario_pendiente",
    titulo: "Nuevo registro pendiente",
    mensaje: `Nuevo ${rolLabel}: ${params.nombre}`,
  })
}

export async function notifyAdminsProductoPendiente(params: {
  nombreProducto: string
  proveedorNombre: string
}) {
  await notifyAllAdmins({
    tipo: "producto_pendiente",
    titulo: "Producto pendiente de revisión",
    mensaje: `${params.proveedorNombre}: ${params.nombreProducto}`,
  })
}

export async function notifyAdminsNuevoPedido(params: {
  pedidoCodigo: string
  nombreTienda: string
}) {
  await notifyAllAdmins({
    tipo: "pedido_nuevo",
    titulo: `Nuevo pedido ${params.pedidoCodigo}`,
    mensaje: `${params.nombreTienda} realizó un pedido`,
    pedido_codigo: params.pedidoCodigo,
  })
}
