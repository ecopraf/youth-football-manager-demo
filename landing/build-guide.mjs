#!/usr/bin/env node
/**
 * build-guide.mjs — genera landing/guide.json dalla fonte unica dei flussi del
 * Centro Guide dell'app (frontend-v3/src/modules/help/flowsData.js).
 *
 * Obiettivo: la landing pubblica mostra le stesse guide dell'app SENZA
 * duplicare i testi a mano. I contenuti si scrivono una volta sola in
 * flowsData.js; qui li esportiamo in un JSON "pubblico", ripulito dei dettagli
 * interni (riferimenti a route/azioni UI, warning operativi) che non hanno
 * senso per un lettore che non è ancora dentro l'app.
 *
 * Uso:  node build-guide.mjs
 * Poi:  vercel --prod --yes   (deploy manuale della landing, vedi AGENTS.md)
 *
 * NB: getAllFlows() già esclude i flussi con target 'guest' (guida_famiglia),
 * che riguardano l'area famiglie e non lo staff.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Percorso alla fonte unica. La landing vive in youth-football-manager-demo/,
// l'app in youth-football-manager/: saliamo e rientriamo.
const FLOWS_PATH = resolve(
  __dirname,
  '../../youth-football-manager/frontend-v3/src/modules/help/flowsData.js'
)

const mod = await import(pathToFileURL(FLOWS_PATH).href)
const { getAllFlows, TARGET_LABELS } = mod

// Ripulisce un flusso per la vista pubblica: via i campi interni UI.
function toPublicFlow(f) {
  return {
    id: f.id,
    titolo: f.titolo,
    descrizione: f.descrizione,
    icon: f.icon,
    durata: f.durata,
    target: (f.target || []).map(t => TARGET_LABELS[t]?.label || t),
    steps: (f.steps || []).map(s => ({
      label: s.label,
      description: s.description,
      // Teniamo solo i suggerimenti; via warnings[] (operativi, UI-specifici)
      // e via page/param/isAction (riferimenti interni al router dell'app).
      tips: s.tips || [],
      optional: !!s.optional,
    })),
  }
}

const flows = getAllFlows().map(toPublicFlow)

const out = {
  generatedAt: new Date().toISOString(),
  count: flows.length,
  flows,
}

const OUT_PATH = resolve(__dirname, 'guide.json')
writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + '\n', 'utf8')
console.log(`✓ guide.json generato: ${flows.length} guide → ${OUT_PATH}`)
