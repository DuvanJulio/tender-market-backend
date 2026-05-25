import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { User } from "@supabase/supabase-js"

export async function getAuthUserFromRequest(
  request: Request
): Promise<User | null> {
  const authorization = request.headers.get("Authorization")

  if (authorization?.startsWith("Bearer ")) {
    const token = authorization.slice(7)
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) return null
    return data.user
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return data.user
}
