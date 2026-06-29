# Calendario - Specifiche UI Mobile

## Layout Card Partita

```
┌─────────────────────────────────────────────────────────────┐
│ ⭐ PROSSIMA PARTITA                                        │
│                                                             │
│ 📅 Dom 5 Luglio · 15:30                                    │
│ 🏠 Casa / ✈️ Trasferta   🏆 Campionato · G.16             │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Convocazione  │  Formazione  │  Distinta              │ │
│ │ Risultato     │  Eventi      │  Note                   │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Badge Sezioni

| Sezione | Badge | Colore |
|---------|-------|--------|
| Prossima Partita | 🟢 PROSSIMA | Verde #28a745 |
| Prossime Partite | 📅 IN ARRIVO | Blu #D1ECF1 |
| Partite Giocate | 🏆 GIOCATE | Grigio #E9ECEF |

## Badge Info Partita

| Tipo | Badge | Colore |
|------|-------|--------|
| Casa | 🏠 Casa | Verde chiaro #D4EDDA |
| Trasferta | ✈️ Trasferta | Arancione chiaro #FFF3CD |
| Competizione | 🏆 {nome} | Grigio #E9ECEF |
| Giornata | ⚽ {giornata} | Grigio #E9ECEF |

## Griglia Pulsanti Mobile

- **Layout**: Grid 3 colonne x 2 righe
- **Gap**: 6px
- **Min height**: 40px per pulsante

```css
.match-actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-top: 12px;
}
```

## Stato Pulsanti

| Stato | Classe CSS | Colore |
|-------|------------|--------|
| Prossimo passo | `.btn-next-step` | Blu #007bff |
| Completato | `.btn-completed` | Verde #28a745 |
| Default | - | Grigio |

## Icone Azioni

| Azione | Icona |
|--------|-------|
| Convocazione | 📋 |
| Formazione | 🏟️ |
| Distinta | 📄 |
| Risultato | ⚽ |
| Eventi | 📊 |
| Note | 📝 |

## Responsive

```css
@media (max-width: 640px) {
  .match-actions-grid { grid-template-columns: repeat(3, 1fr); }
  .mobile-date-text { font-size: 12px; }
}
```

## Commit di Riferimento

- Repo: `youth-football-manager-demo`
- File: `demo/frontend/src/modules/team/calendar.js`
- Commit: `bdefa88` - "feat: layout mobile calendario con griglia pulsanti"
