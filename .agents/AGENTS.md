# Youth Football Manager - AI Agent Workspace

> **Entry point per agenti AI** (OpenHands, Agent Canvas, Claude Code, etc.)

---

## 📁 Struttura Repository

```
.agents/                    # Configurazione agenti AI
├── AGENTS.md              # ← Questo file (entry point)
├── knowledge/             # Conoscenza del prodotto
│   ├── VISION.md          # Missione, valori, target
│   ├── ARCHITECTURE.md    # Stack, API, database
│   └── ROADMAP.md         # Backlog, priorità
├── standards/             # Convenzioni e regole
│   └── CODING_STANDARDS.md
├── tasks/                 # Template task
│   └── TEMPLATE.md
└── prompts/               # System prompts
    └── SYSTEM_PROMPT.md
```

---

## 🚀 Prima di Iniziare

### 1. Leggi i documenti di contesto
```
.agents/knowledge/VISION.md      → Cosa stiamo costruendo
.agents/knowledge/ARCHITECTURE.md → Come è fatto il sistema
.agents/knowledge/ROADMAP.md     → Cosa c'è da fare
.agents/standards/CODING_STANDARDS.md → Come scrivere codice
```

### 2. Verifica stato attuale
```bash
git log --oneline -3
git status
```

### 3. Consulta il system prompt
`.agents/prompts/SYSTEM_PROMPT.md`

---

## 📋 Info Progetto

| Info | Valore |
|------|--------|
| **Versione** | v3.14 |
| **Build ID** | `v3.14.<build-number>` (es. v3.14.1) |
| **Frontend** | Vite + JavaScript ES Modules |
| **Backend** | Node.js/Express + Supabase |
| **Deploy** | ⚠️ **MANUALE** - chiedere conferma all'utente |
| **Logo** | `/frontend-v2/public/assets/logo.png` |

---

## 🔗 Link Utili

- **App**: https://youth-football-manager.vercel.app
- **Backend API**: https://youth-football-manager-backend.vercel.app/api
- **Repo**: https://github.com/ecopraf/youth-football-manager

---

## 📖 Documentazione Dettagliata

| Documento | Descrizione |
|-----------|-------------|
| `.agents/knowledge/VISION.md` | Missione, valori, modello business |
| `.agents/knowledge/ARCHITECTURE.md` | Stack, struttura, API, DB |
| `.agents/knowledge/ROADMAP.md` | Backlog, priorità, bug noti |
| `.agents/standards/CODING_STANDARDS.md` | Convenzioni codice, naming, git |
| `.agents/prompts/SYSTEM_PROMPT.md` | System prompt per agenti |
| `.agents/tasks/TEMPLATE.md` | Template per task |

---

## 🗄️ Schema Database

| Tabella | Descrizione |
|---------|-------------|
| `workspace` | Società/club |
| `stagione` | Stagione sportiva |
| `squadra` | Squadra |
| `calciatore` | Giocatore |
| `rosa` | Associazione giocatore-squadra |
| `partita` | Partita |
| `evento_partita` | Eventi (GOAL, ASSIST, YELLOW, etc.) |
| `convocazione` | Convocazioni |
| `formazione_partita` | Formazione |
| `valutazione_partita` | Valutazioni |
| `utente` | Utente sistema |
| `guest_token` | Token guest |

---

## 🔧 Workflow Raccomandato

### Per nuove feature:
```
1. Leggi .agents/knowledge/ per contesto
2. Pianifica modifiche
3. Implementa seguendo standards
4. Testa locally
5. Commit: git add . && git commit -m "tipo: descrizione"
6. Push: git push origin main
7. Verifica produzione (~2 min dopo)
```

### Per bug fix:
```
1. Riproduci il bug
2. Identifica causa
3. Implementa fix minima
4. Verifica fix
5. Commit + Push
```

---

## ⚠️ Regole Importanti

- **NON modificare**: `frontend-v2/src/build-info.js` (auto-generato)
- **NON hardcodare**: credenziali, API keys
- **Deploy**: ** MANUALE** - chiedere SEMPRE conferma prima del deploy su Vercel
- **Build ID**: `v3.14.<build-number>` (generato automaticamente)

### 🔐 Credenziali Supabase (persistenti)

```
SUPABASE_URL=https://csxdlxbhcnyfppojwwzy.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzeGRseGJoY255ZnBwb2p3d3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NTEzMTMsImV4cCI6MjA5NzMyNzMxM30.KTL6Z_Mwo_QzNidWt95YLqc7ZvdbfxyQdzxCT5uNRIw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzeGRseGJoY255ZnBwb2p3d3p5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTc1MTMxMywiZXhwIjoyMDk3MzI3MzEzfQ.HZXGk1Xfz0EvSqewAoSCcgZ6gIQYLOP-54mE3YVHgBo
JWT_SECRET=aEj1OXdTHxSHD8iObjFov1jJ06RoyM1Ormf8KBb0uPI=
```

### 📡 Query Rapide Supabase
```bash
# Query tabella
curl -s 'https://csxdlxbhcnyfppojwwzy.supabase.co/rest/v1/workspace?select=*' \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

### Modifiche Database
1. **Usa le API esistenti** quando possibili
2. **Se l'API non esiste**: fornisci query SQL dettagliate
3. **Prima di modificare**: verifica lo schema con `SELECT * FROM ... LIMIT 1`

### Modifiche Frontend
1. Segui CODING_STANDARDS.md per stile
2. Non modificare file generati automaticamente (`build-info.js`)
3. Testa responsive su mobile

### Modifiche Backend
1. Mantieni compatibilità con versioni precedenti
2. Aggiungi validazione input
3. Gestisci errori con messaggi user-friendly

### Deploy
1. **NON fare deploy automatico su push** - l'utente preferisce testare prima in locale
2. **Chiedere SEMPRE conferma prima del deploy**: "Posso procedere con il deploy su Vercel?"
3. Dopo ogni feature: commit + push + chiedi conferma deploy
4. Verifica con `curl https://.../api/health`

---

## Workflow Raccomandato

### Per Nuove Feature

```
1. ANALISI
   - Leggi VISION e ROADMAP
   - Identifica file da modificare
   - Verifica se esiste già l'API/funzionalità

2. PIANIFICAZIONE
   - Crea task list
   - Valida con utente se complessa

3. IMPLEMENTAZIONE
   - Segui CODING_STANDARDS
   - Commit frequenti con messaggi descrittivi

4. VERIFICA
   - Build locale: npm run build
   - Test manuale se possibile
   - Verifica API con curl

5. DEPLOY
   - Commit + Push su main
   - **Chiedi conferma all'utente** prima di fare deploy su Vercel
   - Solo dopo OK dell'utente: esegui deploy
   - Attendi ~2 minuti
   - Verifica produzione
```

### Per Bug Fix

```
1. RIPRODUCI
   - Identifica i passaggi per replicare il bug
   
2. ANALIZZA
   - Leggi il codice rilevante
   - Verifica log browser console
   - Testa API con curl

3. FIX
   - Implementa la correzione minima
   - Non introduurre nuovi bug

4. VERIFICA
   - Testa la fix
   - Verifica non abbia impatto su altre parti

5. COMMIT
   - Messaggio: "fix: <breve descrizione bug>"
   - Push
```

---

## Checklist Prima di Commit

- [ ] Codice segue CODING_STANDARDS
- [ ] Build locale passa (`npm run build`)
- [ ] Nessun `console.log` left-over in produzione
- [ ] Variabili d'ambiente non hardcoded
- [ ] Accessibilità rispettata (title su icone)
- [ ] Errori gestiti con messaggi user-friendly

---

## Comandi Utili

```bash
# Setup locale
git clone https://github.com/ecopraf/youth-football-manager.git
cd youth-football-manager
cd frontend-v2 && npm install && npm run build

# Backend locale (se necessario)
cd backend && npm install && node api/index.js

# Verifica build
npm run build
# Output: Build ID: v3.14.X

# Commit e push (NO deploy automatico)
git add .
git commit -m "tipo: descrizione"
git push origin main

# ⚠️ DEPLOY: Chiedere SEMPRE conferma all'utente prima di procedere!
# Solo dopo OK: vercel --prod --yes

# Verifica produzione
curl https://youth-football-manager-backend.vercel.app/api/health
```

---

## File Sensibili

### NON MODIFICARE MAI
- `frontend-v2/src/build-info.js` (generato automaticamente)
- `frontend-v2/dist/` (output build)
- `node_modules/` (dipendenze)
- File con credenziali (`.env`)

### Variabili d'Ambiente
Le credenziali sono in AGENTS.md (repository context). Non esporle mai.

---

## Contesto Multi-Workspace

Il sistema supporta **multi-tenant**: ogni workspace è una società sportiva isolata.

**Regole**:
- Tutte le query includono `workspace_id`
- API `/auth/workspaces` per ottenere squadre utente
- Dati Demo vs ASD Albalonga sono workspace separati

---

## Convenzioni API

### Risposte
```javascript
// Successo
{ success: true, data: {...} }

// Errore
{ success: false, error: 'Messaggio' }
```

### Endpoint Standard
```
GET    /api/<risorsa>           → Lista
GET    /api/<risorsa>/:id       → Dettaglio
POST   /api/<risorsa>           → Crea
PUT    /api/<risorsa>/:id       → Modifica
DELETE /api/<risorsa>/:id       → Elimina
```

---

## Design System

### Colori
```css
--primary: #667eea
--success: #27AE60
--warning: #F39C12
--danger: #E74C3C
--text: #333333
```

### Border Radius
- Card: 12px
- Card gradient: 16px
- Bottoni: 10px
- Input: 8px

### Effetti Hover
```css
.card:hover {
  transform: translateY(-8px) scale(1.03);
  box-shadow: 0 15px 30px rgba(0,0,0,0.2);
}
```

---

## Contatti e Credenziali

- **Email**: youthfootballmanager@gmail.com
- **Supabase**: nel repository context (AGENTS.md padre)
- **Backend API**: https://youth-football-manager-backend.vercel.app/api

---

## Riga di Comando Finale

Dopo ogni task completato:
```bash
git add .
git commit -m "tipo: descrizione - build v3.14.<hash>"
git push origin main
```

Il `<hash>` è il commit hash corrente (vedi `git rev-parse --short HEAD`).
