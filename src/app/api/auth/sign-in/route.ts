import { signInHandler } from "@/features/auth/sign-in/server"

export async function POST(request: Request) {
  return signInHandler(request)
}