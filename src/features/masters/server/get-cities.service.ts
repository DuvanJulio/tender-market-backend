import { createClient } from "@/lib/supabase/server"
import type { ICityOption } from "../interfaces"
import { MASTERS_MESSAGES } from "./types"

type TGetCitiesServiceResult =
  | { ok: true; data: ICityOption[] }
  | { ok: false; message: string; status: number }

export async function getCitiesService(): Promise<TGetCitiesServiceResult> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("ciudades")
    .select("id, nombre")
    .eq("estado", true)
    .order("nombre")

  if (error) {
    console.error("Error al cargar ciudades:", error)
    return {
      ok: false,
      message: MASTERS_MESSAGES.citiesLoadFailed,
      status: 500,
    }
  }

  return { ok: true, data: data ?? [] }
}
