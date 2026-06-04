import { requireProveedorFromRequest } from "@/lib/auth/require-proveedor"
import { uploadProductoImagen } from "@/lib/supabase/producto-storage"
import {
  proveedorProductoImagenSuccessResponse,
  proveedorProductosErrorResponse,
} from "./responses"
import { PROVEEDOR_PRODUCTOS_MESSAGES } from "./types"

export async function uploadProductoImagenHandler(request: Request) {
  try {
    const auth = await requireProveedorFromRequest(request)
    if (!auth.ok) {
      return proveedorProductosErrorResponse(auth.message, auth.status)
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File) || file.size === 0) {
      return proveedorProductosErrorResponse(
        PROVEEDOR_PRODUCTOS_MESSAGES.imagenRequired,
        400
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadProductoImagen({
      proveedorId: auth.context.proveedorId,
      buffer,
      mimeType: file.type || "application/octet-stream",
      originalName: file.name,
    })

    if (!result.ok) {
      return proveedorProductosErrorResponse(result.message, 400)
    }

    return proveedorProductoImagenSuccessResponse(
      PROVEEDOR_PRODUCTOS_MESSAGES.imagenUploadSuccess,
      { url: result.url, path: result.path }
    )
  } catch (error) {
    console.error("Error en upload-producto-imagen:", error)
    return proveedorProductosErrorResponse(
      PROVEEDOR_PRODUCTOS_MESSAGES.internalError,
      500
    )
  }
}
