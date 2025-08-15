# 🔥 Instruções para Corrigir Erro de API Key do Firebase

## ❌ Erro Atual
```
FirebaseError: Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
```

## ✅ Solução: Obter Credenciais Reais do Firebase

### Passo 1: Acessar o Console do Firebase
1. Acesse: https://console.firebase.google.com/
2. Faça login com sua conta Google
3. Selecione o projeto **pescador-79e00**

### Passo 2: Obter as Credenciais
1. Clique no ícone de **Configurações** (⚙️) no menu lateral
2. Selecione **Configurações do projeto**
3. Role até a seção **Seus apps**
4. Se não houver um app web, clique em **Adicionar app** e selecione o ícone da web (`</>`)
5. Se já existir, clique no ícone de configuração do app web existente

### Passo 3: Copiar as Credenciais
Você verá algo assim:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...", // Esta é sua API key real
  authDomain: "pescador-79e00.firebaseapp.com",
  projectId: "pescador-79e00",
  storageBucket: "pescador-79e00.appspot.com",
  messagingSenderId: "123456789", // Seu Sender ID real
  appId: "1:123456789:web:abc123" // Seu App ID real
};
```

### Passo 4: Atualizar o Arquivo firebaseConfig.js
1. Abra o arquivo: `public/firebaseConfig.js`
2. Substitua os valores placeholder pelas credenciais reais:
   - `SUA_API_KEY_REAL_AQUI` → sua API key real
   - `SEU_SENDER_ID_REAL` → seu messagingSenderId real
   - `SEU_APP_ID_REAL` → seu appId real

### Passo 5: Testar a Correção
1. Salve o arquivo `firebaseConfig.js`
2. Recarregue a página no navegador
3. Verifique se os erros de API key desapareceram

## 🔒 Segurança
- As API keys do Firebase são seguras para uso público
- Elas identificam seu projeto, mas não concedem acesso aos dados
- O controle de acesso é feito pelas Firebase Security Rules

## 📝 Localização Alternativa das Credenciais
- **API Key**: Project Settings > General > Web API Key
- **Sender ID**: Project Settings > Cloud Messaging > Sender ID
- **App ID**: Project Settings > General > Your apps > App ID

---

**Após seguir estes passos, sua aplicação Firebase funcionará corretamente!** 🎣