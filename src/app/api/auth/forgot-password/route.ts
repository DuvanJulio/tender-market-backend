import { forgotPasswordHandler } from "@/features/auth/recovery/server"

export async function POST(request: Request) {
  return forgotPasswordHandler(request)
}
