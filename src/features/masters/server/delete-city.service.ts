import { supabaseAdmin } from "@/lib/supabase/admin"
import { MASTERS_MESSAGES } from "./types"

type TDeleteCityServiceResult =
  | { ok: true; id: number }
  | { ok: false; message: string; status: number }

export async function deleteCityService(
  cityId: number
): Promise<TDeleteCityServiceResult> {
  if (!cityId || Number.isNaN(cityId)) {
    return {
      ok: false,
      message: MASTERS_MESSAGES.cityNotFound,
      status: 400,
    }
  }

  const { data: city } = await supabaseAdmin
    .from("ciudades")
    .select("id, nombre")
    .eq("id", cityId)
    .maybeSingle()

  if (!city) {
    return {
      ok: false,
      message: MASTERS_MESSAGES.cityNotFound,
      status: 404,
    }
  }

  const { count: addressesCount, error: addressesError } = await supabaseAdmin
    .from("direcciones")
    .select("id", { count: "exact", head: true })
    .eq("ciudad_id", cityId)

  if (addressesError) {
    console.error("Error al validar direcciones de la ciudad:", addressesError)
    return {
      ok: false,
      message: MASTERS_MESSAGES.cityDeleteFailed,
      status: 500,
    }
  }

  if ((addressesCount ?? 0) > 0) {
    return {
      ok: false,
      message: MASTERS_MESSAGES.cityHasAddresses,
      status: 409,
    }
  }

  const { error } = await supabaseAdmin
    .from("ciudades")
    .delete()
    .eq("id", cityId)

  if (error) {
    console.error("Error al eliminar ciudad:", error)
    return {
      ok: false,
      message: MASTERS_MESSAGES.cityDeleteFailed,
      status: 500,
    }
  }

  return { ok: true, id: cityId }
}
