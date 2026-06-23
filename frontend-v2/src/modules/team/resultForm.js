import { apiFetch } from '../../services/api';
import { showLoading, hideLoading } from '../../utils/ui';

const EVENTI_CONFIG = {
  'GOAL': { icon: '⚽', label: 'Gol', color: '#27AE60', bgColor: '#E8F8F0' },
  'YELLOW': { icon: '🟨', label: 'Amm.', color: '#F39C12', bgColor: '#FFF9E6' },
  'RED': { icon: '🟥', label: 'Esp.', color: '#E74C3C', bgColor: '#FDEDEC' },
  'ASSIST': { icon: '🅰️', label: 'Assist', color: '#3498DB', bgColor: '#EBF5FB' }
};

export async function openResultForm(mid) {
  const match = window.YFM.allMatches.find(m => m.id === mid) || {};
  
  const [formazioneRes, eventiRes, valutazioniRes] = await Promise.all([
    apiFetch('/partite/' + mid + '/formazione').catch(() => ({ formazione: [] })),
    apiFetch('/partite/' + mid + '/dettaglio').catch(() => ({ eventi: [] })),
    apiFetch('/partite/' + mid + '/valutazioni').catch(() => ({ valutazioni: [] }))
  ]);
  
  // Ordina giocatori alfabeticamente per cognome
  const formazione = (formazioneRes.formazione || [])
    .sort((a, b) => (a.cognome || '').localeCompare(b.cognome || ''));
  
  const eventi = eventiRes.eventi || [];
  const valutazioni = valutazioniRes.valutazioni || [];
  
  const eventiMap = {};
  eventi.forEach(e => { if (!eventiMap[e.minuto]) eventiMap[e.minuto] = []; eventiMap[e.minuto].push(e); });
  
  const valutazioniMap = {};
  valutazioni.forEach(v => { valutazioniMap[v.calciatore_id] = v; });
  
  const content = '<div id="resultFormInner"></div>';
  const footer = '<button class="btn btn-secondary" id="modalCancel">Annulla</button><button class="btn btn-primary" id="saveResultBtn">Salva Tutto</button>';
  const modal = createModal('Risultato + Eventi + Valutazioni', content, footer, '900px');
  
  renderForm(formazione, eventiMap, valutazioniMap, mid, modal);
  
  document.getElementById('saveResultBtn').addEventListener('click', () => saveResult(mid, modal));
}

function renderForm(formazione, eventiMap, valutazioniMap, mid, modal) {
  const container = document.getElementById('resultFormInner');
  
  let html = '<style>';
  html += '.rf-modal{max-height:70vh;overflow-y:auto;padding:4px;}';
  html += '.rf-section{margin-bottom:24px;padding:20px;background:#f8f9fa;border-radius:12px;}';
  html += '.rf-section h4{margin:0 0 16px 0;font-size:15px;color:#333;display:flex;align-items:center;gap:8px;}';
  html += '.event-timeline{position:relative;padding-left:24px;}';
  html += '.event-timeline::before{content:"";position:absolute;left:8px;top:0;bottom:0;width:3px;background:linear-gradient(to bottom,#667eea,#764ba2);border-radius:2px;}';
  html += '.event-item{display:flex;align-items:center;gap:12px;margin-bottom:12px;position:relative;}';
  html += '.event-item::before{content:"";position:absolute;left:-20px;top:50%;transform:translateY(-50%);width:12px;height:12px;border-radius:50%;background:white;border:3px solid #667eea;z-index:1;}';
  html += '.event-badge{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:20px;font-size:13px;font-weight:600;}';
  html += '.event-details{flex:1;padding:10px 14px;background:white;border-radius:10px;border:1px solid #eee;}';
  html += '.event-row{display:flex;align-items:center;gap:10px;margin-bottom:8px;}';
  html += '.event-row input, .event-row select{padding:8px 12px;border:1px solid #ddd;border-radius:8px;font-size:13px;}';
  html += '.event-row input:focus, .event-row select:focus{outline:none;border-color:#667eea;}';
  html += '.player-voto{display:flex;align-items:center;justify-content:space-between;padding:12px;background:white;border-radius:10px;margin-bottom:8px;border:1px solid #eee;}';
  html += '.player-voto:hover{border-color:#667eea;}';
  html += '.player-name{font-weight:600;font-size:14px;}';
  html += '.player-pos{font-size:11px;color:#888;margin-top:2px;}';
  html += '.voto-select{padding:10px 16px;border:2px solid #667eea;border-radius:10px;background:white;min-width:80px;text-align:center;font-weight:bold;color:#667eea;font-size:16px;cursor:pointer;}';
  html += '.voto-select:focus{outline:none;border-color:#764ba2;}';
  html += '.note-area{width:100%;padding:8px 12px;border:1px solid #eee;border-radius:8px;font-size:12px;margin-top:8px;}';
  html += '.add-btn{background:linear-gradient(135deg,#667eea,#764ba2);color:white;border:none;padding:12px 20px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;margin-top:12px;}';
  html += '.add-btn:hover{opacity:0.9;}';
  html += '.del-btn{background:#E74C3C;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;}';
  html += '.del-btn:hover{background:#c0392b;}';
  html += '.empty-state{padding:30px;text-align:center;color:#888;font-size:14px;}';
  html += '.time-divider{margin:16px 0 12px 0;display:flex;align-items:center;gap:12px;font-size:11px;color:#667eea;font-weight:700;text-transform:uppercase;}';
  html += '.time-divider::after{content:"";flex:1;height:1px;background:#ddd;}';
  html += '</style>';
  
  html += '<div class="rf-modal">';
  
  // SEZIONE EVENTI con timeline
  html += '<div class="rf-section">';
  html += '<h4>⚽ Eventi Partita</h4>';
  
  if (formazione.length === 0) {
    html += '<div class="empty-state">Nessun giocatore in formazione. Crea prima la formazione.</div>';
  } else {
    // Costruisci lista eventi esistenti raggruppati per tempo
    const primoTempo = [];
    const secondoTempo = [];
    const extraTime = [];
    
    Object.keys(eventiMap).map(Number).sort((a, b) => a - b).forEach(min => {
      eventiMap[min].forEach(evt => {
        if (min <= 45) primoTempo.push({ ...evt, minuto: min });
        else if (min <= 90) secondoTempo.push({ ...evt, minuto: min });
        else extraTime.push({ ...evt, minuto: min });
      });
    });
    
    html += '<div class="event-timeline">';
    
    if (primoTempo.length > 0) {
      html += '<div class="time-divider">1° Tempo</div>';
      primoTempo.forEach(evt => { html += renderEventItem(evt, formazione); });
    }
    
    if (secondoTempo.length > 0) {
      html += '<div class="time-divider">2° Tempo</div>';
      secondoTempo.forEach(evt => { html += renderEventItem(evt, formazione); });
    }
    
    if (extraTime.length > 0) {
      html += '<div class="time-divider">Extratime</div>';
      extraTime.forEach(evt => { html += renderEventItem(evt, formazione); });
    }
    
    if (primoTempo.length === 0 && secondoTempo.length === 0 && extraTime.length === 0) {
      html += '<div class="empty-state">Nessun evento registrato. Usa il pulsante qui sotto per aggiungerne.</div>';
    }
    
    html += '</div>';
  }
  
  html += '<button type="button" class="add-btn" id="addEventBtn">+ Aggiungi Evento</button>';
  html += '</div>';
  
  // SEZIONE VALUTAZIONI
  html += '<div class="rf-section">';
  html += '<h4>⭐ Valutazioni Giocatori</h4>';
  html += '<p style="font-size:12px;color:#888;margin:0 0 16px 0;">Assegna un voto da 4 a 10 per ogni giocatore</p>';
  
  if (formazione.length === 0) {
    html += '<div class="empty-state">Nessun giocatore in formazione.</div>';
  } else {
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;">';
    
    formazione.forEach(g => {
      const existing = valutazioniMap[g.id] || {};
      const cfg = { 'Titolare': '#27AE60', 'Panchina': '#F39C12' };
      const posColor = cfg[g.posizione] || '#888';
      
      html += '<div class="player-voto">';
      html += '<div>';
      html += '<div class="player-name">' + (g.cognome || '').toUpperCase() + ' ' + (g.nome || '') + '</div>';
      html += '<div class="player-pos" style="color:' + posColor + ';">' + (g.posizione || '') + '</div>';
      html += '<input type="text" class="note-area" placeholder="Note allenatore..." value="' + (existing.nota_allenatore || '') + '" data-nota-id="' + g.id + '">';
      html += '</div>';
      html += '<select class="voto-select" data-voto-id="' + g.id + '">';
      html += '<option value="">-</option>';
      for (let v = 4; v <= 10; v += 0.5) {
        html += '<option value="' + v + '"' + (existing.voto == v ? ' selected' : '') + '>' + v.toString().replace('.', ',') + '</option>';
      }
      html += '</select>';
      html += '</div>';
    });
    
    html += '</div>';
  }
  html += '</div>';
  
  html += '</div>'; // rf-modal
  
  container.innerHTML = html;
  
  // Gestisci aggiunta evento
  document.getElementById('addEventBtn').addEventListener('click', () => {
    const timeline = container.querySelector('.event-timeline');
    const emptyState = container.querySelector('.empty-state');
    if (emptyState) emptyState.remove();
    
    const newItem = document.createElement('div');
    newItem.className = 'event-item';
    newItem.innerHTML = renderEventRowHTML(formazione);
    newItem.querySelector('.del-btn').addEventListener('click', () => {
      newItem.remove();
    });
    timeline.appendChild(newItem);
  });
}

function renderEventItem(evt, formazione) {
  const cfg = EVENTI_CONFIG[evt.tipo] || { icon: '●', label: evt.tipo, color: '#888', bgColor: '#f0f0f0' };
  const playerName = formazione.find(g => g.id === evt.principale_id || g.calciatore_id === evt.principale_id);
  
  return '<div class="event-item">' +
    '<span class="event-badge" style="background:' + cfg.bgColor + ';color:' + cfg.color + ';border:2px solid ' + cfg.color + ';">' +
    cfg.icon + ' ' + cfg.label + ' <strong>' + evt.minuto + '\'</strong></span>' +
    '<div class="event-details">' +
    '<div class="event-row">' +
    '<input type="number" value="' + evt.minuto + '" class="evt-minimo" style="width:60px;" min="1" max="120">' +
    '<select class="evt-tipo">' +
    Object.entries(EVENTI_CONFIG).map(([k, v]) => '<option value="' + k + '"' + (evt.tipo === k ? ' selected' : '') + '>' + v.icon + ' ' + v.label + '</option>').join('') +
    '</select>' +
    '</div>' +
    '<select class="evt-giocatore" style="width:100%;">' +
    '<option value="">Seleziona giocatore...</option>' +
    formazione.map(g => '<option value="' + (g.id || g.calciatore_id) + '">' + (g.cognome || '').toUpperCase() + ' ' + (g.nome || '') + '</option>').join('') +
    '</select>' +
    '</div>' +
    '<button type="button" class="del-btn" onclick="if(confirm(\'Eliminare?\'))this.closest(\'.event-item\').remove()">✕</button>' +
    '</div>';
}

function renderEventRowHTML(formazione) {
  return '<div class="event-details" style="flex:1;">' +
    '<div class="event-row">' +
    '<input type="number" placeholder="Min" class="evt-minimo" style="width:60px;" min="1" max="120">' +
    '<select class="evt-tipo">' +
    Object.entries(EVENTI_CONFIG).map(([k, v]) => '<option value="' + k + '">' + v.icon + ' ' + v.label + '</option>').join('') +
    '</select>' +
    '</div>' +
    '<select class="evt-giocatore" style="width:100%;">' +
    '<option value="">Seleziona giocatore...</option>' +
    formazione.map(g => '<option value="' + (g.id || g.calciatore_id) + '">' + (g.cognome || '').toUpperCase() + ' ' + (g.nome || '') + '</option>').join('') +
    '</select>' +
    '</div>' +
    '<button type="button" class="del-btn">✕</button>';
}

async function saveResult(mid, modal) {
  showLoading();
  try {
    // Raccogli valutazioni
    const valutazioni = [];
    document.querySelectorAll('.voto-select').forEach(sel => {
      const playerId = sel.dataset.votoId;
      const voto = sel.value;
      const nota = document.querySelector('[data-nota-id="' + playerId + '"]').value;
      if (voto) valutazioni.push({ calciatore_id: playerId, voto: parseFloat(voto), nota_allenatore: nota || null });
    });
    
    await apiFetch('/partite/' + mid + '/valutazioni', { 
      method: 'POST', 
      body: JSON.stringify({ valutazioni }) 
    }).catch(() => ({}));
    
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
  modal.innerHTML = '<div class="modal-content" style="max-width:' + (maxW || '600px') + ';"><div class="modal-header"><h2>' + title + '</h2><button class="modal-close-btn" id="modalCloseX">×</button></div><div class="modal-body">' + content + '</div>' + (footer ? '<div class="modal-footer">' + footer + '</div>' : '') + '</div>';
  document.body.appendChild(modal);
  const close = () => { const m = document.getElementById('currentModal'); if (m) m.remove(); };
  document.getElementById('modalCloseX').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  const cancelBtn = document.getElementById('modalCancel');
  if (cancelBtn) cancelBtn.addEventListener('click', close);
  return { modal, closeModal: close, close };
}
