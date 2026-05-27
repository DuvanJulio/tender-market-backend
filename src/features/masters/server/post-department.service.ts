import { supabaseAdmin } from "@/lib/supabase/admin"
import type { IDepartmentOption, TPostDepartmentBody } from "../interfaces"
import { MASTERS_MESSAGES } from "./types"

type TPostDepartmentServiceResult =
  | { ok: true; data: IDepartmentOption }
  | { ok: false; message: string; status: number }

export async function postDepartmentService(
  body: TPostDepartmentBody
): Promise<TPostDepartmentServiceResult> {
  const nombre = body.nombre.trim()

  if (!nombre) {
    return {
      ok: false,
      message: MASTERS_MESSAGES.departmentNameRequired,
      status: 400,
    }
  }

  const { data: existing } = await supabaseAdmin
    .from("departamentos")
    .select("id")
    .ilike("nombre", nombre)
    .maybeSingle()

  if (existing) {
    return {
      ok: false,
      message: MASTERS_MESSAGES.departmentAlreadyExists,
      status: 409,
    }
  }

  const { data, error } = await supabaseAdmin
    .from("departamentos")
    .insert({ nombre })
    .select("id, nombre")
    .single()

  if (error || !data) {
    console.error("Error al crear departamento:", error)
    return {
      ok: false,
      message: MASTERS_MESSAGES.departmentCreateFailed,
      status: 500,
    }
  }

  return { ok: true, data }
}
