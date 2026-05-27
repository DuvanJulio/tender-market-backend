import { deleteCityHandler } from "@/features/masters/server"

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return deleteCityHandler(request, context)
}
