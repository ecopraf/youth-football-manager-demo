import { apiFetch } from '../../services/api';

export default async function loadStats() {
  const c = document.getElementById('pageContent');
  c.innerHTML = '<div class="loading"><div class="spinner"></div>Caricamento...</div>';

  const isDemo = localStorage.getItem('yfm_demo_session') === 'active';

  if (!isDemo) {
    // Modalità produzione — usa API
    await loadStatsFromAPI(c);
    return;
  }

  // === DEMO MODE ===
  const players = window.YFM.allPlayers || [];
  const events = window.YFM.demoEvents || [];
  const formazioni = window.YFM.demoFormazioni || {};
  const matches = (window.YFM.demoMatches || []).filter(m => m.stato === 'Terminata' || m.stato === 'Archiviata');

  // Determina minutaggio per presenza in base alla categoria
  const squadra = (window.YFM.allSquadre || []).find(s => s.id === window.YFM.squadraId);
  const categoria = (squadra?.categoria || '').toLowerCase();
  let minPerMatch = 70; // default fino a U15
  if (categoria.includes('17') || categoria.includes('18') || categoria.includes('19') || categoria.includes('20') || categoria.includes('21')) {
    minPerMatch = 90;
  } else if (categoria.includes('16')) {
    minPerMatch = 80;
  }

  // Calcola stats per giocatore
  const statsMap = {};
  players.forEach(p => {
    statsMap[p.id] = { id: p.id, nome: p.nome, cognome: p.cognome, ruolo: p.ruolo || '', presenze: 0, gol: 0, assist: 0, ammonizioni: 0, espulsioni: 0 };
  });

  // Presenze da formazioni
  Object.keys(formazioni).forEach(matchId => {
    if (!matches.find(m => m.id === matchId)) return;
    const f = formazioni[matchId];
    const ids = [f.portiere, ...(f.difensori || []), ...(f.centrocampisti || []), ...(f.attaccanti || [])].filter(Boolean);
    ids.forEach(id => { if (statsMap[id]) statsMap[id].presenze++; });
  });

  // Gol e Assist da eventi
  events.forEach(e => {
    if (!e.player_id || !statsMap[e.player_id]) return;
    if (e.tipo === 'GOAL') statsMap[e.player_id].gol++;
    if (e.tipo === 'ASSIST') statsMap[e.player_id].assist++;
    if (e.tipo === 'YELLOW') statsMap[e.player_id].ammonizioni++;
    if (e.tipo === 'RED') statsMap[e.player_id].espulsioni++;
  });

  // Se non ci sono eventi YELLOW/RED, genera deterministici (retrocompatibilità)
  const hasCardEvents = events.some(e => e.tipo === 'YELLOW' || e.tipo === 'RED');
  if (!hasCardEvents) {
    const seedFromId = (id) => {
      let hash = 0;
      for (let i = 0; i < (id || '').length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
      return Math.abs(hash);
    };
    players.forEach(p => {
      const seed = seedFromId(p.id);
      statsMap[p.id].ammonizioni = seed % 4;
      statsMap[p.id].espulsioni = (seed % 11 === 0) ? 1 : 0;
    });
  }

  // Array ordinato per cognome
  const statsArr = Object.values(statsMap).sort((a, b) => a.cognome.localeCompare(b.cognome));

  // Totali
  const totGol = statsArr.reduce((s, p) => s + p.gol, 0);
  const totAssist = statsArr.reduce((s, p) => s + p.assist, 0);
  const totAmm = statsArr.reduce((s, p) => s + p.ammonizioni, 0);
  const totEsp = statsArr.reduce((s, p) => s + p.espulsioni, 0);

  // Diffidati (4 ammonizioni)
  const diffidati = statsArr.filter(p => p.ammonizioni >= 4);

  // Render
  let html = `<style>
    .stats-table { width:100%; border-collapse:collapse; font-size:13px; }
    .stats-table th { padding:8px 6px; text-align:center; background:#f8f9fa; font-size:11px; color:#64748b; font-weight:600; border-bottom:2px solid #e2e8f0; cursor:pointer; user-select:none; white-space:nowrap; }
    .stats-table th:first-child, .stats-table th:nth-child(2) { text-align:left; }
    .stats-table th:hover { background:#eef2ff; }
    .stats-table th.sorted-asc::after { content:' ▲'; font-size:9px; }
    .stats-table th.sorted-desc::after { content:' ▼'; font-size:9px; }
    .stats-table td { padding:7px 6px; text-align:center; border-bottom:1px solid #f1f5f9; }
    .stats-table td:first-child, .stats-table td:nth-child(2) { text-align:left; }
    .stats-table tr:hover { background:#f8faff; }
    .stats-ruolo { font-size:10px; padding:2px 6px; border-radius:8px; font-weight:500; }
    .stats-ruolo.portiere { background:#f59e0b20; color:#d97706; }
    .stats-ruolo.difensore { background:#3b82f620; color:#2563eb; }
    .stats-ruolo.centrocampista { background:#22c55e20; color:#16a34a; }
    .stats-ruolo.attaccante { background:#ef444420; color:#dc2626; }
  </style>
  <h1 class="page-title">Dati & Statistiche ${window.YFM.getSquadraName()}</h1>
  <p class="page-subtitle">Riepilogo stagionale • ${minPerMatch}' a partita</p>
  <div class="widgets" style="margin-bottom:20px;">
    <div class="card widget"><div class="widget-value" style="color:#667eea;">${matches.length}</div><div class="widget-label">Partite</div></div>
    <div class="card widget"><div class="widget-value" style="color:#27AE60;">${totGol}</div><div class="widget-label">⚽ Gol</div></div>
    <div class="card widget"><div class="widget-value" style="color:#3498DB;">${totAssist}</div><div class="widget-label">🅰️ Assist</div></div>
    <div class="card widget"><div class="widget-value" style="color:#F39C12;">${totAmm}</div><div class="widget-label">🟨 Amm.</div></div>
    <div class="card widget"><div class="widget-value" style="color:#E74C3C;">${totEsp}</div><div class="widget-label">🟥 Esp.</div></div>
  </div>
  ${diffidati.length > 0 ? `<div class="card" style="margin-bottom:16px;border-left:4px solid #F39C12;padding:14px 16px;">
    <h3 style="margin:0 0 8px 0;font-size:14px;color:#F39C12;">⚠️ Diffidati (4 ammonizioni)</h3>
    ${diffidati.map(p => `<div style="font-size:13px;margin-bottom:4px;">• <strong>${p.cognome} ${p.nome}</strong> — ${p.ammonizioni} 🟨 (prossimo giallo = squalifica)</div>`).join('')}
  </div>` : ''}
  <div class="card">
    <h3 class="section-title">📊 Statistiche Giocatori</h3>
    <div style="overflow-x:auto;">
      <table class="stats-table" id="statsTable">
        <thead><tr>
          <th data-col="cognome" class="sorted-asc">Giocatore</th>
          <th data-col="ruolo">Ruolo</th>
          <th data-col="presenze">Pres.</th>
          <th data-col="minuti">Min</th>
          <th data-col="gol">⚽</th>
          <th data-col="assist">🅰️</th>
          <th data-col="ammonizioni">🟨</th>
          <th data-col="espulsioni">🟥</th>
        </tr></thead>
        <tbody id="statsBody">
          ${renderRows(statsArr, minPerMatch)}
        </tbody>
      </table>
    </div>
  </div>`;

  c.innerHTML = html;

  // Sorting
  let sortCol = 'cognome';
  let sortDir = 'asc';
  document.querySelectorAll('#statsTable th[data-col]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (sortCol === col) { sortDir = sortDir === 'asc' ? 'desc' : 'asc'; }
      else { sortCol = col; sortDir = col === 'cognome' || col === 'ruolo' ? 'asc' : 'desc'; }
      document.querySelectorAll('#statsTable th').forEach(h => h.classList.remove('sorted-asc', 'sorted-desc'));
      th.classList.add(sortDir === 'asc' ? 'sorted-asc' : 'sorted-desc');
      const sorted = [...statsArr].sort((a, b) => {
        let va = col === 'minuti' ? a.presenze * minPerMatch : a[col];
        let vb = col === 'minuti' ? b.presenze * minPerMatch : b[col];
        if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        return sortDir === 'asc' ? va - vb : vb - va;
      });
      document.getElementById('statsBody').innerHTML = renderRows(sorted, minPerMatch);
    });
  });
}

function renderRows(arr, minPerMatch) {
  return arr.map(p => {
    const ruoloClass = (p.ruolo || '').toLowerCase().replace(/\s/g, '');
    const min = p.presenze * minPerMatch;
    return `<tr>
      <td style="font-weight:500;">${p.cognome} ${p.nome}</td>
      <td><span class="stats-ruolo ${ruoloClass}">${p.ruolo || '-'}</span></td>
      <td>${p.presenze || '-'}</td>
      <td>${min || '-'}</td>
      <td style="font-weight:${p.gol ? '700' : '400'};color:${p.gol ? '#27AE60' : '#ccc'};">${p.gol || '-'}</td>
      <td style="font-weight:${p.assist ? '700' : '400'};color:${p.assist ? '#3498DB' : '#ccc'};">${p.assist || '-'}</td>
      <td style="color:${p.ammonizioni ? '#F39C12' : '#ccc'};">${p.ammonizioni || '-'}</td>
      <td style="color:${p.espulsioni ? '#E74C3C' : '#ccc'};">${p.espulsioni || '-'}</td>
    </tr>`;
  }).join('');
}

async function loadStatsFromAPI(c) {
  try {
    const disciplina = await apiFetch('/squadre/' + window.YFM.squadraId + '/disciplina');
    const totAmm = (disciplina || []).reduce((s, p) => s + p.ammonizioni, 0);
    const totEsp = (disciplina || []).reduce((s, p) => s + p.espulsioni, 0);
    let html = `<h1 class="page-title">Dati & Statistiche ${window.YFM.getSquadraName()}</h1>
      <div class="widgets" style="margin-bottom:20px;">
        <div class="card widget"><div class="widget-value" style="color:#F39C12;">${totAmm}</div><div class="widget-label">Ammonizioni</div></div>
        <div class="card widget"><div class="widget-value" style="color:#E74C3C;">${totEsp}</div><div class="widget-label">Espulsioni</div></div>
      </div>`;
    if (disciplina && disciplina.length > 0) {
      html += `<div class="card"><h3 class="section-title">🟨🟥 Stato Disciplinare</h3><div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead><tr style="background:#F8F9FA;"><th style="padding:8px;text-align:left;">Giocatore</th><th style="padding:8px;">🟨</th><th style="padding:8px;">🟥</th><th style="padding:8px;">Squalifiche</th></tr></thead><tbody>`;
      disciplina.filter(p => p.ammonizioni > 0 || p.espulsioni > 0).forEach(p => {
        html += `<tr style="border-bottom:1px solid var(--border);"><td style="padding:8px;">${p.nome} ${p.cognome}</td><td style="padding:8px;text-align:center;">${p.ammonizioni}</td><td style="padding:8px;text-align:center;">${p.espulsioni}</td><td style="padding:8px;text-align:center;font-weight:bold;color:#E74C3C;">${p.squalifiche > 0 ? p.squalifiche : '-'}</td></tr>`;
      });
      html += '</tbody></table></div></div>';
    }
    c.innerHTML = html;
  } catch (err) {
    c.innerHTML = '<div class="card"><p style="text-align:center;color:var(--gray);padding:20px;">Errore caricamento statistiche.</p></div>';
  }
}
