import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Building2, ArrowLeft } from "lucide-react";

export default function Terms() {
  useEffect(() => { document.title = "Termos de Uso | ControleJá"; }, []);
  return (
    <div className="min-h-screen font-sans" style={{ background: "#F4F6FA" }}>
      <nav className="border-b sticky top-0 z-50" style={{ background: "rgba(244,246,250,0.97)", borderColor: "#D7D9DE", backdropFilter: "blur(12px)" }}>
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: "#1B2F55" }}>
              <Building2 className="h-3.5 w-3.5 text-[#D7D9DE]" />
            </div>
            <span className="font-black text-base" style={{ color: "#1B2F55" }}>ControleJá</span>
          </Link>
          <Link to="/" className="text-sm flex items-center gap-1 hover:underline" style={{ color: "#667085" }}>
            <ArrowLeft className="h-3.5 w-3.5" />Voltar
          </Link>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-sm mb-2" style={{ color: "#A8ABB3" }}>Última atualização: 4 de junho de 2026</p>
        <h1 className="text-3xl font-black mb-8" style={{ color: "#101828" }}>Termos de Uso</h1>
        <div className="space-y-8 text-sm leading-relaxed" style={{ color: "#667085" }}>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#101828" }}>1. Aceitação dos termos</h2>
            <p>Ao acessar ou usar o ControleJá, você concorda com estes Termos de Uso. Se não concordar, não utilize o serviço.</p>
          </section>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#101828" }}>2. Descrição do serviço</h2>
            <p>O ControleJá é uma plataforma para controle de obras, gastos, etapas, documentos, fotos, equipes, alertas e relatórios na construção civil, desenvolvida pelo Grupo Busk. O acesso é fornecido mediante cadastro gratuito (plano Inicial) ou assinatura paga (planos Profissional e Empresa).</p>
          </section>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#101828" }}>3. Plano gratuito e assinaturas pagas</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>O plano Inicial é gratuito para sempre, sem necessidade de cartão de crédito.</li>
              <li>Os planos pagos (Profissional e Empresa) são cobrados mensalmente.</li>
              <li>Não há período de teste com cobrança automática. Você escolhe quando fazer upgrade.</li>
              <li>Cancelamentos podem ser feitos a qualquer momento nas configurações da conta.</li>
              <li>Não há reembolso proporcional para cancelamentos no meio do ciclo pago.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#101828" }}>4. Uso aceitável</h2>
            <p>Você concorda em não:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Compartilhar credenciais de acesso com terceiros não autorizados</li>
              <li>Usar a plataforma para fins ilegais ou fraudulentos</li>
              <li>Tentar acessar sistemas ou dados de outros usuários</li>
              <li>Realizar engenharia reversa do sistema</li>
            </ul>
          </section>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#101828" }}>5. Propriedade intelectual</h2>
            <p>Todo o código, design e funcionalidades do ControleJá são de propriedade exclusiva do Grupo Busk. Os dados inseridos pelos usuários permanecem de propriedade do usuário.</p>
          </section>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#101828" }}>6. Limitação de responsabilidade</h2>
            <p>O ControleJá é fornecido como ferramenta de apoio ao controle de obras. Não nos responsabilizamos por decisões operacionais, financeiras ou jurídicas tomadas com base nas informações da plataforma. A responsabilidade máxima é limitada ao valor pago nos últimos 3 meses de assinatura.</p>
          </section>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#101828" }}>7. Disponibilidade</h2>
            <p>Nos comprometemos com alta disponibilidade do serviço. Manutenções programadas serão comunicadas com antecedência quando possível.</p>
          </section>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#101828" }}>8. Cancelamento</h2>
            <p>Você pode cancelar sua conta a qualquer momento pelas configurações. Após o cancelamento, seus dados ficam disponíveis por 30 dias para exportação.</p>
          </section>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#101828" }}>9. Lei aplicável</h2>
            <p>Estes termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer controvérsias.</p>
          </section>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#101828" }}>10. Contato</h2>
            <p><strong>suporte@controleja.com.br</strong><br />ControleJá — Grupo Busk — São Paulo, SP — Brasil</p>
          </section>
        </div>
      </div>
    </div>
  );
}