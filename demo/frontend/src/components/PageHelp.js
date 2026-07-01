/**
 * PageHelp.js - Sistema help contestuale per pagina
 * Bottone ? che apre un popover con guida azioni possibili
 */

const PAGE_HELP = {
  dashboard: {
    title: '📊 Dashboard',
    items: [
      'Panoramica risultati e statistiche squadra',
      'Clicca su una partita per vedere il dettaglio',
      'Top marcatori, assist e presenze in tempo reale',
      'Cambia squadra dal selettore in alto'
    ]
  },
  roster: {
    title: '👥 Rosa',
    items: [
      'Clicca su un giocatore per la scheda dettagliata',
      '+ Aggiungi per inserire nuovi giocatori',
      'Cerca per nome con la barra di ricerca',
      '⚠️ Alert automatici per certificati medici in scadenza'
    ]
  },
  calendar: {
    title: '📅 Calendario',
    items: [
      'Partite future e passate organizzate per data',
      'Clicca su una partita per dettaglio/formazione/risultato',
      '+ Nuova Partita per aggiungere al calendario',
      'Archivia le partite terminate per storico'
    ]
  },
  trainingSessions: {
    title: '📋 Sedute',
    items: [
      'Clicca un giorno con 🟢 per vedere la seduta',
      'Clicca un giorno vuoto per crearne una nuova',
      'Aggiungi fasi strutturate (riscaldamento, tecnica, tattica...)',
      'Salva come template per riutilizzare',
      '🔴 = giorno partita (non puoi creare sedute)'
    ]
  },
  trainingPresenze: {
    title: '🙋 Presenze',
    items: [
      'Seleziona un giorno dal calendario',
      'Spunta i giocatori assenti e indica il motivo',
      'Salva per aggiornare il riepilogo stagionale',
      'La tabella in basso mostra il totale presenze/assenze'
    ]
  },
  trainingSettings: {
    title: '⚙️ Impostazioni Allenamenti',
    items: [
      'Configura la settimana tipo (giorni e orari)',
      'Visualizza i template sedute salvati',
      'Elimina template non più necessari',
      'I template si creano dalla pagina Sedute'
    ]
  },
  stats: {
    title: '📊 Statistiche',
    items: [
      'Tabella completa con presenze, gol, assist, cartellini',
      'Clicca sulle colonne per riordinare',
      '⚠️ Alert diffidati (4 ammonizioni = prossimo giallo squalifica)',
      'Minutaggio calcolato automaticamente per categoria'
    ]
  },
  reports: {
    title: '📄 Report',
    items: [
      'Scegli tra report partita o stagionale',
      'Seleziona la partita e genera il report',
      'Stampa o salva in PDF con il pulsante dedicato',
      'Il report include formazione, eventi e statistiche'
    ]
  },
  formazione: {
    title: '⚽ Formazione',
    items: [
      'Scegli il modulo tattico dal selettore',
      'Trascina i giocatori sugli slot (desktop)',
      'Tap per selezionare e posizionare (mobile)',
      'Long-press su un giocatore per spostarlo liberamente',
      'I suggerimenti colorati indicano il ruolo ideale'
    ]
  }
};

let _helpVisible = false;

export function injectPageHelp(page) {
  // Rimuovi help precedente
  document.getElementById('page-help-btn')?.remove();
  document.getElementById('page-help-popover')?.remove();
  _helpVisible = false;

  const config = PAGE_HELP[page];
  if (!config) return;

  // Inject styles (una volta)
  if (!document.getElementById('page-help-styles')) {
    const style = document.createElement('style');
    style.id = 'page-help-styles';
    style.textContent = `
      #page-help-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #667eea;
        color: white;
        border: none;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 3px 12px rgba(102,126,234,0.4);
        z-index: 9990;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      #page-help-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 5px 18px rgba(102,126,234,0.5);
      }
      #page-help-popover {
        position: fixed;
        bottom: 66px;
        right: 20px;
        width: 280px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        z-index: 9991;
        overflow: hidden;
        animation: helpFadeIn 0.2s ease;
      }
      #page-help-popover .help-header {
        padding: 12px 16px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      #page-help-popover .help-header h4 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }
      #page-help-popover .help-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        opacity: 0.8;
      }
      #page-help-popover .help-close:hover { opacity: 1; }
      #page-help-popover .help-items {
        padding: 12px 16px;
        max-height: 240px;
        overflow-y: auto;
      }
      #page-help-popover .help-item {
        font-size: 13px;
        color: #334155;
        padding: 6px 0;
        border-bottom: 1px solid #f1f5f9;
        line-height: 1.4;
      }
      #page-help-popover .help-item:last-child { border-bottom: none; }
      #page-help-popover .help-item::before {
        content: '•';
        color: #667eea;
        font-weight: 700;
        margin-right: 8px;
      }
      @keyframes helpFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @media (max-width: 480px) {
        #page-help-popover { width: calc(100vw - 40px); right: 20px; }
      }
    `;
    document.head.appendChild(style);
  }

  // Crea bottone
  const btn = document.createElement('button');
  btn.id = 'page-help-btn';
  btn.textContent = '?';
  btn.title = 'Guida pagina';
  btn.addEventListener('click', () => toggleHelp(config));
  document.body.appendChild(btn);
}

function toggleHelp(config) {
  const existing = document.getElementById('page-help-popover');
  if (existing) {
    existing.remove();
    _helpVisible = false;
    return;
  }
  showHelp(config);
}

function showHelp(config) {
  const popover = document.createElement('div');
  popover.id = 'page-help-popover';
  popover.innerHTML = `
    <div class="help-header">
      <h4>${config.title}</h4>
      <button class="help-close" id="helpClose">×</button>
    </div>
    <div class="help-items">
      ${config.items.map(item => `<div class="help-item">${item}</div>`).join('')}
    </div>
  `;
  document.body.appendChild(popover);
  _helpVisible = true;

  popover.querySelector('#helpClose').addEventListener('click', () => {
    popover.remove();
    _helpVisible = false;
  });

  // Chiudi cliccando fuori
  setTimeout(() => {
    const closeOnOutside = (e) => {
      if (!popover.contains(e.target) && e.target.id !== 'page-help-btn') {
        popover.remove();
        _helpVisible = false;
        document.removeEventListener('click', closeOnOutside);
      }
    };
    document.addEventListener('click', closeOnOutside);
  }, 100);
}
