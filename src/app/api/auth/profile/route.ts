import { patchProfileHandler } from "@/features/auth/profile/server"

export async function PATCH(request: Request) {
  return patchProfileHandler(request)
}
