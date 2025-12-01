window.Meteo = window.Meteo || {};

window.Meteo.loadGraph = async function (city) {
  const canvas = document.getElementById("temp-graph");
  if (!canvas) return;

  // 2 jours pour aujourd'hui + demain
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&hourly=temperature_2m,weather_code&timezone=auto&forecast_days=2`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.hourly || !data.hourly.time || !data.hourly.temperature_2m || !data.hourly.weather_code) {
      console.error("Données horaires manquantes pour le graph :", data);
      return;
    }

    const times = data.hourly.time;
    const temps = data.hourly.temperature_2m;
    const codes = data.hourly.weather_code;

    const now = new Date();

    // prochaine heure pleine
    const nextHour = new Date(now);
    nextHour.setMinutes(0, 0, 0);
    nextHour.setHours(nextHour.getHours() + 1);

    const points = [];

    // 24 prochaines heures
    for (let i = 0; i < times.length; i++) {
      const t = new Date(times[i]);
      if (t >= nextHour && points.length < 24) {
        points.push({ time: t, temp: temps[i], code: codes[i] });
      }
    }

    // fallback si jamais pas assez de points
    if (points.length < 2) {
      for (let i = 0; i < Math.min(24, times.length); i++) {
        points.push({
          time: new Date(times[i]),
          temp: temps[i],
          code: codes[i],
        });
      }
    }

    if (points.length < 2) {
      console.warn("Pas assez de points pour tracer le graph");
      return;
    }

    drawTempGraph(canvas, points);
  } catch (e) {
    console.error("Erreur chargement graph météo :", e);
  }
};

function hexToRgba(hex, alpha) {
  hex = hex.replace("#", "").trim();
  if (hex.length === 3) {
    hex = hex.split("").map(c => c + c).join("");
  }
  const num = parseInt(hex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawTempGraph(canvas, points) {
  const dpr = window.devicePixelRatio || 1;

  const cssWidth = canvas.clientWidth || 600;
  const cssHeight = canvas.clientHeight || 160;

  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const width = cssWidth;
  const height = cssHeight;
  
  const smallScreen =
    window.innerWidth <= 1100 && window.innerHeight <= 700;

    
  const tempFontSize  = smallScreen ? 14 : 20;
  const emojiFontSize = smallScreen ? 14 : 18;
  const hourFontSize  = smallScreen ? 12 : 20;

  ctx.clearRect(0, 0, width, height);

  const accent =
    window.Meteo &&
    window.Meteo.settings &&
    window.Meteo.settings.accentColor
      ? window.Meteo.settings.accentColor
      : "#ca0ae0";

  const accentFill = hexToRgba(accent, 0.25);
  const accentTemp = hexToRgba(accent, 0.85);

  const bodyStyles = getComputedStyle(document.body);
  const bodyFont = bodyStyles.fontFamily || "system-ui, sans-serif";

  const padding = { left: 20, right: 25, top: 10, bottom: 25};
  const iconMarginTop = 30;

  const temps = points.map(p => p.temp);
  const minTemp = Math.min(...temps) - 1;
  const maxTemp = Math.max(...temps) + 1;

  const xStep =
    points.length > 1
      ? (width - padding.left - padding.right) / (points.length - 1)
      : 0;

  function getX(i) {
    return padding.left + i * xStep;
  }

    function getY(temp) {
        const ratio = (temp - minTemp) / (maxTemp - minTemp || 1);
        const usableHeight = height - padding.top - padding.bottom - iconMarginTop;
        return padding.top + iconMarginTop + (1 - ratio) * usableHeight;
    }


  // Ligne de base
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding.left, height - padding.bottom);
  ctx.lineTo(width - padding.right, height - padding.bottom);
  ctx.stroke();

  // Zone remplie
  ctx.beginPath();
  ctx.moveTo(getX(0), getY(points[0].temp));
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(getX(i), getY(points[i].temp));
  }
  ctx.lineTo(getX(points.length - 1), height - padding.bottom);
  ctx.lineTo(getX(0), height - padding.bottom);
  ctx.closePath();

  ctx.fillStyle = accentFill;
  ctx.fill();

  // Courbe
  ctx.beginPath();
  ctx.moveTo(getX(0), getY(points[0].temp));
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(getX(i), getY(points[i].temp));
  }
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Points
    for (let i = 0; i < points.length; i++) {
    const x = getX(i);
    const y = getY(points[i].temp);

    const tempLabel = Math.round(points[i].temp) + "°";

    ctx.textAlign = "center";

    // icône météo seulement toutes les 2h
    if (i % 2 === 0) {
        const emoji = getWeatherEmojiForCode(points[i].code);
        ctx.fillStyle = accent;
        ctx.font = `${emojiFontSize}px` + bodyFont;
        ctx.textBaseline = "bottom";
        ctx.fillText(emoji, x, y - 30);
    }

    // température (à chaque point)
    ctx.fillStyle = accentTemp;
    ctx.font = `${tempFontSize}px` + bodyFont;
    ctx.textBaseline = "bottom";
    ctx.fillText(tempLabel, x, y - 4);

    // le point (à chaque point)
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
    }

  // Labels heures (toutes les 3)
  ctx.fillStyle = accent;
  ctx.font = `${hourFontSize}px` + bodyFont;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  for (let i = 0; i < points.length; i += 3) {
    const x = getX(i);
    const label =
      points[i].time.getHours().toString().padStart(2, "0") + "H";
    ctx.fillText(label, x, height - padding.bottom + 5);
  }

}



function getWeatherEmojiForCode(code) {
  let category =
    window.Meteo && typeof window.Meteo.getWeatherCategory === "function"
      ? window.Meteo.getWeatherCategory(code)
      : null;

  if (!category) {
    if (code === 0) category = "sun";
    else if ([1, 2, 3].includes(code)) category = "cloud";
    else if ([45, 48].includes(code)) category = "fog";
    else if ([51, 53, 55, 56, 57].includes(code)) category = "cloud";
    else if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) category = "rain";
    else if ([71, 73, 75, 77, 85, 86].includes(code)) category = "snow";
    else if ([95, 96, 99].includes(code)) category = "storm";
    else category = "cloud";
  }

  switch (category) {
    case "sun":
      return "☀️";
    case "cloud":
      return "☁️";
    case "fog":
      return "🌫️";
    case "rain":
      return "🌧️";
    case "snow":
      return "❄️";
    case "storm":
      return "⛈️";
    default:
      return "☁️";
  }
}