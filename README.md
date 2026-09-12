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
```

5. Clique em `Deploy`.

## Importante

Este projeto esta pronto para publicar o frontend na Vercel, mas ainda usa o backend, autenticacao, banco de dados e arquivos do Base44. Para tirar 100% do Base44 depois, a proxima etapa e migrar backend, login, banco e storage para uma stack propria, como Supabase.

O dominio oficial `consuobra.com.br` deve apontar para a Vercel. O backend, autenticacao, banco de dados e arquivos ainda passam pelo Base44.
