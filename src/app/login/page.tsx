'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { FiUser, FiLock } from "react-icons/fi"
import api from "@/lib/api"
import { setToken, setUser } from "@/lib/auth"
import type { AuthResponse } from "@/@types"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"


const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function Login() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const from = searchParams.get("from") //capturado URL

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const response = await api.post("login", data)
      const { token, user } = response.data

      // salvar token e user data
      setToken(token)
      setUser(user)

      // Set token in cookie for middleware
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
   
      toast.success("Login realizado com sucesso!")

      // Redirect to the page the user was trying to access or to the dashboard
      router.push(from ? String(from) : "/")

    } catch (error: any) {

      toast.error(error.response?.data?.message || "Erro ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-100 p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">ERP System</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Entre com suas credenciais para acessar o sistema</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="form-group">
              <label htmlFor="email" className="form-label text-gray-900">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="form-input pl-10 text-gray-950 bg-slate-200 border-gray-500 border-2 rounded-md w-full py-2"
                  placeholder="Email"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form-label text-gray-900">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="form-input pl-10 text-gray-950 bg-slate-200 border-gray-500 border-2 rounded-md w-full py-2"
                  placeholder="Senha"
                  {...register("password")}
                />
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

