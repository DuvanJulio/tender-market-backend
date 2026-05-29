import { supabaseAdmin } from "@/lib/supabase/admin"
import { PRODUCTOS_MESSAGES } from "./types"

type TDeleteProductoServiceResult =
  | { ok: true; id: number }
  | { ok: false; message: string; status: number }

export async function deleteProductoService(
  productoId: number
): Promise<TDeleteProductoServiceResult> {
  if (!productoId || Number.isNaN(productoId)) {
    return {
      ok: false,
      message: PRODUCTOS_MESSAGES.notFound,
      status: 400,
    }
  }

  const { data: producto } = await supabaseAdmin
    .from("productos")
    .select("id")
    .eq("id", productoId)
    .maybeSingle()

  if (!producto) {
    return {
      ok: false,
      message: PRODUCTOS_MESSAGES.notFound,
      status: 404,
    }
  }

  const { error } = await supabaseAdmin
    .from("productos")
    .delete()
    .eq("id", productoId)

  if (error) {
    console.error("Error al eliminar producto:", error)
    return {
      ok: false,
      message: PRODUCTOS_MESSAGES.deleteFailed,
      status: 500,
    }
  }

  return { ok: true, id: productoId }
}
