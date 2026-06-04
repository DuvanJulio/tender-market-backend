import { markNotificacionTenderoLeidaHandler } from "@/features/notificaciones/server"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params
  const notificacionId = Number(id)
  if (Number.isNaN(notificacionId)) {
    return Response.json(
      { success: false, message: "ID de notificación inválido" },
      { status: 400 }
    )
  }
  return markNotificacionTenderoLeidaHandler(request, notificacionId)
}
