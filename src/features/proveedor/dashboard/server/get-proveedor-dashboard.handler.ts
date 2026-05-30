import { requireProveedorFromRequest } from "@/lib/auth/require-proveedor"
import { getProveedorDashboardService } from "./get-proveedor-dashboard.service"
import {
  proveedorDashboardErrorResponse,
  proveedorDashboardSuccessResponse,
} from "./responses"
import { PROVEEDOR_DASHBOARD_MESSAGES } from "./types"

export async function getProveedorDashboardHandler(request: Request) {
  try {
    const auth = await requireProveedorFromRequest(request)
    if (!auth.ok) {
      return proveedorDashboardErrorResponse(auth.message, auth.status)
    }

    const result = await getProveedorDashboardService(auth.context.proveedorId)

    if (!result.ok) {
      return proveedorDashboardErrorResponse(result.message, result.status)
    }

    return proveedorDashboardSuccessResponse(
      PROVEEDOR_DASHBOARD_MESSAGES.loadSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en get-proveedor-dashboard:", error)
    return proveedorDashboardErrorResponse(
      PROVEEDOR_DASHBOARD_MESSAGES.internalError,
      500
    )
  }
}
