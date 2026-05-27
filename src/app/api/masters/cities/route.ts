import { getCitiesHandler, postCityHandler } from "@/features/masters/server"

export async function GET(request: Request) {
  return getCitiesHandler(request)
}

export async function POST(request: Request) {
  return postCityHandler(request)
}
