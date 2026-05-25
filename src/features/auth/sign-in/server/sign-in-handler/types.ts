import type { ISignInRequest, ISignInResponse, TUserAccountStatus, TUserRole } from "../../interfaces"

export type { ISignInRequest, ISignInResponse }

export interface IUsuarioAuthProfile {
  estados_usuarios: { nombre: TUserAccountStatus } | null
  roles: { nombre: TUserRole } | null
}

export const SIGN_IN_MESSAGES = {
  missingCredentials: "Email y contraseña son requeridos",
  invalidCredentials: "Credenciales incorrectas",
  blockedAccount: "Tu cuenta ha sido bloqueada. Contacta al administrador.",
  inactiveAccount: "Tu cuenta está inactiva.",
  success: "Login exitoso",
  internalError: "Error interno del servidor",
} as const
