import { deleteCityHandler, patchCityHandler } from "@/features/masters/server"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return patchCityHandler(request, context)
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return deleteCityHandler(request, context)
}
