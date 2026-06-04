import { supabaseAdmin } from "@/lib/supabase/admin"
import type { ICategoriaCreated, TPatchCategoriaBody } from "../interfaces"
import { slugifyNombre } from "./slug.util"
import { CATEGORIAS_MESSAGES } from "./types"

type TPatchCategoriaServiceResult =
  | { ok: true; data: ICategoriaCreated }
  | { ok: false; message: string; status: number }

export async function patchCategoriaService(
  categoriaId: number,
  body: TPatchCategoriaBody
): Promise<TPatchCategoriaServiceResult> {
  if (!categoriaId || Number.isNaN(categoriaId)) {
    return {
      ok: false,
      message: CATEGORIAS_MESSAGES.notFound,
      status: 404,
    }
  }

  const { data: existing } = await supabaseAdmin
    .from("categorias")
    .select("id, nombre, slug, categoria_padre_id, estado")
    .eq("id", categoriaId)
    .maybeSingle()

  if (!existing) {
    return {
      ok: false,
      message: CATEGORIAS_MESSAGES.notFound,
      status: 404,
    }
  }

  const nombre =
    body.nombre !== undefined ? body.nombre.trim() : existing.nombre
  const estado =
    body.estado !== undefined ? body.estado : existing.estado
  const isSubcategoria = existing.categoria_padre_id != null

  if (!nombre) {
    return {
      ok: false,
      message: CATEGORIAS_MESSAGES.nombreRequired,
      status: 400,
    }
  }

  let slug = existing.slug as string

  if (isSubcategoria) {
    if (body.nombre !== undefined) {
      slug = slugifyNombre(nombre)
    }
  } else if (body.slug !== undefined) {
    slug = (body.slug.trim() || slugifyNombre(nombre)).toLowerCase()
  } else if (body.nombre !== undefined) {
    slug = slugifyNombre(nombre)
  }

  if (!slug) {
    return {
      ok: false,
      message: CATEGORIAS_MESSAGES.slugRequired,
      status: 400,
    }
  }

  const { data: duplicateSlug } = await supabaseAdmin
    .from("categorias")
    .select("id")
    .eq("slug", slug)
    .neq("id", categoriaId)
    .maybeSingle()

  if (duplicateSlug) {
    return {
      ok: false,
      message: CATEGORIAS_MESSAGES.slugExists,
      status: 409,
    }
  }

  const { data, error } = await supabaseAdmin
    .from("categorias")
    .update({ nombre, slug, estado })
    .eq("id", categoriaId)
    .select("id, nombre, slug, categoria_padre_id, estado")
    .single()

  if (error || !data) {
    console.error("Error al actualizar categoría:", error)
    return {
      ok: false,
      message: CATEGORIAS_MESSAGES.updateFailed,
      status: 500,
    }
  }

  return { ok: true, data: data as ICategoriaCreated }
}
