'use client'

import { RefreshCcw } from "lucide-react"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"


export const ButtonRefresh = () => {

    const router = useRouter();

    return(
        <Button onClick={() => router.refresh()} variant="outline" >
        <RefreshCcw className="mr-2" />
        Atualizar
      </Button>
    )
}