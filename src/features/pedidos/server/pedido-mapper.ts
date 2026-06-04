import type {
  IPedidoProductoItem,
  IPedidoProveedor,
  IPedidoTendero,
} from "../interfaces"
import { toApiEstado } from "./pedido-estado"

type TRawDireccion = {
  direccion: string
  barrio: string | null
  ciudades:
    | { nombre: string }
    | { nombre: string }[]
    | null
}

type TRawTendero = {
  nombre_tienda: string
  telefono: string | null
  direcciones: TRawDireccion | TRawDireccion[] | null
}

export type TRawPedidoItem = {
  producto_id?: number | null
  nombre: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

export type TRawPedido = {
  id: number
  codigo: string
  total: number
  estado: string
  created_at: string
  tenderos: TRawTendero | TRawTendero[] | null
  pedido_items?: TRawPedidoItem[] | null
}

function pickTendero(
  tenderos: TRawPedido["tenderos"]
): TRawTendero | null {
  if (!tenderos) return null
  return Array.isArray(tenderos) ? tenderos[0] ?? null : tenderos
}

function formatAddress(tendero: TRawTendero | null): string {
  const direcciones = tendero?.direcciones
  if (!direcciones) return "—"

  const dir = Array.isArray(direcciones) ? direcciones[0] : direcciones
  if (!dir) return "—"

  const ciudad = dir.ciudades
    ? Array.isArray(dir.ciudades)
      ? dir.ciudades[0]?.nombre
      : dir.ciudades.nombre
    : null

  const parts = [dir.direccion, dir.barrio, ciudad].filter(Boolean)
  return parts.length > 0 ? parts.join(", ") : "—"
}

export function mapPedidoItems(
  items: TRawPedidoItem[] | null | undefined
): IPedidoProductoItem[] {
  return (items ?? []).map((item) => ({
    producto_id: item.producto_id ?? null,
    name: item.nombre,
    quantity: item.cantidad,
    price: Number(item.precio_unitario),
  }))
}

type TRawProveedor = {
  nombre_empresa: string
  telefono: string | null
}

export type TRawPedidoTendero = TRawPedido & {
  proveedores: TRawProveedor | TRawProveedor[] | null
}

function pickProveedor(
  proveedores: TRawPedidoTendero["proveedores"]
): TRawProveedor | null {
  if (!proveedores) return null
  return Array.isArray(proveedores) ? proveedores[0] ?? null : proveedores
}

export function mapPedidoTendero(
  row: TRawPedidoTendero,
  items?: TRawPedidoItem[] | null,
  contactName?: string
): IPedidoTendero | null {
  const apiEstado = toApiEstado(row.estado)
  if (!apiEstado) return null

  const tendero = pickTendero(row.tenderos)
  const proveedor = pickProveedor(row.proveedores)
  const productos = mapPedidoItems(items ?? row.pedido_items)

  return {
    id: row.codigo,
    supplier: proveedor?.nombre_empresa ?? "Proveedor",
    supplierPhone: proveedor?.telefono ?? "—",
    address: formatAddress(tendero),
    contact: contactName ?? tendero?.nombre_tienda ?? "Tendero",
    items: productos.length,
    total: Number(row.total),
    status: apiEstado,
    occurred_at: row.created_at,
    products: productos,
  }
}

export function mapPedidoProveedor(
  row: TRawPedido,
  items?: TRawPedidoItem[] | null
): IPedidoProveedor | null {
  const apiEstado = toApiEstado(row.estado)
  if (!apiEstado) return null

  const tendero = pickTendero(row.tenderos)
  const productos = mapPedidoItems(items ?? row.pedido_items)

  return {
    id: row.codigo,
    customer: tendero?.nombre_tienda ?? "Tendero",
    customerPhone: tendero?.telefono ?? "—",
    address: formatAddress(tendero),
    items: productos.length,
    total: Number(row.total),
    status: apiEstado,
    occurred_at: row.created_at,
    products: productos,
  }
}
