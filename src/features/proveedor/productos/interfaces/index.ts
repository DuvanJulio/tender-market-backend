import type { TProductoEstadoDb } from "@/features/catalogo/productos/interfaces"

export type IProductoProveedor = {
  id: number
  nombre: string
  categoria_id: number
  categoria: string | null
  precio: number
  stock: number
  estado: TProductoEstadoDb
  imagen_url: string | null
}

export type IProductosProveedorSummary = {
  total: number
  activos: number
  pendientes: number
  inactivos: number
  bajo_stock: number
}

export type IPaginationMeta = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type IPaginatedProductosProveedor = {
  items: IProductoProveedor[]
  pagination: IPaginationMeta
}

export type IGetProductosProveedorResponse = {
  success: boolean
  message: string
  data?: {
    productos: IPaginatedProductosProveedor
    summary: IProductosProveedorSummary
  }
}

export type IGetProductoProveedorResponse = {
  success: boolean
  message: string
  data?: IProductoProveedor
}

export type TPostProductoProveedorBody = {
  nombre: string
  categoria_id: number
  precio_mayorista: number
  stock: number
  imagen_url?: string | null
}

export type TPatchProductoProveedorBody = {
  nombre?: string
  categoria_id?: number
  precio_mayorista?: number
  stock?: number
  imagen_url?: string | null
  estado?: "borrador" | "inactivo"
}

export type IPostProductoProveedorResponse = {
  success: boolean
  message: string
  data?: IProductoProveedor
}

export type IPatchProductoProveedorResponse = {
  success: boolean
  message: string
  data?: IProductoProveedor
}

export type IDeleteProductoProveedorResponse = {
  success: boolean
  message: string
  data?: { id: number }
}
