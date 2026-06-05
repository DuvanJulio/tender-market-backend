export const RECOVERY_MESSAGES = {
  emailRequired: "El correo es obligatorio",
  emailInvalid: "Ingresa un correo válido",
  forgotPasswordSuccess:
    "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
  forgotPasswordFailed: "No se pudo enviar el correo de recuperación",
  passwordRequired: "La nueva contraseña es obligatoria",
  passwordTooShort: "La contraseña debe tener al menos 8 caracteres",
  tokenRequired: "El enlace de recuperación no es válido o expiró",
  resetPasswordSuccess: "Contraseña actualizada correctamente",
  resetPasswordFailed: "No se pudo actualizar la contraseña",
  internalError: "Error interno del servidor",
} as const
