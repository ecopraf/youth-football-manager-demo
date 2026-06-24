# Proposta di Partnership Tecnica

## Youth Football Manager x Gazzetta Regionale / Tuttocampo

**Proposta Commerciale per Partnership Affiliate**

---

## Contatto
- **Email**: youthfootballmanager@gmail.com
- **Logo**: /assets/logo.png

## 🎯 Il Nostro Prodotto

### Youth Football Manager
Piattaforma SaaS per la gestione integrata di squadre di calcio dilettantistico:

| Funzionalità | Descrizione |
|--------------|-------------|
| **Gestione Rosa** | Anagrafica giocatori, presenze, statistiche |
| **Calendario Partite** | Calendario, risultati, convocazioni |
| **Formazioni** | Gestione formazioni, ruoli, distinte FIGC |
| **Eventi Match** | Gol, assist, cartellini, minuto per minuto |
| **Valutazioni** | Voti allenatore, statistiche prestazioni |
| **Dashboard** | Classifiche marcatori, trend, statistiche |
| **Staff** | Allenatori, dirigenti, preparatori |
| **Multi-Categoria** | Gestione squadre Under 10-19, Esordienti, Giovanissimi, Allievi, etc. |

### Target
- **Società sportive dilettantistiche** in Italia
- **ASD/SSD** iscritte a FIGC, LND, CSI, UISP
- **Allenatori e dirigenti** che necessitano di strumenti digitali

### Perché ora?
- Il digitale è sempre più richiesto anche nei vivai dilettanti
- Nessuno strumento specifico per questo segmento
- Mercato frammentato con fogli Excel e WhatsApp

---

## Contatto
- **Email**: youthfootballmanager@gmail.com
- **Logo**: /assets/logo.png

## 💼 Il Modello di Partnership Proposto

### Opzione 1: Partnership Affiliate (Consigliata)

```
┌─────────────────────────────────────────────────────────────┐
│                    MODELLO COMMERCIALE                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Portale Partner          Società Sportiva          YFM      │
│  (Gazzetta/Tuttocampo)   (Cliente)              (Noi)      │
│        │                      │                    │        │
│        │  ┌───────────────────┘                    │        │
│        │  │  Click referral link                    │        │
│        │  │  ID Partner nel link                    │        │
│        │  ▼                                         ▼        │
│        │  ┌─────────────────────────────────────────────┐   │
│        │  │  Sito YFM con banner "Offerto da [Partner]" │   │
│        │  │  Registrazione società: €250               │   │
│        │  └─────────────────────────────────────────────┘   │
│        │           │                                         │
│        │           │  Pagamento diretto a YFM               │
│        │           ▼                                         │
│        │  ┌──────────────────────────────────────┐          │
│        │  │  Società attivata, referral tracciato │          │
│        │  └──────────────────────────────────────┘          │
│        │           │                                         │
│        │           │  Commissione Partner (20%)             │
│        │  ◄────────────────────────────────────────         │
│        │           │                                         │
│        ▼           ▼                                         │
│    ┌───────────────────┐                                    │
│    │   RICAVO €250    │                                    │
│    │   ├─ €200 YFM    │                                    │
│    │   └─ €50 Partner │                                    │
│    └───────────────────┘                                    │
└─────────────────────────────────────────────────────────────┘
```

### Struttura Economica

| Prezzo Registrazione | Società Paga | YFM Riceve | Partner Riceve |
|---------------------|--------------|------------|----------------|
| **Annuale** | €250/anno | €200 (80%) | €50 (20%) |
| **Triennale (-20%)** | €600/3anni | €480 | €120 |
| **Premium (+50%)** | €375/anno | €300 | €75 |

### Vantaggi per il Partner

| Vantaggio | Descrizione |
|-----------|-------------|
| **Revenue passivo** | Commissione su ogni società che si registra tramite te |
| **Nessun costo** | Zero investimento, zero manutenzione |
| **Valore per i lettori** | Offri un servizio concreto ai tuoi utenti |
| **Brand awareness** | Visibilità su YFM con logo "Partner Ufficiale" |
| **Esclusività regionale** | Possibilità di esclusiva territoriale |

---

## Contatto
- **Email**: youthfootballmanager@gmail.com
- **Logo**: /assets/logo.png

## 🔗 Meccanismo Tecnico: Referral System

### Come Funziona

```
URL BASE: https://youth-football-manager.vercel.app/register

URL PARTNER: https://youth-football-manager.vercel.app/register?ref=gazzetta-lombardia
```

### Implementazione Tecnica

**1. Link di Registrazione (da fornire al partner)**
```
https://youth-football-manager.vercel.app/register?ref={PARTNER_CODE}
```

**2. Codici Partner Univoci**
| Partner | Codice | URL Completa |
|---------|--------|--------------|
| Gazzetta Regionale Lombardia | `gazzetta-lo` | `...?ref=gazzetta-lo` |
| Tuttocampo Nazionale | `tuttocampo` | `...?ref=tuttocampo` |
| Gazzetta Regionale Veneto | `gazzetta-ve` | `...?ref=gazzetta-ve` |

**3. Tracciamento**
- Il codice `ref` viene salvato in un cookie (30 giorni)
- Alla registrazione, il codice viene associato all'account
- Dashboard partner per vedere statistiche referral

**4. Banner Promozionali (da implementare)**
```html
<!-- Esempio banner per il partner -->
<div style="background: linear-gradient(...); padding: 20px; border-radius: 12px;">
  <img src="/logo-gazzetta.png" alt="Gazzetta">
  <h3>Offerta Esclusiva per le società lombarde</h3>
  <p>Registra la tua società e ottieni il 20% sconto!</p>
  <a href="/register?ref=gazzetta-lo">Registrati Ora</a>
</div>
```

### Dashboard Partner (da sviluppare)
- **URL**: `/partner/{partner_id}`
- **Statistiche**: 
  - Click sui link referral
  - Registrazioni completate
  - Entrate generate
  - Commissioni da ricevere

---

## Contatto
- **Email**: youthfootballmanager@gmail.com
- **Logo**: /assets/logo.png

## 📄 Strategia di Outreach

### Contatti da Fare

#### 1. Gazzetta Regionale
| Info | Dettaglio |
|------|-----------|
| **Chi contattare** | Direzione commerciale / Responsabile partnership |
| **Argomento** | Partnership tecnologica con revenue sharing |
| **Email tipo** | "Proposta partnership digitale per i nostri lettori" |

**Email di Contatto:**
```
Oggetto: Partnership YFM x [Nome Portale] - Proposta Commerciale

Gentile [Nome],

le scrivo per proporle una partnership digitale che potrebbe 
generare valore per la sua testata e per le società sportive 
che seguono i suoi contenuti.

Youth Football Manager è una piattaforma SaaS per la gestione 
di squadre dilettantistiche. Abbiamo sviluppato un sistema di 
affiliazione che permette ai nostri partner di:

✓ Guadagnare il 20% su ogni società registrata tramite il loro portale
✓ Zero investimento iniziale
✓ Fornire un servizio concreto ai propri lettori

Le allego la presentazione completa e resto a disposizione 
per una call.

Cordiali saluti,
[Raffaele Coppola]
```

#### 2. Tuttocampo
- Stessa strategia
- Enfatizzare il target comune (società dilettanti)
- Possibilità di integrazione con statistiche esistenti

---

## Contatto
- **Email**: youthfootballmanager@gmail.com
- **Logo**: /assets/logo.png

## 📊 Proiezioni di Ricavo

### Scenario Conservativo (Anno 1)

| Mese | Società Registrate | Ricavo Lordo | Commissioni Partner | Ricavo Netto YFM |
|------|-------------------|--------------|---------------------|------------------|
| Mese 1-3 | 5/mese | €1.250 | €250 | €1.000 |
| Mese 4-6 | 8/mese | €2.000 | €400 | €1.600 |
| Mese 7-9 | 12/mese | €3.000 | €600 | €2.400 |
| Mese 10-12 | 15/mese | €3.750 | €750 | €3.000 |
| **Totale Anno 1** | **120** | **€30.000** | **€6.000** | **€24.000** |

### Con 3 Partner Attivi

| Partner | Registrazioni/mese | Commissioni/mese |
|---------|-------------------|-------------------|
| Gazzetta Regionale | 10 | €500 |
| Tuttocampo | 15 | €750 |
| Terzo Partner | 5 | €250 |
| **Totale** | **30** | **€1.500/mese** |

---

## Contatto
- **Email**: youthfootballmanager@gmail.com
- **Logo**: /assets/logo.png

## 📋 Prossimi Passi

### Fase 1: Implementazione Tecnica
- [ ] Sistema referral con codici partner
- [ ] Dashboard admin per gestione partner
- [ ] Dashboard pubblica per statistiche partner
- [ ] Banner promozionali customizzabili
- [ ] Pagina landing per partner

### Fase 2: Outreach
- [ ] Preparare pitch deck PDF
- [ ] Identificare decision maker
- [ ] Inviare email di presentazione
- [ ] Pianificare call/conferenze

### Fase 3: Launch
- [ ] Primi 2-3 partner pilota
- [ ] Monitoraggio risultati
- [ ] Ottimizzazione funnel
- [ ] Scaling con nuovi partner

---

## Contatto
- **Email**: youthfootballmanager@gmail.com
- **Logo**: /assets/logo.png

## 📎 Allegati

1. Presentazione prodotto (da creare)
2. Demo live su https://youth-football-manager.vercel.app
3. Video tutorial (da creare)

---

## Contatto
- **Email**: youthfootballmanager@gmail.com
- **Logo**: /assets/logo.png

## Contatti

**Raffaele Coppola**
- Email: youthfootballmanager@gmail.com
- Sito: https://youth-football-manager.vercel.app

---

## Contatto
- **Email**: youthfootballmanager@gmail.com
- **Logo**: /assets/logo.png

*Documento preparato per discussione e personalizzazione.*
*Ultimo aggiornamento: Giugno 2026*
