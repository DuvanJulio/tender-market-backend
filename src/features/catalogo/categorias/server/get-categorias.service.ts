import { supabaseAdmin } from "@/lib/supabase/admin"
import type { ICategoriaAdmin, ICategoriaRow } from "../interfaces"
import { CATEGORIAS_MESSAGES } from "./types"

type TGetCategoriasServiceResult =
  | { ok: true; data: ICategoriaAdmin[] }
  | { ok: false; message: string; status: number }

function buildProductCountMap(
  rows: { categoria_id: number | null }[] | null
): Map<number, number> {
  const map = new Map<number, number>()
  for (const row of rows ?? []) {
    if (row.categoria_id == null) continue
    map.set(row.categoria_id, (map.get(row.categoria_id) ?? 0) + 1)
  }
  return map
}

export async function getCategoriasService(): Promise<TGetCategoriasServiceResult> {
  const { data: rows, error } = await supabaseAdmin
    .from("categorias")
    .select("id, nombre, slug, categoria_padre_id, estado")
    .order("orden", { ascending: true })
    .order("nombre", { ascending: true })

  if (error) {
    console.error("Error al cargar categorías:", error)
    return {
      ok: false,
      message: CATEGORIAS_MESSAGES.loadFailed,
      status: 500,
    }
  }

  const categorias = (rows ?? []) as ICategoriaRow[]
  const parents = categorias.filter((c) => c.categoria_padre_id == null)
  const childrenByParent = new Map<number, ICategoriaRow[]>()

  for (const row of categorias) {
    if (row.categoria_padre_id == null) continue
    const list = childrenByParent.get(row.categoria_padre_id) ?? []
    list.push(row)
    childrenByParent.set(row.categoria_padre_id, list)
  }

  const { data: productRows, error: productsError } = await supabaseAdmin
    .from("productos")
    .select("categoria_id")

  if (productsError) {
    console.warn(
      "Conteo de productos no disponible:",
      productsError.message
    )
  }

  const productCounts = buildProductCountMap(productRows)

  const data: ICategoriaAdmin[] = parents.map((parent) => {
    const subcategorias = (childrenByParent.get(parent.id) ?? []).map(
      (child) => ({
        id: child.id,
        nombre: child.nombre,
        productos: productCounts.get(child.id) ?? 0,
      })
    )

    const productos =
      (productCounts.get(parent.id) ?? 0) +
      subcategorias.reduce((sum, sub) => sum + sub.productos, 0)

    return {
      id: parent.id,
      nombre: parent.nombre,
      slug: parent.slug,
      productos,
      subcategorias,
      estado: parent.estado,
    }
  })

  return { ok: true, data }
}
