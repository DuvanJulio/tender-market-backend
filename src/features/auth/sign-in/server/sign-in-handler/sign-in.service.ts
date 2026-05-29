import { createClient } from "@/lib/supabase/server"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { ISignInRequest, ISignInResponse, TUserAccountStatus, TUserRole } from "../../interfaces"
import { SIGN_IN_MESSAGES, type IUsuarioAuthProfile } from "./types"

type TSignInServiceResult =
  | { ok: true; data: NonNullable<ISignInResponse["data"]> }
  | { ok: false; message: string; status: number }

function parseUsuarioProfile(usuario: IUsuarioAuthProfile | null) {
  return {
    estado: usuario?.estados_usuarios?.nombre,
    rol: usuario?.roles?.nombre,
  }
}

async function handleBlockedAccountStatus(
  supabase: SupabaseClient,
  estado: TUserAccountStatus | undefined
): Promise<TSignInServiceResult | null> {
  if (estado === "inactivo" || estado === "bloqueado") {
    await supabase.auth.signOut()
    return {
      ok: false,
      message: SIGN_IN_MESSAGES.inactiveAccount,
      status: 403,
    }
  }

  if (estado === "pendiente") {
    await supabase.auth.signOut()
    return {
      ok: false,
      message: SIGN_IN_MESSAGES.pendingAccount,
      status: 403,
    }
  }

  return null
}

export async function signInService(
  credentials: ISignInRequest
): Promise<TSignInServiceResult> {
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  })

  if (authError || !authData.session || !authData.user) {
    return {
      ok: false,
      message: SIGN_IN_MESSAGES.invalidCredentials,
      status: 401,
    }
  }

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("estados_usuarios (nombre), roles (nombre)")
    .eq("id", authData.user.id)
    .single()

  const { estado, rol } = parseUsuarioProfile(usuario as IUsuarioAuthProfile | null)

  const statusError = await handleBlockedAccountStatus(supabase, estado)
  if (statusError) return statusError

  await supabase
    .from("usuarios")
    .update({ last_login: new Date().toISOString() })
    .eq("id", authData.user.id)

  return {
    ok: true,
    data: {
      token: authData.session.access_token,
      rol: (rol ?? "tendero") as TUserRole,
    },
  }
}
