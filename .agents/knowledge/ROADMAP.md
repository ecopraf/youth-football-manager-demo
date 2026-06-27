# Youth Football Manager - Roadmap

## Stato Sviluppo

**Versione Attuale**: v3.14
**Target MVP**: Fine Settembre 2026

---

## Fasi di Sviluppo

### FASE 1 ✅ COMPLETATA
**Sistema Auth/Ruoli**
- [x] Login con JWT
- [x] Registrazione utenti
- [x] Ruoli: admin, allenatore, staff, guest
- [x] Gestione utenti (CRUD)
- [x] Link guest temporanei
- [x] Multi-workspace isolation

### FASE 2 📋 TODO
**Import Dati**
- [x] Import CSV base (struttura)
- [ ] Import CSV avanzato (campi FIGC completi)
- [ ] Import Tuttocampo (web scraping)
- [ ] Centro Importazioni con:
  - [ ] Log operazioni
  - [ ] Rilevamento duplicati
  - [ ] Matching intelligente giocatori

### FASE 3 📋 TODO
**Dashboard e Analytics**
- [ ] Dashboard coach con insights
- [ ] Statistiche avanzate (xG, passaggi, etc.)
- [ ] Confronto giocatori
- [ ] Trend stagionali

### FASE 4 📋 TODO
**Polish e Launch**
- [ ] Test end-to-end completi
- [ ] Ottimizzazione performance
- [ ] Documentazione utente
- [ ] Video tutorial

---

## Backlog Funzionalità

### Alta Priorità (P1)

#### Gestione Giocatori
- [ ] Scheda giocatore avanzata con foto
- [ ] Storico presenze/assenze
- [ ] Note allenatore personali
- [ ] Allegati (certificati medici, etc.)

#### Calendario Partite
- [ ] Integrazione Google Calendar
- [ ] Notifiche push per partite
- [ ] Previsioni meteo per giorno partita
- [ ] Statistiche testa-a-testa con avversari

#### Report e Documenti
- [ ] Report presenze allenamenti
- [ ] Distinta FIGC in formato ufficiale
- [ ] Elenco rosa stampabile
- [ ] Certificato trasferta

### Media Priorità (P2)

#### Comunicazioni
- [ ] Notifiche in-app
- [ ] Email per convocazioni (SendGrid?)
- [ ] Broadcast ai genitori
- [ ] Bacheca annunci

#### Performance
- [ ] Tracking fitness giocatori
- [ ] Questionari pre/post partita
- [ ] Analisi video (integrazione)
- [ ] Statistiche Avanzate (xG, heatmaps)

### Bassa Priorità (P3)

#### Funzionalità Extra
- [ ] Gamification (badge, achievement)
- [ ] Integrazione social
- [ ] App mobile nativa
- [ ] Integrazione pagamenti (quando necessario)

---

## Bug Noti

### Critici
- Nessuno

### Minori
- [ ] Filtro categorie: staff vede tutte le squadre invece di quelle assegnate
- [ ] Valutazioni giocatore: sistema incompleto

---

## Technical Debt

### Refactoring Suggeriti
- [ ] Estrarre API client in modulo separato
- [ ] Centralizzare gestione errori API
- [ ] Sostituire window.YFM con stato react/query
- [ ] Aggiungere TypeScript gradualmente

### Test
- [ ] Setup CI/CD con test
- [ ] Test E2E con Playwright
- [ ] Test API con Supertest

---

## Note Deploy

### Quando rilasciare nuove versioni
1. Feature completata e testata localmente
2. Build ID generato correttamente
3. Messaggio commit descrittivo
4. Push su main → deploy automatico

### Rollback
Se un deploy causa problemi:
1. Identifica commit funzionante
2. `git revert <commit-hash>`
3. Push → nuovo deploy

---

## Metriche Obiettivo 2026

| Metrica | Target |
|---------|--------|
| Società paganti | 15-30 |
| Giocatori gestiti | 500+ |
| Partite/mese | 100+ |
| uptime | 99.5% |
