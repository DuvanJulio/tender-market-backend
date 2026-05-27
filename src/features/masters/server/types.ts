import type { IGetCitiesResponse } from "../interfaces"

export type { IGetCitiesResponse }

export const MASTERS_MESSAGES = {
  citiesLoadFailed: "No se pudieron cargar las ciudades",
  citiesLoadSuccess: "Ciudades cargadas",
  departmentsLoadFailed: "No se pudieron cargar los departamentos",
  departmentsLoadSuccess: "Departamentos cargados",
  departmentNameRequired: "El nombre del departamento es requerido",
  departmentAlreadyExists: "Ya existe un departamento con ese nombre",
  departmentCreateFailed: "No se pudo crear el departamento",
  departmentCreateSuccess: "Departamento creado exitosamente",
  cityNameRequired: "El nombre de la ciudad es requerido",
  departmentRequired: "Debes seleccionar un departamento",
  departmentNotFound: "El departamento seleccionado no existe",
  cityAlreadyExists: "Ya existe una ciudad con ese nombre en el departamento",
  cityCreateFailed: "No se pudo crear la ciudad",
  cityCreateSuccess: "Ciudad creada exitosamente",
  cityNotFound: "La ciudad no existe",
  cityHasAddresses:
    "No se puede eliminar: hay direcciones asociadas a esta ciudad",
  cityDeleteFailed: "No se pudo eliminar la ciudad",
  cityDeleteSuccess: "Ciudad eliminada exitosamente",
  internalError: "Error interno del servidor",
} as const
