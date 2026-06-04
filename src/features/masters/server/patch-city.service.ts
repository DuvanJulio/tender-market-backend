import { supabaseAdmin } from "@/lib/supabase/admin"
import type { ICityOption, TPatchCityBody } from "../interfaces"
import { MASTERS_MESSAGES } from "./types"

type TPatchCityServiceResult =
  | { ok: true; data: ICityOption }
  | { ok: false; message: string; status: number }

export async function patchCityService(
  cityId: number,
  body: TPatchCityBody
): Promise<TPatchCityServiceResult> {
  if (!cityId || Number.isNaN(cityId)) {
    return {
      ok: false,
      message: MASTERS_MESSAGES.cityNotFound,
      status: 404,
    }
  }

  const { data: existing } = await supabaseAdmin
    .from("ciudades")
    .select("id, nombre, departamento_id, estado")
    .eq("id", cityId)
    .maybeSingle()

  if (!existing) {
    return {
      ok: false,
      message: MASTERS_MESSAGES.cityNotFound,
      status: 404,
    }
  }

  const nombre =
    body.nombre !== undefined ? body.nombre.trim() : existing.nombre
  const departamento_id =
    body.departamento_id !== undefined
      ? Number(body.departamento_id)
      : existing.departamento_id
  const estado =
    body.estado !== undefined ? body.estado : existing.estado

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

  const { data: duplicate } = await supabaseAdmin
    .from("ciudades")
    .select("id")
    .eq("departamento_id", departamento_id)
    .ilike("nombre", nombre)
    .neq("id", cityId)
    .maybeSingle()

  if (duplicate) {
    return {
      ok: false,
      message: MASTERS_MESSAGES.cityAlreadyExists,
      status: 409,
    }
  }

  const { data, error } = await supabaseAdmin
    .from("ciudades")
    .update({
      nombre,
      departamento_id,
      estado,
    })
    .eq("id", cityId)
    .select("id, nombre, estado, departamento_id, departamentos(nombre)")
    .single()

  if (error || !data) {
    console.error("Error al actualizar ciudad:", error)
    return {
      ok: false,
      message: MASTERS_MESSAGES.cityUpdateFailed,
      status: 500,
    }
  }

  const dept = data.departamentos as
    | { nombre: string }
    | { nombre: string }[]
    | null
  const departamento = Array.isArray(dept) ? dept[0]?.nombre : dept?.nombre

  return {
    ok: true,
    data: {
      id: data.id,
      nombre: data.nombre,
      estado: data.estado,
      departamento_id: data.departamento_id,
      departamento: departamento ?? department.nombre,
    },
  }
}
