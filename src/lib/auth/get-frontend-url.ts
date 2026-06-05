export function getFrontendUrl(): string {
  const url =
    process.env.FRONTEND_URL?.trim() ??
    process.env.NEXT_PUBLIC_APP_URL?.trim() ??
    "http://localhost:3000"

  return url.replace(/\/$/, "")
}
