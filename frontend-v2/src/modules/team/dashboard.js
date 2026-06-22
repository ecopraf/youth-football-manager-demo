import { apiFetch } from '../../services/api';
import { formatDate, formatDateShort } from '../../utils/formatters';

export default async function loadDashboard() {
  const c = document.getElementById('pageContent');
  const squadraId = window.YFM.squadraId;
  
  try {
    const [stats, top] = await Promise.all([
      apiFetch('/squadre/' + squadraId + '/statistiche-complete').catch(() => ({ punti:0, partiteGiocate:0, vittorie:0, pareggi:0, sconfitte:0, golFatti:0, golSubiti:0, differenzaReti:0, risultati:[] })),
      apiFetch('/squadre/' + squadraId + '/top-players').catch(() => ({ marcatori:[], assistmen:[], presenze:[] }))
    ]);
    
    const s = window.YFM.getSquadra();
    
    // Widget principali
    const widgets = [
      { v:stats.punti, l:'Punti', c:'#27AE60' },
      { v:stats.partiteGiocate, l:'Giocate' },
      { v:stats.vittorie, l:'V', c:'#27AE60' },
      { v:stats.pareggi, l:'P', c:'#F39C12' },
      { v:stats.sconfitte, l:'S', c:'#E74C3C' },
      { v:stats.golFatti, l:'GF', c:'#27AE60' },
      { v:stats.golSubiti, l:'GS' },
      { v:(stats.differenzaReti >= 0 ? '+' : '') + stats.differenzaReti, l:'DR', c:stats.differenzaReti >= 0 ? '#27AE60' : '#E74C3C' }
    ];
    
    c.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
        <div>
          <h1 class="page-title">Dashboard ${window.YFM.getSquadraName()}</h1>
          <p class="page-subtitle">Stagione 2025/26 · ${stats.partiteGiocate} partite</p>
        </div>
        <button class="btn btn-primary" id="btnNewMatch">+ Nuova Partita</button>
      </div>
      
      <!-- Widgets responsive -->
      <div class="dashboard-widgets" style="display:grid;grid-template-columns:repeat(8,1fr);gap:10px;margin-bottom:24px;">
        ${widgets.map(w => `
          <div class="card" style="padding:12px 6px;text-align:center;">
            <div style="font-size:18px;font-weight:bold;color:${w.c || 'var(--text)'};">${w.v}</div>
            <div style="font-size:10px;color:var(--gray);">${w.l}</div>
          </div>
        `).join('')}
      </div>
      <style>
        @media (max-width: 900px) { .dashboard-widgets { grid-template-columns: repeat(4, 1fr) !important; } }
        @media (max-width: 600px) { .dashboard-widgets { grid-template-columns: repeat(4, 1fr) !important; } }
        @media (max-width: 400px) { .dashboard-widgets { grid-template-columns: repeat(2, 1fr) !important; } }
      </style>
      
      <!-- Top 3 responsive cards -->
      <div class="top-cards-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px;">
        <!-- Top 3 Marcatori -->
        <div class="card" style="padding:12px;">
          <h3 class="section-title" style="margin:0 0 12px 0;">⚽ Top 3 Marcatori</h3>
          <div class="top-cards-row" style="display:flex;gap:8px;">
            ${(top.marcatori || []).slice(0, 3).map((x, i) => `
              <div style="flex:1;background:${['#fff9e6','#f0f0f0','#f0f8ff'][i]};padding:10px 6px;border-radius:8px;text-align:center;">
                <div style="font-size:20px;margin-bottom:4px;">${['🥇','🥈','🥉'][i]}</div>
                <div style="font-size:12px;font-weight:bold;">${x.nome}</div>
                <div style="font-size:14px;font-weight:bold;color:#27AE60;">${x.gol} Gol</div>
              </div>
            `).join('')}
            ${(top.marcatori || []).length < 3 ? Array(3 - (top.marcatori || []).length).fill('<div style="flex:1;background:#f8f8f8;padding:10px 6px;border-radius:8px;text-align:center;color:#ccc;">-</div>').join('') : ''}
          </div>
        </div>
        <!-- Top 3 Assist -->
        <div class="card" style="padding:12px;">
          <h3 class="section-title" style="margin:0 0 12px 0;">🅰️ Top 3 Assist</h3>
          <div class="top-cards-row" style="display:flex;gap:8px;">
            ${(top.assistmen || []).slice(0, 3).map((x, i) => `
              <div style="flex:1;background:${['#e6fff0','#f0f0f0','#f0f8ff'][i]};padding:10px 6px;border-radius:8px;text-align:center;">
                <div style="font-size:20px;margin-bottom:4px;">${['🥇','🥈','🥉'][i]}</div>
                <div style="font-size:12px;font-weight:bold;">${x.nome}</div>
                <div style="font-size:14px;font-weight:bold;color:#667eea;">${x.assist} Assist</div>
              </div>
            `).join('')}
            ${(top.assistmen || []).length < 3 ? Array(3 - (top.assistmen || []).length).fill('<div style="flex:1;background:#f8f8f8;padding:10px 6px;border-radius:8px;text-align:center;color:#ccc;">-</div>').join('') : ''}
          </div>
        </div>
        <!-- Top 3 Presenze -->
        <div class="card" style="padding:12px;">
          <h3 class="section-title" style="margin:0 0 12px 0;">🏃 Top 3 Presenze</h3>
          <div class="top-cards-row" style="display:flex;gap:8px;">
            ${(top.presenze || []).slice(0, 3).map((x, i) => `
              <div style="flex:1;background:${['#e6f3ff','#f0f0f0','#fff9e6'][i]};padding:10px 6px;border-radius:8px;text-align:center;">
                <div style="font-size:20px;margin-bottom:4px;">${['🥇','🥈','🥉'][i]}</div>
                <div style="font-size:12px;font-weight:bold;">${x.nome}</div>
                <div style="font-size:14px;font-weight:bold;color:#667eea;">${x.presenze} Pres.</div>
              </div>
            `).join('')}
            ${(top.presenze || []).length < 3 ? Array(3 - (top.presenze || []).length).fill('<div style="flex:1;background:#f8f8f8;padding:10px 6px;border-radius:8px;text-align:center;color:#ccc;">-</div>').join('') : ''}
          </div>
        </div>
      </div>
      <style>
        @media (max-width: 900px) { .top-cards-grid { grid-template-columns: 1fr !important; } }
      </style>
      
      <!-- Ultimi Risultati + Staff (2 colonne desktop) -->
      <div class="dashboard-bottom-grid" style="display:grid;gap:20px;grid-template-columns:1fr;">
        <!-- Ultimi Risultati -->
        <div class="card">
          <h3 class="section-title">📋 Ultimi Risultati</h3>
          ${(() => {
            const risultati = (stats.risultati || []).slice(0, 10);
            const gruppi = {};
            risultati.forEach(r => {
              const comp = r.competizione || 'Altro';
              if (!gruppi[comp]) gruppi[comp] = [];
              gruppi[comp].push(r);
            });
            return Object.entries(gruppi).map(([comp, partite]) => `
              <div style="margin-bottom:16px;">
                <h4 style="margin:0 0 8px 0;padding:6px 10px;background:#f0f4ff;color:#667eea;border-radius:6px;font-size:12px;font-weight:600;">
                  ${comp}
                </h4>
                ${partite.map(r => {
                  const isCasa = r.luogo === 'Casa';
                  const resultColor = r.golFatti > r.golSubiti ? '#27AE60' : r.golFatti === r.golSubiti ? '#F39C12' : '#E74C3C';
                  const resultIcon = r.golFatti > r.golSubiti ? '✅' : r.golFatti === r.golSubiti ? '🤝' : '❌';
                  return `
                    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 8px;border-bottom:1px solid #f0f0f0;cursor:pointer;" 
                         onclick="window.YFM.openMatchDetail('${r.id}')">
                      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                        <span style="font-size:11px;color:#667eea;font-weight:600;min-width:20px;">G.${r.giornata || '-'}</span>
                        <span style="font-size:12px;color:var(--gray);">${formatDateShort(r.dataOra)}</span>
                        <span title="${isCasa ? 'Casa' : 'Trasferta'}" style="font-size:14px;">${isCasa ? '🏠' : '✈️'}</span>
                      </div>
                      <div style="display:flex;align-items:center;gap:8px;">
                        <span style="font-size:12px;color:var(--gray);">vs ${r.avversario}</span>
                        <span style="font-size:16px;font-weight:bold;color:${resultColor};">${r.golFatti} - ${r.golSubiti}</span>
                        <span style="font-size:12px;">${resultIcon}</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `).join('');
          })()}
        </div>
        
        <!-- Staff -->
        <div class="card">
          <h3 class="section-title">👥 Staff</h3>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${['allenatore','dirigente','dirigente2','preparatore_atletico','allenatore_portieri'].filter(r => s[r]).map(r => `
              <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #f0f0f0;">
                <span style="font-size:11px;font-weight:600;color:var(--primary);min-width:80px;">
                  ${r==='allenatore'?'Allenatore':r==='dirigente'?'1° Dirigente':r==='dirigente2'?'2° Dirigente':r==='preparatore_atletico'?'Prep. Atl.':'All. Portieri'}
                </span>
                <span style="font-weight:500;">${s[r]}</span>
              </div>
            `).join('')}
            ${!s.allenatore && !s.dirigente ? '<p style="color:var(--gray);">Nessuno staff registrato</p>' : ''}
          </div>
        </div>
      </div>
      <style>
        @media (min-width: 900px) { .dashboard-bottom-grid { grid-template-columns: 1.5fr 1fr !important; } }
      </style>
    `;
    
    document.getElementById('btnNewMatch').addEventListener('click', () => {
      window.YFM.navigateTo('calendar');
    });
  } catch (error) {
    c.innerHTML = `<div class="error-box">Errore: ${error.message}</div>`;
  }
}
