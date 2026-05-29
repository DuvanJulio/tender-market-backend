export type TUserRole = "tendero" | "proveedor" | "admin"

export type TUserAccountStatus =
  | "activo"
  | "inactivo"
  | "bloqueado"
  | "pendiente"

export interface ISignInRequest {
  email: string
  password: string
}

export interface ISignInResponseData {
  token: string
  rol: TUserRole
}

export interface ISignInResponse {
  success: boolean
  message: string
  data?: ISignInResponseData
}

export interface IGetUserDataResponseData {
  isAuthenticated: boolean
  nombre?: string
  email?: string
  rol?: TUserRole
  /** Nombre de tienda (tendero) o empresa (proveedor). */
  negocio?: string
}

export interface IGetUserDataResponse {
  success: boolean
  message: string
  data?: IGetUserDataResponseData
}

/** @deprecated Usar TSignInFormData desde const/sign-in-schema */
export type SignInFormData = {
  email: string
  password: string
  rememberMe: boolean
}

/** @deprecated Usar ISignInResponse */
export type SignInResponse = ISignInResponse
