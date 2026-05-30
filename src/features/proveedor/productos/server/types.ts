export const PROVEEDOR_PRODUCTOS_MESSAGES = {
  loadSuccess: "Productos cargados",
  loadFailed: "No se pudieron cargar los productos",
  createSuccess: "Producto creado correctamente",
  createFailed: "No se pudo crear el producto",
  updateSuccess: "Producto actualizado",
  updateFailed: "No se pudo actualizar el producto",
  deleteSuccess: "Producto eliminado",
  deleteFailed: "No se pudo eliminar el producto",
  notFound: "Producto no encontrado",
  forbidden: "No tienes permiso sobre este producto",
  categoriaNotFound: "Categoría no encontrada",
  nombreRequired: "El nombre es obligatorio",
  categoriaRequired: "La categoría es obligatoria",
  precioInvalid: "El precio debe ser mayor a cero",
  stockInvalid: "El stock no puede ser negativo",
  internalError: "Error interno del servidor",
} as const

export const STOCK_BAJO_UMBRAL = 10
