import { supabaseAdmin } from "@/lib/supabase/admin"
import { notifyAdminsProductoPendiente } from "@/features/notificaciones/server/admin-notificacion.helper"
import type {
  IProductoProveedor,
  TPostProductoProveedorBody,
} from "../interfaces"
import { mapProductoProveedor } from "./producto-mapper"
import { PROVEEDOR_PRODUCTOS_MESSAGES } from "./types"

type TPostProductoProveedorServiceResult =
  | { ok: true; data: IProductoProveedor }
  | { ok: false; message: string; status: number }

export async function postProductoProveedorService(
  proveedorId: number,
  body: TPostProductoProveedorBody
): Promise<TPostProductoProveedorServiceResult> {
  const { data, error } = await supabaseAdmin
    .from("productos")
    .insert({
      nombre: body.nombre,
      categoria_id: body.categoria_id,
      precio_mayorista: body.precio_mayorista,
      stock: body.stock,
      imagen_url: body.imagen_url,
      proveedor_id: proveedorId,
      estado: "borrador",
    })
    .select(
      "id, nombre, precio_mayorista, stock, estado, imagen_url, categoria_id, categorias(nombre)"
    )
    .single()

  if (error || !data) {
    console.error("Error al crear producto:", error)
    return {
      ok: false,
      message: PROVEEDOR_PRODUCTOS_MESSAGES.createFailed,
      status: 500,
    }
  }

  const mapped = mapProductoProveedor(data as never)
  if (mapped) {
    const { data: proveedor } = await supabaseAdmin
      .from("proveedores")
      .select("nombre_empresa")
      .eq("id", proveedorId)
      .maybeSingle()

    await notifyAdminsProductoPendiente({
      nombreProducto: mapped.nombre,
      proveedorNombre: (proveedor?.nombre_empresa as string) ?? "Proveedor",
    })
  }

  return { ok: true, data: mapped }
}
