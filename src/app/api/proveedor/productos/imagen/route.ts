import { uploadProductoImagenHandler } from "@/features/proveedor/productos/server"

export async function POST(request: Request) {
  return uploadProductoImagenHandler(request)
}
