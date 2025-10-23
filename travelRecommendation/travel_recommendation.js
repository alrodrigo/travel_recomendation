// === Obtener datos del JSON ===
async function loadRecommendations() {
  const response = await fetch('travel_recommendation_api.json');
  const data = await response.json();
  console.log(data); 
  return data;
}

// === Buscar según palabra clave ===
async function searchRecommendations() {
  const keyword = document.querySelector('input[type="text"]').value.toLowerCase();
  const resultsContainer = document.querySelector('.results');
  resultsContainer.innerHTML = ""; // Limpia resultados previos

  const data = await loadRecommendations();

  let results = [];

  if (keyword.includes('playa')) results = data.beaches;
  else if (keyword.includes('templo')) results = data.temples;
  else if (keyword.includes('país') || keyword.includes('pais')) results = data.countries;

  results.forEach(item => {
    resultsContainer.innerHTML += `
      <div class="card">
        <img src="${item.imageUrl}" alt="${item.name}">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
      </div>
    `;
  });
}

// === Botón de limpiar ===
function clearResults() {
  document.querySelector('.results').innerHTML = "";
  document.querySelector('input[type="text"]').value = "";
}
