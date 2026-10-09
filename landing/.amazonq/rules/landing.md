# Regole Landing Page — YFM

## Deploy

Sequenza obbligatoria prima di ogni deploy:

```bash
cd /Users/Raffaele/Documents/Youth-Foorball-Manager/youth-football-manager-demo/landing
git add .
git commit -m "descrizione delle modifiche fatte"
vercel --prod --yes --scope ecoprafs-projects  # deploy SEMPRE con Vercel CLI, non da dashboard
# NB: --scope ecoprafs-projects è obbligatorio, altrimenti "Error: Not authorized" (verificato 8 Ott 2026)
```

Il messaggio commit deve descrivere le modifiche reali del deploy (es. `fix: pricing - aggiunto target per piano`).

## Lettura file

Usare sempre `grep -v base64` per evitare di caricare il logo inline:

```bash
grep -n "keyword" index.html | grep -v base64
```
