import { supabaseAdmin } from "@/lib/supabase/admin"
import type { ICityOption, TPostCityBody } from "../interfaces"
import { MASTERS_MESSAGES } from "./types"

type TPostCityServiceResult =
  | { ok: true; data: ICityOption }
  | { ok: false; message: string; status: number }

export async function postCityService(
  body: TPostCityBody
): Promise<TPostCityServiceResult> {
  const nombre = body.nombre.trim()
  const departamento_id = Number(body.departamento_id)

  if (!nombre) {
    return {
      ok: false,
      message: MASTERS_MESSAGES.cityNameRequired,
      status: 400,
    }
  }

  if (!departamento_id) {
    return {
      ok: false,
      message: MASTERS_MESSAGES.departmentRequired,
      status: 400,
    }
  }

  const { data: department } = await supabaseAdmin
    .from("departamentos")
    .select("id, nombre")
    .eq("id", departamento_id)
    .maybeSingle()

  if (!department) {
    return {
      ok: false,
      message: MASTERS_MESSAGES.departmentNotFound,
      status: 404,
    }
  }

  const { data: existingCity } = await supabaseAdmin
    .from("ciudades")
    .select("id")
    .eq("departamento_id", departamento_id)
    .ilike("nombre", nombre)
    .maybeSingle()

  if (existingCity) {
    return {
      ok: false,
      message: MASTERS_MESSAGES.cityAlreadyExists,
      status: 409,
    }
  }

  const { data, error } = await supabaseAdmin
    .from("ciudades")
    .insert({
      nombre,
      departamento_id,
      estado: body.estado,
    })
    .select("id, nombre, estado, departamentos(nombre)")
    .single()

  if (error || !data) {
    console.error("Error al crear ciudad:", error)
    return {
      ok: false,
      message: MASTERS_MESSAGES.cityCreateFailed,
      status: 500,
    }
  }

  const dept = data.departamentos as { nombre: string } | { nombre: string }[] | null
  const departamento = Array.isArray(dept) ? dept[0]?.nombre : dept?.nombre

  return {
    ok: true,
    data: {
      id: data.id,
      nombre: data.nombre,
      estado: data.estado,
      departamento: departamento ?? department.nombre,
    },
  }
}
