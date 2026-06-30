/**
 * trainingSession.js - Dettaglio seduta di allenamento
 * Mostra/modifica: presenze, programma (obiettivo, esercizi, materiale, note)
 */

import { getAvatarColor } from '../../utils/formatters';
import { showLoading, hideLoading } from '../../utils/ui';
import demoPersistence from '../demo/DemoPersistence';

const TIPI_SEDUTA = ['Tattico', 'Tecnico', 'Atletico', 'Partita a tema', 'Possesso palla', 'Difensivo', 'Misto'];

const MATERIALE_OPTIONS = [
  { id: 'coni', label: '🔶 Coni', icon: '🔶' },
  { id: 'paletti', label: '🔷 Paletti', icon: '🔷' },
  { id: 'over', label: '🟠 Over', icon: '🟠' },
  { id: 'casacche', label: '🟡 Casacche', icon: '🟡' },
  { id: 'porte_piccole', label: '⬜ Porte piccole', icon: '⬜' },
  { id: 'scala_agilita', label: '🪜 Scala agilità', icon: '🪜' },
  { id: 'palloni', label: '⚽ Palloni', icon: '⚽' },
  { id: 'elastici', label: '🟣 Elastici', icon: '🟣' }
];

const MOTIVI_ASSENZA = [
  { value: '', label: 'Nessun motivo' },
  { value: 'Impegni Scolastici', label: '📚 Impegni Scolastici' },
  { value: 'Motivi Familiari', label: '👨‍👩‍👧 Motivi Familiari' },
  { value: 'Infortunio', label: '🏥 Infortunio' },
  { value: 'Malattia', label: '🤒 Malattia' }
];

/**
 * Renderizza il dettaglio di una seduta di allenamento
 * @param {string} date - Data selezionata (YYYY-MM-DD)
 * @param {object} trainingData - Dati globali training
 * @param {Function} onSave - Callback dopo salvataggio
 * @returns {string} HTML del dettaglio
 */
export function renderSession(date, trainingData, onSave) {
  if (!date) {
    return `<div style="text-align:center;padding:40px;color:#6c757d;">
      <p style="font-size:16px;">📅 Seleziona un giorno dal calendario</p>
      <p style="font-size:13px;">Clicca su un giorno con il pallino verde per vedere il dettaglio</p>
    </div>`;
  }

  const { allenamenti, giocatori, presenze } = trainingData;
  const allenamento = (allenamenti || []).find(a => a.data === date);
  const giorni = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  const d = new Date(date);
  const dayLabel = giorni[d.getDay()] + ' ' + d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();

  // Programma della seduta
  const programma = allenamento?.programma || {};
  const tipo = allenamento?.tipo || programma.tipo || '';
  const durata = allenamento?.durata || programma.durata || 90;
  const obiettivo = programma.obiettivo || '';
  const esercizi = programma.esercizi || '';
  const materialeUsato = programma.materiale || [];
  const noteAllenamento = allenamento?.note || programma.note || '';

  // Presenze
  const motivi = allenamento?.motivi_assenza || {};
  const sorted = [...(giocatori || [])].sort((a, b) => a.cognome.localeCompare(b.cognome));

  const presentiCount = allenamento?.presenze?.length || 0;
  const assentiCount = allenamento?.assenti?.length || 0;
  const hasData = presentiCount > 0 || assentiCount > 0;

  let html = `<style>
    .session-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:8px; }
    .session-title { font-size:15px; font-weight:600; color:#1a1a2e; }
    .session-badge { font-size:11px; padding:4px 10px; border-radius:12px; font-weight:600; }
    .session-badge.registered { background:#d1fae5; color:#065f46; }
    .session-badge.new { background:#fef3c7; color:#92400e; }
    .program-section { background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px; margin-bottom:16px; }
    .program-section h4 { margin:0 0 12px 0; font-size:14px; color:#334155; display:flex; align-items:center; gap:8px; }
    .program-field { margin-bottom:12px; }
    .program-field label { display:block; font-size:12px; font-weight:600; color:#64748b; margin-bottom:4px; }
    .program-field input, .program-field select, .program-field textarea {
      width:100%; padding:8px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; font-family:inherit;
    }
    .program-field textarea { min-height:60px; resize:vertical; }
    .program-field input:focus, .program-field select:focus, .program-field textarea:focus {
      outline:none; border-color:#667eea; box-shadow:0 0 0 3px rgba(102,126,234,0.1);
    }
    .materiale-grid { display:flex; flex-wrap:wrap; gap:8px; }
    .mat-chip { padding:6px 12px; border-radius:20px; font-size:12px; cursor:pointer; border:1px solid #e2e8f0; background:white; transition:all 0.15s; }
    .mat-chip:hover { border-color:#667eea; }
    .mat-chip.active { background:#667eea; color:white; border-color:#667eea; }
    .presenze-summary { display:flex; gap:16px; margin-bottom:12px; font-size:13px; }
    .presenze-summary span { display:flex; align-items:center; gap:4px; }
    .session-actions { display:flex; gap:8px; margin-top:16px; flex-wrap:wrap; }
  </style>`;

  html += `<div class="session-header">
    <div>
      <div class="session-title">📋 ${dayLabel}</div>
    </div>
    <span class="session-badge ${hasData ? 'registered' : 'new'}">${hasData ? '✅ Registrata' : '🆕 Nuova seduta'}</span>
  </div>`;

  // === PROGRAMMA ALLENAMENTO ===
  html += `<div class="program-section">
    <h4>🎯 Programma Allenamento <button class="btn btn-secondary btn-small" id="btnApplyTemplate" style="margin-left:auto;font-size:11px;">📋 Usa Template</button></h4>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div class="program-field">
        <label>Tipo seduta</label>
        <select id="sessionTipo">
          <option value="">-- Seleziona --</option>
          ${TIPI_SEDUTA.map(t => `<option value="${t}" ${tipo === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
      </div>
      <div class="program-field">
        <label>Durata (min)</label>
        <input type="number" id="sessionDurata" value="${durata}" min="30" max="180" step="5">
      </div>
    </div>
    <div class="program-field">
      <label>Obiettivo</label>
      <input type="text" id="sessionObiettivo" value="${obiettivo}" placeholder="Es. Sviluppo gioco sulle fasce">
    </div>
    <div class="program-field">
      <label>Esercizi</label>
      <textarea id="sessionEsercizi" placeholder="Es. Rondo 4v2, Possesso 6v6, Partitella finale...">${esercizi}</textarea>
    </div>
    <div class="program-field">
      <label>Materiale</label>
      <div class="materiale-grid" id="materialeGrid">
        ${MATERIALE_OPTIONS.map(m => `<span class="mat-chip ${materialeUsato.includes(m.id) ? 'active' : ''}" data-mat="${m.id}">${m.label}</span>`).join('')}
      </div>
    </div>
    <div class="program-field">
      <label>Note</label>
      <textarea id="sessionNote" placeholder="Note aggiuntive...">${noteAllenamento}</textarea>
    </div>
  </div>`;

  // === PRESENZE ===
  html += `<div>
    <h4 style="margin:0 0 12px 0;font-size:14px;color:#334155;display:flex;align-items:center;gap:8px;">
      👥 Presenze
      <span style="font-size:12px;color:#6c757d;font-weight:normal;">(${presentiCount}/${sorted.length} presenti)</span>
    </h4>
    <div class="presenze-summary">
      <span style="color:#22c55e;">✅ ${presentiCount} presenti</span>
      <span style="color:#ef4444;">❌ ${assentiCount} assenti</span>
    </div>
    <p style="margin-bottom:8px;font-size:12px;color:#6c757d;">Segna <span style="color:#E74C3C;font-weight:600;">ASSENTE</span>:</p>
    <div id="sessionPresenzeList">`;

  sorted.forEach(g => {
    const isAssente = allenamento?.assenti?.includes(g.id) || false;
    const motivoSelezionato = motivi[g.id] || '';

    html += `<div class="convocation-item" style="flex-wrap:wrap;gap:8px;">
      <div style="display:flex;align-items:center;gap:8px;min-width:200px;">
        <input type="checkbox" ${isAssente ? 'checked' : ''} data-pid="${g.id}" class="session-pres-check" style="width:20px;height:20px;cursor:pointer;accent-color:#E74C3C;">
        <div class="player-avatar" style="width:28px;height:28px;font-size:11px;background:${getAvatarColor(g.nome)};">${g.nome[0]}${g.cognome[0]}</div>
        <span style="font-size:13px;">${g.nome} ${g.cognome}</span>
      </div>
      <div style="display:flex;align-items:center;gap:4px;">
        <select data-pid="${g.id}" class="session-motivo-select" style="padding:4px 8px;border-radius:6px;border:1px solid #e2e8f0;font-size:11px;${isAssente ? '' : 'opacity:0.4;'}" ${isAssente ? '' : 'disabled'}>
          ${MOTIVI_ASSENZA.map(m => `<option value="${m.value}" ${m.value === motivoSelezionato ? 'selected' : ''}>${m.label}</option>`).join('')}
        </select>
      </div>
    </div>`;
  });

  html += `</div></div>`;

  // === AZIONI ===
  html += `<div class="session-actions">
    <button class="btn btn-primary" id="btnSaveSession">💾 Salva Seduta</button>
    <button class="btn btn-secondary" id="btnSaveTemplate" style="font-size:12px;">📋 Salva come Template</button>
  </div>`;

  return html;
}

/**
 * Attacca i listener per il dettaglio seduta
 */
export function attachSessionListeners(date, trainingData, onSave) {
  // Toggle materiale chips
  document.querySelectorAll('#materialeGrid .mat-chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('active'));
  });

  // Toggle motivo assenza
  document.querySelectorAll('.session-pres-check').forEach(cb => {
    cb.addEventListener('change', () => {
      const pid = cb.dataset.pid;
      const select = document.querySelector(`.session-motivo-select[data-pid="${pid}"]`);
      if (select) {
        select.disabled = !cb.checked;
        select.style.opacity = cb.checked ? '1' : '0.4';
      }
    });
  });

  // Salva seduta
  document.getElementById('btnSaveSession')?.addEventListener('click', () => {
    saveSession(date, trainingData, onSave);
  });

  // Salva come template
  document.getElementById('btnSaveTemplate')?.addEventListener('click', () => {
    saveAsTemplate();
  });

  // Applica template
  document.getElementById('btnApplyTemplate')?.addEventListener('click', () => {
    openTemplateSelector();
  });
}

/**
 * Salva la seduta (presenze + programma)
 */
function saveSession(date, trainingData, onSave) {
  const presenti = [];
  const assenti = [];
  const motiviAssenza = {};

  document.querySelectorAll('.session-pres-check').forEach(cb => {
    if (cb.checked) {
      assenti.push(cb.dataset.pid);
      const select = document.querySelector(`.session-motivo-select[data-pid="${cb.dataset.pid}"]`);
      if (select && select.value) motiviAssenza[cb.dataset.pid] = select.value;
    } else {
      presenti.push(cb.dataset.pid);
    }
  });

  // Raccogli programma
  const programma = {
    tipo: document.getElementById('sessionTipo')?.value || '',
    durata: parseInt(document.getElementById('sessionDurata')?.value) || 90,
    obiettivo: document.getElementById('sessionObiettivo')?.value || '',
    esercizi: document.getElementById('sessionEsercizi')?.value || '',
    materiale: Array.from(document.querySelectorAll('#materialeGrid .mat-chip.active')).map(c => c.dataset.mat),
    note: document.getElementById('sessionNote')?.value || ''
  };

  showLoading();

  // Trova o crea allenamento
  let allenamento = trainingData.allenamenti?.find(a => a.data === date);
  if (!allenamento) {
    allenamento = {
      id: `tr_${Date.now()}`,
      data: date,
      tipo: programma.tipo,
      durata: programma.durata,
      presenze: presenti,
      assenti: assenti,
      motivi_assenza: motiviAssenza,
      programma: programma,
      note: programma.note
    };
    demoPersistence.addTraining(allenamento);
  } else {
    allenamento.presenze = presenti;
    allenamento.assenti = assenti;
    allenamento.motivi_assenza = motiviAssenza;
    allenamento.tipo = programma.tipo;
    allenamento.durata = programma.durata;
    allenamento.programma = programma;
    allenamento.note = programma.note;
    demoPersistence.saveTrainingPresence(allenamento.id, { presenti, assenti, motivi: motiviAssenza });
    // Salva programma separatamente
    demoPersistence.saveTrainingProgram(allenamento.id, programma);
  }

  hideLoading();
  alert('✅ Seduta salvata!');
  if (onSave) onSave();
}

/**
 * Salva il programma corrente come template
 */
function saveAsTemplate() {
  const nome = prompt('Nome del template:');
  if (!nome) return;

  const programma = {
    tipo: document.getElementById('sessionTipo')?.value || '',
    durata: parseInt(document.getElementById('sessionDurata')?.value) || 90,
    obiettivo: document.getElementById('sessionObiettivo')?.value || '',
    esercizi: document.getElementById('sessionEsercizi')?.value || '',
    materiale: Array.from(document.querySelectorAll('#materialeGrid .mat-chip.active')).map(c => c.dataset.mat),
    note: document.getElementById('sessionNote')?.value || ''
  };

  demoPersistence.saveTrainingTemplate(nome, programma);
  alert('✅ Template "' + nome + '" salvato!');
}

/**
 * Apre il selettore template
 */
function openTemplateSelector() {
  const templates = demoPersistence.getTrainingTemplates();
  if (templates.length === 0) {
    alert('Nessun template salvato.\nSalva prima una seduta come template usando il pulsante "📋 Salva come Template".');
    return;
  }

  const choice = prompt(
    'Template disponibili:\n' +
    templates.map((t, i) => `${i + 1}. ${t.nome} (${t.programma.tipo})`).join('\n') +
    '\n\nInserisci il numero del template da applicare:'
  );

  if (!choice) return;
  const idx = parseInt(choice) - 1;
  if (idx < 0 || idx >= templates.length) { alert('Scelta non valida'); return; }

  const template = templates[idx];
  applyTemplate(template.programma);
}

/**
 * Applica un template ai campi del form
 */
function applyTemplate(programma) {
  if (programma.tipo) {
    const sel = document.getElementById('sessionTipo');
    if (sel) sel.value = programma.tipo;
  }
  if (programma.durata) {
    const inp = document.getElementById('sessionDurata');
    if (inp) inp.value = programma.durata;
  }
  if (programma.obiettivo) {
    const inp = document.getElementById('sessionObiettivo');
    if (inp) inp.value = programma.obiettivo;
  }
  if (programma.esercizi) {
    const ta = document.getElementById('sessionEsercizi');
    if (ta) ta.value = programma.esercizi;
  }
  if (programma.note) {
    const ta = document.getElementById('sessionNote');
    if (ta) ta.value = programma.note;
  }
  // Materiale
  document.querySelectorAll('#materialeGrid .mat-chip').forEach(chip => {
    chip.classList.toggle('active', (programma.materiale || []).includes(chip.dataset.mat));
  });
}

export { TIPI_SEDUTA, MATERIALE_OPTIONS };
