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
.pitch-panel { flex: 1; min-width: 240px; }
.pitch-roster { flex: 0 0 200px; max-height: 420px; overflow-y: auto; }
@media (max-width: 768px) {
  .pitch-container { flex-direction: column; align-items: stretch; }
  .pitch-panel { display: flex; flex-direction: column; align-items: center; }
  .pitch-roster {
    flex: 1 1 auto; max-height: none; overflow-y: visible;
    background: #fff; border-radius: 12px; padding: 10px;
    border: 1px solid #eee; margin-top: 8px;
  }
}
.pitch {
  width: 100%; max-width: 340px; aspect-ratio: 2/3; margin: 0 auto;
  background: linear-gradient(180deg, #2d8a4e 0%, #1a6b38 100%);
  border-radius: 12px; position: relative; overflow: hidden; border: 3px solid #1a5c30;
  touch-action: none;
}
.pitch::before {
  content: ''; position: absolute; top: 50%; left: 8%; right: 8%; height: 1px; background: rgba(255,255,255,0.25);
}
.pitch::after {
  content: ''; position: absolute; top: 50%; left: 50%; width: 50px; height: 50px;
  border: 1px solid rgba(255,255,255,0.25); border-radius: 50%; transform: translate(-50%, -50%);
}
.pitch-slot {
  position: absolute; width: 38px; height: 38px; border-radius: 50%;
  background: rgba(255,255,255,0.12); border: 2px dashed rgba(255,255,255,0.35);
  display: flex; align-items: center; justify-content: center;
  transform: translate(-50%, -50%); transition: background 0.2s, border 0.2s, box-shadow 0.2s;
  cursor: default; user-select: none; touch-action: none;
}
.pitch-slot.occupied {
  background: white; border: 2px solid #667eea; cursor: grab;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.pitch-slot.occupied.free-move { cursor: move; }
.pitch-slot.occupied:active { cursor: grabbing; }
.pitch-slot.drag-over { background: rgba(102,126,234,0.4); border-color: white; transform: translate(-50%, -50%) scale(1.12); }
.pitch-slot .slot-num { font-size: 13px; font-weight: 700; color: #667eea; pointer-events: none; }
.pitch-slot .slot-name {
  position: absolute; bottom: -14px; font-size: 7px; color: white;
  font-weight: 600; white-space: nowrap; text-shadow: 0 1px 2px rgba(0,0,0,0.9); pointer-events: none;
}
.roster-item {
  display: flex; align-items: center; gap: 6px; padding: 6px 8px; margin-bottom: 3px;
  background: #f8f9fa; border-radius: 8px; cursor: grab; border: 1px solid #eee; transition: all 0.2s;
  font-size: 11px; touch-action: none; user-select: none;
}
.roster-item:active { cursor: grabbing; }
.roster-item.dragging { opacity: 0.4; }
.roster-item.placed { opacity: 0.3; pointer-events: none; }
.roster-item .r-num { width: 22px; height: 22px; background: #667eea; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
.roster-item .r-name { font-weight: 500; flex: 1; }
.roster-item .r-role { font-size: 9px; color: #888; }
.roster-item.is-riserva .r-num { background: #999; }
.modulo-select { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 10px; }
.modulo-btn { padding: 5px 10px; border-radius: 8px; border: 1px solid #dee2e6; background: white; cursor: pointer; font-size: 11px; font-weight: 600; transition: all 0.2s; }
.modulo-btn:hover { border-color: #667eea; background: #f0f4ff; }
.modulo-btn.active { background: #667eea; color: white; border-color: #667eea; }
.bench-section { margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee; }
.bench-section h5 { margin: 0 0 6px; font-size: 11px; color: #666; }
.pitch-readonly .pitch-slot.occupied { cursor: default; }
@media (max-width: 640px) {
  .pitch { max-width: 260px; }
  .pitch-slot { width: 30px; height: 30px; }
  .pitch-slot .slot-num { font-size: 10px; }
  .pitch-slot .slot-name { font-size: 6px; bottom: -11px; }
  .roster-item { padding: 5px 6px; font-size: 10px; }
  .roster-item .r-num { width: 18px; height: 18px; font-size: 8px; }
  .pitch-roster { padding: 8px; }
  .modulo-select { gap: 4px; }
  .modulo-btn { padding: 4px 8px; font-size: 10px; }
}
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
  html += `<div class="pitch" id="pitchField">${buildPitchSlots(modulo, titolariIds, allPlayers, formazione?.positions)}</div>`;

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
  html += `<div class="pitch-panel"><div class="pitch" id="pitchField">${buildPitchSlots(savedModulo, titolariIds, allPlayers, formazione?.positions)}</div>`;
  html += `<div id="pitchCount" style="text-align:center;margin-top:8px;font-size:12px;font-weight:600;color:#667eea;">${titolariIds.length}/11 titolari</div>`;
  html += `</div>`;

  // Roster
  html += `<div class="pitch-roster" id="rosterList">`;
  html += `<h5 style="margin:0 0 8px;font-size:12px;color:#333;">📋 Convocati</h5>`;
  giocatoriConvocati.forEach(g => {
    const num = g.numero_maglia || g.numeroMaglia || '?';
    const placed = titolariIds.includes(g.id) ? ' placed' : '';
    const isRiserva = riserveIds.includes(g.id) && !titolariIds.includes(g.id) ? ' is-riserva' : '';
    html += `<div class="roster-item${placed}${isRiserva}" data-pid="${g.id}" data-num="${num}" data-name="${g.cognome}">`;
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
  let customPositions = {}; // slotIndex -> {x, y} percentuali
  // Inizializza con formazione esistente
  titolariIds.forEach((id, i) => { slotAssignments[i] = id; });
  // Carica posizioni custom salvate (normalizza chiavi a numeri)
  if (formazione?.positions) {
    Object.keys(formazione.positions).forEach(k => {
      customPositions[parseInt(k)] = formazione.positions[k];
    });
  }

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
      customPositions = {}; // Reset posizioni custom al cambio modulo
      refreshPitch();
    });
  });

  // Drag & Drop + Free Move
  setupDragDrop(slotAssignments, giocatoriConvocati, allPlayers, () => currentModulo, refreshPitch, customPositions);

  function refreshPitch() {
    const field = document.getElementById('pitchField');
    if (field) field.innerHTML = buildPitchSlotsFromState(currentModulo, slotAssignments, allPlayers, customPositions);
    updateRosterState(slotAssignments);
    updateCount(slotAssignments);
    setupDragDrop(slotAssignments, giocatoriConvocati, allPlayers, () => currentModulo, refreshPitch, customPositions);
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
      positions: customPositions,
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
function buildPitchSlots(modulo, titolariIds, allPlayers, positions) {
  const assignments = {};
  titolariIds.forEach((id, i) => { assignments[i] = id; });
  // Normalizza chiavi positions a numeri
  const normPos = {};
  if (positions) Object.keys(positions).forEach(k => { normPos[parseInt(k)] = positions[k]; });
  return buildPitchSlotsFromState(modulo, assignments, allPlayers, normPos);
}

function buildPitchSlotsFromState(modulo, assignments, allPlayers, customPositions) {
  const config = MODULI[modulo] || MODULI['4-3-3'];
  const rows = config.rows;
  let html = '';
  let slotIdx = 0;

  rows.forEach((count, rowIndex) => {
    const totalRows = rows.length;
    const yPercent = 90 - (rowIndex * (75 / (totalRows - 1)));

    for (let i = 0; i < count; i++) {
      const xPercent = count === 1 ? 50 : 15 + (i * (70 / (count - 1)));
      // Usa posizione custom se disponibile
      const custom = customPositions?.[slotIdx];
      const finalX = custom ? custom.x : xPercent;
      const finalY = custom ? custom.y : yPercent;

      const pid = assignments[slotIdx];
      const player = pid ? allPlayers.find(p => p.id === pid) : null;
      const occupied = player ? ' occupied' : '';
      const num = player ? (player.numero_maglia || player.numeroMaglia || '?') : '';
      const name = player ? player.cognome : '';

      html += `<div class="pitch-slot${occupied}" data-slot="${slotIdx}" style="top:${finalY}%;left:${finalX}%;">`;
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

// ==================== POINTER-BASED DRAG (MOBILE + DESKTOP) ====================
function setupDragDrop(assignments, giocatoriConvocati, allPlayers, getModulo, refresh, customPositions) {
  let dragState = null; // { pid, fromSlot, ghost, pointerId }

  function createGhost(text, num) {
    const g = document.createElement('div');
    g.className = 'drag-ghost';
    g.style.cssText = 'position:fixed;z-index:99999;pointer-events:none;background:#667eea;color:white;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,0.3);white-space:nowrap;transform:translate(-50%,-50%);';
    g.textContent = `${num} ${text}`;
    document.body.appendChild(g);
    return g;
  }

  function moveGhost(e) {
    if (!dragState?.ghost) return;
    dragState.ghost.style.left = e.clientX + 'px';
    dragState.ghost.style.top = e.clientY + 'px';
  }

  function getSlotAtPoint(x, y) {
    const els = document.elementsFromPoint(x, y);
    return els.find(el => el.classList?.contains('pitch-slot')) || null;
  }

  function isOverRoster(x, y) {
    const roster = document.getElementById('rosterList');
    if (!roster) return false;
    const r = roster.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  function cleanup() {
    if (dragState?.ghost) dragState.ghost.remove();
    document.querySelectorAll('.pitch-slot.drag-over').forEach(s => s.classList.remove('drag-over'));
    document.querySelectorAll('.roster-item.dragging').forEach(s => s.classList.remove('dragging'));
    dragState = null;
  }

  function startDrag(e, pid, fromSlot, name, num) {
    e.preventDefault();
    dragState = { pid, fromSlot, ghost: createGhost(name, num), pointerId: e.pointerId };
    moveGhost(e);
    if (fromSlot === null) {
      const item = document.querySelector(`.roster-item[data-pid="${pid}"]`);
      if (item) item.classList.add('dragging');
    }
  }

  function onMove(e) {
    if (!dragState) return;
    e.preventDefault();
    moveGhost(e);
    // Highlight slot under pointer
    document.querySelectorAll('.pitch-slot.drag-over').forEach(s => s.classList.remove('drag-over'));
    const slot = getSlotAtPoint(e.clientX, e.clientY);
    if (slot) slot.classList.add('drag-over');
  }

  function onEnd(e) {
    if (!dragState) return;
    const { pid, fromSlot } = dragState;
    const targetSlot = getSlotAtPoint(e.clientX, e.clientY);
    const overRoster = isOverRoster(e.clientX, e.clientY);

    if (targetSlot) {
      const targetIdx = parseInt(targetSlot.dataset.slot);
      const existingPid = assignments[targetIdx];

      if (fromSlot !== null) {
        // Swap: slot → slot
        delete assignments[fromSlot];
        if (existingPid) assignments[fromSlot] = existingPid;
      } else {
        // Roster → slot
        if (Object.keys(assignments).length >= 11 && !existingPid) { cleanup(); return; }
        Object.keys(assignments).forEach(k => { if (assignments[k] === pid) delete assignments[k]; });
      }
      assignments[targetIdx] = pid;
      cleanup();
      refresh();
    } else if (overRoster && fromSlot !== null) {
      // Slot → roster (rimuovi)
      delete assignments[fromSlot];
      cleanup();
      refresh();
    } else {
      cleanup();
    }
  }

  // Roster items: pointerdown to start drag
  document.querySelectorAll('.roster-item:not(.placed)').forEach(item => {
    item.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      startDrag(e, item.dataset.pid, null, item.dataset.name, item.dataset.num);
    });
  });

  // Occupied slots: pointerdown to start drag/move
  document.querySelectorAll('.pitch-slot.occupied').forEach(slot => {
    slot.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      const idx = parseInt(slot.dataset.slot);
      const pid = assignments[idx];
      const player = allPlayers.find(p => p.id === pid);
      const num = player ? (player.numero_maglia || player.numeroMaglia || '?') : '?';
      const name = player ? player.cognome : '';
      startDrag(e, pid, idx, name, num);
    });
  });

  // Global move/up listeners (on modal to capture all)
  const modal = document.getElementById('currentModal');
  if (modal) {
    modal.addEventListener('pointermove', onMove);
    modal.addEventListener('pointerup', onEnd);
    modal.addEventListener('pointercancel', () => cleanup());
  }

  // FREE MOVE: long-press (500ms) on occupied slot to reposition freely
  setupFreeMove(assignments, customPositions, refresh);
}

/**
 * Free move: long-press (500ms) su slot occupato per riposizionare liberamente sul campo
 */
function setupFreeMove(assignments, customPositions, refresh) {
  const pitch = document.getElementById('pitchField');
  if (!pitch) return;

  document.querySelectorAll('.pitch-slot.occupied').forEach(slot => {
    let longPressTimer = null;
    let moving = false;

    slot.addEventListener('pointerdown', (e) => {
      if (moving) return;
      longPressTimer = setTimeout(() => {
        moving = true;
        slot.classList.add('free-move');
        slot.setPointerCapture(e.pointerId);
      }, 500);
    });

    slot.addEventListener('pointermove', (e) => {
      if (!moving) { clearTimeout(longPressTimer); longPressTimer = null; return; }
      e.preventDefault();
      e.stopPropagation();
      const rect = pitch.getBoundingClientRect();
      const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
      slot.style.left = x + '%';
      slot.style.top = y + '%';
    });

    slot.addEventListener('pointerup', (e) => {
      clearTimeout(longPressTimer);
      if (!moving) return;
      moving = false;
      slot.classList.remove('free-move');
      slot.releasePointerCapture(e.pointerId);
      const idx = parseInt(slot.dataset.slot);
      const rect = pitch.getBoundingClientRect();
      const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
      customPositions[idx] = { x, y };
    });

    slot.addEventListener('pointercancel', () => { clearTimeout(longPressTimer); moving = false; slot.classList.remove('free-move'); });
  });
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
