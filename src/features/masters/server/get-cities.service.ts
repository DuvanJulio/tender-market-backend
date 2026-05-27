import { supabaseAdmin } from "@/lib/supabase/admin"
import type { ICityOption } from "../interfaces"
import { MASTERS_MESSAGES } from "./types"

type TGetCitiesServiceOptions = {
  includeInactive?: boolean
}

type TGetCitiesServiceResult =
  | { ok: true; data: ICityOption[] }
  | { ok: false; message: string; status: number }

type TRawCityWithDept = {
  id: number
  nombre: string
  estado: boolean
  departamentos: { nombre: string } | { nombre: string }[] | null
}

type TRawCityBasic = {
  id: number
  nombre: string
  estado?: boolean
}

function mapCityWithDepartment(row: TRawCityWithDept): ICityOption {
  const dept = row.departamentos
  const departamento = Array.isArray(dept) ? dept[0]?.nombre : dept?.nombre

  return {
    id: row.id,
    nombre: row.nombre,
    estado: row.estado,
    departamento: departamento ?? null,
  }
}

function mapCityBasic(row: TRawCityBasic): ICityOption {
  return {
    id: row.id,
    nombre: row.nombre,
    estado: row.estado ?? true,
    departamento: null,
  }
}

export async function getCitiesService(
  options?: TGetCitiesServiceOptions
): Promise<TGetCitiesServiceResult> {
  let queryWithDept = supabaseAdmin
    .from("ciudades")
    .select("id, nombre, estado, departamentos(nombre)")
    .order("nombre")

  if (!options?.includeInactive) {
    queryWithDept = queryWithDept.eq("estado", true)
  }

  const { data: withDept, error: withDeptError } = await queryWithDept

  if (!withDeptError && withDept) {
    return {
      ok: true,
      data: (withDept as TRawCityWithDept[]).map(mapCityWithDepartment),
    }
  }

  console.warn(
    "Ciudades con departamentos no disponible, usando consulta básica:",
    withDeptError?.message
  )

  let basicQuery = supabaseAdmin
    .from("ciudades")
    .select("id, nombre, estado")
    .order("nombre")

  if (!options?.includeInactive) {
    basicQuery = basicQuery.eq("estado", true)
  }

  const { data: basic, error: basicError } = await basicQuery

  if (basicError) {
    console.error("Error al cargar ciudades:", basicError)

    let legacyQuery = supabaseAdmin
      .from("ciudades")
      .select("id, nombre")
      .order("nombre")

    if (!options?.includeInactive) {
      legacyQuery = legacyQuery.eq("estado", true)
    }

    const { data: legacy, error: legacyError } = await legacyQuery

    if (legacyError) {
      return {
        ok: false,
        message: MASTERS_MESSAGES.citiesLoadFailed,
        status: 500,
      }
    }

    return {
      ok: true,
      data: (legacy ?? []).map((row) =>
        mapCityBasic({ ...row, estado: true })
      ),
    }
  }

  return {
    ok: true,
    data: (basic ?? []).map(mapCityBasic),
  }
}
