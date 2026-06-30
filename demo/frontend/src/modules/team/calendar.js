import { apiFetch } from '../../services/api';
import { formatDate, formatDateShort, formatDateCompact } from '../../utils/formatters';
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

  // Stili CSS per il calendario
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
    .badge-next { background: #D1ECF1; color: #0C5460; border: 1px solid #B8DAFF; }
    .badge-section { background: #E9ECEF; color: #495057; padding: 2px 8px; border-radius: 8px; font-size: 11px; }
    
    /* ===== RISULTATO ===== */
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
    
    /* ===== NUOVO LAYOUT CARD ===== */
    .match-card-inner {
      padding: 12px 16px;
      border-radius: 4px;
    }
    .match-opponent {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a2e;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .match-date-compact {
      font-size: 13px;
      color: #6c757d;
      margin-top: 4px;
    }
    .match-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
    }
    
    /* ===== PROGRESS DOTS ===== */
    .match-progress {
      display: flex;
      gap: 12px;
      margin-top: 8px;
      padding: 6px 0;
    }
    .progress-step {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .progress-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid #dee2e6;
      background: white;
      transition: all 0.2s;
    }
    .progress-label {
      font-size: 10px;
      color: #adb5bd;
      font-weight: 500;
    }
    .progress-done .progress-dot {
      background: #28a745;
      border-color: #28a745;
    }
    .progress-done .progress-label {
      color: #28a745;
    }
    .progress-active .progress-dot {
      background: #667eea;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102,126,234,0.3);
      animation: pulse-live 1.5s ease-in-out infinite;
    }
    .progress-active .progress-label {
      color: #667eea;
      font-weight: 700;
    }
    .progress-pending .progress-dot {
      background: white;
      border-color: #dee2e6;
    }
    
    /* ===== PULSANTI AZIONE ===== */
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
    
    .match-actions-row {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #f0f0f0;
    }
    
    /* ===== CARD CLICCABILE ===== */
    .match-card-inner {
      cursor: pointer;
      transition: background 0.15s;
    }
    .match-card-inner:hover {
      background: #f8f9fa;
    }
    
    /* ===== TOGGLE AZIONI MOBILE ===== */
    .match-actions-toggle {
      display: none;
      width: 100%;
      padding: 8px 12px;
      margin-top: 8px;
      background: #f0f4ff;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      color: #667eea;
      cursor: pointer;
      text-align: center;
    }
    .match-actions-toggle:hover {
      background: #e0e7ff;
    }
    
    /* ===== MOBILE ===== */
    @media (max-width: 640px) {
      .match-opponent { font-size: 15px; }
      .match-date-compact { font-size: 12px; }
      .match-badges .match-badge { font-size: 10px; padding: 2px 6px; }
      .match-progress { gap: 8px; }
      .progress-label { font-size: 9px; }
      /* Nasconde i pulsanti azione di default su mobile */
      .match-actions-row {
        display: none;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
        width: 100%;
      }
      .match-actions-row.expanded {
        display: grid;
      }
      .match-actions-row .btn {
        padding: 8px 4px !important;
        font-size: 11px;
        min-height: 38px;
        justify-content: center;
      }
      .match-actions-row .btn .btn-text { display: block; font-size: 10px; }
      .match-actions-toggle { display: block; }
      .result-badge { font-size: 11px; padding: 3px 8px; gap: 4px; }
      .result-score { font-size: 14px; }
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
  // Card cliccabile → apre dettaglio partita
  document.querySelectorAll('.match-card-inner[data-mid]').forEach(card => {
    card.addEventListener('click', (e) => {
      // Non aprire se click su bottone, select, o link
      if (e.target.closest('button, a, select, .match-card-actions, .match-actions-row, .match-actions-toggle')) return;
      const mid = card.dataset.mid;
      if (mid) window.YFM.openMatchDetail(mid);
    });
  });
}

export function renderMatchCard(m, stats, isNext = false) {
  // Cerca risultato in stats o usa dati diretti dalla partita (demo mode)
  const r = (stats?.risultati || []).find(x => x.id === m.id);
  const hasResult = !!(r || (m.gol_casa !== undefined && m.gol_trasferta !== undefined));
  const isPast = new Date(m.data_ora) < new Date();
  const isArchiviata = m.archiviata === true || m.archiviata === 'true';

  // Estrai gol (da stats o da dati diretti partita)
  const golFatti = r?.golFatti ?? m.gol_casa ?? null;
  const golSubiti = r?.golSubiti ?? m.gol_trasferta ?? null;

  // === BORDO SINISTRO COLORATO PER ESITO ===
  let borderColor = '#dee2e6'; // default grigio
  if (isArchiviata) {
    borderColor = '#8B7355'; // marrone
  } else if (isPast && hasResult && golFatti !== null && golSubiti !== null) {
    if (golFatti > golSubiti) borderColor = '#28a745'; // verde vittoria
    else if (golFatti < golSubiti) borderColor = '#dc3545'; // rosso sconfitta
    else borderColor = '#ffc107'; // giallo pareggio
  } else if (!isPast && isNext) {
    borderColor = '#28a745'; // verde prossima
  } else if (!isPast) {
    borderColor = '#667eea'; // viola future
  }

  // Stile contenitore
  const cardStyle = `border-left:4px solid ${borderColor};${isArchiviata ? 'opacity:0.7;background:#F9F8F6;' : ''}`;

  // === RIGA 1: Badge luogo + competizione + giornata ===
  const luogoBadge = m.luogo === 'Casa'
    ? '<span class="match-badge badge-casa">🏠 Casa</span>'
    : '<span class="match-badge badge-trasferta">✈️ Trasferta</span>';
  const compBadge = m.competizione ? `<span class="match-badge badge-section">${m.competizione}</span>` : '';
  const giornBadge = m.giornata ? `<span class="match-badge badge-section">⚽ G.${m.giornata}</span>` : '';
  const archivedBadge = isArchiviata ? '<span class="match-badge" style="background:#8B7355;color:white;">📦 Archiviata</span>' : '';

  // === RIGA 2: Avversario (grande) + Risultato ===
  let resultHtml = '';
  if (hasResult && golFatti !== null && golSubiti !== null) {
    let cls, icon;
    if (golFatti > golSubiti) { cls = 'result-victory'; icon = '✅'; }
    else if (golFatti < golSubiti) { cls = 'result-defeat'; icon = '❌'; }
    else { cls = 'result-draw'; icon = '🤝'; }
    resultHtml = `<span class="result-badge ${cls}"><span class="result-score">${golFatti} - ${golSubiti}</span>${icon}</span>`;
  } else if (!isPast) {
    // Partita futura senza risultato: bottone risultato
    resultHtml = `<button class="btn btn-primary btn-small" onclick="event.stopPropagation();window.YFM.openResultForm('${m.id}')">⚽ Risultato</button>`;
  }

  // === RIGA 3: Data compatta ===
  const dateHtml = formatDateCompact(m.data_ora);

  // === RIGA 4: Progress dots (solo partite future) ===
  let progressHtml = '';
  if (!isPast && !isArchiviata) {
    const nextStep = getNextStep(m.id);
    const steps = [
      { key: 'convocazione', label: 'Conv', done: nextStep !== 'convocazione' && nextStep !== null || (nextStep === null) },
      { key: 'formazione', label: 'Form', done: nextStep !== 'convocazione' && nextStep !== 'formazione' && nextStep !== null || (nextStep === null) },
      { key: 'risultato', label: 'Ris', done: nextStep !== 'convocazione' && nextStep !== 'formazione' && nextStep !== 'risultato' && nextStep !== null || (nextStep === null) },
      { key: 'eventi', label: 'Ev', done: nextStep === null }
    ];
    // Ricalcola con logica lineare
    const stepOrder = ['convocazione', 'formazione', 'risultato', 'eventi'];
    const currentIdx = nextStep ? stepOrder.indexOf(nextStep) : 4;
    
    progressHtml = '<div class="match-progress">' +
      stepOrder.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const labels = { convocazione: 'Conv', formazione: 'Form', risultato: 'Ris', eventi: 'Ev' };
        const dotClass = done ? 'progress-done' : active ? 'progress-active' : 'progress-pending';
        return `<div class="progress-step ${dotClass}"><span class="progress-dot"></span><span class="progress-label">${labels[s]}</span></div>`;
      }).join('') + '</div>';
  }

  // === RIGA 5: Pulsanti azione ===
  let actionsHtml = '';
  const nextStep = getNextStep(m.id);

  if (!isPast && !isArchiviata) {
    // Aggiungi CSS per animazione pallino
    if (!document.getElementById('pallino-style')) {
      const style = document.createElement('style');
      style.id = 'pallino-style';
      style.textContent = '@keyframes blink-pallino{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.3;transform:scale(0.8);}';
      document.head.appendChild(style);
    }
    actionsHtml += makeBtn('Convoca', `window.YFM.openConvocation('${m.id}',false)`, nextStep === 'convocazione');
    actionsHtml += makeBtn('Formazione', `window.YFM.openFormazioneForm('${m.id}')`, nextStep === 'formazione');
    actionsHtml += makeBtn('Distinta', `window.YFM.openDistinta('${m.id}')`, false);
    actionsHtml += makeBtn('Note', `window.YFM.openNoteAvversario('${m.id}')`, false);
    if (hasResult) {
      actionsHtml += makeBtn('Eventi', `window.YFM.openResultForm('${m.id}',true)`, nextStep === 'eventi');
    }
  } else if (isPast && hasResult && !isArchiviata) {
    actionsHtml += makeBtn('Convoca', `window.YFM.openConvocation('${m.id}',true)`, false);
    actionsHtml += makeBtn('Formazione', `window.YFM.openFormazioneForm('${m.id}')`, false);
    actionsHtml += makeBtn('Distinta', `window.YFM.openDistinta('${m.id}')`, false);
    actionsHtml += makeBtn('Eventi', `window.YFM.openResultForm('${m.id}',true)`, false);
    actionsHtml += makeBtn('Note', `window.YFM.openNoteAvversario('${m.id}')`, false);
  } else if (isPast && !hasResult) {
    actionsHtml += makeBtn('Convoca', `window.YFM.openConvocation('${m.id}',true)`, false);
    actionsHtml += makeBtn('Formazione', `window.YFM.openFormazioneForm('${m.id}')`, false);
    actionsHtml += makeBtn('Distinta', `window.YFM.openDistinta('${m.id}')`, false);
  } else {
    // Archiviate
    actionsHtml += makeBtn('Convoca', `window.YFM.openConvocation('${m.id}',true)`, false);
    actionsHtml += makeBtn('Formazione', `window.YFM.openFormazioneForm('${m.id}')`, false);
    actionsHtml += makeBtn('Distinta', `window.YFM.openDistinta('${m.id}')`, false);
    actionsHtml += makeBtn('Note', `window.YFM.openNoteAvversario('${m.id}')`, false);
  }

  // === PULSANTI EDIT/DELETE/ARCHIVIA ===
  let editBtns = '';
  if (!isArchiviata) {
    const archBtn = (isPast && hasResult) ? `<button class="btn btn-secondary btn-small" style="color:#856404;" onclick="event.stopPropagation();archiveMatch('${m.id}')" title="Archivia">📦</button>` : '';
    editBtns = `${archBtn}<button class="btn btn-secondary btn-small btn-editm" data-mid="${m.id}" title="Modifica">✏️</button><button class="btn btn-secondary btn-small btn-danger btn-del" data-mid="${m.id}" title="Elimina">🗑️</button>`;
  } else {
    editBtns = `<button class="btn btn-secondary btn-small" style="background:#6B5B4F;color:white;border-color:#6B5B4F;" onclick="event.stopPropagation();unarchiveMatch('${m.id}')" title="Sblocca">🔓</button>`;
  }

  return `<div class="match-card-inner" data-mid="${m.id}" style="${cardStyle}padding-left:12px;">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
      <div style="flex:1;min-width:0;">
        <div class="match-badges" style="margin-bottom:6px;">${luogoBadge}${compBadge}${giornBadge}${archivedBadge}</div>
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
          <span class="match-opponent">${m.avversario}</span>
          ${resultHtml}
        </div>
        <div class="match-date-compact">📅 ${dateHtml}</div>
        ${progressHtml}
      </div>
      <div class="match-card-actions">${editBtns}</div>
    </div>
    <button class="match-actions-toggle" onclick="event.stopPropagation();this.nextElementSibling.classList.toggle('expanded');this.textContent=this.nextElementSibling.classList.contains('expanded')?'▲ Chiudi':'⋯ Azioni'">⋯ Azioni</button>
    <div class="match-actions-row">${actionsHtml}</div>
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
  const isDemo = localStorage.getItem('yfm_demo_session') === 'active';
  showLoading();
  try {
    if (isDemo) {
      // Demo mode: salva in memoria
      if (m) {
        // Modifica partita esistente
        const match = window.YFM.demoMatches?.find(x => x.id === m.id);
        if (match) {
          match.data_ora = d.dataOra;
          match.avversario = d.avversario;
          match.luogo = d.luogo;
          match.competizione = d.competizione;
          match.giornata = d.giornata;
        }
        // Aggiorna anche in persistenza
        if (demoPersistence.data.matches) {
          const pm = demoPersistence.data.matches.find(x => x.id === m.id);
          if (pm) {
            pm.data_ora = d.dataOra;
            pm.avversario = d.avversario;
            pm.luogo = d.luogo;
            pm.competizione = d.competizione;
            pm.giornata = d.giornata;
            demoPersistence._markDirty();
          }
        }
      } else {
        // Nuova partita
        const newMatch = {
          id: 'm_' + Date.now(),
          data_ora: d.dataOra,
          avversario: d.avversario,
          luogo: d.luogo,
          competizione: d.competizione,
          giornata: d.giornata,
          stato: 'Da disputare'
        };
        if (!window.YFM.demoMatches) window.YFM.demoMatches = [];
        window.YFM.demoMatches.push(newMatch);
        if (demoPersistence.data.matches) {
          demoPersistence.data.matches.push(newMatch);
          demoPersistence._markDirty();
        }
      }
      modal.close();
      loadCalendar();
    } else {
      if (m) await apiFetch('/partite/' + m.id, { method: 'PUT', body: JSON.stringify(d) });
      else await apiFetch('/squadre/' + window.YFM.squadraId + '/partite', { method: 'POST', body: JSON.stringify(d) });
      modal.close();
      loadCalendar();
    }
  } catch (e) { alert(e.message); }
  finally { hideLoading(); }
  });
}

async function deleteMatch(id) {
  if (!confirm('Eliminare?')) return;
  const isDemo = localStorage.getItem('yfm_demo_session') === 'active';
  if (isDemo) {
    // Demo mode: rimuovi dalla lista in memoria
    if (window.YFM.demoMatches) {
      window.YFM.demoMatches = window.YFM.demoMatches.filter(m => m.id !== id);
    }
    if (demoPersistence.data.matches) {
      demoPersistence.data.matches = demoPersistence.data.matches.filter(m => m.id !== id);
      demoPersistence._markDirty();
    }
    loadCalendar();
  } else {
    await apiFetch('/partite/' + id, { method: 'DELETE' });
    loadCalendar();
  }
}

function openImportCSV() {
  const isDemo = localStorage.getItem('yfm_demo_session') === 'active';
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
  
  if (isDemo) {
    // Demo mode: importa in memoria
    let importate = 0;
    csvData.forEach(row => {
      if (row.length < 3) return;
      const [data, ora, avversario, luogo, competizione, giornata] = row;
      const dataOra = new Date(`${data}T${ora || '15:00'}:00`).toISOString();
      const newMatch = {
        id: 'm_' + Date.now() + '_' + importate,
        data_ora: dataOra,
        avversario: avversario || 'Avversario',
        luogo: luogo || 'Casa',
        competizione: competizione || 'Campionato',
        giornata: parseInt(giornata) || null,
        stato: 'Da disputare'
      };
      if (!window.YFM.demoMatches) window.YFM.demoMatches = [];
      window.YFM.demoMatches.push(newMatch);
      if (demoPersistence.data.matches) {
        demoPersistence.data.matches.push(newMatch);
      }
      importate++;
    });
    if (importate > 0) demoPersistence._markDirty();
    modal.close();
    alert('✅ Importate ' + importate + ' partite in demo!');
    loadCalendar();
  } else {
    showLoading();
    try {
      const res = await apiFetch('/squadre/' + window.YFM.squadraId + '/importa-calendario', { method: 'POST', body: JSON.stringify({ csvData }) });
      hideLoading();
      modal.close();
      alert('✅ Importate ' + res.inserite + ' partite!');
      loadCalendar();
    } catch (e) { hideLoading(); alert('Errore: ' + e.message); }
  }
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
