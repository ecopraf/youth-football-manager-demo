import { BUILD_INFO } from '../../build-info';

export default async function loadLogin() {
  const c = document.getElementById('pageContent');
  
  // Se già in sessione demo, vai alla dashboard
  if (localStorage.getItem('yfm_demo_session') === 'active') {
    window.location.href = '/';
    return;
  }

  c.innerHTML = `
    <div class="demo-container">
      <div class="demo-welcome">
        <img src="/assets/app-icon.png" alt="Youth Football Manager" class="demo-icon">
        <h1>Youth Football Manager</h1>
        <p class="demo-subtitle">La piattaforma digitale per allenatori di calcio giovanile</p>
        
        <div class="demo-features">
          <div class="demo-feature">
            <span class="feature-icon">👥</span>
            <span>Gestione Rosa</span>
          </div>
          <div class="demo-feature">
            <span class="feature-icon">📅</span>
            <span>Calendario Partite</span>
          </div>
          <div class="demo-feature">
            <span class="feature-icon">🏃</span>
            <span>Allenamenti</span>
          </div>
          <div class="demo-feature">
            <span class="feature-icon">📈</span>
            <span>Statistiche</span>
          </div>
        </div>
        
        <button type="button" id="startDemoBtn" class="btn btn-demo-start">
          🎮 Avvia Demo Interattiva
        </button>
        
        <p class="demo-note">
          La demo permette di esplorare tutte le funzionalità.<br>
          I dati vengono resettati alla chiusura del browser.
        </p>
      </div>
    </div>
    
    <style>
      .demo-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 70vh;
        padding: 20px;
      }
      .demo-welcome {
        background: white;
        border-radius: 24px;
        padding: 48px;
        width: 100%;
        max-width: 500px;
        box-shadow: 0 12px 48px rgba(0,0,0,0.12);
        text-align: center;
      }
      .demo-icon {
        width: 120px;
        height: 120px;
        object-fit: contain;
        border-radius: 24px !important;
        box-shadow: 0 8px 30px rgba(102,126,234,0.3);
        margin-bottom: 24px;
      }
      .demo-welcome h1 {
        font-size: 28px;
        font-weight: 700;
        margin: 0 0 12px 0;
        color: #1a1a2e;
      }
      .demo-subtitle {
        color: #666;
        font-size: 16px;
        margin: 0 0 32px 0;
      }
      .demo-features {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 32px;
      }
      .demo-feature {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 16px;
        background: #f8f9ff;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        color: #444;
      }
      .feature-icon {
        font-size: 20px;
      }
      .btn-demo-start {
        width: 100%;
        padding: 18px 32px;
        border-radius: 14px;
        font-size: 17px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        box-shadow: 0 6px 20px rgba(102,126,234,0.4);
      }
      .btn-demo-start:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(102,126,234,0.5);
      }
      .btn-demo-start:active {
        transform: translateY(-1px);
      }
      .demo-note {
        margin-top: 24px;
        font-size: 13px;
        color: #999;
        line-height: 1.5;
      }
      @media (max-width: 480px) {
        .demo-welcome {
          padding: 32px 24px;
        }
        .demo-features {
          grid-template-columns: 1fr;
        }
      }
    </style>
  `;

  // Avvia demo
  document.getElementById('startDemoBtn').addEventListener('click', () => {
    localStorage.setItem('yfm_demo_session', 'active');
    localStorage.setItem('yfm_demo_user', JSON.stringify({
      id: 'demo',
      nome: 'Demo',
      cognome: 'Utente',
      ruolo: 'allenatore',
      email: 'demo@yfm.it'
    }));
    window.location.href = '/';
  });
}
