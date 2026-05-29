import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { ISignUpRequest, ISignUpResponse, TSignUpRole } from "../interfaces"
import { SIGN_UP_MESSAGES } from "./types"

type TSignUpServiceResult =
  | { ok: true; data: NonNullable<ISignUpResponse["data"]> }
  | { ok: false; message: string; status: number }

export async function signUpService(
  payload: ISignUpRequest
): Promise<TSignUpServiceResult> {
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: { rol: payload.rol },
    },
  })

  if (authError) {
    if (authError.message.includes("already registered")) {
      return {
        ok: false,
        message: SIGN_UP_MESSAGES.emailAlreadyRegistered,
        status: 409,
      }
    }
    return { ok: false, message: authError.message, status: 400 }
  }

  const userId = authData.user?.id
  if (!userId) {
    return {
      ok: false,
      message: SIGN_UP_MESSAGES.userCreationFailed,
      status: 500,
    }
  }

  const { error: perfilError } = await supabaseAdmin
    .from("usuarios")
    .update({
      nombre: payload.nombre,
      apellido: payload.apellido,
      telefono: payload.telefono,
      estado_id: 1,
    })
    .eq("id", userId)

  if (perfilError) {
    console.error("Error al guardar perfil:", perfilError)
    return {
      ok: false,
      message: SIGN_UP_MESSAGES.profileSaveFailed,
      status: 500,
    }
  }

  const { data: direccionData, error: direccionError } = await supabaseAdmin
    .from("direcciones")
    .insert({
      ciudad_id: payload.ciudad_id,
      direccion: payload.direccion,
      barrio: payload.barrio,
    })
    .select("id")
    .single()

  if (direccionError || !direccionData) {
    console.error("Error al guardar dirección:", direccionError)
    return {
      ok: false,
      message: SIGN_UP_MESSAGES.addressSaveFailed,
      status: 500,
    }
  }

  const profileError = await createRoleProfile(
    payload,
    userId,
    direccionData.id
  )
  if (profileError) return profileError

  return {
    ok: true,
    data: {
      rol: payload.rol as TSignUpRole,
      ...(authData.session
        ? { token: authData.session.access_token }
        : undefined),
    },
  }
}

async function createRoleProfile(
  payload: ISignUpRequest,
  userId: string,
  direccionId: number
): Promise<TSignUpServiceResult | null> {
  if (payload.rol === "tendero") {
    const { error } = await supabaseAdmin.from("tenderos").insert({
      usuario_id: userId,
      nombre_tienda: payload.nombre_tienda,
      telefono: payload.telefono,
      nit: payload.nit_tienda ?? null,
      direccion_id: direccionId,
    })

    if (error) {
      console.error("Error al crear tendero:", error)
      return {
        ok: false,
        message: SIGN_UP_MESSAGES.tenderoProfileFailed,
        status: 500,
      }
    }
    return null
  }

  const { error } = await supabaseAdmin.from("proveedores").insert({
    usuario_id: userId,
    nombre_empresa: payload.nombre_empresa,
    nombre_contacto: payload.nombre_contacto,
    telefono: payload.telefono,
    nit: payload.nit_empresa ?? null,
    direccion_id: direccionId,
  })

  if (error) {
    console.error("Error al crear proveedor:", error)
    return {
      ok: false,
      message: SIGN_UP_MESSAGES.proveedorProfileFailed,
      status: 500,
    }
  }

  return null
}
