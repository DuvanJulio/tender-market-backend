export type TProductoEstadoDb = "borrador" | "publicado" | "inactivo"

export type IProductoAdmin = {
  id: number
  nombre: string
  proveedor: string | null
  categoria: string | null
  precio: number
  stock: number
  estado: TProductoEstadoDb
  imagen_url: string | null
}

export type IProductosSummary = {
  total: number
  activos: number
  pendientes: number
  rechazados: number
}

export type IPaginationMeta = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type IPaginatedProductosAdmin = {
  items: IProductoAdmin[]
  pagination: IPaginationMeta
}

export type IGetProductosAdminResponse = {
  success: boolean
  message: string
  data?: {
    productos: IPaginatedProductosAdmin
    summary: IProductosSummary
  }
}

export type TPatchProductoEstadoBody = {
  estado: "publicado" | "inactivo"
}

export type IPatchProductoEstadoResponse = {
  success: boolean
  message: string
  data?: { id: number; estado: TProductoEstadoDb }
}

export type IDeleteProductoResponse = {
  success: boolean
  message: string
  data?: { id: number }
}
