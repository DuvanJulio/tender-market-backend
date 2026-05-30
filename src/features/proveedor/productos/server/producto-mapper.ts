import type { IProductoProveedor } from "../interfaces"

type TRawProducto = {
  id: number
  nombre: string
  precio_mayorista: number
  stock: number
  estado: string
  imagen_url: string | null
  categoria_id: number
  categorias:
    | { nombre: string }
    | { nombre: string }[]
    | null
}

export function mapProductoProveedor(row: TRawProducto): IProductoProveedor {
  const cat = row.categorias
  const categoria = Array.isArray(cat) ? cat[0]?.nombre ?? null : cat?.nombre ?? null

  return {
    id: row.id,
    nombre: row.nombre,
    categoria_id: row.categoria_id,
    categoria,
    precio: Number(row.precio_mayorista),
    stock: row.stock ?? 0,
    estado: row.estado as IProductoProveedor["estado"],
    imagen_url: row.imagen_url,
  }
}
