import type { ISignUpRequest, ISignUpResponse } from "../interfaces"

export type { ISignUpRequest, ISignUpResponse }

export const SIGN_UP_MESSAGES = {
  missingFields:
    "Nombre, apellido, email, teléfono, contraseña y rol son requeridos",
  invalidRole: "Rol inválido. Debe ser tendero o proveedor",
  missingAddress: "Ciudad, dirección y barrio son requeridos",
  missingStoreName: "El nombre de la tienda es requerido",
  missingCompanyName: "El nombre de la empresa es requerido",
  emailAlreadyRegistered: "Este email ya está registrado",
  userCreationFailed: "Error al crear el usuario",
  profileSaveFailed: "Error al guardar el perfil",
  addressSaveFailed: "Error al guardar la dirección",
  tenderoProfileFailed: "Error al crear perfil de tendero",
  proveedorProfileFailed: "Error al crear perfil de proveedor",
  success: "Usuario registrado exitosamente",
  internalError: "Error interno del servidor",
} as const
