"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, BarChart, Clock, Package } from "lucide-react"

export default function RelatoriosPage() {
  const [periodoPresenca, setPeriodoPresenca] = useState("mes")
  const [periodoEstoque, setPeriodoEstoque] = useState("mes")
  const [periodoProdutividade, setPeriodoProdutividade] = useState("mes")

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>

      <Tabs defaultValue="presenca">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="presenca">Presença</TabsTrigger>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
          <TabsTrigger value="produtividade">Produtividade</TabsTrigger>
        </TabsList>

        <TabsContent value="presenca" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Relatório de Presença
              </CardTitle>
              <CardDescription>Visualize o histórico de presença dos funcionários</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Período</Label>
                  <Select value={periodoPresenca} onValueChange={setPeriodoPresenca}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semana">Última Semana</SelectItem>
                      <SelectItem value="mes">Último Mês</SelectItem>
                      <SelectItem value="trimestre">Último Trimestre</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {periodoPresenca === "personalizado" && (
                  <>
                    <div className="space-y-2">
                      <Label>Data Inicial</Label>
                      <div className="flex">
                        <Input type="date" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Data Final</Label>
                      <div className="flex">
                        <Input type="date" />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label>Funcionário</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os funcionários" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os funcionários</SelectItem>
                    <SelectItem value="joao">João Silva</SelectItem>
                    <SelectItem value="maria">Maria Oliveira</SelectItem>
                    <SelectItem value="pedro">Pedro Santos</SelectItem>
                    <SelectItem value="ana">Ana Costa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto border rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Funcionário</th>
                      <th className="text-center p-2">Dias Trabalhados</th>
                      <th className="text-center p-2">Horas Trabalhadas</th>
                      <th className="text-center p-2">Atrasos</th>
                      <th className="text-center p-2">Faltas</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">João Silva</td>
                      <td className="p-2 text-center">22</td>
                      <td className="p-2 text-center">176h</td>
                      <td className="p-2 text-center">1</td>
                      <td className="p-2 text-center">0</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Maria Oliveira</td>
                      <td className="p-2 text-center">21</td>
                      <td className="p-2 text-center">168h</td>
                      <td className="p-2 text-center">0</td>
                      <td className="p-2 text-center">1</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Pedro Santos</td>
                      <td className="p-2 text-center">22</td>
                      <td className="p-2 text-center">176h</td>
                      <td className="p-2 text-center">2</td>
                      <td className="p-2 text-center">0</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Ana Costa</td>
                      <td className="p-2 text-center">20</td>
                      <td className="p-2 text-center">160h</td>
                      <td className="p-2 text-center">0</td>
                      <td className="p-2 text-center">2</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Relatório
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estoque" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Relatório de Movimentação de Estoque
              </CardTitle>
              <CardDescription>Acompanhe a movimentação de produtos no estoque</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Período</Label>
                  <Select value={periodoEstoque} onValueChange={setPeriodoEstoque}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semana">Última Semana</SelectItem>
                      <SelectItem value="mes">Último Mês</SelectItem>
                      <SelectItem value="trimestre">Último Trimestre</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {periodoEstoque === "personalizado" && (
                  <>
                    <div className="space-y-2">
                      <Label>Data Inicial</Label>
                      <div className="flex">
                        <Input type="date" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Data Final</Label>
                      <div className="flex">
                        <Input type="date" />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as categorias</SelectItem>
                    <SelectItem value="cabos">Cabos</SelectItem>
                    <SelectItem value="equipamentos">Equipamentos</SelectItem>
                    <SelectItem value="conectores">Conectores</SelectItem>
                    <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto border rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Produto</th>
                      <th className="text-center p-2">Estoque Inicial</th>
                      <th className="text-center p-2">Entradas</th>
                      <th className="text-center p-2">Saídas</th>
                      <th className="text-center p-2">Estoque Atual</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">Cabo de Rede Cat6</td>
                      <td className="p-2 text-center">100</td>
                      <td className="p-2 text-center">50</td>
                      <td className="p-2 text-center">30</td>
                      <td className="p-2 text-center">120</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Roteador Wireless</td>
                      <td className="p-2 text-center">15</td>
                      <td className="p-2 text-center">5</td>
                      <td className="p-2 text-center">12</td>
                      <td className="p-2 text-center">8</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Switch 24 portas</td>
                      <td className="p-2 text-center">10</td>
                      <td className="p-2 text-center">10</td>
                      <td className="p-2 text-center">5</td>
                      <td className="p-2 text-center">15</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Conector RJ45</td>
                      <td className="p-2 text-center">200</td>
                      <td className="p-2 text-center">0</td>
                      <td className="p-2 text-center">195</td>
                      <td className="p-2 text-center">5</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Relatório
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="produtividade" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                Relatório de Produtividade
              </CardTitle>
              <CardDescription>Analise a produtividade dos funcionários</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Período</Label>
                  <Select value={periodoProdutividade} onValueChange={setPeriodoProdutividade}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semana">Última Semana</SelectItem>
                      <SelectItem value="mes">Último Mês</SelectItem>
                      <SelectItem value="trimestre">Último Trimestre</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {periodoProdutividade === "personalizado" && (
                  <>
                    <div className="space-y-2">
                      <Label>Data Inicial</Label>
                      <div className="flex">
                        <Input type="date" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Data Final</Label>
                      <div className="flex">
                        <Input type="date" />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="overflow-x-auto border rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Funcionário</th>
                      <th className="text-center p-2">OS Atendidas</th>
                      <th className="text-center p-2">Tempo Médio</th>
                      <th className="text-center p-2">Pontualidade</th>
                      <th className="text-center p-2">Satisfação</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">João Silva</td>
                      <td className="p-2 text-center">15</td>
                      <td className="p-2 text-center">2h 15min</td>
                      <td className="p-2 text-center">95%</td>
                      <td className="p-2 text-center">4.8/5</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Maria Oliveira</td>
                      <td className="p-2 text-center">12</td>
                      <td className="p-2 text-center">1h 45min</td>
                      <td className="p-2 text-center">100%</td>
                      <td className="p-2 text-center">4.9/5</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Pedro Santos</td>
                      <td className="p-2 text-center">18</td>
                      <td className="p-2 text-center">2h 30min</td>
                      <td className="p-2 text-center">90%</td>
                      <td className="p-2 text-center">4.5/5</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Ana Costa</td>
                      <td className="p-2 text-center">10</td>
                      <td className="p-2 text-center">3h 10min</td>
                      <td className="p-2 text-center">85%</td>
                      <td className="p-2 text-center">4.7/5</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Relatório
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
