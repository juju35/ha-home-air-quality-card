// Renders the card with mock rooms and saves the README screenshots.
// Usage: npm install && npm run screenshots (CHROMIUM_PATH=... to use an installed Chromium)
import { chromium } from "playwright";
import * as mdi from "@mdi/js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const cardJs = readFileSync(`${root}dist/home-air-quality-card.js`, "utf8");

// Every mdi:* icon the card can use, as SVG paths for the <ha-icon> stand-in.
const icons = {};
for (const name of new Set(cardJs.match(/mdi:[a-z0-9-]+/g))) {
  const key = `mdi${name.slice(4).replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase())}`;
  if (mdi[key]) icons[name.slice(4)] = mdi[key];
}

const THEMES = {
  light: {
    "--primary-background-color": "#f4f4f4", "--secondary-background-color": "#efefef", "--card-background-color": "#ffffff",
    "--primary-text-color": "#212121", "--secondary-text-color": "#727272", "--divider-color": "rgba(0,0,0,.12)",
  },
  dark: {
    "--primary-background-color": "#111111", "--secondary-background-color": "#282828", "--card-background-color": "#1c1c1c",
    "--primary-text-color": "#e1e1e1", "--secondary-text-color": "#9b9b9b", "--divider-color": "rgba(225,225,225,.12)",
  },
};
const COMMON = {
  "--primary-color": "#03a9f4", "--success-color": "#43a047", "--warning-color": "#ffa600", "--error-color": "#db4437",
  "--text-primary-color": "#ffffff",
};

const haElements = `
const ICONS = ${JSON.stringify(icons)};
customElements.define("ha-card", class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML =
      "<style>:host{display:block;background:var(--card-background-color);border-radius:12px;" +
      "box-shadow:0 1px 4px rgba(0,0,0,.08);color:var(--primary-text-color);overflow:hidden}</style><slot></slot>";
  }
});
customElements.define("ha-icon", class extends HTMLElement {
  static get observedAttributes() { return ["icon"]; }
  connectedCallback() { this._draw(); }
  attributeChangedCallback() { this._draw(); }
  _draw() {
    const path = ICONS[(this.getAttribute("icon") || "").replace("mdi:", "")] || "";
    this.style.display = "inline-flex";
    this.innerHTML = '<svg viewBox="0 0 24 24" style="width:var(--mdc-icon-size,24px);height:var(--mdc-icon-size,24px);fill:currentColor"><path d="' + path + '"/></svg>';
  }
});`;

const pageHtml = (theme) => `<!doctype html><html><head><meta charset="utf-8">
<style>
  :root { ${Object.entries({ ...THEMES[theme], ...COMMON }).map(([k, v]) => `${k}:${v};`).join("")} }
  body { margin: 0; padding: 16px; background: var(--primary-background-color); color: var(--primary-text-color);
         font-family: Roboto, "Segoe UI", Helvetica, Arial, sans-serif; width: 428px; }
</style></head><body><div id="root"></div></body></html>`;

// Mock areas with CO₂, temperature and humidity sensors (null: no such sensor).
const ROOMS = [
  ["chambre_lea", "Chambre Léa", 1290, 18.8, 52],
  ["salle_de_bain", "Salle De Bain", 399, 19.8, 83],
  ["chambre_3", "Chambre 3", 1043, 20.1, 51],
  ["chambre_parents", "Chambre Parents", 725, 20.1, 54],
  ["sejour", "Séjour", 422, 20.5, 46],
  ["toilettes", "Toilettes", null, 20.4, 48],
  ["terrasse", "Terrasse", null, 12.5, 80],
];
const areas = {}, entities = {}, devices = {}, states = {};
for (const [id, name, co2, temp, hum] of ROOMS) {
  areas[id] = { area_id: id, name, icon: null };
  devices[id] = { id, area_id: id, name: `Capteur ${name}` };
  const add = (role, dc, value, unit) => {
    if (value == null) return;
    const entity_id = `sensor.${id}_${role}`;
    entities[entity_id] = { entity_id, device_id: id, area_id: null, platform: "mock" };
    states[entity_id] = { entity_id, state: String(value), attributes: { device_class: dc, unit_of_measurement: unit, friendly_name: `${name} ${role}` } };
  };
  add("co2", "carbon_dioxide", co2, "ppm");
  add("temperature", "temperature", temp, "°C");
  add("humidity", "humidity", hum, "%");
}
const hass = { states, entities, devices, areas, language: "fr", locale: { language: "fr" } };

const SHOTS = [
  { file: "alerts", theme: "light", config: {} },
  { file: "alerts-dark", theme: "dark", config: {} },
  { file: "all-rooms", theme: "light", config: { expanded: true } },
  { file: "all-rooms-dark", theme: "dark", config: { expanded: true } },
];

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1000, height: 2000 } });
for (const s of SHOTS) {
  await page.setContent(pageHtml(s.theme));
  await page.addScriptTag({ content: haElements });
  await page.addScriptTag({ content: cardJs });
  await page.evaluate(({ config, hass, dark }) => {
    const el = document.createElement("home-air-quality-card");
    el.setConfig({ type: "custom:home-air-quality-card", blink: false, ...config });
    el.hass = { ...hass, themes: { darkMode: dark }, callService: async () => {} };
    document.getElementById("root").appendChild(el);
  }, { config: s.config, hass: { ...hass, language: s.theme === "dark" ? "fr" : "en", locale: { language: s.theme === "dark" ? "fr" : "en" } }, dark: s.theme === "dark" });
  await page.waitForTimeout(400);
  await page.locator("home-air-quality-card").screenshot({ path: `${root}screenshots/${s.file}.png`, animations: "disabled" });
  console.log(`screenshots/${s.file}.png`);
}
await browser.close();
