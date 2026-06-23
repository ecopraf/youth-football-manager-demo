# Youth Football Manager - Contesto Progetto

## Stack Tecnico
- **Frontend**: Vite + JavaScript ES modules, deploy su Vercel
- **Backend**: Node.js/Express, deploy su Vercel
- **Database**: Supabase (PostgreSQL)
- **Autenticazione**: Auth Supabase (opzionale)

## Struttura Progetto
```
/frontend-v2/src/
  /modules/team/
    calendar.js       - Calendario partite (con archiviazione)
    distinta.js       - Distinta FIGC
    formazione.js     - Gestione formazione
    convocazioni.js   - Gestione convocazioni
    resultForm.js     - Inserimento eventi/risultato
    valutazioni.js    - Valutazioni giocatori
    playerDetail.js   - Scheda giocatore
    matchDetail.js    - Dettaglio partita con timeline
    noteAvversario.js - Note avversario
    roster.js         - Rosa giocatori
    squadre.js        - Gestione squadre
  /modules/coach/
    training.js       - Allenamenti e presenze
  /modules/performance/
    stats.js          - Statistiche disciplina
    reports.js        - Report partita/stagionale
  /modules/club/
    settings.js       - Impostazioni
    workspace.js      - Info società
  /services/api.js    - Chiamate API
  /utils/            - Formatters e UI utils
  main.js            - Entry point
  router.js          - Routing

/backend/api/index.js - Tutti gli endpoint API (v3.12)
```

## Tabelle DB Principali
- `calciatori` - Giocatori
- `rosa` - Associazione giocatori-squadra
- `squadra` - Squadre
- `stagione` - Stagioni sportive
- `workspace` - Società/club
- `partita` - Partite (con campo `archiviata`)
- `convocazione` - Convocazioni
- `formazione_partita` - Formazioni
- `evento_partita` - Eventi (GOAL, SUBITO, YELLOW, RED, ASSIST, IN, OUT)
- `valutazione_partita` - Valutazioni

## Regole Chat (da rispettare SEMPRE)
1. **Prima di ogni modifica**: Verificare struttura DB esistente con API Supabase
2. **Prima di ogni feature**: Creare PLAN dettagliato e validare con utente
3. **Endpoint**: Verificare se esistono già prima di crearne di nuovi
4. **Commit**: Sempre con messaggio descrittivo e push
5. **Documentazione**: Dopo ogni feature importante, aggiornare SEMPRE AGENTS.md e PROJECT_STATUS.md

---

## Flusso Logico: Calendario Partite

```
├── ⚽ PROSSIMA PARTITA (evidenziata in verde)
├── 📅 Prossime Partite (ordinate per data)
└── 🏆 Partite Giocate (ordinate per data DESC, con stile archivio)
```

### Logica Pulsanti Calendario

| Scenario | Pulsanti Visualizzati |
|----------|----------------------|
| **Futura senza risultato** | Formazione, Note, Convoca, Distinta, Edit, Elimina |
| **Futura con risultato** | Formazione, Note, Convoca, Distinta, ✏️ Eventi, Edit, Elimina |
| **Passata con risultato** | Formazione, Convoca, Distinta, 📦 Archivia, Edit, Elimina |
| **Passata archiviata** | Formazione, Convoca, Distinta, 🔓 Sblocca (stile grigio) |

### Logica Archiviazione
- **Campo**: `partita.archiviata` (boolean)
- **Pulsante Archivia**: visibile SOLO per partite passate con risultato
- **Dopo archiviazione**: stile visivo grigio (#8B7355), icona 📦, Edit/Elimina nascosti
- **Sblocca**: disponibile per riattivare modifiche

### Gestione Moduli (Formazione/Eventi/Convocazioni)
- **Non archiviata**: modal modificabile
- **Archiviata**: modal sola lettura con badge "📦 Partita Archiviata"

---

## Endpoint API principali

### Partite
- `GET /api/partite/:id/dettaglio` - Dettaglio con eventi e campo archiviata
- `PUT /api/partite/:id/archivia` - Archivia partita
- `PUT /api/partite/:id/sblocca` - Sblocca partita archiviata

### Formazione e Convocazioni
- `GET /api/partite/:id/formazione` - Formazione (array diretto)
- `POST /api/partite/:id/formazione` - Salva formazione
- `GET /api/partite/:id/convocazioni` - Convocazioni

### Eventi
- `POST /api/partite/:id/evento-item` - Inserisci singolo evento
- `POST /api/partite/:id/eventi-batch` - Inserisci batch eventi
- `DELETE /api/partite/:id/eventi-batch` - Elimina tutti eventi

### Valutazioni
- `GET /api/partite/:id/valutazioni` - Lista valutazioni
- `POST /api/partite/:id/valutazioni` - Salva batch valutazioni

---

## Roadmap MVP (Luglio-Settembre 2026)

### Target: MVP stabile entro metà Settembre 2026

| Fase | Contenuto | Scadenza |
|------|-----------|----------|
| **FASE 1** | Auth/Ruoli (Login, JWT, Admin/Allenatore/Staff) | 15 Luglio |
| **FASE 2** | Import CSV base (rosa, partite, eventi) | 15 Agosto |
| **FASE 3** | Import Tuttocampo (web scraping) | 1 Settembre |
| **FASE 4** | Centro Importazioni (log, duplicati, matching) | 15 Settembre |
| **FASE 5** | Polish, test, template repository | 15 Settembre |

### Milestone
- 15 Luglio 2026 → Auth completa
- 15 Agosto 2026 → Import base
- 1 Settembre 2026 → Import Tuttocampo
- 15 Settembre 2026 → **MVP STABILE**

### Checklist MVP (da completare)
- [ ] Login/Logout funzionante con JWT
- [ ] Ruoli: Admin, Allenatore, Staff con permessi
- [ ] Wizard import CSV (rosa, partite, eventi)
- [ ] Preview anteprima dati prima import
- [ ] Parser URL Tuttocampo
- [ ] Web scraping rosa/partite/marcatori
- [ ] Log storico importazioni
- [ ] Matching giocatori esistenti
- [ ] Template repository configurabile
- [ ] Documentazione admin e utente

---

## Task Completati ✅
- ✅ **Timeline Partita** - Vista minuto-per-minuto eventi in matchDetail.js
- ✅ **Archivia Partita** - Blocco modifiche per partite concluse
- ✅ **LIVE Indicator** - Pallino e scritta LIVE lampeggianti per partite in corso
- ✅ **Auth FASE 1** - Sistema ruoli, gestione utenti, link guest (commit 9f64064)

## Task Sospesi ⏸️
- ⏸️ **Valutazioni Giocatore** - Valutazioni tecniche per stagione/partita

## Ultime Modifiche (commit: ec7e280)
- Aggiunta regola documentazione dopo feature
- Fix logica Archivia Partita con UI corretta

## URL Applicazione
- **Frontend**: https://youth-football-manager.vercel.app
- **Backend**: https://youth-football-manager-backend.vercel.app
- **Repo**: https://github.com/ecopraf/youth-football-manager
