import React from "react";
import { Link } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";

export default class AppErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Consuobra application error", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-screen bg-[#f6f8fc] px-4 flex items-center justify-center">
        <section className="w-full max-w-lg border border-[#e1e5ed] bg-white p-8 text-center shadow-sm rounded-lg">
          <BrandLogo size="md" />
          <h1 className="mt-8 text-2xl font-black text-[#172441]">Não foi possível abrir esta tela</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#424c62]">
            Seus dados não foram apagados. Recarregue a página e, se o problema continuar, fale com o suporte.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button className="rounded-md bg-[#1f3258] px-5 py-2.5 text-sm font-bold text-white" onClick={() => window.location.reload()}>
              Recarregar
            </button>
            <Link className="rounded-md border border-[#c8cfdb] px-5 py-2.5 text-sm font-bold text-[#1f3258]" to="/support">
              Abrir suporte
            </Link>
          </div>
        </section>
      </main>
    );
  }
}
