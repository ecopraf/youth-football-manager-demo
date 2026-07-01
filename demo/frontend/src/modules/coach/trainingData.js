/**
 * trainingData.js - Caricamento dati condiviso per le sotto-pagine allenamenti
 */

import { apiFetch } from '../../services/api';
import demoPersistence from '../demo/DemoPersistence';

/**
 * Carica e restituisce i dati training (config, giocatori, allenamenti, partite, summary)
 */
export async function loadTrainingData() {
  const isDemo = localStorage.getItem('yfm_demo_session') === 'active';

  if (isDemo) {
    return loadDemoData();
  } else {
    return loadApiData();
  }
}

function loadDemoData() {
  const tuttiGiocatori = window.YFM.allPlayers || [];
  demoPersistence.initTrainingHistory(tuttiGiocatori);

  const allenamentiDemo = demoPersistence.data.training || window.YFM.demoAllenamenti || [];

  const savedConfig = demoPersistence.data.trainingConfig;
  const config = savedConfig?.length > 0 ? savedConfig : [
    { id: 't1', giorno_settimana: 2, ora_inizio: '17:00', ora_fine: '19:00', luogo: 'Campo 1' },
    { id: 't2', giorno_settimana: 4, ora_inizio: '17:00', ora_fine: '19:00', luogo: 'Campo 1' },
    { id: 't3', giorno_settimana: 6, ora_inizio: '10:00', ora_fine: '12:00', luogo: 'Campo 1' }
  ];

  const summary = calculateSummary(allenamentiDemo, tuttiGiocatori, config);

  return {
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
    return {
      config,
      giocatori,
      allenamenti: presenze,
      partite: window.YFM.demoMatches || [],
      summary: sumData.summary || {},
      settimana: sumData.settimana || {}
    };
  } catch (e) {
    document.getElementById('pageContent').innerHTML = '<div class="error-box">' + e.message + '</div>';
    return null;
  }
}

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
