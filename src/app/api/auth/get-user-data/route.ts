import { getUserDataHandler } from "@/features/auth/sign-in/server"

export async function GET(request: Request) {
  return getUserDataHandler(request)
}
