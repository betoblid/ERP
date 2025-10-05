"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, CheckCircle, XCircle, ExternalLink, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function QuickBooksConfigPage() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [config, setConfig] = useState<any>(null)
  const [syncLogs, setSyncLogs] = useState<any[]>([])

  useEffect(() => {
    loadConfig()
    loadSyncLogs()

    // Check for OAuth callback results
    if (searchParams.get("success") === "true") {
      toast.success("QuickBooks conectado com sucesso!")
      loadConfig()
    } else if (searchParams.get("error")) {
      const errorType = searchParams.get("error")
      const errorMessages: Record<string, string> = {
        auth_failed: "Falha na autenticação. Tente novamente.",
        missing_params: "Parâmetros ausentes na resposta do QuickBooks.",
        true: "Erro ao conectar com QuickBooks. Verifique suas credenciais.",
      }
      toast.error(errorMessages[errorType] || "Erro desconhecido")
    }
  }, [searchParams])

  const loadConfig = async () => {
    try {
      const response = await fetch("/api/quickbooks/tokens")
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error("Error loading config:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSyncLogs = async () => {
    try {
      const response = await fetch("/api/sync-logs?limit=10")
      if (response.ok) {
        const data = await response.json()
        setSyncLogs(data)
      }
    } catch (error) {
      console.error("Error loading sync logs:", error)
    }
  }

  const handleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_QUICKBOOKS_CLIENT_ID
    const redirectUri = `${window.location.origin}/api/quickbooks/auth`
    const scope = "com.intuit.quickbooks.accounting"
    const state = Math.random().toString(36).substring(7)

    if (!clientId) {
      toast.error("QUICKBOOKS_CLIENT_ID não está configurado")
      return
    }

    const authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${state}`

    console.log("Redirecting to QuickBooks OAuth:", authUrl)
    window.location.href = authUrl
  }

  const handleSync = async (entityType?: string, entityId?: number) => {
    setIsSyncing(true)
    try {
      const response = await fetch("/api/quickbooks/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: entityType || "all",
          entityId,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success("Sincronização concluída com sucesso")
        console.log("Sync result:", result)
        loadSyncLogs()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Sync failed")
      }
    } catch (error) {
      console.error("Sync error:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao sincronizar com QuickBooks")
    } finally {
      setIsSyncing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Configuração QuickBooks"
        description="Gerencie a integração com QuickBooks Online"
        breadcrumbs={[{ label: "Configurações", href: "/configuracoes" }, { label: "QuickBooks" }]}
      />

      <div className="mt-6 space-y-6">
        {!process.env.NEXT_PUBLIC_QUICKBOOKS_CLIENT_ID && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Configuração Necessária</AlertTitle>
            <AlertDescription>
              As variáveis de ambiente do QuickBooks não estão configuradas. Configure QUICKBOOKS_CLIENT_ID,
              QUICKBOOKS_CLIENT_SECRET e QUICKBOOKS_REDIRECT_URI no arquivo .env
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Status da Integração</CardTitle>
            <CardDescription>Conecte sua conta QuickBooks para sincronizar dados financeiros</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {config?.isConfigured ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Conectado ao QuickBooks</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Realm ID: {config.realmId}</p>
                    <p className="text-sm text-muted-foreground">
                      Token expira em: {new Date(config.expiresAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <Button onClick={() => handleSync()} disabled={isSyncing}>
                    {isSyncing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sincronizando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Sincronizar Tudo
                      </>
                    )}
                  </Button>
                </div>

                <Alert>
                  <AlertTitle>Sincronização Automática</AlertTitle>
                  <AlertDescription>
                    Os dados são sincronizados automaticamente quando você cria ou atualiza clientes, produtos e
                    pedidos. Você também pode forçar uma sincronização completa usando o botão acima.
                  </AlertDescription>
                </Alert>
              </>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Não Conectado</AlertTitle>
                  <AlertDescription>
                    Você precisa conectar sua conta QuickBooks para usar os recursos de integração financeira.
                  </AlertDescription>
                </Alert>
                <Button onClick={handleConnect} disabled={!process.env.NEXT_PUBLIC_QUICKBOOKS_CLIENT_ID}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Conectar QuickBooks
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Sincronização</CardTitle>
            <CardDescription>Últimas sincronizações realizadas com o QuickBooks</CardDescription>
          </CardHeader>
          <CardContent>
            {syncLogs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma sincronização realizada ainda</p>
            ) : (
              <div className="space-y-3">
                {syncLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{log.entityType}</Badge>
                        <span className="text-sm">{log.action === "create" ? "Criado" : "Atualizado"}</span>
                        <span className="text-sm text-muted-foreground">ID: {log.entityId}</span>
                      </div>
                      {log.errorMessage && <p className="text-sm text-red-600">Erro: {log.errorMessage}</p>}
                      <p className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString("pt-BR")}</p>
                    </div>
                    <div>
                      {log.status === "success" ? (
                        <Badge className="bg-green-600">Sucesso</Badge>
                      ) : log.status === "error" ? (
                        <Badge variant="destructive">Erro</Badge>
                      ) : (
                        <Badge variant="secondary">Pendente</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sincronização Manual</CardTitle>
            <CardDescription>Force a sincronização de entidades específicas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => handleSync("cliente")}
                disabled={isSyncing || !config?.isConfigured}
              >
                Sincronizar Clientes
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSync("produto")}
                disabled={isSyncing || !config?.isConfigured}
              >
                Sincronizar Produtos
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSync("pedido")}
                disabled={isSyncing || !config?.isConfigured}
              >
                Sincronizar Pedidos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
