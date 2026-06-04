export type ICatalogoCategoriaTendero = {
  id: number
  nombre: string
  slug: string
  productos_count: number
}

export type ICatalogoProductoTendero = {
  id: number
  nombre: string
  proveedor: string
  proveedor_id: number
  categoria: string | null
  categoria_id: number | null
  precio: number
  stock: number
  imagen_url: string | null
  created_at: string
}

export type IGetCatalogoTenderoData = {
  categorias: ICatalogoCategoriaTendero[]
  productos: ICatalogoProductoTendero[]
  total_productos: number
  total_publicados: number
}

export type IGetCatalogoTenderoResponse = {
  success: boolean
  message: string
  data?: IGetCatalogoTenderoData
}
