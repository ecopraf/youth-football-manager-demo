import { apiFetch } from '../../services/api';
import { formatDateShort } from '../../utils/formatters';
import { showLoading, hideLoading } from '../../utils/ui';

export async function openDistinta(mid, staffOverrides) {
  const content = '<div id="distintaInner"><div class="loading"><div class="spinner"></div>Caricamento distinta...</div></div>';
  const footer = '<button class="btn btn-secondary" id="modalCancel">Chiudi</button><button class="btn btn-secondary" id="staffBtn">👥 Staff</button><button class="btn btn-primary" id="printBtn">🖨️ Stampa</button>';
  const modal = createModal('📄 Distinta Gara', content, footer, '980px');

  let curStaff = null;
  try {
    const data = await apiFetch('/partite/' + mid + '/distinta');
    curStaff = staffOverrides || data.staff || {};
    renderDistinta(data, curStaff);
  } catch (e) {
    document.getElementById('distintaInner').innerHTML = '<div class="error-box">Formazione non disponibile</div>';
  }

  document.getElementById('printBtn').addEventListener('click', () => {
    const el = document.getElementById('distintaInner');
    if (el) {
      const w = window.open('', '_blank', 'width=1000,height=800');
      w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Distinta</title><style>@page{margin:6mm;size:A4 portrait}body{font-family:Courier New,monospace;font-size:9px;margin:0;padding:6mm}.center{text-align:center}.distinta-table{width:100%;border-collapse:collapse;margin:8px 0}.distinta-table th,.distinta-table td{border:1px solid #333;padding:2px 4px;text-align:center;font-size:8px}th{background:#f0f0f0}.capitano{background:#FFF9C4}.vice{background:#E8F5E9}.staff-section td{font-size:7px}.firme{margin-top:12px;display:flex;justify-content:space-between;font-size:9px}.note-finali{font-size:6px;margin-top:4px;text-align:center}@media print{body{padding:0}}</style></head><body>' + el.innerHTML + '<script>window.onload=function(){window.print();setTimeout(function(){window.close()},500)}<\/script></body></html>');
      w.document.close();
    }
  });

  document.getElementById('staffBtn').addEventListener('click', () => openStaffForm(mid, curStaff));
}

function renderDistinta(d, staff) {
  const c = document.getElementById('distintaInner');
  if (!c) return;
  const t = (d.formazione || []).sort((a, b) => (a.cognome || '').localeCompare(b.cognome || ''));
  const dt = new Date(d.partita.dataOra);
  const s = staff || {};
  const righe = [];
  for (let i = 0; i < 24; i++) {
    if (i < t.length) {
      const f = t[i];
      righe.push('<tr class="' + (f.capitano ? 'capitano' : f.viceCapitano ? 'vice' : '') + '"><td style="border:none;font-size:7px;">' + (i + 1) + '</td><td>' + (f.numeroMaglia || '-') + '</td><td>' + (f.dataNascita ? formatDateShort(f.dataNascita) : '-') + '</td><td style="text-align:left;">' + (f.cognome || '').toUpperCase() + ' ' + (f.nome || '') + '</td><td>' + (f.capitano ? 'CAP' : f.viceCapitano ? 'V.CAP' : '') + '</td><td>' + (f.matricolaFigc || '-') + '</td><td>' + (f.tipoDocumento || '-') + '</td><td>' + (f.numeroDocumento || '-') + '</td><td>' + (f.rilasciatoDa || '-') + '</td><td></td><td></td></tr>');
    } else {
      righe.push('<tr><td style="border:none;font-size:7px;">' + (i + 1) + '</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>');
    }
  }
  c.innerHTML = '<div class="center"><strong>F.I.G.C. - LEGA NAZIONALE DILETTANTI</strong><br><strong>' + d.societa + '</strong></div><div style="border:1px solid #333;padding:8px;margin:8px 0;text-align:left;"><strong>Distinta dei giuocatori partecipanti alla gara</strong><br><strong>' + d.societa + ' - ' + d.partita.avversario + '</strong><br>del campionato <strong>' + d.partita.competizione + '</strong><br>da disputare il <strong>' + dt.toLocaleDateString('it-IT') + ' alle ore ' + dt.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) + (d.partita.giornata ? ' (Giornata ' + d.partita.giornata + ')' : '') + '</strong><br>presso <strong>' + (d.partita.luogo === 'Casa' ? 'Campo di Casa' : 'Campo Trasferta') + '</strong></div><table class="distinta-table"><thead><tr><th></th><th>N.</th><th>Data Nascita</th><th>Cognome e Nome</th><th>Cap/V.Cap</th><th>Matricola FIGC</th><th colspan="3">Documento Identificazione</th><th>Esp.</th><th>Amm.</th></tr><tr><th></th><th></th><th></th><th></th><th></th><th></th><th>Tipo</th><th>Numero</th><th>Rilasciato</th><th></th><th></th></tr></thead><tbody>' + righe.join('') + '<tr><td></td><td colspan="2" style="text-align:left;font-weight:bold;">ASSISTENTE DELL\'ARBITRO</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr></tbody></table><table class="distinta-table staff-section"><tbody><tr><td colspan="11" style="text-align:left;font-weight:bold;background:#f0f0f0;">STAFF</td></tr>' + buildStaffRows(s) + '<tr><td colspan="11"> </td></tr><tr><td colspan="11">NOTE .......................................................................................</td></tr></tbody></table><div style="text-align:left;font-size:6px;margin-top:4px;">*obbligatorio per gare nazionali, facoltativo per gare regionali e SGS<br>I giocatori sopra elencati possono essere ammessi solo se muniti di tessere valide per l\'annata in corso.</div><div style="font-size:7px;margin-top:4px;text-align:justify;">Il sottoscritto Dirigente dichiara che i giocatori sopraindicati sono regolarmente tesserati e partecipano alla gara sotto la responsabilità della Società di appartenenza.</div><div class="firme"><div>L\'ARBITRO<br><br>___________________</div><div>IL DIRIGENTE ACCOMPAGNATORE UFFICIALE<br><br>___________________</div></div>';
}

function buildStaffRows(s) {
  let rows = '';
  const ruoli = [
    { label: 'Dirigente accompagnatore', nome: s.dirigente, matr: s.matricola_dirigente, tess: s.tessera_lnd_dirigente, tipoTess: 'Tessera LND N°' },
    { label: 'Dirigente addetto ufficiali di gara', nome: s.dirigente2, matr: s.matricola_dirigente2, tess: s.tessera_lnd_dirigente2, tipoTess: 'Tessera LND N°' },
    { label: 'Medico sociale', nome: s.medico, matr: s.matricola_medico, tess: s.tessera_lnd_medico, tipoTess: 'Tessera LND N°' },
    { label: 'Allenatore', nome: s.allenatore, matr: s.matricola_allenatore, tess: s.tessera_figc_allenatore, tipoTess: 'Tessera FIGC N°' },
    { label: 'Allenatore in seconda', nome: s.allenatore2, matr: s.matricola_allenatore2, tess: s.tessera_figc_allenatore2, tipoTess: 'Tessera FIGC N°' },
    { label: 'Massaggiatore', nome: s.massaggiatore, matr: s.matricola_massaggiatore, tess: s.tessera_lnd_massaggiatore, tipoTess: 'Tessera LND N°' },
    { label: 'Preparatore Atletico', nome: s.preparatore_atletico, matr: s.matricola_preparatore, tess: s.tessera_lnd_preparatore, tipoTess: 'Tessera LND N°' },
    { label: 'Preparatore Portieri', nome: s.allenatore_portieri, matr: s.matricola_prep_portieri, tess: s.tessera_lnd_prep_portieri, tipoTess: 'Tessera LND N°' }
  ];
  ruoli.forEach(r => {
    rows += '<tr><td colspan="7" style="text-align:left;">' + r.label + ': ' + (r.nome || '') + '</td><td colspan="4" style="text-align:right;">' +
      (r.matr ? 'Matr. N° ' + r.matr : '') + (r.tess ? (r.matr ? ' - ' : '') + r.tipoTess + ' ' + r.tess : '') + '</td></tr>';
  });
  return rows;
}

function openStaffForm(mid, cur) {
  const s = cur || {};
  const content = '<div class="form-grid">' +
    ['allenatore','dirigente','dirigente2','medico','allenatore2','massaggiatore','preparatore_atletico','allenatore_portieri'].map(r => {
      const labels = { allenatore: 'Allenatore', dirigente: 'Dirigente Ufficiale', dirigente2: '2° Dirigente', medico: 'Medico Sociale', allenatore2: 'All. in Seconda', massaggiatore: 'Massaggiatore', preparatore_atletico: 'Prep. Atletico', allenatore_portieri: 'Prep. Portieri' };
      return '<div class="form-group"><label>' + labels[r] + '</label><input id="sf' + r + '" value="' + (s[r] || '') + '"></div>' +
        '<div class="form-group"><label>Matr. ' + labels[r] + '</label><input id="sfMatr' + r + '" value="' + (s['matricola_' + r] || '') + '"></div>' +
        '<div class="form-group"><label>Tessera ' + labels[r] + '</label><input id="sfTess' + r + '" value="' + (s['tessera_' + (r === 'allenatore' || r === 'allenatore2' ? 'figc_' : 'lnd_') + r] || '') + '"></div>';
    }).join('') + '</div>';
  const footer = '<button class="btn btn-secondary" id="modalCancel">Annulla</button><button class="btn btn-primary" id="applyBtn">Applica</button>';
  const modal = createModal('👥 Staff Distinta', content, footer, '700px');
  document.getElementById('applyBtn').addEventListener('click', () => {
    const ns = {};
    ['allenatore','dirigente','dirigente2','medico','allenatore2','massaggiatore','preparatore_atletico','allenatore_portieri'].forEach(r => {
      ns[r] = document.getElementById('sf' + r)?.value || '';
      ns['matricola_' + r] = document.getElementById('sfMatr' + r)?.value || '';
      const prefix = (r === 'allenatore' || r === 'allenatore2') ? 'tessera_figc_' : 'tessera_lnd_';
      ns[prefix + r] = document.getElementById('sfTess' + r)?.value || '';
    });
    modal.close();
    openDistinta(mid, ns);
  });
}

function createModal(title, content, footer, maxW = '600px') {
  const existing = document.getElementById('currentModal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.className = 'modal-overlay'; modal.id = 'currentModal';
  modal.innerHTML = '<div class="modal-content" style="max-width:' + maxW + ';"><div class="modal-header"><h2>' + title + '</h2><button class="modal-close-btn" id="modalCloseX">×</button></div><div class="modal-body">' + content + '</div>' + (footer ? '<div class="modal-footer">' + footer + '</div>' : '') + '</div>';
  document.body.appendChild(modal);
  const close = () => { const m = document.getElementById('currentModal'); if (m) m.remove(); };
  document.getElementById('modalCloseX').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  const cancelBtn = document.getElementById('modalCancel');
  if (cancelBtn) cancelBtn.addEventListener('click', close);
  return { modal, closeModal: close, close };
}
