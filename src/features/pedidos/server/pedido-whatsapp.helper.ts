import type { TApiPedidoEstado } from "../interfaces"
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-whatsapp-url"

export type TBuildPedidoWhatsAppParams = {
  estado: TApiPedidoEstado
  codigo: string
  proveedorNombre: string
  nombreTienda: string
  telefonoTendero: string | null
  direccion: string
  total: number
}

function formatCop(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount)
}

function buildWhatsAppMessage(params: TBuildPedidoWhatsAppParams): string | null {
  const { estado, codigo, proveedorNombre, nombreTienda, direccion, total } =
    params
  const totalFmt = formatCop(total)

  switch (estado) {
    case "processing":
      return [
        `¡Hola ${nombreTienda}! 👋`,
        ``,
        `Tu pedido *${codigo}* en *${proveedorNombre}* fue *confirmado*.`,
        ``,
        `📦 Total: ${totalFmt}`,
        `📍 Entrega: ${direccion}`,
        ``,
        `El pago lo coordinamos contigo directamente (efectivo o transferencia al recibir).`,
        `Te avisamos cuando salga en camino. ¡Gracias por tu compra!`,
      ].join("\n")
    case "shipped":
      return [
        `¡Hola ${nombreTienda}!`,
        ``,
        `Tu pedido *${codigo}* de *${proveedorNombre}* ya va *en camino* 🚚`,
        `Dirección: ${direccion}`,
        ``,
        `Cualquier duda, responde por este chat.`,
      ].join("\n")
    case "cancelled":
      return [
        `Hola ${nombreTienda},`,
        ``,
        `Lamentamos informarte que el pedido *${codigo}* en *${proveedorNombre}* no pudo ser atendido en este momento.`,
        `Si tienes dudas, escríbenos por aquí.`,
      ].join("\n")
    default:
      return null
  }
}

function isUsablePhone(phone: string | null | undefined): phone is string {
  if (!phone?.trim()) return false
  return phone !== "—" && phone !== "-"
}

export function buildPedidoWhatsAppNotifyUrl(
  params: TBuildPedidoWhatsAppParams
): string | null {
  if (!isUsablePhone(params.telefonoTendero)) return null

  const message = buildWhatsAppMessage(params)
  if (!message) return null

  return buildWhatsAppUrl(params.telefonoTendero, message)
}
