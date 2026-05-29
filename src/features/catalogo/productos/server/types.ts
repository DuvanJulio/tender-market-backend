export const PRODUCTOS_MESSAGES = {
  loadSuccess: "Productos cargados",
  loadFailed: "No se pudieron cargar los productos",
  updateSuccess: "Estado del producto actualizado",
  updateFailed: "No se pudo actualizar el producto",
  deleteSuccess: "Producto eliminado correctamente",
  deleteFailed: "No se pudo eliminar el producto",
  notFound: "Producto no encontrado",
  invalidEstado: "Estado no válido",
  onlyBorradorCanModerate:
    "Solo se pueden aprobar o rechazar productos en estado pendiente",
  internalError: "Error interno del servidor",
} as const
