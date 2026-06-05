/**
 * Genera enlaces wa.me (el proveedor envía desde su propia cuenta de WhatsApp).
 * No requiere WhatsApp Business API.
 */

export function normalizePhoneForWhatsApp(phone: string): string | null {
  const digits = phone.replace(/\D/g, "")
  if (digits.length < 10) return null

  if (digits.startsWith("57") && digits.length >= 12) {
    return digits
  }

  if (digits.length === 10 && digits.startsWith("3")) {
    return `57${digits}`
  }

  if (digits.length === 11 && digits.startsWith("57")) {
    return digits
  }

  const lastTen = digits.slice(-10)
  if (lastTen.length === 10 && lastTen.startsWith("3")) {
    return `57${lastTen}`
  }

  return null
}

export function buildWhatsAppUrl(
  phone: string,
  message: string
): string | null {
  const normalized = normalizePhoneForWhatsApp(phone)
  if (!normalized) return null

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}
