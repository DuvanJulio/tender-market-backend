import type { IPatchPasswordBody, IPatchProfileBody } from "../interfaces"
import { PROFILE_MESSAGES } from "./types"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validatePatchProfileBody(
  body: unknown
):
  | { ok: true; data: IPatchProfileBody }
  | { ok: false; message: string; status: number } {
  if (!body || typeof body !== "object") {
    return {
      ok: false,
      message: PROFILE_MESSAGES.updateFailed,
      status: 400,
    }
  }

  const raw = body as Partial<IPatchProfileBody>
  const email = raw.email?.trim()
  const telefono = raw.telefono?.trim()

  if (email === undefined && telefono === undefined) {
    return {
      ok: false,
      message: PROFILE_MESSAGES.updateFailed,
      status: 400,
    }
  }

  if (email !== undefined) {
    if (!email) {
      return {
        ok: false,
        message: PROFILE_MESSAGES.emailRequired,
        status: 400,
      }
    }
    if (!EMAIL_REGEX.test(email)) {
      return {
        ok: false,
        message: PROFILE_MESSAGES.emailInvalid,
        status: 400,
      }
    }
  }

  if (telefono !== undefined && !telefono) {
    return {
      ok: false,
      message: PROFILE_MESSAGES.telefonoRequired,
      status: 400,
    }
  }

  return {
    ok: true,
    data: {
      ...(email !== undefined ? { email } : {}),
      ...(telefono !== undefined ? { telefono } : {}),
    },
  }
}

export function validatePatchPasswordBody(
  body: unknown
):
  | { ok: true; data: IPatchPasswordBody }
  | { ok: false; message: string; status: number } {
  if (!body || typeof body !== "object") {
    return {
      ok: false,
      message: PROFILE_MESSAGES.passwordUpdateFailed,
      status: 400,
    }
  }

  const raw = body as Partial<IPatchPasswordBody>
  const current_password = raw.current_password ?? ""
  const new_password = raw.new_password ?? ""

  if (!current_password) {
    return {
      ok: false,
      message: PROFILE_MESSAGES.currentPasswordRequired,
      status: 400,
    }
  }

  if (!new_password) {
    return {
      ok: false,
      message: PROFILE_MESSAGES.newPasswordRequired,
      status: 400,
    }
  }

  if (new_password.length < 8) {
    return {
      ok: false,
      message: PROFILE_MESSAGES.newPasswordMin,
      status: 400,
    }
  }

  if (current_password === new_password) {
    return {
      ok: false,
      message: "La nueva contraseña debe ser diferente a la actual",
      status: 400,
    }
  }

  return {
    ok: true,
    data: { current_password, new_password },
  }
}
