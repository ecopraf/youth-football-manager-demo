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
    templatesHtml += `<div style="display:flex;flex-wrap:wrap;gap:8px;">`;
    templates.forEach((t, i) => {
      templatesHtml += `<div style="background:#f8f9fa;border:1px solid #eee;border-radius:10px;padding:10px 14px;font-size:12px;">
        <strong>${t.nome}</strong><br>
        <span style="color:#6c757d;">${t.programma?.tipo || ''} • ${t.programma?.fasi?.length || 0} fasi</span>
        <button class="btn btn-secondary btn-small btn-del-template" data-id="${t.id}" style="margin-left:8px;font-size:10px;">🗑️</button>
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
