import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Package, User2, ChevronUp } from "lucide-react"
import Link from "next/link"
import { getCookies } from "@/lib/getCookies"
import { User } from "@/@types"
import { SidebarRoutes } from "./SidebarRoutes" // <-- componente client-side novo

export const GetUser = async (): Promise<User> => {
  const token = await getCookies()
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}me`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
  const data = await response.json()
  return data
}

export async function AppSidebar() {
  const user = await GetUser()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" className="flex items-center py-4 overflow-hidden">
              <div className="relative w-8 h-8 mr-4 rounded-full bg-primary flex items-center justify-center">
                <Package size={20} />
              </div>
              <h1 className="text-xl font-bold truncate hidden md:inline">ERP System</h1>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>ERP System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarRoutes />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="w-full list-none">
        <SidebarMenuItem >
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full py-2 hover:bg-slate-600 rounded-md px-2">
              <SidebarMenuItem className="flex items-center justify-between">
                <User2 className="inline" />
                <span className="inline">{user.username}</span>
                <ChevronUp className="ml-auto inline" />
              </SidebarMenuItem>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" >
              <div className="flex items-center p-2 space-x-2">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{user.username}</span>
                  <span className="text-xs text-gray-500">{user.role}</span>
                </div>
              </div>
              {/* <Link href="/perfil" className="block px-4 py-2 text-sm hover:bg-slate-600">Perfil</Link> */}
              <Link href="/admin" className="block px-4 py-2 text-sm hover:bg-slate-600">Configurações</Link>
              <Link href="/sair" className="block px-4 py-2 text-sm text-red-500 hover:bg-slate-600">Sair</Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  )
}
