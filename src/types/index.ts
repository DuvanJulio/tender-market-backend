export type TBaseResponse<T> = {
  success: boolean
  message: string
  data?: T
}
