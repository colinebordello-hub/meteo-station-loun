window.Meteo = window.Meteo || {};

window.Meteo.settings = window.Meteo.settings || {
  font: "system",
  bgColor: "#05040a",
  accentColor: "#ca0ae0",
  messageMode: "custom"
};

const FONT_MAP = {
  system: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "'Courier New', monospace",
  rounded: "'Trebuchet MS', system-ui, sans-serif",
  display: "Impact, 'Arial Black', system-ui, sans-serif"
};

const BG_COLORS = [
  "#05040a", "#111111", "#1b1027",
  "#001f3f", "#10301f", "#221b1b",
  "#2b2b2b", "#12091a", "#0b1a24"
];

const ACCENT_COLORS = [
  "#ca0ae0", "#ffcc00", "#00d8ff",
  "#ff4b81", "#7bff7b", "#ff6e00",
  "#ffffff", "#9b59b6", "#1abc9c"
];

window.Meteo.applySettings = function () {
  const s = window.Meteo.settings;
  document.body.style.fontFamily = FONT_MAP[s.font] || FONT_MAP.system;
  const root = document.documentElement;
  root.style.setProperty("--bg-color", s.bgColor);
  root.style.setProperty("--accent-color", s.accentColor);
  window.Meteo.currentMessageMode = s.messageMode || "custom";
};

window.Meteo.loadSettingsFromStorage = function () {
  try {
    const raw = localStorage.getItem("meteoSettings");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    window.Meteo.settings = { ...window.Meteo.settings, ...parsed };
  } catch (e) {
    console.warn("Impossible de charger les réglages :", e);
  }
};

window.Meteo.saveSettingsToStorage = function () {
  try {
    localStorage.setItem(
      "meteoSettings",
      JSON.stringify(window.Meteo.settings)
    );
  } catch (e) {
    console.warn("Impossible de sauvegarder les réglages :", e);
  }
};

window.Meteo.initMenu = function () {
  const toggleBtn = document.getElementById("menu-toggle");
  const panel = document.getElementById("menu-panel");
  const closeBtn = document.getElementById("menu-close");

  if (!toggleBtn || !panel || !closeBtn) return;

  toggleBtn.addEventListener("click", () => {
    panel.classList.add("open");
  });

  closeBtn.addEventListener("click", () => {
    panel.classList.remove("open");
  });

  // BG colors
  const bgGrid = document.getElementById("bg-color-grid");
  if (bgGrid) {
    bgGrid.innerHTML = "";
    BG_COLORS.forEach(color => {
      const btn = document.createElement("button");
      btn.className = "color-swatch";
      btn.style.backgroundColor = color;
      if (window.Meteo.settings.bgColor === color) {
        btn.classList.add("selected");
      }
      btn.addEventListener("click", () => {
        window.Meteo.settings.bgColor = color;
        document
          .querySelectorAll("#bg-color-grid .color-swatch")
          .forEach(el => el.classList.remove("selected"));
        btn.classList.add("selected");
        window.Meteo.applySettings();
        window.Meteo.saveSettingsToStorage();
      });
      bgGrid.appendChild(btn);
    });
  }

  // Accent colors
  const accentGrid = document.getElementById("accent-color-grid");
  if (accentGrid) {
    accentGrid.innerHTML = "";
    ACCENT_COLORS.forEach(color => {
      const btn = document.createElement("button");
      btn.className = "color-swatch";
      btn.style.backgroundColor = color;
      if (window.Meteo.settings.accentColor === color) {
        btn.classList.add("selected");
      }
      btn.addEventListener("click", () => {
        window.Meteo.settings.accentColor = color;
        document
          .querySelectorAll("#accent-color-grid .color-swatch")
          .forEach(el => el.classList.remove("selected"));
        btn.classList.add("selected");
        window.Meteo.applySettings();
        window.Meteo.saveSettingsToStorage();
        if (window.Meteo.redrawGraphForCurrentCity) {
          window.Meteo.redrawGraphForCurrentCity();
        }
      });
      accentGrid.appendChild(btn);
    });
  }

  // Polices
  const fontRadios = document.querySelectorAll("input[name='font-choice']");
  fontRadios.forEach(r => {
    if (r.value === window.Meteo.settings.font) {
      r.checked = true;
    }
    r.addEventListener("change", () => {
      if (r.checked) {
        window.Meteo.settings.font = r.value;
        window.Meteo.applySettings();
        window.Meteo.saveSettingsToStorage();
         if (window.Meteo.redrawGraphForCurrentCity) {
          window.Meteo.redrawGraphForCurrentCity();
        }
      }
    });
  });

  // Messages
  const msgRadios = document.querySelectorAll("input[name='message-mode']");
  msgRadios.forEach(r => {
    if (r.value === window.Meteo.settings.messageMode) {
      r.checked = true;
    }
    r.addEventListener("change", async () => {
      if (r.checked) {
        window.Meteo.settings.messageMode = r.value;
        window.Meteo.applySettings();
        window.Meteo.saveSettingsToStorage();
        await window.Meteo.loadMessages();
      }
    });
  });

  // Villes
  const cityListEl = document.getElementById("city-list");
  if (cityListEl && window.Meteo.cities) {
    cityListEl.innerHTML = "";
    const sorted = window.Meteo.cities
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));

    sorted.forEach(city => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = city.enabled !== false;
      input.addEventListener("change", () => {
        city.enabled = input.checked;

        // 🔹 liste des villes activées → settings
        const enabledNames = window.Meteo.cities
          .filter(c => c.enabled !== false)
          .map(c => c.name);

        window.Meteo.settings.enabledCities = enabledNames;

        window.Meteo.updateActiveCities();
        window.Meteo.saveSettingsToStorage();
      });
      label.appendChild(input);
      label.appendChild(document.createTextNode(city.name));
      cityListEl.appendChild(label);
    });
  }
};