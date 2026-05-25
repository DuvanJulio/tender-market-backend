import { getCitiesHandler } from "@/features/masters/server"

export async function GET() {
  return getCitiesHandler()
}
