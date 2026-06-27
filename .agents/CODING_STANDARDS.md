# Youth Football Manager - Coding Standards

## Convenzioni Generali

### Stile Codice
- **JavaScript**: ES6+ con const/let, arrow functions, template literals
- **Indentazione**: 2 spazi
- **Punto e virgola**: obbligatorio
- **Virgolette**: singole per stringhe, doppie per JSX/HTML

### Naming Conventions
```javascript
// Variabili e funzioni: camelCase
const userName = 'Mario';
function getUserById(id) { }

// Costanti: SCREAMING_SNAKE_CASE
const API_BASE_URL = 'https://...';
const MAX_PLAYERS = 25;

// Classi/Costruttori: PascalCase
class UserManager { }

// File: kebab-case
// user-profile.js, team-calendar.js

// Costanti API: maiuscole con underscore
const HTTP_GET = 'GET';
const STATUS_OK = 200;
```

## Struttura File Frontend

### Moduli JavaScript
```javascript
// 1. Imports
import { formatDate } from '../utils/formatters.js';
import api from '../services/api.js';

// 2. State (se necessario)
let currentUser = null;

// 3. Funzioni exported
export function renderLoginPage() { }
export function handleLogin(data) { }

// 4. Funzioni internal
function validateEmail(email) { }

// 5. Event listeners (alla fine)
document.getElementById('loginForm').addEventListener('submit', handleLogin);
```

### CSS
```css
/* BEM naming convention */
.page-container { }
.page-container__header { }
.page-container__header--active { }

/* Utility classes */
.text-center { text-align: center; }
.mt-16 { margin-top: 16px; }

/* Media queries alla fine del file */
@media (max-width: 600px) { }
```

## API Design

### Naming Endpoint
```
/api/<risorsa>/<azione>

GET    /api/partite           → Lista partite
GET    /api/partite/:id       → Dettaglio singolo
POST   /api/partite           → Crea nuovo
PUT    /api/partite/:id       → Modifica
DELETE /api/partite/:id       → Elimina
```

### Risposte API
```javascript
// Successo
{ success: true, data: { ... } }

// Errore
{ success: false, error: 'Messaggio errore' }

// Lista con paginazione
{ 
  success: true, 
  data: [...], 
  pagination: { page: 1, total: 100 }
}
```

### Error Handling
```javascript
// Backend
try {
  const result = await supabase.from('users').select();
  if (result.error) throw result.error;
  res.json({ success: true, data: result.data });
} catch (error) {
  res.status(400).json({ success: false, error: error.message });
}

// Frontend
async function fetchUsers() {
  try {
    const response = await api.get('/users');
    if (!response.success) throw new Error(response.error);
    return response.data;
  } catch (error) {
    console.error('Errore:', error);
    showError('Impossibile caricare gli utenti');
  }
}
```

## Gestione Errori UI

### Messaggi Errore
```javascript
// Usa sempre messaggi user-friendly
❌ "Internal Server Error"
✅ "Impossibile salvare. Riprova tra qualche minuto."

// Struttura
function showError(message, duration = 5000) {
  // Toast notification o alert
}
```

### Validazione Form
```javascript
function validateForm(data) {
  const errors = [];
  
  if (!data.email) errors.push('Email obbligatoria');
  if (!isValidEmail(data.email)) errors.push('Email non valida');
  if (!data.password || data.password.length < 6) {
    errors.push('Password deve essere almeno 6 caratteri');
  }
  
  return { valid: errors.length === 0, errors };
}
```

## Accessibilità

### HTML Semantico
```html
❌ <div class="button" onclick="save()">Salva</div>
✅ <button type="submit">Salva</button>

❌ <span class="icon" onclick="edit()">✏️</span>
✅ <button class="icon-btn" title="Modifica" aria-label="Modifica">✏️</button>
```

### Immagini e Media
```html
❌ <img src="player.jpg">
✅ <img src="player.jpg" alt="Marco Rossi, difensore" loading="lazy">
```

### Focus e Keyboard
```javascript
// Non rimuovere mai outline senza sostituirlo
*:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

## Commenti e Documentazione

### Quando Commentare
```javascript
// ✅ Commenta: business logic complessa
// Calcola media voti pesata per ultima partita e trend
function calculateAverage(playerId) { }

// ✅ Commenta: workaround o fix noto
// TODO: rimuovere quando Supabase fix RLS
supabase.rpc('bypass_rls');

/// ❌ Non commentare: codice auto-esplicativo
const name = user.firstName + ' ' + user.lastName;
```

### JSDoc
```javascript
/**
 * Calcola statistiche complete di un giocatore
 * @param {string} playerId - ID del giocatore
 * @param {Object} options - Opzioni calcolo
 * @param {boolean} options.includeHistoric - Include storico
 * @returns {Promise<Object>} Statistiche calcolate
 */
async function getPlayerStats(playerId, options = {}) { }
```

## Git Workflow

### Branch Naming
```
feature/nome-feature
fix/bug-descrizione
docs/aggiorna-documentazione
refactor/migliora-codice
```

### Commit Messages
```
tipo: descrizione breve

[descrizione dettagliata se necessaria]

Files:
- file1.js
- file2.css

Test: descrizione test eseguiti
```

**Tipi**:
- `feat`: nuova funzionalità
- `fix`: correzione bug
- `docs`: documentazione
- `style`: stili (CSS)
- `refactor`: refactoring
- `test`: test
- `chore`: manutenzione

### Esempi
```bash
git commit -m "feat: aggiungi sistema notifiche push

- Implementato service worker per push notifications
- Aggiunto endpoint /api/notifications
- UI per preferenze notifiche in impostazioni

Files:
- frontend/src/services/notifications.js
- backend/api/notifications.js

Test: verificato su Chrome e Safari"
```

## Testing

### Unit Test (se implementati)
```javascript
describe('User validation', () => {
  it('should reject invalid email', () => {
    expect(validateEmail('notanemail')).toBe(false);
  });
  
  it('should accept valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });
});
```

### Test Manuali
Prima di ogni commit, verifica:
1. Feature funziona come previsto
2. Non ci sono errori console
3. Responsive su mobile
4. Login/logout funziona
5. API calls restituiscono dati corretti

## Performance

### Lazy Loading
```javascript
// Lazy load moduli pesanti
window.YFM.openMatchDetail = async (id) => {
  const module = await import('./modules/team/matchDetail.js');
  module.openMatchDetail(id);
};
```

### Evitare Rerender Innecessari
```javascript
// ❌ Cattivo
element.innerHTML = '';
data.forEach(item => {
  element.innerHTML += renderItem(item);
});

// ✅ Meglio
element.innerHTML = data.map(renderItem).join('');
```

### Immagini
```html
<!-- Lazy loading immagini non critical -->
<img src="photo.jpg" loading="lazy" alt="...">

<!-- Dimensioni fisse per evitare reflow -->
<img src="thumb.jpg" width="100" height="100" alt="...">
```

## Sicurezza

### Never Trust Input
```javascript
// Validare SEMPRE input utente
function sanitizeInput(input) {
  return input.replace(/[<>]/g, '');
}

// Validare tipi
if (typeof id !== 'string') throw new Error('ID must be string');
```

### Credenziali
- Mai hardcodare API keys nel codice
- Usare variabili d'ambiente
- Non committare .env
- Non loggare dati sensibili
