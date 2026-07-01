/**
 * trainingPresenze.js - Pagina "Presenze"
 * Calendario per selezionare giorno + gestione presenze/assenze + riepilogo stagionale
 */

import { renderCalendar, attachCalendarListeners, setOnDateSelect, selectTodayIfTraining, getSelectedDate } from './trainingCalendar';
import { renderSummary } from './trainingConfig';
import { loadTrainingData } from './trainingData';
import { getAvatarColor } from '../../utils/formatters';
import { showLoading, hideLoading } from '../../utils/ui';
import demoPersistence from '../demo/DemoPersistence';

const MOTIVI_ASSENZA = [
  { value: '', label: 'Nessun motivo' },
  { value: 'Impegni Scolastici', label: '📚 Impegni Scolastici' },
  { value: 'Motivi Familiari', label: '👨‍👩‍👧 Motivi Familiari' },
  { value: 'Infortunio', label: '🏥 Infortunio' },
  { value: 'Malattia', label: '🤒 Malattia' }
];

let _trainingData = null;

export default async function loadTrainingPresenze() {
  const c = document.getElementById('pageContent');
  c.innerHTML = '<div class="loading"><div class="spinner"></div>Caricamento...</div>';

  _trainingData = await loadTrainingData();
  if (!_trainingData) return;

  const { config, allenamenti, partite, giocatori, summary, settimana } = _trainingData;

  selectTodayIfTraining(config);

  setOnDateSelect((date) => {
    const container = document.getElementById('presenzeDetail');
    if (!container) return;
    container.innerHTML = renderPresenzeDetail(date, _trainingData);
    attachPresenzeListeners(date);
  });

  window._trainingRefreshCalendar = () => {
    const calEl = document.getElementById('trainingCalendar');
    if (calEl) {
      calEl.innerHTML = renderCalendar(config, allenamenti, partite);
      attachCalendarListeners();
    }
  };

  let html = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
      <h1 class="page-title">🙋 Presenze - ${window.YFM.getSquadraName()}</h1>
    </div>
    <div class="card" style="margin-bottom:16px;">
      <div id="trainingCalendar">${renderCalendar(config, allenamenti, partite)}</div>
    </div>
    <div class="card" style="margin-bottom:16px;" id="presenzeDetail">
      ${renderPresenzeDetail(getSelectedDate(), _trainingData)}
    </div>
    ${renderSummary(giocatori, summary, settimana)}
  `;

  c.innerHTML = html;
  attachCalendarListeners();
  attachPresenzeListeners(getSelectedDate());
}

function renderPresenzeDetail(date, trainingData) {
  if (!date) {
    return `<div style="text-align:center;padding:40px;color:#6c757d;">
      <p style="font-size:16px;">📅 Seleziona un giorno dal calendario</p>
      <p style="font-size:13px;">Clicca su un giorno con il pallino verde per gestire le presenze</p>
    </div>`;
  }

  const { allenamenti, giocatori } = trainingData;
  const allenamento = (allenamenti || []).find(a => a.data === date);
  const giorni = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  const d = new Date(date);
  const dayLabel = giorni[d.getDay()] + ' ' + d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();

  const motivi = allenamento?.motivi_assenza || {};
  const sorted = [...(giocatori || [])].sort((a, b) => a.cognome.localeCompare(b.cognome));
  const presentiCount = allenamento?.presenze?.length || 0;
  const assentiCount = allenamento?.assenti?.length || 0;
  const hasData = presentiCount > 0 || assentiCount > 0;

  let html = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
    <div style="font-size:15px;font-weight:600;color:#1a1a2e;">👥 ${dayLabel}</div>
    <span style="font-size:11px;padding:4px 10px;border-radius:12px;font-weight:600;${hasData ? 'background:#d1fae5;color:#065f46;' : 'background:#fef3c7;color:#92400e;'}">${hasData ? '✅ Registrata' : '🆕 Da compilare'}</span>
  </div>`;

  html += `<div style="display:flex;gap:16px;margin-bottom:12px;font-size:13px;">
    <span style="color:#22c55e;">✅ ${presentiCount} presenti</span>
    <span style="color:#ef4444;">❌ ${assentiCount} assenti</span>
    <span style="color:#6c757d;">👥 ${sorted.length} totali</span>
  </div>`;

  html += `<p style="margin-bottom:8px;font-size:12px;color:#6c757d;">Segna <span style="color:#E74C3C;font-weight:600;">ASSENTE</span>:</p>`;
  html += `<div id="presenzeList">`;

  sorted.forEach(g => {
    const isAssente = allenamento?.assenti?.includes(g.id) || false;
    const motivoSelezionato = motivi[g.id] || '';

    html += `<div class="convocation-item" style="flex-wrap:wrap;gap:8px;">
      <div style="display:flex;align-items:center;gap:8px;min-width:200px;">
        <input type="checkbox" ${isAssente ? 'checked' : ''} data-pid="${g.id}" class="pres-check" style="width:20px;height:20px;cursor:pointer;accent-color:#E74C3C;">
        <div class="player-avatar" style="width:28px;height:28px;font-size:11px;background:${getAvatarColor(g.nome)};">${g.nome[0]}${g.cognome[0]}</div>
        <span style="font-size:13px;">${g.nome} ${g.cognome}</span>
      </div>
      <div style="display:flex;align-items:center;gap:4px;">
        <select data-pid="${g.id}" class="pres-motivo" style="padding:4px 8px;border-radius:6px;border:1px solid #e2e8f0;font-size:11px;${isAssente ? '' : 'opacity:0.4;'}" ${isAssente ? '' : 'disabled'}>
          ${MOTIVI_ASSENZA.map(m => `<option value="${m.value}" ${m.value === motivoSelezionato ? 'selected' : ''}>${m.label}</option>`).join('')}
        </select>
      </div>
    </div>`;
  });

  html += `</div>`;
  html += `<div style="margin-top:16px;"><button class="btn btn-primary" id="btnSavePresenze">💾 Salva Presenze</button></div>`;

  return html;
}

function attachPresenzeListeners(date) {
  if (!date) return;

  // Toggle motivo select
  document.querySelectorAll('.pres-check').forEach(cb => {
    cb.addEventListener('change', () => {
      const select = document.querySelector(`.pres-motivo[data-pid="${cb.dataset.pid}"]`);
      if (select) {
        select.disabled = !cb.checked;
        select.style.opacity = cb.checked ? '1' : '0.4';
      }
    });
  });

  // Salva
  document.getElementById('btnSavePresenze')?.addEventListener('click', () => {
    const presenti = [];
    const assenti = [];
    const motiviAssenza = {};

    document.querySelectorAll('.pres-check').forEach(cb => {
      if (cb.checked) {
        assenti.push(cb.dataset.pid);
        const select = document.querySelector(`.pres-motivo[data-pid="${cb.dataset.pid}"]`);
        if (select && select.value) motiviAssenza[cb.dataset.pid] = select.value;
      } else {
        presenti.push(cb.dataset.pid);
      }
    });

    showLoading();

    let allenamento = _trainingData.allenamenti?.find(a => a.data === date);
    if (!allenamento) {
      allenamento = {
        id: `tr_${Date.now()}`,
        data: date,
        presenze: presenti,
        assenti: assenti,
        motivi_assenza: motiviAssenza
      };
      demoPersistence.addTraining(allenamento);
    } else {
      allenamento.presenze = presenti;
      allenamento.assenti = assenti;
      allenamento.motivi_assenza = motiviAssenza;
      demoPersistence.saveTrainingPresence(allenamento.id, { presenti, assenti, motivi: motiviAssenza });
    }

    hideLoading();
    alert('✅ Presenze salvate!');
    loadTrainingPresenze();
  });
}
