import { checkEmailHandler } from "@/features/auth/email/server"

export async function POST(request: Request) {
  return checkEmailHandler(request)
}
