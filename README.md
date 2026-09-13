# Consuobra

Aplicativo web para controle de obras, gastos, documentos, fotos, progresso e relatorios.

URL oficial: https://consuobra.com.br/

## Rodar localmente

1. Instale as dependencias:

```bash
npm install
```

2. Crie um arquivo `.env.local` usando o `.env.example` como base:

```bash
VITE_BASE44_APP_ID=6a14c26bf1186131feba185a
VITE_BASE44_APP_BASE_URL=https://prehistoric-smart-build-connect.base44.app
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

## Publicar na Vercel

1. Suba esta pasta para um repositorio no GitHub.
2. Na Vercel, clique em `Add New Project` e importe o repositorio.
3. Use as configuracoes:

```bash
Framework Preset: Vite
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

4. Em `Environment Variables`, cadastre:

```bash
VITE_BASE44_APP_ID=6a14c26bf1186131feba185a
VITE_BASE44_APP_BASE_URL=https://prehistoric-smart-build-connect.base44.app
VITE_PUBLIC_WHATSAPP_URL=
VITE_ASAAS_ESSENTIAL_CHECKOUT_URL=
VITE_ASAAS_PROFESSIONAL_CHECKOUT_URL=
```

5. Clique em `Deploy`.

## Importante

Este projeto esta pronto para publicar o frontend na Vercel, mas ainda usa o backend, autenticacao, banco de dados e arquivos do Base44. Para tirar 100% do Base44 depois, a proxima etapa e migrar backend, login, banco e storage para uma stack propria, como Supabase.

O dominio oficial `consuobra.com.br` deve apontar para a Vercel. O backend, autenticacao, banco de dados e arquivos ainda passam pelo Base44.

## E-mails oficiais

O dominio `consuobra.com.br` usa Zoho Mail para e-mails corporativos.

- Caixa principal: `suporte@consuobra.com.br`
- Alias comercial: `contato@consuobra.com.br`
- Alias financeiro: `financeiro@consuobra.com.br`

No DNS da Vercel devem ficar ativos os registros MX do Zoho, SPF, DKIM e DMARC. O DMARC pode iniciar com `p=none` para monitoramento e ser endurecido depois que os envios estiverem estáveis.
