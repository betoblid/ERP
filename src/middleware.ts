import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtDecode } from "jwt-decode"

interface DecodedToken {
  id: number
  role: string
  iat: number
  exp: number
}

// Páginas que não exigem autenticação
const publicPages = ["/login"]

// Controle de acesso baseado em função
const roleBasedAccess: Record<string, string[]> = {
  "/admin/usuarios": ["admin"],
  "/admin": ["admin"],
  "/funcionarios/editar/[id]": ["admin", "gerente"],
  "/produtos/editar/[id]": ["admin", "gerente"],
  "/clientes/editar/[id]": ["admin", "gerente"],
  "/clientes/cadastro":  ["admin", "gerente"],
  "/clientes":  ["admin", "gerente"],
  "/produtos":  ["admin", "gerente"],
  "/funcionarios":  ["admin", "gerente"],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verifique se a página é pública
  if (publicPages.includes(pathname)) {
    return NextResponse.next()
  }

  // Obter token de cookies
  const token = request.cookies.get("token")?.value

  // Se não houver token, redirecione para login
  if (!token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  try {
    // Verificar token
    const decoded = jwtDecode<DecodedToken>(token)
    const currentTime = Date.now() / 1000

    // Verifique se o token expirou
    if (decoded.exp < currentTime) {
      const url = new URL("/login", request.url)
      url.searchParams.set("from", pathname)
      return NextResponse.redirect(url)
    }

    // Verificar o acesso baseado em função
    for (const [path, roles] of Object.entries(roleBasedAccess)) {
      if (pathname.match(new RegExp(`^${path.replace(/\[.*?\]/g, "[^/]+")}$`))) {
        if (!roles.includes(decoded.role)) {
          return NextResponse.redirect(new URL("/unauthorized", request.url))
        }
      }
    }

    return NextResponse.next()
  } catch (error) {
    // Token inválido
    const url = new URL("/login", request.url)
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

