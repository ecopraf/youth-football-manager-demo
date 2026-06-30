import { apiFetch } from '../../services/api';
import { showLoading, hideLoading } from '../../utils/ui';
import demoPersistence from '../demo/DemoPersistence';

const RUOLO_ACR = { 'Portiere': 'POR', 'Difensore': 'DIF', 'Centrocampista': 'CEN', 'Attaccante': 'ATT' };

// Moduli disponibili con posizioni (righe dal basso: portiere, difesa, centrocampo, attacco)
const MODULI = {
  '4-3-3': { label: '4-3-3', rows: [1, 4, 3, 3] },
  '4-4-2': { label: '4-4-2', rows: [1, 4, 4, 2] },
  '3-5-2': { label: '3-5-2', rows: [1, 3, 5, 2] },
  '3-4-3': { label: '3-4-3', rows: [1, 3, 4, 3] },
  '4-2-3-1': { label: '4-2-3-1', rows: [1, 4, 2, 3, 1] },
  '4-5-1': { label: '4-5-1', rows: [1, 4, 5, 1] },
  '5-3-2': { label: '5-3-2', rows: [1, 5, 3, 2] },
  '4-1-4-1': { label: '4-1-4-1', rows: [1, 4, 1, 4, 1] },
};

const PITCH_CSS = `
.pitch-container { display: flex; gap: 16px; flex-wrap: wrap; }
.pitch-panel { flex: 1; min-width: 300px; }
.pitch-roster { flex: 0 0 220px; max-height: 500px; overflow-y: auto; }
@media (max-width: 768px) { .pitch-roster { flex: 1 1 100%; max-height: 250px; } }
.pitch {
  width: 100%; aspect-ratio: 3/4; background: linear-gradient(180deg, #2d8a4e 0%, #1a6b38 100%);
  border-radius: 12px; position: relative; overflow: hidden; border: 3px solid #1a5c30;
}
.pitch::before {
  content: ''; position: absolute; top: 50%; left: 10%; right: 10%; height: 1px; background: rgba(255,255,255,0.3);
}
.pitch::after {
  content: ''; position: absolute; top: 50%; left: 50%; width: 60px; height: 60px;
  border: 1px solid rgba(255,255,255,0.3); border-radius: 50%; transform: translate(-50%, -50%);
}
.pitch-slot {
  position: absolute; width: 44px; height: 44px; border-radius: 50%;
  background: rgba(255,255,255,0.15); border: 2px dashed rgba(255,255,255,0.4);
  display: flex; align-items: center; justify-content: center;
  transform: translate(-50%, -50%); transition: all 0.2s; cursor: default;
}
.pitch-slot.occupied { background: white; border: 2px solid #667eea; cursor: grab; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
.pitch-slot.occupied:active { cursor: grabbing; transform: translate(-50%, -50%) scale(1.1); }
.pitch-slot.drag-over { background: rgba(102,126,234,0.4); border-color: white; transform: translate(-50%, -50%) scale(1.15); }
.pitch-slot .slot-num { font-size: 14px; font-weight: 700; color: #667eea; }
.pitch-slot .slot-name { position: absolute; bottom: -16px; font-size: 8px; color: white; font-weight: 600; white-space: nowrap; text-shadow: 0 1px 2px rgba(0,0,0,0.8); }
.pitch-slot.occupied .slot-name { color: #fff; }
.roster-item {
  display: flex; align-items: center; gap: 8px; padding: 8px 10px; margin-bottom: 4px;
  background: #f8f9fa; border-radius: 8px; cursor: grab; border: 1px solid #eee; transition: all 0.2s;
}
.roster-item:active { cursor: grabbing; }
.roster-item.dragging { opacity: 0.4; }
.roster-item.placed { opacity: 0.35; pointer-events: none; }
.roster-item .r-num { width: 26px; height: 26px; background: #667eea; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
.roster-item .r-name { font-size: 12px; font-weight: 500; flex: 1; }
.roster-item .r-role { font-size: 10px; color: #888; }
.roster-item.is-riserva .r-num { background: #999; }
.modulo-select { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
.modulo-btn { padding: 6px 12px; border-radius: 8px; border: 1px solid #dee2e6; background: white; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s; }
.modulo-btn:hover { border-color: #667eea; background: #f0f4ff; }
.modulo-btn.active { background: #667eea; color: white; border-color: #667eea; }
.bench-section { margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee; }
.bench-section h5 { margin: 0 0 8px; font-size: 12px; color: #666; }
.pitch-readonly .pitch-slot.occupied { cursor: default; }
.pitch-readonly .pitch-slot.occupied:active { transform: translate(-50%, -50%); }
`;

export async function openFormazioneForm(mid) {
  const isDemo = localStorage.getItem('yfm_demo_session') === 'active';
  const match = (isDemo ? window.YFM.demoMatches : window.YFM.allMatches)?.find(m => m.id === mid) || {};
  const isArchiviata = match.archiviata === true || match.archiviata === 'true';

  let convocazioni = [], formazioneSalvata = null, giocatori = [];

  if (isDemo) {
    const convocazioneIds = demoPersistence.getConvocation(mid) || window.YFM.demoConvocazioni?.[mid] || [];
    formazioneSalvata = demoPersistence.getFormation(mid);
    giocatori = window.YFM.allPlayers || [];
    convocazioni = convocazioneIds.map(id => ({ calciatoreId: id, presente: true }));
  }

  const convocatiIds = convocazioni.filter(c => c.presente === true).map(c => c.calciatoreId);
  const ruoloOrder = ['Portiere', 'Difensore', 'Centrocampista', 'Attaccante'];
  const giocatoriConvocati = giocatori.filter(g => convocatiIds.includes(g.id)).sort((a, b) => {
    const ra = ruoloOrder.indexOf(a.ruolo), rb = ruoloOrder.indexOf(b.ruolo);
    if (ra !== rb) return ra - rb;
    return a.cognome.localeCompare(b.cognome);
  });

  if (isArchiviata) {
    renderPitchReadOnly(match, giocatoriConvocati, formazioneSalvata, giocatori);
  } else {
    renderPitchEdit(mid, match, giocatoriConvocati, formazioneSalvata, giocatori, isDemo);
  }
}

// ==================== VISTA READ-ONLY ====================
function renderPitchReadOnly(match, giocatoriConvocati, formazione, allPlayers) {
  const modulo = formazione?.modulo || '4-3-3';
  const titolariIds = [
    formazione?.portiere,
    ...(formazione?.difensori || []),
    ...(formazione?.centrocampisti || []),
    ...(formazione?.attaccanti || [])
  ].filter(Boolean);
  const riserveIds = formazione?.riserve || [];

  let html = `<style>${PITCH_CSS}</style>`;
  html += `<div class="pitch-readonly">`;
  html += `<div style="text-align:center;margin-bottom:12px;">`;
  html += `<span style="background:#667eea;color:white;padding:4px 12px;border-radius:8px;font-size:13px;font-weight:600;">Modulo: ${modulo}</span>`;
  html += `</div>`;
  html += `<div class="pitch" id="pitchField">${buildPitchSlots(modulo, titolariIds, allPlayers)}</div>`;

  // Panchina
  if (riserveIds.length > 0) {
    html += `<div class="bench-section"><h5>🪑 Panchina (${riserveIds.length})</h5><div style="display:flex;flex-wrap:wrap;gap:6px;">`;
    riserveIds.forEach(id => {
      const g = allPlayers.find(p => p.id === id);
      if (g) {
        const num = g.numero_maglia || g.numeroMaglia || '?';
        html += `<span style="background:#f0f0f0;padding:4px 10px;border-radius:6px;font-size:11px;">${num} ${g.cognome}</span>`;
      }
    });
    html += `</div></div>`;
  }
  html += `</div>`;

  const footer = '<button class="btn btn-secondary" id="modalCancelBtn">Chiudi</button>';
  const modal = createModal('👥 Formazione - ' + match.avversario, html, footer, '500px');
  document.getElementById('modalCancelBtn').addEventListener('click', () => modal.close());
}

// ==================== FORM EDITABILE CON DRAG & DROP ====================
function renderPitchEdit(mid, match, giocatoriConvocati, formazione, allPlayers, isDemo) {
  const savedModulo = formazione?.modulo || '4-3-3';
  const titolariIds = formazione ? [
    formazione.portiere,
    ...(formazione.difensori || []),
    ...(formazione.centrocampisti || []),
    ...(formazione.attaccanti || [])
  ].filter(Boolean) : [];
  const riserveIds = formazione?.riserve || [];

  let html = `<style>${PITCH_CSS}</style>`;
  html += `<p style="margin-bottom:8px;font-size:13px;color:#666;">Trascina i giocatori dalla lista al campo. Seleziona il modulo per posizionare gli slot.</p>`;

  // Selettore modulo
  html += `<div class="modulo-select" id="moduloSelect">`;
  Object.keys(MODULI).forEach(k => {
    const active = k === savedModulo ? ' active' : '';
    html += `<button class="modulo-btn${active}" data-modulo="${k}">${k}</button>`;
  });
  html += `</div>`;

  html += `<div class="pitch-container">`;

  // Campo
  html += `<div class="pitch-panel"><div class="pitch" id="pitchField">${buildPitchSlots(savedModulo, titolariIds, allPlayers)}</div>`;
  html += `<div id="pitchCount" style="text-align:center;margin-top:8px;font-size:12px;font-weight:600;color:#667eea;">${titolariIds.length}/11 titolari</div>`;
  html += `</div>`;

  // Roster
  html += `<div class="pitch-roster" id="rosterList">`;
  html += `<h5 style="margin:0 0 8px;font-size:12px;color:#333;">📋 Convocati</h5>`;
  giocatoriConvocati.forEach(g => {
    const num = g.numero_maglia || g.numeroMaglia || '?';
    const placed = titolariIds.includes(g.id) ? ' placed' : '';
    const isRiserva = riserveIds.includes(g.id) && !titolariIds.includes(g.id) ? ' is-riserva' : '';
    html += `<div class="roster-item${placed}${isRiserva}" draggable="true" data-pid="${g.id}" data-num="${num}" data-name="${g.cognome}">`;
    html += `<div class="r-num">${num}</div>`;
    html += `<div class="r-name">${g.cognome} ${g.nome}</div>`;
    html += `<div class="r-role">${RUOLO_ACR[g.ruolo] || ''}</div>`;
    html += `</div>`;
  });
  html += `</div>`;
  html += `</div>`;

  const footer = '<button class="btn btn-secondary" id="modalCancelBtn">Annulla</button><button class="btn btn-primary" id="saveFormBtn">💾 Salva Formazione</button>';
  const modal = createModal('👥 Formazione - ' + match.avversario, html, footer, '850px');

  // State
  let currentModulo = savedModulo;
  let slotAssignments = {}; // slotIndex -> playerId
  // Inizializza con formazione esistente
  titolariIds.forEach((id, i) => { slotAssignments[i] = id; });

  // Modulo switch
  document.querySelectorAll('#moduloSelect .modulo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#moduloSelect .modulo-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentModulo = btn.dataset.modulo;
      // Mantieni assegnamenti se possibile
      const totalSlots = MODULI[currentModulo].rows.reduce((a, b) => a + b, 0);
      const newAssignments = {};
      Object.values(slotAssignments).forEach((pid, i) => {
        if (i < totalSlots) newAssignments[i] = pid;
      });
      slotAssignments = newAssignments;
      refreshPitch();
    });
  });

  // Drag & Drop
  setupDragDrop(slotAssignments, giocatoriConvocati, allPlayers, () => currentModulo, refreshPitch);

  function refreshPitch() {
    const field = document.getElementById('pitchField');
    if (field) field.innerHTML = buildPitchSlotsFromState(currentModulo, slotAssignments, allPlayers);
    updateRosterState(slotAssignments);
    updateCount(slotAssignments);
    setupDragDrop(slotAssignments, giocatoriConvocati, allPlayers, () => currentModulo, refreshPitch);
  }

  function updateCount(assignments) {
    const cnt = document.getElementById('pitchCount');
    const n = Object.keys(assignments).length;
    if (cnt) cnt.textContent = `${n}/11 titolari`;
    const saveBtn = document.getElementById('saveFormBtn');
    if (saveBtn) { saveBtn.disabled = n !== 11; saveBtn.style.opacity = n === 11 ? '1' : '0.5'; }
  }

  updateCount(slotAssignments);

  // Save
  document.getElementById('saveFormBtn').addEventListener('click', () => {
    const placed = Object.values(slotAssignments);
    if (placed.length !== 11) { alert('⚠️ Devi posizionare esattamente 11 giocatori!'); return; }

    // Verifica portiere
    const portieri = placed.filter(id => { const g = allPlayers.find(p => p.id === id); return g?.ruolo === 'Portiere'; });
    if (portieri.length === 0) { alert('⚠️ Serve almeno un portiere tra i titolari!'); return; }
    if (portieri.length > 1) { alert('⚠️ Solo 1 portiere può essere titolare!'); return; }

    const riserve = giocatoriConvocati.filter(g => !placed.includes(g.id)).map(g => g.id);

    const formation = {
      modulo: currentModulo,
      portiere: portieri[0],
      difensori: placed.filter(id => { const g = allPlayers.find(p => p.id === id); return g?.ruolo === 'Difensore'; }),
      centrocampisti: placed.filter(id => { const g = allPlayers.find(p => p.id === id); return g?.ruolo === 'Centrocampista'; }),
      attaccanti: placed.filter(id => { const g = allPlayers.find(p => p.id === id); return g?.ruolo === 'Attaccante'; }),
      riserve
    };

    if (isDemo) {
      demoPersistence.saveFormation(mid, formation);
      window.YFM.demoFormazioni = window.YFM.demoFormazioni || {};
      window.YFM.demoFormazioni[mid] = formation;
      modal.close();
      if (window.YFM?.loadCalendar) window.YFM.loadCalendar();
      else if (window.loadCalendar) window.loadCalendar();
      alert('✅ Formazione salvata!');
    }
  });

  document.getElementById('modalCancelBtn').addEventListener('click', () => modal.close());
}

// ==================== PITCH RENDERING ====================
function buildPitchSlots(modulo, titolariIds, allPlayers) {
  const assignments = {};
  titolariIds.forEach((id, i) => { assignments[i] = id; });
  return buildPitchSlotsFromState(modulo, assignments, allPlayers);
}

function buildPitchSlotsFromState(modulo, assignments, allPlayers) {
  const config = MODULI[modulo] || MODULI['4-3-3'];
  const rows = config.rows;
  let html = '';
  let slotIdx = 0;

  rows.forEach((count, rowIndex) => {
    const totalRows = rows.length;
    // Posizione Y: dal basso (portiere) all'alto (attacco)
    const yPercent = 90 - (rowIndex * (75 / (totalRows - 1)));

    for (let i = 0; i < count; i++) {
      const xPercent = count === 1 ? 50 : 15 + (i * (70 / (count - 1)));
      const pid = assignments[slotIdx];
      const player = pid ? allPlayers.find(p => p.id === pid) : null;
      const occupied = player ? ' occupied' : '';
      const num = player ? (player.numero_maglia || player.numeroMaglia || '?') : '';
      const name = player ? player.cognome : '';

      html += `<div class="pitch-slot${occupied}" data-slot="${slotIdx}" style="top:${yPercent}%;left:${xPercent}%;">`;
      if (player) {
        html += `<span class="slot-num">${num}</span>`;
        html += `<span class="slot-name">${name}</span>`;
      }
      html += `</div>`;
      slotIdx++;
    }
  });

  return html;
}

// ==================== DRAG & DROP ====================
function setupDragDrop(assignments, giocatoriConvocati, allPlayers, getModulo, refresh) {
  let draggedPid = null;
  let draggedFromSlot = null;

  // Roster items drag
  document.querySelectorAll('.roster-item[draggable]').forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedPid = item.dataset.pid;
      draggedFromSlot = null;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      draggedPid = null;
    });
  });

  // Pitch slots - drag from occupied slot
  document.querySelectorAll('.pitch-slot.occupied').forEach(slot => {
    slot.setAttribute('draggable', 'true');
    slot.addEventListener('dragstart', (e) => {
      const idx = parseInt(slot.dataset.slot);
      draggedPid = assignments[idx];
      draggedFromSlot = idx;
      e.dataTransfer.effectAllowed = 'move';
    });
    slot.addEventListener('dragend', () => { draggedPid = null; draggedFromSlot = null; });
  });

  // Pitch slots - drop targets
  document.querySelectorAll('.pitch-slot').forEach(slot => {
    slot.addEventListener('dragover', (e) => { e.preventDefault(); slot.classList.add('drag-over'); });
    slot.addEventListener('dragleave', () => { slot.classList.remove('drag-over'); });
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.classList.remove('drag-over');
      const targetIdx = parseInt(slot.dataset.slot);
      if (!draggedPid) return;

      // Se lo slot target è già occupato, scambia
      const existingPid = assignments[targetIdx];

      // Rimuovi dal vecchio slot se veniva dal campo
      if (draggedFromSlot !== null) {
        delete assignments[draggedFromSlot];
        if (existingPid) assignments[draggedFromSlot] = existingPid;
      } else {
        // Veniva dalla roster: se target occupato, libera il vecchio
        if (existingPid) {
          // Rimuovi il vecchio dal campo
          delete assignments[targetIdx];
        }
        // Rimuovi se era già piazzato altrove
        Object.keys(assignments).forEach(k => {
          if (assignments[k] === draggedPid) delete assignments[k];
        });
      }

      // Controlla limite 11
      if (!draggedFromSlot && Object.keys(assignments).length >= 11 && !existingPid) {
        draggedPid = null;
        return;
      }

      assignments[targetIdx] = draggedPid;
      draggedPid = null;
      draggedFromSlot = null;
      refresh();
    });
  });

  // Drop back to roster (rimuovi dal campo)
  const rosterEl = document.getElementById('rosterList');
  if (rosterEl) {
    rosterEl.addEventListener('dragover', (e) => { e.preventDefault(); });
    rosterEl.addEventListener('drop', (e) => {
      e.preventDefault();
      if (draggedFromSlot !== null && draggedPid) {
        delete assignments[draggedFromSlot];
        draggedPid = null;
        draggedFromSlot = null;
        refresh();
      }
    });
  }
}

function updateRosterState(assignments) {
  const placedIds = new Set(Object.values(assignments));
  document.querySelectorAll('.roster-item').forEach(item => {
    if (placedIds.has(item.dataset.pid)) {
      item.classList.add('placed');
    } else {
      item.classList.remove('placed');
    }
  });
}

// ==================== MODAL HELPER ====================
function createModal(title, content, footer, maxW = '600px') {
  const existing = document.getElementById('currentModal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'currentModal';
  modal.innerHTML = `<div class="modal-content" style="max-width:${maxW};"><div class="modal-header"><h2>${title}</h2><button class="modal-close-btn" id="modalCloseX">×</button></div><div class="modal-body">${content}</div>${footer ? '<div class="modal-footer">' + footer + '</div>' : ''}</div>`;
  document.body.appendChild(modal);
  const close = () => { const m = document.getElementById('currentModal'); if (m) m.remove(); };
  document.getElementById('modalCloseX').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  return { modal, close };
}
