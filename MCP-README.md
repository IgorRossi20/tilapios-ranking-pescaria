# 🔥 Firebase MCP Server - Projeto Tilapios

Este projeto inclui um servidor MCP (Model Context Protocol) para integração com Firebase, permitindo automação e gerenciamento do projeto através de ferramentas compatíveis com MCP.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Firebase CLI instalado e autenticado
- Projeto Firebase configurado (pescador-79e00)
- IDE ou ferramenta compatível com MCP (ex: Claude Desktop)

## 🚀 Instalação

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

3. **Configurar credenciais do Firebase Admin (opcional para funcionalidades avançadas):**
   - Acesse o [Console do Firebase](https://console.firebase.google.com/project/pescador-79e00/settings/serviceaccounts/adminsdk)
   - Gere uma nova chave privada
   - Salve como `firebase-admin-credentials.json`
   - Configure a variável `GOOGLE_APPLICATION_CREDENTIALS` no `.env`

## 🛠️ Ferramentas Disponíveis

### 1. `firebase_deploy`
Realiza deploy da aplicação para Firebase Hosting.

**Parâmetros:**
- `target` (string): Target do deploy (padrão: "hosting")
- `message` (string): Mensagem do deploy (opcional)

**Exemplo:**
```json
{
  "target": "hosting",
  "message": "Deploy via MCP"
}
```

### 2. `firestore_query`
Consulta dados no Firestore.

**Parâmetros:**
- `collection` (string): Nome da coleção (obrigatório)
- `limit` (number): Limite de documentos (padrão: 10)
- `orderBy` (string): Campo para ordenação (opcional)

**Exemplo:**
```json
{
  "collection": "captures",
  "limit": 5,
  "orderBy": "timestamp"
}
```

### 3. `auth_list_users`
Lista usuários do Firebase Authentication.

**Parâmetros:**
- `maxResults` (number): Número máximo de usuários (padrão: 10)

**Exemplo:**
```json
{
  "maxResults": 20
}
```

### 4. `firebase_status`
Verifica o status do projeto Firebase.

**Parâmetros:** Nenhum

## 🔧 Configuração no Claude Desktop

Adicione a seguinte configuração no arquivo de configuração do Claude Desktop:

```json
{
  "mcpServers": {
    "firebase-tilapios": {
      "command": "node",
      "args": ["mcp-server.js"],
      "cwd": "C:\\Users\\igor_\\OneDrive\\Área de Trabalho\\ESTUDOS\\PROJETOS\\TILAPIOS",
      "env": {
        "FIREBASE_PROJECT_ID": "pescador-79e00",
        "NODE_ENV": "development"
      }
    }
  }
}
```

## 🚀 Uso

### Iniciar o servidor MCP:
```bash
npm start
```

### Testar o servidor:
```bash
npm run test-mcp
```

### Scripts disponíveis:
- `npm start` - Inicia o servidor MCP
- `npm run dev` - Inicia com nodemon (desenvolvimento)
- `npm run test-mcp` - Testa o servidor MCP
- `npm run firebase-deploy` - Deploy direto via npm
- `npm run firebase-serve` - Serve localmente

## 📁 Arquivos de Configuração

- `mcp.json` - Configuração principal do MCP
- `mcp-server.js` - Implementação do servidor MCP
- `mcp-client-config.json` - Configuração para clientes MCP
- `package.json` - Dependências e scripts
- `.env.example` - Exemplo de variáveis de ambiente

## 🔍 Troubleshooting

### Erro: "Firebase não inicializado"
- Verifique se as credenciais do Firebase estão configuradas
- Certifique-se de que o Firebase CLI está autenticado: `firebase login`

### Erro: "Ferramenta desconhecida"
- Verifique se o nome da ferramenta está correto
- Consulte a lista de ferramentas disponíveis

### Erro de permissões
- Verifique se o usuário tem permissões no projeto Firebase
- Configure as regras de segurança adequadas no Firestore

## 📊 Logs

Os logs do servidor são exibidos no stderr. Para debug:
```bash
MCP_LOG_LEVEL=debug npm start
```

## 🔐 Segurança

- Nunca commite credenciais no repositório
- Use variáveis de ambiente para configurações sensíveis
- Configure regras de segurança adequadas no Firebase
- Em produção, use credenciais de service account com permissões mínimas

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs do servidor MCP
2. Consulte a documentação do Firebase
3. Verifique a documentação do MCP

---

**Projeto:** Tilapios 🐟  
**URL:** https://pescador-79e00.web.app  
**Versão MCP:** 1.0.0