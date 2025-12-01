window.Meteo = window.Meteo || {};

window.Meteo.weatherMessages = {};
window.Meteo.lastMessageTimestamp = 0;
window.Meteo.currentMessageMode = window.Meteo.currentMessageMode || "custom"; 

window.Meteo.loadMessages = async function () {
  const mode = window.Meteo.currentMessageMode || "custom";
  const file =
    mode === "neutral"
      ? "data/messages-neutral.json"
      : "data/messages-custom.json";

  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error("HTTP " + res.status);
    window.Meteo.weatherMessages = await res.json();
  } catch (e) {
    console.error("Erreur chargement messages :", e);
    window.Meteo.weatherMessages = {};
  }
};

Meteo.getTimePeriod = function () {
  const h = new Date().getHours();

  if (h >= 22 || h < 4) return "night";
  if (h >= 4 && h < 11) return "morning";
  if (h >= 11 && h < 18) return "other";

  return "other";
};

Meteo.updateMessage = function (code) {
  const now = Date.now();
  const TWO_HOURS = 2 * 60 * 60 * 1000;

  if (Meteo.lastMessageTimestamp && now - Meteo.lastMessageTimestamp < TWO_HOURS) {
    return;
  }

  const messageEl = document.getElementById("message");

  const timePeriod = Meteo.getTimePeriod();
  const weatherCategory = Meteo.getWeatherCategory(code);

  const pools = [];

  const timeList = Meteo.weatherMessages[timePeriod];
  if (Array.isArray(timeList) && timeList.length > 0) {
    pools.push(timeList);
  }

  const weatherList = Meteo.weatherMessages[weatherCategory];
  if (Array.isArray(weatherList) && weatherList.length > 0) {
    pools.push(weatherList);
  }

  if (pools.length === 0) {
    Meteo.setDefaultMessage();
    return;
  }

  const chosenPool = pools[Math.floor(Math.random() * pools.length)];
  const randomIndex = Math.floor(Math.random() * chosenPool.length);

  messageEl.textContent = chosenPool[randomIndex];
  Meteo.lastMessageTimestamp = now;
};

Meteo.setDefaultMessage = function () {
  const messageEl = document.getElementById("message");
  messageEl.textContent = "bonne journée à toi ma princesse <3";
};