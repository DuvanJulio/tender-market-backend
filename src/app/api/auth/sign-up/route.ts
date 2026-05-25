import { signUpHandler } from "@/features/auth/sign-up/server"

export async function POST(request: Request) {
  return signUpHandler(request)
}
