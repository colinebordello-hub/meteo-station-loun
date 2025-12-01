window.Meteo = window.Meteo || {};

let currentCityIndex = 0;

window.Meteo.redrawGraphForCurrentCity = function () {
  const cities = window.Meteo.activeCities;
  if (!cities || !cities.length) return;
  const city = cities[currentCityIndex] || cities[0];
  window.Meteo.loadGraph(city);
};

window.addEventListener("DOMContentLoaded", async () => {
  window.Meteo.loadSettingsFromStorage?.();
  window.Meteo.applySettings?.();
  window.Meteo.initCitiesFromSettings?.();

  window.Meteo.updateActiveCities?.();
  await window.Meteo.loadMessages?.();

  updateClock();
  setInterval(updateClock, 1000);

  setInterval(() => {
    loadCity(currentCityIndex);
  }, 5 * 60 * 1000);

  loadCity(currentCityIndex);
  setupCityButtons();
  window.Meteo.updateBlitzMap("france");

  window.Meteo.initMenu?.();
});

function updateClock() {
  const now = new Date();
  const hours = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
  document.getElementById("hours").textContent = hours;
}

function setupCityButtons() {
  document.getElementById("arrow-left").onclick = () => {
    const cities = window.Meteo.activeCities;
    if (!cities || !cities.length) return;
    currentCityIndex =
      (currentCityIndex - 1 + cities.length) % cities.length;
    loadCity(currentCityIndex);
  };
  document.getElementById("arrow-right").onclick = () => {
    const cities = window.Meteo.activeCities;
    if (!cities || !cities.length) return;
    currentCityIndex = (currentCityIndex + 1) % cities.length;
    loadCity(currentCityIndex);
  };
}

function loadCity(index) {
  const cities = window.Meteo.activeCities;
  if (!cities || !cities.length) return;

  const city = cities[index] || cities[0];
  currentCityIndex = cities.indexOf(city);

  document.getElementById("city-name").textContent = city.name;
  window.Meteo.loadWeather(city);
  window.Meteo.loadGraph(city);
}