# Youth Football Manager — Demo & Landing

Repository separato dall'app principale (`youth-football-manager`), dedicato alla **landing page pubblica** e alla **webapp demo interattiva**.

## 🤖 Per Agenti AI

Consultare `.agents/AGENTS.md` per il contesto completo (VISION, ARCHITECTURE, ROADMAP, CODING_STANDARDS) e `AGENTS.md` per credenziali/regole operative.

## Struttura del Progetto

```
youth-football-manager-demo/
├── landing/            # Landing page pubblica (HTML statico) - Vercel (yfm-landing)
├── demo/frontend/      # Webapp demo interattiva (Vite/JS) - Vercel (youth-football-manager-demo)
├── .agents/            # Documentazione per agenti AI
├── AGENTS.md           # Istruzioni operative (deploy, credenziali, regole)
└── package.json        # Monorepo root (script di install)
```

## Link Utili

- **Landing**: https://yfm-landing.vercel.app
- **Demo**: https://youth-football-manager.vercel.app/login?demo_email=demo_yfm&demo_password=demo_yfm&auto_login=1
- **Repo**: https://github.com/ecopraf/youth-football-manager-demo
- **App principale**: https://github.com/ecopraf/youth-football-manager

## Tech Stack

| | Landing | Demo |
|---|---|---|
| **Stack** | HTML/CSS statico | Vite + JavaScript ES modules |
| **Deploy** | Vercel (progetto `yfm-landing`) | Vercel (progetto `youth-football-manager-demo`) |
| **Output** | `landing/` (root) | `demo/frontend/dist` |

## 🚀 Setup Locale

### Landing

La landing è HTML statico, non richiede build. Basta aprire `landing/index.html` nel browser oppure servirla con un server statico qualsiasi.

### Demo (frontend)

```bash
cd demo/frontend
npm install
npm run dev
# Disponibile su http://localhost:5173 (porta Vite di default)
```

Script disponibili in `demo/frontend/package.json`:
```bash
npm run dev       # sviluppo
npm run build     # build produzione (output in dist/)
npm run preview   # preview della build
```

## 🚀 Deploy

### Demo (frontend)
Deploy **automatico**: ogni push su `main` che modifica `demo/frontend/` triggera un rebuild su Vercel (build command definito in `vercel.json` alla root: `cd demo/frontend && npm install && npm run build`).

### ⚠️ Landing — Deploy MANUALE obbligatorio
Il progetto Vercel `yfm-landing` punta alla cartella `landing/` ma **non** si aggiorna automaticamente al push su `origin/main`. Il push serve solo per il versionamento su GitHub.

Dopo ogni modifica a file in `landing/`, eseguire sempre:

```bash
cd landing
vercel --prod --yes
```

## 📋 Comandi Git Essenziali

```bash
git status
git pull origin main
git log --oneline -5
git checkout -b feature/nome-feature
git add <file>
git commit -m "descrizione modifiche"
git push origin nome-branch
```

## 📝 Convenzioni Commit

```
feat: nuova funzionalità
fix: correzione bug
docs: documentazione
refactor: refactoring codice
style: stili (CSS)
```

## Funzionalità Demo

- ✅ Modalità demo interattiva con dati di esempio realistici (giocatori, partite, statistiche)
- ✅ Persistenza locale delle modifiche (`localStorage`, vedi `DemoPersistence.js`)
- ✅ Copertura moduli: Dashboard, Rosa, Calendario, Convocazioni, Formazione, Risultati, Allenamenti, Report
- ✅ Reset dati demo ai valori originali

Per i dettagli implementativi della modalità demo (struttura dati, ID fissi, bug comuni e fix) vedere `AGENTS.md`.
