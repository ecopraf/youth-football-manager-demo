/**
 * trainingSessions.js - Pagina "Sedute"
 * Calendario mensile + dettaglio seduta del giorno selezionato
 */

import { showLoading, hideLoading } from '../../utils/ui';
import demoPersistence from '../demo/DemoPersistence';
import { renderCalendar, attachCalendarListeners, setOnDateSelect, selectTodayIfTraining, getSelectedDate } from './trainingCalendar';
import { renderSession, attachSessionListeners } from './trainingSession';
import { loadTrainingData } from './trainingData';

export default async function loadTrainingSessions() {
  const c = document.getElementById('pageContent');
  c.innerHTML = '<div class="loading"><div class="spinner"></div>Caricamento...</div>';

  const trainingData = await loadTrainingData();
  if (!trainingData) return;

  const { config, allenamenti, partite } = trainingData;

  selectTodayIfTraining(config);

  setOnDateSelect((date) => {
    const container = document.getElementById('sessionContainer');
    if (!container) return;
    container.innerHTML = renderSession(date, trainingData, () => loadTrainingSessions());
    attachSessionListeners(date, trainingData, () => loadTrainingSessions());
  });

  window._trainingRefreshCalendar = () => {
    const calEl = document.getElementById('trainingCalendar');
    if (calEl) {
      calEl.innerHTML = renderCalendar(config, allenamenti, partite);
      attachCalendarListeners();
    }
  };

  let html = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
      <h1 class="page-title">📋 Sedute - ${window.YFM.getSquadraName()}</h1>
    </div>
    <div class="card" style="margin-bottom:16px;">
      <div id="trainingCalendar">${renderCalendar(config, allenamenti, partite)}</div>
    </div>
    <div class="card" style="margin-bottom:16px;" id="sessionContainer">
      ${renderSession(getSelectedDate(), trainingData, () => loadTrainingSessions())}
    </div>
  `;

  c.innerHTML = html;
  attachCalendarListeners();
  attachSessionListeners(getSelectedDate(), trainingData, () => loadTrainingSessions());
}
