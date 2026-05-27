import { supabaseAdmin } from "@/lib/supabase/admin"
import type { IDepartmentOption } from "../interfaces"
import { MASTERS_MESSAGES } from "./types"

type TGetDepartmentsServiceResult =
  | { ok: true; data: IDepartmentOption[] }
  | { ok: false; message: string; status: number }

export async function getDepartmentsService(): Promise<TGetDepartmentsServiceResult> {
  const { data, error } = await supabaseAdmin
    .from("departamentos")
    .select("id, nombre")
    .order("nombre")

  if (error) {
    console.error("Error al cargar departamentos:", error)
    return {
      ok: false,
      message: MASTERS_MESSAGES.departmentsLoadFailed,
      status: 500,
    }
  }

  return { ok: true, data: data ?? [] }
}
