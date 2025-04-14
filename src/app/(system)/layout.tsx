import type React from "react"
import Header from "@/components/header"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Menu } from "lucide-react"

export const metadata = {
  title: "ERP System",
  description: "Sistema de gerenciamento de ordens de serviço",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider >
       <AppSidebar />
      <SidebarTrigger />
      <div className="flex h-screen overflow-hidden w-full">
       
        <div className="flex flex-col flex-1 overflow-hidden w-full">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 mx-auto w-full">
            {children}</main>
        </div>
      </div>

    </SidebarProvider>
  )
}

