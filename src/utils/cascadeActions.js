/**
 * Motor Central de Eventos — Consuobra
 * "Digite uma vez. O sistema faz o resto."
 *
 * Toda alteração em qualquer módulo dispara eventos automáticos em cascata:
 * medição → progresso, fases, financeiro, score, alertas, dashboard
 */
import { base44 } from "@/api/base44Client";
import { isOwnTeam } from "@/lib/workActors";

/**
 * Aprova uma medição e dispara atualização em cascata:
 * - atualiza status da medição
 * - recalcula % de progresso da obra
 * - cria lançamento no fluxo de caixa (a pagar)
 * - atualiza score operacional do subempreiteiro
 * - registra alerta de aprovação
 */
export async function approveMeasurement(measurement, { projects = [], allMeasurements = [] } = {}) {
  // 1. Aprovar medição
  await base44.entities.Measurement.update(measurement.id, {
    status: "Aprovada",
    approved_by: "Sistema",
  });

  // 2. Recalcular progresso da obra + atualizar fases
  const project = projects.find(p => p.id === measurement.project_id);
  if (project) {
    const projectMeasurements = allMeasurements.filter(m => m.project_id === measurement.project_id);
    const nowApproved = [
      ...projectMeasurements.filter(m => m.id !== measurement.id && m.status === "Aprovada"),
      { ...measurement, status: "Aprovada" }
    ];

    // 2a. Atualizar executed_qty nas fases que correspondem ao serviço medido
    let updatedPhases = project.phases ? [...project.phases] : [];
    if (updatedPhases.length > 0) {
      updatedPhases = updatedPhases.map(phase => {
        const matching = nowApproved.filter(
          m => m.service?.toLowerCase().includes(phase.name?.toLowerCase()) ||
               phase.name?.toLowerCase().includes(m.service?.toLowerCase())
        );
        const totalExec = matching.reduce((s, m) => s + (Number(m.executed_qty) || 0), 0);
        const newExec = Math.max(Number(phase.executed_qty) || 0, totalExec);
        const contracted = Number(phase.contracted_qty) || 0;
        const phaseStatus = contracted > 0 && newExec >= contracted ? "Concluída"
          : newExec > 0 ? "Em andamento"
          : phase.status || "Pendente";
        return { ...phase, executed_qty: newExec, status: phaseStatus };
      });

      // 2b. Recalcular progresso físico ponderado pelas fases
      const weightedProgress = updatedPhases.reduce((sum, phase) => {
        const contracted = Number(phase.contracted_qty) || 0;
        const executed = Number(phase.executed_qty) || 0;
        const phasePct = contracted > 0 ? Math.min(100, (executed / contracted) * 100) : (phase.status === "Concluída" ? 100 : 0);
        return sum + (phasePct * (Number(phase.weight) || 0)) / 100;
      }, 0);

      await base44.entities.Project.update(measurement.project_id, {
        phases: updatedPhases,
        progress_percent: Math.round(weightedProgress),
      });
    } else {
      // Fallback: progresso financeiro se não há fases
      const totalBudget = project.budget || 0;
      const totalApprovedValue = nowApproved.reduce((s, m) => s + (m.total_value || 0), 0);
      const newProgress = totalBudget > 0
        ? Math.min(100, Math.round((totalApprovedValue / totalBudget) * 100))
        : Math.min(100, (project.progress_percent || 0) + 5);
      await base44.entities.Project.update(measurement.project_id, { progress_percent: newProgress });
    }
  }

  // 3. Criar lançamento no fluxo de caixa
  if ((measurement.total_value || 0) > 0) {
    await base44.entities.CashFlowEntry.create({
      project_id: measurement.project_id,
      project_name: measurement.project_name || "",
      description: `Medição aprovada: ${measurement.service}`,
      type: "Despesa",
      category: "Medição",
      value: measurement.total_value,
      status: "A pagar",
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      related_entity: "Measurement",
      related_id: measurement.id,
    });
  }

  // 4. Atualizar score do subempreiteiro (+2 pontos operacional por medição aprovada)
  if (measurement.subcontractor_id && !isOwnTeam(measurement.subcontractor_id)) {
    let sub = null;
    try { sub = await base44.entities.Subcontractor.get(measurement.subcontractor_id); } catch (e) { sub = null; }
    if (sub) {
      const op = Math.min(100, (sub.score_operational || 50) + 2);
      const total = Math.round(
        ((sub.score_technical || 50) + (sub.score_legal || 50) + (sub.score_financial || 50) + op + (sub.score_behavioral || 50)) / 5
      );
      await base44.entities.Subcontractor.update(measurement.subcontractor_id, {
        score_operational: op,
        score_total: total,
        availability: sub.availability === "Indisponível" ? sub.availability : "Ocupado",
      });
    }
  }

  // 5. Criar alerta de acompanhamento se valor alto
  if ((measurement.total_value || 0) > 50000) {
    await base44.entities.Alert.create({
      title: `Pagamento de alto valor pendente — ${measurement.service}`,
      description: `Medição aprovada de R$ ${measurement.total_value?.toLocaleString("pt-BR")} (${measurement.subcontractor_name}). Vencimento em 7 dias.`,
      type: "Medição pendente",
      severity: "Alta",
      related_entity: "Measurement",
      related_id: measurement.id,
      is_read: false,
      is_resolved: false,
    });
  }
}

/**
 * Rejeita uma medição e registra alerta para o subempreiteiro.
 */
/**
 * Dá baixa em um lançamento do fluxo de caixa:
 * - muda status para Pago
 * - registra data de pagamento
 */
export async function markCashFlowPaid(entryId, paidDate) {
  return base44.entities.CashFlowEntry.update(entryId, {
    status: "Pago",
    paid_date: paidDate || new Date().toISOString().split("T")[0],
  });
}

export async function rejectMeasurement(measurement) {
  await base44.entities.Measurement.update(measurement.id, { status: "Rejeitada" });

  // Leve penalidade no score
  if (measurement.subcontractor_id && !isOwnTeam(measurement.subcontractor_id)) {
    let sub = null;
    try { sub = await base44.entities.Subcontractor.get(measurement.subcontractor_id); } catch (e) { sub = null; }
    if (sub) {
      const op = Math.max(0, (sub.score_operational || 50) - 1);
      const total = Math.round(
        ((sub.score_technical || 50) + (sub.score_legal || 50) + (sub.score_financial || 50) + op + (sub.score_behavioral || 50)) / 5
      );
      await base44.entities.Subcontractor.update(measurement.subcontractor_id, {
        score_operational: op,
        score_total: total,
      });
    }
  }
}
