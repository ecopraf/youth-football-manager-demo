import { formatDate, formatDateShort, formatTime } from '../../utils/formatters';

export default async function loadDashboard() {
  const c = document.getElementById('pageContent');
  
  // Demo mode: usa i dati in memoria
  const isDemo = localStorage.getItem('yfm_demo_session') === 'active';
  
  // Usa i dati demo (sempre attivo in questo repo)
  const stats = window.YFM.demoStats || { punti: 0, partiteGiocate: 0, vittorie: 0, pareggi: 0, sconfitte: 0, golFatti: 0, golSubiti: 0, differenzaReti: 0 };
  const top = window.YFM.demoTopPlayers || { marcatori: [], assistmen: [], presenze: [] };
  const topValutazioni = { topGiocatori: [] };
  // Filtra partite future e passate
  const demoMatches = window.YFM.demoMatches || [];
  const futureMatches = demoMatches.filter(p => p.stato === 'Da disputare');
  const pastMatches = demoMatches.filter(p => p.stato === 'Terminata');
  const partiteFuture = futureMatches;
  // Aggiungi risultati alle stats (con nuovi campi)
  stats.risultati = pastMatches.map(m => ({
    id: m.id,
    avversario: m.avversario,
    luogo: m.luogo,
    dataOra: m.data_ora,
    golFatti: m.gol_casa,
    golSubiti: m.gol_trasferta,
    tipo_evento: m.tipo_evento || 'campionato',
    dettaglio_competizione: m.dettaglio_competizione,
    badge_avversario: m.badge_avversario
  }));
  
  const s = window.YFM.getSquadra();
  const prossimaPartita = partiteFuture && partiteFuture.length > 0 ? partiteFuture[0] : null;
  
  const hasEditAccess = window.YFM.isAdmin() || window.YFM.hasRole('allenatore');
  const convButton = hasEditAccess && prossimaPartita 
    ? '<button style="background:rgba(255,255,255,0.2);color:white;border:none;padding:10px 16px;border-radius:10px;cursor:pointer;font-weight:600;" onclick="window.YFM.openConvocation(\'' + prossimaPartita.id + '\')">👥 Convocazioni</button>'
    : '';
  
  const nuovaPartitaButton = hasEditAccess 
    ? '<button class="btn btn-primary" style="margin-top:12px;" onclick="window.YFM.navigateTo(\'calendar\')">+ Nuova Partita</button>'
    : '';
  
  const widgets = [
    { v:stats.punti, l:'Punti', c:'#27AE60' },
    { v:stats.partiteGiocate, l:'Giocate' },
    { v:stats.vittorie, l:'Vittorie', c:'#27AE60' },
    { v:stats.pareggi, l:'Pareggi', c:'#F39C12' },
    { v:stats.sconfitte, l:'Sconfitte', c:'#E74C3C' },
    { v:stats.golFatti, l:'Gol Fatti', c:'#27AE60' },
    { v:stats.golSubiti, l:'Gol Subiti' },
    { v:(stats.differenzaReti >= 0 ? '+' : '') + stats.differenzaReti, l:'Diff. Reti', c:stats.differenzaReti >= 0 ? '#27AE60' : '#E74C3C' }
  ];
  
  // Helper function for conditional sections
  const renderProssimaPartitaSection = () => {
    if (prossimaPartita) {
      const luogoHtml = prossimaPartita.luogo === 'Casa' ? ' · 🏠 Casa' : ' · ✈️ Trasferta';
      const compHtml = prossimaPartita.competizione ? ' · 🏆 ' + prossimaPartita.competizione : '';
      const btnHtml = convButton ? '<div style="margin-top:10px;">' + convButton + '</div>' : '';
      return '<div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:20px;margin-bottom:24px;color:white;border-radius:16px;box-shadow:0 8px 25px rgba(102,126,234,0.4);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">' +
        '<div>' +
        '<div style="font-size:11px;font-weight:600;opacity:0.9;text-transform:uppercase;margin-bottom:4px;">⏱ Prossima Partita</div>' +
        '<div style="font-size:18px;font-weight:bold;margin-bottom:4px;">' + prossimaPartita.avversario + '</div>' +
        '<div style="font-size:12px;opacity:0.9;">📅 ' + formatDate(prossimaPartita.data_ora) + ' · 🕐 ' + formatTime(prossimaPartita.data_ora) + luogoHtml + compHtml + '</div>' +
        '</div>' + btnHtml +
        '</div></div>';
    }
    const btnHtml = nuovaPartitaButton ? '<div style="margin-top:12px;">' + nuovaPartitaButton + '</div>' : '';
    return '<div style="padding:16px;margin-bottom:24px;text-align:center;border:2px dashed #ddd;border-radius:12px;">' +
      '<p style="color:var(--gray);margin:0;">📅 Nessuna partita in programma</p>' + btnHtml + '</div>';
  };

  // Create player box HTML
  const createPlayerBoxHtml = (giocatore, tipo, index) => {
    const medalEmojis = ['🥇', '🥈', '🥉'];
    const medal = medalEmojis[index] || (index + 1);
    const value = tipo === 'gol' ? giocatore.gol + ' Gol' : tipo === 'assist' ? giocatore.assist + ' Assist' : giocatore.presenze + ' Pres.';
    const bgColor = index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32';
    const bgEnd = index === 0 ? '#FFA500' : index === 1 ? '#A0A0A0' : '#8B4513';
    const playerName = giocatore.cognome + '. ' + (giocatore.nome ? giocatore.nome[0] : '');
    return '<div class="player-box" style="background:linear-gradient(180deg,' + bgColor + ' 0%,' + bgEnd + ' 100%);border-radius:16px;text-align:center;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px 8px;min-height:120px;" onclick="if(typeof loadPlayerDetail===\'function\') loadPlayerDetail(\'' + giocatore.id + '\',\'' + giocatore.nome + '\');">' +
      '<div style="font-size:28px;margin-bottom:8px;">' + medal + '</div>' +
      '<div style="font-size:14px;font-weight:bold;color:#fff;margin-bottom:6px;">' + playerName + '</div>' +
      '<div style="font-size:16px;font-weight:bold;color:#fff;">' + value + '</div></div>';
  };

  const createEmptyBoxHtml = () => '<div class="player-box" style="background:#e8e8e8;border-radius:16px;text-align:center;color:#aaa;display:flex;align-items:center;justify-content:center;min-height:120px;padding:16px 8px;">-</div>';

  // Render top players
  const renderTopSection = (title, players, tipo) => {
    const boxes = [];
    for (let i = 0; i < 3; i++) {
      boxes.push(players[i] ? createPlayerBoxHtml(players[i], tipo, i) : createEmptyBoxHtml());
    }
    return '<div class="top-section"><h3 class="top-section-title">' + title + '</h3><div class="players-row">' + boxes.join('') + '</div></div>';
  };
  
  // Render results
  const renderResults = () => {
    const risultati = (stats.risultati || []).slice(0, 5);
    if (risultati.length === 0) return '<p style="color:var(--gray);text-align:center;padding:20px;">Nessuna partita disputata</p>';
    
    const ultimi5 = risultati.slice(0, 5);
    // Calcola statistiche SOLO dalle partite visualizzate
    const gf5 = ultimi5.reduce((sum, r) => sum + (r.golFatti || 0), 0);
    const gs5 = ultimi5.reduce((sum, r) => sum + (r.golSubiti || 0), 0);
    const dr5 = gf5 - gs5;
    const vv5 = ultimi5.filter(r => (r.golFatti || 0) > (r.golSubiti || 0)).length;
    const pp5 = ultimi5.filter(r => (r.golFatti || 0) === (r.golSubiti || 0)).length;
    const ss5 = ultimi5.filter(r => (r.golFatti || 0) < (r.golSubiti || 0)).length;
    
    // Helper per badge competizione
    const getCompetitionBadge = (tipo) => {
      const badges = {
        campionato: { icon: '🏆', bg: '#e8f5e9', color: '#28a745', label: 'Campionato' },
        coppa: { icon: '🏅', bg: '#fff3e0', color: '#fd7e14', label: 'Coppa' },
        torneo: { icon: '🎯', bg: '#e3f2fd', color: '#007bff', label: 'Torneo' },
        amichevole: { icon: '🤝', bg: '#f5f5f5', color: '#6c757d', label: 'Amichevole' }
      };
      const badge = badges[tipo] || badges.campionato;
      return '<span style="display:inline-flex;align-items:center;gap:4px;background:' + badge.bg + ';color:' + badge.color + ';font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px;">' + badge.icon + ' ' + badge.label + '</span>';
    };
    
    // Colore risultato
    const getResultStyle = (gf, gs) => {
      if (gf > gs) return { bg: '#e8f5e9', color: '#28a745' }; // Vittoria - Verde
      if (gf < gs) return { bg: '#ffebee', color: '#dc3545' }; // Sconfitta - Rosso
      return { bg: '#fff8e1', color: '#b8860b' }; // Pareggio - Giallo scuro
    };
    
    // Trend con risultati
    const trendHtml = ultimi5.map(r => {
      const esito = r.golFatti > r.golSubiti ? 'V' : r.golFatti === r.golSubiti ? 'P' : 'S';
      const resStyle = getResultStyle(r.golFatti, r.golSubiti);
      return '<div style="text-align:center;"><span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:' + resStyle.color + ';color:white;font-size:12px;font-weight:bold;border-radius:8px;margin-bottom:4px;">' + esito + '</span><div style="font-size:10px;color:#aaa;">' + r.golFatti + '-' + r.golSubiti + '</div></div>';
    }).join('<span style="color:#ddd;margin:0 8px;align-self:center;">—</span>');
    
    const trendBox = '<div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:14px;padding:16px;margin-bottom:16px;">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
      '<span style="color:white;font-size:11px;font-weight:600;opacity:0.9;">ANDAMENTO ULTIME ' + ultimi5.length + '</span>' +
      '<span style="color:white;font-size:10px;opacity:0.8;">' + vv5 + 'V ' + pp5 + 'P ' + ss5 + 'S</span></div>' +
      '<div style="display:flex;align-items:center;justify-content:center;gap:4px;flex-wrap:wrap;margin-bottom:12px;">' + trendHtml + '</div>' +
      '<div style="display:flex;justify-content:center;gap:16px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.2);">' +
      '<div style="background:rgba(255,255,255,0.15);border-radius:10px;padding:8px 16px;text-align:center;min-width:60px;">' +
      '<div style="font-size:22px;font-weight:bold;color:white;">' + gf5 + '</div><div style="font-size:10px;color:rgba(255,255,255,0.8);">Gol Fatti</div></div>' +
      '<div style="background:rgba(255,255,255,0.15);border-radius:10px;padding:8px 16px;text-align:center;min-width:60px;">' +
      '<div style="font-size:22px;font-weight:bold;color:white;">' + gs5 + '</div><div style="font-size:10px;color:rgba(255,255,255,0.8);">Gol Subiti</div></div>' +
      '<div style="background:rgba(255,255,255,0.15);border-radius:10px;padding:8px 16px;text-align:center;min-width:60px;">' +
      '<div style="font-size:22px;font-weight:bold;color:' + (dr5 >= 0 ? '#4ade80' : '#f87171') + ';">' + (dr5 >= 0 ? '+' : '') + dr5 + '</div><div style="font-size:10px;color:rgba(255,255,255,0.8);">Diff. Reti</div></div></div></div>';
    
    // Lista partite - NUOVO LAYOUT: 2 righe per partita
    const matchesHtml = risultati.map(r => {
      const isCasa = r.luogo === 'Casa';
      const icon = isCasa ? '🏠' : '✈️';
      const dettaglioComp = r.dettaglio_competizione || 'G.' + String(r.giornata || '').padStart(2, '0');
      const resStyle = getResultStyle(r.golFatti, r.golSubiti);
      const badgeColor = r.badge_avversario || '#888';
      
      return '<div class="match-item" onclick="window.YFM.openMatchDetail(\'' + r.id + '\')" style="padding:0;background:#fafafa;border-radius:12px;margin-bottom:12px;overflow:hidden;border:1px solid #eee;">' +
        // Riga 1: Badge Competizione + Dettaglio | Data
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:linear-gradient(to right,#f8f9fa,#fff);border-bottom:1px solid #eee;">' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
        getCompetitionBadge(r.tipo_evento) +
        '<span style="font-size:11px;color:#667eea;font-weight:700;">' + dettaglioComp + '</span></div>' +
        '<span style="font-size:11px;color:#666;font-weight:500;">' + formatDateShort(r.dataOra) + '</span></div>' +
        // Riga 2: Avversario | Risultato
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px;">' +
        '<div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;">' +
        '<span style="font-size:12px;">' + icon + '</span>' +
        '<span style="font-size:13px;font-weight:500;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + r.avversario + '</span>' +
        '<span style="width:12px;height:12px;border-radius:50%;background:' + badgeColor + ';flex-shrink:0;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.2);"></span></div>' +
        '<div style="display:flex;align-items:center;gap:4px;">' +
        '<span style="font-size:16px;font-weight:800;color:' + resStyle.color + ';background:' + resStyle.bg + ';padding:6px 14px;border-radius:8px;">' + r.golFatti + ' - ' + r.golSubiti + '</span></div></div></div>';
    }).join('');
    
    return trendBox + matchesHtml;
  };
  
  // Render staff
  const renderStaff = () => {
    const roleLabels = {
      allenatore: 'Allenatore',
      allenatore2: 'Allenatore 2ª',
      dirigente: '1° Dirigente',
      dirigente2: '2° Dirigente',
      preparatore_atletico: 'Prep. Atl.',
      allenatore_portieri: 'All. Portieri'
    };
    const staffItems = ['allenatore','allenatore2','dirigente','dirigente2','preparatore_atletico','allenatore_portieri']
      .filter(r => s[r])
      .map(r => '<div class="staff-item"><span style="font-size:11px;font-weight:600;color:#667eea;min-width:90px;background:#f0f4ff;padding:4px 8px;border-radius:6px;">' + roleLabels[r] + '</span><span style="font-weight:500;font-size:14px;">' + s[r] + '</span></div>')
      .join('');
    const emptyMsg = !s.allenatore && !s.dirigente ? '<p style="color:var(--gray);text-align:center;padding:20px;">Nessuno staff registrato</p>' : '';
    return staffItems + emptyMsg;
  };
  
  // Build final HTML
  c.innerHTML = '<style>' +
    '.dash-widgets { display:grid; grid-template-columns:repeat(8,1fr); gap:10px; margin-bottom:24px; }' +
    '@media (max-width: 900px) { .dash-widgets { grid-template-columns: repeat(4, 1fr) !important; } }' +
    '@media (max-width: 600px) { .dash-widgets { grid-template-columns: repeat(4, 1fr) !important; } }' +
    '@media (max-width: 400px) { .dash-widgets { grid-template-columns: repeat(2, 1fr) !important; } }' +
    '.dash-card { background:white; padding:12px 6px; text-align:center; border-radius:12px; box-shadow:0 2px 10px rgba(0,0,0,0.08); }' +
    '.top-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:20px; }' +
    '@media (max-width: 900px) { .top-grid { grid-template-columns: 1fr !important; } }' +
    '.top-section { background:linear-gradient(180deg, #fff 0%, #f5f5f5 100%); padding:16px; border-radius:16px; box-shadow:0 4px 20px rgba(0,0,0,0.08); display:flex; flex-direction:column; }' +
    '.top-section-title { font-size:15px;font-weight:600;color:#333;margin:0 0 14px 0;display:flex;align-items:center;gap:8px; }' +
    '.players-row { display:flex; flex-direction:column; gap:8px; }' +
    '@media (max-width: 600px) { .players-row { flex-direction:row !important; gap:6px; } }' +
    '@media (max-width: 400px) { .players-row { flex-direction:row !important; gap:4px; } }' +
    '.player-box { flex:1; min-height:80px; }' +
    '@media (max-width: 600px) { .player-box { min-height:80px !important; padding:10px 4px !important; } .player-box > div:first-child { font-size:20px !important; } .player-box > div:nth-child(2) { font-size:11px !important; } .player-box > div:last-child { font-size:12px !important; } }' +
    '.bottom-grid { display:grid; gap:20px; grid-template-columns:1fr; }' +
    '@media (min-width: 900px) { .bottom-grid { grid-template-columns: 1.5fr 1fr !important; } }' +
    '.result-card { background:white; padding:16px; border-radius:16px; box-shadow:0 4px 20px rgba(0,0,0,0.08); }' +
    '.match-item { cursor:pointer; transition: all 0.2s ease; }' +
    '.match-item:hover { opacity: 0.9; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }' +
    '.staff-card { background:white; padding:16px; border-radius:16px; box-shadow:0 4px 20px rgba(0,0,0,0.08); }' +
    '.staff-item { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid #f0f0f0; }' +
    '</style>' +
    
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">' +
    '<div><h1 class="page-title">Dashboard ' + window.YFM.getSquadraName() + '</h1>' +
    '<p class="page-subtitle">Stagione 2025/26 · ' + stats.partiteGiocate + ' partite</p></div></div>' +
    
    renderProssimaPartitaSection() +
    
    '<div class="dash-widgets">' +
    widgets.map(w => '<div class="dash-card"><div style="font-size:20px;font-weight:bold;color:' + (w.c || 'var(--text)') + ';">' + w.v + '</div><div style="font-size:10px;color:var(--gray);margin-top:4px;">' + w.l + '</div></div>').join('') +
    '</div>' +
    
    '<div class="top-grid">' +
    renderTopSection('⚽ Top 3 Marcatori', (top.marcatori || []).slice(0, 3), 'gol') +
    renderTopSection('🅰️ Top 3 Assist', (top.assistmen || []).slice(0, 3), 'assist') +
    renderTopSection('🏃 Top 3 Presenze', (top.presenze || []).slice(0, 3), 'presenze') +
    '</div>' +
    
    '<div class="bottom-grid">' +
    '<div class="result-card"><h3 style="margin:0 0 14px 0;font-size:15px;color:#333;">📋 Ultimi Risultati</h3>' + renderResults() + '</div>' +
    '<div class="staff-card"><h3 style="margin:0 0 14px 0;font-size:15px;color:#333;">👥 Staff</h3><div>' + renderStaff() + '</div></div>' +
    '</div>';
}