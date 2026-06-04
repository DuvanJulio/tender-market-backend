import {
  getNotificacionesAdminHandler,
  markAllNotificacionesAdminLeidasHandler,
} from "@/features/notificaciones/server"

export async function GET(request: Request) {
  return getNotificacionesAdminHandler(request)
}

export async function PATCH(request: Request) {
  return markAllNotificacionesAdminLeidasHandler(request)
}
