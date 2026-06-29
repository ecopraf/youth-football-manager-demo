# Calendario - Specifiche UI Desktop e Mobile

## Layout Desktop

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📅 Data                                                               │
│                                                                             │
│ 🏆 GIOCATE                                                              │
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │ 15/06/2025                                                            │ │
│ │ ASD Green Academy vs Inter Academy 3-1 ✅                             │ │
│ │ [⚽ Coppa Italia] [🏠 Casa]                                          │ │
│ │ [Convocazione][Formazione][Distinta][Eventi][Note]    [📦][✏️][🗑️] │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ⚽ PROSSIME PARTITE                                                      │
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │ 20/06/2025                                                            │ │
│ │ ASD Green Academy vs Juventus Academy                                  │ │
│ │ [⚽ G.2] [✈️ Trasferta]                                              │ │
│ │ [Convocazione][Formazione][Distinta][Note]            [✏️][🗑️]       │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Regole Desktop:**
- Risultato (`3-1 ✅`) sulla **stessa riga** dei nomi delle squadre
- Nomi squadre con `text-overflow: ellipsis` per overflow
- Tutti i pulsanti azione sulla **stessa riga** sotto le info
- Pulsanti ✏️🗑️📦 (Edit/Delete/Archivia) piccoli in alto a destra
- Tasto Note visibile per **tutte** le partite

## Layout Mobile (< 640px)

```
┌────────────────────────────────┐
│ ⚽ 1ª Giornata                 │
│ 📦                            │
│ 15/06 Sabato 15:30            │
│ ASD Green vs Inter 3-1 ✅     │
│ [🏠Casa][⚽Coppa Italia]      │
│              [📦][✏️][🗑️]    │
│ ┌────┬────┬────┐             │
│ │Conv│Form│Dist│             │
│ ├────┼────┼────┤             │
│ │ Eve│Note│    │             │
│ └────┴────┴────┘             │
└────────────────────────────────┘
```

**Regole Mobile:**
- Griglia **3x2** per pulsanti azione principali
- Icone ✏️🗑️📦 piccole in **alto a destra** (posizione assoluta)
- Risultato con badge colorato e icona (✅/❌/🤝)
- Nomi squadre con ellipsis se troppo lunghi
- Per partite archiviate: 🔓 (Sblocca) invece di 📦✏️🗑️

## Badge Sezioni

| Sezione | Badge | Colore |
|---------|-------|--------|
| Prossime Partite | 📅 IN ARRIVO | Blu #D1ECF1 |
| Partite Giocate | 🏆 GIOCATE | Grigio #E9ECEF |

## Badge Info Partita

| Tipo | Badge | Colore |
|------|-------|--------|
| Casa | 🏠 Casa | Verde chiaro #D4EDDA |
| Trasferta | ✈️ Trasferta | Arancione chiaro #FFF3CD |
| Competizione | 🏆 {nome} | Grigio #E9ECEF |
| Giornata | ⚽ {giornata} | Grigio #E9ECEF |

## Badge Risultato (Partite Giocate)

| Esito | Badge | Colore Background | Colore Testo |
|-------|-------|-------------------|--------------|
| Vittoria | 3-1 ✅ | Verde chiaro #D4EDDA | #27AE60 |
| Sconfitta | 1-3 ❌ | Rosso chiaro #F8D7DA | #E74C3C |
| Pareggio | 2-2 🤝 | Giallo chiaro #FFF3CD | #856404 |

```css
.result-victory { background: #D4EDDA; color: #27AE60; }
.result-defeat { background: #F8D7DA; color: #E74C3C; }
.result-draw { background: #FFF3CD; color: #856404; }
.result-score { font-size: 16px; font-weight: 700; }
```

## Griglia Pulsanti Mobile

- **Layout**: Grid 3 colonne x 2 righe
- **Gap**: 6px
- **Min height**: 40px per pulsante
- **Pulsanti**: Convocazione, Formazione, Distinta, Eventi, Note

```css
.match-actions-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  width: 100%;
}
```

## Pulsanti Azione - Posizione

| Contest | Desktop | Mobile |
|---------|---------|--------|
| Edit/Delete/Archivia | In alto a destra (piccoli) | In alto a destra (piccoli, posizione assoluta) |
| Tasto Note | Nella riga con altri pulsanti | Nella griglia 3x2 |

## Icone Azioni

| Azione | Icona |
|--------|-------|
| Convocazione | 📋 |
| Formazione | 🏟️ |
| Distinta | 📄 |
| Risultato | ⚽ |
| Eventi | 📊 |
| Note | 📝 |
| Archivia | 📦 |
| Sblocca | 🔓 |
| Modifica | ✏️ |
| Elimina | 🗑️ |

## Tasto Note - Visibilità

| Tipo Partita | Note visibile |
|--------------|---------------|
| Future | ✅ Sì |
| Giocate (con risultato) | ✅ Sì |
| Giocate (senza risultato) | ✅ Sì |
| Archiviate | ✅ Sì |

## Stato Pulsanti

| Stato | Classe CSS | Colore |
|-------|------------|--------|
| Prossimo passo | pallino animato | Blu #007bff |
| Completato | - | Grigio secondario |
| Default | - | Grigio |

## Responsive

```css
@media (max-width: 640px) {
  .match-actions-row { grid-template-columns: repeat(3, 1fr); }
  .mobile-short-date { display: inline !important; }
  .mobile-full-date { display: none !important; }
  .match-card-actions {
    position: absolute;
    top: 6px;
    right: 6px;
  }
}
```

## Commit di Riferimento

- Repo: `youth-football-manager-demo`
- File: `demo/frontend/src/modules/team/calendar.js`
- Commit: `ffa0e49` - "feat: aggiunto tasto Note anche alle partite archiviate"

### Storico Commit UI

```
ffa0e49 feat: aggiunto tasto Note anche alle partite archiviate
479c340 feat: aggiunto tasto Note alle partite giocate
4d37282 fix: pulsanti stessa riga anche su desktop
f1ce450 fix: risultato subito dopo nomi squadre
e516878 fix: risultato con icona e pulsanti azione
b3497e4 feat: risultato con icona per partite giocate
8b9685e fix: layout mobile calendario con risultato iconizzato
```
