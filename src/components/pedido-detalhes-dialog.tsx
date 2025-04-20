"use client"

import type React from "react"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Clock, MapPin, User, Package, Trash2, Edit, AlertTriangle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { usePedidos } from "@/hooks/use-pedidos"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Pedido } from "@/@types"

interface PedidoDetalhesDialogProps {
    pedido: Pedido
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function PedidoDetalhesDialog({
    pedido,
    trigger,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
}: PedidoDetalhesDialogProps) {
    const [open, setOpen] = useState(false)
    const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined

    const router = useRouter()
    const { deletarPedido } = usePedidos()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleOpenChange = (newOpen: boolean) => {
        if (isControlled) {
            setControlledOpen(newOpen)
        } else {
            setOpen(newOpen)
        }
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deletarPedido(pedido.id.toString())
            toast(`O pedido #${pedido.id} foi excluído.`)
            handleOpenChange(false)
        } catch (error) {
            console.error("Erro ao excluir pedido:", error)
            toast("Ocorreu um erro ao processar sua solicitação. Tente novamente.");
        } finally {
            setIsDeleting(false)
        }
    }

    const handleEdit = () => {
        router.push(`/pedido/editar/${pedido.id}`)
         handleOpenChange(false)

      
    }

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<
            string,
            { label: string; variant: "default" | "outline" | "secondary" | "destructive" }
        > = {
            agendado: { label: "Agendado", variant: "outline" },
            em_andamento: { label: "Em Andamento", variant: "default" },
            concluido: { label: "Concluído", variant: "secondary" },
            cancelado: { label: "Cancelado", variant: "destructive" },
            entregue: { label: "Entregue", variant: "secondary" },
            retirado: { label: "Retirado", variant: "secondary" },
        }

        const config = statusConfig[status] || statusConfig.agendado

        return <Badge variant={config.variant}>{config.label}</Badge>
    }

    // Calcular o valor total do pedido
    const calcularTotal = () => {
        return pedido.itens.reduce((total, item) => {
            return total + item.quantidade * item.precoUnitario
        }, 0)
    }

    return (
        <Dialog open={isControlled ? controlledOpen : open} onOpenChange={handleOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Detalhes do Pedido #{pedido.id}</DialogTitle>
                    <DialogDescription>Informações completas sobre o pedido.</DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    {/* Cabeçalho do pedido */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {
                             !pedido.ocorrencias && (
                                <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium">Status: {getStatusBadge(pedido.status)}</h3>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{format(new Date(pedido.data), "dd/MM/yyyy", { locale: ptBR })}</span>
                                    <Clock className="ml-2 h-3.5 w-3.5" />
                                    <span>{pedido.horario}</span>
                                </div>
                            </div>
                             )
                        }
                        {/* {caso tenha ocorrido uma entrega ou retirada, exibe o status e a data/hora da ocorrência} */}
                        {
                            // pedido.ocorrencias && (
                            //     <div>sf
                            //         <div className="flex items-center gap-2">
                            //             <h3 className="font-medium">Status: {getStatusBadge(pedido.ocorrencias[0].status)}</h3>
                            //         </div>
                            //         <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            //             <Calendar className="h-3.5 w-3.5" />
                            //             <span>{format(new Date(pedido.data), "dd/MM/yyyy", { locale: ptBR })}</span>
                            //             <Clock className="ml-2 h-3.5 w-3.5" />
                            //             <span>{pedido.horario}</span>
                            //         </div>
                            //     </div>
                            // )
                        }
                    </div>

                    <Separator />

                    {/* Informações do cliente */}
                    <div>
                        <h4 className="text-sm font-medium mb-2">Informações do Cliente</h4>
                        <div className="space-y-2">
                            <div className="flex items-start gap-2">
                                <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">{pedido.cliente?.nome}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {pedido.cliente?.documento}: {pedido.cliente?.documento}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm">{pedido.endereco}</p>
                                    <p className="text-xs text-muted-foreground">Local de Entrega/Retirada</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Itens do pedido */}
                    <div>
                        <h4 className="text-sm font-medium mb-2">Itens do Pedido</h4>
                        <div className="space-y-2">
                            {pedido.itens.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm">{item.produto?.nome}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.quantidade} x R$ {item.precoUnitario.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="font-medium">R$ {(item.quantidade * item.precoUnitario).toFixed(2)}</p>
                                </div>
                            ))}

                            <div className="flex justify-between items-center pt-2 mt-2 border-t">
                                <p className="font-medium">Total</p>
                                <p className="font-bold">R$ {calcularTotal().toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex justify-between">
                    <div className="flex gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={isDeleting}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o pedido #{pedido.id}.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                                        {isDeleting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Excluindo...
                                            </>
                                        ) : (
                                            <>
                                                <AlertTriangle className="mr-2 h-4 w-4" />
                                                Sim, excluir
                                            </>
                                        )}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <Button variant="outline" size="sm" onClick={handleEdit}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </Button>
                    </div>

                    <Button variant="outline" onClick={() => handleOpenChange(false)}>
                        Fechar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
