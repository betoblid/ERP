"use client"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { Home, Users, Package, Truck, UserCircle, LogOut, Clock, Calendar, BarChart4 } from "lucide-react"

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
    sub: [
      {
        label: "Funcionários",
        href: "/funcionarios",
      },
      {
        label: "Novo Funcionário",
        href: "/funcionarios/cadastro",
      },
    ]
  },
  {
    label: "Produtos",
    icon: Package,
    href: "/produtos",
    color: "text-pink-700",
    sub: [
        {
          label: "Produtos",
          href: "/produtos",
        },
        {
          label: "Novo Produto",
          href: "/produtos/cadastro",
        },
      ]
  },
  {
    label: "Orden de Serviço",
    icon: Truck,
    href: "/ordens-de-servico",
    color: "text-blue-500",
    sub: [
      {
        label: "Pedido",
        href: "/pedido",
      },
      {
        label: "Novo Pedido",
        href: "/pedido/cadastro",
      },
      {
        label: "Entregas",
        href: "/entregas",
      },
    ]
  },
  {
    label: "Clientes",
    icon: UserCircle,
    href: "/clientes",
    color: "text-orange-500",
    sub: [
        {
          label: "Clientes",
          href: "/clientes",
        },
        {
          label: "Novo Cliente",
          href: "/clientes/cadastro",
        },
      ]
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

export function SidebarRoutes() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const toggleItem = (label: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  return (
    <SidebarMenu>
      {routes.map((item) => (
        <SidebarMenuItem key={item.label}>
          {item.sub ? (
            <>
              <SidebarMenuButton onClick={() => toggleItem(item.label)} className="cursor-pointer">
                <item.icon className={`mr-2 ${item.color}`} size={18} />
                {item.label}
                {openItems[item.label] ? <ChevronUp className="ml-auto" /> : <ChevronDown className="ml-auto" />}
              </SidebarMenuButton>
              {openItems[item.label] && (
                <SidebarMenuSub>
                  {item.sub.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.href}>
                      <SidebarMenuSubButton className="cursor-pointer" href={subItem.href}>
                       {subItem.label}
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              )}
            </>
          ) : (
            <Link href={item.href} className="w-full">
              <SidebarMenuButton className="w-full cursor-pointer">
                <item.icon className={`mr-2 ${item.color}`} size={18} />
                {item.label}
              </SidebarMenuButton>
            </Link>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
