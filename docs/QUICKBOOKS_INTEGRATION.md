# Integração QuickBooks - Documentação

## Visão Geral

Este sistema está totalmente integrado com o QuickBooks Online API, fornecendo sincronização bidirecional de dados financeiros, contábeis e de faturamento.

## Recursos

### 1. Autenticação OAuth 2.0
- Tokens de acesso e refresh automáticos
- Renovação automática de tokens antes da expiração
- Armazenamento seguro de credenciais

### 2. Sincronização de Entidades

#### Clientes → QuickBooks Customers
- Criação automática de clientes no QuickBooks
- Atualização bidirecional de informações
- Mapeamento de CPF/CNPJ

#### Produtos → QuickBooks Items
- Sincronização de produtos como itens de inventário
- Atualização automática de preços e estoque
- Rastreamento de quantidades

#### Pedidos → QuickBooks Invoices
- Criação automática de faturas
- Sincronização de itens do pedido
- Atualização de status de pagamento

### 3. Webhooks
- Recebimento de notificações do QuickBooks
- Processamento assíncrono de eventos
- Verificação de assinatura para segurança

### 4. Logs e Auditoria
- Rastreamento completo de sincronizações
- Registro de erros e sucessos
- Histórico de todas as operações

## Configuração

### 1. Criar Aplicativo no QuickBooks

1. Acesse [developer.intuit.com](https://developer.intuit.com)
2. Crie um novo aplicativo
3. Configure o Redirect URI: `http://localhost:3000/api/quickbooks/auth`
4. Obtenha Client ID e Client Secret

### 2. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha:

\`\`\`env
QUICKBOOKS_CLIENT_ID="seu_client_id"
QUICKBOOKS_CLIENT_SECRET="seu_client_secret"
QUICKBOOKS_REDIRECT_URI="http://localhost:3000/api/quickbooks/auth"
QUICKBOOKS_WEBHOOK_TOKEN="seu_webhook_token"
\`\`\`

### 3. Executar Migração do Banco de Dados

\`\`\`bash
npx prisma migrate dev
\`\`\`

### 4. Conectar ao QuickBooks

1. Acesse `/configuracoes/quickbooks`
2. Clique em "Conectar QuickBooks"
3. Autorize o aplicativo

## Uso

### Sincronização Automática

Todas as entidades são sincronizadas automaticamente quando:
- Um novo cliente é criado
- Um produto é atualizado
- Um pedido é finalizado

### Sincronização Manual

Acesse `/configuracoes/quickbooks` e use os botões de sincronização para forçar a sincronização de entidades específicas.

### API

#### Sincronizar Entidade Específica

\`\`\`typescript
POST /api/quickbooks/sync
{
  "entityType": "cliente",
  "entityId": 1
}
\`\`\`

#### Sincronizar Tudo

\`\`\`typescript
POST /api/quickbooks/sync
{
  "entityType": "all"
}
\`\`\`

## Fluxo de Sincronização

### Cliente

1. Cliente criado/atualizado no sistema
2. Sistema verifica se já existe no QuickBooks
3. Se não existir, cria novo Customer
4. Se existir, atualiza Customer existente
5. Salva QuickBooks ID no banco local
6. Registra log de sincronização

### Produto

1. Produto criado/atualizado no sistema
2. Sistema verifica se já existe no QuickBooks
3. Se não existir, cria novo Item
4. Se existir, atualiza Item existente
5. Atualiza quantidade em estoque
6. Registra log de sincronização

### Pedido

1. Pedido finalizado no sistema
2. Sistema sincroniza Cliente (se necessário)
3. Sistema sincroniza todos os Produtos (se necessário)
4. Cria Invoice no QuickBooks
5. Adiciona todos os itens do pedido
6. Registra log de sincronização

## Webhooks

Configure webhooks no QuickBooks Developer Portal:

URL: `https://seu-dominio.com/api/quickbooks/webhook`

Eventos suportados:
- Customer (Create, Update, Delete)
- Item (Create, Update, Delete)
- Invoice (Create, Update, Delete)
- Payment (Create, Update, Delete)

## Tratamento de Erros

### Erros Comuns

1. **Token Expirado**: Renovado automaticamente
2. **Cliente não encontrado**: Cria novo cliente
3. **Produto sem estoque**: Registra erro no log
4. **Falha na rede**: Retentar após 5 minutos

### Logs de Erro

Todos os erros são registrados em `SyncLog` com:
- Tipo de entidade
- ID da entidade
- Mensagem de erro
- Timestamp

## Segurança

1. **Tokens**: Armazenados criptografados no banco
2. **Webhooks**: Verificação de assinatura HMAC
3. **HTTPS**: Obrigatório em produção
4. **Rate Limiting**: Respeitado automaticamente

## Monitoramento

### Dashboard

Acesse `/configuracoes/quickbooks` para ver:
- Status da conexão
- Últimas sincronizações
- Erros recentes
- Estatísticas

### Logs

\`\`\`sql
-- Ver últimas sincronizações
SELECT * FROM "SyncLog" ORDER BY "createdAt" DESC LIMIT 50;

-- Ver erros
SELECT * FROM "SyncLog" WHERE status = 'error';

-- Ver sincronizações por entidade
SELECT entityType, COUNT(*) FROM "SyncLog" GROUP BY entityType;
\`\`\`

## Troubleshooting

### Problema: Token inválido

**Solução**: Desconecte e reconecte no `/configuracoes/quickbooks`

### Problema: Sincronização falhando

**Solução**: 
1. Verifique logs em `SyncLog`
2. Verifique se cliente/produto existe no QuickBooks
3. Force sincronização manual

### Problema: Webhook não recebendo eventos

**Solução**:
1. Verifique URL do webhook no QuickBooks Dev Portal
2. Confirme que HTTPS está configurado
3. Verifique logs do servidor

## Próximos Passos

- [ ] Implementar sincronização de pagamentos
- [ ] Adicionar suporte para múltiplas moedas
- [ ] Implementar relatórios financeiros integrados
- [ ] Adicionar dashboard de métricas financeiras
