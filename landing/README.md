# Landing Page & Marketing — Youth Football Manager

## Struttura

```
landing/
├── index.html                              — Landing page principale (deploy Vercel)
├── locandina.html                          — Locandina generica 1080x1080 (Instagram/social)
├── locandina-ciampino.html                 — Locandina personalizzata per Ciampino
├── locandina-openday-template.html         — Template Open Day SC (classi per anno di nascita)
├── locandina-allenamenti-sg-template.html  — Template Programma Allenamenti SG (U14→U19)
├── caption-ciampino.txt                    — Caption Instagram per il post Ciampino
├── presentazione/          — Presentazione commerciale PDF
│   ├── presentazione.html  — Sorgente HTML (17 slide 1920x1080)
│   ├── YFM-Presentazione.pdf — PDF generato (evergreen, senza anno)
│   └── YFM-*.png           — Screenshot per le slide (17 file)
├── img/instagram/          — Asset per post Instagram
├── screenshot-desktop.png  — Screenshot app desktop
├── screenshot-mobile.png   — Screenshot app mobile
├── icon.png                — Logo YFM 512x512
└── logo.png                — Logo YFM grande
```

## Deploy

```bash
# Landing page (Vercel)
cd landing && vercel --prod

# NON è automatico su push — deploy manuale richiesto
```

URL produzione: https://yfm-landing.vercel.app

---

## Locandine (Social Media)

### File
- `locandina.html` — Template generico
- `locandina-ciampino.html` — Versione personalizzata Ciampino
- `locandina-openday-template.html` — Template Open Day Scuola Calcio (gruppi per anno di nascita)
- `locandina-allenamenti-sg-template.html` — Template Programma Allenamenti Settore Giovanile
- `locandina.png` / `locandina-ciampino.png` — PNG generati società
- `locandina-openday-template.png` / `locandina-allenamenti-sg-template.png` — PNG template di esempio
- `caption-ciampino.txt` — Caption Instagram per il post Ciampino

### Dimensioni
- **2160x2160px** — Output PNG (deviceScaleFactor 2x per alta qualità)
- Viewport sorgente: 1080x1080px — Formato quadrato Instagram/Facebook

### Sfondo Brand (FONTE DI VERITÀ)
```css
/* Background base scuro */
background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);

/* Overlay viola sfumato */
.bg-field {
    background: linear-gradient(180deg, 
        rgba(102, 126, 234, 0.25) 0%, 
        rgba(118, 75, 162, 0.15) 40%,
        transparent 100%);
}
```

### Generare PNG da HTML
```bash
# Locandina generica
cd backend && node generate-locandina.js
# Output: landing/locandina.png

# Locandina Ciampino
cd backend && node generate-locandina-ciampino.js
# Output: landing/locandina-ciampino.png

# Template Open Day SC
cd backend && node generate-openday-template.js
# Output: landing/locandina-openday-template.png

# Template Programma Allenamenti SG
cd backend && node generate-allenamenti-sg-template.js
# Output: landing/locandina-allenamenti-sg-template.png
```

### Personalizzare un template per una nuova società
1. Duplicare il template più adatto (es. `locandina-openday-template.html` → `locandina-openday-NOME.html`)
2. Modificare:
   - `.logo-wrap` — sostituire emoji con `<img>` del logo società
   - `.societa` — nome società
   - Dati specifici (date, orari, categorie, campi)
   - Colore header: cercare `#667eea` e sostituire con il colore brand della società
3. Duplicare lo script generatore (es. `generate-openday-template.js` → `generate-openday-NOME.js`) e aggiornare i path
4. Eseguire: `cd backend && node generate-openday-NOME.js`

---

## Presentazione Commerciale

### File
- `presentazione/presentazione.html` — Sorgente HTML
- `presentazione/YFM-Presentazione.pdf` — PDF generato (evergreen)

### Dimensioni Slide
- **1920x1080px** — Formato 16:9 Full HD

### Struttura Slide (16 totali)
1. Copertina (sfondo viola sfumato)
2. Il problema (WhatsApp, Excel, Carta)
3. La soluzione
4. Dashboard
5. Gestione Rosa
6. Convocazioni
7. Distinta FIGC
8. Match Center Live
9. Presenze Allenamenti
10. Gestione Quote
11. Calendario Integrato
12. Kit Sportivo
13. Certificati e Scadenze
14. Scuola Calcio
15. E molto altro ancora... (8 funzionalità extra)
16. **Piani e Prezzi** (4 piani: Coach, Club, Academy, Pro)
17. CTA finale (sfondo viola sfumato)

### Piani (allineati con DB `piano_config`)

| Piano | Prezzo | Utenti | Caratteristiche |
|-------|--------|--------|-----------------|
| Coach | €99/anno | 3 | 1 squadra, funzionalità base |
| Club | €249/anno | 30 | Illimitate, quote, kit, Area Famiglie |
| Academy | €349/anno | 100 | SG + Scuola Calcio, Scouting, Report |
| **Pro** | €399/anno | 200 | + Prima Squadra, Regole Under auto |

### Generare PDF
```bash
cd backend && node generate-presentazione.js
# Output: landing/presentazione/YFM-Presentazione.pdf
```

### Screenshot per Slide (16 file)
Salvare in `presentazione/` con naming:
- `YFM-Rosa.png`
- `YFM-Convocazione-Selezione.png`
- `YFM-Convocazione-Stampa.png`
- `YFM-Distinta.png`
- `YFM-MatchCenter.png`
- `YFM-Presenze.png`
- `YFM-RiepilogoPresenze.png`
- `YFM-Statistiche.png`
- `YFM-Quote.png`
- `YFM-Calendario-Partite.png`
- `YFM-Calendario-Eventi.png`
- `YFM-KitSportivo.png`
- `YFM-CertificatiMedici.png`
- `YFM-ScuolaCalcio.png`
- `YFM-GruppiScuolaCalcio.png`
- `YFM-DettagliGiocatore.png`
- `YFM-PrintCenter.png`

**Workspace demo per screenshot**: Nuova Tor Tre Teste (ID: `30962d91-87cd-4fc6-a347-cfd9da114172`)

---

## Template Locandine — Guida Rapida

### Open Day Scuola Calcio (`locandina-openday-template.html`)
Mostra il calendario open day raggruppato per **anno di nascita**. Ogni gruppo ha:
- Badge colorato con anno (colori distinti per classe)
- Orario fascia
- Griglia date in 6 colonne
- Sezione contatti segreteria + note

**Elementi da personalizzare**: nome società, stagione, gruppi/anni, orari, date, luogo, contatti, note, colore header.

### Programma Allenamenti SG (`locandina-allenamenti-sg-template.html`)
Mostra il programma settimanale tipo per **categoria (U14→U19)**. Ogni riga ha:
- Badge colorato con categoria
- Nome squadra + tipo campionato
- Giorni/orari come pill inline
- Campi come pill (con simbolo `½` per mezzi campi)

**Elementi da personalizzare**: nome società, stagione, categorie, giorni/orari, campi, colore header.

**Colori categoria predefiniti**:
| Categoria | Colore |
|---|---|
| U14 | Viola `#667eea → #764ba2` |
| U15 | Rosa/Rosso `#f093fb → #f5576c` |
| U16 | Azzurro `#4facfe → #00f2fe` |
| U17 | Verde `#43e97b → #38f9d7` |
| U19 | Arancio `#f97316 → #fbbf24` |

---

## Script Generazione (in `backend/`)

| Script | Output | Comando |
|--------|--------|---------|
| `generate-locandina.js` | `locandina.png` | `node generate-locandina.js` |
| `generate-locandina-ciampino.js` | `locandina-ciampino.png` | `node generate-locandina-ciampino.js` |
| `generate-openday-template.js` | `locandina-openday-template.png` | `node generate-openday-template.js` |
| `generate-allenamenti-sg-template.js` | `locandina-allenamenti-sg-template.png` | `node generate-allenamenti-sg-template.js` |
| `generate-presentazione.js` | `YFM-Presentazione.pdf` | `node generate-presentazione.js` |

Tutti usano **Puppeteer** — viewport 1080x1080 + `deviceScaleFactor:2` → output **2160x2160px**.

> ⚠️ Eseguire sempre da `backend/` con il path Node corretto:
> `/Users/Raffaele/.nvm/versions/node/v24.18.0/bin/node SCRIPT.js`

---

## Colori Brand

```css
--primary: #667eea;        /* Viola principale */
--primary-dark: #764ba2;   /* Viola scuro (gradient) */
--success: #27AE60;        /* Verde (Pro, CTA) */
--dark-bg: #1a1a2e;        /* Sfondo scuro */
--text-light: rgba(255,255,255,0.85);
```

---

## Checklist Aggiornamenti

Quando modifichi piani/prezzi:
- [ ] `piano_config` nel DB
- [ ] `landing/index.html` sezione pricing
- [ ] `landing/presentazione/presentazione.html` slide 15
- [ ] Rigenerare PDF: `node generate-presentazione.js`
- [ ] `frontend-v2/src/utils/planGuard.js` (se cambiano capabilities)
- [ ] `backend/api/helpers/planGuard.js` (mirror)
