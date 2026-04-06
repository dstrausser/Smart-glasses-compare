// State
let selectedIds = new Set();
let filteredProducts = [...smartGlasses];

// DOM refs
const grid = document.getElementById('productGrid');
const compareBar = document.getElementById('compareBar');
const compareCount = document.getElementById('compareCount');
const compareBtn = document.getElementById('compareBtn');
const clearCompare = document.getElementById('clearCompare');
const compareModal = document.getElementById('compareModal');
const modalClose = document.getElementById('modalClose');
const compareTable = document.getElementById('compareTable');
const detailModal = document.getElementById('detailModal');
const detailTitle = document.getElementById('detailTitle');
const detailBody = document.getElementById('detailBody');
const detailClose = document.getElementById('detailClose');
const categoryFilter = document.getElementById('categoryFilter');
const priceFilter = document.getElementById('priceFilter');
const sortFilter = document.getElementById('sortFilter');
const searchInput = document.getElementById('searchInput');

// Render
function renderCards() {
  if (filteredProducts.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1">
        <h3>No glasses found</h3>
        <p>Try adjusting your filters or search term.</p>
      </div>`;
    return;
  }

  grid.innerHTML = filteredProducts.map(p => {
    const isSelected = selectedIds.has(p.id);
    const badgeClass = `badge-${p.category}`;
    const priceStr = p.price ? `$${p.price.toLocaleString()}` : 'TBA';
    const priceNote = p.priceNote ? `<span class="price-note">${p.priceNote}</span>` : '';

    const chips = [];
    if (p.specs.weight) chips.push(p.specs.weight);
    if (p.specs.battery) chips.push(p.specs.battery);
    if (p.specs.display && p.specs.display !== 'No display' && p.specs.display !== 'None (audio-only base model)')
      chips.push(p.specs.display.split(',')[0]);

    return `
      <div class="product-card ${isSelected ? 'selected' : ''}" data-id="${p.id}">
        <div class="card-header">
          <span class="card-icon">${p.image}</span>
          <span class="category-badge ${badgeClass}">${p.categoryLabel}</span>
        </div>
        <div class="card-title">${p.name}</div>
        <div class="card-brand">${p.brand} &middot; ${p.releaseYear}</div>
        <div class="card-summary">${p.summary}</div>
        <div class="card-price">${priceStr}${priceNote}</div>
        <div class="card-specs">
          ${chips.map(c => `<span class="spec-chip">${c}</span>`).join('')}
        </div>
        <div class="card-actions">
          <button class="btn-detail" onclick="event.stopPropagation(); showDetail(${p.id})">Details</button>
          <button class="btn-compare ${isSelected ? 'active' : ''}" onclick="event.stopPropagation(); toggleCompare(${p.id})">
            ${isSelected ? 'Selected' : 'Compare'}
          </button>
        </div>
      </div>`;
  }).join('');
}

function toggleCompare(id) {
  if (selectedIds.has(id)) {
    selectedIds.delete(id);
  } else {
    if (selectedIds.size >= 10) return; // max 10
    selectedIds.add(id);
  }
  updateCompareBar();
  renderCards();
}

function updateCompareBar() {
  const count = selectedIds.size;
  compareCount.textContent = count;
  compareBar.classList.toggle('active', count > 0);
  compareBtn.disabled = count < 2;
}

function showCompareModal() {
  const products = smartGlasses.filter(p => selectedIds.has(p.id));
  if (products.length < 2) return;

  const specKeys = [
    ['Category', 'categoryLabel'],
    ['Price', null],
    ['Display', 'display'],
    ['Field of View', 'fov'],
    ['Camera', 'camera'],
    ['Video', 'video'],
    ['Audio', 'audio'],
    ['Battery', 'battery'],
    ['Weight', 'weight'],
    ['Connectivity', 'connectivity'],
    ['Processor', 'processor'],
    ['AI Assistant', 'assistant'],
    ['Operating System', 'os'],
    ['Storage', 'storage'],
    ['Tracking', 'tracking'],
    ['Controllers', 'controllers'],
    ['Water Resistance', 'waterResistance'],
    ['Lenses', 'lenses'],
    ['Key Features', 'features'],
  ];

  let html = '<table class="compare-table">';
  // Header row
  html += '<tr><th></th>';
  products.forEach(p => {
    html += `<td class="product-name-cell">${p.image} ${p.name}</td>`;
  });
  html += '</tr>';

  specKeys.forEach(([label, key]) => {
    html += `<tr><th>${label}</th>`;
    products.forEach(p => {
      let val;
      if (key === 'categoryLabel') {
        val = p.categoryLabel;
      } else if (key === null) {
        val = p.price ? `$${p.price.toLocaleString()}` : (p.priceNote || 'TBA');
      } else if (key === 'features') {
        const feats = p.specs.features || [];
        val = feats.map(f => `<span style="display:inline-block;background:var(--bg);border:1px solid var(--border);padding:2px 6px;border-radius:4px;margin:2px;font-size:0.75rem">${f}</span>`).join('');
      } else {
        val = p.specs[key] || '—';
      }
      html += `<td>${val}</td>`;
    });
    html += '</tr>';
  });

  html += '</table>';
  compareTable.innerHTML = html;
  compareModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function showDetail(id) {
  const p = smartGlasses.find(g => g.id === id);
  if (!p) return;

  detailTitle.textContent = `${p.image} ${p.name}`;
  const priceStr = p.price ? `$${p.price.toLocaleString()}` : (p.priceNote || 'TBA');

  const specEntries = Object.entries(p.specs).filter(([k]) => k !== 'features');
  const features = p.specs.features || [];

  const specLabels = {
    display: 'Display', fov: 'Field of View', camera: 'Camera', video: 'Video',
    audio: 'Audio', battery: 'Battery', charging: 'Charging', weight: 'Weight',
    connectivity: 'Connectivity', processor: 'Processor', assistant: 'AI Assistant',
    os: 'Operating System', storage: 'Storage', tracking: 'Tracking',
    controllers: 'Controllers', waterResistance: 'Water Resistance',
    lenses: 'Lenses', frameStyles: 'Frame Styles',
  };

  detailBody.innerHTML = `
    <div class="detail-section">
      <h3>Overview</h3>
      <div class="detail-grid">
        <div class="detail-item">
          <div class="label">Brand</div>
          <div class="value">${p.brand}</div>
        </div>
        <div class="detail-item">
          <div class="label">Category</div>
          <div class="value">${p.categoryLabel}</div>
        </div>
        <div class="detail-item">
          <div class="label">Price</div>
          <div class="value" style="color:var(--accent);font-weight:700">${priceStr}</div>
        </div>
        <div class="detail-item">
          <div class="label">Release Year</div>
          <div class="value">${p.releaseYear}</div>
        </div>
      </div>
      <p style="margin-top:0.75rem;color:var(--text-muted);font-size:0.85rem">${p.summary}</p>
    </div>

    <div class="detail-section">
      <h3>Specifications</h3>
      <div class="detail-grid">
        ${specEntries.map(([k, v]) => `
          <div class="detail-item">
            <div class="label">${specLabels[k] || k}</div>
            <div class="value">${v}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="detail-section">
      <h3>Key Features</h3>
      <ul class="feature-list">
        ${features.map(f => `<li>${f}</li>`).join('')}
      </ul>
    </div>
  `;

  detailModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModals() {
  compareModal.classList.remove('active');
  detailModal.classList.remove('active');
  document.body.style.overflow = '';
}

function applyFilters() {
  const cat = categoryFilter.value;
  const price = priceFilter.value;
  const sort = sortFilter.value;
  const search = searchInput.value.toLowerCase().trim();

  filteredProducts = smartGlasses.filter(p => {
    if (cat !== 'all' && p.category !== cat) return false;

    if (price !== 'all') {
      if (!p.price) return false;
      if (price === '0-500' && p.price >= 500) return false;
      if (price === '500-1000' && (p.price < 500 || p.price >= 1000)) return false;
      if (price === '1000-2000' && (p.price < 1000 || p.price >= 2000)) return false;
      if (price === '2000+' && p.price < 2000) return false;
    }

    if (search) {
      const haystack = `${p.name} ${p.brand} ${p.summary} ${p.categoryLabel} ${(p.specs.features || []).join(' ')}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    return true;
  });

  filteredProducts.sort((a, b) => {
    switch (sort) {
      case 'price-low':
        return (a.price || 99999) - (b.price || 99999);
      case 'price-high':
        return (b.price || 0) - (a.price || 0);
      case 'weight': {
        const wa = parseFloat(a.specs.weight) || 9999;
        const wb = parseFloat(b.specs.weight) || 9999;
        return wa - wb;
      }
      case 'battery': {
        const ba = parseFloat(a.specs.battery) || 0;
        const bb = parseFloat(b.specs.battery) || 0;
        return bb - ba;
      }
      default:
        return a.name.localeCompare(b.name);
    }
  });

  renderCards();
}

// Events
categoryFilter.addEventListener('change', applyFilters);
priceFilter.addEventListener('change', applyFilters);
sortFilter.addEventListener('change', applyFilters);
searchInput.addEventListener('input', applyFilters);

compareBtn.addEventListener('click', showCompareModal);
clearCompare.addEventListener('click', () => {
  selectedIds.clear();
  updateCompareBar();
  renderCards();
});

modalClose.addEventListener('click', closeModals);
detailClose.addEventListener('click', closeModals);

compareModal.addEventListener('click', (e) => {
  if (e.target === compareModal) closeModals();
});
detailModal.addEventListener('click', (e) => {
  if (e.target === detailModal) closeModals();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModals();
});

// Init
applyFilters();
