window.Meteo = window.Meteo || {};

window.Meteo.cities = [
  { name: "Argenteuil", lat: 48.9472, lon: 2.2467, enabled: true },
  { name: "Bordeaux",   lat: 44.8378, lon: -0.5792, enabled: true },
  { name: "Clermont-Ferrand", lat: 45.7772, lon: 3.0870, enabled: true },
  { name: "Dijon",      lat: 47.3220, lon: 5.0415, enabled: true },
  { name: "Grenoble",   lat: 45.1885, lon: 5.7245, enabled: true },
  { name: "Lille",      lat: 50.6292, lon: 3.0573, enabled: true },
  { name: "Lyon",       lat: 45.7640, lon: 4.8357, enabled: true },
  { name: "Marseille",  lat: 43.2965, lon: 5.3698, enabled: true },
  { name: "Metz",       lat: 49.1193, lon: 6.1757, enabled: true },
  { name: "Montpellier",lat: 43.6108, lon: 3.8767, enabled: true },
  { name: "Nancy", lat: 48.6921, lon: 6.1844, enabled: true },
  { name: "Nantes",     lat: 47.2184, lon: -1.5536, enabled: true },
  { name: "Nice",       lat: 43.7102, lon: 7.2620, enabled: true },
  { name: "Orléans",    lat: 47.9029, lon: 1.9093, enabled: true },
  { name: "Paris",      lat: 48.8566, lon: 2.3522, enabled: true },
  { name: "Reims",      lat: 49.2583, lon: 4.0317, enabled: true },
  { name: "Rennes",     lat: 48.1173, lon: -1.6778, enabled: true },
  { name: "Rouen",      lat: 49.4431, lon: 1.0993, enabled: true },
  { name: "Strasbourg", lat: 48.5734, lon: 7.7521, enabled: true },
  { name: "Toulouse",   lat: 43.6045, lon: 1.4442, enabled: true },
  { name: "Tours",      lat: 47.3941, lon: 0.6848, enabled: true },
  { name: "Saint-Étienne", lat: 45.4397, lon: 4.3872, enabled: true }
];

window.Meteo.updateActiveCities = function () {
  const all = window.Meteo.cities.slice().sort((a, b) =>
    a.name.localeCompare(b.name, "fr")
  );
  const enabled = all.filter(c => c.enabled !== false);
  window.Meteo.activeCities = enabled.length ? enabled : all;
};

window.Meteo.initCitiesFromSettings = function () {
  const s = window.Meteo.settings || {};
  const list = s.enabledCities;
  if (Array.isArray(list)) {
    const set = new Set(list);
    window.Meteo.cities.forEach(c => {
      c.enabled = set.has(c.name);
    });
  }
  window.Meteo.updateActiveCities();
};