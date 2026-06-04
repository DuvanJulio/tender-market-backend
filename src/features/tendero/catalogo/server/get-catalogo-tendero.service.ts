import { supabaseAdmin } from "@/lib/supabase/admin"
import type {
  ICatalogoCategoriaTendero,
  ICatalogoProductoTendero,
} from "../interfaces"
import { CATALOGO_TENDERO_MESSAGES } from "./types"

export type TGetCatalogoTenderoQuery = {
  search?: string
  categoria_id?: number
}

type TGetCatalogoTenderoServiceResult =
  | {
      ok: true
      data: {
        categorias: ICatalogoCategoriaTendero[]
        productos: ICatalogoProductoTendero[]
        total_productos: number
        total_publicados: number
      }
    }
  | { ok: false; message: string; status: number }

type TRawCategoria = {
  id: number
  nombre: string
  slug: string
  categoria_padre_id: number | null
  estado: boolean
}

type TRawProducto = {
  id: number
  nombre: string
  precio_mayorista: number
  stock: number
  imagen_url: string | null
  created_at: string
  categoria_id: number | null
  proveedor_id: number
  proveedores:
    | { nombre_empresa: string }
    | { nombre_empresa: string }[]
    | null
  categorias:
    | { nombre: string; categoria_padre_id: number | null }
    | { nombre: string; categoria_padre_id: number | null }[]
    | null
}

function pickRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function mapProducto(row: TRawProducto): ICatalogoProductoTendero {
  const proveedor = pickRelation(row.proveedores)
  const categoria = pickRelation(row.categorias)

  return {
    id: row.id,
    nombre: row.nombre,
    proveedor: proveedor?.nombre_empresa ?? "Proveedor",
    proveedor_id: row.proveedor_id,
    categoria: categoria?.nombre ?? null,
    categoria_id: row.categoria_id,
    precio: Number(row.precio_mayorista),
    stock: row.stock ?? 0,
    imagen_url: row.imagen_url,
    created_at: row.created_at,
  }
}

async function fetchCategoriaIdsForFilter(
  categoriaId: number
): Promise<number[]> {
  const ids = new Set<number>([categoriaId])

  const { data: children } = await supabaseAdmin
    .from("categorias")
    .select("id")
    .eq("categoria_padre_id", categoriaId)

  for (const child of children ?? []) {
    ids.add(child.id as number)
  }

  return [...ids]
}

async function buildCategoriasFromCounts(): Promise<ICatalogoCategoriaTendero[]> {
  const { data: productRows, error: productsError } = await supabaseAdmin
    .from("productos")
    .select("categoria_id")
    .eq("estado", "publicado")

  if (productsError) return []

  const countByCategoria = new Map<number, number>()
  for (const row of productRows ?? []) {
    const categoriaId = row.categoria_id as number | null
    if (categoriaId == null) continue
    countByCategoria.set(
      categoriaId,
      (countByCategoria.get(categoriaId) ?? 0) + 1
    )
  }

  const { data: parentRows, error } = await supabaseAdmin
    .from("categorias")
    .select("id, nombre, slug, categoria_padre_id, estado")
    .is("categoria_padre_id", null)
    .eq("estado", true)
    .order("orden", { ascending: true })
    .order("nombre", { ascending: true })

  if (error || !parentRows?.length) return []

  const parents = parentRows as TRawCategoria[]
  const parentIds = parents.map((p) => p.id)

  const childrenByParent = new Map<number, number[]>()
  if (parentIds.length > 0) {
    const { data: childRows } = await supabaseAdmin
      .from("categorias")
      .select("id, categoria_padre_id")
      .in("categoria_padre_id", parentIds)
      .eq("estado", true)

    for (const row of childRows ?? []) {
      const parentId = row.categoria_padre_id as number
      const list = childrenByParent.get(parentId) ?? []
      list.push(row.id as number)
      childrenByParent.set(parentId, list)
    }
  }

  return parents
    .map((parent) => {
      const childIds = childrenByParent.get(parent.id) ?? []
      const relatedIds = [parent.id, ...childIds]
      const productos_count = relatedIds.reduce(
        (sum, id) => sum + (countByCategoria.get(id) ?? 0),
        0
      )

      return {
        id: parent.id,
        nombre: parent.nombre,
        slug: parent.slug,
        productos_count,
      }
    })
    .filter((cat) => cat.productos_count > 0)
}

export async function getCatalogoTenderoService(
  query: TGetCatalogoTenderoQuery
): Promise<TGetCatalogoTenderoServiceResult> {
  const { search, categoria_id } = query

  const [categorias, totalPublicadosRes, productosResult] = await Promise.all([
    buildCategoriasFromCounts(),
    supabaseAdmin
      .from("productos")
      .select("id", { count: "exact", head: true })
      .eq("estado", "publicado"),
    (async () => {
      let dbQuery = supabaseAdmin
        .from("productos")
        .select(
          `
      id,
      nombre,
      precio_mayorista,
      stock,
      imagen_url,
      created_at,
      categoria_id,
      proveedor_id,
      proveedores(nombre_empresa),
      categorias(nombre, categoria_padre_id)
    `
        )
        .eq("estado", "publicado")
        .order("created_at", { ascending: false })
        .limit(200)

      if (categoria_id) {
        const categoriaIds = await fetchCategoriaIdsForFilter(categoria_id)
        dbQuery = dbQuery.in("categoria_id", categoriaIds)
      }

      const searchTerm = search?.trim()
      if (searchTerm) {
        dbQuery = dbQuery.ilike("nombre", `%${searchTerm}%`)
      }

      return dbQuery
    })(),
  ])

  const { data: rows, error } = productosResult

  if (error) {
    console.error("Error al cargar catálogo tendero:", error)
    return {
      ok: false,
      message: CATALOGO_TENDERO_MESSAGES.loadFailed,
      status: 500,
    }
  }

  let productos = (rows ?? []).map((row) => mapProducto(row as TRawProducto))

  const searchTerm = search?.trim()
  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    productos = productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(term) ||
        p.proveedor.toLowerCase().includes(term) ||
        (p.categoria?.toLowerCase().includes(term) ?? false)
    )
  }

  return {
    ok: true,
    data: {
      categorias,
      productos,
      total_productos: productos.length,
      total_publicados: totalPublicadosRes.count ?? productos.length,
    },
  }
}
