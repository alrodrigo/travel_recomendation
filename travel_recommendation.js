// === Obtener datos del JSON (con manejo de errores) ===
async function loadRecommendations() {
  try {
    const response = await fetch('travel_recommendation_api.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error cargando recomendaciones:', err);
    return null;
  }
}

// === Buscar según palabra clave ===
async function searchRecommendations() {
  // Seleccionamos el input dentro de la barra de búsqueda para evitar colisiones con otros inputs
  const inputEl = document.querySelector('.search-bar input');
  const keyword = (inputEl ? inputEl.value : '') .toLowerCase().trim();
  const resultsContainer = document.querySelector('.results');
  if (!resultsContainer) return; // nada que mostrar
  resultsContainer.innerHTML = ""; // Limpia resultados previos

  if (!keyword) {
    resultsContainer.innerHTML = '<p class="info">Escribe un término de búsqueda (p. ej. playa, templo, país o nombre de ciudad)</p>';
    return;
  }

  const data = await loadRecommendations();
  if (!data) {
    resultsContainer.innerHTML = '<p class="error">No se pudieron cargar los datos. Asegúrate de ejecutar esto desde un servidor (http://) o que el archivo JSON exista.</p>';
    return;
  }

  // Aplanar countries -> cities
  const countryCities = Array.isArray(data.countries)
    ? data.countries.flatMap(c => (Array.isArray(c.cities) ? c.cities.map(city => ({ ...city, country: c.name })) : []))
    : [];

  const beaches = Array.isArray(data.beaches) ? data.beaches : [];
  const temples = Array.isArray(data.temples) ? data.temples : [];

  // Combinar todos los items en un solo array para búsqueda genérica
  const allItems = [...beaches, ...temples, ...countryCities];

  // Búsqueda por categoría si el usuario usa palabras claves conocidas
  let filtered = [];
  if (keyword.includes('playa') || keyword.includes('beach')) filtered = beaches;
  else if (keyword.includes('templo') || keyword.includes('temple')) filtered = temples;
  else if (keyword.includes('país') || keyword.includes('pais') || keyword.includes('country')) filtered = countryCities;
  else {
    // Búsqueda por nombre o descripción
    filtered = allItems.filter(item => {
      const name = (item.name || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      return name.includes(keyword) || desc.includes(keyword) || (item.country && item.country.toLowerCase().includes(keyword));
    });
  }

  if (!filtered.length) {
    resultsContainer.innerHTML = `<p class="info">No se encontraron resultados para "${escapeHtml(keyword)}".</p>`;
    return;
  }

  // Renderizar resultados
  filtered.forEach(item => {
    const imgSrc = item.imageUrl && item.imageUrl !== '' ? item.imageUrl : 'https://via.placeholder.com/280x180?text=No+image';
    resultsContainer.innerHTML += `
      <div class="card">
        <img src="${imgSrc}" alt="${escapeHtml(item.name)}">
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.description || '')}</p>
      </div>
    `;
  });
}

// === Botón de limpiar ===
function clearResults() {
  const resultsEl = document.querySelector('.results');
  const inputEl = document.querySelector('.search-bar input');
  if (resultsEl) resultsEl.innerHTML = "";
  if (inputEl) inputEl.value = "";
}

// Small helper to avoid inyectar texto sin escapar
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* Exports for testing environments (not required in browser) */
if (typeof module !== 'undefined') {
  module.exports = { loadRecommendations, searchRecommendations, clearResults, escapeHtml };
}
