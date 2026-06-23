import { apiFetch } from '../../services/api';
import { getAvatarColor } from '../../utils/formatters';
import { showLoading, hideLoading } from '../../utils/ui';

export async function openFormazioneForm(mid) {
  const match = window.YFM.allMatches.find(m => m.id === mid) || {};
  const [convocazioni, formazioneEsistente, giocatori] = await Promise.all([
    apiFetch('/partite/' + mid + '/convocazioni').catch(() => []),
    apiFetch('/partite/' + mid + '/formazione').catch(() => []),
    apiFetch('/squadre/' + window.YFM.squadraId + '/calciatori').catch(() => [])
  ]);

  const convocatiIds = convocazioni.filter(c => c.presente === true).map(c => c.calciatoreId);
  const ruoloOrder = ['Portiere', 'Difensore', 'Centrocampista', 'Attaccante'];
  const giocatoriConvocati = giocatori.filter(g => convocatiIds.includes(g.id)).sort((a, b) => {
    const ra = ruoloOrder.indexOf(a.ruolo), rb = ruoloOrder.indexOf(b.ruolo);
    if (ra !== rb) return ra - rb;
    return a.cognome.localeCompare(b.cognome);
  });

  const formMap = {};
  (formazioneEsistente || []).forEach(f => { formMap[f.calciatoreId] = f; });

  let html = '<p style="margin-bottom:16px;"><strong>Formazione - ' + window.YFM.getSocietaName() + ' vs ' + match.avversario + '</strong></p>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">';

  // Titolari
  html += '<div><h4 style="margin-bottom:8px;">Titolari <span id="cntTitolari" style="font-size:12px;color:var(--gray);"></span></h4>';
  giocatoriConvocati.forEach(g => {
    const f = formMap[g.id];
    const checked = f && f.posizione === 'Titolare' ? ' checked' : '';
    html += '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;"><input type="checkbox"' + checked + ' data-pid="' + g.id + '" class="form-check-tit" style="accent-color:var(--green);"><span style="flex:1;">' + g.nome + ' ' + g.cognome + ' <span style="color:var(--gray);font-size:12px;">(' + g.ruolo + ')</span></span><input type="number" value="' + (f ? f.numeroMaglia : g.numeroMaglia) + '" data-pid="' + g.id + '" class="form-num-tit" style="width:50px;padding:4px;" placeholder="N."></div>';
  });
  html += '</div>';

  // Panchina
  html += '<div><h4 style="margin-bottom:8px;">Panchina <span id="cntRiserve" style="font-size:12px;color:var(--gray);"></span></h4>';
  giocatoriConvocati.forEach(g => {
    const f = formMap[g.id];
    const checked = f && f.posizione === 'Panchina' ? ' checked' : '';
    html += '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;"><input type="checkbox"' + checked + ' data-pid="' + g.id + '" class="form-check-pan" style="accent-color:var(--orange);"><span style="flex:1;">' + g.nome + ' ' + g.cognome + ' <span style="color:var(--gray);font-size:12px;">(' + g.ruolo + ')</span></span><input type="number" value="' + (f ? f.numeroMaglia : g.numeroMaglia) + '" data-pid="' + g.id + '" class="form-num-pan" style="width:50px;padding:4px;" placeholder="N."></div>';
  });
  html += '</div></div>';

  const footer = '<button class="btn btn-secondary" id="modalCancel">Annulla</button><button class="btn btn-primary" id="saveFormBtn">💾 Salva Formazione</button>';
  const modal = createModal('👥 Formazione', html, footer, '800px');

  // Mutua esclusione e contatori
  const updateCounters = () => {
    const titChecked = document.querySelectorAll('#currentModal .form-check-tit:checked').length;
    const panChecked = document.querySelectorAll('#currentModal .form-check-pan:checked').length;
    document.getElementById('cntTitolari').textContent = titChecked + '/11 titolari';
    document.getElementById('cntRiserve').textContent = panChecked + ' riserve';
    const saveBtn = document.getElementById('saveFormBtn');
    if (saveBtn) {
      saveBtn.disabled = titChecked !== 11;
      saveBtn.style.opacity = titChecked === 11 ? '1' : '0.5';
    }
    document.querySelectorAll('#currentModal .form-check-tit:not(:checked)').forEach(cb => { cb.disabled = titChecked >= 11; });
  };

  document.querySelectorAll('#currentModal .form-check-tit').forEach(cbTit => {
    cbTit.addEventListener('change', () => {
      if (cbTit.checked) {
        const pan = document.querySelector('#currentModal .form-check-pan[data-pid="' + cbTit.dataset.pid + '"]');
        if (pan) pan.checked = false;
      } else {
        const pan = document.querySelector('#currentModal .form-check-pan[data-pid="' + cbTit.dataset.pid + '"]');
        if (pan) pan.checked = true;
      }
      updateCounters();
    });
  });

  document.querySelectorAll('#currentModal .form-check-pan').forEach(cbPan => {
    cbPan.addEventListener('change', () => {
      if (cbPan.checked) {
        const tit = document.querySelector('#currentModal .form-check-tit[data-pid="' + cbPan.dataset.pid + '"]');
        if (tit) tit.checked = false;
      }
      updateCounters();
    });
  });

  updateCounters();

  document.getElementById('saveFormBtn').addEventListener('click', async () => {
    const formazione = [];
    document.querySelectorAll('#currentModal .form-check-tit:checked').forEach(cb => {
      const pid = cb.dataset.pid;
      const numInput = document.querySelector('#currentModal .form-num-tit[data-pid="' + pid + '"]');
      formazione.push({ calciatoreId: pid, numeroMaglia: parseInt(numInput?.value) || giocatoriConvocati.find(g => g.id === pid)?.numeroMaglia || 99, posizione: 'Titolare', capitano: false, viceCapitano: false });
    });
    document.querySelectorAll('#currentModal .form-check-pan:checked').forEach(cb => {
      const pid = cb.dataset.pid;
      const numInput = document.querySelector('#currentModal .form-num-pan[data-pid="' + pid + '"]');
      formazione.push({ calciatoreId: pid, numeroMaglia: parseInt(numInput?.value) || giocatoriConvocati.find(g => g.id === pid)?.numeroMaglia || 99, posizione: 'Panchina', capitano: false, viceCapitano: false });
    });

    const assegnati = new Set(formazione.map(f => f.calciatoreId));
    const nonAssegnati = giocatoriConvocati.filter(g => !assegnati.has(g.id));
    if (nonAssegnati.length > 0 && !confirm('Ci sono ' + nonAssegnati.length + ' convocati non assegnati. Procedere?')) return;

    showLoading();
    await apiFetch('/partite/' + mid + '/formazione', { method: 'PUT', body: JSON.stringify({ formazione }) });
    hideLoading();
    modal.close();
    alert('✅ Formazione salvata! La distinta è aggiornata.');
  });
}

function createModal(title, content, footer, maxW = '600px') {
  const existing = document.getElementById('currentModal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.className = 'modal-overlay'; modal.id = 'currentModal';
  modal.innerHTML = '<div class="modal-content" style="max-width:' + maxW + ';"><div class="modal-header"><h2>' + title + '</h2><button class="modal-close-btn" id="modalCloseX">×</button></div><div class="modal-body">' + content + '</div>' + (footer ? '<div class="modal-footer">' + footer + '</div>' : '') + '</div>';
  document.body.appendChild(modal);
  const close = () => { const m = document.getElementById('currentModal'); if (m) m.remove(); };
  document.getElementById('modalCloseX').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  const cancelBtn = document.getElementById('modalCancel');
  if (cancelBtn) cancelBtn.addEventListener('click', close);
  return { modal, closeModal: close, close };
}
