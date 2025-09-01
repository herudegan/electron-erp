// Track editing state (null = creating)
let editingId = null;
// Cache of clients loaded from DB for lookups (edit/delete)
let currentClients = [];


// Creating table
function renderTableRows(clients) {
  const tbody = document.getElementById('clientes-tbody');
  if (!tbody) return;
  tbody.innerHTML = clients.map(c => `
  <tr>
      <td>${c.name}</td>
      <td>${c.cnpj}</td>
      <td>${c.email ?? ''}</td>
      <td>
        <div class="actions">
            <button class="btn ghost btn-alterar" data-id="${c.id ?? c.id_client ?? c.fid_client}">Alterar</button>
            <button class="btn ghost btn-excluir" data-id="${c.id ?? c.id_client ?? c.fid_client}">Excluir</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function wireActions() {
  const tbody = document.getElementById('clientes-tbody');
  if (!tbody) return;

  tbody.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    // Handle Alterar: get id from the button's dataset
    const alterBtn = target.closest('.btn-alterar');
    if (alterBtn instanceof HTMLElement) {
      const idStr = alterBtn.dataset.id;
      if (!idStr) return;
      const client = currentClients.find(c => String(c.id ?? c.id_client ?? c.fid_client) === idStr);
      openCadastroModal(client ?? null);
      return;
    }

    // Handle Excluir (optional): similar pattern
    const delBtn = target.closest('.btn-excluir');
    if (delBtn instanceof HTMLElement) {
      const idStr = delBtn.dataset.id;
      if (!idStr) return;
      deleteClients(idStr);
      return;
    }
  });
}

function wireCadastrar() {
  const btn = document.getElementById('btn-cadastrar');
  if (!btn) return;
  btn.addEventListener('click', () => {
    openCadastroModal();
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  const clients = await getClients();
  currentClients = Array.isArray(clients) ? clients : [];
  renderTableRows(currentClients);
  wireActions();
  wireCadastrar();
  // Ensure modal starts closed and handlers are wired
  const overlay = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close');
  if (overlay) overlay.hidden = true;
  if (closeBtn) closeBtn.addEventListener('click', closeCadastroModal);
  if (overlay) overlay.addEventListener('click', overlayClickToClose);

  // Handle form submit (create or update)
  const form = document.getElementById('cadastro-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const cnpj = String(data.get('cnpj') || '').trim();
      const email = String(data.get('email') || '').trim();
      if (!name || !cnpj) return;

      try {
        if (editingId != null) {
          // TODO: implement IPC update; for now update locally
          const result = await updateClients({ editingId, name, cnpj, email });
          if (result && result.error) {
            console.error('Update failed:', result.error);
          }
        } else {
          // create via IPC and then refresh from DB to get server-generated fields
          const result = await createClients({ name, cnpj, email });
          if (result && result.error) {
            console.error('Create failed:', result.error);
          }
        }
        // Refresh list from DB to reflect latest state
        const refreshed = await getClients();
        currentClients = Array.isArray(refreshed) ? refreshed : currentClients;
        renderTableRows(currentClients);
        form.reset();
        closeCadastroModal();
      } catch (err) {
        console.error('Submit failed:', err);
      }
    });
  }
});

// Modal logic
function openCadastroModal(client) {
  const overlay = document.getElementById('modal-overlay');
  const form = document.getElementById('cadastro-form');
  if (!overlay || !form) return;
  // Prefill when editing
  const nameEl = /** @type {HTMLInputElement} */(form.querySelector('#name'));
  const cnpjEl = /** @type {HTMLInputElement} */(form.querySelector('#cnpj'));
  const emailEl = /** @type {HTMLInputElement} */(form.querySelector('#email'));
  if (client) {
    editingId = String(client.id ?? client.id_client ?? client.fid_client);
    if (nameEl) nameEl.value = client.name;
    if (cnpjEl) cnpjEl.value = client.cnpj;
    if (emailEl) emailEl.value = client.email ?? '';
  } else {
    editingId = null;
    form.reset();
  }
  overlay.hidden = false;
  document.addEventListener('keydown', escToClose);
}

function closeCadastroModal() {
  const overlay = document.getElementById('modal-overlay');
  const form = document.getElementById('cadastro-form');
  if (!overlay) return;
  overlay.hidden = true;
  editingId = null;
  if (form) form.reset();
  document.removeEventListener('keydown', escToClose);
}

function escToClose(e) {
  if (e.key === 'Escape') closeCadastroModal();
}

function overlayClickToClose(e) {
  if (e.target instanceof HTMLElement && e.target.id === 'modal-overlay') closeCadastroModal();
}


async function getClients() {
  try {
    const result = await window.electronAPI?.clients?.select();
    if (!result) {
      console.error('No result from main process');
      return;
    }
    if (result.error) {
      console.error('Error fetching data:', result.error);
    } else {
      return result.data;
    }
  } catch (err) {
    console.error('IPC error calling clients:select:', err);
  }
}
async function createClients(client) {
    try {
        const result = await window.electronAPI?.clients?.insert(client);
        if (!result) {
            console.error('No result from main process');
            return;
        }
        if (result.error) {
            console.error('Error creating client:', result.error);
        } else {
            return result.data;
        }
    } catch (err) {
        console.error('IPC error calling clients:create:', err);
    }
}
async function updateClients(client) {
    try {
        const result = await window.electronAPI?.clients?.update(client);
        if (!result) {
            console.error('No result from main process');
            return;
        }
        if (result.error) {
            console.error('Error updating client:', result.error);
        } else {
            return result.data;
        }
    } catch (err) {
        console.error('IPC error calling clients:update:', err);
    }
}
async function deleteClients(id) {
    try {
        const result = await window.electronAPI?.clients?.delete(id);
        if (!result) {
            console.error('No result from main process');
            return;
        }
        if (result.error) {
            console.error('Error deleting client:', result.error);
        } else {
            alert("Cliente excluido com sucesso") // Mudar para uma notificação temporária no canto superior direito
            return result.data;
        }
    } catch (err) {
        console.error('IPC error calling clients:delete:', err);
    }
}