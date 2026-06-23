import { apiFetch } from '../../services/api.js';
import { showLoading, hideLoading } from '../../utils/ui.js';

const EVENTI_CONFIG = {
  'GOAL': { icon: '⚽', label: 'Gol Fatto', color: '#27AE60', bgColor: '#E8F8F0' },
  'GOAL_SUBITO': { icon: '⚽', label: 'Gol Subito', color: '#E74C3C', bgColor: '#FDEDEC' },
  'YELLOW': { icon: '🟨', label: 'Amm.', color: '#F39C12', bgColor: '#FFF9E6' },
  'RED': { icon: '🟥', label: 'Esp.', color: '#E74C3C', bgColor: '#FDEDEC' },
  'ASSIST': { icon: '🅰️', label: 'Assist', color: '#3498DB', bgColor: '#EBF5FB' }
};

export async function openResultForm(mid) {
  const match = window.YFM.allMatches.find(m => m.id === mid) || {};
  const isPast = new Date(match.data_ora) < new Date();
  
  // Carica formazione
  let formazione = [];
  try {
    const res = await apiFetch('/partite/' + mid + '/formazione');
    formazione = Array.isArray(res) ? res : (res.formazione || []);
  } catch(e) {}
  
  // Se vuota, carica convocati
  if (formazione.length === 0) {
    try {
      const convRes = await apiFetch('/partite/' + mid + '/convocazioni');
      const convocati = (convRes.convocazioni || []).filter(c => c.presente);
      if (convocati.length > 0) {
        const rosaRes = await apiFetch('/squadre/' + window.YFM.squadraId + '/calciatori').catch(() => []);
        const rosaMap = {};
        (rosaRes || []).forEach(g => { rosaMap[g.id] = g; });
        formazione = convocati.map(c => {
          const g = rosaMap[c.calciatoreId] || {};
          return { id: c.calciatoreId, calciatore_id: c.calciatoreId, nome: g.nome || '', cognome: g.cognome || '', posizione: 'Convocato' };
        });
      }
    } catch(e) {}
  }
  
  // Carica eventi
  let eventi = [];
  try {
    const detRes = await apiFetch('/partite/' + mid + '/dettaglio');
    eventi = detRes.eventi || [];
  } catch(e) {}
  
  // Carica valutazioni
  let valutazioniMap = {};
  try {
    const valRes = await apiFetch('/partite/' + mid + '/valutazioni');
    (valRes.valutazioni || []).forEach(v => { valutazioniMap[v.calciatore_id] = v; });
  } catch(e) {}
  
  // Ordina alfabeticamente
  formazione.sort((a, b) => (a.cognome || '').localeCompare(b.cognome || ''));
  
  const content = '<div id="rfInner"></div>';
  const buttons = isPast 
    ? '<button class="btn btn-secondary" id="modalCancel">Chiudi</button>'
    : '<button class="btn btn-secondary" id="modalCancel">Annulla</button><button class="btn btn-primary" id="saveBtn">💾 Salva Tutto</button>';
  const modal = createModal('Risultato + Eventi', content, buttons, '900px');
  
  renderContent(formazione, eventi, valutazioniMap, isPast);
  
  if (!isPast) {
    document.getElementById('saveBtn').addEventListener('click', () => saveAll(mid, modal));
  }
}

function renderContent(formazione, eventi, valutazioniMap, isPast) {
  const container = document.getElementById('rfInner');
  
  // Calcola risultato
  const golFatti = eventi.filter(e => e.tipo === 'GOAL').length;
  const golSubiti = eventi.filter(e => e.tipo === 'GOAL_SUBITO').length;
  
  let html = '<style>';
  html += '.rf{max-height:70vh;overflow-y:auto;padding:8px;}';
  html += '.sec{margin-bottom:20px;padding:16px;background:#f8f9fa;border-radius:12px;}';
  html += '.sec h4{margin:0 0 12px;font-size:14px;color:#333;}';
  html += '.score{text-align:center;padding:20px;background:white;border-radius:12px;border:2px solid #667eea;margin-bottom:16px;}';
  html += '.score-num{font-size:56px;font-weight:bold;}';
  html += '.score-label{font-size:12px;color:#888;}';
  html += '.timeline{padding-left:20px;position:relative;}';
  html += '.timeline::before{content:"";position:absolute;left:6px;top:0;bottom:0;width:3px;background:linear-gradient(#667eea,#764ba2);}';
  html += '.evt{display:flex;align-items:center;gap:10px;margin-bottom:10px;position:relative;}';
  html += '.evt::before{content:"";position:absolute;left:-18px;top:50%;transform:translateY(-50%);width:10px;height:10px;border-radius:50%;background:white;border:2px solid #667eea;}';
  html += '.evt-badge{padding:6px 12px;border-radius:16px;font-size:12px;font-weight:600;min-width:110px;text-align:center;}';
  html += '.evt-det{flex:1;padding:10px;background:white;border-radius:8px;border:1px solid #eee;}';
  html += '.evt-row{display:flex;gap:8px;margin-bottom:6px;}';
  html += '.evt-row input,.evt-row select{padding:6px 10px;border:1px solid #ddd;border-radius:6px;font-size:12px;}';
  html += '.pv{display:flex;align-items:center;justify-content:space-between;padding:10px;background:white;border-radius:8px;margin-bottom:6px;border:1px solid #eee;}';
  html += '.pv:hover{border-color:#667eea;}';
  html += '.pv-nome{font-weight:600;font-size:13px;}';
  html += '.pv-pos{font-size:10px;color:#888;}';
  html += '.vs{padding:8px 12px;border:2px solid #667eea;border-radius:8px;background:white;font-weight:bold;color:#667eea;font-size:16px;min-width:70px;text-align:center;}';
  html += '.na{width:100%;padding:6px 8px;border:1px solid #eee;border-radius:6px;font-size:11px;margin-top:4px;}';
  html += '.abtn{background:linear-gradient(#667eea,#764ba2);color:white;border:none;padding:10px 16px;border-radius:8px;cursor:pointer;font-size:13px;width:100%;}';
  html += '.dbtn{background:#E74C3C;color:white;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:11px;}';
  html += '.empty{padding:24px;text-align:center;color:#888;font-size:13px;}';
  html += '.tdiv{margin:12px 0 8px;font-size:10px;color:#667eea;font-weight:700;text-transform:uppercase;}';
  html += '.tdiv::after{content:"";display:block;height:1px;background:#ddd;margin-top:4px;}';
  html += '</style>';
  
  html += '<div class="rf">';
  
  // RISULTATO
  html += '<div class="sec">';
  html += '<h4>📊 Risultato</h4>';
  html += '<div class="score">';
  html += '<div class="score-num">';
  html += '<span style="color:#27AE60;">' + golFatti + '</span>';
  html += ' - ';
  html += '<span style="color:#E74C3C;">' + golSubiti + '</span>';
  html += '</div>';
  html += '<div class="score-label">SSD Albalonga - Avversario</div>';
  html += '</div>';
  html += '</div>';
  
  // EVENTI
  html += '<div class="sec">';
  html += '<h4>⚽ Eventi</h4>';
  
  if (formazione.length === 0) {
    html += '<div class="empty">Nessun giocatore. Crea prima convocazioni.</div>';
  } else {
    // Raggruppa per tempo
    const p1 = [], p2 = [], ext = [];
    eventi.forEach(e => {
      const m = parseInt(e.minuto) || 0;
      if (m <= 45) p1.push(e);
      else if (m <= 90) p2.push(e);
      else ext.push(e);
    });
    
    html += '<div class="timeline" id="tl">';
    if (p1.length) { html += '<div class="tdiv">1° Tempo</div>'; p1.forEach(e => html += evtHTML(e, formazione, isPast)); }
    if (p2.length) { html += '<div class="tdiv">2° Tempo</div>'; p2.forEach(e => html += evtHTML(e, formazione, isPast)); }
    if (ext.length) { html += '<div class="tdiv">Extratime</div>'; ext.forEach(e => html += evtHTML(e, formazione, isPast)); }
    if (eventi.length === 0) html += '<div class="empty">Nessun evento</div>';
    html += '</div>';
    
    if (!isPast) {
      html += '<button class="abtn" id="addEvtBtn">+ Aggiungi Evento</button>';
    }
  }
  html += '</div>';
  
  // VALUTAZIONI
  html += '<div class="sec">';
  html += '<h4>⭐ Valutazioni</h4>';
  if (formazione.length === 0) {
    html += '<div class="empty">Nessun giocatore</div>';
  } else {
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px;">';
    formazione.forEach(g => {
      const ex = valutazioniMap[g.id] || {};
      const pc = g.posizione === 'Titolare' ? '#27AE60' : g.posizione === 'Panchina' ? '#F39C12' : '#3498DB';
      html += '<div class="pv">';
      html += '<div><div class="pv-nome">' + (g.cognome || '').toUpperCase() + ' ' + (g.nome || '') + '</div>';
      html += '<div class="pv-pos" style="color:' + pc + ';">' + (g.posizione || 'Convocato') + '</div>';
      html += '<input type="text" class="na" placeholder="Note..." value="' + (ex.nota_allenatore || '') + '" data-nid="' + g.id + '"></div>';
      html += '<select class="vs" data-vid="' + g.id + '"><option value="">-</option>';
      for (let v = 4; v <= 10; v += 0.5) {
        html += '<option value="' + v + '"' + (ex.voto == v ? ' selected' : '') + '>' + v.toString().replace('.', ',') + '</option>';
      }
      html += '</select></div>';
    });
    html += '</div>';
  }
  html += '</div>';
  
  html += '</div>';
  container.innerHTML = html;
  
  // Aggiorna risultato quando cambia tipo evento
  container.querySelectorAll('.evt-tipo').forEach(sel => {
    sel.addEventListener('change', updateScore);
  });
  container.querySelectorAll('.evt-del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.evt').remove();
      updateScore();
    });
  });
  
  // Aggiungi evento
  const addBtn = document.getElementById('addEvtBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => addEvent(formazione));
  }
}

function evtHTML(evt, formazione, isPast) {
  const cfg = EVENTI_CONFIG[evt.tipo] || EVENTI_CONFIG['GOAL'];
  const pid = evt.principale_id || evt.calciatore_principale_id;
  const opts = formazione.map(g => {
    const id = g.id || g.calciatore_id;
    return '<option value="' + id + '"' + (id === pid ? ' selected' : '') + '>' + (g.cognome || '').toUpperCase() + '</option>';
  }).join('');
  
  return '<div class="evt">' +
    '<span class="evt-badge" style="background:' + cfg.bgColor + ';color:' + cfg.color + ';">' + cfg.icon + ' ' + cfg.label + ' <strong>' + (evt.minuto || '?') + '\'</strong></span>' +
    '<div class="evt-det">' +
    '<div class="evt-row">' +
    '<input type="number" value="' + (evt.minuto || '') + '" class="evt-min" style="width:50px;" min="1" max="150" placeholder="Min">' +
    '<select class="evt-tipo">' +
    Object.entries(EVENTI_CONFIG).map(([k, v]) => '<option value="' + k + '"' + (evt.tipo === k ? ' selected' : '') + '>' + v.icon + ' ' + v.label + '</option>').join('') +
    '</select>' +
    '</div>' +
    '<select class="evt-g">' +
    '<option value="">Giocatore...</option>' + opts +
    '</select>' +
    '</div>' +
    (isPast ? '' : '<button class="dbtn evt-del">✕</button>') +
    '</div>';
}

function addEvent(formazione) {
  const tl = document.getElementById('tl');
  const empty = tl.querySelector('.empty');
  if (empty) empty.remove();
  
  const opts = formazione.map(g => {
    const id = g.id || g.calciatore_id;
    return '<option value="' + id + '">' + (g.cognome || '').toUpperCase() + '</option>';
  }).join('');
  
  const div = document.createElement('div');
  div.className = 'evt';
  div.innerHTML = '<div class="evt-det" style="flex:1;">' +
    '<div class="evt-row">' +
    '<input type="number" class="evt-min" style="width:50px;" min="1" max="150" placeholder="Min">' +
    '<select class="evt-tipo">' +
    Object.entries(EVENTI_CONFIG).map(([k, v]) => '<option value="' + k + '">' + v.icon + ' ' + v.label + '</option>').join('') +
    '</select></div>' +
    '<select class="evt-g"><option value="">Giocatore...</option>' + opts + '</select></div>' +
    '<button class="dbtn evt-del">✕</button>';
  
  div.querySelector('.evt-del').addEventListener('click', () => { div.remove(); updateScore(); });
  div.querySelector('.evt-tipo').addEventListener('change', updateScore);
  
  tl.appendChild(div);
  updateScore();
}

function updateScore() {
  let f = 0, s = 0;
  document.querySelectorAll('#tl .evt').forEach(e => {
    const t = e.querySelector('.evt-tipo')?.value;
    if (t === 'GOAL') f++;
    if (t === 'GOAL_SUBITO') s++;
  });
  const scoreDiv = document.querySelector('.score-num');
  if (scoreDiv) scoreDiv.innerHTML = '<span style="color:#27AE60;">' + f + '</span> - <span style="color:#E74C3C;">' + s + '</span>';
}

async function saveAll(mid, modal) {
  showLoading();
  const errors = [];
  
  try {
    // 1. Salva eventi (DELETE + INSERT)
    await apiFetch('/partite/' + mid + '/eventi', { method: 'DELETE' }).catch(() => {});
    
    document.querySelectorAll('#tl .evt').forEach(e => {
      const min = parseInt(e.querySelector('.evt-min')?.value);
      const tipo = e.querySelector('.evt-tipo')?.value;
      const gid = e.querySelector('.evt-g')?.value;
      if (min && tipo && gid) {
        apiFetch('/partite/' + mid + '/eventi', {
          method: 'POST',
          body: JSON.stringify({ tipo, calciatorePrincipaleId: gid, minuto: min })
        }).catch(err => errors.push('Evento: ' + err.message));
      }
    });
    
    // 2. Salva valutazioni
    const valutazioni = [];
    document.querySelectorAll('.vs').forEach(sel => {
      const pid = sel.dataset.vid;
      const voto = sel.value;
      const nota = document.querySelector('[data-nid="' + pid + '"]')?.value;
      if (voto) valutazioni.push({ calciatore_id: pid, voto: parseFloat(voto), nota_allenatore: nota || null });
    });
    
    if (valutazioni.length > 0) {
      await apiFetch('/partite/' + mid + '/valutazioni', {
        method: 'POST',
        body: JSON.stringify({ valutazioni })
      }).catch(err => errors.push('Valutazioni: ' + err.message));
    }
    
    hideLoading();
    
    if (errors.length > 0) {
      alert('⚠️ Alcuni errori:\n' + errors.join('\n'));
    } else {
      modal.close();
      alert('✅ Salvato!');
      if (window.YFM?.loadCalendar) window.YFM.loadCalendar();
    }
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
