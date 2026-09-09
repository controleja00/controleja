import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function Privacy() {
  useEffect(() => { document.title = "Política de Privacidade | Consuobra"; }, []);
  return (
    <div className="min-h-screen font-sans" style={{ background: "#f6f8fc" }}>
      <nav className="border-b sticky top-0 z-50" style={{ background: "rgba(251,250,248,0.94)", borderColor: "#e1e5ed", backdropFilter: "blur(14px)" }}>
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <BrandLogo size="sm" />
          <Link to="/" className="text-sm flex items-center gap-1 hover:underline" style={{ color: "#424c62" }}>
            <ArrowLeft className="h-3.5 w-3.5" />Voltar
          </Link>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-sm mb-2" style={{ color: "#778096" }}>Última atualização: 4 de junho de 2026</p>
        <h1 className="text-3xl font-black mb-8" style={{ color: "#172441" }}>Política de Privacidade</h1>
        <div className="space-y-8 text-sm leading-relaxed" style={{ color: "#424c62" }}>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#172441" }}>1. Introdução</h2>
            <p>A Consuobra está comprometida em proteger a privacidade dos seus usuários. Esta Política descreve como coletamos, usamos e protegemos suas informações, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).</p>
          </section>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#172441" }}>2. Dados que coletamos</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Dados de cadastro:</strong> nome, e-mail e dados básicos da empresa.</li>
              <li><strong>Dados de uso:</strong> obras, gastos, etapas, documentos e informações inseridas na plataforma.</li>
              <li><strong>Dados técnicos:</strong> endereço IP, tipo de dispositivo, sistema operacional e logs de acesso.</li>
            </ul>
            <p className="mt-2">Não coletamos dados de cartão de crédito. Pagamentos são processados por gateways certificados PCI-DSS.</p>
          </section>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#172441" }}>3. Finalidade do tratamento</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Prestação dos serviços de controle de obras</li>
              <li>Autenticação e controle de acesso à conta</li>
              <li>Faturamento e cobrança (planos pagos)</li>
              <li>Suporte ao cliente</li>
              <li>Melhorias na plataforma com dados agregados e anonimizados</li>
              <li>Cumprimento de obrigações legais</li>
            </ul>
          </section>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#172441" }}>4. Compartilhamento de dados</h2>
            <p>Não vendemos seus dados. Compartilhamos apenas com:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Provedores de infraestrutura e hospedagem (com acordos de confidencialidade)</li>
              <li>Processadores de pagamento certificados (apenas planos pagos)</li>
              <li>Autoridades competentes quando exigido por lei</li>
            </ul>
          </section>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#172441" }}>5. Seus direitos (LGPD)</h2>
            <p>Você tem direito a:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Confirmar a existência de tratamento dos seus dados</li>
              <li>Acessar e corrigir seus dados</li>
              <li>Solicitar exclusão dos seus dados</li>
              <li>Portabilidade dos dados</li>
              <li>Revogar consentimento a qualquer momento</li>
            </ul>
            <p className="mt-2">Para exercer seus direitos, entre em contato: <strong>suporte@consuobra.com.br</strong></p>
          </section>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#172441" }}>6. Segurança</h2>
            <p>Implementamos criptografia TLS/SSL, controle de acesso por perfil, backups automáticos e monitoramento contínuo de segurança. Seus dados são usados exclusivamente para organizar e controlar suas obras.</p>
          </section>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#172441" }}>7. Retenção de dados</h2>
            <p>Mantemos seus dados enquanto a conta estiver ativa. Após cancelamento, os dados ficam disponíveis por 30 dias para exportação e são excluídos após 90 dias, salvo obrigação legal.</p>
          </section>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#172441" }}>8. Contato</h2>
            <p>Encarregado de Dados (DPO): <strong>suporte@consuobra.com.br</strong><br />Consuobra — São Paulo, SP — Brasil</p>
          </section>
        </div>
      </div>
    </div>
  );
}
