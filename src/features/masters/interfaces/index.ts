import type { TBaseResponse } from "@/types/base-respnse"
import type { ICityOption } from "./city"
import type { IDepartmentOption } from "./department"

export type { ICityOption, IDepartmentOption }

export type IGetCitiesResponse = TBaseResponse<ICityOption[]>
export type IGetDepartmentsResponse = TBaseResponse<IDepartmentOption[]>
export type IPostDepartmentResponse = TBaseResponse<IDepartmentOption>
export type IPostCityResponse = TBaseResponse<ICityOption>
export type IDeleteCityResponse = TBaseResponse<{ id: number }>

export type TPostDepartmentBody = {
  nombre: string
}

export type TPostCityBody = {
  nombre: string
  departamento_id: number
  estado: boolean
}
