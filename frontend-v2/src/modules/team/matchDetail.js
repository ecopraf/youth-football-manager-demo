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

    let html = '<style>';
    html += '.match-header{background:' + resultBg + ';color:white;padding:16px;border-radius:10px;text-align:center;margin-bottom:16px;}';
    html += '.match-header h2{margin:0 0 6px 0;font-size:18px;}';
    html += '.match-header .score{font-size:34px;font-weight:bold;margin:6px 0;}';
    html += '.match-header .meta{font-size:11px;opacity:0.9;}';
    html += '.match-stats{display:flex;gap:8px;margin-bottom:16px;justify-content:center;}';
    html += '.match-stat{background:#f8f9fa;padding:8px 12px;border-radius:8px;text-align:center;min-width:60px;}';
    html += '.match-stat-val{font-size:18px;font-weight:bold;color:#333;}';
    html += '.match-stat-label{font-size:10px;color:#666;}';
    html += '.event-goal{background:#27AE60;}.event-assist{background:#3498db;}.event-yellow{background:#F39C12;}.event-red{background:#E74C3C;}';
    html += '.timeline-container{max-height:400px;overflow-y:auto;padding:0 8px;position:relative;}';
    html += '.timeline{position:relative;padding:10px 0 20px 30px;}';
    html += '.timeline::before{content:"";position:absolute;left:8px;top:0;bottom:0;width:3px;background:linear-gradient(to bottom,#667eea,#764ba2);border-radius:2px;}';
    html += '.timeline-item{position:relative;margin-bottom:12px;animation:fadeSlideIn 0.4s ease-out both;}';
    html += '.timeline-item:nth-child(1){animation-delay:0.1s}.timeline-item:nth-child(2){animation-delay:0.2s}.timeline-item:nth-child(3){animation-delay:0.3s}.timeline-item:nth-child(4){animation-delay:0.4s}.timeline-item:nth-child(5){animation-delay:0.5s}';
    html += '@keyframes fadeSlideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}';
    html += '.timeline-dot{position:absolute;left:-28px;top:4px;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;box-shadow:0 2px 4px rgba(0,0,0,0.2);}';
    html += '.timeline-content{background:#f8f9fa;padding:10px 12px;border-radius:8px;margin-left:8px;border-left:3px solid #667eea;}';
    html += '.timeline-content:hover{background:#f0f4ff;cursor:pointer;transition:background 0.2s;}';
    html += '.timeline-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;}';
    html += '.timeline-minute{background:#667eea;color:white;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:600;}';
    html += '.timeline-player{font-weight:600;font-size:13px;color:#333;}';
    html += '.timeline-detail{font-size:11px;color:#888;margin-top:2px;}';
    html += '.timeline-divider{margin:16px 0;display:flex;align-items:center;gap:10px;}';
    html += '.timeline-divider::before{content:"";flex:1;height:1px;background:#ddd;}';
    html += '.timeline-divider span{font-size:10px;font-weight:600;color:#667eea;padding:2px 10px;background:#f0f4ff;border-radius:10px;}';
    html += '.event-detail-panel{display:none;background:#fff;border-radius:8px;margin:8px 0 0 28px;padding:12px;border:1px solid #e0e0e0;box-shadow:0 2px 8px rgba(0,0,0,0.1);}';
    html += '.event-detail-panel.active{display:block;animation:slideDown 0.3s ease-out;}';
    html += '@keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}';
    html += '.event-detail-row{display:flex;align-items:center;gap:12px;padding:4px 0;}';
    html += '.event-detail-icon{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;}';
    html += '.event-detail-info{flex:1;}.event-detail-info strong{font-size:13px;}.event-detail-info span{font-size:11px;color:#888;}';
    html += '</style>';
    
    html += '<div class="match-header"><h2>' + window.YFM.getSocietaName() + ' vs ' + p.avversario + '</h2><div class="score">' + golCasa + ' - ' + golOspiti + '</div><div>' + resultIcon + ' ' + resultLabel + '</div><div class="meta">' + formatDate(p.data_ora) + ' · ' + p.competizione + (p.giornata ? ' · G.' + p.giornata : '') + ' · ' + p.luogo + '</div></div>';
    html += '<div class="match-stats"><div class="match-stat"><div class="match-stat-val" style="color:#27AE60;">' + golCasa + '</div><div class="match-stat-label">Gol</div></div><div class="match-stat"><div class="match-stat-val" style="color:#F39C12;">' + ammonizioni + '</div><div class="match-stat-label">Amm.</div></div><div class="match-stat"><div class="match-stat-val" style="color:#E74C3C;">' + espulsioni + '</div><div class="match-stat-label">Esp.</div></div></div>';
    
    html += '<h4 style="margin:0 0 8px 0;font-size:12px;color:#333;">📋 Cronologia Eventi</h4>';
    
    if (eventi.length === 0) {
      html += '<p style="text-align:center;color:var(--gray);padding:20px;">Nessun evento registrato</p>';
    } else {
      // Separa eventi per tempo
      const primoTempo = eventi.filter(e => e.minuto <= 45);
      const secondoTempo = eventi.filter(e => e.minuto > 45 && e.minuto <= 90);
      const extraTime = eventi.filter(e => e.minuto > 90);
      
      html += '<div class="timeline-container"><div class="timeline">';
      
      if (primoTempo.length > 0) {
        html += '<div class="timeline-divider"><span>1° Tempo</span></div>';
        primoTempo.forEach(e => {
          const config = getEventConfig(e.tipo);
          html += '<div class="timeline-item" onclick="toggleEventDetail(this)">';
          html += '<div class="timeline-dot" style="background:' + config.bgColor + ';">' + config.icon + '</div>';
          html += '<div class="timeline-content">';
          html += '<div class="timeline-header">';
          html += '<span class="timeline-minute">' + e.minuto + '\'</span>';
          html += '<span class="timeline-player">' + e.principale + '</span>';
          html += '</div>';
          if (e.secondario) {
            html += '<div class="timeline-detail">' + config.label + ': ' + e.secondario + '</div>';
          }
          html += '</div>';
          html += '<div class="event-detail-panel">';
          html += '<div class="event-detail-row">';
          html += '<div class="event-detail-icon" style="background:' + config.bgColor + ';color:white;">' + config.icon + '</div>';
          html += '<div class="event-detail-info"><strong>' + config.fullLabel + '</strong><br><span>Giocatore: ' + e.principale + '</span></div>';
          html += '</div>';
          if (e.secondario) {
            html += '<div class="event-detail-row">';
            html += '<div class="event-detail-icon" style="background:#3498db;color:white;">🅰️</div>';
            html += '<div class="event-detail-info"><strong>Assist</strong><br><span>' + e.secondario + '</span></div>';
            html += '</div>';
          }
          html += '</div>';
          html += '</div>';
        });
      }
      
      if (secondoTempo.length > 0) {
        html += '<div class="timeline-divider"><span>2° Tempo</span></div>';
        secondoTempo.forEach(e => {
          const config = getEventConfig(e.tipo);
          html += '<div class="timeline-item" onclick="toggleEventDetail(this)">';
          html += '<div class="timeline-dot" style="background:' + config.bgColor + ';">' + config.icon + '</div>';
          html += '<div class="timeline-content">';
          html += '<div class="timeline-header">';
          html += '<span class="timeline-minute">' + e.minuto + '\'</span>';
          html += '<span class="timeline-player">' + e.principale + '</span>';
          html += '</div>';
          if (e.secondario) {
            html += '<div class="timeline-detail">' + config.label + ': ' + e.secondario + '</div>';
          }
          html += '</div>';
          html += '<div class="event-detail-panel">';
          html += '<div class="event-detail-row">';
          html += '<div class="event-detail-icon" style="background:' + config.bgColor + ';color:white;">' + config.icon + '</div>';
          html += '<div class="event-detail-info"><strong>' + config.fullLabel + '</strong><br><span>Giocatore: ' + e.principale + '</span></div>';
          html += '</div>';
          if (e.secondario) {
            html += '<div class="event-detail-row">';
            html += '<div class="event-detail-icon" style="background:#3498db;color:white;">🅰️</div>';
            html += '<div class="event-detail-info"><strong>Assist</strong><br><span>' + e.secondario + '</span></div>';
            html += '</div>';
          }
          html += '</div>';
          html += '</div>';
        });
      }
      
      if (extraTime.length > 0) {
        html += '<div class="timeline-divider"><span>Extratime</span></div>';
        extraTime.forEach(e => {
          const config = getEventConfig(e.tipo);
          html += '<div class="timeline-item" onclick="toggleEventDetail(this)">';
          html += '<div class="timeline-dot" style="background:' + config.bgColor + ';">' + config.icon + '</div>';
          html += '<div class="timeline-content">';
          html += '<div class="timeline-header">';
          html += '<span class="timeline-minute">' + e.minuto + '\'</span>';
          html += '<span class="timeline-player">' + e.principale + '</span>';
          html += '</div>';
          if (e.secondario) {
            html += '<div class="timeline-detail">' + config.label + ': ' + e.secondario + '</div>';
          }
          html += '</div>';
          html += '<div class="event-detail-panel">';
          html += '<div class="event-detail-row">';
          html += '<div class="event-detail-icon" style="background:' + config.bgColor + ';color:white;">' + config.icon + '</div>';
          html += '<div class="event-detail-info"><strong>' + config.fullLabel + '</strong><br><span>Giocatore: ' + e.principale + '</span></div>';
          html += '</div>';
          if (e.secondario) {
            html += '<div class="event-detail-row">';
            html += '<div class="event-detail-icon" style="background:#3498db;color:white;">🅰️</div>';
            html += '<div class="event-detail-info"><strong>Assist</strong><br><span>' + e.secondario + '</span></div>';
            html += '</div>';
          }
          html += '</div>';
          html += '</div>';
        });
      }
      
      html += '</div></div>';
    }

    if (p.note_avversario) {
      html += '<div style="margin-top:14px;padding:10px;background:#fff9e6;border-radius:8px;border-left:4px solid #F39C12;"><h4 style="margin:0 0 4px 0;font-size:11px;">📝 Note</h4><p style="margin:0;color:#666;font-size:11px;white-space:pre-wrap;">' + p.note_avversario + '</p></div>';
    }

    html += '<script>function toggleEventDetail(el){var panel=el.querySelector(".event-detail-panel");var isActive=panel.classList.contains("active");document.querySelectorAll(".event-detail-panel.active").forEach(p=>p.classList.remove("active"));if(!isActive){panel.classList.add("active");el.style.background="#f0f4ff";el.style.borderLeft="3px solid #667eea";}else{el.style.background="";el.style.borderLeft="";}}</script>';

    document.getElementById('detailInner').innerHTML = html;
  } catch (err) {
    document.getElementById('detailInner').innerHTML = '<div class="error-box">Errore nel caricamento del dettaglio.</div>';
  }
}

function getEventConfig(tipo) {
  const configs = {
    'GOAL': { icon: '⚽', bgColor: '#27AE60', label: 'Assist', fullLabel: 'Goal' },
    'ASSIST': { icon: '🅰️', bgColor: '#3498db', label: 'Da', fullLabel: 'Assist' },
    'YELLOW': { icon: '🟨', bgColor: '#F39C12', label: 'Cartellino', fullLabel: 'Ammunizione' },
    'RED': { icon: '🟥', bgColor: '#E74C3C', label: 'Cartellino', fullLabel: 'Espulsione' }
  };
  return configs[tipo] || { icon: '●', bgColor: '#999', label: '', fullLabel: tipo };
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
