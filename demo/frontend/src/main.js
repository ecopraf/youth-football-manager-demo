import './style.css'
import { setupLayout } from './components/layout/Sidebar'
import { initRouter } from './router'
import { loadWorkspaceInfo } from './modules/club/workspace'
import { loadSquadre } from './modules/team/squadre'
import { loadPlayerDetail } from './modules/team/playerDetail.js'
import { showWorkspaceSelectorModal, initWorkspaceSwitcherInSidebar, getSavedWorkspaceId, resetWorkspaceCache, getRealWorkspaces, loadAvailableWorkspaces, isSuperAdmin, saveCurrentWorkspace } from './modules/club/workspaceSwitcher'
import demoManager from './modules/demo/demo'
import demoPersistence from './modules/demo/DemoPersistence'
import { BUILD_INFO } from './build-info'

// Imposta build ID globale per la UI
window.YFM_BUILD_ID = BUILD_INFO.id

// Workspace demo
const DEMO_WORKSPACE_ID = '00000000-0000-0000-0000-000000000001';

// ═══════════════════════════════════════════════════════════════
// DATI DEMO IN MEMORIA (no API, no backend)
// ═══════════════════════════════════════════════════════════════
const DEMO_WORKSPACE = {
  id: '00000000-0000-0000-0000-000000000001',
  nome: 'ASD Green Academy',
  indirizzo: 'Via del Verde 1, Roma',
  telefono: '333 1234567',
  email: 'info@greenacademy.it'
};

const DEMO_SQUADRE = [
  { id: '00000000-0000-0000-0000-000000000010', nome: 'Green Academy', categoria: 'Under 19', allenatore: 'Marco Bianchi', dirigente: 'Luca Verdi' },
  { id: '00000000-0000-0000-0000-000000000011', nome: 'Green Academy', categoria: 'Under 17', allenatore: 'Roberto Rossi', dirigente: 'Paolo Gialli' }
];

// Partite demo
const DEMO_PARTITE = [
  // Prossime partite
  { id: 'm001', avversario: 'Roma Academy', luogo: 'Trasferta', data_ora: '2026-07-05T15:30:00', competizione: 'Campionato Primavera', stato: 'Da disputare', giornata: 16 },
  { id: 'm002', avversario: 'Lazio Youth', luogo: 'Casa', data_ora: '2026-07-12T16:00:00', competizione: 'Campionato Primavera', stato: 'Da disputare', giornata: 17 },
  // Partite terminate
  { id: 'm003', avversario: 'Inter Academy', luogo: 'Casa', data_ora: '2026-06-20T15:00:00', competizione: 'Campionato Primavera', stato: 'Terminata', gol_casa: 3, gol_trasferta: 1, giornata: 15 },
  { id: 'm004', avversario: 'Milan Youth', luogo: 'Trasferta', data_ora: '2026-06-13T15:00:00', competizione: 'Campionato Primavera', stato: 'Terminata', gol_casa: 2, gol_trasferta: 2, giornata: 14 },
  { id: 'm005', avversario: 'Juventus Academy', luogo: 'Casa', data_ora: '2026-06-06T15:00:00', competizione: 'Campionato Primavera', stato: 'Terminata', gol_casa: 4, gol_trasferta: 0, giornata: 13 },
  { id: 'm006', avversario: 'Napoli Academy', luogo: 'Trasferta', data_ora: '2026-05-30T15:00:00', competizione: 'Campionato Primavera', stato: 'Terminata', gol_casa: 1, gol_trasferta: 2, giornata: 12 },
  { id: 'm007', avversario: 'Fiorentina Youth', luogo: 'Casa', data_ora: '2026-05-23T15:00:00', competizione: 'Campionato Primavera', stato: 'Terminata', gol_casa: 5, gol_trasferta: 1, giornata: 11 },
];

// Eventi partite demo (gol, assist)
const DEMO_EVENTI = [
  // m003: Green 3-1 Inter
  { match_id: 'm003', player_id: 'c007', tipo: 'GOAL', minuto: 15 },
  { match_id: 'm003', player_id: 'c011', tipo: 'GOAL', minuto: 34 },
  { match_id: 'm003', player_id: 'c009', tipo: 'GOAL', minuto: 67 },
  { match_id: 'm003', player_id: 'c007', tipo: 'ASSIST', minuto: 67 },
  { match_id: 'm003', player_id: 'c011', tipo: 'ASSIST', minuto: 15 },
  // m003: Inter gol
  { match_id: 'm003', player_id: null, tipo: 'GOAL', minuto: 52, note: 'Inter' },
  // m004: Green 2-2 Milan
  { match_id: 'm004', player_id: 'c005', tipo: 'GOAL', minuto: 23 },
  { match_id: 'm004', player_id: 'c008', tipo: 'GOAL', minuto: 78 },
  { match_id: 'm004', player_id: 'c005', tipo: 'ASSIST', minuto: 78 },
  // m005: Green 4-0 Juventus
  { match_id: 'm005', player_id: 'c009', tipo: 'GOAL', minuto: 12 },
  { match_id: 'm005', player_id: 'c011', tipo: 'GOAL', minuto: 28 },
  { match_id: 'm005', player_id: 'c017', tipo: 'GOAL', minuto: 55 },
  { match_id: 'm005', player_id: 'c007', tipo: 'GOAL', minuto: 72 },
  { match_id: 'm005', player_id: 'c009', tipo: 'ASSIST', minuto: 72 },
  // m006: Green 1-2 Napoli
  { match_id: 'm006', player_id: 'c011', tipo: 'GOAL', minuto: 41 },
  // m007: Green 5-1 Fiorentina
  { match_id: 'm007', player_id: 'c007', tipo: 'GOAL', minuto: 8 },
  { match_id: 'm007', player_id: 'c011', tipo: 'GOAL', minuto: 19 },
  { match_id: 'm007', player_id: 'c009', tipo: 'GOAL', minuto: 35 },
  { match_id: 'm007', player_id: 'c017', tipo: 'GOAL', minuto: 58 },
  { match_id: 'm007', player_id: 'c020', tipo: 'GOAL', minuto: 81 },
  { match_id: 'm007', player_id: 'c007', tipo: 'ASSIST', minuto: 35 },
  { match_id: 'm007', player_id: 'c011', tipo: 'ASSIST', minuto: 58 },
];

// Statistiche demo
const DEMO_STATISTICHE = {
  punti: 34,
  partiteGiocate: 14,
  vittorie: 10,
  pareggi: 4,
  sconfitte: 0,
  golFatti: 38,
  golSubiti: 12,
  differenzaReti: 26
};

// Top players demo
const DEMO_TOP_PLAYERS = {
  marcatori: [
    { id: 'c011', nome: 'Giovanni', cognome: 'Marroni', gol: 12 },
    { id: 'c007', nome: 'Simone', cognome: 'Arancioni', gol: 9 },
    { id: 'c009', nome: 'Tommaso', cognome: 'Viola', gol: 7 },
    { id: 'c017', nome: 'Niccolò', cognome: 'Piombo', gol: 5 },
    { id: 'c020', nome: 'Marco', cognome: 'Marea', gol: 3 }
  ],
  assistmen: [
    { id: 'c007', nome: 'Simone', cognome: 'Arancioni', assist: 8 },
    { id: 'c011', nome: 'Giovanni', cognome: 'Marroni', assist: 6 },
    { id: 'c005', nome: 'Andrea', cognome: 'Neri', assist: 4 },
    { id: 'c009', nome: 'Tommaso', cognome: 'Viola', assist: 3 },
    { id: 'c008', nome: 'Federico', cognome: 'Rosa', assist: 2 }
  ],
  presenze: [
    { id: 'c002', nome: 'Luca', cognome: 'Bianchi', presenze: 14 },
    { id: 'c003', nome: 'Matteo', cognome: 'Verdi', presenze: 14 },
    { id: 'c005', nome: 'Andrea', cognome: 'Neri', presenze: 13 },
    { id: 'c007', nome: 'Simone', cognome: 'Arancioni', presenze: 13 },
    { id: 'c011', nome: 'Giovanni', cognome: 'Marroni', presenze: 12 }
  ]
};

// Calciatori U17
const DEMO_CALCIATORI_U17 = [
  { id: 'u001', nome: 'Leonardo', cognome: 'Ferrari', data_nascita: '2011-04-12', numero_maglia: 1, ruolo: 'Portiere', stato: 'Attivo', presenze: 8, gol: 0, assist: 0 },
  { id: 'u002', nome: 'Mattia', cognome: 'Esposito', data_nascita: '2011-02-28', numero_maglia: 2, ruolo: 'Difensore', stato: 'Attivo', presenze: 12, gol: 0, assist: 1 },
  { id: 'u003', nome: 'Alessandro', cognome: 'Romano', data_nascita: '2011-06-15', numero_maglia: 3, ruolo: 'Difensore', stato: 'Attivo', presenze: 11, gol: 1, assist: 0 },
  { id: 'u004', nome: 'Gabriele', cognome: 'Bruno', data_nascita: '2011-01-10', numero_maglia: 4, ruolo: 'Difensore', stato: 'Attivo', presenze: 10, gol: 0, assist: 0 },
  { id: 'u005', nome: 'Lorenzo', cognome: 'Colombo', data_nascita: '2011-08-22', numero_maglia: 5, ruolo: 'Centrocampista', stato: 'Attivo', presenze: 12, gol: 3, assist: 4 },
  { id: 'u006', nome: 'Andrea', cognome: 'Ricci', stato: 'Attivo', cognome: 'Ricci', data_nascita: '2011-03-05', numero_maglia: 6, ruolo: 'Centrocampista', presenze: 9, gol: 1, assist: 2 },
  { id: 'u007', nome: 'Filippo', cognome: ' Marino', data_nascita: '2011-07-18', numero_maglia: 7, ruolo: 'Attaccante', stato: 'Attivo', presenze: 11, gol: 8, assist: 5 },
  { id: 'u008', nome: 'Davide', cognome: 'Costa', data_nascita: '2011-05-30', numero_maglia: 8, ruolo: 'Centrocampista', stato: 'Attivo', presenze: 10, gol: 2, assist: 3 },
  { id: 'u009', nome: 'Tommaso', cognome: 'Rizzo', data_nascita: '2011-09-14', numero_maglia: 9, ruolo: 'Attaccante', stato: 'Attivo', presenze: 8, gol: 5, assist: 2 },
  { id: 'u010', nome: 'Nicolò', cognome: 'Conti', data_nascita: '2011-11-25', numero_maglia: 10, ruolo: 'Centrocampista', stato: 'Attivo', presenze: 12, gol: 4, assist: 6 },
  { id: 'u011', nome: 'Federico', cognome: 'De Luca', data_nascita: '2011-12-08', numero_maglia: 11, ruolo: 'Attaccante', stato: 'Attivo', presenze: 9, gol: 6, assist: 3 },
  { id: 'u012', nome: 'Giovanni', cognome: 'Moretti', data_nascita: '2011-04-20', numero_maglia: 12, ruolo: 'Portiere', stato: 'Attivo', presenze: 4, gol: 0, assist: 0 },
  { id: 'u013', nome: 'Manuel', cognome: 'Oliveira', data_nascita: '2011-02-14', numero_maglia: 13, ruolo: 'Difensore', stato: 'Attivo', presenze: 7, gol: 0, assist: 1 },
  { id: 'u014', nome: 'Stefano', cognome: 'Garcia', data_nascita: '2011-06-08', numero_maglia: 14, ruolo: 'Centrocampista', stato: 'Infortunato', presenze: 5, gol: 1, assist: 0 },
  { id: 'u015', nome: 'Edoardo', cognome: 'Silva', data_nascita: '2011-01-30', numero_maglia: 15, ruolo: 'Difensore', stato: 'Attivo', presenze: 8, gol: 0, assist: 0 }
];

// Partite U17
const DEMO_PARTITE_U17 = [
  { id: 'u001', avversario: 'Atalanta Jr', luogo: 'Casa', data_ora: '2026-07-08T16:00:00', competizione: 'Campionato Under 17', stato: 'Da disputare', giornata: 18 },
  { id: 'u002', avversario: 'Verona Youth', luogo: 'Trasferta', data_ora: '2026-07-15T15:30:00', competizione: 'Campionato Under 17', stato: 'Da disputare', giornata: 19 },
  { id: 'u003', avversario: 'Torino Academy', luogo: 'Casa', data_ora: '2026-06-22T15:00:00', competizione: 'Campionato Under 17', stato: 'Terminata', gol_casa: 2, gol_trasferta: 1, giornata: 17 },
  { id: 'u004', avversario: 'Sampdoria Youth', luogo: 'Trasferta', data_ora: '2026-06-15T15:00:00', competizione: 'Campionato Under 17', stato: 'Terminata', gol_casa: 1, gol_trasferta: 1, giornata: 16 },
  { id: 'u005', avversario: 'Genoa Academy', luogo: 'Casa', data_ora: '2026-06-08T15:00:00', competizione: 'Campionato Under 17', stato: 'Terminata', gol_casa: 3, gol_trasferta: 0, giornata: 15 }
];

// Formazioni U17
const DEMO_FORMAZIONI_U17 = {
  u003: {
    portiere: 'u001',
    difensori: ['u002', 'u003', 'u004', 'u013'],
    centrocampisti: ['u005', 'u008', 'u010'],
    attaccanti: ['u007', 'u011']
  },
  u004: {
    portiere: 'u012',
    difensori: ['u002', 'u004', 'u013', 'u015'],
    centrocampisti: ['u006', 'u008', 'u010'],
    attaccanti: ['u009', 'u011']
  },
  u005: {
    portiere: 'u001',
    difensori: ['u002', 'u003', 'u004', 'u015'],
    centrocampisti: ['u005', 'u008', 'u010'],
    attaccanti: ['u007', 'u009', 'u011']
  }
};

// Statistiche U17
const DEMO_STATISTICHE_U17 = {
  punti: 28,
  partiteGiocate: 12,
  vittorie: 8,
  pareggi: 4,
  sconfitte: 0,
  golFatti: 24,
  golSubiti: 8,
  differenzaReti: 16
};

// Top players U17
const DEMO_TOP_PLAYERS_U17 = {
  marcatori: [
    { id: 'u011', nome: 'Federico', cognome: 'De Luca', gol: 6 },
    { id: 'u007', nome: 'Filippo', cognome: 'Marino', gol: 8 },
    { id: 'u009', nome: 'Tommaso', cognome: 'Rizzo', gol: 5 },
    { id: 'u010', nome: 'Nicolò', cognome: 'Conti', gol: 4 },
    { id: 'u005', nome: 'Lorenzo', cognome: 'Colombo', gol: 3 }
  ],
  assistmen: [
    { id: 'u010', nome: 'Nicolò', cognome: 'Conti', assist: 6 },
    { id: 'u007', nome: 'Filippo', cognome: 'Marino', assist: 5 },
    { id: 'u005', nome: 'Lorenzo', cognome: 'Colombo', assist: 4 },
    { id: 'u008', nome: 'Davide', cognome: 'Costa', assist: 3 },
    { id: 'u011', nome: 'Federico', cognome: 'De Luca', assist: 3 }
  ],
  presenze: [
    { id: 'u002', nome: 'Mattia', cognome: 'Esposito', presenze: 12 },
    { id: 'u005', nome: 'Lorenzo', cognome: 'Colombo', presenze: 12 },
    { id: 'u010', nome: 'Nicolò', cognome: 'Conti', presenze: 12 },
    { id: 'u007', nome: 'Filippo', cognome: 'Marino', presenze: 11 },
    { id: 'u011', nome: 'Federico', cognome: 'De Luca', presenze: 9 }
  ]
};

// Convocazioni demo (per prossime partite)
const DEMO_CONVOCAZIONI = {
  m001: ['c001', 'c002', 'c003', 'c004', 'c005', 'c006', 'c007', 'c008', 'c009', 'c010', 'c011', 'c012', 'c013', 'c017', 'c018', 'c019', 'c020'],
  m002: ['c001', 'c002', 'c003', 'c004', 'c005', 'c006', 'c007', 'c008', 'c009', 'c010', 'c011', 'c012', 'c013', 'c014', 'c015', 'c017', 'c018', 'c020']
};

// Formazioni demo (solo partite passate con risultato)
const DEMO_FORMAZIONI = {
  m003: {
    portiere: 'c001',
    difensori: ['c002', 'c003', 'c004', 'c013'],
    centrocampisti: ['c005', 'c008', 'c010'],
    attaccanti: ['c007', 'c011']
  },
  m004: {
    portiere: 'c012',
    difensori: ['c002', 'c003', 'c004', 'c015'],
    centrocampisti: ['c005', 'c006', 'c018'],
    attaccanti: ['c007', 'c009']
  },
  m005: {
    portiere: 'c001',
    difensori: ['c002', 'c003', 'c004', 'c013'],
    centrocampisti: ['c005', 'c008', 'c014'],
    attaccanti: ['c009', 'c011', 'c017']
  },
  m006: {
    portiere: 'c012',
    difensori: ['c002', 'c003', 'c004', 'c015'],
    centrocampisti: ['c005', 'c006', 'c018'],
    attaccanti: ['c011', 'c020']
  },
  m007: {
    portiere: 'c001',
    difensori: ['c002', 'c003', 'c004', 'c013'],
    centrocampisti: ['c005', 'c008', 'c010'],
    attaccanti: ['c007', 'c009', 'c011']
  }
};

// Allenamenti demo (ultimi 4 allenamenti)
const DEMO_ALLENAMENTI = [
  { 
    id: 'a001', 
    data: '2026-06-26', 
    tipo: 'Tattico', 
    durata: 90,
    presenze: ['c001', 'c002', 'c003', 'c004', 'c005', 'c006', 'c007', 'c008', 'c009', 'c010', 'c011', 'c012', 'c013', 'c014', 'c015', 'c017', 'c018', 'c020'],
    assenti: ['c016', 'c019'],
    note: 'Esercizi su sviluppo gioco sulle fasce'
  },
  { 
    id: 'a002', 
    data: '2026-06-24', 
    tipo: 'Tecnico', 
    durata: 75,
    presenze: ['c001', 'c002', 'c003', 'c004', 'c005', 'c006', 'c007', 'c008', 'c010', 'c011', 'c012', 'c013', 'c014', 'c015', 'c016', 'c017', 'c018', 'c019', 'c020'],
    assenti: ['c009'],
    note: 'Passaggi e controllo palla'
  },
  { 
    id: 'a003', 
    data: '2026-06-21', 
    tipo: 'Atletico', 
    durata: 60,
    presenze: ['c001', 'c002', 'c003', 'c004', 'c005', 'c007', 'c008', 'c009', 'c010', 'c011', 'c012', 'c013', 'c015', 'c016', 'c017', 'c018', 'c020'],
    assenti: ['c006', 'c014', 'c019'],
    note: 'Circuiti di forza e resistenza'
  },
  { 
    id: 'a004', 
    data: '2026-06-19', 
    tipo: 'Partita a tema', 
    durata: 80,
    presenze: ['c001', 'c002', 'c003', 'c004', 'c005', 'c006', 'c007', 'c008', 'c009', 'c010', 'c011', 'c012', 'c013', 'c014', 'c017', 'c018', 'c019', 'c020'],
    assenti: ['c015', 'c016'],
    note: 'Situazioni di gioco su palla inattiva'
  }
];

const DEMO_CALCIATORI = [
  { id: 'c001', nome: 'Alessandro', cognome: 'Rossi', data_nascita: '2010-03-15', numero_maglia: 1, ruolo: 'Portiere', stato: 'Attivo', presenze: 10, gol: 0, assist: 0 },
  { id: 'c002', nome: 'Luca', cognome: 'Bianchi', data_nascita: '2010-01-20', numero_maglia: 2, ruolo: 'Difensore', stato: 'Attivo', presenze: 14, gol: 1, assist: 2 },
  { id: 'c003', nome: 'Matteo', cognome: 'Verdi', data_nascita: '2010-05-10', numero_maglia: 3, ruolo: 'Difensore', stato: 'Attivo', presenze: 14, gol: 0, assist: 1 },
  { id: 'c004', nome: 'Francesco', cognome: 'Gialli', data_nascita: '2010-02-28', numero_maglia: 4, ruolo: 'Difensore', stato: 'Attivo', presenze: 11, gol: 0, assist: 0 },
  { id: 'c005', nome: 'Andrea', cognome: 'Neri', data_nascita: '2010-07-14', numero_maglia: 5, ruolo: 'Centrocampista', stato: 'Attivo', presenze: 13, gol: 2, assist: 4 },
  { id: 'c006', nome: 'Davide', cognome: 'Blu', data_nascita: '2010-04-05', numero_maglia: 6, ruolo: 'Centrocampista', stato: 'Attivo', presenze: 10, gol: 1, assist: 1 },
  { id: 'c007', nome: 'Simone', cognome: 'Arancioni', data_nascita: '2010-06-22', numero_maglia: 7, ruolo: 'Attaccante', stato: 'Attivo', presenze: 13, gol: 9, assist: 8 },
  { id: 'c008', nome: 'Federico', cognome: 'Rosa', data_nascita: '2010-08-30', numero_maglia: 8, ruolo: 'Centrocampista', stato: 'Attivo', presenze: 12, gol: 2, assist: 2 },
  { id: 'c009', nome: 'Tommaso', cognome: 'Viola', data_nascita: '2010-09-12', numero_maglia: 9, ruolo: 'Attaccante', stato: 'Attivo', presenze: 11, gol: 7, assist: 3 },
  { id: 'c010', nome: 'Nicolò', cognome: 'Grigi', data_nascita: '2010-11-03', numero_maglia: 10, ruolo: 'Centrocampista', stato: 'Attivo', presenze: 9, gol: 1, assist: 2 },
  { id: 'c011', nome: 'Giovanni', cognome: 'Marroni', data_nascita: '2010-12-18', numero_maglia: 11, ruolo: 'Attaccante', stato: 'Attivo', presenze: 12, gol: 12, assist: 6 },
  { id: 'c012', nome: 'Riccardo', cognome: 'Celesti', data_nascita: '2010-03-25', numero_maglia: 12, ruolo: 'Portiere', stato: 'Attivo', presenze: 4, gol: 0, assist: 0 },
  { id: 'c013', nome: 'Filippo', cognome: 'Oro', data_nascita: '2010-01-08', numero_maglia: 13, ruolo: 'Difensore', stato: 'Attivo', presenze: 8, gol: 0, assist: 1 },
  { id: 'c014', nome: 'Edoardo', cognome: 'Argento', data_nascita: '2010-05-30', numero_maglia: 14, ruolo: 'Centrocampista', stato: 'Attivo', presenze: 6, gol: 0, assist: 0 },
  { id: 'c015', nome: 'Gabriele', cognome: 'Bronzo', data_nascita: '2010-07-11', numero_maglia: 15, ruolo: 'Difensore', stato: 'Attivo', presenze: 5, gol: 0, assist: 0 },
  { id: 'c016', nome: 'Lorenzo', cognome: 'Rame', data_nascita: '2010-02-14', numero_maglia: 16, ruolo: 'Portiere', stato: 'Attivo', presenze: 0, gol: 0, assist: 0 },
  { id: 'c017', nome: 'Niccolò', cognome: 'Piombo', data_nascita: '2010-10-07', numero_maglia: 17, ruolo: 'Attaccante', stato: 'Attivo', presenze: 10, gol: 5, assist: 2 },
  { id: 'c018', nome: 'Samuele', cognome: 'Zinco', data_nascita: '2010-04-28', numero_maglia: 18, ruolo: 'Centrocampista', stato: 'Attivo', presenze: 7, gol: 0, assist: 1 },
  { id: 'c019', nome: 'Antonio', cognome: 'Stagno', data_nascita: '2010-06-16', numero_maglia: 19, ruolo: 'Difensore', stato: 'Infortunato', presenze: 3, gol: 0, assist: 0 },
  { id: 'c020', nome: 'Marco', cognome: 'Marea', data_nascita: '2010-08-03', numero_maglia: 20, ruolo: 'Attaccante', stato: 'Attivo', presenze: 8, gol: 3, assist: 1 }
];

// Popola il select delle squadre
function populateSquadreSelect() {
  const sel = document.getElementById('squadraSelect');
  if (sel && window.YFM.allSquadre) {
    sel.innerHTML = window.YFM.allSquadre.map(s => 
      `<option value="${s.id}" ${s.id === window.YFM.squadraId ? 'selected' : ''}>${s.nome}${s.categoria ? ' ' + s.categoria : ''}</option>`
    ).join('');
    sel.addEventListener('change', e => {
      window.YFM.squadraId = e.target.value;
      loadSquadraData(e.target.value);
      window.YFM.navigateTo(window.YFM.currentPage);
    });
  }
}

// Carica i dati per la squadra selezionata
function loadSquadraData(squadraId) {
  const isU17 = squadraId === '00000000-0000-0000-0000-000000000011';
  
  if (isU17) {
    window.YFM.allPlayers = DEMO_CALCIATORI_U17;
    window.YFM.demoMatches = DEMO_PARTITE_U17;
    window.YFM.demoFormazioni = DEMO_FORMAZIONI_U17;
    window.YFM.demoStats = DEMO_STATISTICHE_U17;
    window.YFM.demoTopPlayers = DEMO_TOP_PLAYERS_U17;
    window.YFM.demoConvocazioni = {};
  } else {
    window.YFM.allPlayers = DEMO_CALCIATORI;
    window.YFM.demoMatches = DEMO_PARTITE;
    window.YFM.demoFormazioni = DEMO_FORMAZIONI;
    window.YFM.demoStats = DEMO_STATISTICHE;
    window.YFM.demoTopPlayers = DEMO_TOP_PLAYERS;
    window.YFM.demoConvocazioni = DEMO_CONVOCAZIONI;
  }
}

// Inizializzazione sessione demo con dati in memoria
function initDemoSession() {
  console.log('[MAIN] Init demo - ASD Green Academy');
  
  // Inizializza persistenza demo
  demoPersistence.init({
    matches: DEMO_PARTITE,
    events: DEMO_EVENTI,
    formations: DEMO_FORMAZIONI,
    convocations: DEMO_CONVOCAZIONI,
    training: DEMO_ALLENAMENTI,
    players: DEMO_CALCIATORI
  });
  
  // Imposta dati demo (sovrascrive qualsiasi workspace caricato)
  window.YFM.workspaceInfo = DEMO_WORKSPACE;
  window.YFM.allSquadre = DEMO_SQUADRE;
  window.YFM.squadraId = DEMO_SQUADRE[0].id; // Primavera
  
  // I dati vengono già impostati da demoPersistence._applyToWindow()
  // Ma sovrascriviamo per sicurezza se non ci sono dati persistenti
  if (!window.YFM.allPlayers || window.YFM.allPlayers.length === 0) {
    window.YFM.allPlayers = DEMO_CALCIATORI;
  }
  if (!window.YFM.demoMatches) {
    window.YFM.demoMatches = DEMO_PARTITE;
  }
  if (!window.YFM.demoEvents) {
    window.YFM.demoEvents = DEMO_EVENTI;
  }
  if (!window.YFM.demoFormazioni) {
    window.YFM.demoFormazioni = DEMO_FORMAZIONI;
  }
  if (!window.YFM.demoConvocazioni) {
    window.YFM.demoConvocazioni = DEMO_CONVOCAZIONI;
  }
  if (!window.YFM.demoAllenamenti) {
    window.YFM.demoAllenamenti = DEMO_ALLENAMENTI;
  }
  
  window.YFM.demoStats = DEMO_STATISTICHE;
  window.YFM.demoTopPlayers = DEMO_TOP_PLAYERS;
  
  // Riferimento alla persistenza
  window.YFM.demoPersistence = demoPersistence;
  
  // Aggiorna UI
  const wsName = document.getElementById('workspaceName');
  if (wsName) wsName.textContent = DEMO_WORKSPACE.nome;
  
  // Popola il select delle squadre
  populateSquadreSelect();
  
  // Inizializza demo manager
  demoManager.init();
  
  // Naviga alla dashboard
  window.YFM.navigateTo('dashboard');
}

// Inizializza oggetto globale
window.YFM = {
  squadraId: null,
  allSquadre: [],
  currentPage: 'dashboard',
  allPlayers: [],
  allMatches: [],
  workspaceInfo: null,
  guestToken: null,
  pageParams: null,
  apiBase: '' // Viene impostato dal backend
};

// Funzioni helper per squadra
window.YFM.getSquadraName = () => {
  const s = window.YFM.allSquadre.find(x => x.id === window.YFM.squadraId);
  return s ? s.nome + (s.categoria ? ' ' + s.categoria : '') : 'Squadra';
};
window.YFM.getSquadra = () => {
  return window.YFM.allSquadre.find(x => x.id === window.YFM.squadraId) || {};
};
window.YFM.getSocietaName = () => {
  return window.YFM.workspaceInfo ? window.YFM.workspaceInfo.nome : 'ASD';
};

// Funzioni globali per logout
window.YFM.handleLogout = function() {
  console.log('[LOGOUT] Starting...');
  localStorage.removeItem('yfm_token');
  localStorage.removeItem('yfm_user');
  localStorage.removeItem('yfm_guest');
  localStorage.removeItem('yfm_demo_session');
  localStorage.removeItem('yfm_demo_progress');
  localStorage.removeItem('yfm_active_workspace');
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('yfm_demo') || key.startsWith('demo_')) {
      localStorage.removeItem(key);
    }
  });
  if (window.demoManager) {
    ['demo-badge', 'demo-mission-panel', 'demo-welcome-overlay', 'demo-celebration',
     'demo-registration-overlay', 'demo-marketing-tooltip'].forEach(id => {
      document.getElementById(id)?.remove();
    });
  }
  // Resetta cache workspace switcher
  resetWorkspaceCache();
  window.location.href = '/landing.html';
};

// Funzioni globali per i moduli del calendario (caricate on-demand)
window.YFM.loadCalendar = async () => {
  const m = await import('./modules/team/calendar.js')
  await m.default()
}
window.YFM.openConvocation = async (mid, readOnly) => {
  const m = await import('./modules/team/convocazioni.js')
  m.openConvocation(mid, readOnly)
}
window.YFM.openDistinta = async (mid) => {
  const m = await import('./modules/team/distinta.js')
  m.openDistinta(mid)
}
window.YFM.openFormazioneForm = async (mid) => {
  const m = await import('./modules/team/formazione.js')
  m.openFormazioneForm(mid)
}
window.YFM.openNoteAvversario = async (mid) => {
  const m = await import('./modules/team/noteAvversario.js')
  m.openNoteAvversario(mid)
}
window.YFM.openMatchDetail = async (mid) => {
  const m = await import('./modules/team/matchDetail.js')
  m.openMatchDetail(mid)
}
window.YFM.openValutazioni = async (mid) => {
  const m = await import('./modules/team/valutazioni.js')
  m.openValutazioni(mid)
}
window.YFM.openResultForm = async (mid) => {
  const m = await import('./modules/team/resultForm.js')
  m.openResultForm(mid)
}
window.YFM.openPlayerDetail = function(playerId) {
  var c = document.getElementById('pageContent');
  if (!c) { console.error('pageContent non trovato'); return; }
  loadPlayerDetail(c, playerId);
};

document.addEventListener('DOMContentLoaded', () => {
  setupLayout();
  initRouter();

  // Check per guest link (URL: /guest/{token})
  const path = window.location.pathname;
  if (path.startsWith('/guest/')) {
    const token = path.split('/guest/')[1];
    if (token) {
      window.YFM.guestToken = token;
      window.YFM.navigateTo('guest');
      return;
    }
  }

  // Se già autenticato o demo
  const isAuth = window.YFM.isAuthenticated && window.YFM.isAuthenticated();
  const isDemo = window.YFM.isDemo && window.YFM.isDemo();

  if (isAuth || isDemo) {
    console.log('[MAIN] Auth:', isAuth, 'Demo:', isDemo);
    
    if (isDemo) {
      // Demo: usa dati in memoria (no API)
      initDemoSession();
    } else {
      // Utenti normali: carica dal backend
      loadAvailableWorkspaces().then(async (workspaces) => {
        const user = window.YFM.getUser();
        
        if (isSuperAdmin(user)) {
          // Superadmin: mostra selettore workspace iniziale SOLO se non c'è già una selezione
          const realWs = getRealWorkspaces(workspaces);
          const savedWsId = getSavedWorkspaceId();
          
          // Verifica se c'è già un workspace salvato
          const hasSavedWorkspace = savedWsId && realWs.find(w => w.id === savedWsId);
          
          if (!hasSavedWorkspace && realWs.length > 1) {
            // Mostra modal di selezione solo se non c'è selezione salvata e ci sono più workspace
            const selectedWs = await showWorkspaceSelectorModal();
            if (selectedWs) {
              saveCurrentWorkspace(selectedWs.id);
              window.YFM.workspaceInfo = selectedWs;
              window.YFM.activeWorkspaceId = selectedWs.id;
            }
          } else if (realWs.length === 1 || hasSavedWorkspace) {
            // Usa quello salvato o l'unico disponibile
            const wsToUse = hasSavedWorkspace 
              ? realWs.find(w => w.id === savedWsId) 
              : realWs[0];
            if (wsToUse) {
              saveCurrentWorkspace(wsToUse.id);
              window.YFM.workspaceInfo = wsToUse;
              window.YFM.activeWorkspaceId = wsToUse.id;
            }
          }
          
          // Inizializza switcher in sidebar
          setTimeout(() => initWorkspaceSwitcherInSidebar(), 100);
        } else {
          // Utente normale: usa il suo workspace_id dal profilo
          const userWorkspaceId = user?.workspace_id;
          if (userWorkspaceId) {
            const userWs = workspaces.find(w => w.id === userWorkspaceId);
            if (userWs) {
              window.YFM.workspaceInfo = userWs;
              window.YFM.activeWorkspaceId = userWs.id;
              console.log('[MAIN] Workspace utente:', userWs.nome);
            }
          }
        }
        
        await Promise.all([loadWorkspaceInfo(), loadSquadre()]);
        window.YFM.navigateTo('dashboard');
      }).catch(async () => {
        await Promise.all([loadWorkspaceInfo(), loadSquadre()]);
        window.YFM.navigateTo('dashboard');
      });
    }
  } else {
    window.YFM.navigateTo('login');
  }

  // ── LOGOUT DEMO - Resetta tutto ──
  window.YFM.logout = function() {
    // Rimuovi tutti i dati demo da localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('yfm_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Ricarica la pagina
    window.location.href = '/';
  };
});
