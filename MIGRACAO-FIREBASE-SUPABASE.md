# Migração do Firebase para o Supabase

Este documento contém instruções para migrar a aplicação Tilapios do Firebase para o Supabase, uma alternativa gratuita com funcionalidades similares.

## Pré-requisitos

1. Criar uma conta no [Supabase](https://supabase.com/)
2. Criar um novo projeto no Supabase
3. Configurar a autenticação e o banco de dados no Supabase

## Passos para Migração

### 1. Configuração do Supabase

1. Acesse o [Dashboard do Supabase](https://app.supabase.com/)
2. Crie um novo projeto
3. Anote a URL do projeto e a chave anon/public (encontradas em Configurações > API)
4. Atualize o arquivo `supabaseConfig.js` com suas credenciais:

```javascript
export const supabaseConfig = {
  supabaseUrl: 'SUA_SUPABASE_URL',
  supabaseKey: 'SUA_SUPABASE_ANON_KEY'
};
```

### 2. Configuração da Autenticação

1. No dashboard do Supabase, vá para Authentication > Providers
2. Habilite o provedor Email/Password
3. Configure as opções de confirmação de email conforme necessário

### 3. Configuração do Banco de Dados

1. No dashboard do Supabase, vá para Database > Tables
2. Crie uma tabela `captures` com a seguinte estrutura:

```sql
create table captures (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  user_name text not null,
  fish_name text not null,
  weight numeric not null,
  length numeric not null,
  location text,
  date timestamp with time zone default now(),
  photo_url text,
  notes text
);

-- Configurar RLS (Row Level Security)
alter table captures enable row level security;

-- Política para permitir que usuários vejam todas as capturas
create policy "Capturas são visíveis para todos os usuários autenticados"
  on captures for select
  to authenticated
  using (true);

-- Política para permitir que usuários insiram suas próprias capturas
create policy "Usuários podem inserir suas próprias capturas"
  on captures for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Política para permitir que usuários atualizem suas próprias capturas
create policy "Usuários podem atualizar suas próprias capturas"
  on captures for update
  to authenticated
  using (auth.uid() = user_id);

-- Política para permitir que usuários excluam suas próprias capturas
create policy "Usuários podem excluir suas próprias capturas"
  on captures for delete
  to authenticated
  using (auth.uid() = user_id);
```

### 4. Migração de Dados

1. Exporte os dados do Firebase Firestore
2. Importe os dados para o Supabase usando a interface de importação ou via API

### 5. Atualização do Código

1. Substitua o arquivo `firebaseConfig.js` pelo novo `supabaseConfig.js`
2. Substitua o arquivo `app.js` pelo novo `app-supabase.js` (renomeie para `app.js` após testar)
3. Atualize as referências no `index.html`:

```html
<!-- Alterar de: -->
<script type="module" src="app.js"></script>

<!-- Para: -->
<script type="module" src="app.js"></script>
```

### 6. Teste a Aplicação

1. Execute a aplicação localmente
2. Teste todas as funcionalidades:
   - Registro de usuário
   - Login
   - Recuperação de senha
   - Adição de capturas
   - Visualização do ranking
   - Exclusão de capturas

### 7. Deploy

1. Após confirmar que tudo está funcionando, faça o deploy da aplicação

## Vantagens do Supabase

1. **Plano Gratuito Generoso**: Inclui 500MB de banco de dados, 1GB de armazenamento e 2GB de transferência
2. **API Compatível**: Sintaxe similar ao Firebase, facilitando a migração
3. **Banco de Dados PostgreSQL**: Mais poderoso e flexível que o Firestore
4. **Autenticação Completa**: Suporte para email/senha, OAuth e magic links
5. **Storage**: Armazenamento de arquivos integrado
6. **Edge Functions**: Similar às Cloud Functions do Firebase

## Limitações e Diferenças

1. **Sintaxe de Consultas**: Embora similar, há diferenças na forma de consultar dados
2. **Hospedagem**: O Supabase não oferece hospedagem de sites como o Firebase Hosting
   - Alternativa: Use Vercel, Netlify ou GitHub Pages para hospedagem
3. **Tempo Real**: O Supabase usa PostgreSQL Realtime em vez do Firestore Realtime

## Recursos Adicionais

- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de Migração do Firebase para o Supabase](https://supabase.com/docs/guides/migrations/firebase-auth)
- [Exemplos de Código do Supabase](https://github.com/supabase/supabase/tree/master/examples)