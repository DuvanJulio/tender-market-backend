import { resetPasswordHandler } from "@/features/auth/recovery/server"

export async function POST(request: Request) {
  return resetPasswordHandler(request)
}
