import { apiFetch } from '../../services/api';
import { formatDateShort, formatTime, getAvatarColor } from '../../utils/formatters';
import { showLoading, hideLoading } from '../../utils/ui';
import demoPersistence from '../demo/DemoPersistence';

let trainingData = null;

// Sync wrapper for localStorage persistence (synchronous for simplicity)
const Persist = {
  STORAGE_KEY: 'yfm_demo_persistence',
  get() {
    try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}'); } 
    catch { return {}; }
  },
  set(data) {
    try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data)); } 
    catch {}
  },
  markDirty() {
    // Re-save to trigger persistence
    this.set(this.get());
  }
};

export default async function loadTraining() {
  const c = document.getElementById('pageContent');
  c.innerHTML = '<div class="loading"><div class="spinner"></div>Caricamento...</div>';
  
  const isDemo = localStorage.getItem('yfm_demo_session') === 'active';
  
  let config, presenze, giocatori, sumData, materiale;
  
  if (isDemo) {
    const tuttiGiocatori = window.YFM.allPlayers || [];
    
    // Inizializza storico allenamenti se non esiste
    demoPersistence.initTrainingHistory(tuttiGiocatori);
    
    // Usa i dati persistenti
    let allenamentiDemo = demoPersistence.data.training || window.YFM.demoAllenamenti || [];
    
    // Configurazione default o salvata
    const savedConfig = demoPersistence.data.trainingConfig;
    config = savedConfig?.length > 0 ? savedConfig : [
      { id: 't1', giorno_settimana: 2, ora_inizio: '17:00', ora_fine: '19:00', luogo: 'Campo 1' },
      { id: 't2', giorno_settimana: 4, ora_inizio: '17:00', ora_fine: '19:00', luogo: 'Campo 1' },
      { id: 't3', giorno_settimana: 6, ora_inizio: '10:00', ora_fine: '12:00', luogo: 'Campo 1' }
    ];
    
    const numGiocatori = tuttiGiocatori.length;
    
    // Per ogni giocatore, conta presenze/assenti totali
    const summaryPerGiocatore = {};
    tuttiGiocatori.forEach(g => {
      summaryPerGiocatore[g.id] = { totali: 0, presenti: 0, assenti: 0, assentiSett: 0 };
    });
    
    // I giorni configurati
    const giorniConfigurati = config.map(c => c.giorno_settimana);
    
    // Settimana corrente (ultimi 7 giorni)
    const now = new Date();
    const inizioSett = new Date(now);
    inizioSett.setDate(now.getDate() - now.getDay() + 1);
    const fineSett = new Date(inizioSett);
    fineSett.setDate(inizioSett.getDate() + 6);
    
    // Processa ogni allenamento
    allenamentiDemo.forEach(a => {
      const dataAllenamento = new Date(a.data);
      const giornoSett = dataAllenamento.getDay();
      
      if (!giorniConfigurati.includes(giornoSett)) return;
      
      const presIds = Array.isArray(a.presenze) ? a.presenze : [];
      const assIds = Array.isArray(a.assenti) ? a.assenti : [];
      
      tuttiGiocatori.forEach(g => {
        summaryPerGiocatore[g.id].totali++;
        if (presIds.includes(g.id)) {
          summaryPerGiocatore[g.id].presenti++;
        } else if (assIds.includes(g.id)) {
          summaryPerGiocatore[g.id].assenti++;
          if (dataAllenamento >= inizioSett && dataAllenamento <= fineSett) {
            summaryPerGiocatore[g.id].assentiSett++;
          }
        } else {
          summaryPerGiocatore[g.id].presenti++;
        }
      });
    });
    
    // Converte allenamenti in presenze
    presenze = [];
    allenamentiDemo.forEach(a => {
      tuttiGiocatori.forEach(p => {
        const presente = a.presenze.includes(p.id);
        const assente = a.assenti.includes(p.id);
        presenze.push({
          id: `pr_${a.id}_${p.id}`,
          player_id: p.id,
          nome: p.nome,
          cognome: p.cognome,
          data: a.data,
          presente: presente,
          assenza_giustificata: assente && Math.random() > 0.5
        });
      });
    });
    
    giocatori = tuttiGiocatori;
    
    sumData = {
      summary: summaryPerGiocatore,
      settimana: {
        da: inizioSett.toISOString().split('T')[0],
        a: fineSett.toISOString().split('T')[0],
        totale: numGiocatori,
        presenti: Object.values(summaryPerGiocatore).reduce((s, g) => s + g.presenti, 0),
        assenti: Object.values(summaryPerGiocatore).reduce((s, g) => s + g.assenti, 0)
      }
    };
    
    materiale = [
      { id: 'm1', titolo: 'Paletti', descrizione: 'Paletti per esercitazioni', tipo: 'link', url: '#' },
      { id: 'm2', titolo: 'Coni', descrizione: 'Coni segnaletici', tipo: 'link', url: '#' },
      { id: 'm3', titolo: 'Palloni', descrizione: 'Palloni da allenamento', tipo: 'link', url: '#' },
      { id: 'm4', titolo: 'Sacchi porta goal', descrizione: 'Sacchi porta goal portatili', tipo: 'link', url: '#' }
    ];
    
    window.YFM.allPlayers = giocatori;
    trainingData = { config, presenze, giocatori, summary: sumData.summary || {}, settimana: sumData.settimana || {}, materiale: materiale || [], allenamenti: allenamentiDemo };
    renderTraining(c);
  } else {
    try {
      const ts = Date.now();
      [config, presenze, giocatori, sumData, materiale] = await Promise.all([
        apiFetch('/squadre/' + window.YFM.squadraId + '/allenamenti/config?_=' + ts).catch(() => []),
        apiFetch('/squadre/' + window.YFM.squadraId + '/allenamenti/presenze?_=' + ts).catch(() => []),
        apiFetch('/squadre/' + window.YFM.squadraId + '/calciatori?_=' + ts).catch(() => []),
        apiFetch('/squadre/' + window.YFM.squadraId + '/allenamenti/summary?_=' + ts).catch(() => ({ summary: {}, settimana: {} })),
        apiFetch('/squadre/' + window.YFM.squadraId + '/allenamenti/materiale?_=' + ts).catch(() => [])
      ]);
      
      window.YFM.allPlayers = giocatori;
      trainingData = { config, presenze, giocatori, summary: sumData.summary || {}, settimana: sumData.settimana || {}, materiale: materiale || [] };
      
      renderTraining(c);
    } catch (e) {
      c.innerHTML = '<div class="error-box">' + e.message + '</div>';
    }
  }
}

function renderTraining(c) {
  const d = trainingData;
  const { config, presenze, giocatori, summary, settimana, materiale } = d;
  const giorni = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  
  // Selettore date: solo giorni configurati
  const oggi = new Date();
  const oggiStr = oggi.toISOString().split('T')[0];
  const giorniConfigurati = (config || []).map(c => c.giorno_settimana);
  const oggiGiorno = oggi.getDay();
  let dateUniche = [...new Set(presenze.map(p => p.data))].sort().reverse();
  if (giorniConfigurati.includes(oggiGiorno) && !dateUniche.includes(oggiStr)) dateUniche.unshift(oggiStr);
  const savedDate = (sessionStorage.getItem('lastTrainingDate') && dateUniche.includes(sessionStorage.getItem('lastTrainingDate')))
    ? sessionStorage.getItem('lastTrainingDate')
    : (dateUniche[0] || oggiStr);
  
  let html = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
      <div><h1 class="page-title">Allenamenti ${window.YFM.getSquadraName()}</h1></div>
      <button class="btn btn-primary" id="btnAdd">+ Configura</button>
    </div>
    <div class="grid-2" style="margin-bottom:20px;">
      <!-- Settimana Tipo -->
      <div class="card">
        <h3 class="section-title">📅 Settimana Tipo</h3>
        ${config.length === 0
          ? '<p style="color:var(--gray);">Nessun allenamento configurato</p>'
          : config.map(c => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
              <div><strong>${giorni[c.giorno_settimana]}</strong> · ${formatTime(c.ora_inizio)}-${formatTime(c.ora_fine)}</div>
              <div style="font-size:13px;color:var(--gray);">${c.luogo || ''}</div>
              <div style="display:flex;gap:4px;">
                <button class="btn btn-secondary btn-small btn-edit-train" data-tid="${c.id}" data-g="${c.giorno_settimana}" data-i="${c.ora_inizio}" data-f="${c.ora_fine}" data-l="${c.luogo || ''}">✏️</button>
                <button class="btn btn-secondary btn-small btn-del" data-tid="${c.id}">🗑️</button>
              </div>
            </div>
          `).join('')}
      </div>
      
      <!-- Presenze Giornaliere -->
      <div class="card">
        <h3 class="section-title">📋 Presenze Giornaliere</h3>
        <select id="dataSelect" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;margin-bottom:12px;">
          ${dateUniche.length === 0
            ? '<option value="">-- Nessuna data disponibile --</option>'
            : dateUniche.map(d => `<option value="${d}" ${d === savedDate ? 'selected' : ''}>${formatDateShort(d)}</option>`).join('')}
        </select>
        ${dateUniche.length === 0
          ? '<p style="color:var(--gray);">Configura la settimana tipo per iniziare.</p>'
          : `<p style="margin-bottom:8px;">Segna <span style="color:#E74C3C;font-weight:600;">ASSENTE</span>:</p>
             <div id="presenzeList"></div>
             <button class="btn btn-primary" id="btnSavePres" style="margin-top:12px;">💾 Salva</button>`}
      </div>
    </div>
    
    <!-- Riepilogo -->
    <div class="card" style="margin-bottom:20px;">
      <h3 class="section-title">📊 Riepilogo <span style="font-size:12px;color:var(--gray);">(Sett. ${settimana.da ? formatDateShort(settimana.da) : '...'} - ${settimana.a ? formatDateShort(settimana.a) : '...'})</span></h3>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead><tr style="background:#F8F9FA;">
            <th style="padding:8px;">#</th><th style="padding:8px;">Calciatore</th><th style="padding:8px;">Tot.</th>
            <th style="padding:8px;color:#27AE60;">Pres.</th><th style="padding:8px;color:#E74C3C;">Ass.</th>
            <th style="padding:8px;">%</th><th style="padding:8px;color:#E74C3C;">Ass.Sett.</th>
          </tr></thead>
          <tbody>${[...giocatori].sort((a,b) => a.cognome.localeCompare(b.cognome)).map((g,i) => {
            const s = summary[g.id] || { totali:0, presenti:0, assenti:0, assentiSett:0 };
            const perc = s.totali > 0 ? Math.round((s.presenti / s.totali) * 100) : 0;
            return `<tr style="border-bottom:1px solid var(--border);">
              <td style="padding:8px;text-align:center;color:var(--gray);">${i+1}</td>
              <td style="padding:8px;">${g.nome} ${g.cognome}</td>
              <td style="padding:8px;text-align:center;">${s.totali}</td>
              <td style="padding:8px;text-align:center;color:#27AE60;">${s.presenti}</td>
              <td style="padding:8px;text-align:center;color:#E74C3C;">${s.assenti}</td>
              <td style="padding:8px;text-align:center;">${perc}%</td>
              <td style="padding:8px;text-align:center;color:#E74C3C;">${s.assentiSett}</td>
            </tr>`;
          }).join('')}</tbody>
        </table>
      </div>
    </div>
    
    <!-- Materiale -->
    <div class="card" style="margin-bottom:20px;">
      <h3 class="section-title">📁 Materiale Allenamenti</h3>
      ${materiale.length > 0
        ? '<div style="display:flex;flex-direction:column;gap:12px;">' + materiale.map(mat => {
            const icon = mat.tipo === 'pdf' ? '📄' : mat.tipo === 'video' ? '🎥' : '🔗';
            const btnLabel = mat.tipo === 'pdf' ? 'Visualizza PDF' : mat.tipo === 'video' ? 'Guarda Video' : 'Apri Link';
            const titolo = mat.titolo || 'Materiale senza titolo';
            const url = mat.url || '#';
            return `<div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:white;border:1px solid var(--border);border-radius:12px;">
              <div style="flex:1;">
                <div style="font-weight:600;margin-bottom:4px;">${icon} ${titolo}</div>
                ${mat.descrizione ? '<div style="font-size:13px;color:var(--gray);margin-bottom:6px;">' + mat.descrizione + '</div>' : ''}
                ${url !== '#' ? '<a href="' + url + '" target="_blank" class="btn btn-secondary btn-small">' + btnLabel + '</a>' : ''}
              </div>
              <button class="btn btn-secondary btn-small btn-del-mat" data-mid="${mat.id || mat._id || ''}">🗑️</button>
            </div>`;
          }).join('') + '</div>'
        : '<p style="color:var(--gray);">Nessun materiale caricato.</p>'}
      <button class="btn btn-primary btn-small" id="btnAddMateriale" style="margin-top:12px;">+ Aggiungi Materiale</button>
    </div>
  `;
  
  c.innerHTML = html;
  
  // Listener dopo il rendering
  attachListeners(savedDate);
}

function attachListeners(savedDate) {
  const d = trainingData;
  
  // Pulsante aggiungi configurazione
  const btnAdd = document.getElementById('btnAdd');
  if (btnAdd) btnAdd.addEventListener('click', openTrainingForm);
  
  // Pulsanti elimina/edit configurazione
  document.querySelectorAll('.btn-del').forEach(b => {
    b.addEventListener('click', async () => {
      if (!b.dataset.tid) return;
      
      if (isDemo) {
        demoPersistence.deleteTrainingConfig(b.dataset.tid);
        loadTraining();
      } else {
        await apiFetch('/allenamenti/config/' + b.dataset.tid, { method: 'DELETE' });
        loadTraining();
      }
    });
  });
  document.querySelectorAll('.btn-edit-train').forEach(b => {
    b.addEventListener('click', () => openTrainingForm(b.dataset.tid, b.dataset.g, b.dataset.i, b.dataset.f, b.dataset.l));
  });
  
  // Presenze
  if (d.presenze.length > 0 || d.config.length > 0) {
    sessionStorage.setItem('lastTrainingDate', savedDate);
  renderPresenzeForDate(savedDate);
    const dataSelect = document.getElementById('dataSelect');
    if (dataSelect) {
      dataSelect.addEventListener('change', function() {
        sessionStorage.setItem('lastTrainingDate', this.value);
        renderPresenzeForDate(this.value);
      });
    }
    
    const btnSave = document.getElementById('btnSavePres');
    if (btnSave) {
      btnSave.addEventListener('click', async () => {
        const date = document.getElementById('dataSelect').value;
        const presenzeData = [];
        document.querySelectorAll('#presenzeList .pres-check').forEach(cb => {
          presenzeData.push({
            calciatoreId: cb.dataset.pid,
            data: date,
            presente: cb.checked ? false : true,
            note: cb.checked ? 'Assente' : null
          });
        });
        
        const isDemo = localStorage.getItem('yfm_demo_session') === 'active';
        
        console.log('DEBUG: Dati da salvare:', presenzeData);
        showLoading();
        try {
          if (isDemo) {
            // Demo mode: salva in persistenza
            const presenti = presenzeData.filter(p => p.presente).map(p => p.calciatoreId);
            const assenti = presenzeData.filter(p => !p.presente).map(p => p.calciatoreId);
            
            // Raccogli motivi assenza
            const motiviAssenza = {};
            document.querySelectorAll('#presenzeList .motivo-select').forEach(sel => {
              if (sel.value) motiviAssenza[sel.dataset.pid] = sel.value;
            });
            
            // Trova l'allenamento per questa data o creane uno nuovo
            let allenamento = trainingData.allenamenti?.find(a => a.data === date);
            if (!allenamento) {
              allenamento = { 
                id: `tr_${Date.now()}`, 
                data: date, 
                tipo: 'Allenamento', 
                durata: 90, 
                presenze: presenti, 
                assenti: assenti, 
                motivi_assenza: motiviAssenza,
                note: '' 
              };
              demoPersistence.addTraining(allenamento);
              trainingData.allenamenti = demoPersistence.data.training;
            } else {
              allenamento.presenze = presenti;
              allenamento.assenti = assenti;
              allenamento.motivi_assenza = motiviAssenza;
              demoPersistence.saveTrainingPresence(allenamento.id, { presenti, assenti, motivi: motiviAssenza });
            }
            
            // Aggiorna i dati locali
            presenzeData.forEach(np => {
              const idx = trainingData.presenze.findIndex(p => p.calciatoreId === np.calciatoreId && p.data === np.data);
              if (idx >= 0) {
                trainingData.presenze[idx] = np;
              } else {
                trainingData.presenze.push(np);
              }
            });
            
            // Ricalcola summary usando lo stesso algoritmo del caricamento
            const config = trainingData.config || [];
            const giorniConfigurati = config.map(c => c.giorno_settimana);
            const now = new Date();
            const inizioSett = new Date(now);
            inizioSett.setDate(now.getDate() - now.getDay() + 1);
            const fineSett = new Date(inizioSett);
            fineSett.setDate(inizioSett.getDate() + 6);
            
            const summaryPerGiocatore = {};
            trainingData.giocatori.forEach(g => {
              summaryPerGiocatore[g.id] = { totali: 0, presenti: 0, assenti: 0, assentiSett: 0 };
            });
            
            trainingData.allenamenti.forEach(a => {
              const dataAllenamento = new Date(a.data);
              const giornoSett = dataAllenamento.getDay();
              if (!giorniConfigurati.includes(giornoSett)) return;
              
              const presIds = Array.isArray(a.presenze) ? a.presenze : [];
              const assIds = Array.isArray(a.assenti) ? a.assenti : [];
              
              trainingData.giocatori.forEach(g => {
                summaryPerGiocatore[g.id].totali++;
                if (presIds.includes(g.id)) {
                  summaryPerGiocatore[g.id].presenti++;
                } else if (assIds.includes(g.id)) {
                  summaryPerGiocatore[g.id].assenti++;
                  if (dataAllenamento >= inizioSett && dataAllenamento <= fineSett) {
                    summaryPerGiocatore[g.id].assentiSett++;
                  }
                } else {
                  summaryPerGiocatore[g.id].presenti++;
                }
              });
            });
            
            trainingData.summary = summaryPerGiocatore;
            trainingData.settimana = {
              da: inizioSett.toISOString().split('T')[0],
              a: fineSett.toISOString().split('T')[0],
              totale: trainingData.giocatori.length,
              presenti: Object.values(summaryPerGiocatore).reduce((s, g) => s + g.presenti, 0),
              assenti: Object.values(summaryPerGiocatore).reduce((s, g) => s + g.assenti, 0)
            };
            
            hideLoading();
            alert('✅ Presenze salvate in demo!');
            renderTraining(document.getElementById('pageContent'));
          } else {
            // Normal mode: salva su server
            var saved = 0;
            for (var i = 0; i < presenzeData.length; i++) {
              var p = presenzeData[i];
              // Get motivo for this player
              var select = document.querySelector('#presenzeList .motivo-select[data-pid="' + p.calciatoreId + '"]');
              var motivo = (select && !p.presente) ? select.value : '';
              try {
                await apiFetch('/squadre/' + window.YFM.squadraId + '/allenamenti/presenze', {
                  method: 'POST',
                  body: JSON.stringify({ calciatoreId: p.calciatoreId, data: p.data, presente: p.presente, motivo_assenza: motivo, note: p.note })
                });
                saved++;
              } catch(e) {
                console.error('Errore salvataggio giocatore:', p.calciatoreId, e);
              }
            }
            console.log('DEBUG: Salvati ' + saved + '/' + presenzeData.length + ' giocatori');
            // Aggiorna i dati locali immediatamente
            presenzeData.forEach(function(np) {
              var idx = trainingData.presenze.findIndex(function(p) {
                return p.calciatoreId === np.calciatoreId && p.data === np.data;
              });
              if (idx >= 0) {
                trainingData.presenze[idx] = np;
              } else {
                trainingData.presenze.push(np);
              }
            });
            hideLoading();
            // Ricarica solo il summary dal server
            try {
              var sumData = await apiFetch('/squadre/' + window.YFM.squadraId + '/allenamenti/summary?_=' + Date.now());
              trainingData.summary = sumData.summary || {};
              trainingData.settimana = sumData.settimana || {};
            } catch(e) { console.warn('Summary non aggiornato:', e); }
            // Ridisegna la UI con i dati aggiornati
            renderTraining(document.getElementById('pageContent'));
          }
        } catch (e) {
          hideLoading();
          console.error('DEBUG: Errore salvataggio:', e);
          alert('Errore durante il salvataggio: ' + e.message);
        }
      });
    }
  }
  
  // Materiale
  const btnMat = document.getElementById('btnAddMateriale');
  if (btnMat) btnMat.addEventListener('click', openMaterialeForm);
  document.querySelectorAll('.btn-del-mat').forEach(b => {
    b.addEventListener('click', async () => {
      await apiFetch('/allenamenti/materiale/' + b.dataset.mid, { method: 'DELETE' });
      loadTraining();
    });
  });
}

function renderPresenzeForDate(date) {
  const list = document.getElementById('presenzeList');
  if (!list) return;
  const giocatori = trainingData.giocatori;
  const presenze = trainingData.presenze;
  const allenamenti = trainingData.allenamenti || [];
  const allenamento = allenamenti.find(a => a.data === date);
  const motivi = allenamento?.motivi_assenza || {};
  const sorted = [...giocatori].sort((a, b) => a.cognome.localeCompare(b.cognome));
  
  const MOTIVI_ASSENZA = [
    { value: '', label: 'Nessun motivo' },
    { value: 'Impegni Scolastici', label: '📚 Impegni Scolastici' },
    { value: 'Motivi Familiari', label: '👨‍👩‍👧 Motivi Familiari' },
    { value: 'Infortunio', label: '🏥 Infortunio' },
    { value: 'Malattia', label: '🤒 Malattia' }
  ];
  
  list.innerHTML = sorted.map(g => {
    const p = presenze.find(x => x.calciatoreId === g.id && x.data === date);
    const assente = p && !p.presente;
    const motivoSelezionato = motivi[g.id] || '';
    
    return `
      <div class="convocation-item" style="flex-wrap:wrap;gap:8px;">
        <div style="display:flex;align-items:center;gap:8px;min-width:200px;">
          <input type="checkbox" ${assente ? 'checked' : ''} data-pid="${g.id}" class="pres-check" style="width:20px;height:20px;cursor:pointer;accent-color:#E74C3C;">
          <div class="player-avatar" style="width:32px;height:32px;font-size:12px;background:${getAvatarColor(g.nome)};">${g.nome[0]}${g.cognome[0]}</div>
          <span>${g.nome} ${g.cognome}</span>
        </div>
        <div style="display:flex;align-items:center;gap:4px;">
          <label style="font-size:11px;color:var(--gray);">Motivo:</label>
          <select data-pid="${g.id}" class="motivo-select" style="padding:4px 8px;border-radius:6px;border:1px solid var(--border);font-size:12px;${assente ? '' : 'opacity:0.5;'}" ${assente ? '' : 'disabled'}>
            ${MOTIVI_ASSENZA.map(m => `<option value="${m.value}" ${m.value === motivoSelezionato ? 'selected' : ''}>${m.label}</option>`).join('')}
          </select>
        </div>
      </div>`;
  }).join('');
  
  // Listener per abilitare/disabilitare dropdown in base a checkbox
  list.querySelectorAll('.pres-check').forEach(cb => {
    cb.addEventListener('change', () => {
      const pid = cb.dataset.pid;
      const select = list.querySelector(`.motivo-select[data-pid="${pid}"]`);
      if (select) {
        select.disabled = !cb.checked;
        select.style.opacity = cb.checked ? '1' : '0.5';
      }
    });
  });
}

function openTrainingForm(tid, g, i, f, l) {
  g = g || 1; i = i || '17:00'; f = f || '18:30'; l = l || '';
  const giorni = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  
  const content = `
    <div class="form-group" style="margin-bottom:12px;">
      <label>Giorno</label>
      <select id="tfG">${giorni.map((gn, ix) => `<option value="${ix}" ${parseInt(g) === ix ? 'selected' : ''}>${gn}</option>`).join('')}</select>
    </div>
    <div class="form-grid">
      <div class="form-group"><label>Inizio</label><input id="tfI" type="time" value="${i}"></div>
      <div class="form-group"><label>Fine</label><input id="tfF" type="time" value="${f}"></div>
    </div>
    <div class="form-group" style="margin-top:12px;"><label>Luogo</label><input id="tfL" value="${l}"></div>`;
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay'; modal.id = 'currentModal';
  modal.innerHTML = `<div class="modal-content" style="max-width:500px;">
    <div class="modal-header"><h2>${tid ? 'Modifica' : 'Nuovo'} Allenamento</h2><button class="modal-close-btn" id="modalCloseX">×</button></div>
    <div class="modal-body">${content}</div>
    <div class="modal-footer">
      <button class="btn btn-secondary modal-close-btn">Annulla</button>
      <button class="btn btn-primary" id="saveBtn">${tid ? 'Aggiorna' : 'Salva'}</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  
  const close = () => { const m = document.getElementById('currentModal'); if (m) m.remove(); };
  
  // Assicura che gli eventi siano aggiunti dopo il rendering
  setTimeout(() => {
    const closeBtn = document.getElementById('modalCloseX');
    const annullaBtn = document.getElementById('currentModal')?.querySelector('.modal-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (annullaBtn) annullaBtn.addEventListener('click', close);
    // Fallback: chiudi al click su overlay
    const modalEl = document.getElementById('currentModal');
    if (modalEl) {
      modalEl.addEventListener('click', e => { if (e.target === modalEl) close(); });
    }
  }, 50);
  
  document.getElementById('saveBtn').addEventListener('click', async () => {
    const isDemo = localStorage.getItem('yfm_demo_session') === 'active';
    const data = {
      id: tid || `cfg_${Date.now()}`,
      giorno_settimana: parseInt(document.getElementById('tfG').value),
      ora_inizio: document.getElementById('tfI').value,
      ora_fine: document.getElementById('tfF').value,
      luogo: document.getElementById('tfL').value
    };
    
    showLoading();
    try {
      if (isDemo) {
        // Demo mode: gestisci localmente
        demoPersistence.updateTrainingConfig(tid || `cfg_${Date.now()}`, data);
        alert(tid ? '✅ Configurazione aggiornata!' : '✅ Configurazione salvata!');
      } else if (tid) {
        await apiFetch('/allenamenti/config/' + tid, { method: 'PUT', body: JSON.stringify(data) });
      } else {
        await apiFetch('/squadre/' + window.YFM.squadraId + '/allenamenti/config', { method: 'POST', body: JSON.stringify(data) });
      }
      hideLoading();
      close();
      loadTraining();
    } catch (e) {
      hideLoading();
      alert('Errore: ' + e.message);
    }
  });
}

function openMaterialeForm() {
  const content = `
    <div class="form-group" style="margin-bottom:16px;"><label>Titolo *</label><input id="matTitolo" placeholder="Es. Esercizi riscaldamento"></div>
    <div class="form-group" style="margin-bottom:16px;"><label>Descrizione</label><input id="matDesc" placeholder="Breve descrizione"></div>
    <div class="form-group" style="margin-bottom:16px;"><label>Tipo</label><select id="matTipo"><option value="pdf">📄 PDF</option><option value="link">🔗 Link</option><option value="video">🎥 Video</option></select></div>
    <div class="form-group" style="margin-bottom:16px;"><label>URL *</label><input id="matUrl" placeholder="https://..."></div>`;
  
  const footer = '<button class="btn btn-secondary modal-close-btn">Annulla</button><button class="btn btn-primary" id="saveMatBtn">💾 Carica</button>';
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay'; modal.id = 'currentModal';
  modal.innerHTML = `<div class="modal-content" style="max-width:500px;"><div class="modal-header"><h2>Carica Materiale</h2><button class="modal-close-btn" id="modalCloseX">×</button></div><div class="modal-body">${content}</div><div class="modal-footer">${footer}</div></div>`;
  document.body.appendChild(modal);
  
  const close = () => { 
    const m = document.getElementById('currentModal'); 
    if (m) m.remove(); 
  };
  
  // Assicura che gli eventi siano aggiunti dopo il rendering
  setTimeout(() => {
    const closeBtn = document.getElementById('modalCloseX');
    const annullaBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (annullaBtn) annullaBtn.addEventListener('click', close);
  }, 10);
  
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  
  document.getElementById('saveMatBtn').addEventListener('click', async () => {
    const data = {
      titolo: document.getElementById('matTitolo').value,
      descrizione: document.getElementById('matDesc').value,
      tipo: document.getElementById('matTipo').value,
      url: document.getElementById('matUrl').value
    };
    if (!data.titolo || !data.url) { alert('Titolo e URL sono obbligatori.'); return; }
    showLoading();
    try {
      await apiFetch('/squadre/' + window.YFM.squadraId + '/allenamenti/materiale', { method: 'POST', body: JSON.stringify(data) });
      hideLoading();
      close();
      loadTraining();
    } catch (e) {
      hideLoading();
      alert('Errore: ' + e.message);
    }
  });
}
