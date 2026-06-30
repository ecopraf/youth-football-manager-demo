/**
 * trainingConfig.js - Settimana tipo (collassabile) e riepilogo presenze
 */

import { formatDateShort, formatTime } from '../../utils/formatters';
import { showLoading, hideLoading } from '../../utils/ui';
import { apiFetch } from '../../services/api';
import demoPersistence from '../demo/DemoPersistence';

/**
 * Renderizza la sezione "Settimana Tipo" (collassabile)
 */
export function renderConfig(config) {
  const giorni = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

  let html = `<div class="card" style="margin-bottom:16px;">
    <div style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;" id="configToggle">
      <h3 class="section-title" style="margin-bottom:0;">📅 Settimana Tipo</h3>
      <span id="configArrow" style="font-size:14px;color:#6c757d;">▼</span>
    </div>
    <div id="configContent" style="margin-top:12px;">
      ${config.length === 0
        ? '<p style="color:var(--gray);">Nessun allenamento configurato. Clicca "+ Configura" per aggiungere.</p>'
        : config.map(c => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="background:#667eea;color:white;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;">${giorni[c.giorno_settimana]}</span>
              <span style="font-size:13px;">${formatTime(c.ora_inizio)} - ${formatTime(c.ora_fine)}</span>
              <span style="font-size:12px;color:#6c757d;">${c.luogo || ''}</span>
            </div>
            <div style="display:flex;gap:4px;">
              <button class="btn btn-secondary btn-small btn-edit-config" data-tid="${c.id}" data-g="${c.giorno_settimana}" data-i="${c.ora_inizio}" data-f="${c.ora_fine}" data-l="${c.luogo || ''}">✏️</button>
              <button class="btn btn-secondary btn-small btn-del-config" data-tid="${c.id}">🗑️</button>
            </div>
          </div>
        `).join('')}
      <button class="btn btn-primary btn-small" id="btnAddConfig" style="margin-top:12px;">+ Aggiungi giorno</button>
    </div>
  </div>`;

  return html;
}

/**
 * Renderizza la tabella riepilogo presenze
 */
export function renderSummary(giocatori, summary, settimana) {
  const sorted = [...giocatori].sort((a, b) => a.cognome.localeCompare(b.cognome));

  let html = `<div class="card" style="margin-bottom:20px;">
    <h3 class="section-title">📊 Riepilogo Presenze 
      <span style="font-size:12px;color:var(--gray);font-weight:normal;">
        (${settimana.da ? formatDateShort(settimana.da) : ''} - ${settimana.a ? formatDateShort(settimana.a) : ''})
      </span>
    </h3>
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead><tr style="background:#F8F9FA;">
          <th style="padding:8px;text-align:center;">#</th>
          <th style="padding:8px;text-align:left;">Calciatore</th>
          <th style="padding:8px;text-align:center;">Tot.</th>
          <th style="padding:8px;text-align:center;color:#27AE60;">Pres.</th>
          <th style="padding:8px;text-align:center;color:#E74C3C;">Ass.</th>
          <th style="padding:8px;text-align:right;color:#666;">% Pres.</th>
          <th style="padding:8px;text-align:center;color:#E74C3C;">Ass. Sett.</th>
        </tr></thead>
        <tbody>${sorted.map((g, i) => {
          const s = summary[g.id] || { totali: 0, presenti: 0, assenti: 0, assentiSett: 0 };
          const perc = s.totali > 0 ? Math.round((s.presenti / s.totali) * 100) : 0;
          const percColor = perc >= 80 ? '#22c55e' : perc >= 60 ? '#f59e0b' : '#ef4444';
          return `<tr style="border-bottom:1px solid #f8f8f8;">
            <td style="padding:8px;text-align:center;color:var(--gray);">${i + 1}</td>
            <td style="padding:8px;text-align:left;">${g.nome} ${g.cognome}</td>
            <td style="padding:8px;text-align:center;">${s.totali}</td>
            <td style="padding:8px;text-align:center;color:#27AE60;font-weight:600;">${s.presenti}</td>
            <td style="padding:8px;text-align:center;color:#E74C3C;font-weight:600;">${s.assenti}</td>
            <td style="padding:8px;text-align:right;"><span style="color:${percColor};font-weight:600;">${perc}%</span></td>
            <td style="padding:8px;text-align:center;color:#E74C3C;">${s.assentiSett || 0}</td>
          </tr>`;
        }).join('')}</tbody>
      </table>
    </div>
  </div>`;

  return html;
}

/**
 * Attacca i listener per la config
 */
export function attachConfigListeners(trainingData, onReload) {
  // Toggle collassabile
  const toggle = document.getElementById('configToggle');
  const content = document.getElementById('configContent');
  const arrow = document.getElementById('configArrow');
  if (toggle && content) {
    toggle.addEventListener('click', () => {
      const isHidden = content.style.display === 'none';
      content.style.display = isHidden ? 'block' : 'none';
      if (arrow) arrow.textContent = isHidden ? '▼' : '▶';
    });
  }

  // Aggiungi config
  document.getElementById('btnAddConfig')?.addEventListener('click', () => {
    openConfigForm(null, null, null, null, null, trainingData, onReload);
  });

  // Edit config
  document.querySelectorAll('.btn-edit-config').forEach(b => {
    b.addEventListener('click', () => {
      openConfigForm(b.dataset.tid, b.dataset.g, b.dataset.i, b.dataset.f, b.dataset.l, trainingData, onReload);
    });
  });

  // Delete config
  document.querySelectorAll('.btn-del-config').forEach(b => {
    b.addEventListener('click', async () => {
      if (!b.dataset.tid) return;
      if (!confirm('Eliminare questa configurazione?')) return;
      const isDemo = localStorage.getItem('yfm_demo_session') === 'active';
      if (isDemo) {
        demoPersistence.deleteTrainingConfig(b.dataset.tid, trainingData.config);
      } else {
        await apiFetch('/allenamenti/config/' + b.dataset.tid, { method: 'DELETE' });
      }
      onReload();
    });
  });
}

/**
 * Apre il form per aggiungere/modificare una configurazione
 */
function openConfigForm(tid, g, i, f, l, trainingData, onReload) {
  g = g || 1; i = i || '17:00'; f = f || '18:30'; l = l || '';
  const giorni = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

  const existing = document.getElementById('currentModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'currentModal';
  modal.innerHTML = `<div class="modal-content" style="max-width:500px;">
    <div class="modal-header"><h2>${tid ? 'Modifica' : 'Nuovo'} Giorno Allenamento</h2><button class="modal-close-btn" id="modalCloseX">×</button></div>
    <div class="modal-body">
      <div class="form-group" style="margin-bottom:12px;">
        <label>Giorno</label>
        <select id="tfG">${giorni.map((gn, ix) => `<option value="${ix}" ${parseInt(g) === ix ? 'selected' : ''}>${gn}</option>`).join('')}</select>
      </div>
      <div class="form-grid">
        <div class="form-group"><label>Inizio</label><input id="tfI" type="time" value="${i}"></div>
        <div class="form-group"><label>Fine</label><input id="tfF" type="time" value="${f}"></div>
      </div>
      <div class="form-group" style="margin-top:12px;"><label>Luogo</label><input id="tfL" value="${l}"></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary modal-close-btn">Annulla</button>
      <button class="btn btn-primary" id="saveConfigBtn">${tid ? 'Aggiorna' : 'Salva'}</button>
    </div>
  </div>`;
  document.body.appendChild(modal);

  const close = () => { document.getElementById('currentModal')?.remove(); };

  setTimeout(() => {
    document.querySelectorAll('#currentModal .modal-close-btn').forEach(btn => btn.addEventListener('click', close));
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
  }, 50);

  document.getElementById('saveConfigBtn').addEventListener('click', async () => {
    const isDemo = localStorage.getItem('yfm_demo_session') === 'active';
    const data = {
      id: tid || `cfg_${Date.now()}`,
      giorno_settimana: parseInt(document.getElementById('tfG').value),
      ora_inizio: document.getElementById('tfI').value,
      ora_fine: document.getElementById('tfF').value,
      luogo: document.getElementById('tfL').value
    };

    showLoading();
    try {
      if (isDemo) {
        demoPersistence.updateTrainingConfig(tid || data.id, data, trainingData.config);
      } else if (tid) {
        await apiFetch('/allenamenti/config/' + tid, { method: 'PUT', body: JSON.stringify(data) });
      } else {
        await apiFetch('/squadre/' + window.YFM.squadraId + '/allenamenti/config', { method: 'POST', body: JSON.stringify(data) });
      }
      hideLoading();
      close();
      onReload();
    } catch (e) {
      hideLoading();
      alert('Errore: ' + e.message);
    }
  });
}
