export type IPatchProfileBody = {
  email?: string
  telefono?: string
}

export type IPatchPasswordBody = {
  current_password: string
  new_password: string
}

export type IPatchProfileResponseData = {
  email?: string
  telefono?: string
}

export type IPatchProfileResponse = {
  success: boolean
  message: string
  data?: IPatchProfileResponseData
}

export type IPatchPasswordResponse = {
  success: boolean
  message: string
}
