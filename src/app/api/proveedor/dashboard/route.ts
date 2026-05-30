import { getProveedorDashboardHandler } from "@/features/proveedor/dashboard/server"

export async function GET(request: Request) {
  return getProveedorDashboardHandler(request)
}
