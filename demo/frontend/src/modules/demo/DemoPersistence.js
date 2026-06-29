/**
 * DemoPersistence - Gestisce la persistenza delle modifiche in modalità demo
 * Salva in localStorage per mantenere le modifiche tra un refresh e l'altro
 */

const STORAGE_KEY = 'yfm_demo_persistence';

// Chiavi per i vari tipi di dati
const KEYS = {
  MATCHES: 'matches',
  EVENTS: 'events',
  FORMATIONS: 'formations',
  CONVOCATIONS: 'convocations',
  TRAINING: 'training',
  TRAINING_CONFIG: 'trainingConfig',
  PLAYERS: 'players',
  CUSTOM_PLAYERS: 'customPlayers',
  MATCH_RESULTS: 'matchResults'
};

class DemoPersistence {
  constructor() {
    this.data = this._load();
    this.isDirty = false;
  }

  /**
   * Carica i dati dal localStorage
   */
  _load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error('[DemoPersistence] Errore caricamento:', e);
      return {};
    }
  }

  /**
   * Salva i dati nel localStorage
   */
  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      this.isDirty = false;
    } catch (e) {
      console.error('[DemoPersistence] Errore salvataggio:', e);
    }
  }

  /**
   * Segna i dati come modificati (salvataggio lazy)
   */
  _markDirty() {
    this.isDirty = true;
    // Auto-save dopo 500ms
    clearTimeout(this._saveTimeout);
    this._saveTimeout = setTimeout(() => this._save(), 500);
  }

  /**
   * Inizializza i dati demo di base se non esistono
   */
  init(demoData) {
    // Se non ci sono dati persistenti, usa quelli di default
    if (Object.keys(this.data).length === 0 && demoData) {
      this.data = {
        [KEYS.MATCHES]: demoData.matches ? [...demoData.matches] : [],
        [KEYS.EVENTS]: demoData.events ? [...demoData.events] : [],
        [KEYS.FORMATIONS]: demoData.formations ? { ...demoData.formations } : {},
        [KEYS.CONVOCATIONS]: demoData.convocations ? { ...demoData.convocations } : {},
        [KEYS.TRAINING]: demoData.training ? [...demoData.training] : [],
        [KEYS.PLAYERS]: demoData.players ? [...demoData.players] : [],
        [KEYS.MATCH_RESULTS]: {}
      };
      this._save();
    }
    
    // Aggiorna i dati correnti in window.YFM
    this._applyToWindow();
  }

  /**
   * Applica i dati persistenti a window.YFM
   */
  _applyToWindow() {
    if (window.YFM) {
      if (this.data[KEYS.MATCHES]) {
        window.YFM.demoMatches = this.data[KEYS.MATCHES];
      }
      if (this.data[KEYS.EVENTS]) {
        window.YFM.demoEvents = this.data[KEYS.EVENTS];
      }
      if (this.data[KEYS.FORMATIONS]) {
        window.YFM.demoFormazioni = this.data[KEYS.FORMATIONS];
      }
      if (this.data[KEYS.CONVOCATIONS]) {
        window.YFM.demoConvocazioni = this.data[KEYS.CONVOCATIONS];
      }
      if (this.data[KEYS.TRAINING]) {
        window.YFM.demoAllenamenti = this.data[KEYS.TRAINING];
      }
      if (this.data[KEYS.TRAINING_CONFIG]) {
        window.YFM.demoConfig = this.data[KEYS.TRAINING_CONFIG];
      }
      if (this.data[KEYS.PLAYERS]) {
        window.YFM.allPlayers = this.data[KEYS.PLAYERS];
      }
      if (this.data[KEYS.MATCH_RESULTS]) {
        // Applica i risultati alle partite
        const matches = window.YFM.demoMatches;
        if (matches) {
          Object.entries(this.data[KEYS.MATCH_RESULTS]).forEach(([matchId, result]) => {
            const match = matches.find(m => m.id === matchId);
            if (match) {
              match.gol_casa = result.golCasa;
              match.gol_trasferta = result.golOspiti;
              match.stato = result.archiviata ? 'Archiviata' : 'Terminata';
            }
          });
        }
      }
    }
  }

  /**
   * Pulisce tutti i dati persistenti
   */
  reset() {
    this.data = {};
    localStorage.removeItem(STORAGE_KEY);
  }

  // ============ PARTITE ============

  /**
   * Aggiorna/Salva il risultato di una partita
   */
  saveMatchResult(matchId, golCasa, golOspiti, archiviata = false) {
    if (!this.data[KEYS.MATCH_RESULTS]) {
      this.data[KEYS.MATCH_RESULTS] = {};
    }
    this.data[KEYS.MATCH_RESULTS][matchId] = {
      golCasa,
      golOspiti,
      archiviata,
      updatedAt: new Date().toISOString()
    };
    
    // Aggiorna anche i match
    if (this.data[KEYS.MATCHES]) {
      const match = this.data[KEYS.MATCHES].find(m => m.id === matchId);
      if (match) {
        match.gol_casa = golCasa;
        match.gol_trasferta = golOspiti;
        match.stato = archiviata ? 'Archiviata' : 'Terminata';
      }
    }
    
    this._markDirty();
  }

  /**
   * Archivia una partita
   */
  archiveMatch(matchId) {
    if (this.data[KEYS.MATCH_RESULTS]?.[matchId]) {
      this.data[KEYS.MATCH_RESULTS][matchId].archiviata = true;
    }
    if (this.data[KEYS.MATCHES]) {
      const match = this.data[KEYS.MATCHES].find(m => m.id === matchId);
      if (match) {
        match.archiviata = true;
        match.stato = 'Archiviata';
      }
    }
    this._markDirty();
  }

  /**
   * Sblocca una partita archiviata
   */
  unarchiveMatch(matchId) {
    if (this.data[KEYS.MATCH_RESULTS]?.[matchId]) {
      this.data[KEYS.MATCH_RESULTS][matchId].archiviata = false;
    }
    if (this.data[KEYS.MATCHES]) {
      const match = this.data[KEYS.MATCHES].find(m => m.id === matchId);
      if (match) {
        match.archiviata = false;
        match.stato = 'Terminata';
      }
    }
    this._markDirty();
  }

  // ============ FORMAZIONI ============

  /**
   * Salva la formazione di una partita
   */
  saveFormation(matchId, formation) {
    if (!this.data[KEYS.FORMATIONS]) {
      this.data[KEYS.FORMATIONS] = {};
    }
    this.data[KEYS.FORMATIONS][matchId] = {
      ...formation,
      updatedAt: new Date().toISOString()
    };
    this._markDirty();
  }

  /**
   * Ottiene la formazione di una partita
   */
  getFormation(matchId) {
    return this.data[KEYS.FORMATIONS]?.[matchId];
  }

  /**
   * Salva la lista delle riserve (giocatori convocati in panchina)
   */
  saveRiserve(matchId, riserveIds) {
    const formation = this.getFormation(matchId) || {};
    formation.riserve = riserveIds;
    this.saveFormation(matchId, formation);
  }

  /**
   * Ottiene la lista delle riserve per una partita
   */
  getRiserve(matchId) {
    const formation = this.getFormation(matchId);
    return formation?.riserve || [];
  }

  // ============ CONVOCAZIONI ============

  /**
   * Salva la lista convocati per una partita
   */
  saveConvocation(matchId, playerIds) {
    if (!this.data[KEYS.CONVOCATIONS]) {
      this.data[KEYS.CONVOCATIONS] = {};
    }
    this.data[KEYS.CONVOCATIONS][matchId] = {
      players: playerIds,
      updatedAt: new Date().toISOString()
    };
    this._markDirty();
  }

  /**
   * Ottiene la lista convocati per una partita
   */
  getConvocation(matchId) {
    return this.data[KEYS.CONVOCATIONS]?.[matchId]?.players || null;
  }

  // ============ EVENTI ============

  /**
   * Aggiunge un evento a una partita
   */
  addEvent(matchId, event) {
    if (!this.data[KEYS.EVENTS]) {
      this.data[KEYS.EVENTS] = [];
    }
    const newEvent = {
      ...event,
      id: `evt_${Date.now()}`,
      match_id: matchId,
      createdAt: new Date().toISOString()
    };
    this.data[KEYS.EVENTS].push(newEvent);
    this._markDirty();
    return newEvent;
  }

  /**
   * Rimuove un evento
   */
  removeEvent(eventId) {
    if (this.data[KEYS.EVENTS]) {
      this.data[KEYS.EVENTS] = this.data[KEYS.EVENTS].filter(e => e.id !== eventId);
      this._markDirty();
    }
  }

  /**
   * Ottiene gli eventi di una partita
   */
  getEvents(matchId) {
    return (this.data[KEYS.EVENTS] || []).filter(e => e.match_id === matchId);
  }

  // ============ ALLENAMENTI ============

  /**
   * Salva le presenze di un allenamento
   */
  saveTrainingPresence(trainingId, presences) {
    if (!this.data[KEYS.TRAINING]) {
      return;
    }
    const training = this.data[KEYS.TRAINING].find(t => t.id === trainingId);
    if (training) {
      training.presenze = presences.presenti || [];
      training.assenti = presences.assenti || [];
      training.motivi_assenza = presences.motivi || training.motivi_assenza || {};
      training.note = presences.note || training.note;
      training.updatedAt = new Date().toISOString();
      this._markDirty();
    }
  }

  /**
   * Aggiunge un nuovo allenamento
   */
  addTraining(training) {
    if (!this.data[KEYS.TRAINING]) {
      this.data[KEYS.TRAINING] = [];
    }
    const newTraining = {
      ...training,
      id: `tr_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.data[KEYS.TRAINING].unshift(newTraining);
    this._markDirty();
    return newTraining;
  }

  /**
   * Aggiorna la configurazione allenamenti
   */
  updateTrainingConfig(configId, configData) {
    if (!this.data[KEYS.TRAINING_CONFIG]) {
      this.data[KEYS.TRAINING_CONFIG] = [];
    }
    const idx = this.data[KEYS.TRAINING_CONFIG].findIndex(c => c.id === configId);
    if (idx >= 0) {
      this.data[KEYS.TRAINING_CONFIG][idx] = { ...this.data[KEYS.TRAINING_CONFIG][idx], ...configData };
    } else {
      this.data[KEYS.TRAINING_CONFIG].push({ ...configData, id: configId || `cfg_${Date.now()}` });
    }
    this._markDirty();
  }

  /**
   * Elimina una configurazione allenamento
   */
  deleteTrainingConfig(configId) {
    if (this.data[KEYS.TRAINING_CONFIG]) {
      this.data[KEYS.TRAINING_CONFIG] = this.data[KEYS.TRAINING_CONFIG].filter(c => c.id !== configId);
      this._markDirty();
    }
  }

  /**
   * Aggiunge motivo assenza a un giocatore per un allenamento
   */
  setAbsenceReason(trainingId, playerId, motivo) {
    if (!this.data[KEYS.TRAINING]) {
      return;
    }
    const training = this.data[KEYS.TRAINING].find(t => t.id === trainingId);
    if (training) {
      training.motivi_assenza = training.motivi_assenza || {};
      if (motivo) {
        training.motivi_assenza[playerId] = motivo;
      } else {
        delete training.motivi_assenza[playerId];
      }
      this._markDirty();
    }
  }

  /**
   * Inizializza dati pregressi allenamenti per demo
   */
  initTrainingHistory(giocatori) {
    // Versione dati per forzare rigenerazione se cambiata
    const DATA_VERSION = 2;
    
    // Reset se versione diversa o dati insufficienti
    if (this.data.trainingVersion !== DATA_VERSION || 
        !this.data[KEYS.TRAINING] || 
        this.data[KEYS.TRAINING].length < 30) {
      delete this.data[KEYS.TRAINING];
      this.data.trainingVersion = DATA_VERSION;
    } else {
      return; // Già ha dati aggiornati
    }
    
    const now = new Date();
    const tuttiId = giocatori.map(g => g.id);
    
    // Schema assenze predefinito (id giocatore -> frequenza assenze)
    // Giocatori con assenze frequenti (es. impegni scolastici, famiglia numerosa)
    const assenzeFrequenti = {
      2: 12,  // Marco Bianchi - impegni scolastici
      5: 8,   // Luca Russo - motivi familiari
      8: 6,   // Andrea Ferraro - impegni scolastici
      11: 10, // Giovanni Conti - motivi familiari
      14: 5,  // Matteo Fontana - infortuni
    };
    
    // Giocatori sempre presenti (alta affidabilità)
    const semprePresente = [1, 3, 6, 9, 12];
    
    // Motivi assenza per giocatore
    const motiviPerGiocatore = {
      2: ['Impegni Scolastici', 'Studio', 'Compiti'],
      5: ['Motivi Familiari', 'Assistenza familiare'],
      8: ['Impegni Scolastici', 'Ripetizioni'],
      11: ['Motivi Familiari', 'Compiti'],
      14: ['Infortunio', 'Recupero infortunio'],
    };
    
    const motiviDefault = ['Malattia', 'Impegni Scolastici', 'Motivi Familiari'];
    
    // Genera 30 settimane di storico (15 settimane per le due categorie)
    const allenamentiStorico = [];
    let sessionId = 1;
    
    for (let w = -30; w <= -1; w++) {
      const lunedi = new Date(now);
      lunedi.setDate(now.getDate() - now.getDay() + 1 + (w * 7));
      
      // Martedì e Giovedì per Under 17, Sabato per Under 19
      const configurazioni = w % 2 === 0 
        ? [{ giorno: 2, tipo: 'Under 17' }, { giorno: 4, tipo: 'Under 17' }]
        : [{ giorno: 6, tipo: 'Under 19' }];
      
      configurazioni.forEach(cfg => {
        const dataAllenamento = new Date(lunedi.getTime() + cfg.giorno * 24 * 60 * 60 * 1000);
        const dataStr = dataAllenamento.toISOString().split('T')[0];
        
        const assenti = [];
        const motivi = {};
        
        // Calcola assenze basate su schema predefinito
        tuttiId.forEach(id => {
          if (semprePresente.includes(id)) {
            // 10% probabilità di assenza anche per i semprepresenti
            if (Math.random() < 0.1) {
              assenti.push(id);
              motivi[id] = motiviDefault[Math.floor(Math.random() * motiviDefault.length)];
            }
          } else {
            // Calcola assenze basate su frequenza
            const freq = assenzeFrequenti[id] || 2;
            const prob = freq / 30; // 30 sessioni totali
            if (Math.random() < prob) {
              assenti.push(id);
              const mp = motiviPerGiocatore[id];
              motivi[id] = mp 
                ? mp[Math.floor(Math.random() * mp.length)] 
                : motiviDefault[Math.floor(Math.random() * motiviDefault.length)];
            }
          }
        });
        
        allenamentiStorico.push({
          id: `hist_tr_${sessionId}`,
          data: dataStr,
          tipo: cfg.tipo,
          durata: 90,
          presenze: tuttiId.filter(id => !assenti.includes(id)),
          assenti: assenti,
          motivi_assenza: motivi,
          note: ''
        });
        sessionId++;
      });
    }
    
    this.data[KEYS.TRAINING] = allenamentiStorico;
    this._markDirty();
  }

  // ============ GIOCATORI ============

  /**
   * Genera un UUID v4 valido
   */
  _generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Aggiunge un nuovo giocatore (con deduplicazione)
   * Salva i giocatori in una chiave separata basata sulla squadra corrente
   */
  addPlayer(player) {
    // Determina la chiave in base alla squadra
    const squadraId = window.YFM?.squadraId || 'default';
    const isU17 = squadraId === '00000000-0000-0000-0000-000000000011';
    const playersKey = isU17 ? 'customPlayers_U17' : 'customPlayers';
    
    if (!this.data[playersKey]) {
      this.data[playersKey] = [];
    }
    
    // Verifica se esiste già un giocatore con stesso nome/cognome/data_nascita
    const existingPlayer = this.data[playersKey].find(p => 
      p.nome?.toLowerCase() === player.nome?.toLowerCase() &&
      p.cognome?.toLowerCase() === player.cognome?.toLowerCase() &&
      p.data_nascita === player.data_nascita
    );
    
    if (existingPlayer) {
      // Aggiorna invece di creare duplicato
      return this.updateCustomPlayer(existingPlayer.id, player, playersKey);
    }
    
    const newPlayer = {
      ...player,
      id: this._generateUUID(),
      createdAt: new Date().toISOString()
    };
    this.data[playersKey].push(newPlayer);
    this._markDirty();
    return newPlayer;
  }
  
  /**
   * Aggiorna un giocatore personalizzato
   */
  updateCustomPlayer(playerId, updates, playersKey) {
    const index = this.data[playersKey]?.findIndex(p => p.id === playerId);
    if (index !== undefined && index !== -1) {
      this.data[playersKey][index] = {
        ...this.data[playersKey][index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this._markDirty();
      return this.data[playersKey][index];
    }
    return null;
  }

  /**
   * Aggiorna un giocatore esistente
   */
  updatePlayer(playerId, updates) {
    if (!this.data[KEYS.PLAYERS]) {
      return null;
    }
    const index = this.data[KEYS.PLAYERS].findIndex(p => p.id === playerId);
    if (index !== -1) {
      this.data[KEYS.PLAYERS][index] = {
        ...this.data[KEYS.PLAYERS][index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this._markDirty();
      return this.data[KEYS.PLAYERS][index];
    }
    return null;
  }

  /**
   * Rimuove un giocatore
   */
  removePlayer(playerId) {
    if (this.data[KEYS.PLAYERS]) {
      this.data[KEYS.PLAYERS] = this.data[KEYS.PLAYERS].filter(p => p.id !== playerId);
      this._markDirty();
    }
  }

  /**
   * Ottiene un giocatore per ID
   */
  getPlayer(playerId) {
    return this.data[KEYS.PLAYERS]?.find(p => p.id === playerId);
  }

  // ============ UTILITY ============

  /**
   * Forza il salvataggio immediato
   */
  flush() {
    this._save();
  }

  /**
   * Ottiene un riepilogo dei dati salvati
   */
  getStats() {
    return {
      matches: (this.data[KEYS.MATCHES] || []).length,
      events: (this.data[KEYS.EVENTS] || []).length,
      formations: Object.keys(this.data[KEYS.FORMATIONS] || {}).length,
      convocations: Object.keys(this.data[KEYS.CONVOCATIONS] || {}).length,
      training: (this.data[KEYS.TRAINING] || []).length,
      players: (this.data[KEYS.PLAYERS] || []).length,
      matchResults: Object.keys(this.data[KEYS.MATCH_RESULTS] || {}).length
    };
  }
}

// Esporta singleton
const demoPersistence = new DemoPersistence();
export default demoPersistence;