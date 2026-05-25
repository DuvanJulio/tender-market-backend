import type { ISignUpRequest, TSignUpRole } from "../interfaces"
import { SIGN_UP_MESSAGES } from "./types"

export type TSignUpValidationResult =
  | { valid: true; data: ISignUpRequest }
  | { valid: false; message: string }

function isSignUpRole(value: unknown): value is TSignUpRole {
  return value === "tendero" || value === "proveedor"
}

export function validateSignUpBody(body: unknown): TSignUpValidationResult {
  if (!body || typeof body !== "object") {
    return { valid: false, message: SIGN_UP_MESSAGES.missingFields }
  }

  const raw = body as Partial<ISignUpRequest>

  const nombre = raw.nombre?.trim()
  const apellido = raw.apellido?.trim()
  const email = raw.email?.trim()
  const password = raw.password
  const telefono = raw.telefono?.trim()
  const rol = raw.rol
  const ciudad_id = Number(raw.ciudad_id)
  const direccion = raw.direccion?.trim()
  const barrio = raw.barrio?.trim()

  if (!nombre || !apellido || !email || !password || !telefono || !rol) {
    return { valid: false, message: SIGN_UP_MESSAGES.missingFields }
  }

  if (!isSignUpRole(rol)) {
    return { valid: false, message: SIGN_UP_MESSAGES.invalidRole }
  }

  if (!ciudad_id || !direccion || !barrio) {
    return { valid: false, message: SIGN_UP_MESSAGES.missingAddress }
  }

  if (rol === "tendero" && !raw.nombre_tienda?.trim()) {
    return { valid: false, message: SIGN_UP_MESSAGES.missingStoreName }
  }

  if (rol === "proveedor" && !raw.nombre_empresa?.trim()) {
    return { valid: false, message: SIGN_UP_MESSAGES.missingCompanyName }
  }

  const nombre_contacto =
    raw.nombre_contacto?.trim() || `${nombre} ${apellido}`.trim()

  return {
    valid: true,
    data: {
      nombre,
      apellido,
      email,
      password,
      telefono,
      rol,
      ciudad_id,
      direccion,
      barrio,
      nombre_tienda: raw.nombre_tienda?.trim(),
      nit_tienda: raw.nit_tienda?.trim() || undefined,
      nombre_empresa: raw.nombre_empresa?.trim(),
      nit_empresa: raw.nit_empresa?.trim() || undefined,
      nombre_contacto,
    },
  }
}
