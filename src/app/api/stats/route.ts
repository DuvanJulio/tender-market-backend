import { getStatsHandler } from "@/features/stats/server"

export async function GET() {
  return getStatsHandler()
}
