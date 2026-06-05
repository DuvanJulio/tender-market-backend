export interface IForgotPasswordRequest {
  email: string
}

export interface IForgotPasswordResponse {
  success: boolean
  message: string
}

export interface IResetPasswordRequest {
  password: string
  access_token?: string
  refresh_token?: string
  token_hash?: string
}

export interface IResetPasswordResponse {
  success: boolean
  message: string
}
