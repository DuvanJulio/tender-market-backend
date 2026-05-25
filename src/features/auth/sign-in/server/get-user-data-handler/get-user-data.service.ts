import { createClient } from "@/lib/supabase/server"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import type { IGetUserDataResponseData, TUserRole } from "../../interfaces"
import type { IUsuarioBasicProfile } from "./types"

type TGetUserDataServiceResult =
  | { ok: true; data: IGetUserDataResponseData }
  | { ok: false; message: string; status: number }

function buildFullName(usuario: IUsuarioBasicProfile | null): string | undefined {
  if (!usuario) return undefined

  const parts = [usuario.nombre, usuario.apellido].filter(Boolean)
  return parts.length > 0 ? parts.join(" ") : undefined
}

export async function getUserDataService(
  request: Request
): Promise<TGetUserDataServiceResult> {
  const authUser = await getAuthUserFromRequest(request)

  if (!authUser) {
    return {
      ok: true,
      data: { isAuthenticated: false },
    }
  }

  const supabase = await createClient()

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("nombre, apellido, roles (nombre)")
    .eq("id", authUser.id)
    .single()

  const profile = usuario as IUsuarioBasicProfile | null
  const rol = profile?.roles?.nombre as TUserRole | undefined

  return {
    ok: true,
    data: {
      isAuthenticated: true,
      nombre: buildFullName(profile),
      email: authUser.email ?? undefined,
      rol,
    },
  }
}
