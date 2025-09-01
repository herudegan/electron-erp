// Track editing state (null = creating)
let editingId = null;
// Cache of products loaded from DB for lookups (edit/delete)
let currentProducts = [];


// Creating table
function renderTableRows(products) {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;
  tbody.innerHTML = products.map(p => `
  <tr>
      <td>${p.name}</td>
      <td>${p.sku}</td>
      <td>${p.price ?? ''}</td>
      <td>
        <div class="actions">
            <button class="btn ghost btn-alterar" data-id="${p.id ?? p.id_product ?? p.fid_product}">Alterar</button>
            <button class="btn ghost btn-excluir" data-id="${p.id ?? p.id_product ?? p.fid_product}">Excluir</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function wireActions() {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;

  tbody.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    // Handle Alterar: get id from the button's dataset
    const alterBtn = target.closest('.btn-alterar');
    if (alterBtn instanceof HTMLElement) {
      const idStr = alterBtn.dataset.id;
      if (!idStr) return;
      const product = currentProducts.find(p => String(p.id ?? p.id_product ?? p.fid_product) === idStr);
      openCadastroModal(product ?? null);
      return;
    }

    // Handle Excluir (optional): similar pattern
    const delBtn = target.closest('.btn-excluir');
    if (delBtn instanceof HTMLElement) {
      const idStr = delBtn.dataset.id;
      if (!idStr) return;
      deleteProducts(idStr);
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
  const products = await getProducts();
  currentProducts = Array.isArray(products) ? products : [];
  renderTableRows(currentProducts);
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
      const sku = String(data.get('sku') || '').trim();
      const priceStr = String(data.get('price') || '').trim();
      const price = priceStr ? Number(priceStr) : null;
      if (!name || !sku) return;

      try {
        if (editingId != null) {
          const result = await updateProducts({ editingId, name, sku, price });
          if (result && result.error) {
            console.error('Update failed:', result.error);
          }
        } else {
          const result = await createProducts({ name, sku, price });
          if (result && result.error) {
            console.error('Create failed:', result.error);
          }
        }
        const refreshed = await getProducts();
        currentProducts = Array.isArray(refreshed) ? refreshed : currentProducts;
        renderTableRows(currentProducts);
        form.reset();
        closeCadastroModal();
      } catch (err) {
        console.error('Submit failed:', err);
      }
    });
  }
});

// Modal logic
function openCadastroModal(product) {
  const overlay = document.getElementById('modal-overlay');
  const form = document.getElementById('cadastro-form');
  if (!overlay || !form) return;
  // Prefill when editing
  const nameEl = /** @type {HTMLInputElement} */(form.querySelector('#name'));
  const skuEl = /** @type {HTMLInputElement} */(form.querySelector('#sku'));
  const priceEl = /** @type {HTMLInputElement} */(form.querySelector('#price'));
  if (product) {
    editingId = String(product.id ?? product.id_product ?? product.fid_product);
    if (nameEl) nameEl.value = product.name;
    if (skuEl) skuEl.value = product.sku;
    if (priceEl) priceEl.value = product.price ?? '';
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


async function getProducts() {
  try {
  const result = await window.electronAPI?.products?.select();
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
  console.error('IPC error calling products:select:', err);
  }
}
async function createProducts(product) {
    try {
    const result = await window.electronAPI?.products?.insert(product);
        if (!result) {
            console.error('No result from main process');
            return;
        }
        if (result.error) {
      console.error('Error creating product:', result.error);
        } else {
            return result.data;
        }
    } catch (err) {
    console.error('IPC error calling products:create:', err);
    }
}
async function updateProducts(product) {
    try {
    const result = await window.electronAPI?.products?.update(product);
        if (!result) {
            console.error('No result from main process');
            return;
        }
        if (result.error) {
      console.error('Error updating product:', result.error);
        } else {
            return result.data;
        }
    } catch (err) {
    console.error('IPC error calling products:update:', err);
    }
}
async function deleteProducts(id) {
    try {
    const result = await window.electronAPI?.products?.delete(id);
        if (!result) {
            console.error('No result from main process');
            return;
        }
        if (result.error) {
      console.error('Error deleting product:', result.error);
        } else {
      alert("Produto excluído com sucesso")
            return result.data;
        }
    } catch (err) {
    console.error('IPC error calling products:delete:', err);
    }
}