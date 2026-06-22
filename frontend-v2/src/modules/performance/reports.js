import { apiFetch } from '../../services/api';
import { formatDate, formatDateShort } from '../../utils/formatters';
import { showLoading, hideLoading } from '../../utils/ui';

export default async function loadReports() {
  const c = document.getElementById('pageContent');
  c.innerHTML = `
    <h1 class="page-title">Report ${window.YFM.getSquadraName()}</h1>
    <p class="page-subtitle">Genera e scarica report della stagione</p>
    
    <div class="card" style="margin-bottom:24px;">
      <h3 class="section-title">📄 Report Partita</h3>
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
    
    <div class="grid-2">
      <div class="card" style="text-align:center;padding:40px 20px;">
        <div style="font-size:48px;margin-bottom:16px;">📊</div>
        <h3>Report Stagionale</h3>
        <p style="color:var(--gray);margin-bottom:20px;">In sviluppo</p>
        <button class="btn btn-primary" disabled>Prossimamente</button>
      </div>
      <div class="card" style="text-align:center;padding:40px 20px;">
        <div style="font-size:48px;margin-bottom:16px;">👤</div>
        <h3>Report Giocatore</h3>
        <p style="color:var(--gray);margin-bottom:20px;">In sviluppo</p>
        <button class="btn btn-primary" disabled>Prossimamente</button>
      </div>
    </div>
  `;

  // Carica partite
  loadMatchList();

  // Event listeners
  document.getElementById('btnGenerateReport').addEventListener('click', generateReport);
  document.getElementById('btnPrintReport').addEventListener('click', printReport);
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
        <h2 style="margin:0 0 8px 0;">${report.societa}</h2>
        <p style="margin:0;color:#666;">${report.categoria}</p>
        <h1 style="margin:16px 0;font-size:28px;">${report.societa} vs ${report.partita.avversario}</h1>
        <p style="margin:0;color:#666;">
          ${formatDate(report.partita.dataOra)} · ${report.partita.competizione}
          ${report.partita.giornata ? ' · Giornata ' + report.partita.giornata : ''}
        </p>
        <p style="margin:4px 0 0 0;color:#666;">${report.partita.luogo}</p>
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
