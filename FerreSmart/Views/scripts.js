lucide.createIcons();

const API_BASE_URL = 'https:/localhost:7091/api/ferreSmart';

const state = {
    productos: [],
    loading: false,
    selected: null,
    formMode: null,
    lastUpdate: null
};

const tableBody = document.getElementById('tableBody');
const notification = document.getElementById('notification');
const notificationMsg = document.getElementById('notificationMsg');
const notificationIcon = document.getElementById('notificationIcon');
const notificationClose = document.getElementById('notificationClose');
const modalContainer = document.getElementById('modalContainer');
const lastUpdateEl = document.getElementById('lastUpdate');

const notificationIconWrapper = document.getElementById('notificationIconWrapper');

function showNotification(msg, type = 'success') {
    notificationMsg.textContent = msg;

    const iconName = type === 'success' ? 'check-circle' : 'x-octagon';
    const iconColor = type === 'success' ? 'text-green-600' : 'text-red-600';

    notificationIconWrapper.innerHTML = `<i data-lucide="${iconName}" class="w-5 h-5 ${iconColor}"></i>`;

    if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }

    const el = notification.firstElementChild;
    el.classList.remove('translate-x-6', 'opacity-0');
    el.classList.add('-translate-x-0');
    notification.style.pointerEvents = 'auto';
    notification.classList.remove('opacity-0');
    notification.style.transition = 'transform 250ms ease, opacity 250ms ease';
    notification.style.transform = 'translateX(0)';
    notification.style.opacity = '1';

    if (notification._hideTimeout) clearTimeout(notification._hideTimeout);
    notification._hideTimeout = setTimeout(hideNotification, 3500);
}
function hideNotification() {
    const el = notification.firstElementChild;
    if (!el) return;
    el.classList.add('translate-x-6');
    notification.style.transition = 'transform 200ms ease, opacity 200ms ease';
    notification.style.transform = '';
    notification.style.opacity = '0';
    notification.style.pointerEvents = 'none';
}

notificationClose.addEventListener('click', hideNotification);

function openModal(mode, id = null) {
    state.formMode = mode;
    state.selected = state.productos.find(p => p.id === id) || null;

    modalContainer.innerHTML = `
            <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" tabindex="-1"></div>
            <div role="dialog" aria-modal="true" class="relative w-full max-w-md mx-auto">
              <div id="modalPanel" class="bg-white rounded-2xl shadow-xl transform transition-all duration-200 ease-out scale-95 opacity-0">
                <!-- contenido más abajo -->
              </div>
            </div>
          `;

    const panel = modalContainer.querySelector('#modalPanel');

    if (mode === 'delete') {
        const s = state.selected || {};
        panel.innerHTML = `
              <div class="p-6">
                <div class="flex items-start gap-4 mb-4">
                  <div class="p-2 bg-red-50 rounded-full">
                    <i data-lucide="trash" class="w-5 h-5 text-red-600"></i>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold">Eliminar producto</h3>
                    <p class="text-sm text-gray-600">¿Seguro que deseas eliminar <strong class="text-gray-900">${s.name || ''}</strong>?</p>
                  </div>
                </div>
                <div class="flex gap-3 mt-4">
                  <button class="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50" onclick="closeModal()">Cancelar</button>
                  <button class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700" onclick="deleteProduct()">Eliminar</button>
                </div>
              </div>
            `;
    } else {
        const p = state.selected || { name: '', category: '', price: '', stock: '' };
        panel.innerHTML = `
              <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg font-semibold">${mode === 'add' ? 'Nuevo Producto' : 'Editar Producto'}</h3>
                  <button aria-label="Cerrar" onclick="closeModal()" class="text-gray-400 hover:text-gray-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>

                <div class="space-y-3">
                  <div>
                    <label class="block text-sm text-gray-700">Nombre</label>
                    <input id="formName" class="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900" value="${p.name}">
                  </div>
                  <div>
                    <label class="block text-sm text-gray-700">Categoría</label>
                    <input id="formCategory" class="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900" value="${p.category}">
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm text-gray-700">Precio</label>
                      <input id="formPrice" type="number" step="0.01" class="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900" value="${p.price}">
                    </div>
                    <div>
                      <label class="block text-sm text-gray-700">Stock</label>
                      <input id="formStock" type="number" class="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900" value="${p.stock}">
                    </div>
                  </div>
                </div>

                <div class="flex gap-3 mt-5">
                  <button class="flex-1 px-4 py-2 border border-gray-200 rounded-lg" onclick="closeModal()">Cancelar</button>
                  <button id="saveBtn" class="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg" onclick="${mode === 'add' ? 'addProduct()' : 'updateProduct()'}">${mode === 'add' ? 'Crear' : 'Guardar'}</button>
                </div>
              </div>
            `;
    }

    lucide.createIcons();
    modalContainer.classList.remove('hidden');

    // Forzar reflow para animar
    requestAnimationFrame(() => {
        panel.classList.remove('scale-95', 'opacity-0');
        panel.classList.add('scale-100', 'opacity-100');
    });

    // cerrar con ESC
    function escHandler(e) { if (e.key === 'Escape') closeModal(); }
    document.addEventListener('keydown', escHandler, { once: true });
}

function closeModal() {
    const panel = modalContainer.querySelector('#modalPanel');
    if (panel) {
        panel.classList.add('scale-95', 'opacity-0');
        setTimeout(() => { modalContainer.classList.add('hidden'); modalContainer.innerHTML = ''; }, 180);
    } else {
        modalContainer.classList.add('hidden'); modalContainer.innerHTML = '';
    }
    state.formMode = null; state.selected = null;
}

// Render tabla con microinteracciones
function renderTable() {
    if (!state.productos.length) {
        tableBody.innerHTML = `<tr><td colspan="6" class="px-6 py-12 text-center text-gray-400">No hay productos registrados</td></tr>`;
        return;
    }

    tableBody.innerHTML = state.productos.map(p => `
            <tr class="group hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 font-mono text-xs text-gray-600">${p.id}</td>
              <td class="px-6 py-4 font-medium">${p.name}</td>
              <td class="px-6 py-4 text-sm text-gray-600">${p.category}</td>
              <td class="px-6 py-4 font-medium">$${Number(p.price).toFixed(2)}</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${p.stock > 10 ? 'bg-green-100 text-green-800' : p.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">${p.stock}</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex gap-2 group-hover:opacity-100 transform group-hover:translate-x-0 transition-all">
                  <button class="p-1.5 rounded" onclick="openModal('edit', ${p.id})"><i data-lucide='edit-2' class='h-4 w-4'></i></button>
                  <button class="p-1.5 rounded text-red-600" onclick="openModal('delete', ${p.id})"><i data-lucide='trash-2' class='h-4 w-4 text-black'></i></button>
                </div>
              </td>
            </tr>
          `).join('');

    lucide.createIcons();
}

let searchTimeout = null;
async function fetchProductos(query = '') {
    state.loading = true;
    tableBody.innerHTML = `<tr><td colspan="6" class="px-6 py-12"><div class="h-3 w-3 rounded-full animate-pulse bg-gray-200 inline-block mr-2"></div> Cargando...</td></tr>`;
    try {
        const url = query ? `${API_BASE_URL}/buscarProducto/${encodeURIComponent(query)}` : `${API_BASE_URL}/obtenerProductos`;
        const res = await fetch(url);
        const data = await res.json();
        state.productos = Array.isArray(data) ? data : (data.data || []);
        state.lastUpdate = new Date().toLocaleString('es-ES');
        lastUpdateEl.textContent = state.lastUpdate;
        renderTable();
    } catch (e) {
        console.error(e);
        showNotification('Error cargando productos', 'error');
        tableBody.innerHTML = `<tr><td colspan="6" class="px-6 py-12 text-center text-red-400">Error al cargar</td></tr>`;
    } finally { state.loading = false; }
}

async function addProduct() {
    const name = document.getElementById('formName').value.trim();
    const category = document.getElementById('formCategory').value.trim();
    const price = parseFloat(document.getElementById('formPrice').value);
    const stock = parseInt(document.getElementById('formStock').value);

    if (!name) {
        showNotification('El nombre del producto es obligatorio.', 'error');
        return;
    } else if (!category) {
        showNotification('La categoría del producto es obligatoria.', 'error');
        return;
    } else if (isNaN(price) || price <= 0) {
        showNotification('El precio debe ser mayor que cero.', 'error');
        return;
    } else if (isNaN(stock) || stock < 0) {
        showNotification('El stock no puede ser negativo.', 'error');
        return;
    }

    try {
        await fetch(`${API_BASE_URL}/crearProducto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, category, price, stock })
        });
        showNotification('Producto creado', 'success');
        closeModal();
        fetchProductos();
    } catch {
        showNotification('Error al crear', 'error');
    }
}
async function updateProduct() {
    const name = document.getElementById('formName').value.trim();
    const category = document.getElementById('formCategory').value.trim();
    const price = parseFloat(document.getElementById('formPrice').value);
    const stock = parseInt(document.getElementById('formStock').value);
    if (!name) {
        showNotification('El nombre del producto es obligatorio.', 'error');
        return;
    } else if (!category) {
        showNotification('La categoría del producto es obligatoria.', 'error');
        return;
    } else if (isNaN(price) || price <= 0) {
        showNotification('El precio debe ser mayor que cero.', 'error');
        return;
    } else if (isNaN(stock) || stock < 0) {
        showNotification('El stock no puede ser negativo.', 'error');
        return;
    }
    try {
        await fetch(`${API_BASE_URL}/actualizarProducto/${state.selected.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, category, price, stock }) });
        showNotification('Producto actualizado', "success"); closeModal(); fetchProductos();
    } catch {
        showNotification('Error al actualizar', 'error');
    }
}

async function deleteProduct() {
    try {
        await fetch(`${API_BASE_URL}/eliminarProducto/${state.selected.id}`, { method: 'DELETE' });
        showNotification('Producto eliminado'); closeModal(); fetchProductos();
    } catch {
        showNotification('Error al eliminar', 'error');
    }
}

// Búsqueda con debounce
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearSearch');
searchInput.addEventListener('input', (e) => {
    const v = e.target.value.trim();
    clearBtn.classList.toggle('opacity-0', v === '');
    clearBtn.classList.toggle('pointer-events-none', v === '');
    clearBtn.classList.toggle('opacity-100', v !== '');

    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => { fetchProductos(v); }, 350);
});

clearBtn.addEventListener('click', () => { searchInput.value = ''; searchInput.dispatchEvent(new Event('input')); });

document.getElementById('searchForm').addEventListener('submit', (e) => { e.preventDefault(); fetchProductos(searchInput.value.trim()); });
document.getElementById('addBtn').addEventListener('click', () => openModal('add'));

// Popover filtros

// Init
fetchProductos();