import { supabaseAdmin } from "@/lib/supabase/admin"
import type {
  TPatchProductoProveedorBody,
  TPostProductoProveedorBody,
} from "../interfaces"
import { PROVEEDOR_PRODUCTOS_MESSAGES } from "./types"

type TValidationResult =
  | { ok: true; body: TPostProductoProveedorBody }
  | { ok: false; message: string; status: number }

type TPatchValidationResult =
  | { ok: true; body: TPatchProductoProveedorBody }
  | { ok: false; message: string; status: number }

async function categoriaExists(categoriaId: number): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("categorias")
    .select("id")
    .eq("id", categoriaId)
    .eq("estado", true)
    .maybeSingle()

  return Boolean(data)
}

export async function validatePostProductoBody(
  raw: unknown
): Promise<TValidationResult> {
  if (!raw || typeof raw !== "object") {
    return {
      ok: false,
      message: PROVEEDOR_PRODUCTOS_MESSAGES.nombreRequired,
      status: 400,
    }
  }

  const body = raw as Record<string, unknown>
  const nombre = typeof body.nombre === "string" ? body.nombre.trim() : ""
  const categoria_id = Number(body.categoria_id)
  const precio_mayorista = Number(body.precio_mayorista)
  const stock = Number(body.stock)
  const imagen_url =
    body.imagen_url === null || body.imagen_url === undefined
      ? null
      : typeof body.imagen_url === "string"
        ? body.imagen_url.trim() || null
        : null

  if (!nombre) {
    return {
      ok: false,
      message: PROVEEDOR_PRODUCTOS_MESSAGES.nombreRequired,
      status: 400,
    }
  }

  if (!categoria_id || Number.isNaN(categoria_id)) {
    return {
      ok: false,
      message: PROVEEDOR_PRODUCTOS_MESSAGES.categoriaRequired,
      status: 400,
    }
  }

  if (!(await categoriaExists(categoria_id))) {
    return {
      ok: false,
      message: PROVEEDOR_PRODUCTOS_MESSAGES.categoriaNotFound,
      status: 404,
    }
  }

  if (!precio_mayorista || Number.isNaN(precio_mayorista) || precio_mayorista <= 0) {
    return {
      ok: false,
      message: PROVEEDOR_PRODUCTOS_MESSAGES.precioInvalid,
      status: 400,
    }
  }

  if (Number.isNaN(stock) || stock < 0) {
    return {
      ok: false,
      message: PROVEEDOR_PRODUCTOS_MESSAGES.stockInvalid,
      status: 400,
    }
  }

  return {
    ok: true,
    body: {
      nombre,
      categoria_id,
      precio_mayorista,
      stock: Math.floor(stock),
      imagen_url,
    },
  }
}

export async function validatePatchProductoBody(
  raw: unknown
): Promise<TPatchValidationResult> {
  if (!raw || typeof raw !== "object") {
    return {
      ok: false,
      message: PROVEEDOR_PRODUCTOS_MESSAGES.updateFailed,
      status: 400,
    }
  }

  const body = raw as Record<string, unknown>
  const patch: TPatchProductoProveedorBody = {}

  if (body.nombre !== undefined) {
    const nombre = typeof body.nombre === "string" ? body.nombre.trim() : ""
    if (!nombre) {
      return {
        ok: false,
        message: PROVEEDOR_PRODUCTOS_MESSAGES.nombreRequired,
        status: 400,
      }
    }
    patch.nombre = nombre
  }

  if (body.categoria_id !== undefined) {
    const categoria_id = Number(body.categoria_id)
    if (!categoria_id || Number.isNaN(categoria_id)) {
      return {
        ok: false,
        message: PROVEEDOR_PRODUCTOS_MESSAGES.categoriaRequired,
        status: 400,
      }
    }
    if (!(await categoriaExists(categoria_id))) {
      return {
        ok: false,
        message: PROVEEDOR_PRODUCTOS_MESSAGES.categoriaNotFound,
        status: 404,
      }
    }
    patch.categoria_id = categoria_id
  }

  if (body.precio_mayorista !== undefined) {
    const precio = Number(body.precio_mayorista)
    if (!precio || Number.isNaN(precio) || precio <= 0) {
      return {
        ok: false,
        message: PROVEEDOR_PRODUCTOS_MESSAGES.precioInvalid,
        status: 400,
      }
    }
    patch.precio_mayorista = precio
  }

  if (body.stock !== undefined) {
    const stock = Number(body.stock)
    if (Number.isNaN(stock) || stock < 0) {
      return {
        ok: false,
        message: PROVEEDOR_PRODUCTOS_MESSAGES.stockInvalid,
        status: 400,
      }
    }
    patch.stock = Math.floor(stock)
  }

  if (body.imagen_url !== undefined) {
    patch.imagen_url =
      body.imagen_url === null
        ? null
        : typeof body.imagen_url === "string"
          ? body.imagen_url.trim() || null
          : null
  }

  if (body.estado !== undefined) {
    if (body.estado !== "borrador" && body.estado !== "inactivo") {
      return {
        ok: false,
        message: PROVEEDOR_PRODUCTOS_MESSAGES.updateFailed,
        status: 400,
      }
    }
    patch.estado = body.estado
  }

  if (Object.keys(patch).length === 0) {
    return {
      ok: false,
      message: PROVEEDOR_PRODUCTOS_MESSAGES.updateFailed,
      status: 400,
    }
  }

  return { ok: true, body: patch }
}
