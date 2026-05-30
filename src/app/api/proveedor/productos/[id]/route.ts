import {
  deleteProductoProveedorHandler,
  getProductoProveedorHandler,
  patchProductoProveedorHandler,
} from "@/features/proveedor/productos/server"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return getProductoProveedorHandler(request, context)
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return patchProductoProveedorHandler(request, context)
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return deleteProductoProveedorHandler(request, context)
}
