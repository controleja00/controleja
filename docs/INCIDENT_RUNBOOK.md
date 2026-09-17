# Consuobra - resposta a incidentes

## Primeiros 15 minutos

1. Confirmar o erro em uma janela anonima e registrar horario, pagina e acao.
2. Consultar `/api/health`, logs da Vercel e saude do Supabase.
3. Se o erro nasceu em uma implantacao, promover a ultima implantacao estavel na Vercel.
4. Nao apagar dados para tentar corrigir um incidente.

## Falhas de autenticacao

- Verificar Auth logs, URL principal e URLs de redirecionamento no Supabase.
- Confirmar SMTP e limites de envio do Zoho.
- Manter Google OAuth oculto enquanto o provedor nao estiver validado.

## Falhas de dados

- Preservar logs e identificar usuario, tabela e horario.
- Validar RLS antes de qualquer mudanca manual.
- Restaurar backup primeiro em ambiente separado e documentar o resultado.

## Comunicacao

- Canal: suporte@consuobra.com.br.
- Informar impacto, inicio, alternativa temporaria e proxima atualizacao.
- Nunca enviar senhas, tokens ou documentos pessoais por e-mail.
