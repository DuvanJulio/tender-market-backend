import { supabaseAdmin } from "@/lib/supabase/admin"
import {
  buildPaginationMeta,
  getPaginationRange,
  type IPaginatedResult,
} from "@/lib/pagination"
import type {
  IProductoProveedor,
  IProductosProveedorSummary,
} from "../interfaces"
import { mapProductoProveedor } from "./producto-mapper"
import { PROVEEDOR_PRODUCTOS_MESSAGES, STOCK_BAJO_UMBRAL } from "./types"

export type TGetProductosProveedorQuery = {
  proveedorId: number
  page: number
  pageSize: number
  search?: string
  estado?: "borrador" | "publicado" | "inactivo"
  bajo_stock?: boolean
  sin_stock?: boolean
}

type TGetProductosProveedorServiceResult =
  | {
      ok: true
      data: {
        productos: IPaginatedResult<IProductoProveedor>
        summary: IProductosProveedorSummary
      }
    }
  | { ok: false; message: string; status: number }

async function fetchSummary(
  proveedorId: number
): Promise<IProductosProveedorSummary> {
  const base = () =>
    supabaseAdmin
      .from("productos")
      .select("id", { count: "exact", head: true })
      .eq("proveedor_id", proveedorId)

  const [totalRes, activosRes, pendientesRes, inactivosRes, bajoStockRes] =
    await Promise.all([
      base(),
      base().eq("estado", "publicado"),
      base().eq("estado", "borrador"),
      base().eq("estado", "inactivo"),
      supabaseAdmin
        .from("productos")
        .select("id", { count: "exact", head: true })
        .eq("proveedor_id", proveedorId)
        .gt("stock", 0)
        .lte("stock", STOCK_BAJO_UMBRAL),
    ])

  return {
    total: totalRes.count ?? 0,
    activos: activosRes.count ?? 0,
    pendientes: pendientesRes.count ?? 0,
    inactivos: inactivosRes.count ?? 0,
    bajo_stock: bajoStockRes.count ?? 0,
  }
}

export async function getProductosProveedorService(
  query: TGetProductosProveedorQuery
): Promise<TGetProductosProveedorServiceResult> {
  const { proveedorId, page, pageSize, search, estado, bajo_stock, sin_stock } =
    query
  const { from, to } = getPaginationRange(page, pageSize)

  let dbQuery = supabaseAdmin
    .from("productos")
    .select(
      "id, nombre, precio_mayorista, stock, estado, imagen_url, categoria_id, categorias(nombre)",
      { count: "exact" }
    )
    .eq("proveedor_id", proveedorId)
    .order("created_at", { ascending: false })

  if (estado) {
    dbQuery = dbQuery.eq("estado", estado)
  }

  if (bajo_stock) {
    dbQuery = dbQuery.gt("stock", 0).lte("stock", STOCK_BAJO_UMBRAL)
  }

  if (sin_stock) {
    dbQuery = dbQuery.eq("stock", 0)
  }

  const searchTerm = search?.trim()
  if (searchTerm) {
    dbQuery = dbQuery.ilike("nombre", `%${searchTerm}%`)
  }

  const { data, error, count } = await dbQuery.range(from, to)

  if (error || !data) {
    console.error("Error al cargar productos del proveedor:", error)
    return {
      ok: false,
      message: PROVEEDOR_PRODUCTOS_MESSAGES.loadFailed,
      status: 500,
    }
  }

  const summary = await fetchSummary(proveedorId)
  const items = data.map((row) => mapProductoProveedor(row as never))

  return {
    ok: true,
    data: {
      productos: {
        items,
        pagination: buildPaginationMeta(page, pageSize, count ?? 0),
      },
      summary,
    },
  }
}
