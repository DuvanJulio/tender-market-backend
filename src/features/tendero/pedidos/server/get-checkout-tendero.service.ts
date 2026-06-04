import { supabaseAdmin } from "@/lib/supabase/admin"
import { TENDERO_PEDIDOS_MESSAGES } from "./types"

type TGetCheckoutTenderoServiceResult =
  | {
      ok: true
      data: {
        direccion: string
        contacto: string
        telefono: string
        nombre_tienda: string
      }
    }
  | { ok: false; message: string; status: number }

function formatDireccion(
  direcciones:
    | {
        direccion: string
        barrio: string | null
        ciudades: { nombre: string } | { nombre: string }[] | null
      }
    | {
        direccion: string
        barrio: string | null
        ciudades: { nombre: string } | { nombre: string }[] | null
      }[]
    | null
): string | null {
  if (!direcciones) return null
  const dir = Array.isArray(direcciones) ? direcciones[0] : direcciones
  if (!dir) return null

  const ciudad = dir.ciudades
    ? Array.isArray(dir.ciudades)
      ? dir.ciudades[0]?.nombre
      : dir.ciudades.nombre
    : null

  const parts = [dir.direccion, dir.barrio, ciudad].filter(Boolean)
  return parts.length > 0 ? parts.join(", ") : null
}

export async function getCheckoutTenderoService(
  userId: string
): Promise<TGetCheckoutTenderoServiceResult> {
  const { data: usuario } = await supabaseAdmin
    .from("usuarios")
    .select("nombre, apellido, telefono")
    .eq("id", userId)
    .maybeSingle()

  const { data: tendero, error } = await supabaseAdmin
    .from("tenderos")
    .select(
      `
      nombre_tienda,
      telefono,
      direcciones(
        direccion,
        barrio,
        ciudades(nombre)
      )
    `
    )
    .eq("usuario_id", userId)
    .maybeSingle()

  if (error || !tendero) {
    return {
      ok: false,
      message: TENDERO_PEDIDOS_MESSAGES.checkoutFailed,
      status: 404,
    }
  }

  const direccion = formatDireccion(
    tendero.direcciones as Parameters<typeof formatDireccion>[0]
  )

  if (!direccion) {
    return {
      ok: false,
      message: TENDERO_PEDIDOS_MESSAGES.noAddress,
      status: 400,
    }
  }

  const contactoParts = [usuario?.nombre, usuario?.apellido].filter(Boolean)
  const contacto =
    contactoParts.length > 0
      ? contactoParts.join(" ")
      : (tendero.nombre_tienda as string)

  return {
    ok: true,
    data: {
      direccion,
      contacto,
      telefono:
        (tendero.telefono as string | null) ??
        (usuario?.telefono as string | null) ??
        "—",
      nombre_tienda: tendero.nombre_tienda as string,
    },
  }
}
