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

  // ============ GIOCATORI ============

  /**
   * Aggiunge un nuovo giocatore
   */
  addPlayer(player) {
    if (!this.data[KEYS.PLAYERS]) {
      this.data[KEYS.PLAYERS] = [];
    }
    const newPlayer = {
      ...player,
      id: `pl_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.data[KEYS.PLAYERS].push(newPlayer);
    this._markDirty();
    return newPlayer;
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