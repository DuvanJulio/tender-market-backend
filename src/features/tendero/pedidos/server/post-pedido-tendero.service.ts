import { supabaseAdmin } from "@/lib/supabase/admin"
import type { IPostPedidoTenderoBody } from "@/features/pedidos/interfaces"
import {
  mapPedidoTendero,
  type TRawPedidoItem,
  type TRawPedidoTendero,
} from "@/features/pedidos/server/pedido-mapper"
import { TENDERO_PEDIDOS_MESSAGES } from "./types"

type TPostPedidoTenderoServiceResult =
  | {
      ok: true
      data: {
        pedidos: NonNullable<ReturnType<typeof mapPedidoTendero>>[]
      }
    }
  | { ok: false; message: string; status: number }

type TProductoRow = {
  id: number
  nombre: string
  precio_mayorista: number
  stock: number
  estado: string
  proveedor_id: number
}

function generateCodigo(): string {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `ORD-${Date.now().toString(36).toUpperCase()}-${suffix}`
}

export async function postPedidoTenderoService(
  tenderoId: number,
  contactName: string | undefined,
  body: IPostPedidoTenderoBody
): Promise<TPostPedidoTenderoServiceResult> {
  if (!body.items?.length) {
    return {
      ok: false,
      message: TENDERO_PEDIDOS_MESSAGES.emptyCart,
      status: 400,
    }
  }

  const productoIds = [...new Set(body.items.map((i) => i.producto_id))]
  const { data: productos, error: productosError } = await supabaseAdmin
    .from("productos")
    .select("id, nombre, precio_mayorista, stock, estado, proveedor_id")
    .in("id", productoIds)
    .eq("estado", "publicado")

  if (productosError || !productos?.length) {
    return {
      ok: false,
      message: TENDERO_PEDIDOS_MESSAGES.productNotFound,
      status: 404,
    }
  }

  const productoMap = new Map<number, TProductoRow>()
  for (const row of productos as TProductoRow[]) {
    productoMap.set(row.id, row)
  }

  type TLineItem = {
    producto_id: number
    nombre: string
    cantidad: number
    precio_unitario: number
    subtotal: number
    proveedor_id: number
  }

  const lineItems: TLineItem[] = []

  for (const item of body.items) {
    const producto = productoMap.get(item.producto_id)
    if (!producto) {
      return {
        ok: false,
        message: TENDERO_PEDIDOS_MESSAGES.productNotFound,
        status: 404,
      }
    }

    const cantidad = Math.floor(item.quantity)
    if (!cantidad || cantidad < 1) {
      return {
        ok: false,
        message: TENDERO_PEDIDOS_MESSAGES.invalidBody,
        status: 400,
      }
    }

    if (producto.stock < cantidad) {
      return {
        ok: false,
        message: `${TENDERO_PEDIDOS_MESSAGES.insufficientStock}: ${producto.nombre}`,
        status: 400,
      }
    }

    const precio = Number(producto.precio_mayorista)
    lineItems.push({
      producto_id: producto.id,
      nombre: producto.nombre,
      cantidad,
      precio_unitario: precio,
      subtotal: precio * cantidad,
      proveedor_id: producto.proveedor_id,
    })
  }

  const byProveedor = new Map<number, TLineItem[]>()
  for (const line of lineItems) {
    const list = byProveedor.get(line.proveedor_id) ?? []
    list.push(line)
    byProveedor.set(line.proveedor_id, list)
  }

  const createdPedidos: NonNullable<ReturnType<typeof mapPedidoTendero>>[] = []

  for (const [proveedorId, lines] of byProveedor) {
    const total = lines.reduce((sum, line) => sum + line.subtotal, 0)
    const codigo = generateCodigo()

    const { data: pedido, error: pedidoError } = await supabaseAdmin
      .from("pedidos")
      .insert({
        codigo,
        proveedor_id: proveedorId,
        tendero_id: tenderoId,
        estado: "pendiente",
        total,
      })
      .select(
        `
        id,
        codigo,
        total,
        estado,
        created_at,
        proveedores(nombre_empresa, telefono),
        tenderos(
          nombre_tienda,
          telefono,
          direcciones(
            direccion,
            barrio,
            ciudades(nombre)
          )
        )
      `
      )
      .single()

    if (pedidoError || !pedido) {
      console.error("Error al crear pedido:", pedidoError)
      return {
        ok: false,
        message: TENDERO_PEDIDOS_MESSAGES.createFailed,
        status: 500,
      }
    }

    const pedidoId = pedido.id as number
    const itemsInsert = lines.map((line) => ({
      pedido_id: pedidoId,
      producto_id: line.producto_id,
      nombre: line.nombre,
      cantidad: line.cantidad,
      precio_unitario: line.precio_unitario,
      subtotal: line.subtotal,
    }))

    const { error: itemsError } = await supabaseAdmin
      .from("pedido_items")
      .insert(itemsInsert)

    if (itemsError) {
      console.error("Error al crear items del pedido:", itemsError)
      await supabaseAdmin.from("pedidos").delete().eq("id", pedidoId)
      return {
        ok: false,
        message: TENDERO_PEDIDOS_MESSAGES.createFailed,
        status: 500,
      }
    }

    for (const line of lines) {
      const producto = productoMap.get(line.producto_id)!
      await supabaseAdmin
        .from("productos")
        .update({ stock: producto.stock - line.cantidad })
        .eq("id", line.producto_id)
      producto.stock -= line.cantidad
    }

    const rawItems: TRawPedidoItem[] = lines.map((line) => ({
      nombre: line.nombre,
      cantidad: line.cantidad,
      precio_unitario: line.precio_unitario,
      subtotal: line.subtotal,
    }))

    const mapped = mapPedidoTendero(
      pedido as TRawPedidoTendero,
      rawItems,
      contactName
    )

    if (mapped) createdPedidos.push(mapped)
  }

  return {
    ok: true,
    data: { pedidos: createdPedidos },
  }
}
