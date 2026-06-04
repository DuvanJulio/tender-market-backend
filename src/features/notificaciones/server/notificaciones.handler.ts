import { requireAdminFromRequest } from "@/lib/auth/require-admin"
import { requireProveedorFromRequest } from "@/lib/auth/require-proveedor"
import { requireTenderoFromRequest } from "@/lib/auth/require-tendero"
import { getNotificacionesService } from "./get-notificaciones.service"
import {
  markAllNotificacionesLeidasService,
  markNotificacionLeidaService,
} from "./mark-notificacion.service"
import {
  notificacionMarkReadSuccessResponse,
  notificacionesErrorResponse,
  notificacionesListSuccessResponse,
} from "./responses"
import { NOTIFICACIONES_MESSAGES } from "./types"

type TAuthResult =
  | { ok: true; userId: string }
  | { ok: false; message: string; status: number }

async function authTendero(request: Request): Promise<TAuthResult> {
  const auth = await requireTenderoFromRequest(request)
  if (!auth.ok) return auth
  return { ok: true, userId: auth.context.userId }
}

async function authProveedor(request: Request): Promise<TAuthResult> {
  const auth = await requireProveedorFromRequest(request)
  if (!auth.ok) return auth
  return { ok: true, userId: auth.context.userId }
}

async function authAdmin(request: Request): Promise<TAuthResult> {
  const auth = await requireAdminFromRequest(request)
  if (!auth.ok) return auth
  return { ok: true, userId: auth.context.userId }
}

export async function getNotificacionesTenderoHandler(request: Request) {
  try {
    const auth = await authTendero(request)
    if (!auth.ok) {
      return notificacionesErrorResponse(auth.message, auth.status)
    }

    const result = await getNotificacionesService(auth.userId)
    if (!result.ok) {
      return notificacionesErrorResponse(result.message, result.status)
    }

    return notificacionesListSuccessResponse(
      NOTIFICACIONES_MESSAGES.loadSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en get-notificaciones-tendero:", error)
    return notificacionesErrorResponse(
      NOTIFICACIONES_MESSAGES.internalError,
      500
    )
  }
}

export async function getNotificacionesProveedorHandler(request: Request) {
  try {
    const auth = await authProveedor(request)
    if (!auth.ok) {
      return notificacionesErrorResponse(auth.message, auth.status)
    }

    const result = await getNotificacionesService(auth.userId)
    if (!result.ok) {
      return notificacionesErrorResponse(result.message, result.status)
    }

    return notificacionesListSuccessResponse(
      NOTIFICACIONES_MESSAGES.loadSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en get-notificaciones-proveedor:", error)
    return notificacionesErrorResponse(
      NOTIFICACIONES_MESSAGES.internalError,
      500
    )
  }
}

export async function markNotificacionTenderoLeidaHandler(
  request: Request,
  notificacionId: number
) {
  try {
    const auth = await authTendero(request)
    if (!auth.ok) {
      return notificacionesErrorResponse(auth.message, auth.status)
    }

    const result = await markNotificacionLeidaService(
      auth.userId,
      notificacionId
    )
    if (!result.ok) {
      return notificacionesErrorResponse(result.message, result.status)
    }

    return notificacionMarkReadSuccessResponse(
      NOTIFICACIONES_MESSAGES.markReadSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en mark-notificacion-tendero:", error)
    return notificacionesErrorResponse(
      NOTIFICACIONES_MESSAGES.internalError,
      500
    )
  }
}

export async function markNotificacionProveedorLeidaHandler(
  request: Request,
  notificacionId: number
) {
  try {
    const auth = await authProveedor(request)
    if (!auth.ok) {
      return notificacionesErrorResponse(auth.message, auth.status)
    }

    const result = await markNotificacionLeidaService(
      auth.userId,
      notificacionId
    )
    if (!result.ok) {
      return notificacionesErrorResponse(result.message, result.status)
    }

    return notificacionMarkReadSuccessResponse(
      NOTIFICACIONES_MESSAGES.markReadSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en mark-notificacion-proveedor:", error)
    return notificacionesErrorResponse(
      NOTIFICACIONES_MESSAGES.internalError,
      500
    )
  }
}

export async function markAllNotificacionesTenderoLeidasHandler(
  request: Request
) {
  try {
    const auth = await authTendero(request)
    if (!auth.ok) {
      return notificacionesErrorResponse(auth.message, auth.status)
    }

    const result = await markAllNotificacionesLeidasService(auth.userId)
    if (!result.ok) {
      return notificacionesErrorResponse(result.message, result.status)
    }

    return notificacionMarkReadSuccessResponse(
      NOTIFICACIONES_MESSAGES.markAllReadSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en mark-all-notificaciones-tendero:", error)
    return notificacionesErrorResponse(
      NOTIFICACIONES_MESSAGES.internalError,
      500
    )
  }
}

export async function getNotificacionesAdminHandler(request: Request) {
  try {
    const auth = await authAdmin(request)
    if (!auth.ok) {
      return notificacionesErrorResponse(auth.message, auth.status)
    }

    const result = await getNotificacionesService(auth.userId)
    if (!result.ok) {
      return notificacionesErrorResponse(result.message, result.status)
    }

    return notificacionesListSuccessResponse(
      NOTIFICACIONES_MESSAGES.loadSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en get-notificaciones-admin:", error)
    return notificacionesErrorResponse(
      NOTIFICACIONES_MESSAGES.internalError,
      500
    )
  }
}

export async function markNotificacionAdminLeidaHandler(
  request: Request,
  notificacionId: number
) {
  try {
    const auth = await authAdmin(request)
    if (!auth.ok) {
      return notificacionesErrorResponse(auth.message, auth.status)
    }

    const result = await markNotificacionLeidaService(
      auth.userId,
      notificacionId
    )
    if (!result.ok) {
      return notificacionesErrorResponse(result.message, result.status)
    }

    return notificacionMarkReadSuccessResponse(
      NOTIFICACIONES_MESSAGES.markReadSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en mark-notificacion-admin:", error)
    return notificacionesErrorResponse(
      NOTIFICACIONES_MESSAGES.internalError,
      500
    )
  }
}

export async function markAllNotificacionesAdminLeidasHandler(
  request: Request
) {
  try {
    const auth = await authAdmin(request)
    if (!auth.ok) {
      return notificacionesErrorResponse(auth.message, auth.status)
    }

    const result = await markAllNotificacionesLeidasService(auth.userId)
    if (!result.ok) {
      return notificacionesErrorResponse(result.message, result.status)
    }

    return notificacionMarkReadSuccessResponse(
      NOTIFICACIONES_MESSAGES.markAllReadSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en mark-all-notificaciones-admin:", error)
    return notificacionesErrorResponse(
      NOTIFICACIONES_MESSAGES.internalError,
      500
    )
  }
}

export async function markAllNotificacionesProveedorLeidasHandler(
  request: Request
) {
  try {
    const auth = await authProveedor(request)
    if (!auth.ok) {
      return notificacionesErrorResponse(auth.message, auth.status)
    }

    const result = await markAllNotificacionesLeidasService(auth.userId)
    if (!result.ok) {
      return notificacionesErrorResponse(result.message, result.status)
    }

    return notificacionMarkReadSuccessResponse(
      NOTIFICACIONES_MESSAGES.markAllReadSuccess,
      result.data
    )
  } catch (error) {
    console.error("Error en mark-all-notificaciones-proveedor:", error)
    return notificacionesErrorResponse(
      NOTIFICACIONES_MESSAGES.internalError,
      500
    )
  }
}
