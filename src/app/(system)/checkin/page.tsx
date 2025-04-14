"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Check, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"

// Dados simulados de ordens de serviço
const ordensServico = [
  {
    id: "OS-2023-001",
    cliente: "Empresa ABC",
    endereco: "Av. Paulista, 1000, São Paulo - SP",
    horario: "09:00",
    coordenadas: { lat: -23.5505, lng: -46.6333 },
  },
  {
    id: "OS-2023-002",
    cliente: "Comércio XYZ",
    endereco: "Av. Brasil, 500, Belo Horizonte - MG",
    horario: "14:00",
    coordenadas: { lat: -19.9167, lng: -43.9345 },
  },
  {
    id: "OS-2023-003",
    cliente: "João da Silva",
    endereco: "Rua das Flores, 123, Rio de Janeiro - RJ",
    horario: "10:30",
    coordenadas: { lat: -22.9068, lng: -43.1729 },
  },
]

export default function CheckinPage() {
  const [selectedOs, setSelectedOs] = useState("");
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [checkInStatus, setCheckInStatus] = useState<{
    status: "success" | "error" | "warning" | null;
    message: string;
  } | null>(null);

  // Atualiza o horário atual a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Obter localização atual
  const getLocation = () => {
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError("Geolocalização não é suportada pelo seu navegador");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        let errorMessage = "Erro desconhecido ao obter localização";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permissão para geolocalização negada";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Informação de localização indisponível";
            break;
          case error.TIMEOUT:
            errorMessage = "Tempo esgotado ao obter localização";
            break;
        }
        
        setLocationError(errorMessage);
      }
    );
  };

  // Verificar se o check-in pode ser realizado
  const verificarCheckin = () => {
    if (!selectedOs || !currentLocation) {
      toast("Selecione uma OS e obtenha sua localização atual");
      return;
    }
    
    const ordemSelecionada = ordensServico.find(os => os.id === selectedOs);
    
    if (!ordemSelecionada) {
      setCheckInStatus({
        status: "error",
        message: "Ordem de serviço não encontrada",
      });
      return;
    }
    
    // Verificar distância (simulado)
    const distance = Math.sqrt(
      Math.pow(ordemSelecionada.coordenadas.lat - currentLocation.lat, 2) +
      Math.pow(ordemSelecionada.coordenadas.lng - currentLocation.lng, 2)
    );
    
    // Verificar horário
    const osHoraParts = ordemSelecionada.horario.split(':');
    const osHora = Number.parseInt(osHoraParts[0]);
    const osMinuto = Number.parseInt(osHoraParts[1]);
    
    const currentHora = currentTime.getHours();
    const currentMinuto = currentTime.getMinutes();
    
    // Diferença em minutos
    const diffMinutos = (currentHora * 60 + currentMinuto) - (osHora * 60 + osMinuto);
    
    if (distance > 0.1) { // Valor arbitrário para simulação
      setCheckInStatus({
        status: "error",
        message: "Você não está no local correto para realizar o check-in",
      });
    } else if (diffMinutos < -30) {
      setCheckInStatus({
        status: "warning",
        message: `Você está muito adiantado. O horário agendado é ${ordemSelecionada.horario}`,
      });
    } else if (diffMinutos > 30) {
      setCheckInStatus({
        status: "warning",
        message: `Você está atrasado. O horário agendado era ${ordemSelecionada.horario}`,
      });
    } else {
      setCheckInStatus({
        status: "success",
        message: "Você pode realizar o check-in agora!",
      });
    }
  };

  const realizarCheckin = () => {
    if (checkInStatus?.status === "success" || checkInStatus?.status === "warning") {
      const now = new Date();
      const formattedDate = now.toLocaleDateString('pt-BR');
      const formattedTime = now.toLocaleTimeString('pt-BR');
      
      toast(`Check-in registrado em ${formattedDate} às ${formattedTime}`);
      
      // Limpar o formulário
      setSelectedOs("");
      setCurrentLocation(null);
      setCheckInStatus(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Check-in / Check-out</h1>

      <Card>
        <CardHeader>
          <CardTitle>Registro de Presença</CardTitle>
          <CardDescription>
            Registre sua presença no local da ordem de serviço
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="os">Ordem de Serviço</Label>
            <Select value={selectedOs} onValueChange={setSelectedOs}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma OS" />
              </SelectTrigger>
              <SelectContent>
                {ordensServico.map((os) => (
                  <SelectItem key={os.id} value={os.id}>
                    {os.id} - {os.cliente}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedOs && (
            <div className="space-y-2">
              <Label>Detalhes da OS</Label>
              <div className="rounded-md border p-4 text-sm">
                {(() => {
                  const os = ordensServico.find(o => o.id === selectedOs);
                  return os ? (
                    <>
                      <p><strong>Cliente:</strong> {os.cliente}</p>
                      <p><strong>Endereço:</strong> {os.endereco}</p>
                      <p><strong>Horário Agendado:</strong> {os.horario}</p>
                    </>
                  ) : null;
                })()}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Sua Localização</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={currentLocation 
                  ? `Lat: ${currentLocation.lat.toFixed(6)}, Lng: ${currentLocation.lng.toFixed(6)}`
                  : "Localização não obtida"
                }
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={getLocation}
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
            {locationError && (
              <p className="text-sm text-destructive">{locationError}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Horário Atual</Label>
            <Input
              readOnly
              value={currentTime.toLocaleTimeString('pt-BR')}
            />
          </div>

          <Button 
            onClick={verificarCheckin} 
            disabled={!selectedOs || !currentLocation}
            className="w-full"
          >
            <MapPin className="mr-2 h-4 w-4" />
            Verificar Check-in
          </Button>

          {checkInStatus && (
            <Alert variant={
              checkInStatus.status === "success" ? "default" : 
              checkInStatus.status === "warning" ? "default" : 
              "destructive"
            }>
              {checkInStatus.status === "success" ? (
                <Check className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
             
             
              {(
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertTitle>
                {checkInStatus.status === "success" ? "Tudo certo!" : 
                 checkInStatus.status === "warning" ? "Atenção" : 
                 "Erro"}
              </AlertTitle>
              <AlertDescription>
                {checkInStatus.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        {(checkInStatus?.status === "success" || checkInStatus?.status === "warning") && (
          <CardFooter>
            <Button 
              onClick={realizarCheckin} 
              className="w-full"
            >
              <Check className="mr-2 h-4 w-4" />
              Realizar Check-in
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

