export function setupLayout() {
  const userStr = localStorage.getItem('yfm_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const guestStr = localStorage.getItem('yfm_guest');
  const guest = guestStr ? JSON.parse(guestStr) : null;
  
  const isGuest = !!guest;
  const currentUser = user;
  const userInitial = currentUser?.nome ? currentUser.nome[0].toUpperCase() : isGuest ? (guest.tipo === 'atleta' ? 'A' : 'G') : 'U';
  const userName = currentUser?.nome || (isGuest ? (guest.tipo === 'atleta' ? 'Atleta' : 'Genitore') : '');
  const userRole = currentUser?.ruolo || (isGuest ? guest.tipo : '');
  const userRoleLabel = userRole === 'admin' ? 'Amministratore' : userRole === 'staff' ? 'Staff' : userRole === 'allenatore' ? 'Allenatore' : userRole === 'atleta' ? 'Atleta' : userRole === 'genitore' ? 'Genitore' : userRole;
  
  const showForRole = (roles) => {
    if (isGuest) return false;
    if (!currentUser) return false;
    if (currentUser.is_superadmin === true) return true;
    if (typeof roles === 'string') roles = [roles];
    return roles.includes(currentUser.ruolo);
  };

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="layout">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-logo">
          <div class="sidebar-logo-icon">Y</div>
          <span class="sidebar-logo-text">YFM</span>
        </div>
        <div class="sidebar-info">
          <div class="sidebar-info-label">Workspace</div>
          <div class="sidebar-info-workspace" id="workspaceName">Caricamento...</div>
          <div class="sidebar-info-season" id="seasonName">Stagione 2025/26</div>
        </div>
        <nav class="sidebar-nav">
          <a href="#" class="active" data-page="dashboard">📊 Dashboard</a>
          
          ${showForRole(['admin']) ? `
          <div class="sidebar-section-title">🏢 Club</div>
          <a href="#" data-page="settings">⚙️ Impostazioni</a>
          ` : ''}
          
          <div class="sidebar-section-title">👥 Team</div>
          <a href="#" data-page="roster">👥 Rosa</a>
          <a href="#" data-page="calendar">📅 Calendario</a>
          
          <div class="sidebar-section-title">🎯 Coach</div>
          <a href="#" data-page="training">🏃 Allenamenti</a>
          ${showForRole(['admin', 'allenatore', 'staff']) ? `
          <a href="#" data-page="convocazioni" style="display:none;">👥 Convocazioni</a>
          ` : ''}
          
          <div class="sidebar-section-title">📈 Performance</div>
          <a href="#" data-page="stats">📊 Statistiche</a>
          <a href="#" data-page="reports">📄 Report</a>
          
          ${showForRole(['admin']) ? `
          <div class="sidebar-section-title">🔐 Amministrazione</div>
          <a href="#" data-page="users">👥 Utenti</a>
          <a href="#" data-page="guestLinks">🔗 Link Guest</a>
          ` : ''}
        </nav>
        
        <div class="sidebar-user" id="sidebarUser" style="cursor:pointer;display:${(currentUser || guest) ? 'flex' : 'none'};" title="Clicca per logout">
          <div class="sidebar-user-avatar" id="sidebarUserAvatar">${userInitial}</div>
          <div>
            <div class="sidebar-user-name" id="userName">${userName}</div>
            <div class="sidebar-user-role" id="userRole">${userRoleLabel}</div>
          </div>
        </div>
      </aside>
      <div class="main">
        <header class="header">
          <button id="menuBtn">☰</button>
          <img id="headerLogo" src="" style="width:32px;height:32px;border-radius:8px;object-fit:cover;display:none;cursor:pointer;" onclick="updateLogo()" title="Clicca per cambiare logo">
          <span id="headerSocName" style="font-weight:600;color:var(--blue);font-size:15px;margin-left:8px;margin-right:auto;"></span>
          <div class="header-right">
            <select class="header-select" id="squadraSelect"><option>Caricamento...</option></select>
            <div class="player-avatar" id="headerUserAvatar" style="width:36px;height:36px;font-size:14px;cursor:pointer;" title="Logout ${userName}">${userInitial}</div>
          </div>
        </header>
        <div class="content" id="pageContent">
          <div class="loading"><div class="spinner"></div>Caricamento...</div>
        </div>
      </div>
    </div>
  `;

  const sidebar = document.getElementById('sidebar');
  const menuBtn = document.getElementById('menuBtn');
  const sidebarUser = document.getElementById('sidebarUser');
  const headerUserAvatar = document.getElementById('headerUserAvatar');
  
  // Click su avatar/nome utente per logout
  if (sidebarUser) {
    sidebarUser.addEventListener('click', () => {
      if (confirm('Vuoi effettuare il logout?')) {
        window.YFM.handleLogout();
      }
    });
  }
  
  if (headerUserAvatar) {
    headerUserAvatar.addEventListener('click', () => {
      if (confirm('Vuoi effettuare il logout?')) {
        window.YFM.handleLogout();
      }
    });
  }
  
  // Navigazione
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
  
  // Toggle sidebar mobile
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = sidebar.classList.toggle('open');
      document.body.classList.toggle('sidebar-open', isOpen);
    });
  }
  
  // Chiudi sidebar su click fuori
  document.addEventListener('click', (e) => {
    if (!sidebar || window.innerWidth > 768) return;
    if (!sidebar.classList.contains('open')) return;
    if (sidebar.contains(e.target) || (menuBtn && menuBtn.contains(e.target))) return;
    sidebar.classList.remove('open');
    document.body.classList.remove('sidebar-open');
  });
}
