import {
  getNotificacionesProveedorHandler,
  markAllNotificacionesProveedorLeidasHandler,
} from "@/features/notificaciones/server"

export async function GET(request: Request) {
  return getNotificacionesProveedorHandler(request)
}

export async function PATCH(request: Request) {
  return markAllNotificacionesProveedorLeidasHandler(request)
}
