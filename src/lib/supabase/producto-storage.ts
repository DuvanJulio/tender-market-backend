import { randomUUID } from "crypto"
import { supabaseAdmin } from "./admin"

export const PRODUCTOS_IMAGEN_BUCKET =
  process.env.SUPABASE_PRODUCTOS_BUCKET ?? "productos-imagenes"

const MAX_FILE_BYTES = 5 * 1024 * 1024

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
])

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
}

export function getProductoImagenPublicUrl(storagePath: string): string {
  const { data } = supabaseAdmin.storage
    .from(PRODUCTOS_IMAGEN_BUCKET)
    .getPublicUrl(storagePath)

  return data.publicUrl
}

export type TUploadProductoImagenInput = {
  proveedorId: number
  buffer: Buffer
  mimeType: string
  originalName?: string
}

export type TUploadProductoImagenResult =
  | { ok: true; url: string; path: string }
  | { ok: false; message: string }

function resolveExtension(mimeType: string, originalName?: string): string | null {
  const fromMime = EXT_BY_MIME[mimeType]
  if (fromMime) return fromMime

  const ext = originalName?.split(".").pop()?.toLowerCase()
  if (ext && ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
    return ext === "jpeg" ? "jpg" : ext
  }

  return null
}

export async function uploadProductoImagen(
  input: TUploadProductoImagenInput
): Promise<TUploadProductoImagenResult> {
  const { proveedorId, buffer, mimeType, originalName } = input

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return {
      ok: false,
      message: "Formato no permitido. Usa JPG, PNG, WebP o GIF.",
    }
  }

  if (buffer.byteLength > MAX_FILE_BYTES) {
    return {
      ok: false,
      message: "La imagen no puede superar 5 MB.",
    }
  }

  const extension = resolveExtension(mimeType, originalName)
  if (!extension) {
    return { ok: false, message: "No se pudo determinar el tipo de imagen." }
  }

  const path = `${proveedorId}/${randomUUID()}.${extension}`

  const { error } = await supabaseAdmin.storage
    .from(PRODUCTOS_IMAGEN_BUCKET)
    .upload(path, buffer, {
      contentType: mimeType,
      upsert: false,
      cacheControl: "3600",
    })

  if (error) {
    console.error("Error al subir imagen de producto:", error)
    return {
      ok: false,
      message:
        error.message.includes("Bucket not found")
          ? "El bucket de imágenes no está configurado en Supabase."
          : "No se pudo subir la imagen.",
    }
  }

  return {
    ok: true,
    path,
    url: getProductoImagenPublicUrl(path),
  }
}
