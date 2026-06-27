import { apiFetch } from '../../services/api';

export async function loadSquadre(stagioneId) {
  // In demo mode, skip API call - use hardcoded DEMO_SQUADRE from main.js
  const isDemo = localStorage.getItem('yfm_demo_session') === 'active';
  if (isDemo) {
    return; // Squadre sono già impostate in initDemoSession()
  }
  
  try {
    let allSquadre;
    
    if (stagioneId) {
      // Se passato stagioneId, usa quello
      allSquadre = await apiFetch(`/stagioni/${stagioneId}/squadre`);
    } else {
      // Usa /auth/workspaces se loggato, altrimenti /workspaces
      const isAuthenticated = localStorage.getItem('yfm_token');
      const workspacesEndpoint = isAuthenticated ? '/auth/workspaces' : '/workspaces';
      const workspaces = await apiFetch(workspacesEndpoint);
      
      // Per ora prendi il primo workspace disponibile
      const currentWorkspace = workspaces[0];
      if (currentWorkspace) {
        window.YFM.workspaceInfo = currentWorkspace;
      }
      
      // Cerca stagioni del workspace e prendi quella attiva
      const stagioni = await apiFetch(`/workspaces/${currentWorkspace?.id}/stagioni`);
      const stagioneAttiva = stagioni.find(s => s.is_attiva) || stagioni[0];
      
      if (stagioneAttiva) {
        allSquadre = await apiFetch(`/stagioni/${stagioneAttiva.id}/squadre`);
      } else {
        allSquadre = [];
      }
    }
    
    window.YFM.allSquadre = allSquadre;
    const sel = document.getElementById('squadraSelect');
    if (sel) {
      sel.innerHTML = allSquadre.map(s => 
        `<option value="${s.id}" ${s.id === window.YFM.squadraId ? 'selected' : ''}>${s.nome}</option>`
      ).join('');
      sel.addEventListener('change', e => {
        window.YFM.squadraId = e.target.value;
        window.YFM.allPlayers = [];
        window.YFM.allMatches = [];
        window.YFM.navigateTo(window.YFM.currentPage);
      });
    }
    if (allSquadre.length > 0 && !allSquadre.find(s => s.id === window.YFM.squadraId)) {
      window.YFM.squadraId = allSquadre[0].id;
    }
  } catch (err) {
    console.error('loadSquadre error:', err);
  }
}

// Assicura che window.YFM esista
window.YFM = window.YFM || {};
window.YFM.getSquadraName = () => {
  const s = window.YFM.allSquadre.find(x => x.id === window.YFM.squadraId);
  return s ? s.nome : 'Squadra';
};

window.YFM.getSquadra = () => {
  return window.YFM.allSquadre.find(x => x.id === window.YFM.squadraId) || {};
};

window.YFM.getSocietaName = () => {
  return window.YFM.workspaceInfo ? window.YFM.workspaceInfo.nome : 'La tua Società';
};
