import { apiFetch } from '../../services/api';
import { formatDate } from '../../utils/formatters';

export async function openMatchDetail(mid) {
  const content = '<div id="detailInner"><div class="loading"><div class="spinner"></div>Caricamento...</div></div>';
  const footer = '<button class="btn btn-secondary" id="modalCancel">Chiudi</button>';
  const modal = createModal('📋 Dettaglio Partita', content, footer, '900px');

  try {
    const d = await apiFetch('/partite/' + mid + '/dettaglio');
    const p = d.partita;
    const eventi = d.eventi || [];
    const golCasa = d.golCasa || 0;
    const golOspiti = d.golOspiti || 0;
    const ammonizioni = eventi.filter(e => e.tipo === 'YELLOW').length;
    const espulsioni = eventi.filter(e => e.tipo === 'RED').length;
    
    const resultBg = golCasa > golOspiti ? 'linear-gradient(135deg, #27AE60, #2ecc71)' : golCasa === golOspiti ? 'linear-gradient(135deg, #F39C12, #f1c40f)' : 'linear-gradient(135deg, #E74C3C, #c0392b)';
    const resultLabel = golCasa > golOspiti ? 'Vittoria!' : golCasa === golOspiti ? 'Pareggio' : 'Sconfitta';
    const resultIcon = golCasa > golOspiti ? '✅' : golCasa === golOspiti ? '🤝' : '❌';

    let html = '<style>.match-header{background:' + resultBg + ';color:white;padding:16px;border-radius:10px;text-align:center;margin-bottom:16px;}.match-header h2{margin:0 0 6px 0;font-size:18px;}.match-header .score{font-size:34px;font-weight:bold;margin:6px 0;}.match-header .meta{font-size:11px;opacity:0.9;}.events-table-wrapper{overflow-x:auto;border-radius:8px;border:1px solid var(--border);}.events-table{width:100%;border-collapse:collapse;min-width:480px;}.events-table th{background:#667eea;color:white;padding:8px 6px;text-align:left;font-size:11px;font-weight:600;white-space:nowrap;}.events-table td{padding:7px 6px;border-bottom:1px solid #f0f0f0;font-size:12px;}.events-table tr:hover td{background:#f8f9fa;}.event-type{display:inline-block;padding:2px 5px;border-radius:4px;font-size:10px;font-weight:600;}.event-goal{background:#d4edda;color:#155724;}.event-assist{background:#cce5ff;color:#004085;}.event-yellow{background:#fff3cd;color:#856404;}.event-red{background:#f8d7da;color:#721c24;}</style>';
    html += '<div class="match-header"><h2>' + window.YFM.getSocietaName() + ' vs ' + p.avversario + '</h2><div class="score">' + golCasa + ' - ' + golOspiti + '</div><div>' + resultIcon + ' ' + resultLabel + '</div><div class="meta">' + formatDate(p.data_ora) + ' · ' + p.competizione + (p.giornata ? ' · G.' + p.giornata : '') + ' · ' + p.luogo + '</div></div>';
    html += '<div style="display:flex;gap:8px;margin-bottom:16px;justify-content:center;"><div style="background:#d4edda;padding:6px 12px;border-radius:8px;text-align:center;flex:1;max-width:80px;"><div style="font-size:16px;font-weight:bold;color:#155724;">' + golCasa + '</div><div style="font-size:10px;color:#155724;">Gol</div></div><div style="background:#fff3cd;padding:6px 12px;border-radius:8px;text-align:center;flex:1;max-width:80px;"><div style="font-size:16px;font-weight:bold;color:#856404;">' + ammonizioni + '</div><div style="font-size:10px;color:#856404;">Amm.</div></div><div style="background:#f8d7da;padding:6px 12px;border-radius:8px;text-align:center;flex:1;max-width:80px;"><div style="font-size:16px;font-weight:bold;color:#721c24;">' + espulsioni + '</div><div style="font-size:10px;color:#721c24;">Esp.</div></div></div>';
    html += '<h4 style="margin:0 0 8px 0;font-size:12px;color:#333;">📋 Cronologia Eventi</h4><div class="events-table-wrapper"><table class="events-table"><thead><tr><th style="width:40px;text-align:center;">Min.</th><th style="width:65px;">Tipo</th><th>Giocatore</th><th>Dettaglio</th></tr></thead><tbody>';

    if (eventi.length === 0) {
      html += '<tr><td colspan="4" style="text-align:center;color:var(--gray);padding:20px;">Nessun evento registrato</td></tr>';
    } else {
      eventi.forEach(e => {
        const icona = e.tipo === 'GOAL' ? '⚽' : e.tipo === 'ASSIST' ? '🅰️' : e.tipo === 'YELLOW' ? '🟨' : '🟥';
        const typeClass = e.tipo === 'GOAL' ? 'event-goal' : e.tipo === 'ASSIST' ? 'event-assist' : e.tipo === 'YELLOW' ? 'event-yellow' : 'event-red';
        const typeLabel = e.tipo === 'GOAL' ? 'Gol' : e.tipo === 'ASSIST' ? 'Assist' : e.tipo === 'YELLOW' ? 'Amm.' : 'Esp.';
        html += '<tr><td style="text-align:center;font-weight:bold;color:#667eea;">' + e.minuto + '\'</td><td><span style="font-size:13px;">' + icona + '</span> <span class="event-type ' + typeClass + '">' + typeLabel + '</span></td><td style="font-weight:500;">' + e.principale + '</td><td style="color:#888;">' + (e.secondario ? 'Assist: ' + e.secondario : '-') + '</td></tr>';
      });
    }
    html += '</tbody></table></div>';

    if (p.note_avversario) {
      html += '<div style="margin-top:14px;padding:10px;background:#fff9e6;border-radius:8px;border-left:4px solid #F39C12;"><h4 style="margin:0 0 4px 0;font-size:11px;">📝 Note</h4><p style="margin:0;color:#666;font-size:11px;white-space:pre-wrap;">' + p.note_avversario + '</p></div>';
    }

    document.getElementById('detailInner').innerHTML = html;
  } catch (err) {
    document.getElementById('detailInner').innerHTML = '<div class="error-box">Errore nel caricamento del dettaglio.</div>';
  }
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
