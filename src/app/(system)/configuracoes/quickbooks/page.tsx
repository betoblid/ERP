"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, RefreshCw, CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"

export default function QuickBooksConfigPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncLogs, setSyncLogs] = useState<any[]>([])
  const [config, setConfig] = useState<any>(null)

  useEffect(() => {
    checkConfiguration()
    loadSyncLogs()

    // Check for OAuth callback results
    const success = searchParams.get("success")
    const error = searchParams.get("error")

    if (success) {
      toast.success("QuickBooks conectado com sucesso!")
      router.replace("/configuracoes/quickbooks")
      checkConfiguration()
    }

    if (error) {
      toast.error(`Erro ao conectar: ${error}`)
      router.replace("/configuracoes/quickbooks")
    }
  }, [searchParams])

  const checkConfiguration = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/quickbooks/tokens")
      const data = await response.json()
      setIsConfigured(data.isConfigured)
      setConfig(data)
    } catch (error) {
      console.error("Error checking configuration:", error)
      toast.error("Erro ao verificar configuração")
    } finally {
      setIsLoading(false)
    }
  }

  const loadSyncLogs = async () => {
    try {
      const response = await fetch("/api/quickbooks/sync-logs?limit=10")
      const logs = await response.json()
      setSyncLogs(logs)
    } catch (error) {
      console.error("Error loading sync logs:", error)
    }
  }

  const handleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_QUICKBOOKS_CLIENT_ID
    const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_API_URL + "/api/quickbooks/auth")
    const scope = encodeURIComponent("com.intuit.quickbooks.accounting")
    const state = Math.random().toString(36).substring(7)

    const authUrl =
      process.env.NEXT_PUBLIC_QUICKBOOKS_ENVIRONMENT === "production"
        ? `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}&response_type=code&state=${state}`
        : `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}&response_type=code&state=${state}`

    window.location.href = authUrl
  }

  const handleSync = async (entityType: string) => {
    setIsSyncing(true)
    try {
      const response = await fetch("/api/quickbooks/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType }),
      })

      if (!response.ok) {
        throw new Error("Sync failed")
      }

      const result = await response.json()
      toast.success(`Sincronização de ${entityType} concluída!`)
      loadSyncLogs()
    } catch (error) {
      console.error("Sync error:", error)
      toast.error("Erro ao sincronizar")
    } finally {
      setIsSyncing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Configuração QuickBooks"
        description="Gerencie a integração com QuickBooks Online"
        breadcrumbs={[{ label: "Configurações", href: "/configuracoes" }, { label: "QuickBooks" }]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Status da Integração</CardTitle>
          <CardDescription>Conecte sua conta QuickBooks para sincronizar dados financeiros</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConfigured ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <p className="font-medium text-green-900 dark:text-green-100">Conectado</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Sua conta QuickBooks está conectada e pronta para sincronização.
                </p>
                {config?.realmId && (
                  <div>
                     <p className="text-xs text-green-600 dark:text-green-400 mt-1">Realm ID: {config.realmId}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">Token expira em: {new Date(config.expiresAt).toLocaleString("pt-BR")}</p>
                  </div>       
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => handleConnect()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reconectar
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <XCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div className="flex-1">
                <p className="font-medium text-yellow-900 dark:text-yellow-100">Não Conectado</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Você precisa conectar sua conta QuickBooks para usar os recursos de integração financeira.
                </p>
              </div>
            </div>
          )}

          <Button onClick={handleConnect} disabled={!isConfigured && isLoading}>
            <ExternalLink className="h-4 w-4 mr-2" />
            {isConfigured ? "Reconectar QuickBooks" : "Conectar QuickBooks"}
          </Button>
        </CardContent>
      </Card>

      {isConfigured && (
        <Card>
          <CardHeader>
            <CardTitle>Sincronização Manual</CardTitle>
            <CardDescription>Force a sincronização de dados específicos com o QuickBooks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" onClick={() => handleSync("cliente")} disabled={isSyncing}>
                {isSyncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Sincronizar Clientes
              </Button>
              <Button variant="outline" onClick={() => handleSync("produto")} disabled={isSyncing}>
                {isSyncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Sincronizar Produtos
              </Button>
              <Button variant="outline" onClick={() => handleSync("pedido")} disabled={isSyncing}>
                {isSyncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Sincronizar Pedidos
              </Button>
              <Button variant="outline" onClick={() => handleSync("all")} disabled={isSyncing}>
                {isSyncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Sincronizar Tudo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Sincronização</CardTitle>
          <CardDescription>Últimas sincronizações realizadas com o QuickBooks</CardDescription>
        </CardHeader>
        <CardContent>
          {syncLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma sincronização realizada ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {syncLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {log.status === "success" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium text-sm">
                        {log.action} {log.entityType}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString("pt-BR")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.quickbooksId && (
                      <Badge variant="outline" className="text-xs">
                        QB: {log.quickbooksId}
                      </Badge>
                    )}
                    <Badge variant={log.status === "success" ? "default" : "destructive"}>{log.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
