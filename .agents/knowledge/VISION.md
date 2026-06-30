# Youth Football Manager - Vision

## Missione

Youth Football Manager è la **memoria digitale della squadra di calcio giovanile**. Permette a allenatori, dirigenti e famiglie di gestire in modo efficiente e professionale tutti gli aspetti della vita di una squadra: dal roster dei giocatori alle partite, dagli allenamenti alle statistiche individuali.

## Problema che Risolviamo

Le società sportive dilettantistiche italiane gestiscono i propri dati con:
- Fogli Excel sparsi
- WhatsApp per convocazioni e comunicazioni
- Figurine cartacee dei giocatori
- Report partite scritti a mano

**Youth Football Manager centralizza tutto** in un'unica piattaforma accessibile da qualsiasi dispositivo.

## Valori Fondamentali

### Semplicità
L'interfaccia deve essere **intuitiva** anche per chi non è tecnologico. Un allenatore di 50 anni deve poter inserire la formazione in 2 minuti.

### Completezza
Tutti i dati della squadra in un unico posto: anagrafica, partite, statistiche, allenamenti, convocazioni.

### Professionalità
Report PDF stampabili per FIGC/LND, statistiche da Serie A, esperienza da club professionistici.

### Privacy
Dati dei minorenni protetti, accesso controllato per ruolo (allenatore, genitore, ospite).

## Target Utente

### Allenatore
- Gestisce rosa, formazioni, convocazioni
- Inserisce risultati e statistiche partita
- Pianifica allenamenti con sedute strutturate in fasi
- Crea formazioni con campo visuale drag & drop
- Sceglie modulo tattico e posiziona giocatori liberamente

### Dirigente
- Gestisce anagrafica giocatori e famiglie
- Genera PDF per documenti FIGC
- Amministra la piattaforma

### Genitore/Atleta (Guest)
- Consulta calendario partite
- Riceve convocazioni
- Visualizza statistiche figlio

## Modello di Business

### Piani
| Piano | Prezzo | Funzionalità |
|-------|--------|---------------|
| **Coach** | €99/anno | 1 squadra, tutte le funzionalità |
| **Club** | €249/anno | Squadre illimitate, permessi avanzati |
| **AI Plus** | Coming Soon | Assistente AI, analisi, automazioni |

### Partnership
Sistema di referral commerciale con:
- 20% commissione sulla prima registrazione
- 10% sui rinnovi annuali

## Visione di Prodotto

### Fase Attuale (MVP)
Piattaforma funzionante con le funzionalità core per una singola società sportiva.

**Funzionalità completate:**
- Auth multi-ruolo con JWT e guest links
- Calendario partite con archivio e eventi
- Convocazioni con stato confermato/in dubbio/assente
- Formazione visuale con campo, drag & drop, moduli tattici e free-move
- Distinta FIGC/LND con staff precompilato da registro credenziali
- Allenamenti: calendario mensile, sedute in fasi, template, presenze
- Calendario allenamenti con evidenza giorni partita (dettagli avversario)
- Statistiche individuali e di squadra
- Dashboard con top players
- Demo interattiva con mini-missioni guidate
- Landing page con mockup CSS-only

### Roadmap
1. **FASE 1** ✅ - Sistema Auth/Ruoli completo
2. **FASE 2** 🔄 - Import CSV e Tuttocampo (web scraping)
3. **FASE 3** 📋 - Centro Importazioni (log, duplicati, matching)
4. **FASE 4** 📋 - Polish, test, template repository

### Obiettivo 2026
- 15-30 società paganti
- Integrazione con portali sportivi (Tuttocampo, OA Sport)
- Webinar FIGC/LND per presentazione

## Esperienza Utente

### Design
- Stile **professionale ma accessibile**
- Color palette: viola (#667eea) come brand, verde/rosso/giallo per risultati
- Effetti hover e transizioni fluide
- Responsive: funziona su desktop, tablet, mobile

### Linguaggio
- **Italiano** come lingua principale
- Emoji per rendere i dati leggibili (⚽📅🏆)
- Messaggi di errore chiari e costruttivi

### Accessibilità
- Tutti gli elementi iconografici hanno `title` attribute
- Contrasto colori sufficiente
- Struttura semantica HTML
