import { apiFetch } from '../../services/api';
import { formatDate, formatDateShort } from '../../utils/formatters';
import { showLoading, hideLoading } from '../../utils/ui';
import demoPersistence from '../demo/DemoPersistence';

let allMatches = [];

// ===== PALLINO LAMPEGGIANTE PER PROSSIMO PASSO =====
const PULLED_DOT = '<span class="pallino-blink" style="display:inline-block;width:8px;height:8px;background:#007bff;border-radius:50%;margin-right:4px;animation:blink-pallino 1s infinite;"></span>';
const PULLED_STYLE = '@keyframes blink-pallino{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.3;transform:scale(0.8);}';

function getNextStep(matchId) {
  // Controlla sia demoPersistence che i dati precaricati
  const convocazioneData = demoPersistence.getConvocation(matchId);
  const demoConvocazioneData = window.YFM.demoConvocazioni?.[matchId];
  const hasConvocazioni = 
    (convocazioneData !== null && Array.isArray(convocazioneData) && convocazioneData.length > 0) ||
    (demoConvocazioneData !== null && Array.isArray(demoConvocazioneData) && demoConvocazioneData.length > 0);
  
  const formazioneData = demoPersistence.getFormation(matchId);
  const hasFormazione = formazioneData && (
    formazioneData.portiere ||
    (formazioneData.difensori && formazioneData.difensori.length > 0) ||
    (formazioneData.centrocampisti && formazioneData.centrocampisti.length > 0) ||
    (formazioneData.attaccanti && formazioneData.attaccanti.length > 0)
  );
  
  const match = (window.YFM.demoMatches || []).find(m => m.id === matchId);
  const hasRisultato = match && (match.gol_casa !== undefined || match.gol_trasferta !== undefined);
  const hasEventi = (demoPersistence.getEvents(matchId) || []).length > 0;
  
  if (!hasConvocazioni) return 'convocazione';
  if (!hasFormazione) return 'formazione';
  if (!hasRisultato) return 'risultato';
  if (!hasEventi) return 'eventi';
  return null; // Tutto completato
}

// Helper per creare bottone con pallino
function makeBtn(label, onclick, isNextStep, extraClass = '') {
  const icon = label.includes('Convoca') ? '📋' :
               label.includes('Formazione') ? '🏟️' :
               label.includes('Distinta') ? '📄' :
               label.includes('Risultato') ? '⚽' :
               label.includes('Eventi') ? '📊' : '📝';
  const prefix = isNextStep ? PULLED_DOT : '';
  return `<button class="btn btn-secondary btn-small ${extraClass}" data-icon="${icon}" onclick="event.stopPropagation();${onclick}">${prefix}${icon} <span class="btn-text">${label}</span></button>`;
}

export default async function loadCalendar() {
  const c = document.getElementById('pageContent');
  const isDemo = localStorage.getItem('yfm_demo_session') === 'active';
  
  // In demo mode, use in-memory data
  if (isDemo) {
    const matches = window.YFM.demoMatches || [];
    const stats = { risultati: [] };
    allMatches = matches;
    window.YFM.allMatches = matches;
    renderCalendarPage(c, matches, stats);
    return;
  }
  
  try {
    const [matches, stats] = await Promise.all([
      apiFetch('/squadre/' + window.YFM.squadraId + '/partite'),
      apiFetch('/squadre/' + window.YFM.squadraId + '/statistiche-complete').catch(() => ({ risultati: [] }))
    ]);
    allMatches = matches;
    window.YFM.allMatches = matches;
    
    renderCalendarPage(c, matches, stats);
  } catch (e) {
    c.innerHTML = '<div class="error-box">' + e.message + '</div>';
  }
}

function renderCalendarPage(c, matches, stats) {

  const now = new Date();
  
  // Separa future e passate
  const futureMatches = matches
    .filter(m => new Date(m.data_ora) >= now)
    .sort((a, b) => new Date(a.data_ora) - new Date(b.data_ora));
  
  const pastMatches = matches
    .filter(m => new Date(m.data_ora) < now)
    .sort((a, b) => new Date(b.data_ora) - new Date(a.data_ora));

  // Prossima partita (la prima delle future)
  const nextMatch = futureMatches.length > 0 ? futureMatches[0] : null;
  const otherFutureMatches = futureMatches.slice(1);

  // Stili CSS per LIVE lampeggiante
  let html = `<style>
    @keyframes pulse-live {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }
    @keyframes blink-text {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    .live-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: pulse-live 1s ease-in-out infinite;
    }
    .live-text {
      animation: blink-text 1s ease-in-out infinite;
    }
  
    .match-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-casa { background: #D4EDDA; color: #155724; }
    .badge-trasferta { background: #FFF3CD; color: #856404; }
    .badge-vittoria { background: #D4EDDA; color: #155724; }
    .badge-sconfitta { background: #F8D7DA; color: #721C24; }
    .badge-pareggio { background: #FFF3CD; color: #856404; }
    .badge-next { background: #D1ECF1; color: #0C5460; border: 1px solid #B8DAFF; }
    .badge-section { background: #E9ECEF; color: #495057; padding: 2px 8px; border-radius: 8px; font-size: 11px; }
    
    /* ===== RISULTATO CON ICONA ===== */
    .result-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 13px;
      font-weight: 600;
    }
    .result-victory { background: #D4EDDA; color: #155724; }
    .result-defeat { background: #F8D7DA; color: #721C24; }
    .result-draw { background: #FFF3CD; color: #856404; }
    .result-score { font-size: 16px; font-weight: 700; }
    
    /* ===== POSIZIONE ASSOLUTA PULSANTI MODIFICA ===== */
    .match-card-actions {
      display: flex;
      gap: 4px;
      align-items: flex-start;
      flex-shrink: 0;
    }
    .match-card-actions .btn {
      padding: 4px 6px !important;
      font-size: 12px;
    }
    .match-card { position: relative; }
    
    /* ===== MOBILE ===== */
    @media (max-width: 640px) {
      .mobile-short-date { display: inline !important; }
      .mobile-full-date { display: none !important; }
      .mobile-actions .btn { padding: 6px 4px !important; min-width: 36px; }
      .mobile-actions .btn .btn-text { display: none; }
      .match-badges { display: flex; flex-wrap: wrap; gap: 4px; }
      .match-badge { font-size: 10px; padding: 2px 6px; }
      /* Griglia 3x2 pulsanti azione */
      .match-actions-wrap { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
      .match-actions-wrap .btn { padding: 8px 4px !important; font-size: 11px; min-height: 40px; }
      .match-actions-wrap .btn .btn-text { display: block; margin-top: 2px; }
      .result-badge { font-size: 11px; padding: 3px 8px; gap: 4px; }
      .result-score { font-size: 14px; }
      /* Pulsanti azione in alto a destra */
      .match-card-actions {
        position: absolute;
        top: 6px;
        right: 6px;
      }
      .match-card-actions .btn {
        padding: 4px !important;
        font-size: 11px;
      }
    }</style>`;

  html += `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
      <div><h1 class="page-title">Calendario ${window.YFM.getSquadraName()}</h1></div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary" id="btnAdd">+ Nuova</button>
        <button class="btn btn-secondary" id="btnImport" style="font-size:13px;">📥 Importa CSV</button>
      </div>
    </div>`;

  // PROSSIMA PARTITA in evidenza
  if (nextMatch) {
    html += `
      <div class="card" style="margin-bottom:20px;border-left:4px solid #28a745;background:linear-gradient(135deg, #E8F8F0 0%, #D4F1E0 100%);">
        <h3 class="section-title" style="color:#155724;"><span class="badge badge-next">🟢 PROSSIMA</span></h3>
        ${renderMatchCard(nextMatch, stats, true)}
      </div>`;
  }

  // ALTRE PARTITE FUTURE
  if (otherFutureMatches.length > 0) {
    html += `<h3 class="section-title" style="margin:20px 0 12px 0;"><span class="badge badge-next">📅 IN ARRIVO</span></h3>`;
    otherFutureMatches.forEach(m => {
      html += `<div class="card" style="margin-bottom:12px;">${renderMatchCard(m, stats)}</div>`;
    });
  }

  // PARTITE GIOCATE
  if (pastMatches.length > 0) {
    html += `<h3 class="section-title" style="margin:20px 0 12px 0;"><span class="badge badge-section">🏆 GIOCATE</span></h3>`;
    pastMatches.forEach(m => {
      html += `<div class="card match-card" style="margin-bottom:12px;">${renderMatchCard(m, stats)}</div>`;
    });
  }

  c.innerHTML = html;

  document.getElementById('btnAdd').addEventListener('click', () => openMatchForm());
  document.getElementById('btnImport').addEventListener('click', openImportCSV);
  attachCardListeners();
}

function attachCardListeners() {
  document.querySelectorAll('.btn-editm').forEach(b => {
  b.addEventListener('click', (e) => { e.stopPropagation(); openMatchForm(b.dataset.mid); });
  });
  document.querySelectorAll('.btn-del').forEach(b => {
  b.addEventListener('click', (e) => { e.stopPropagation(); deleteMatch(b.dataset.mid); });
  });
}

export function renderMatchCard(m, stats, isNext = false) {
  // Cerca risultato in stats o usa dati diretti dalla partita (demo mode)
  const r = (stats?.risultati || []).find(x => x.id === m.id);
  const hasResult = !!(r || (m.gol_casa !== undefined && m.gol_trasferta !== undefined));
  const isPast = new Date(m.data_ora) < new Date();
  const isArchiviata = m.archiviata === true || m.archiviata === 'true';
  
  // Stile per partite archiviate (elegante grigio/marrone) - SOLO icona 📦
  const archivedStyle = isArchiviata ? 'opacity:0.75;border-left:4px solid #8B7355 !important;background:#F5F5F0 !important;' : '';
  const archivedIcon = isArchiviata ? '📦 ' : '';

  // Estrai gol (da stats o da dati diretti partita)
  const golFatti = r?.golFatti ?? m.gol_casa ?? null;
  const golSubiti = r?.golSubiti ?? m.gol_trasferta ?? null;

  let L = `
  <div class="match-date mobile-date">${archivedIcon}<span class="mobile-short-date" style="display:none;">${formatDateShort(m.data_ora)}</span><span class="mobile-full-date">${formatDate(m.data_ora)}</span></div>
  <div class="match-teams">${window.YFM.getSocietaName()} vs ${m.avversario}</div>
  <div class="match-info"><span class="match-badges">${m.giornata ? '<span class="match-badge badge-section">⚽ ' + m.giornata + '</span>' : ''}<span class="match-badge badge-section">${m.competizione}</span><span class="match-badge ${m.luogo === 'Casa' ? 'badge-casa' : 'badge-trasferta'}">${m.luogo === 'Casa' ? '🏠' : '✈️'} ${m.luogo}</span></span></div>`;

  let R = '';
  
  // ===== PARTE SINISTRA: Risultato/LIVE/bottone Risultato =====
  if (!isPast && hasResult && golFatti !== null && golSubiti !== null) {
    // Partita futura con risultato: mostra LIVE
    const color = golFatti > golSubiti ? '#27AE60' : golFatti === golSubiti ? '#F39C12' : '#E74C3C';
    const resultBadge = golFatti > golSubiti ? 'badge-vittoria' : golFatti === golSubiti ? 'badge-pareggio' : 'badge-sconfitta';
    const resultLabel = golFatti > golSubiti ? 'Vittoria' : golFatti === golSubiti ? 'Pareggio' : 'Sconfitta';
    const liveIndicator = `
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
      <span class="live-dot" style="background:#E74C3C;"></span>
      <span class="live-text" style="color:#E74C3C;font-size:10px;font-weight:bold;">LIVE</span>
    </div>`;
    R += `<div style="text-align:center;cursor:pointer;" onclick="event.stopPropagation();window.YFM.openMatchDetail('${m.id}')" title="Dettaglio">${liveIndicator}<div style="font-size:22px;font-weight:bold;color:${color};">${golFatti} - ${golSubiti}</div></div>`;
  } else if (!isPast) {
    // Partita futura senza risultato: mostra pulsante Risultato
    R += `<button class="btn btn-primary btn-small" onclick="event.stopPropagation();window.YFM.openResultForm('${m.id}')">⚽ Risultato</button>`;
  } else {
    // Partita passata senza risultato: mostra dettaglio
    R += `<span style="color:var(--gray);cursor:pointer;" onclick="event.stopPropagation();window.YFM.openMatchDetail('${m.id}')">Dettaglio</span>`;
  }

  // ===== PULSANTI: Tutti attivi con pallino per prossimo passo =====
  const nextStep = getNextStep(m.id);
  
  // Partite future: tutti i bottoni abilitati, pallino indica prossimo passo
  if (!isPast) {
    // Aggiungi CSS per animazione pallino
    if (!document.getElementById('pallino-style')) {
      const style = document.createElement('style');
      style.id = 'pallino-style';
      style.textContent = '@keyframes blink-pallino{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.3;transform:scale(0.8);}';
      document.head.appendChild(style);
    }
    
    // Convocazione
    R += makeBtn('Convocazione', `window.YFM.openConvocation('${m.id}',false)`, nextStep === 'convocazione');
    
    // Formazione
    R += makeBtn('Formazione', `window.YFM.openFormazioneForm('${m.id}')`, nextStep === 'formazione');
    
    // Distinta
    R += makeBtn('Distinta', `window.YFM.openDistinta('${m.id}')`, nextStep === 'risultato');
    
    // Note (sempre attivo, senza pallino)
    R += makeBtn('Note', `window.YFM.openNoteAvversario('${m.id}')`, false);
    
    // Eventi: solo se c'è un risultato
    if (hasResult) {
      R += makeBtn('Eventi', `window.YFM.openResultForm('${m.id}',true)`, nextStep === 'eventi');
    }
    
  } else if (isPast && hasResult && !isArchiviata) {
  // Partita passata con risultato - tutti attivi
  R += makeBtn('Convoca', `window.YFM.openConvocation('${m.id}',true)`, false);
  R += makeBtn('Formazione', `window.YFM.openFormazioneForm('${m.id}')`, false);
  R += makeBtn('Distinta', `window.YFM.openDistinta('${m.id}')`, false);
  R += makeBtn('Eventi', `window.YFM.openResultForm('${m.id}',true)`, false);
  
  } else if (isPast && !hasResult) {
  // Partita passata senza risultato
  R += `<button class="btn btn-secondary btn-small" onclick="event.stopPropagation();window.YFM.openConvocation('${m.id}',true)">📋 Conv.</button>`;
  R += `<button class="btn btn-secondary btn-small" onclick="event.stopPropagation();window.YFM.openFormazioneForm('${m.id}')">👥 Formazione</button>`;
  R += `<button class="btn btn-secondary btn-small" onclick="event.stopPropagation();window.YFM.openDistinta('${m.id}')">📄 Dist.</button>`;
  } else {
  // Partite archiviate: solo consultazione
  R += `<button class="btn btn-secondary btn-small" onclick="event.stopPropagation();window.YFM.openConvocation('${m.id}',true)">📋 Conv.</button>`;
  R += `<button class="btn btn-secondary btn-small" onclick="event.stopPropagation();window.YFM.openFormazioneForm('${m.id}')">👥 Formazione</button>`;
  R += `<button class="btn btn-secondary btn-small" onclick="event.stopPropagation();window.YFM.openDistinta('${m.id}')">📄 Dist.</button>`;
  }
  
  // Edit e Elimina e Archivia - in alto a destra (sempre visibili)
  let editBtns = '';
  if (!isArchiviata) {
    // Archivia per partite giocate, altrimenti solo Edit e Delete
    const archBtn = (isPast && hasResult) ? `<button class="btn btn-secondary btn-small" style="color:#856404;" onclick="event.stopPropagation();archiveMatch('${m.id}')" title="Archivia">📦</button>` : '';
    editBtns = `${archBtn}<button class="btn btn-secondary btn-small btn-editm" data-mid="${m.id}" title="Modifica">✏️</button><button class="btn btn-secondary btn-small btn-danger btn-del" data-mid="${m.id}" title="Elimina">🗑️</button>`;
  } else {
    editBtns = `<button class="btn btn-secondary btn-small" style="background:#6B5B4F;color:white;border-color:#6B5B4F;" onclick="event.stopPropagation();unarchiveMatch('${m.id}')" title="Sblocca">🔓</button>`;
  }

  // Risultato con icona per partite passate con risultato
  let resultIcon = '';
  if (isPast && hasResult && golFatti !== null && golSubiti !== null) {
    let icon, label, cls;
    if (golFatti > golSubiti) { icon = '✅'; label = 'Vittoria'; cls = 'result-victory'; }
    else if (golFatti < golSubiti) { icon = '❌'; label = 'Sconfitta'; cls = 'result-defeat'; }
    else { icon = '🤝'; label = 'Pareggio'; cls = 'result-draw'; }
    resultIcon = `<span class="result-badge ${cls}"><span class="result-score">${golFatti} - ${golSubiti}</span>${icon}</span>`;
  }

  return `<div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;${archivedStyle}">
  <div style="flex:1;min-width:220px;">${L}${resultIcon ? '<div style="margin-top:8px;">' + resultIcon + '</div>' : ''}</div>
  <div class="match-card-actions">${editBtns}</div>
  <div class="match-actions-wrap" style="width:100%;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">${R}</div>
  </div>`;
}

// Funzioni globali per archivia/sblocca
window.archiveMatch = async function(id) {
  if (!confirm('Archiviare questa partita? La partita verrà spostata nelle partite giocate e non sarà più possibile modificare eventi, formazione e convocazioni.')) return;
  showLoading();
  try {
    const isDemo = localStorage.getItem('yfm_demo_session') === 'active';
    if (isDemo) {
      demoPersistence.archiveMatch(id);
      loadCalendar();
    } else {
      await apiFetch('/partite/' + id + '/archivia', { method: 'PUT' });
      loadCalendar();
    }
  } catch (e) { alert(e.message); }
  finally { hideLoading(); }
};

window.unarchiveMatch = async function(id) {
  if (!confirm('Sbloccare questa partita? Sarà possibile modificare eventi, formazione e convocazioni.')) return;
  showLoading();
  try {
    const isDemo = localStorage.getItem('yfm_demo_session') === 'active';
    if (isDemo) {
      demoPersistence.unarchiveMatch(id);
      loadCalendar();
    } else {
      await apiFetch('/partite/' + id + '/sblocca', { method: 'PUT' });
      loadCalendar();
    }
  } catch (e) { alert(e.message); }
  finally { hideLoading(); }
};

export function openMatchForm(mid) {
  const m = mid ? allMatches.find(x => x.id === mid) : null;
  const content = `
  <div class="form-group" style="margin-bottom:12px;"><label>Data e Ora</label><input id="mfD" type="datetime-local" value="${m ? new Date(m.data_ora).toISOString().slice(0, 16) : ''}"></div>
  <div class="form-group" style="margin-bottom:12px;"><label>Avversario</label><input id="mfA" value="${m ? m.avversario || '' : ''}"></div>
  <div class="form-group" style="margin-bottom:12px;"><label>Luogo</label><select id="mfL"><option ${m && m.luogo === 'Casa' ? 'selected' : ''}>Casa</option><option ${m && m.luogo === 'Trasferta' ? 'selected' : ''}>Trasferta</option></select></div>
  <div class="form-group" style="margin-bottom:12px;"><label>Competizione</label><input id="mfC" value="${m ? m.competizione || '' : ''}"></div>
  <div class="form-group"><label>Giornata</label><input id="mfG" type="number" value="${m ? m.giornata || '' : ''}" style="width:80px;"></div>`;
  const footer = '<button class="btn btn-secondary" id="modalCancel">Annulla</button><button class="btn btn-primary" id="saveBtn">Salva</button>';
  const modal = createModal(m ? 'Modifica' : 'Nuova Partita', content, footer, '500px');
  document.getElementById('saveBtn').addEventListener('click', async () => {
  const d = {
    dataOra: new Date(document.getElementById('mfD').value).toISOString(),
    avversario: document.getElementById('mfA').value,
    luogo: document.getElementById('mfL').value,
    competizione: document.getElementById('mfC').value,
    giornata: parseInt(document.getElementById('mfG').value) || null
  };
  showLoading();
  try {
    if (m) await apiFetch('/partite/' + m.id, { method: 'PUT', body: JSON.stringify(d) });
    else await apiFetch('/squadre/' + window.YFM.squadraId + '/partite', { method: 'POST', body: JSON.stringify(d) });
    modal.close();
    loadCalendar();
  } catch (e) { alert(e.message); }
  finally { hideLoading(); }
  });
}

async function deleteMatch(id) {
  if (!confirm('Eliminare?')) return;
  await apiFetch('/partite/' + id, { method: 'DELETE' });
  loadCalendar();
}

function openImportCSV() {
  const content = `
  <p style="margin-bottom:12px;">Incolla i dati CSV (una riga per partita):</p>
  <p style="font-size:12px;color:var(--gray);margin-bottom:8px;">Formato: <strong>Data, Ora, Avversario, Luogo, Competizione, Giornata</strong></p>
  <textarea id="csvData" rows="10" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;font-family:monospace;font-size:13px;" placeholder="2025-09-14,10:00,ASD Torrino,Casa,Campionato U14 Prov.,1&#10;2025-09-21,11:30,Pol. San Lorenzo,Trasferta,Campionato U14 Prov.,2"></textarea>`;
  const footer = '<button class="btn btn-secondary" id="modalCancel">Annulla</button><button class="btn btn-primary" id="doImport">📥 Importa</button>';
  const modal = createModal('Importa Calendario CSV', content, footer, '600px');
  document.getElementById('doImport').addEventListener('click', async () => {
  const raw = document.getElementById('csvData').value.trim();
  if (!raw) { alert('Nessun dato.'); return; }
  const lines = raw.split('\n').filter(l => l.trim());
  const csvData = lines.map(l => l.split(',').map(c => c.trim()));
  showLoading();
  try {
    const res = await apiFetch('/squadre/' + window.YFM.squadraId + '/importa-calendario', { method: 'POST', body: JSON.stringify({ csvData }) });
    hideLoading();
    modal.close();
    alert('✅ Importate ' + res.inserite + ' partite!');
    loadCalendar();
  } catch (e) { hideLoading(); alert('Errore: ' + e.message); }
  });
}

function createModal(title, content, footer, maxW = '600px') {
  const existing = document.getElementById('currentModal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'currentModal';
  modal.innerHTML = '<div class="modal-content" style="max-width:' + maxW + ';"><div class="modal-header"><h2>' + title + '</h2><button class="modal-close-btn" id="modalCloseX">×</button></div><div class="modal-body">' + content + '</div>' + (footer ? '<div class="modal-footer">' + footer + '</div>' : '') + '</div>';
  document.body.appendChild(modal);
  const close = () => { const m = document.getElementById('currentModal'); if (m) m.remove(); };
  document.getElementById('modalCloseX').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  const cancelBtn = document.getElementById('modalCancel');
  if (cancelBtn) cancelBtn.addEventListener('click', close);
  return { modal, closeModal: close, close };
}
