export type ICategoriaRow = {
  id: number
  nombre: string
  slug: string
  categoria_padre_id: number | null
  estado: boolean
}

export type ICategoriaSubAdmin = {
  id: number
  nombre: string
  productos: number
}

export type ICategoriaAdmin = {
  id: number
  nombre: string
  slug: string
  productos: number
  subcategorias: ICategoriaSubAdmin[]
  estado: boolean
}

export type IGetCategoriasResponse = {
  success: boolean
  message: string
  data?: ICategoriaAdmin[]
}

export type TPostCategoriaBody = {
  nombre: string
  slug?: string
  categoria_padre_id?: number | null
}

export type ICategoriaCreated = {
  id: number
  nombre: string
  slug: string
  categoria_padre_id: number | null
  estado: boolean
}

export type IPostCategoriaResponse = {
  success: boolean
  message: string
  data?: ICategoriaCreated
}

export type IDeleteCategoriaResponse = {
  success: boolean
  message: string
  data?: { id: number }
}
