import {
  getNotificacionesTenderoHandler,
  markAllNotificacionesTenderoLeidasHandler,
} from "@/features/notificaciones/server"

export async function GET(request: Request) {
  return getNotificacionesTenderoHandler(request)
}

export async function PATCH(request: Request) {
  return markAllNotificacionesTenderoLeidasHandler(request)
}
