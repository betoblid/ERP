"use client"

import { useState } from "react"
import { DayPicker } from "react-day-picker"
import { ptBR } from "date-fns/locale"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"

import "react-day-picker/dist/style.css"

// Dias com ordens de serviço (simulação)
const diasComOS = [
  new Date(2023, 5, 2),
  new Date(2023, 5, 5),
  new Date(2023, 5, 10),
  new Date(2023, 5, 15),
  new Date(2023, 5, 20),
  new Date(2023, 5, 25),
  new Date(2023, 5, 28),
  new Date(), // Hoje
]

export function CalendarioLateral() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Pegar a data da URL ou usar a data atual
  const dataParam = searchParams.get("data")
  const dataInicial = dataParam ? new Date(dataParam) : new Date()

  const [selected, setSelected] = useState<Date>(dataInicial)

  // Função para destacar dias com OS
  const isDayWithOS = (date: Date) => {
    return diasComOS.some(
      (d) =>
        d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear(),
    )
  }

  // Estilo para dias com OS
  const modifiers = {
    hasOS: diasComOS,
  }

  const modifiersStyles = {
    hasOS: {
      backgroundColor: "#0f190f",
      borderRadius: "100%",
      fontWeight: "bold",
    },
  }

  // Atualizar a URL quando uma data for selecionada
  const handleDayClick = (day: Date | undefined) => {
    if (!day) return

    setSelected(day)

    // Atualizar a URL com a data selecionada
    const formattedDate = format(day, "yyyy-MM-dd")
    const params = new URLSearchParams(searchParams)
    params.set("data", formattedDate)

    router.push(`/agenda?${params.toString()}`)
  }

  return (
    <div className="w-full relative">
      <style jsx global>{`
        .rdp {
          --rdp-accent-color: #3b82f6;
          --rdp-background-color: #e0f2fe;
          margin: 0;
        }
        .rdp-day_today {
          border: 2px solid #3b82f6;
        }
      `}</style>

      <DayPicker
        mode="single"
        selected={selected}
        onSelect={handleDayClick}
        locale={ptBR}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        showOutsideDays
        className="text-center"
      />


    </div>
  )
}
