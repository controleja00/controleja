import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function Terms() {
  useEffect(() => { document.title = "Termos de Uso | Consuobra"; }, []);
  return (
    <div className="min-h-screen font-sans" style={{ background: "#fbfaf8" }}>
      <nav className="border-b sticky top-0 z-50" style={{ background: "rgba(251,250,248,0.94)", borderColor: "#efefef", backdropFilter: "blur(14px)" }}>
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <BrandLogo size="sm" />
          <Link to="/" className="text-sm flex items-center gap-1 hover:underline" style={{ color: "#3d3e45" }}>
            <ArrowLeft className="h-3.5 w-3.5" />Voltar
          </Link>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-sm mb-2" style={{ color: "#6f7073" }}>Última atualização: 4 de junho de 2026</p>
        <h1 className="text-3xl font-black mb-8" style={{ color: "#111917" }}>Termos de Uso</h1>
        <div className="space-y-8 text-sm leading-relaxed" style={{ color: "#3d3e45" }}>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#111917" }}>1. Aceitação dos termos</h2>
            <p>Ao acessar ou usar o Consuobra, você concorda com estes Termos de Uso. Se não concordar, não utilize o serviço.</p>
          </section>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#111917" }}>2. Descrição do serviço</h2>
            <p>A Consuobra é uma plataforma para controle de obras, gastos, etapas, documentos, fotos, equipes, alertas e relatórios na construção civil. O acesso é fornecido mediante cadastro gratuito (plano Inicial) ou assinatura paga (planos Profissional e Empresa).</p>
          </section>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#111917" }}>3. Plano gratuito e assinaturas pagas</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>O plano Inicial é gratuito para sempre, sem necessidade de cartão de crédito.</li>
              <li>Os planos pagos (Profissional e Empresa) são cobrados mensalmente.</li>
              <li>Não há período de teste com cobrança automática. Você escolhe quando fazer upgrade.</li>
              <li>Cancelamentos podem ser feitos a qualquer momento nas configurações da conta.</li>
              <li>Não há reembolso proporcional para cancelamentos no meio do ciclo pago.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#111917" }}>4. Uso aceitável</h2>
            <p>Você concorda em não:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Compartilhar credenciais de acesso com terceiros não autorizados</li>
              <li>Usar a plataforma para fins ilegais ou fraudulentos</li>
              <li>Tentar acessar sistemas ou dados de outros usuários</li>
              <li>Realizar engenharia reversa do sistema</li>
            </ul>
          </section>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#111917" }}>5. Propriedade intelectual</h2>
            <p>Todo o código, design e funcionalidades da Consuobra são de propriedade exclusiva da Consuobra. Os dados inseridos pelos usuários permanecem de propriedade do usuário.</p>
          </section>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#111917" }}>6. Limitação de responsabilidade</h2>
            <p>O Consuobra é fornecido como ferramenta de apoio ao controle de obras. Não nos responsabilizamos por decisões operacionais, financeiras ou jurídicas tomadas com base nas informações da plataforma. A responsabilidade máxima é limitada ao valor pago nos últimos 3 meses de assinatura.</p>
          </section>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#111917" }}>7. Disponibilidade</h2>
            <p>Nos comprometemos com alta disponibilidade do serviço. Manutenções programadas serão comunicadas com antecedência quando possível.</p>
          </section>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#111917" }}>8. Cancelamento</h2>
            <p>Você pode cancelar sua conta a qualquer momento pelas configurações. Após o cancelamento, seus dados ficam disponíveis por 30 dias para exportação.</p>
          </section>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#111917" }}>9. Lei aplicável</h2>
            <p>Estes termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer controvérsias.</p>
          </section>
          <section>
            <h2 className="text-base font-bold mb-2" style={{ color: "#111917" }}>10. Contato</h2>
            <p><strong>suporte@consuobra.com.br</strong><br />Consuobra — São Paulo, SP — Brasil</p>
          </section>
        </div>
      </div>
    </div>
  );
}
