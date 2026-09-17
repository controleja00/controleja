# Consuobra - checklist de lancamento

## Bloqueadores de publicacao

- [x] Dominio principal com HTTPS na Vercel.
- [x] Autenticacao e confirmacao de e-mail pelo Supabase.
- [x] SMTP da Consuobra configurado.
- [x] Dados isolados por usuario com RLS.
- [x] Permissoes de administrador e assinatura protegidas no banco.
- [x] Termos, privacidade e suporte publicados.
- [ ] Verificacao documental do Asaas concluida.
- [ ] Checkouts Essencial e Profissional configurados e testados.
- [ ] Chave de IA configurada e limites por plano validados.
- [ ] Google OAuth configurado; manter o botao oculto ate a validacao.
- [ ] Backup do banco contratado/configurado e restauracao testada.

## Teste final antes de divulgar

1. Criar uma conta nova e confirmar o e-mail.
2. Cadastrar uma obra, editar receita e progresso.
3. Registrar receita, despesa e medicao.
4. Enviar e abrir um documento.
5. Criar e resolver um alerta.
6. Gerar um relatorio e validar o portal do cliente.
7. Solicitar redefinicao de senha.
8. Verificar celular e desktop.
9. Confirmar que outra conta nao enxerga os dados criados.
10. Conferir `/api/health` e logs da Vercel.
