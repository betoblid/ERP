"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Package, UserCircle, BarChart4, Calendar, Clock, MapPin, LogOut, Home } from "lucide-react"
import { cn } from "@/lib/utils"

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "Funcionários",
    icon: Users,
    href: "/funcionarios",
    color: "text-violet-500",
  },
  {
    label: "Produtos",
    icon: Package,
    href: "/produtos",
    color: "text-pink-700",
  },
  {
    label: "Clientes",
    icon: UserCircle,
    href: "/clientes",
    color: "text-orange-500",
  },
  {
    label: "Retirada",
    icon: LogOut,
    href: "/retirada",
    color: "text-emerald-500",
  },
  {
    label: "Check-in/out",
    icon: MapPin,
    href: "/checkin",
    color: "text-green-700",
  },
  {
    label: "Ponto",
    icon: Clock,
    href: "/ponto",
    color: "text-rose-500",
  },
  {
    label: "Agenda",
    icon: Calendar,
    href: "/agenda",
    color: "text-blue-500",
  },
  {
    label: "Relatórios",
    icon: BarChart4,
    href: "/relatorios",
    color: "text-yellow-500",
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex h-full flex-col bg-gray-900 text-white shadow-lg w-60">
      <div className="px-3 py-4 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-8">
          <div className="relative w-8 h-8 mr-4 rounded-full bg-primary flex items-center justify-center">
            <Package size={20} />
          </div>
          <h1 className="text-xl font-bold">ERP System</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-gray-800 rounded-lg transition",
                pathname === route.href ? "bg-gray-800" : "text-zinc-400",
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

