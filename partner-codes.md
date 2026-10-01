# Registro Codici Partner — YFM

> Elenco dei codici assegnati ai partner che ospitano il banner YFM.
> **File interno, NON pubblicato** (sta fuori da `landing/`).
> Il codice è il valore `utm_source` con cui distingui i partner in Vercel Analytics.

## Come funziona

1. Assegna un **codice univoco** al partner (minuscolo, solo lettere/numeri/`-`/`_`, es. `asdrossi`).
2. Mandagli il suo **link personalizzato** del kit banner:
   `https://youth-football-manager.app/partner-kit.html?p=CODICE`
   (apre la pagina col codice già compilato — lui copia e incolla, non sbaglia).
3. I click sul suo banner arrivano con `utm_source=CODICE`.
4. Vedi i numeri in **Vercel → progetto `yfm-landing` → tab Analytics** (filtra per sorgente/referrer).

## Convenzione codici

- Tutto minuscolo, senza spazi: usa `-` per separare (es. `polisportiva-ciampino`).
- Breve ma riconoscibile. Evita nomi ambigui.
- Un codice = un partner. Non riusare lo stesso codice per partner diversi.

## Partner attivi

| Codice | Partner | Sito | Link kit inviato | Data | Note |
|--------|---------|------|------------------|------|------|
| _(esempio)_ `asdrossi` | A.S.D. Rossi | asdrossi.it | sì | — | esempio, da rimuovere |
|  |  |  |  |  |  |

## Partner cessati / sospesi

| Codice | Partner | Dal | Al | Motivo |
|--------|---------|-----|-----|--------|
|  |  |  |  |  |

---

_Aggiorna questa tabella ogni volta che attivi un nuovo partner, così il dato in Analytics resta sempre riconducibile a un nome._
