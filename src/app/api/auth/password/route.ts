import { patchPasswordHandler } from "@/features/auth/profile/server"

export async function PATCH(request: Request) {
  return patchPasswordHandler(request)
}
