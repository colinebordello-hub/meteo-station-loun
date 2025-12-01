window.Meteo = window.Meteo || {};

Meteo.updateBlitzMap = function (region = "france") {
  const iframe = document.getElementById("blitzortung-frame");

  let hash = "#4.5/46.6/2.5"; // France par défaut
  if (region === "europe") hash = "#4/52/10";
  if (region === "world") hash = "#2/20/0";

  const baseUrl =
    "https://map.blitzortung.org/index.php?" +
    "interactive=1" +
    "&NavigationControl=0" +
    "&FullScreenControl=0" +
    "&ScaleControl=0" +
    "&MapStyle=0" +
    "&MenuButtonDiv=0" +
    "&InfoDiv=0" +
    "&Advertisment=0" +
    "&LinksCheckboxChecked=0" +
    "&LinksRangeValue=2" +
    "&MapStyleRangeValue=8" +
    "&AudioRangeValue=0";

  iframe.src = "";
  setTimeout(() => {
    iframe.src = baseUrl + hash;
  }, 50);
};