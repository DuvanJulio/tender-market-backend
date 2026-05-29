import { supabaseAdmin } from "@/lib/supabase/admin"
import {
  buildPaginationMeta,
  getPaginationRange,
  type IPaginatedResult,
} from "@/lib/pagination"
import type { ICategoriaAdmin, ICategoriaRow } from "../interfaces"
import { CATEGORIAS_MESSAGES } from "./types"

export type TGetCategoriasQuery = {
  page: number
  pageSize: number
  search?: string
}

type TGetCategoriasServiceResult =
  | { ok: true; data: IPaginatedResult<ICategoriaAdmin> }
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

export async function getCategoriasService(
  query: TGetCategoriasQuery
): Promise<TGetCategoriasServiceResult> {
  const { page, pageSize, search } = query
  const { from, to } = getPaginationRange(page, pageSize)

  let parentsQuery = supabaseAdmin
    .from("categorias")
    .select("id, nombre, slug, categoria_padre_id, estado", { count: "exact" })
    .is("categoria_padre_id", null)
    .order("orden", { ascending: true })
    .order("nombre", { ascending: true })

  const searchTerm = search?.trim()
  if (searchTerm) {
    parentsQuery = parentsQuery.ilike("nombre", `%${searchTerm}%`)
  }

  const {
    data: parentRows,
    error: parentsError,
    count,
  } = await parentsQuery.range(from, to)

  if (parentsError) {
    console.error("Error al cargar categorías:", parentsError)
    return {
      ok: false,
      message: CATEGORIAS_MESSAGES.loadFailed,
      status: 500,
    }
  }

  const parents = (parentRows ?? []) as ICategoriaRow[]
  const parentIds = parents.map((p) => p.id)

  const childrenByParent = new Map<number, ICategoriaRow[]>()

  if (parentIds.length > 0) {
    const { data: childRows, error: childrenError } = await supabaseAdmin
      .from("categorias")
      .select("id, nombre, slug, categoria_padre_id, estado")
      .in("categoria_padre_id", parentIds)
      .order("nombre", { ascending: true })

    if (childrenError) {
      console.warn("Subcategorías no disponibles:", childrenError.message)
    } else {
      for (const row of (childRows ?? []) as ICategoriaRow[]) {
        if (row.categoria_padre_id == null) continue
        const list = childrenByParent.get(row.categoria_padre_id) ?? []
        list.push(row)
        childrenByParent.set(row.categoria_padre_id, list)
      }
    }
  }

  const { data: productRows, error: productsError } = await supabaseAdmin
    .from("productos")
    .select("categoria_id")

  if (productsError) {
    console.warn("Conteo de productos no disponible:", productsError.message)
  }

  const productCounts = buildProductCountMap(productRows)
  const total = count ?? 0

  const items: ICategoriaAdmin[] = parents.map((parent) => {
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

  return {
    ok: true,
    data: {
      items,
      pagination: buildPaginationMeta(page, pageSize, total),
    },
  }
}
