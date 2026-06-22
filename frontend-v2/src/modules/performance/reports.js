import { apiFetch } from '../../services/api';
import { formatDate, formatDateShort } from '../../utils/formatters';
import { showLoading, hideLoading } from '../../utils/ui';

export default async function loadReports() {
  const c = document.getElementById('pageContent');
  c.innerHTML = `
    <h1 class="page-title">Report ${window.YFM.getSquadraName()}</h1>
    <p class="page-subtitle">Genera e scarica report della stagione</p>
    
    <div class="report-tabs" style="margin-bottom:24px;">
      <button class="report-tab active" data-tab="match">📄 Report Partita</button>
      <button class="report-tab" data-tab="seasonal">📊 Report Stagionale</button>
      <button class="report-tab" data-tab="player">👤 Report Giocatore</button>
    </div>
    
    <!-- Tab Report Partita -->
    <div id="tabMatch" class="report-tab-content">
      <div class="card">
        <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-bottom:16px;">
          <label style="font-weight:500;">Seleziona partita:</label>
          <select id="reportMatchSelect" style="flex:1;min-width:250px;padding:10px;border:1px solid var(--border);border-radius:8px;">
            <option value="">-- Caricamento partite --</option>
          </select>
          <button class="btn btn-primary" id="btnGenerateReport" disabled>Genera Report</button>
          <button class="btn btn-secondary" id="btnPrintReport" style="display:none;">🖨️ Stampa / PDF</button>
        </div>
        <div id="reportContent" style="display:none;"></div>
      </div>
    </div>
    
    <!-- Tab Report Stagionale -->
    <div id="tabSeasonal" class="report-tab-content" style="display:none;">
      <div class="card">
        <div style="display:flex;gap:16px;margin-bottom:16px;">
          <button class="btn btn-primary" id="btnGenerateSeasonalReport">Genera Report Stagionale</button>
          <button class="btn btn-secondary" id="btnPrintSeasonalReport" style="display:none;">🖨️ Stampa / PDF</button>
        </div>
        <div id="seasonalReportContent" style="display:none;"></div>
      </div>
    </div>
    
    <!-- Tab Report Giocatore -->
    <div id="tabPlayer" class="report-tab-content" style="display:none;">
      <div class="card">
        <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-bottom:16px;">
          <label style="font-weight:500;">Seleziona giocatore:</label>
          <select id="playerSelect" style="flex:1;min-width:250px;padding:10px;border:1px solid var(--border);border-radius:8px;">
            <option value="">-- Seleziona giocatore --</option>
          </select>
          <button class="btn btn-primary" id="btnGeneratePlayerReport" disabled>Genera Report</button>
          <button class="btn btn-secondary" id="btnPrintPlayerReport" style="display:none;">🖨️ Stampa / PDF</button>
        </div>
        <div id="playerReportContent" style="display:none;"></div>
      </div>
    </div>
    
    <style>
      .report-tabs { display:flex;gap:8px;border-bottom:2px solid var(--border);padding-bottom:0; }
      .report-tab { padding:12px 24px;background:transparent;border:none;border-bottom:3px solid transparent;cursor:pointer;font-size:14px;font-weight:500;color:var(--gray);transition:all 0.2s; }
      .report-tab:hover { color:var(--primary); }
      .report-tab.active { color:var(--primary);border-bottom-color:var(--primary); }
      .report-tab-content { animation:fadeIn 0.3s; }
      @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    </style>
  `;

  // Carica partite e giocatori
  loadMatchList();
  loadPlayerList();

  // Tab switching
  document.querySelectorAll('.report-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.report-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.report-tab-content').forEach(c => c.style.display = 'none');
      tab.classList.add('active');
      document.getElementById('tab' + tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1)).style.display = 'block';
    });
  });

  // Event listeners
  document.getElementById('btnGenerateReport').addEventListener('click', generateReport);
  document.getElementById('btnPrintReport').addEventListener('click', printReport);
  document.getElementById('btnGenerateSeasonalReport').addEventListener('click', generateSeasonalReport);
  document.getElementById('btnPrintSeasonalReport').addEventListener('click', () => printSeasonalReport());
  document.getElementById('btnGeneratePlayerReport').addEventListener('click', generatePlayerReport);
  document.getElementById('btnPrintPlayerReport').addEventListener('click', () => printPlayerReport());
}

async function loadPlayerList() {
  try {
    const players = await apiFetch('/squadre/' + window.YFM.squadraId + '/calciatori');
    const select = document.getElementById('playerSelect');
    select.innerHTML = '<option value="">-- Seleziona giocatore --</option>' +
      (players || []).map(p => `<option value="${p.id}">${p.cognome || p.nome} ${p.nome}</option>`).join('');
    select.addEventListener('change', () => {
      document.getElementById('btnGeneratePlayerReport').disabled = !select.value;
    });
  } catch (err) {
    console.error('Errore caricamento giocatori:', err);
  }
}

async function loadMatchList() {
  try {
    const partite = await apiFetch('/squadre/' + window.YFM.squadraId + '/partite');
    const select = document.getElementById('reportMatchSelect');
    
    if (!partite || partite.length === 0) {
      select.innerHTML = '<option value="">-- Nessuna partita disponibile --</option>';
      return;
    }

    select.innerHTML = '<option value="">-- Seleziona una partita --</option>' +
      partite.map(p => {
        const data = formatDateShort(p.data_ora);
        const stato = new Date(p.data_ora) < new Date() ? '✅' : '📅';
        return `<option value="${p.id}">${stato} ${data} - ${p.avversario} (${p.competizione})</option>`;
      }).join('');
    
    document.getElementById('btnGenerateReport').disabled = false;
  } catch (e) {
    console.error('Errore caricamento partite:', e);
  }
}

async function generateReport() {
  const matchId = document.getElementById('reportMatchSelect').value;
  if (!matchId) {
    alert('Seleziona una partita');
    return;
  }

  showLoading('Generazione report...');
  try {
    const report = await apiFetch('/partite/' + matchId + '/report');
    hideLoading();
    renderReport(report);
  } catch (e) {
    hideLoading();
    alert('Errore nella generazione del report: ' + e.message);
  }
}

function renderReport(report) {
  const container = document.getElementById('reportContent');
  const titolari = report.giocatori.filter(g => g.ruolo === 'T');
  const panchina = report.giocatori.filter(g => g.ruolo === 'P');
  const socialComment = generateSocialComment(report);

  container.innerHTML = `
    <div id="reportPrintArea" style="background:white;padding:24px;border:1px solid var(--border);border-radius:12px;">
      <!-- Commento Social -->
      <div style="margin-bottom:24px;padding:20px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:12px;color:white;">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;">
          <h3 style="margin:0;font-size:16px;">📱 Commento Social</h3>
          <button class="btn btn-secondary btn-small" onclick="copySocialComment()" style="background:white;color:#667eea;border:none;font-weight:600;padding:6px 12px;border-radius:6px;cursor:pointer;">📋 Copia</button>
        </div>
        <div id="socialCommentBox" style="font-size:14px;line-height:1.6;white-space:pre-wrap;background:rgba(255,255,255,0.15);padding:16px;border-radius:8px;">${socialComment}</div>
      </div>

      <!-- Header Report -->
      <div style="text-align:center;border-bottom:2px solid #333;padding-bottom:16px;margin-bottom:24px;">
        <h1 style="margin:0 0 8px 0;font-size:28px;">${report.societa} vs ${report.partita.avversario}</h1>
        <p style="margin:0;color:#666;">
          ${formatDate(report.partita.dataOra)} · ${report.partita.competizione}
          ${report.partita.giornata ? ' · Giornata ' + report.partita.giornata : ''}
          ${report.partita.luogo ? (report.partita.luogo.toLowerCase().includes('casa') ? '(Casa)' : '(Trasferta)') : ''}
        </p>
      </div>

      <!-- Score e Stats -->
      <div style="display:flex;justify-content:center;gap:40px;margin-bottom:24px;">
        <div style="text-align:center;">
          <div style="font-size:48px;font-weight:bold;color:#27AE60;">${report.score.golCasa}</div>
          <div style="color:#666;">${report.societa}</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:48px;font-weight:bold;color:#E74C3C;">${report.score.golOspiti}</div>
          <div style="color:#666;">${report.partita.avversario}</div>
        </div>
      </div>

      <div style="display:flex;justify-content:center;gap:24px;margin-bottom:24px;font-size:14px;">
        <span>🟨 Ammonizioni: ${report.ammonizioni}</span>
        <span>🟥 Espulsioni: ${report.espulsioni}</span>
      </div>

      <!-- Timeline Eventi -->
      ${report.eventi.length > 0 ? `
      <div style="margin-bottom:24px;">
        <h3 style="border-bottom:1px solid #ddd;padding-bottom:8px;margin-bottom:12px;">⚽ Cronologia Eventi</h3>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${report.eventi.map(e => {
            const icona = e.tipo === 'GOAL' ? '⚽' : e.tipo === 'YELLOW' ? '🟨' : '🟥';
            const label = e.tipo === 'GOAL' ? 'Gol' : e.tipo === 'YELLOW' ? 'Amm.' : 'Esp.';
            return `
              <div style="display:flex;align-items:center;gap:12px;padding:8px;background:#f8f9fa;border-radius:8px;">
                <span style="font-weight:bold;min-width:40px;">${e.minuto}'</span>
                <span>${icona}</span>
                <span><strong>${e.principale}</strong></span>
                ${e.secondario ? `<span style="color:#666;">(Assist: ${e.secondario})</span>` : ''}
              </div>`;
          }).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Formazione Titolari -->
      <div style="margin-bottom:24px;">
        <h3 style="border-bottom:1px solid #ddd;padding-bottom:8px;margin-bottom:12px;">👥 Titolari</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#f8f9fa;">
              <th style="padding:8px;text-align:center;">#</th>
              <th style="padding:8px;text-align:left;">Nome</th>
              <th style="padding:8px;text-align:center;">G</th>
              <th style="padding:8px;text-align:center;">A</th>
              <th style="padding:8px;text-align:center;">🟨</th>
              <th style="padding:8px;text-align:center;">🟥</th>
            </tr>
          </thead>
          <tbody>
            ${titolari.map(g => `
              <tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px;text-align:center;font-weight:bold;">${g.numeroMaglia}</td>
                <td style="padding:8px;">${g.cognome} ${g.nome[0]}.</td>
                <td style="padding:8px;text-align:center;">${g.gol}</td>
                <td style="padding:8px;text-align:center;">${g.assist}</td>
                <td style="padding:8px;text-align:center;color:#E67E22;">${g.ammonizioni > 0 ? g.ammonizioni : ''}</td>
                <td style="padding:8px;text-align:center;color:#E74C3C;">${g.espulsioni > 0 ? g.espulsioni : ''}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>

      <!-- Panchina -->
      ${panchina.length > 0 ? `
      <div style="margin-bottom:24px;">
        <h3 style="border-bottom:1px solid #ddd;padding-bottom:8px;margin-bottom:12px;">🪑 Panchina</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#f8f9fa;">
              <th style="padding:8px;text-align:center;">#</th>
              <th style="padding:8px;text-align:left;">Nome</th>
              <th style="padding:8px;text-align:center;">G</th>
              <th style="padding:8px;text-align:center;">A</th>
              <th style="padding:8px;text-align:center;">🟨</th>
              <th style="padding:8px;text-align:center;">🟥</th>
            </tr>
          </thead>
          <tbody>
            ${panchina.map(g => `
              <tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px;text-align:center;font-weight:bold;">${g.numeroMaglia}</td>
                <td style="padding:8px;">${g.cognome} ${g.nome[0]}.</td>
                <td style="padding:8px;text-align:center;">${g.gol}</td>
                <td style="padding:8px;text-align:center;">${g.assist}</td>
                <td style="padding:8px;text-align:center;color:#E67E22;">${g.ammonizioni > 0 ? g.ammonizioni : ''}</td>
                <td style="padding:8px;text-align:center;color:#E74C3C;">${g.espulsioni > 0 ? g.espulsioni : ''}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <!-- Note -->
      ${report.partita.note ? `
      <div style="margin-bottom:16px;">
        <h3 style="border-bottom:1px solid #ddd;padding-bottom:8px;margin-bottom:8px;">📝 Note</h3>
        <p style="white-space:pre-wrap;font-size:13px;color:#555;">${report.partita.note}</p>
      </div>
      ` : ''}

      <!-- Footer -->
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #ddd;text-align:center;color:#999;font-size:12px;">
        <p style="margin:0;">Report generato da Youth Football Manager</p>
        <p style="margin:4px 0 0 0;">${report.allenatore ? 'Allenatore: ' + report.allenatore : ''} ${report.dirigente ? ' | Dirigente: ' + report.dirigente : ''}</p>
      </div>
    </div>
  `;

  container.style.display = 'block';
  document.getElementById('btnPrintReport').style.display = 'inline-block';
}

function printReport() {
  const printArea = document.getElementById('reportPrintArea');
  if (!printArea) return;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Report Partita</title>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f0f0f0; }
        h1, h2, h3 { margin: 0; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      ${printArea.innerHTML}
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}

function generateSocialComment(report) {
  const { societa, categoria, partita, score, ammonizioni, espulsioni, eventi } = report;
  const golFatti = score.golCasa;
  const golSubiti = score.golOspiti;
  const marcatori = eventi.filter(e => e.tipo === 'GOAL');
  
  // Determina il risultato
  let intro = '';
  if (golFatti > golSubiti) {
    intro = '🏆 GRANDE VITTORIA!';
  } else if (golFatti === golSubiti) {
    intro = '🤝 BEL PUNTO!';
  } else {
    intro = '💪 SI CONTINUA A LAVORARE!';
  }

  // Costruisce il commento
  let comment = `${intro}\n\n`;
  comment += `${societa} ${golFatti}-${golSubiti} ${partita.avversario}\n`;
  
  if (marcatori.length > 0) {
    const marcatoriList = marcatori.map(m => {
      const nome = m.principale.split(' ')[0]; // Solo il nome
      return `${nome} (${m.minuto}')`;
    }).join(', ');
    comment += `⚽ Marcatori: ${marcatoriList}\n`;
  }
  
  if (golSubiti === 0 && golFatti > 0) {
    comment += `🧤 PORTA INVOLATA!\n`;
  }
  
  if (ammonizioni > 0) {
    comment += `🟨 ${ammonizioni} ammonizion${ammonizioni > 1 ? 'i' : 'e'}\n`;
  }
  
  if (espulsioni > 0) {
    comment += `🟥 ${espulsioni} espulsion${espulsioni > 1 ? 'i' : 'e'}\n`;
  }
  
  comment += `\n${partita.competizione}${partita.giornata ? ' - Giornata ' + partita.giornata : ''}\n\n`;
  
  // Hashtag
  comment += `#${societa.replace(/\s+/g, '')} #${categoria.replace(/\s+/g, '')} #calciogiovanile`;
  
  return comment;
}

// Funzione globale per copiare il commento
window.copySocialComment = function() {
  const text = document.getElementById('socialCommentBox')?.textContent;
  if (text) {
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Commento copiato negli appunti!');
    }).catch(() => {
      // Fallback per browser più vecchi
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('✅ Commento copiato negli appunti!');
    });
  }
};

// ── REPORT STAGIONALE ──
async function generateSeasonalReport() {
  showLoading('Generazione report stagionale...');
  try {
    const report = await apiFetch('/squadre/' + window.YFM.squadraId + '/report-stagionale');
    renderSeasonalReport(report);
    document.getElementById('btnPrintSeasonalReport').style.display = 'inline-block';
  } catch (err) {
    alert('Errore: ' + err.message);
  } finally {
    hideLoading();
  }
}

function renderSeasonalReport(report) {
  const container = document.getElementById('seasonalReportContent');
  container.style.display = 'block';
  
  const winRate = report.partiteGiocate > 0 
    ? Math.round((report.vittorie / report.partiteGiocate) * 100) : 0;
  
  container.innerHTML = `
    <div id="seasonalPrintArea" style="background:white;padding:24px;">
      <!-- Header -->
      <div style="text-align:center;border-bottom:2px solid #333;padding-bottom:16px;margin-bottom:24px;">
        <h2 style="margin:0 0 8px 0;">${report.societa}</h2>
        <h1 style="margin:0;font-size:28px;">Report Stagionale</h1>
        <p style="margin:8px 0 0 0;color:#666;">${report.squadra.nome} - ${report.squadra.categoria}</p>
        <p style="margin:4px 0 0 0;color:#666;">${report.stagione}</p>
      </div>
      
      <!-- Stats Grid -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:16px;margin-bottom:24px;">
        <div style="background:#f8f9fa;padding:20px;border-radius:12px;text-align:center;">
          <div style="font-size:32px;font-weight:bold;color:var(--primary);">${report.partiteGiocate}</div>
          <div style="color:#666;font-size:13px;">Partite</div>
        </div>
        <div style="background:#d4edda;padding:20px;border-radius:12px;text-align:center;">
          <div style="font-size:32px;font-weight:bold;color:#28a745;">${report.vittorie}</div>
          <div style="color:#666;font-size:13px;">Vittorie</div>
        </div>
        <div style="background:#fff3cd;padding:20px;border-radius:12px;text-align:center;">
          <div style="font-size:32px;font-weight:bold;color:#ffc107;">${report.pareggi}</div>
          <div style="color:#666;font-size:13px;">Pareggi</div>
        </div>
        <div style="background:#f8d7da;padding:20px;border-radius:12px;text-align:center;">
          <div style="font-size:32px;font-weight:bold;color:#dc3545;">${report.sconfitte}</div>
          <div style="color:#666;font-size:13px;">Sconfitte</div>
        </div>
        <div style="background:#cce5ff;padding:20px;border-radius:12px;text-align:center;">
          <div style="font-size:32px;font-weight:bold;color:#004085;">${report.golFatti}</div>
          <div style="color:#666;font-size:13px;">Gol Fatti</div>
        </div>
        <div style="background:#e2e3e5;padding:20px;border-radius:12px;text-align:center;">
          <div style="font-size:32px;font-weight:bold;color:#383d41;">${report.golSubiti}</div>
          <div style="color:#666;font-size:13px;">Gol Subiti</div>
        </div>
      </div>
      
      <!-- Win Rate -->
      <div style="margin-bottom:24px;">
        <h3 style="margin:0 0 12px 0;">Performance</h3>
        <div style="background:#e9ecef;height:24px;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(90deg,#28a745,#20c997);height:100%;width:${winRate}%;display:flex;align-items:center;justify-content:center;color:white;font-weight:600;font-size:12px;">
            ${winRate}% Vittorie
          </div>
        </div>
      </div>
      
      <!-- Top Marcatori -->
      <div style="margin-bottom:24px;">
        <h3 style="margin:0 0 12px 0;">⚽ Top Marcatori</h3>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f8f9fa;">
              <th style="padding:10px;text-align:left;border-bottom:2px solid #dee2e6;">Giocatore</th>
              <th style="padding:10px;text-align:center;border-bottom:2px solid #dee2e6;">Gol</th>
            </tr>
          </thead>
          <tbody>
            ${report.topMarcatori.map((m, i) => `
              <tr style="background:${i % 2 === 0 ? 'white' : '#f8f9fa'};">
                <td style="padding:10px;border-bottom:1px solid #eee;">${m.cognome || m.nome} ${m.nome}</td>
                <td style="padding:10px;text-align:center;border-bottom:1px solid #eee;font-weight:600;">${m.gol}</td>
              </tr>
            `).join('')}
            ${report.topMarcatori.length === 0 ? '<tr><td colspan="2" style="padding:20px;text-align:center;color:#666;">Nessun gol registrato</td></tr>' : ''}
          </tbody>
        </table>
      </div>
      
      <!-- Lista Partite -->
      <div>
        <h3 style="margin:0 0 12px 0;">📅 Calendario Stagionale</h3>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f8f9fa;">
              <th style="padding:10px;text-align:left;border-bottom:2px solid #dee2e6;">Data</th>
              <th style="padding:10px;text-align:left;border-bottom:2px solid #dee2e6;">Avversario</th>
              <th style="padding:10px;text-align:left;border-bottom:2px solid #dee2e6;">Campionato</th>
            </tr>
          </thead>
          <tbody>
            ${report.partite.map((p, i) => `
              <tr style="background:${i % 2 === 0 ? 'white' : '#f8f9fa'};">
                <td style="padding:10px;border-bottom:1px solid #eee;">${formatDateShort(p.data)}</td>
                <td style="padding:10px;border-bottom:1px solid #eee;">${p.avversario}</td>
                <td style="padding:10px;border-bottom:1px solid #eee;color:#666;">${p.competizione}${p.giornata ? ' - G.' + p.giornata : ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function printSeasonalReport() {
  const printArea = document.getElementById('seasonalPrintArea');
  if (!printArea) return;
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`<!DOCTYPE html><html><head><title>Report Stagionale</title><meta charset="UTF-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:20px;color:#333}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{padding:8px;text-align:left;border-bottom:1px solid #eee}th{background:#f0f0f0}@media print{body{padding:0}}</style></head><body>${printArea.innerHTML}</body></html>`);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
}

// ── REPORT GIOCATORE ──
async function generatePlayerReport() {
  const playerId = document.getElementById('playerSelect').value;
  if (!playerId) return;
  
  showLoading('Generazione report giocatore...');
  try {
    const report = await apiFetch('/calciatori/' + playerId + '/report');
    renderPlayerReport(report);
    document.getElementById('btnPrintPlayerReport').style.display = 'inline-block';
  } catch (err) {
    alert('Errore: ' + err.message);
  } finally {
    hideLoading();
  }
}

function renderPlayerReport(report) {
  const container = document.getElementById('playerReportContent');
  container.style.display = 'block';
  
  const avgGolPerPartita = report.stats.partiteGiocate > 0 
    ? (report.stats.gol / report.stats.partiteGiocate).toFixed(2) : 0;
  
  container.innerHTML = `
    <div id="playerPrintArea" style="background:white;padding:24px;">
      <!-- Header -->
      <div style="text-align:center;border-bottom:2px solid #333;padding-bottom:16px;margin-bottom:24px;">
        <h1 style="margin:0;font-size:28px;">${report.giocatore.cognome || ''} ${report.giocatore.nome}</h1>
        <p style="margin:8px 0 0 0;color:#666;">
          ${report.giocatore.data_nascita ? 'Nato: ' + formatDate(report.giocatore.data_nascita) : ''}
          ${report.giocatore.nazionalita ? ' | ' + report.giocatore.nazionalita : ''}
        </p>
      </div>
      
      <!-- Stats Grid -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:12px;margin-bottom:24px;">
        <div style="background:#cce5ff;padding:16px;border-radius:12px;text-align:center;">
          <div style="font-size:28px;font-weight:bold;color:#004085;">${report.stats.partiteGiocate}</div>
          <div style="color:#666;font-size:12px;">Partite</div>
        </div>
        <div style="background:#d4edda;padding:16px;border-radius:12px;text-align:center;">
          <div style="font-size:28px;font-weight:bold;color:#28a745;">${report.stats.gol}</div>
          <div style="color:#666;font-size:12px;">Gol</div>
        </div>
        <div style="background:#e2e3e5;padding:16px;border-radius:12px;text-align:center;">
          <div style="font-size:28px;font-weight:bold;color:#495057;">${avgGolPerPartita}</div>
          <div style="color:#666;font-size:12px;">Gol/Partita</div>
        </div>
        <div style="background:#fff3cd;padding:16px;border-radius:12px;text-align:center;">
          <div style="font-size:28px;font-weight:bold;color:#856404;">${report.stats.assist}</div>
          <div style="color:#666;font-size:12px;">Assist</div>
        </div>
        <div style="background:#fff3cd;padding:16px;border-radius:12px;text-align:center;">
          <div style="font-size:28px;font-weight:bold;color:#856404;">${report.stats.ammonizioni}</div>
          <div style="color:#666;font-size:12px;">Ammonizioni</div>
        </div>
        <div style="background:#f8d7da;padding:16px;border-radius:12px;text-align:center;">
          <div style="font-size:28px;font-weight:bold;color:#dc3545;">${report.stats.espulsioni}</div>
          <div style="color:#666;font-size:12px;">Espulsioni</div>
        </div>
      </div>
      
      <!-- Storico Eventi -->
      <div>
        <h3 style="margin:0 0 12px 0;">📋 Storico Presenze</h3>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f8f9fa;">
              <th style="padding:10px;text-align:left;border-bottom:2px solid #dee2e6;">Data</th>
              <th style="padding:10px;text-align:left;border-bottom:2px solid #dee2e6;">Partita</th>
              <th style="padding:10px;text-align:center;border-bottom:2px solid #dee2e6;">Min.</th>
              <th style="padding:10px;text-align:center;border-bottom:2px solid #dee2e6;">Evento</th>
            </tr>
          </thead>
          <tbody>
            ${report.storico.map((e, i) => `
              <tr style="background:${i % 2 === 0 ? 'white' : '#f8f9fa'};">
                <td style="padding:10px;border-bottom:1px solid #eee;font-size:13px;">${e.data ? formatDateShort(e.data) : '-'}</td>
                <td style="padding:10px;border-bottom:1px solid #eee;">${e.partita}</td>
                <td style="padding:10px;text-align:center;border-bottom:1px solid #eee;">${e.minuto}'</td>
                <td style="padding:10px;text-align:center;border-bottom:1px solid #eee;">
                  ${getEventIcon(e.tipo)} ${getEventLabel(e.tipo)}
                </td>
              </tr>
            `).join('')}
            ${report.storico.length === 0 ? '<tr><td colspan="4" style="padding:20px;text-align:center;color:#666;">Nessun evento registrato</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function getEventIcon(tipo) {
  const icons = { GOAL: '⚽', ASSIST: '🅰️', YELLOW: '🟨', RED: '🟥', SUB_IN: '🔵', SUB_OUT: '🔴' };
  return icons[tipo] || '⚪';
}

function getEventLabel(tipo) {
  const labels = { GOAL: 'Goal', ASSIST: 'Assist', YELLOW: 'Ammonito', RED: 'Espulso', SUB_IN: 'Entrato', SUB_OUT: 'Uscito' };
  return labels[tipo] || tipo;
}

function printPlayerReport() {
  const printArea = document.getElementById('playerPrintArea');
  if (!printArea) return;
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`<!DOCTYPE html><html><head><title>Report Giocatore</title><meta charset="UTF-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:20px;color:#333}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{padding:8px;text-align:left;border-bottom:1px solid #eee}th{background:#f0f0f0}@media print{body{padding:0}}</style></head><body>${printArea.innerHTML}</body></html>`);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
}
