export type IPaginationMeta = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type IPaginatedResult<T> = {
  items: T[]
  pagination: IPaginationMeta
}

export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 50

export function parsePaginationSearchParams(
  searchParams: URLSearchParams
): { page: number; pageSize: number } {
  const pageRaw = Number.parseInt(searchParams.get("page") ?? "", 10)
  const pageSizeRaw = Number.parseInt(
    searchParams.get("pageSize") ?? searchParams.get("size") ?? "",
    10
  )

  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : DEFAULT_PAGE
  const pageSize =
    Number.isFinite(pageSizeRaw) && pageSizeRaw > 0
      ? Math.min(pageSizeRaw, MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE

  return { page, pageSize }
}

export function buildPaginationMeta(
  page: number,
  pageSize: number,
  total: number
): IPaginationMeta {
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize)
  return { page, pageSize, total, totalPages }
}

export function getPaginationRange(page: number, pageSize: number) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  return { from, to }
}
