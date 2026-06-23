import { apiFetch } from '../../services/api';
import { showLoading, hideLoading } from '../../utils/ui';

export async function openResultForm(mid) {
  const match = window.YFM.allMatches.find(m => m.id === mid) || {};
  
  const [formazioneRes, eventiRes, valutazioniRes] = await Promise.all([
    apiFetch('/partite/' + mid + '/formazione').catch(() => ({ formazione: [] })),
    apiFetch('/partite/' + mid + '/dettaglio').catch(() => ({ eventi: [] })),
    apiFetch('/partite/' + mid + '/valutazioni').catch(() => ({ valutazioni: [] }))
  ]);
  
  const formazione = formazioneRes.formazione || [];
  const eventi = eventiRes.eventi || [];
  const valutazioni = valutazioniRes.valutazioni || [];
  
  const eventiMap = {};
  eventi.forEach(e => { if (!eventiMap[e.minuto]) eventiMap[e.minuto] = []; eventiMap[e.minuto].push(e); });
  
  const valutazioniMap = {};
  valutazioni.forEach(v => { valutazioniMap[v.calciatore_id] = v; });
  
  const content = '<div id="resultFormInner"></div>';
  const footer = '<button class="btn btn-secondary" id="modalCancel">Annulla</button><button class="btn btn-primary" id="saveResultBtn">Salva Tutto</button>';
  const modal = createModal('Risultato + Eventi + Valutazioni', content, footer, '900px');
  
  renderForm(formazione, eventiMap, valutazioniMap);
  document.getElementById('saveResultBtn').addEventListener('click', () => saveResult(mid, modal));
}

function renderForm(formazione, eventiMap, valutazioniMap) {
  const container = document.getElementById('resultFormInner');
  
  let html = '<style>';
  html += '.rf-section{margin-bottom:20px;padding:16px;background:#f8f9fa;border-radius:12px;}';
  html += '.rf-section h4{margin:0 0 12px 0;font-size:14px;color:#333;}';
  html += '.event-row{display:flex;align-items:center;gap:8px;margin-bottom:8px;padding:8px;background:white;border-radius:8px;}';
  html += '.event-row input, .event-row select{padding:6px 10px;border:1px solid #ddd;border-radius:6px;font-size:13px;}';
  html += '.player-voto{display:flex;align-items:center;justify-content:space-between;padding:10px;background:white;border-radius:8px;margin-bottom:6px;}';
  html += '.voto-select{padding:8px 12px;border:2px solid #667eea;border-radius:8px;background:white;min-width:70px;text-align:center;font-weight:bold;color:#667eea;}';
  html += '.note-area{width:100%;padding:6px 10px;border:1px solid #ddd;border-radius:6px;font-size:12px;margin-top:4px;}';
  html += '.add-btn{background:#667eea;color:white;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;}';
  html += '.del-btn{background:#E74C3C;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:11px;}';
  html += '</style>';
  
  html += '<div class="rf-section"><h4>Eventi Partita</h4><div id="eventiList">';
  const minutiUsati = Object.keys(eventiMap).map(Number).sort((a, b) => a - b);
  minutiUsati.forEach(min => {
    eventiMap[min].forEach(evt => {
      html += renderEventRow(evt, formazione);
    });
  });
  html += '</div><button type="button" class="add-btn" onclick="addEventRow()">+ Aggiungi Evento</button></div>';
  
  html += '<div class="rf-section"><h4>Valutazioni Giocatori</h4><p style="font-size:12px;color:#888;margin:0 0 12px 0;">Assegna un voto da 4 a 10 per ogni giocatore</p><div id="valutazioniList">';
  formazione.forEach(g => {
    const existing = valutazioniMap[g.id] || {};
    html += '<div class="player-voto"><div style="flex:1;">';
    html += '<strong>' + (g.cognome || '').toUpperCase() + ' ' + (g.nome || '') + '</strong>';
    html += '<span style="color:#888;font-size:12px;margin-left:8px;">(' + (g.posizione || '') + ')</span>';
    html += '<input type="text" class="note-area" placeholder="Note..." value="' + (existing.nota_allenatore || '') + '" data-nota-id="' + g.id + '"></div>';
    html += '<select class="voto-select" data-voto-id="' + g.id + '"><option value="">-</option>';
    for (let v = 4; v <= 10; v += 0.5) {
      html += '<option value="' + v + '"' + (existing.voto == v ? ' selected' : '') + '>' + v.toString().replace('.', ',') + '</option>';
    }
    html += '</select></div>';
  });
  if (formazione.length === 0) html += '<p style="color:#888;">Nessun giocatore in formazione.</p>';
  html += '</div></div>';
  
  container.innerHTML = html;
  
  window.addEventRow = function() {
    const list = document.getElementById('eventiList');
    const row = document.createElement('div');
    row.className = 'event-row';
    row.innerHTML = '<input type="number" placeholder="Min" class="evt-minimo" style="width:60px;" min="1" max="120">';
    row.innerHTML += '<select class="evt-tipo"><option value="GOAL">Gol</option><option value="YELLOW">Amm.</option><option value="RED">Esp.</option></select>';
    row.innerHTML += '<select class="evt-giocatore"><option value="">Giocatore...</option>' + formazione.map(g => '<option value="' + g.id + '">' + g.cognome + '</option>').join('') + '</select>';
    row.innerHTML += '<button type="button" class="del-btn" onclick="this.parentElement.remove()">X</button>';
    list.appendChild(row);
  };
}

function renderEventRow(evt, formazione) {
  const playersHtml = formazione.map(g => '<option value="' + g.id + '">' + g.cognome + '</option>').join('');
  return '<div class="event-row">' +
    '<input type="number" value="' + evt.minuto + '" class="evt-minimo" style="width:60px;" min="1" max="120">' +
    '<select class="evt-tipo"><option value="GOAL"' + (evt.tipo === 'GOAL' ? ' selected' : '') + '>Gol</option><option value="YELLOW"' + (evt.tipo === 'YELLOW' ? ' selected' : '') + '>Amm.</option><option value="RED"' + (evt.tipo === 'RED' ? ' selected' : '') + '>Esp.</option></select>' +
    '<select class="evt-giocatore"><option value="">Giocatore...</option>' + playersHtml + '</select>' +
    '<button type="button" class="del-btn" onclick="if(confirm(\'Eliminare?\'))this.parentElement.remove()">X</button>' +
    '</div>';
}

async function saveResult(mid, modal) {
  showLoading();
  try {
    const valutazioni = [];
    document.querySelectorAll('.voto-select').forEach(sel => {
      const playerId = sel.dataset.votoId;
      const voto = sel.value;
      const nota = document.querySelector('[data-nota-id="' + playerId + '"]').value;
      if (voto) valutazioni.push({ calciatore_id: playerId, voto: parseFloat(voto), nota_allenatore: nota || null });
    });
    
    await apiFetch('/partite/' + mid + '/valutazioni', { method: 'POST', body: JSON.stringify({ valutazioni }) }).catch(() => ({}));
    
    hideLoading();
    modal.close();
    alert('Valutazioni salvate!');
    if (window.YFM?.loadCalendar) window.YFM.loadCalendar();
  } catch (err) {
    hideLoading();
    alert('Errore: ' + err.message);
  }
}

function createModal(title, content, footer, maxW) {
  const existing = document.getElementById('currentModal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'currentModal';
  modal.innerHTML = '<div class="modal-content" style="max-width:' + (maxW || '600px') + ';"><div class="modal-header"><h2>' + title + '</h2><button class="modal-close-btn" id="modalCloseX">x</button></div><div class="modal-body">' + content + '</div>' + (footer ? '<div class="modal-footer">' + footer + '</div>' : '') + '</div>';
  document.body.appendChild(modal);
  const close = () => { const m = document.getElementById('currentModal'); if (m) m.remove(); };
  document.getElementById('modalCloseX').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  const cancelBtn = document.getElementById('modalCancel');
  if (cancelBtn) cancelBtn.addEventListener('click', close);
  return { modal, closeModal: close, close };
}
