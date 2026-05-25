import type { TBaseResponse } from "@/types/base-respnse"
import type { ICityOption } from "./city"

export type { ICityOption }

export type IGetCitiesResponse = TBaseResponse<ICityOption[]>
