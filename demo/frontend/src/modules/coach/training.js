/**
 * training.js - Orchestratore pagina Allenamenti
 * Assembla: Calendario mensile + Dettaglio seduta + Config + Riepilogo
 */

import { apiFetch } from '../../services/api';
import { showLoading, hideLoading } from '../../utils/ui';
import demoPersistence from '../demo/DemoPersistence';
import { renderCalendar, attachCalendarListeners, setOnDateSelect, selectTodayIfTraining, navigateToDate, getSelectedDate } from './trainingCalendar';
import { renderSession, attachSessionListeners } from './trainingSession';
import { renderConfig, renderSummary, attachConfigListeners } from './trainingConfig';

let trainingData = null;

export default async function loadTraining() {
  const c = document.getElementById('pageContent');
  c.innerHTML = '<div class="loading"><div class="spinner"></div>Caricamento...</div>';

  const isDemo = localStorage.getItem('yfm_demo_session') === 'active';

  if (isDemo) {
    await loadDemoData();
  } else {
    await loadApiData();
  }

  if (trainingData) {
    renderPage(c);
  }
}

// ═══════════════════════════════════════════════════════════════
// CARICAMENTO DATI
// ═══════════════════════════════════════════════════════════════

async function loadDemoData() {
  const tuttiGiocatori = window.YFM.allPlayers || [];

  // Inizializza storico allenamenti se non esiste
  demoPersistence.initTrainingHistory(tuttiGiocatori);

  // Usa i dati persistenti
  const allenamentiDemo = demoPersistence.data.training || window.YFM.demoAllenamenti || [];

  // Configurazione default o salvata
  const savedConfig = demoPersistence.data.trainingConfig;
  const config = savedConfig?.length > 0 ? savedConfig : [
    { id: 't1', giorno_settimana: 2, ora_inizio: '17:00', ora_fine: '19:00', luogo: 'Campo 1' },
    { id: 't2', giorno_settimana: 4, ora_inizio: '17:00', ora_fine: '19:00', luogo: 'Campo 1' },
    { id: 't3', giorno_settimana: 6, ora_inizio: '10:00', ora_fine: '12:00', luogo: 'Campo 1' }
  ];

  // Calcola summary presenze
  const summary = calculateSummary(allenamentiDemo, tuttiGiocatori, config);

  trainingData = {
    config,
    giocatori: tuttiGiocatori,
    allenamenti: allenamentiDemo,
    partite: window.YFM.demoMatches || [],
    summary: summary.perGiocatore,
    settimana: summary.settimana
  };
}

async function loadApiData() {
  try {
    const ts = Date.now();
    const [config, presenze, giocatori, sumData] = await Promise.all([
      apiFetch('/squadre/' + window.YFM.squadraId + '/allenamenti/config?_=' + ts).catch(() => []),
      apiFetch('/squadre/' + window.YFM.squadraId + '/allenamenti/presenze?_=' + ts).catch(() => []),
      apiFetch('/squadre/' + window.YFM.squadraId + '/calciatori?_=' + ts).catch(() => []),
      apiFetch('/squadre/' + window.YFM.squadraId + '/allenamenti/summary?_=' + ts).catch(() => ({ summary: {}, settimana: {} }))
    ]);

    window.YFM.allPlayers = giocatori;
    trainingData = {
      config,
      giocatori,
      allenamenti: presenze,
      partite: window.YFM.demoMatches || [],
      summary: sumData.summary || {},
      settimana: sumData.settimana || {}
    };
  } catch (e) {
    document.getElementById('pageContent').innerHTML = '<div class="error-box">' + e.message + '</div>';
  }
}

// ═══════════════════════════════════════════════════════════════
// CALCOLO SUMMARY
// ═══════════════════════════════════════════════════════════════

function calculateSummary(allenamenti, giocatori, config) {
  const giorniConfigurati = (config || []).map(c => c.giorno_settimana);
  const now = new Date();
  const inizioSett = new Date(now);
  inizioSett.setDate(now.getDate() - now.getDay() + 1);
  const fineSett = new Date(inizioSett);
  fineSett.setDate(inizioSett.getDate() + 6);

  const perGiocatore = {};
  giocatori.forEach(g => {
    perGiocatore[g.id] = { totali: 0, presenti: 0, assenti: 0, assentiSett: 0 };
  });

  (allenamenti || []).forEach(a => {
    const dataAllenamento = new Date(a.data);
    const giornoSett = dataAllenamento.getDay();
    if (!giorniConfigurati.includes(giornoSett)) return;

    const presIds = Array.isArray(a.presenze) ? a.presenze : [];
    const assIds = Array.isArray(a.assenti) ? a.assenti : [];

    giocatori.forEach(g => {
      perGiocatore[g.id].totali++;
      if (presIds.includes(g.id)) {
        perGiocatore[g.id].presenti++;
      } else if (assIds.includes(g.id)) {
        perGiocatore[g.id].assenti++;
        if (dataAllenamento >= inizioSett && dataAllenamento <= fineSett) {
          perGiocatore[g.id].assentiSett++;
        }
      } else {
        perGiocatore[g.id].presenti++;
      }
    });
  });

  return {
    perGiocatore,
    settimana: {
      da: inizioSett.toISOString().split('T')[0],
      a: fineSett.toISOString().split('T')[0],
      totale: giocatori.length
    }
  };
}

// ═══════════════════════════════════════════════════════════════
// RENDER PAGINA
// ═══════════════════════════════════════════════════════════════

function renderPage(c) {
  const { config, giocatori, allenamenti, partite, summary, settimana } = trainingData;

  // Seleziona oggi se è giorno di allenamento
  selectTodayIfTraining(config);

  // Callback quando un giorno viene selezionato nel calendario
  setOnDateSelect((date) => {
    renderSessionSection(date);
  });

  // Esponi refresh per il calendario (usato dalla navigazione mesi)
  window._trainingRefreshCalendar = () => {
    const calEl = document.getElementById('trainingCalendar');
    if (calEl) {
      calEl.innerHTML = renderCalendar(config, allenamenti, partite);
      attachCalendarListeners();
    }
  };

  let html = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
      <h1 class="page-title">Allenamenti ${window.YFM.getSquadraName()}</h1>
    </div>

    <!-- Calendario Mensile -->
    <div class="card" style="margin-bottom:16px;">
      <div id="trainingCalendar">
        ${renderCalendar(config, allenamenti, partite)}
      </div>
    </div>

    <!-- Dettaglio Seduta Selezionata -->
    <div class="card" style="margin-bottom:16px;" id="sessionContainer">
      ${renderSession(getSelectedDate(), trainingData, () => reloadPage())}
    </div>

    <!-- Settimana Tipo (collassabile) -->
    ${renderConfig(config)}

    <!-- Riepilogo Presenze -->
    ${renderSummary(giocatori, summary, settimana)}
  `;

  c.innerHTML = html;

  // Attach listeners
  attachCalendarListeners();
  attachSessionListeners(getSelectedDate(), trainingData, () => reloadPage());
  attachConfigListeners(trainingData, () => reloadPage());
}

// ═══════════════════════════════════════════════════════════════
// AGGIORNAMENTI PARZIALI
// ═══════════════════════════════════════════════════════════════

function renderSessionSection(date) {
  const container = document.getElementById('sessionContainer');
  if (!container) return;
  container.innerHTML = renderSession(date, trainingData, () => reloadPage());
  attachSessionListeners(date, trainingData, () => reloadPage());
}

function reloadPage() {
  loadTraining();
}
