import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

function getAllowedOrigins(): string[] {
  const fromEnv = (process.env.CORS_ALLOWED_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

  const frontendUrl = process.env.FRONTEND_URL?.trim()
  if (frontendUrl && !fromEnv.includes(frontendUrl)) {
    fromEnv.push(frontendUrl)
  }

  return fromEnv
}

function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
  if (allowedOrigins.includes(origin)) return true
  // Previews y producción en Vercel (*.vercel.app)
  if (origin.endsWith(".vercel.app")) return true
  return false
}

function resolveAllowedOrigin(request: NextRequest, allowedOrigins: string[]) {
  const origin = request.headers.get("origin")
  if (!origin) return allowedOrigins[0] ?? "*"
  return isOriginAllowed(origin, allowedOrigins) ? origin : allowedOrigins[0]
}

function withCors(
  request: NextRequest,
  response: NextResponse,
  allowedOrigins: string[]
) {
  const origin = resolveAllowedOrigin(request, allowedOrigins)
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
    const allowedOrigins = getAllowedOrigins()

    if (request.method === "OPTIONS") {
      return withCors(request, new NextResponse(null, { status: 204 }), allowedOrigins)
    }

    const response = NextResponse.next()
    return withCors(request, response, allowedOrigins)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*"],
}
