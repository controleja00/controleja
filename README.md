# Consuobra

SaaS web para controle de obras, gastos, documentos, fotos, progresso, relatorios e portal do cliente.

URL oficial: https://consuobra.com.br/

## Arquitetura

- Frontend: React + Vite publicado na Vercel.
- Banco de dados: Supabase/Postgres.
- Autenticacao: Supabase Auth.
- Arquivos: Supabase Storage.
- E-mails oficiais: Zoho Mail via SMTP.
- IA: endpoints proprios em `/api/ai/*` usando OpenAI quando a chave estiver configurada.
- Pagamentos: Asaas, com checkout publico enquanto a verificacao documental estiver pendente.

## Rodar localmente

1. Instale as dependencias:

```bash
npm install
```

2. Crie um arquivo `.env.local` usando o `.env.example` como base:

```bash
VITE_SUPABASE_URL=https://fnbcbepmwgqwecwlbfco.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_ENABLE_GOOGLE_AUTH=false
VITE_PUBLIC_WHATSAPP_URL=
VITE_ASAAS_ESSENTIAL_CHECKOUT_URL=
VITE_ASAAS_PROFESSIONAL_CHECKOUT_URL=
```

3. Rode o app:

```bash
npm run dev
```

4. Gere o build de producao:

```bash
npm run build
```

## Supabase

A primeira migracao esta em:

```bash
supabase/migrations/202609150001_initial_consuobra.sql
```

Ela cria tabelas, indices, politicas RLS por usuario, bucket `app-files` e a funcao segura `get_client_portal_by_token` para o portal do cliente.

## Publicar na Vercel

Use as configuracoes:

```bash
Framework Preset: Vite
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

Variaveis obrigatorias:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_ENABLE_GOOGLE_AUTH=false
```

Variaveis recomendadas para producao:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OPENAI_TRANSCRIBE_MODEL=whisper-1
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_USER=suporte@consuobra.com.br
SMTP_PASS=
SMTP_FROM=Consuobra <suporte@consuobra.com.br>
MAIL_ALLOWED_TO=suporte@consuobra.com.br,contato@consuobra.com.br,financeiro@consuobra.com.br
VITE_ASAAS_ESSENTIAL_CHECKOUT_URL=
VITE_ASAAS_PROFESSIONAL_CHECKOUT_URL=
VITE_PUBLIC_WHATSAPP_URL=
```

## E-mails oficiais

O dominio `consuobra.com.br` usa Zoho Mail para e-mails corporativos.

- Caixa principal: `suporte@consuobra.com.br`
- Alias comercial: `contato@consuobra.com.br`
- Alias financeiro: `financeiro@consuobra.com.br`

No DNS da Vercel devem ficar ativos os registros MX do Zoho, SPF, DKIM e DMARC.

## Pagamentos

O gateway escolhido para a primeira versao comercial e o Asaas.

- Plano Essencial: R$ 19,90/mes
- Plano Profissional: R$ 69,90/mes
- Teste gratis: 7 dias

Enquanto a conta Asaas estiver pendente de verificacao documental, mantenha `VITE_ASAAS_ESSENTIAL_CHECKOUT_URL` e `VITE_ASAAS_PROFESSIONAL_CHECKOUT_URL` vazias. Assim, os planos pagos continuam levando o usuario ao cadastro e mostram que o checkout esta em ativacao.
