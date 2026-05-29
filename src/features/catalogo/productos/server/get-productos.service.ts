import { supabaseAdmin } from "@/lib/supabase/admin"
import {
  buildPaginationMeta,
  getPaginationRange,
  type IPaginatedResult,
} from "@/lib/pagination"
import type { IProductoAdmin, IProductosSummary } from "../interfaces"
import { PRODUCTOS_MESSAGES } from "./types"

export type TGetProductosAdminQuery = {
  page: number
  pageSize: number
  search?: string
  estado?: "borrador" | "publicado" | "inactivo"
}

type TGetProductosServiceResult =
  | {
      ok: true
      data: {
        productos: IPaginatedResult<IProductoAdmin>
        summary: IProductosSummary
      }
    }
  | { ok: false; message: string; status: number }

type TRawProductoWithRelations = {
  id: number
  nombre: string
  precio_mayorista: number
  stock: number
  estado: string
  imagen_url: string | null
  proveedores: { nombre_empresa: string } | { nombre_empresa: string }[] | null
  categorias: { nombre: string } | { nombre: string }[] | null
}

type TRawProductoBasic = {
  id: number
  nombre: string
  precio_mayorista: number
  stock: number
  estado: string
  imagen_url: string | null
  proveedor_id: number
  categoria_id: number
}

function pickRelationName(
  relation: { nombre: string } | { nombre: string }[] | null | undefined
): string | null {
  if (!relation) return null
  if (Array.isArray(relation)) return relation[0]?.nombre ?? null
  return relation.nombre ?? null
}

function mapProductoBasic(
  row: TRawProductoBasic,
  proveedorMap: Map<number, string>,
  categoriaMap: Map<number, string>
): IProductoAdmin {
  return {
    id: row.id,
    nombre: row.nombre,
    proveedor: proveedorMap.get(row.proveedor_id) ?? null,
    categoria: categoriaMap.get(row.categoria_id) ?? null,
    precio: Number(row.precio_mayorista),
    stock: row.stock ?? 0,
    estado: row.estado as IProductoAdmin["estado"],
    imagen_url: row.imagen_url,
  }
}

function mapProductoWithRelations(row: TRawProductoWithRelations): IProductoAdmin {
  const prov = row.proveedores
  const proveedor = (() => {
    if (!prov) return null
    const item = Array.isArray(prov) ? prov[0] : prov
    return item?.nombre_empresa ?? null
  })()

  return {
    id: row.id,
    nombre: row.nombre,
    proveedor,
    categoria: pickRelationName(row.categorias),
    precio: Number(row.precio_mayorista),
    stock: row.stock ?? 0,
    estado: row.estado as IProductoAdmin["estado"],
    imagen_url: row.imagen_url,
  }
}

async function fetchProductosSummary(): Promise<IProductosSummary> {
  const [totalRes, activosRes, pendientesRes, rechazadosRes] = await Promise.all([
    supabaseAdmin.from("productos").select("id", { count: "exact", head: true }),
    supabaseAdmin
      .from("productos")
      .select("id", { count: "exact", head: true })
      .eq("estado", "publicado"),
    supabaseAdmin
      .from("productos")
      .select("id", { count: "exact", head: true })
      .eq("estado", "borrador"),
    supabaseAdmin
      .from("productos")
      .select("id", { count: "exact", head: true })
      .eq("estado", "inactivo"),
  ])

  return {
    total: totalRes.count ?? 0,
    activos: activosRes.count ?? 0,
    pendientes: pendientesRes.count ?? 0,
    rechazados: rechazadosRes.count ?? 0,
  }
}

export async function getProductosAdminService(
  query: TGetProductosAdminQuery
): Promise<TGetProductosServiceResult> {
  const { page, pageSize, search, estado } = query
  const { from, to } = getPaginationRange(page, pageSize)

  let dbQuery = supabaseAdmin
    .from("productos")
    .select(
      "id, nombre, precio_mayorista, stock, estado, imagen_url, proveedores(nombre_empresa), categorias(nombre)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })

  if (estado) {
    dbQuery = dbQuery.eq("estado", estado)
  }

  const searchTerm = search?.trim()
  if (searchTerm) {
    dbQuery = dbQuery.ilike("nombre", `%${searchTerm}%`)
  }

  const { data: withRelations, error: withRelationsError, count } =
    await dbQuery.range(from, to)

  const summary = await fetchProductosSummary()
  const total = count ?? 0
  const pagination = buildPaginationMeta(page, pageSize, total)

  if (!withRelationsError && withRelations) {
    const items = (withRelations as TRawProductoWithRelations[]).map(
      mapProductoWithRelations
    )

    return {
      ok: true,
      data: {
        productos: { items, pagination },
        summary,
      },
    }
  }

  console.warn(
    "Productos con relaciones no disponible, usando consulta básica:",
    withRelationsError?.message
  )

  let basicQuery = supabaseAdmin
    .from("productos")
    .select(
      "id, nombre, precio_mayorista, stock, estado, imagen_url, proveedor_id, categoria_id",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })

  if (estado) basicQuery = basicQuery.eq("estado", estado)
  if (searchTerm) basicQuery = basicQuery.ilike("nombre", `%${searchTerm}%`)

  const { data: basicRows, error: basicError, count: basicCount } =
    await basicQuery.range(from, to)

  if (basicError || !basicRows) {
    console.error("Error al cargar productos:", basicError)
    return {
      ok: false,
      message: PRODUCTOS_MESSAGES.loadFailed,
      status: 500,
    }
  }

  const proveedorIds = [
    ...new Set(
      (basicRows as TRawProductoBasic[])
        .map((r) => r.proveedor_id)
        .filter(Boolean)
    ),
  ]
  const categoriaIds = [
    ...new Set(
      (basicRows as TRawProductoBasic[])
        .map((r) => r.categoria_id)
        .filter(Boolean)
    ),
  ]

  const proveedorMap = new Map<number, string>()
  const categoriaMap = new Map<number, string>()

  if (proveedorIds.length > 0) {
    const { data: proveedores } = await supabaseAdmin
      .from("proveedores")
      .select("id, nombre_empresa")
      .in("id", proveedorIds)

    for (const prov of proveedores ?? []) {
      proveedorMap.set(prov.id, prov.nombre_empresa)
    }
  }

  if (categoriaIds.length > 0) {
    const { data: categorias } = await supabaseAdmin
      .from("categorias")
      .select("id, nombre")
      .in("id", categoriaIds)

    for (const cat of categorias ?? []) {
      categoriaMap.set(cat.id, cat.nombre)
    }
  }

  const items = (basicRows as TRawProductoBasic[]).map((row) =>
    mapProductoBasic(row, proveedorMap, categoriaMap)
  )

  return {
    ok: true,
    data: {
      productos: {
        items,
        pagination: buildPaginationMeta(page, pageSize, basicCount ?? 0),
      },
      summary,
    },
  }
}
