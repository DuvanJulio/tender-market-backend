import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

function resolveAllowedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin")
  if (!origin) return ALLOWED_ORIGINS[0]
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
}

function withCors(request: NextRequest, response: NextResponse) {
  const origin = resolveAllowedOrigin(request)
  response.headers.set("Access-Control-Allow-Origin", origin)
  response.headers.set("Access-Control-Allow-Credentials", "true")
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  )
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  )
  return response
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api")) {
    if (request.method === "OPTIONS") {
      return withCors(request, new NextResponse(null, { status: 204 }))
    }

    const response = NextResponse.next()
    return withCors(request, response)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*"], 
}
