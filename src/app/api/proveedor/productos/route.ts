import {
  getProductosProveedorHandler,
  postProductoProveedorHandler,
} from "@/features/proveedor/productos/server"

export async function GET(request: Request) {
  return getProductosProveedorHandler(request)
}

export async function POST(request: Request) {
  return postProductoProveedorHandler(request)
}
