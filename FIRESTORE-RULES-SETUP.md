# 🔥 Configuração das Regras do Firestore

## ❌ Problema Atual
O erro `net::ERR_ABORTED` no Firestore indica que as regras de segurança estão bloqueando o acesso.

## ✅ Solução: Configurar Regras do Firestore

### Passo 1: Acessar o Console do Firebase
1. Acesse: https://console.firebase.google.com/project/pescador-79e00
2. No menu lateral, clique em **Firestore Database**
3. Clique na aba **Regras** (Rules)

### Passo 2: Configurar Regras de Desenvolvimento
Substitua as regras atuais por estas regras de desenvolvimento:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para usuários autenticados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Regras para capturas - usuários só podem acessar suas próprias capturas
    match /captures/{captureId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Permitir leitura de todas as capturas para o ranking (apenas leitura)
    match /captures/{captureId} {
      allow read: if request.auth != null;
    }
  }
}
```

### Passo 3: Regras Temporárias para Teste (APENAS PARA DESENVOLVIMENTO)
Se você quiser testar rapidamente, pode usar estas regras temporárias (INSEGURAS):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Passo 4: Publicar as Regras
1. Após colar as regras, clique em **Publicar**
2. Aguarde alguns segundos para as regras serem aplicadas

### Passo 5: Testar a Aplicação
1. Recarregue a página da aplicação
2. Tente fazer login
3. Verifique se os erros do Firestore desapareceram

## 🔒 Explicação das Regras

### Regras Seguras (Recomendadas)
- **users/{userId}**: Usuários só podem ler/escrever seus próprios dados
- **captures/{captureId}**: Usuários só podem acessar suas próprias capturas
- **Leitura para ranking**: Permite que usuários autenticados vejam todas as capturas (para o ranking)

### Regras de Teste (Temporárias)
- Permite qualquer operação para usuários autenticados
- **ATENÇÃO**: Use apenas para desenvolvimento!

## 📝 Estrutura de Dados Esperada

### Coleção `users`
```javascript
{
  uid: "user-id",
  email: "user@email.com",
  displayName: "Nome do Usuário",
  photoURL: "url-da-foto",
  createdAt: timestamp
}
```

### Coleção `captures`
```javascript
{
  userId: "user-id",
  userEmail: "user@email.com",
  userName: "Nome do Usuário",
  species: "Tilápia",
  weight: 2.5,
  location: "Lago",
  date: timestamp,
  photo: "url-da-foto"
}
```

---

**Após configurar as regras, sua aplicação funcionará corretamente!** 🎣

## 🚨 Importante
- Sempre use regras seguras em produção
- As regras de teste são apenas para desenvolvimento
- Teste sempre após alterar as regras