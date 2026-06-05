export interface ICheckEmailRequest {
  email: string
}

export interface ICheckEmailResponse {
  success: boolean
  message: string
  data?: {
    available: boolean
  }
}
