import { apiFetch } from '../../services/api.js';
import { showLoading, hideLoading } from '../../utils/ui.js';

const EVENTI = {
  'GOAL': { icon: '⚽', label: 'Gol', color: '#27AE60' },
  'GOAL_SUBITO': { icon: '⚽', label: 'Gol Subito', color: '#E74C3C' },
  'YELLOW': { icon: '🟨', label: 'Amm.', color: '#F39C12' },
  'RED': { icon: '🟥', label: 'Esp.', color: '#E74C3C' },
  'IN': { icon: '⬅️', label: 'Entrata', color: '#1ABC9C' },
  'OUT': { icon: '➡️', label: 'Uscita', color: '#9B59B6' }
};

export async function openResultForm(mid) {
  const match = window.YFM.allMatches.find(m => m.id === mid) || {};
  
  // Carica eventi esistenti
  let eventi = [];
  try {
    const detRes = await apiFetch('/partite/' + mid + '/dettaglio');
    eventi = detRes.eventi || [];
  } catch(e) {}
  
  // Carica formazione/convocati per i tipi che servono (GOAL, YELLOW, IN, OUT)
  let giocatori = [];
  try {
    const res = await apiFetch('/partite/' + mid + '/formazione');
    giocatori = Array.isArray(res) ? res : [];
  } catch(e) {}
  
  if (giocatori.length === 0) {
    try {
      const convRes = await apiFetch('/partite/' + mid + '/convocazioni');
      const convocati = (convRes.convocazioni || []).filter(c => c.presente);
      if (convocati.length > 0) {
        const rosaRes = await apiFetch('/squadre/' + window.YFM.squadraId + '/calciatori').catch(() => []);
        const rosaMap = {};
        (rosaRes || []).forEach(g => { rosaMap[g.id] = g; });
        giocatori = convocati.map(c => {
          const g = rosaMap[c.calciatoreId] || {};
          return { id: c.calciatoreId, nome: g.nome || '', cognome: g.cognome || '', ruolo: g.ruolo || '' };
        });
      }
    } catch(e) {}
  }
  
  // Ordina alfabeticamente
  giocatori.sort((a, b) => (a.cognome || '').localeCompare(b.cognome || ''));
  
  const content = '<div id="rfInner"></div>';
  const modal = createModal('⚽ Inserisci Risultato', content, '', '500px');
  
  renderForm(mid, match, eventi, giocatori, modal);
}

function renderForm(mid, match, eventi, giocatori, modal) {
  const container = document.getElementById('rfInner');
  
  // Calcola risultato
  const golFatti = eventi.filter(e => e.tipo === 'GOAL').length;
  const golSubiti = eventi.filter(e => e.tipo === 'GOAL_SUBITO').length;
  
  let html = '<style>';
  html += '.rf{padding:16px;}';
  html += '.score{text-align:center;padding:24px;background:linear-gradient(135deg,#667eea20,#764ba220);border-radius:16px;margin-bottom:20px;border:2px solid #667eea40;}';
  html += '.score-num{font-size:64px;font-weight:bold;}';
  html += '.score-sub{font-size:12px;color:#888;margin-top:8px;}';
  html += '.evt-list{margin-bottom:16px;}';
  html += '.evt-item{display:flex;align-items:center;gap:12px;padding:12px;background:white;border-radius:10px;margin-bottom:8px;border:1px solid #eee;}';
  html += '.evt-badge{padding:8px 14px;border-radius:20px;font-size:14px;font-weight:600;min-width:120px;text-align:center;}';
  html += '.evt-info{flex:1;font-size:13px;}';
  html += '.evt-min{width:50px;padding:8px;border:1px solid #ddd;border-radius:8px;font-size:13px;text-align:center;}';
  html += '.evt-del{background:#E74C3C;color:white;border:none;padding:8px 14px;border-radius:6px;cursor:pointer;font-size:12px;}';
  html += '.evt-del:hover{background:#c0392b;}';
  html += '.form-row{display:flex;gap:12px;margin-bottom:12px;align-items:center;}';
  html += '.form-row select,.form-row input{padding:10px;border:1px solid #ddd;border-radius:8px;font-size:13px;}';
  html += '.form-row select{flex:1;}';
  html += '.form-row input.num{width:60px;}';
  html += '.add-btn{background:#667eea;color:white;border:none;padding:12px 20px;border-radius:8px;cursor:pointer;font-size:14px;width:100%;margin-top:12px;}';
  html += '.add-btn:hover{background:#764ba2;}';
  html += '.footer-fixed{position:fixed;bottom:0;left:0;right:0;padding:16px;background:white;border-top:1px solid #eee;display:flex;gap:12px;justify-content:flex-end;}';
  html += '.empty{text-align:center;padding:40px;color:#888;font-size:14px;}';
  html += '.modal-body{padding-bottom:80px;}';
  html += '</style>';
  
  html += '<div class="rf">';
  
  // RISULTATO
  html += '<div class="score">';
  html += '<div class="score-num"><span style="color:#27AE60;">' + golFatti + '</span> - <span style="color:#E74C3C;">' + golSubiti + '</span></div>';
  html += '<div class="score-sub">SSD Albalonga - ' + match.avversario + '</div>';
  html += '</div>';
  
  // EVENTI ESISTENTI
  html += '<div class="evt-list" id="evtList">';
  
  const eventiOrd = [...eventi].sort((a, b) => (parseInt(a.minuto) || 0) - (parseInt(b.minuto) || 0));
  eventiOrd.forEach((e, i) => {
    const cfg = EVENTI[e.tipo] || EVENTI['GOAL'];
    html += '<div class="evt-item" data-idx="' + i + '">';
    html += '<span class="evt-badge" style="background:' + cfg.color + '20;color:' + cfg.color + ';border:2px solid ' + cfg.color + ';">' + cfg.icon + ' ' + cfg.label + '</span>';
    html += '<div class="evt-info">' + e.minuto + '\' - ' + e.principale + (e.secondario ? ' (' + e.secondario + ')' : '') + '</div>';
    html += '<button class="evt-del" onclick="delEvento(' + i + ')">✕</button>';
    html += '</div>';
  });
  
  if (eventi.length === 0) {
    html += '<div class="empty">Nessun evento registrato</div>';
  }
  html += '</div>';
  
  // FORM AGGIUNTA
  html += '<div class="form-row">';
  html += '<input type="number" id="evtMin" class="num" placeholder="Min" min="1" max="150" value="">';
  html += '<select id="evtTipo">';
  Object.entries(EVENTI).forEach(([k, v]) => {
    html += '<option value="' + k + '">' + v.icon + ' ' + v.label + '</option>';
  });
  html += '</select>';
  html += '</div>';
  
  html += '<select id="evtGiocatore" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:13px;margin-bottom:12px;">';
  html += '<option value="">Seleziona giocatore...</option>';
  giocatori.forEach(g => {
    html += '<option value="' + g.id + '">' + g.cognome + ' ' + g.nome + '</option>';
  });
  html += '</select>';
  
  // Per Gol Subito: opzione autogol
  html += '<div id="autoGolOpt" style="display:none;margin-bottom:12px;">';
  html += '<label style="font-size:12px;color:#888;"><input type="checkbox" id="chkAutogol"> Autogol (seleziona il giocatore)</label>';
  html += '</div>';
  
  html += '<button class="add-btn" onclick="addEvento()">+ Aggiungi Evento</button>';
  html += '</div>';
  
  // FOOTER CON BOTTONI
  html += '<div class="footer-fixed">';
  html += '<button class="btn btn-secondary" onclick="closeModal()">Annulla</button>';
  html += '<button class="btn btn-primary" onclick="saveAndClose()">💾 Salva</button>';
  html += '</div>';
  
  container.innerHTML = html;
  
  // Gestisci checkbox autogol
  document.getElementById('evtTipo').addEventListener('change', function() {
    const autoGolOpt = document.getElementById('autoGolOpt');
    const giocSelect = document.getElementById('evtGiocatore');
    if (this.value === 'GOAL_SUBITO') {
      autoGolOpt.style.display = 'block';
    } else {
      autoGolOpt.style.display = 'none';
    }
  });
  
  // Funzioni globali
  window.delEvento = function(idx) {
    eventi.splice(idx, 1);
    renderForm(mid, match, eventi, giocatori, modal);
  };
  
  window.addEvento = function() {
    const min = parseInt(document.getElementById('evtMin').value);
    const tipo = document.getElementById('evtTipo').value;
    const gid = document.getElementById('evtGiocatore').value;
    const isAutogol = document.getElementById('chkAutogol')?.checked;
    
    if (!min || !tipo) { alert('Compila minuto e tipo'); return; }
    if (['GOAL', 'YELLOW', 'IN', 'OUT'].includes(tipo) && !gid) { alert('Seleziona un giocatore'); return; }
    
    const g = giocatori.find(x => x.id === gid);
    const evt = {
      tipo,
      minuto: min,
      principale: g ? g.cognome + ' ' + g.nome : (tipo === 'GOAL_SUBITO' && !isAutogol ? 'Avversario' : '?'),
      principale_id: isAutogol ? gid : null
    };
    
    eventi.push(evt);
    eventi.sort((a, b) => (parseInt(a.minuto) || 0) - (parseInt(b.minuto) || 0));
    renderForm(mid, match, eventi, giocatori, modal);
  };
  
  window.saveAndClose = async function() {
    showLoading();
    try {
      // Elimina eventi esistenti
      await apiFetch('/partite/' + mid + '/eventi', { method: 'DELETE' }).catch(() => {});
      
      // Salva nuovi eventi
      for (const e of eventi) {
        const body = { tipo: e.tipo, minuto: parseInt(e.minuto) };
        if (e.principale_id) body.calciatorePrincipaleId = e.principale_id;
        else if (e.principale && e.principale !== 'Avversario') {
          // Cerca giocatore per nome
          const g = giocatori.find(x => (x.cognome + ' ' + x.nome) === e.principale);
          if (g) body.calciatorePrincipaleId = g.id;
        }
        await apiFetch('/partite/' + mid + '/eventi', {
          method: 'POST',
          body: JSON.stringify(body)
        }).catch(err => console.error('Errore:', err));
      }
      
      hideLoading();
      closeModal();
      alert('✅ Eventi salvati!');
      if (window.YFM?.loadCalendar) window.YFM.loadCalendar();
    } catch (err) {
      hideLoading();
      alert('Errore: ' + err.message);
    }
  };
  
  window.closeModal = function() {
    const m = document.getElementById('currentModal');
    if (m) m.remove();
  };
}

function createModal(title, content, footer, maxW) {
  const existing = document.getElementById('currentModal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'currentModal';
  modal.innerHTML = '<div class="modal-content" style="max-width:' + (maxW || '600px') + ';"><div class="modal-header"><h2>' + title + '</h2><button class="modal-close-btn" onclick="closeModal()">×</button></div><div class="modal-body">' + content + '</div></div>';
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
}
