/**
 * trainingSettings.js - Pagina "Impostazioni" allenamenti
 * Settimana tipo + gestione template sedute
 */

import { renderConfig, attachConfigListeners } from './trainingConfig';
import { loadTrainingData } from './trainingData';
import demoPersistence from '../demo/DemoPersistence';

export default async function loadTrainingSettings() {
  const c = document.getElementById('pageContent');
  c.innerHTML = '<div class="loading"><div class="spinner"></div>Caricamento...</div>';

  const trainingData = await loadTrainingData();
  if (!trainingData) return;

  const { config } = trainingData;

  // Template salvati
  const templates = demoPersistence.getTrainingTemplates();
  let templatesHtml = `<div class="card" style="margin-bottom:16px;">
    <h3 class="section-title">📋 Template Sedute</h3>`;
  if (templates.length === 0) {
    templatesHtml += `<p style="color:#6c757d;font-size:13px;">Nessun template salvato. Puoi salvare una seduta come template dalla pagina Sedute.</p>`;
  } else {
    templatesHtml += `<style>
      .tmpl-card { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:12px 14px; font-size:12px; min-width:180px; position:relative; transition:box-shadow 0.15s; }
      .tmpl-card:hover { box-shadow:0 4px 12px rgba(0,0,0,0.08); }
      .tmpl-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
      .tmpl-nome { font-weight:700; font-size:13px; color:#1a1a2e; }
      .tmpl-tipo { font-size:10px; padding:2px 8px; border-radius:10px; font-weight:600; }
      .tmpl-meta { display:flex; align-items:center; gap:6px; color:#64748b; font-size:11px; margin-bottom:6px; }
      .tmpl-fasi-pills { display:flex; flex-wrap:wrap; gap:4px; }
      .tmpl-fase-pill { display:flex; align-items:center; gap:2px; font-size:10px; padding:2px 6px; border-radius:8px; font-weight:500; }
    </style>`;
    templatesHtml += `<div style="display:flex;flex-wrap:wrap;gap:10px;">`;
    const TIPI_FASE_MAP = {
      riscaldamento: { icon: '🏃', color: '#f59e0b' },
      tecnica: { icon: '⚽', color: '#3b82f6' },
      tattica: { icon: '🧠', color: '#8b5cf6' },
      atletica: { icon: '💪', color: '#ef4444' },
      partita: { icon: '🏟️', color: '#22c55e' },
      defaticamento: { icon: '🧘', color: '#6b7280' }
    };
    const TIPO_COLORS = {
      'Tattico': '#8b5cf6', 'Tecnico': '#3b82f6', 'Atletico': '#ef4444',
      'Partita a tema': '#22c55e', 'Possesso palla': '#06b6d4', 'Difensivo': '#f59e0b', 'Misto': '#64748b'
    };
    templates.forEach((t) => {
      const prog = t.programma || {};
      const fasi = prog.fasi || [];
      const durata = fasi.reduce((s, f) => s + (f.durata || 0), 0);
      const tipoColor = TIPO_COLORS[prog.tipo] || '#64748b';
      const fasiPills = fasi.map(f => {
        const info = TIPI_FASE_MAP[f.tipo] || { icon: '📝', color: '#64748b' };
        return `<span class="tmpl-fase-pill" style="background:${info.color}15;color:${info.color};">${info.icon} ${f.durata || 0}'</span>`;
      }).join('');
      templatesHtml += `<div class="tmpl-card">
        <div class="tmpl-header">
          <span class="tmpl-nome">${t.nome}</span>
          <button class="btn btn-secondary btn-small btn-del-template" data-id="${t.id}" style="font-size:10px;padding:2px 6px;">🗑️</button>
        </div>
        ${prog.tipo ? `<span class="tmpl-tipo" style="background:${tipoColor}15;color:${tipoColor};">${prog.tipo}</span>` : ''}
        <div class="tmpl-meta">⏱️ ${durata} min • ${fasi.length} fasi</div>
        <div class="tmpl-fasi-pills">${fasiPills || '<span style="color:#94a3b8;font-size:10px;">Nessuna fase</span>'}</div>
      </div>`;
    });
    templatesHtml += `</div>`;
  }
  templatesHtml += `</div>`;

  let html = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
      <h1 class="page-title">⚙️ Impostazioni Allenamenti</h1>
    </div>
    ${renderConfig(config)}
    ${templatesHtml}
  `;

  c.innerHTML = html;
  attachConfigListeners(trainingData, () => loadTrainingSettings());

  // Delete template
  document.querySelectorAll('.btn-del-template').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Eliminare questo template?')) return;
      demoPersistence.deleteTrainingTemplate(btn.dataset.id);
      loadTrainingSettings();
    });
  });
}
