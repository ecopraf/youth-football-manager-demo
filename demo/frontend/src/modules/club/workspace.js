import { apiFetch } from '../../services/api';

export async function loadWorkspaceInfo() {
  try {
    // Usa il workspace già impostato in window.YFM.workspaceInfo
    // (impostato da main.js o workspaceSwitcher)
    let ws = window.YFM.workspaceInfo;
    
    if (!ws) {
      // Fallback: carica da /auth/workspaces
      const workspaces = await apiFetch('/auth/workspaces');
      ws = workspaces[0];
      if (ws) {
        window.YFM.workspaceInfo = ws;
        window.YFM.activeWorkspaceId = ws.id;
      }
    }
    
    if (ws) {
      document.getElementById('workspaceName').textContent = ws.nome || 'Società';
      const hn = document.getElementById('headerSocName');
      if (hn) hn.textContent = ws.nome || 'Società';
      const logo = document.getElementById('headerLogo');
      if (logo && ws.logo_url) {
        logo.src = ws.logo_url;
        logo.style.display = 'block';
      }
    }
  } catch (e) {
    console.error('loadWorkspaceInfo error:', e);
    document.getElementById('workspaceName').textContent = 'Società';
  }
}
