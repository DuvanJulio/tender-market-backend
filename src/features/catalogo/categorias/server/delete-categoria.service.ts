import { supabaseAdmin } from "@/lib/supabase/admin"
import { CATEGORIAS_MESSAGES } from "./types"

type TDeleteCategoriaServiceResult =
  | { ok: true; id: number }
  | { ok: false; message: string; status: number }

export async function deleteCategoriaService(
  categoriaId: number
): Promise<TDeleteCategoriaServiceResult> {
  if (!categoriaId || Number.isNaN(categoriaId)) {
    return {
      ok: false,
      message: CATEGORIAS_MESSAGES.notFound,
      status: 400,
    }
  }

  const { data: categoria } = await supabaseAdmin
    .from("categorias")
    .select("id, nombre")
    .eq("id", categoriaId)
    .maybeSingle()

  if (!categoria) {
    return {
      ok: false,
      message: CATEGORIAS_MESSAGES.notFound,
      status: 404,
    }
  }

  const { count: subCount, error: subError } = await supabaseAdmin
    .from("categorias")
    .select("id", { count: "exact", head: true })
    .eq("categoria_padre_id", categoriaId)

  if (subError) {
    console.error("Error al validar subcategorías:", subError)
    return {
      ok: false,
      message: CATEGORIAS_MESSAGES.deleteFailed,
      status: 500,
    }
  }

  if ((subCount ?? 0) > 0) {
    return {
      ok: false,
      message: CATEGORIAS_MESSAGES.hasSubcategories,
      status: 409,
    }
  }

  const { count: productsCount, error: productsError } = await supabaseAdmin
    .from("productos")
    .select("id", { count: "exact", head: true })
    .eq("categoria_id", categoriaId)

  if (productsError) {
    console.error("Error al validar productos:", productsError)
    return {
      ok: false,
      message: CATEGORIAS_MESSAGES.deleteFailed,
      status: 500,
    }
  }

  if ((productsCount ?? 0) > 0) {
    return {
      ok: false,
      message: CATEGORIAS_MESSAGES.hasProducts,
      status: 409,
    }
  }

  const { error } = await supabaseAdmin
    .from("categorias")
    .delete()
    .eq("id", categoriaId)

  if (error) {
    console.error("Error al eliminar categoría:", error)
    return {
      ok: false,
      message: CATEGORIAS_MESSAGES.deleteFailed,
      status: 500,
    }
  }

  return { ok: true, id: categoriaId }
}
