import { markNotificacionAdminLeidaHandler } from "@/features/notificaciones/server"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const notificacionId = Number(id)
  if (Number.isNaN(notificacionId)) {
    return Response.json(
      { success: false, message: "ID de notificación inválido" },
      { status: 400 }
    )
  }
  return markNotificacionAdminLeidaHandler(request, notificacionId)
}
