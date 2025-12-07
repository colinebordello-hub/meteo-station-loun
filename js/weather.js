window.Meteo = window.Meteo || {};

Meteo.animationName = "radis";

Meteo.getWeatherCategory = function (code) {
  if (code === 0) return "sun";
  if ([45, 48].includes(code)) return "fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "cloud";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if (code >= 95) return "storm";
  return "cloud";
};

Meteo.updateAnimation = function (code) {
  const localisation = "assets/images/";
  const anim = document.getElementById("animation");
  anim.innerHTML = "";
  const img = document.createElement("img");
  const category = Meteo.getWeatherCategory(code);

  if (category === "sun") img.src = localisation + Meteo.animationName + "/sun.gif";
  else if (category === "fog") img.src = localisation + Meteo.animationName + "/fog.gif";
  else if (category === "rain") img.src = localisation + Meteo.animationName + "/rain.gif";
  else if (category === "snow") img.src = localisation + Meteo.animationName + "/snow.gif";
  else if (category === "storm") img.src = localisation + Meteo.animationName + "/storm.gif";
  else img.src = "assets/images/radis/cloud.gif";

  anim.appendChild(img);
};

Meteo.loadWeather = async function (city) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}` +
            `&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,pressure_msl` +
            `&timezone=auto`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const temp = Math.round(data.current.temperature_2m);
    const code = data.current.weather_code;

    document.getElementById("temperature").textContent = temp + "°";
    const wind = Math.round(data.current.wind_speed_10m);            
    const humidity = Math.round(data.current.relative_humidity_2m);  
    const pressure = Math.round(data.current.pressure_msl);         

    document.getElementById("wind").textContent = `🌬️ ${wind} km/h`;
    document.getElementById("humidity").textContent = `💧 ${humidity} %`;
    document.getElementById("pressure").textContent = `🕛 ${pressure} hPa`;

    Meteo.updateMessage(code);      // depuis message.js
    Meteo.updateAnimation(code);
  } catch (e) {
    console.error("Erreur météo :", e);
    Meteo.setDefaultMessage();
  }
};