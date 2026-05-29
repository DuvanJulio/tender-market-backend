import { supabaseAdmin } from "@/lib/supabase/admin"
import type { ICategoriaCreated, TPostCategoriaBody } from "../interfaces"
import { slugifyNombre } from "./slug.util"
import { CATEGORIAS_MESSAGES } from "./types"

type TPostCategoriaServiceResult =
  | { ok: true; data: ICategoriaCreated }
  | { ok: false; message: string; status: number }

export async function postCategoriaService(
  body: TPostCategoriaBody
): Promise<TPostCategoriaServiceResult> {
  const nombre = body.nombre?.trim()

  if (!nombre) {
    return {
      ok: false,
      message: CATEGORIAS_MESSAGES.nombreRequired,
      status: 400,
    }
  }

  const slug = (body.slug?.trim() || slugifyNombre(nombre)).toLowerCase()

  if (!slug) {
    return {
      ok: false,
      message: CATEGORIAS_MESSAGES.slugRequired,
      status: 400,
    }
  }

  const categoriaPadreId = body.categoria_padre_id ?? null

  if (categoriaPadreId != null) {
    const { data: parent } = await supabaseAdmin
      .from("categorias")
      .select("id, categoria_padre_id")
      .eq("id", categoriaPadreId)
      .maybeSingle()

    if (!parent) {
      return {
        ok: false,
        message: CATEGORIAS_MESSAGES.parentNotFound,
        status: 404,
      }
    }

    if (parent.categoria_padre_id != null) {
      return {
        ok: false,
        message: CATEGORIAS_MESSAGES.parentMustBeRoot,
        status: 400,
      }
    }
  }

  const { data: existingSlug } = await supabaseAdmin
    .from("categorias")
    .select("id")
    .eq("slug", slug)
    .maybeSingle()

  if (existingSlug) {
    return {
      ok: false,
      message: CATEGORIAS_MESSAGES.slugExists,
      status: 409,
    }
  }

  const { data: maxOrden } = await supabaseAdmin
    .from("categorias")
    .select("orden")
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle()

  const orden = (maxOrden?.orden ?? 0) + 1

  const { data, error } = await supabaseAdmin
    .from("categorias")
    .insert({
      nombre,
      slug,
      categoria_padre_id: categoriaPadreId,
      estado: true,
      orden,
    })
    .select("id, nombre, slug, categoria_padre_id, estado")
    .single()

  if (error || !data) {
    console.error("Error al crear categoría:", error)
    return {
      ok: false,
      message: CATEGORIAS_MESSAGES.createFailed,
      status: 500,
    }
  }

  return { ok: true, data: data as ICategoriaCreated }
}
