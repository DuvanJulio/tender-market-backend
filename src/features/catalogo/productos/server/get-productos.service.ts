import { supabaseAdmin } from "@/lib/supabase/admin"
import type { IProductoAdmin, IProductosSummary } from "../interfaces"
import { PRODUCTOS_MESSAGES } from "./types"

type TGetProductosServiceResult =
  | { ok: true; data: { productos: IProductoAdmin[]; summary: IProductosSummary } }
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

function buildSummary(productos: IProductoAdmin[]): IProductosSummary {
  return {
    total: productos.length,
    activos: productos.filter((p) => p.estado === "publicado").length,
    pendientes: productos.filter((p) => p.estado === "borrador").length,
    rechazados: productos.filter((p) => p.estado === "inactivo").length,
  }
}

export async function getProductosAdminService(): Promise<TGetProductosServiceResult> {
  const { data: withRelations, error: withRelationsError } = await supabaseAdmin
    .from("productos")
    .select(
      "id, nombre, precio_mayorista, stock, estado, imagen_url, proveedores(nombre_empresa), categorias(nombre)"
    )
    .order("created_at", { ascending: false })

  if (!withRelationsError && withRelations) {
    const productos = (withRelations as TRawProductoWithRelations[]).map(
      (row) => ({
        id: row.id,
        nombre: row.nombre,
        proveedor: (() => {
          const prov = row.proveedores
          if (!prov) return null
          const item = Array.isArray(prov) ? prov[0] : prov
          return item?.nombre_empresa ?? null
        })(),
        categoria: pickRelationName(row.categorias),
        precio: Number(row.precio_mayorista),
        stock: row.stock ?? 0,
        estado: row.estado as IProductoAdmin["estado"],
        imagen_url: row.imagen_url,
      })
    )

    return {
      ok: true,
      data: {
        productos,
        summary: buildSummary(productos),
      },
    }
  }

  console.warn(
    "Productos con relaciones no disponible, usando consulta básica:",
    withRelationsError?.message
  )

  const { data: basicRows, error: basicError } = await supabaseAdmin
    .from("productos")
    .select(
      "id, nombre, precio_mayorista, stock, estado, imagen_url, proveedor_id, categoria_id"
    )
    .order("created_at", { ascending: false })

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

  const productos = (basicRows as TRawProductoBasic[]).map((row) =>
    mapProductoBasic(row, proveedorMap, categoriaMap)
  )

  return {
    ok: true,
    data: {
      productos,
      summary: buildSummary(productos),
    },
  }
}
