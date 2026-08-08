// Map + filter/card logic for the Cultivated Meat Map site.

const map = L.map('map', { scrollWheelZoom: false }).setView([30, -40], 2.3);
// CartoDB Positron — free, no API key, cleaner/more muted style than default OSM tiles.
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  maxZoom: 20,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
}).addTo(map);

const COLORS = { chicken: '#d97706', salmon: '#e0576b' };
let allLocations = [];
// Cluster group instead of a plain layer group — several locations (e.g. the
// 3 Singapore entries, the 2 DC entries) sit close enough together that at
// world zoom their pins fully overlap and hide each other. Clustering groups
// them into a numbered bubble that expands on click/zoom instead.
let markerLayer = L.markerClusterGroup({ maxClusterRadius: 45, spiderfyOnMaxZoom: true }).addTo(map);
let markerById = {};

const state = { product: new Set(['chicken', 'salmon']), status: new Set(['active', 'stopped']), query: '' };

// Simplified 2-bucket status model for the UI: "active" is currently serving,
// everything else (historical or pilot) reads as "stopped serving". The full
// detail (e.g. that a pilot location gives food away rather than selling it)
// still lives in each location's notes text, just not in the top-level badge.
function statusBucket(status) {
  return status === 'active' ? 'active' : 'stopped';
}

function makeIcon(product, status) {
  const color = COLORS[product] || '#555';
  const opacity = statusBucket(status) === 'active' ? 1 : 0.5;
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};opacity:${opacity};border:2px solid white;box-shadow:0 0 3px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14], iconAnchor: [7, 7], popupAnchor: [0, -7]
  });
}

function popupHtml(loc) {
  const statusLabel = statusBucket(loc.status) === 'active' ? 'Currently serving' : 'Stopped serving';
  return `<strong>${loc.name}</strong><br>${loc.company} — ${loc.product}<br>${loc.address}<br><em>${statusLabel}</em><br><a href="${loc.sourceUrl}" target="_blank" rel="noopener">Source: ${loc.sourceName}</a>`;
}

function cardHtml(loc) {
  const bucket = statusBucket(loc.status);
  const statusLabel = bucket === 'active' ? 'Active' : 'Stopped';
  return `
    <article class="loc-card" data-id="${loc.id}">
      <div class="loc-card-top">
        <span class="chip chip-${loc.product}">${loc.product}</span>
        <span class="chip chip-status-${bucket}">${statusLabel}</span>
      </div>
      <h3>${loc.name}</h3>
      <p class="loc-city">${loc.city}</p>
      <p class="loc-note">${loc.notes}</p>
      <a class="loc-source" href="${loc.sourceUrl}" target="_blank" rel="noopener">${loc.sourceName} &rarr;</a>
    </article>
  `;
}

function applyFilters() {
  const filtered = allLocations.filter(loc => {
    if (!state.product.has(loc.product)) return false;
    if (!state.status.has(statusBucket(loc.status))) return false;
    if (state.query && !(loc.name.toLowerCase().includes(state.query) || loc.city.toLowerCase().includes(state.query))) return false;
    return true;
  });

  markerLayer.clearLayers();
  markerById = {};
  filtered.forEach(loc => {
    const marker = L.marker([loc.lat, loc.lng], { icon: makeIcon(loc.product, loc.status) });
    marker.bindPopup(popupHtml(loc));
    marker.addTo(markerLayer);
    markerById[loc.id] = marker;
  });

  const grid = document.getElementById('cards-grid');
  grid.innerHTML = filtered.map(cardHtml).join('');
  document.getElementById('cards-count').textContent = filtered.length;

  grid.querySelectorAll('.loc-card').forEach(card => {
    card.addEventListener('click', () => {
      const loc = filtered.find(l => l.id === card.dataset.id);
      if (!loc) return;
      document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
      const marker = markerById[loc.id];
      // zoomToShowLayer handles de-clustering (zooming/spiderfying) so the
      // marker is actually visible before we try to open its popup.
      markerLayer.zoomToShowLayer(marker, () => marker.openPopup());
    });
  });
}

document.querySelectorAll('.chip-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.dataset.group;
    const val = btn.dataset.value;
    const set = group === 'product' ? state.product : state.status;
    if (set.has(val)) { set.delete(val); btn.classList.remove('active'); }
    else { set.add(val); btn.classList.add('active'); }
    applyFilters();
  });
});

const searchEl = document.getElementById('search-box');
if (searchEl) {
  searchEl.addEventListener('input', e => {
    state.query = e.target.value.trim().toLowerCase();
    applyFilters();
  });
}

fetch('data.json').then(r => r.json()).then(data => {
  allLocations = data;
  applyFilters();

  const statActive = document.getElementById('stat-active');
  if (statActive) statActive.textContent = data.filter(l => l.status === 'active').length;

  const statProducts = document.getElementById('stat-products');
  if (statProducts) statProducts.textContent = new Set(data.map(l => l.product)).size;
});

function banSourceLine(entry, bans) {
  const url = entry.sourceUrl || bans.generalSourceUrl;
  const name = entry.sourceName || bans.generalSourceName;
  if (!url) return '';
  return `<a href="${url}" target="_blank" rel="noopener" style="font-size:0.72rem; display:block; margin-top:0.3rem;">Source: ${name}</a>`;
}

fetch('bans.json').then(r => r.json()).then(bans => {
  const el = document.getElementById('bans-grid');
  if (!el) return;
  const full = bans.fullBans.map(b => `<div class="ban-pill ban-full"><strong>${b.state}</strong><span>${b.note}</span>${banSourceLine(b, bans)}</div>`).join('');
  const restr = bans.restrictions.map(b => `<div class="ban-pill ban-restr"><strong>${b.state}</strong><span>${b.note}</span>${banSourceLine(b, bans)}</div>`).join('');
  el.innerHTML = full + restr;

  const statBanned = document.getElementById('stat-banned-states');
  if (statBanned) statBanned.textContent = bans.fullBans.length + bans.restrictions.length;
});
