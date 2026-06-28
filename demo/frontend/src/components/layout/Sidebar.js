export function setupLayout() {
  const isDemoSession = localStorage.getItem('yfm_demo_session') === 'active';
  
  // Badge Demo con stile verde (responsive)
  const demoBadge = isDemoSession ? '<span id="yfmMissionBadge" onclick="window.demoManager && window.demoManager.toggleMissionPanel()" class="demo-badge">🌱 Demo <span id="demoProgress">0%</span></span>' : '';
  
  // Pulsanti demo nella sidebar
  const demoCtaBtn = isDemoSession ? '<div class="sidebar-demo-cta"><button onclick="window.demoManager && window.demoManager.showRegistrationForm()" class="sidebar-demo-btn" title="Compila il form con i tuoi dati per configurare la tua squadra">📩 Richiedi Informazioni</button><button onclick="window.YFM.logout()" class="sidebar-demo-btn sidebar-demo-close">🚪 Chiudi Demo</button></div>' : '';
  
  const app = document.getElementById('app');
  app.innerHTML = '<div class="layout"><aside class="sidebar" id="sidebar"><div class="sidebar-logo"><img src="/assets/app-icon.png" alt="YFM" class="sidebar-app-icon"><span class="sidebar-logo-text">YFM</span></div><div class="sidebar-info"><div class="sidebar-info-label">Workspace</div><div class="sidebar-info-workspace" id="workspaceName">Caricamento...</div><div class="sidebar-info-season" id="seasonName">Stagione 2025/26</div></div><nav class="sidebar-nav"><a href="#" class="active" data-page="dashboard" title="📊 Panoramica">📊 Dashboard</a><div class="sidebar-section-title">🏢 Club</div><span class="sidebar-disabled" title="Sezione admin - disponibile nella versione completa">⚙️ Impostazioni</span><div class="sidebar-section-title">👥 Team</div><a href="#" data-page="roster" title="👥 Rosa">👥 Rosa</a><a href="#" data-page="calendar" title="📅 Calendario">📅 Calendario</a><div class="sidebar-section-title">🎯 Coach</div><a href="#" data-page="training" title="🏃 Allenamenti">🏃 Allenamenti</a><div class="sidebar-section-title">📈 Performance</div><a href="#" data-page="stats" title="📊 Statistiche">📊 Statistiche</a><a href="#" data-page="reports" title="📄 Report">📄 Report</a>' + demoCtaBtn + '</nav><div class="sidebar-footer" style="padding:12px 24px;border-top:1px solid rgba(255,255,255,0.1);font-size:10px;color:rgba(255,255,255,0.4);font-family:monospace;" id="buildInfo">build: ' + (window.YFM_BUILD_ID || 'dev') + '</div></aside><div class="main"><header class="header"><button id="menuBtn">☰</button><img id="headerLogo" src="" style="width:32px;height:32px;border-radius:8px;object-fit:cover;display:none;cursor:pointer;" onclick="updateLogo()" title="Clicca per cambiare logo"><span id="headerSocName" style="font-weight:600;color:var(--blue);font-size:15px;margin-left:8px;margin-right:auto;"></span><div class="header-right"><select class="header-select" id="squadraSelect"><option>Caricamento...</option></select>' + demoBadge + '</div></header><div class="content" id="pageContent"><div class="loading"><div class="spinner"></div>Caricamento...</div></div></div></div>';
  
  // Stile
  const style = document.createElement('style');
  style.textContent = `
    .sidebar-demo-close {
      background: linear-gradient(135deg, #E74C3C, #C0392B) !important;
      margin-top: 8px;
    }
    .sidebar-disabled {
      display: block;
      padding: 10px 16px;
      color: rgba(255,255,255,0.35);
      font-size: 13px;
      cursor: not-allowed;
      opacity: 0.6;
    }
    .demo-badge {
      background: white;
      color: #27AE60;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      margin-left: 8px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1), 0 1px 2px rgba(39,174,96,0.2);
      border: 2px solid #27AE60;
      white-space: nowrap;
      max-width: 140px;
      transition: all 0.2s ease;
    }
    .demo-badge:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(39,174,96,0.3);
    }
    #demoProgress {
      background: rgba(39,174,96,0.15);
      padding: 2px 6px;
      border-radius: 8px;
      font-size: 10px;
    }
    @media (max-width: 480px) {
      .demo-badge {
        padding: 4px 8px;
        font-size: 11px;
        max-width: 100px;
      }
      #demoProgress {
        font-size: 9px;
        padding: 1px 4px;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Aggiorna progress badge quando cambia
  if (isDemoSession) {
    setTimeout(() => {
      const updateProgress = () => {
        const progressEl = document.getElementById('demoProgress');
        if (progressEl && window.demoManager) {
          const progress = Math.round((window.demoManager.completedCount / window.demoManager.missions.length) * 100);
          progressEl.textContent = progress + '%';
        }
      };
      updateProgress();
      setInterval(updateProgress, 1000);
    }, 500);
  }
  
  const sidebar = document.getElementById('sidebar');
  const menuBtn = document.getElementById('menuBtn');

  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.YFM && typeof window.YFM.navigateTo === 'function') {
        window.YFM.navigateTo(link.dataset.page);
      }
      if (window.innerWidth <= 768 && sidebar) {
        sidebar.classList.remove('open');
        document.body.classList.remove('sidebar-open');
      }
    });
  });

  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = sidebar.classList.toggle('open');
      document.body.classList.toggle('sidebar-open', isOpen);
    });
  }

  document.addEventListener('click', (e) => {
    if (!sidebar || window.innerWidth > 768) return;
    if (!sidebar.classList.contains('open')) return;
    if (sidebar.contains(e.target) || (menuBtn && menuBtn.contains(e.target))) return;
    sidebar.classList.remove('open');
    document.body.classList.remove('sidebar-open');
  });
}