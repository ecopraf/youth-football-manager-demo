export function initRouter() {
  // Import PageHelp
  let injectPageHelp = null;
  import('./components/PageHelp.js').then(m => { injectPageHelp = m.injectPageHelp; });

  window.YFM.pages = {
    login: () => import('./modules/auth/login.js'),
    dashboard: () => import('./modules/team/dashboard.js'),
    roster: () => import('./modules/team/roster.js'),
    calendar: () => import('./modules/team/calendar.js'),
    matchDetail: () => import('./modules/team/matchDetail.js'),
    convocazioni: () => import('./modules/team/convocazioni.js'),
    formazione: () => import('./modules/team/formazione.js'),
    formation: () => import('./modules/team/formazione.js'),
    playerDetail: () => import('./modules/team/playerDetail.js'),
    training: () => import('./modules/coach/trainingSessions.js'),
    trainingSessions: () => import('./modules/coach/trainingSessions.js'),
    trainingPresenze: () => import('./modules/coach/trainingPresenze.js'),
    trainingSettings: () => import('./modules/coach/trainingSettings.js'),
    stats: () => import('./modules/performance/stats.js'),
    reports: () => import('./modules/performance/reports.js'),
    settings: () => import('./modules/club/settings.js')
  };

  // ── HELPERS DEMO ──
  
  window.YFM.isDemo = function() {
    return localStorage.getItem('yfm_demo_session') === 'active';
  };

  window.YFM.isAdmin = function() {
    return true; // Demo ha sempre accesso admin
  };

  window.YFM.hasRole = function(role) {
    return true; // Demo ha tutti i ruoli
  };

  window.YFM.getUser = function() {
    const userStr = localStorage.getItem('yfm_demo_user');
    return userStr ? JSON.parse(userStr) : null;
  };

  window.YFM.updateUserUI = function() {
    const user = window.YFM.getUser();
    const userNameEl = document.getElementById('userName');
    const userRoleEl = document.getElementById('userRole');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (user && userNameEl) {
      userNameEl.textContent = user.nome;
      userNameEl.style.display = 'inline';
    }
    
    if (user && userRoleEl) {
      userRoleEl.textContent = 'Demo';
      userRoleEl.style.display = 'inline';
    }
    
    if (logoutBtn) {
      logoutBtn.style.display = user ? 'inline-block' : 'none';
    }
  };

  window.YFM.navigateTo = async (page, params) => {
    // Pagina login sempre accessibile
    const publicPages = ['login'];
    
    if (!publicPages.includes(page) && !window.YFM.isDemo()) {
      window.YFM.navigateTo('login');
      return;
    }

    // Nascondi sidebar/header sulla login, mostra nelle altre pagine
    const sidebar = document.getElementById('sidebar');
    const header = document.querySelector('.header');
    const content = document.querySelector('.content');
    if (publicPages.includes(page)) {
      if (sidebar) sidebar.style.display = 'none';
      if (header) header.style.display = 'none';
      if (content) content.style.marginLeft = '0';
      document.querySelector('.main').style.marginLeft = '0';
    } else {
      if (sidebar) sidebar.style.display = '';
      if (header) header.style.display = '';
      if (content) content.style.marginLeft = '';
      document.querySelector('.main').style.marginLeft = '';
    }

    const container = document.getElementById('pageContent');
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Caricamento...</div>';
    
    window.YFM.currentPage = page;

    // Mostra tooltip demo
    if (window.demoManager) {
      setTimeout(() => window.demoManager.showTooltipForPage(page), 1000);
      setTimeout(() => window.demoManager.setupPageHighlights(page), 1500);
    }
    
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
      link.classList.toggle('active', link.dataset.page === page);
    });
    // Espandi submenu training se la pagina è una sotto-pagina
    if (['training', 'trainingSessions', 'trainingPresenze', 'trainingSettings'].includes(page)) {
      const items = document.getElementById('trainingItems');
      const arrow = document.getElementById('trainingArrow');
      if (items) items.classList.remove('collapsed');
      if (arrow) arrow.classList.remove('collapsed');
    }
    
    try {
      const module = await window.YFM.pages[page]();
      if (module.default) {
        if (params) {
          window.YFM.pageParams = params;
        }
        await module.default();
      }
      if (window.YFM?.adjustPageTitleForMobile) {
        window.YFM.adjustPageTitleForMobile();
      }
      window.YFM.updateUserUI?.();
      if (window.demoManager?.isDemo) {
        window.demoManager.trackPageVisit(page);
      }
      // Help contestuale
      if (injectPageHelp) injectPageHelp(page);
    } catch (error) {
      container.innerHTML = `<div class="error-box">Errore: ${error.message}</div>`;
    }
  };
}
