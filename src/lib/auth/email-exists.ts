import { supabaseAdmin } from "@/lib/supabase/admin"

export async function emailExistsInAuth(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase()
  if (!normalized) return false

  let page = 1
  const perPage = 1000

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    })

    if (error) {
      console.error("Error al buscar email en auth:", error)
      throw error
    }

    const found = data.users.some(
      (user) => user.email?.trim().toLowerCase() === normalized
    )
    if (found) return true

    if (data.users.length < perPage) return false
    page += 1
  }
}
