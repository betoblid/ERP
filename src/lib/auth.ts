import { jwtDecode } from "jwt-decode"
import type { User } from "@/@types"


interface DecodedToken {
  id: number
  role: string
  iat: number
  exp: number
}



export const setToken = (token: string): void => {

  console.log("Setting token:", token) // Log the token being set
  if (typeof window !== "undefined") {
    sessionStorage.setItem("token", token)
  }

}

export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("token")
  }
  return null
}

export const removeToken = (): void => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("user")
  }
}

export const setUser = (user: User): void => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("user", JSON.stringify(user))
  }
}

export const getUser = (): User | null => {
  if (typeof window !== "undefined") {
    const user = sessionStorage.getItem("user")
    return user ? JSON.parse(user) : null
  }
  return null
}

export const isTokenValid = (): boolean => {
  const token = getToken()
  if (!token) return false

  try {
    const decoded = jwtDecode<DecodedToken>(token)
    const currentTime = Date.now() / 1000
    return decoded.exp > currentTime
  } catch (error) {
    return false
  }
}

export const getUserRole = (): string | null => {
  const user = getUser()
  return user ? user.role : null
}

export const hasPermission = (requiredRoles: string[]): boolean => {
  const role = getUserRole()
  return role ? requiredRoles.includes(role) : false
}

