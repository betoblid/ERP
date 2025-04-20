"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { DayPicker, type DateRange } from "react-day-picker"
import "react-day-picker/style.css";
import { useRouter, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerWithRangeProps {
  className?: string
}

export function DatePickerWithRange({ className }: DatePickerWithRangeProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Pegar datas da URL ou usar a data atual
  const dataInicioParam = searchParams.get("dataInicio")
  const dataFimParam = searchParams.get("dataFim")

  const hoje = new Date()
  const amanha = new Date(hoje)
  amanha.setDate(hoje.getDate() + 1)

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: dataInicioParam ? new Date(dataInicioParam) : hoje,
    to: dataFimParam ? new Date(dataFimParam) : amanha,
  })

  // Atualizar a URL quando o intervalo de datas mudar
  const handleDateChange = (range: DateRange | undefined) => {
    setDate(range)

    if (range?.from) {
      const params = new URLSearchParams(searchParams)
      params.set("dataInicio", format(range.from, "yyyy-MM-dd"))

      if (range.to) {
        params.set("dataFim", format(range.to, "yyyy-MM-dd"))
      } else {
        params.delete("dataFim")
      }

      router.push(`/agenda?${params.toString()}`)
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                  {format(date.to, "dd/MM/yyyy", { locale: ptBR })}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <DayPicker
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
