var HOME_AIR_QUALITY_CARD_VERSION = '__VERSION__';

// ── i18n ─────────────────────────────────────────────────────────────────────
var AqI18n = {
  fr: {
    title: 'Qualité de l\'air',
    all_good: 'Tout est bon',
    co2_high_one: '{n} pièce avec CO₂ élevé',
    co2_high_many: '{n} pièces avec CO₂ élevé',
    humidity_high: 'humidité élevée ({r})',
    all_rooms: 'Toutes les pièces',
    other_rooms: 'Autres pièces',
    outdoor: 'Extérieur',
    no_rooms: 'Aucune pièce avec un capteur de CO₂, de température ou d\'humidité',
    ed_title: 'Titre',
    ed_title_helper: 'Laisser vide pour « Qualité de l\'air »',
    ed_icon: 'Icône',
    ed_outdoor_temperature: 'Température extérieure',
    ed_outdoor_humidity: 'Humidité extérieure',
    ed_outdoor_name: 'Nom de l\'extérieur',
    ed_outdoor_name_helper: 'Nom du badge de température, par exemple Terrasse',
    ed_co2_warning: 'CO₂ élevé',
    ed_co2_critical: 'CO₂ critique',
    ed_humidity_warning: 'Humidité élevée',
    ed_humidity_critical: 'Humidité critique',
    ed_show_summary: 'Résumé',
    ed_show_all_rooms: 'Liste des pièces',
    ed_expanded: 'Liste dépliée',
    ed_blink: 'Clignotement au seuil critique',
    ed_sort: 'Tri',
    ed_sort_helper: 'Ordre des pièces dans chaque liste',
    ed_language: 'Langue',
    ed_language_helper: 'Laisser vide pour suivre la langue de Home Assistant',
    ed_exclude_areas: 'Pièces à ignorer',
    ed_exclude_areas_helper: 'Seulement quand la liste des pièces est vide : les pièces sont alors trouvées dans les zones',
    ed_rooms: 'Pièces',
    ed_rooms_helper: 'Laisser vide pour trouver les pièces automatiquement dans les zones',
    sort_co2: 'CO₂ décroissant',
    sort_name: 'Nom',
    sort_none: 'Ordre de la configuration',
    rf_name: 'Nom',
    rf_area: 'Zone',
    rf_icon: 'Icône',
    rf_co2: 'Capteur de CO₂',
    rf_temperature: 'Capteur de température',
    rf_humidity: 'Capteur d\'humidité',
    rf_navigation_path: 'Chemin de navigation',
    rf_alerts: 'Alertes',
    rf_co2_warning: 'CO₂ élevé',
    rf_co2_critical: 'CO₂ critique',
    rf_humidity_warning: 'Humidité élevée',
    rf_humidity_critical: 'Humidité critique',
  },
  en: {
    title: 'Air quality',
    all_good: 'All good',
    co2_high_one: '{n} room with high CO₂',
    co2_high_many: '{n} rooms with high CO₂',
    humidity_high: 'high humidity ({r})',
    all_rooms: 'All rooms',
    other_rooms: 'Other rooms',
    outdoor: 'Outdoor',
    no_rooms: 'No room with a CO₂, temperature or humidity sensor',
    ed_title: 'Title',
    ed_title_helper: 'Leave empty for "Air quality"',
    ed_icon: 'Icon',
    ed_outdoor_temperature: 'Outdoor temperature',
    ed_outdoor_humidity: 'Outdoor humidity',
    ed_outdoor_name: 'Outdoor name',
    ed_outdoor_name_helper: 'Name of the temperature badge, for example Garden',
    ed_co2_warning: 'High CO₂',
    ed_co2_critical: 'Critical CO₂',
    ed_humidity_warning: 'High humidity',
    ed_humidity_critical: 'Critical humidity',
    ed_show_summary: 'Summary',
    ed_show_all_rooms: 'Room list',
    ed_expanded: 'Room list expanded',
    ed_blink: 'Blink at the critical threshold',
    ed_sort: 'Sort',
    ed_sort_helper: 'Order of the rooms in each list',
    ed_language: 'Language',
    ed_language_helper: 'Leave empty to follow the Home Assistant language',
    ed_exclude_areas: 'Areas to ignore',
    ed_exclude_areas_helper: 'Only when the room list is empty: rooms are then found from the areas',
    ed_rooms: 'Rooms',
    ed_rooms_helper: 'Leave empty to find the rooms from the areas',
    sort_co2: 'CO₂, highest first',
    sort_name: 'Name',
    sort_none: 'Configuration order',
    rf_name: 'Name',
    rf_area: 'Area',
    rf_icon: 'Icon',
    rf_co2: 'CO₂ sensor',
    rf_temperature: 'Temperature sensor',
    rf_humidity: 'Humidity sensor',
    rf_navigation_path: 'Navigation path',
    rf_alerts: 'Alerts',
    rf_co2_warning: 'High CO₂',
    rf_co2_critical: 'Critical CO₂',
    rf_humidity_warning: 'High humidity',
    rf_humidity_critical: 'Critical humidity',
  },
};

function aqT(lang, key) {
  var strings = AqI18n[lang] || AqI18n.en;
  return strings[key] || AqI18n.en[key] || key;
}

function aqEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// "Salle De Bain" → "salle de bain", without accents, for name matching.
function aqFold(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

var AQ_DEFAULTS = {
  co2_warning: 1000, co2_critical: 1200, humidity_warning: 70, humidity_critical: 80,
  show_summary: true, show_all_rooms: true, expanded: false, blink: true, sort: 'co2',
};

var AQ_SENSORS = { co2: 'carbon_dioxide', temperature: 'temperature', humidity: 'humidity' };

// Room icon from the area name, when the area has no icon of its own.
var AQ_ROOM_ICONS = [
  [/(chambre|bedroom|bed)/, 'mdi:bed'],
  [/(sejour|salon|living|lounge)/, 'mdi:sofa'],
  [/(bain|bath|douche|shower)/, 'mdi:shower'],
  [/(toilet|wc)/, 'mdi:toilet'],
  [/(cuisine|kitchen)/, 'mdi:stove'],
  [/(bureau|office|study)/, 'mdi:desk'],
  [/(entree|hall|couloir|corridor)/, 'mdi:door'],
  [/(garage)/, 'mdi:garage'],
  [/(cave|cellar|basement|sous-sol)/, 'mdi:stairs-down'],
  [/(buanderie|laundry)/, 'mdi:washing-machine'],
  [/(terrasse|jardin|balcon|exterieur|garden|terrace|balcony|outdoor|outside|patio)/, 'mdi:weather-sunny'],
];

// Outdoor areas are listed but never raise an alert (outdoor humidity is often above 80 %).
var AQ_OUTDOOR = /(terrasse|jardin|balcon|exterieur|garden|terrace|balcony|outdoor|outside|patio)/;

// ── Entity discovery ─────────────────────────────────────────────────────────
function aqAreaOf(hass, e) {
  if (e.area_id) return e.area_id;
  var d = e.device_id && hass.devices ? hass.devices[e.device_id] : null;
  return d ? d.area_id : null;
}

// CO₂ first, then temperature and humidity, preferring the CO₂ sensor's own device.
function aqAreaSensors(hass, areaId) {
  var out = {};
  if (!hass?.entities || !areaId) return out;
  var list = Object.values(hass.entities).filter((e) => e.entity_id.indexOf('sensor.') === 0 && !e.hidden && hass.states[e.entity_id] && aqAreaOf(hass, e) === areaId);
  var device = null;
  ['co2', 'temperature', 'humidity'].forEach((role) => {
    var hits = list.filter((e) => hass.states[e.entity_id].attributes.device_class === AQ_SENSORS[role]);
    var hit = (device && hits.find((e) => e.device_id === device)) || hits[0];
    if (hit) {
      out[role] = hit.entity_id;
      if (!device) device = hit.device_id;
    }
  });
  return out;
}

function aqRoomIcon(hass, areaId, name) {
  var area = areaId && hass.areas ? hass.areas[areaId] : null;
  if (area?.icon) return area.icon;
  var text = aqFold(`${name} ${areaId || ''}`);
  var hit = AQ_ROOM_ICONS.find((p) => p[0].test(text));
  return hit ? hit[1] : 'mdi:home';
}

function aqAutoRooms(hass, exclude) {
  if (!hass?.areas) return [];
  return Object.keys(hass.areas).filter((id) => (exclude || []).indexOf(id) < 0).map((id) => {
    var s = aqAreaSensors(hass, id);
    return s.co2 || s.temperature || s.humidity ? Object.assign({ area: id }, s) : null;
  }).filter(Boolean);
}

// ── home-air-quality-card ────────────────────────────────────────────────────
class HomeAirQualityCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement('home-air-quality-card-editor');
  }

  static getStubConfig() {
    return {};
  }

  setConfig(config) {
    if (!config) throw new Error('Invalid configuration');
    if (config.rooms && !Array.isArray(config.rooms)) throw new Error('rooms must be a list');
    this._config = Object.assign({}, AQ_DEFAULTS, config);
    this._open = null;
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.addEventListener('click', (ev) => this._onClick(ev));
      this.shadowRoot.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); this._onClick(ev); }
      });
    }
    this._sig = null;
    this._update();
  }

  // Room list open: what the user toggled, else the `expanded` default.
  _isOpen() {
    return this._open != null ? this._open : !!this._config.expanded;
  }

  connectedCallback() {
    // A click elsewhere folds the list back to its default (as in ha-carburants-france). A click,
    // not a pointerdown: folding on press would shift the layout under the pointer before the click.
    this._onOutside = this._onOutside || ((ev) => {
      if (this._open == null) return;
      if ((ev.composedPath ? ev.composedPath() : []).indexOf(this) !== -1) return;
      this._open = null;
      this._update();
    });
    document.addEventListener('click', this._onOutside, true);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._onOutside, true);
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
  }

  getCardSize() { return 4; }

  getGridOptions() { return { columns: 12, min_columns: 6 }; }

  _lang() {
    var l = (this._config?.language) || (this._hass?.language) || document.documentElement.lang || 'en';
    l = l.split('-')[0];
    return AqI18n[l] ? l : 'en';
  }

  _t(k, vars) {
    var s = aqT(this._lang(), k);
    Object.keys(vars || {}).forEach((v) => { s = s.replace(`{${v}}`, vars[v]); });
    return s;
  }

  _st(id) { return id && this._hass.states[id]; }

  _avail(id) { var s = this._st(id); return !!s && s.state !== 'unavailable' && s.state !== 'unknown' && s.state !== ''; }

  _num(id) {
    if (!this._avail(id)) return null;
    var n = Number(this._st(id).state);
    return Number.isNaN(n) ? null : n;
  }

  _fmt(id, digits) {
    var n = this._num(id);
    if (n == null) return '';
    var u = this._st(id).attributes.unit_of_measurement || '';
    var txt = n.toLocaleString(this._lang(), { maximumFractionDigits: digits });
    return txt + (u ? ` ${u}` : '');
  }

  // Rooms from the config, completed from their area; every area with a sensor when there is no list.
  _rooms() {
    var hass = this._hass, c = this._config;
    var list = c.rooms?.length ? c.rooms : aqAutoRooms(hass, c.exclude_areas);
    return list.map((r) => {
      var fromArea = r.area ? aqAreaSensors(hass, r.area) : {};
      var area = r.area && hass.areas ? hass.areas[r.area] : null;
      var name = r.name || (area?.name) || (r.co2 && this._st(r.co2)?.attributes.friendly_name) || r.area || '';
      var outdoor = AQ_OUTDOOR.test(aqFold(`${name} ${r.area || ''}`));
      var room = {
        name: name,
        area: r.area,
        icon: r.icon || aqRoomIcon(hass, r.area, name),
        co2: r.co2 || fromArea.co2,
        temperature: r.temperature || fromArea.temperature,
        humidity: r.humidity || fromArea.humidity,
        navigation_path: r.navigation_path,
        alerts: r.alerts !== undefined ? r.alerts !== false : !outdoor,
        outdoor: outdoor,
      };
      ['co2_warning', 'co2_critical', 'humidity_warning', 'humidity_critical'].forEach((k) => {
        room[k] = Number(r[k] != null && r[k] !== '' ? r[k] : c[k]);
      });
      room.co2Value = this._num(room.co2);
      room.humidityValue = this._num(room.humidity);
      room.co2Level = this._level(room.co2Value, room.co2_warning, room.co2_critical);
      room.humidityLevel = this._level(room.humidityValue, room.humidity_warning, room.humidity_critical);
      room.level = room.alerts ? Math.max(room.co2Level, room.humidityLevel) : 0;
      return room;
    });
  }

  // 0 ok, 1 warning (above the warning threshold), 2 critical (above the critical one).
  _level(v, warn, crit) {
    if (v == null) return 0;
    if (crit && v > crit) return 2;
    if (warn && v > warn) return 1;
    return 0;
  }

  _sort(rooms) {
    var mode = this._config.sort;
    if (mode === 'name') return rooms.slice().sort((a, b) => a.name.localeCompare(b.name, this._lang()));
    if (mode !== 'co2') return rooms;
    return rooms.slice().sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      var av = a.co2Value, bv = b.co2Value;
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return bv - av;
    });
  }

  _update() {
    if (!this._config || !this._hass || !this.shadowRoot) return;
    var rooms = this._rooms();
    var hass = this._hass, c = this._config;
    var ids = [c.outdoor_temperature, c.outdoor_humidity];
    rooms.forEach((r) => { ids.push(r.co2, r.temperature, r.humidity); });
    var sig = JSON.stringify([this._lang(), this._isOpen(), rooms.map((r) => [r.name, r.icon, r.level]), ids.map((id) => {
      var s = id && hass.states[id];
      return s ? [id, s.state, s.attributes.unit_of_measurement] : null;
    })]);
    if (sig === this._sig) return;
    this._sig = sig;
    this._render(rooms);
  }

  _summary(alerts) {
    var co2 = alerts.filter((r) => r.co2Level);
    var hum = alerts.filter((r) => r.humidityLevel);
    var parts = [];
    if (co2.length) parts.push(this._t(co2.length > 1 ? 'co2_high_many' : 'co2_high_one', { n: co2.length }));
    if (hum.length) parts.push(this._t('humidity_high', { r: hum.map((r) => r.name).join(', ') }));
    if (!parts.length) return this._t('all_good');
    var s = parts.join(' · ');
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  _row(r) {
    var target = r.navigation_path ? ` data-nav="${aqEsc(r.navigation_path)}"` : '';
    var more = r.co2 || r.humidity || r.temperature;
    if (!target && more) target = ` data-more="${aqEsc(more)}"`;
    var color = ['ok', 'warn', 'crit'][r.level];
    var values = [];
    if (this._avail(r.co2)) values.push(`<span class="${r.alerts ? ['', 'warn', 'crit'][r.co2Level] : ''}">${aqEsc(this._fmt(r.co2, 0))}</span>`);
    if (this._avail(r.temperature)) values.push(`<span>${aqEsc(this._fmt(r.temperature, 1))}</span>`);
    if (this._avail(r.humidity)) values.push(`<span class="${r.alerts ? ['', 'warn', 'crit'][r.humidityLevel] : ''}">${aqEsc(this._fmt(r.humidity, 0))}</span>`);
    var blink = r.level === 2 && this._config.blink ? ' blink' : '';
    return '<div class="room ' + color + '"' + target + (target ? ' role="button" tabindex="0"' : '') + '>' +
      '<div class="shape' + blink + '"><ha-icon icon="' + aqEsc(r.icon) + '"></ha-icon>' +
      (r.level ? `<span class="badge"><ha-icon icon="${r.level === 2 ? 'mdi:alert-circle' : 'mdi:alert'}"></ha-icon></span>` : '') + '</div>' +
      '<div class="room-text"><span class="room-name">' + aqEsc(r.name) + '</span>' +
      '<span class="room-values">' + values.join('<span class="sep"> · </span>') + '</span></div>' +
      (r.navigation_path ? '<ha-icon class="chev" icon="mdi:chevron-right"></ha-icon>' : '') + '</div>';
  }

  _badge(id, icon, name) {
    if (!this._avail(id)) return '';
    return '<span class="chip" data-more="' + aqEsc(id) + '" role="button" tabindex="0"><ha-icon icon="' + aqEsc(icon) + '"></ha-icon>' +
      (name ? `<span class="chip-name">${aqEsc(name)}</span>` : '') + '<span>' + aqEsc(this._fmt(id, 1)) + '</span></span>';
  }

  _render(rooms) {
    var c = this._config;
    var title = c.title != null && c.title !== '' ? c.title : this._t('title');

    // Outdoor badges: the configured entities, or the sensors of an outdoor area.
    var outT = c.outdoor_temperature, outH = c.outdoor_humidity, outName = c.outdoor_name;
    if (!outT && !outH) {
      var out = rooms.find((r) => r.outdoor);
      if (out) { outT = out.temperature; outH = out.humidity; outName = outName || out.name; }
    }
    var badges = this._badge(outT, 'mdi:thermometer', outName) + this._badge(outH, 'mdi:water-percent');

    var alerts = this._sort(rooms.filter((r) => r.level));
    var others = this._sort(rooms.filter((r) => !r.level));
    var worst = alerts.length ? alerts[0].level : 0;

    var level = ['ok', 'warn', 'crit'][worst];
    var header = '<div class="header"><div class="hicon ' + level + '"><ha-icon icon="' + aqEsc(c.icon || 'mdi:air-filter') + '"></ha-icon></div>' +
      '<div class="titles"><div class="name-row"><div class="name">' + aqEsc(title) + '</div>' +
      (badges ? `<div class="chips">${badges}</div>` : '') + '</div>' +
      (c.show_summary ? `<div class="summary ${level}">${aqEsc(this._summary(alerts))}</div>` : '') + '</div></div>';

    var body = '';
    if (!rooms.length) {
      body = `<div class="empty"><ha-icon icon="mdi:home-alert-outline"></ha-icon>${this._t('no_rooms')}</div>`;
    } else {
      if (alerts.length) body += `<div class="rooms">${alerts.map((r) => this._row(r)).join('')}</div>`;
      if (c.show_all_rooms && others.length) {
        var open = this._isOpen();
        body += '<div class="expander' + (open ? ' open' : '') + '">' +
          '<div class="exp-head" data-toggle="1" role="button" tabindex="0" aria-expanded="' + open + '">' +
          '<ha-icon icon="mdi:format-list-bulleted"></ha-icon><span>' + this._t(alerts.length ? 'other_rooms' : 'all_rooms') + '</span>' +
          '<span class="count">' + others.length + '</span><ha-icon class="exp-chev" icon="mdi:chevron-down"></ha-icon></div>' +
          (open ? `<div class="rooms">${others.map((r) => this._row(r)).join('')}</div>` : '') + '</div>';
      }
    }

    this.shadowRoot.innerHTML = `${this._styles()}<ha-card>${header}${body}</ha-card>`;
  }

  _styles() {
    return '<style>' +
      ':host { display: block; height: 100%; --aq-ok: var(--success-color, #43a047); --aq-warn: var(--warning-color, #ffa600); --aq-crit: var(--error-color, #db4437); }' +
      'ha-card { height: 100%; box-sizing: border-box; padding: 12px; display: flex; flex-direction: column; gap: 10px; }' +
      '.header { display: flex; align-items: center; gap: 10px; }' +
      '.hicon { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;' +
        ' --aq-c: var(--aq-ok); background: color-mix(in srgb, var(--aq-c) 15%, transparent); color: var(--aq-c); }' +
      '.hicon.warn { --aq-c: var(--aq-warn); } .hicon.crit { --aq-c: var(--aq-crit); }' +
      '.hicon ha-icon { --mdc-icon-size: 24px; }' +
      '.titles { flex: 1; min-width: 0; }' +
      '.name-row { display: flex; align-items: center; gap: 8px; }' +
      '.name { flex: 1; min-width: 0; font-size: 16px; font-weight: 500; line-height: 1.25; color: var(--primary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
      '.summary { font-size: 12px; line-height: 1.35; margin-top: 2px; }' +
      '.summary.ok { color: var(--secondary-text-color); }' +
      '.summary.warn { color: var(--aq-warn); }' +
      '.summary.crit { color: var(--aq-crit); }' +
      '.chips { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; }' +
      '.chip { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 500; padding: 1px 8px 1px 5px; border-radius: 12px; cursor: pointer;' +
        ' background: var(--secondary-background-color, rgba(128,128,128,0.12)); color: var(--primary-text-color); white-space: nowrap; }' +
      '.chip ha-icon { --mdc-icon-size: 13px; color: var(--secondary-text-color); }' +
      '.chip-name { color: var(--secondary-text-color); font-weight: 400; }' +
      '.empty { display: flex; align-items: center; gap: 10px; color: var(--secondary-text-color); }' +
      '.rooms { display: grid; flex-direction: column; gap: 6px; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); }' +
      '.room { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 10px;' +
        ' background: var(--secondary-background-color, rgba(128,128,128,0.1)); --aq-c: var(--aq-ok); }' +
      '.room[role=button] { cursor: pointer; }' +
      '.room.warn { --aq-c: var(--aq-warn); }' +
      '.room.crit { --aq-c: var(--aq-crit); }' +
      '.shape { position: relative; width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;' +
        ' background: color-mix(in srgb, var(--aq-c) 15%, transparent); color: var(--aq-c); }' +
      '.shape > ha-icon { --mdc-icon-size: 18px; }' +
      '.shape.blink > ha-icon { animation: aq-blink 1.5s ease-in-out infinite; }' +
      '@keyframes aq-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }' +
      '@media (prefers-reduced-motion: reduce) { .shape.blink > ha-icon { animation: none; } }' +
      '.badge { position: absolute; top: -2px; right: -2px; width: 14px; height: 14px; border-radius: 50%; display: flex; align-items: center; justify-content: center;' +
        ' background: var(--aq-c); color: #fff; box-shadow: 0 0 0 2px var(--card-background-color, #fff); }' +
      '.badge ha-icon { --mdc-icon-size: 12px; }' +
      '.room-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }' +
      '.room-name { font-size: 13px; font-weight: 500; color: var(--primary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
      '.room-values { font-size: 11px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
      '.room-values .warn { color: var(--aq-warn); font-weight: 500; }' +
      '.room-values .crit { color: var(--aq-crit); font-weight: 500; }' +
      '.chev { color: var(--secondary-text-color); --mdc-icon-size: 20px; flex-shrink: 0; }' +
      '.expander { display: flex; flex-direction: column; gap: 6px; }' +
      '.exp-head { display: flex; align-items: center; gap: 10px; padding: 2px 4px; cursor: pointer; border-radius: 10px; color: var(--secondary-text-color); font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: .04em; }' +
      '.exp-head > ha-icon { --mdc-icon-size: 20px; color: var(--secondary-text-color); }' +
      '.exp-head > span:first-of-type { flex: 1; }' +
      '.count { font-size: 12px; color: var(--secondary-text-color); font-weight: 400; }' +
      '.exp-chev { transition: transform 0.2s ease; transform: rotate(-90deg); }' +
      '.expander.open .exp-chev { transform: none; }' +
    '</style>';
  }

  _onClick(ev) {
    var path = ev.composedPath();
    if (path.some((n) => n.dataset?.toggle)) {
      this._open = !this._isOpen();
      this._update();
      return;
    }
    var nav = path.find((n) => n.dataset?.nav);
    if (nav) {
      history.pushState(null, '', nav.dataset.nav);
      window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } }));
      return;
    }
    var more = path.find((n) => n.dataset?.more);
    if (more) {
      this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: more.dataset.more }, bubbles: true, composed: true }));
    }
  }
}

// ── home-air-quality-card-editor (visual editor, built on HA's ha-form) ──────
var AQ_ROOM_FIELDS = ['name', 'area', 'icon', 'co2', 'temperature', 'humidity', 'navigation_path', 'alerts',
  'co2_warning', 'co2_critical', 'humidity_warning', 'humidity_critical'];

class HomeAirQualityCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign({}, config);
    this._render();
  }

  set hass(hass) {
    var prevLang = this._hass?.language;
    this._hass = hass;
    if (this._form && prevLang === (hass?.language)) {
      this._form.hass = hass;
    } else {
      this._render();
    }
  }

  _lang() {
    var lang = (this._config?.language) || (this._hass?.language) || 'en';
    lang = lang.split('-')[0];
    return AqI18n[lang] ? lang : 'en';
  }

  _schema() {
    var t = (k) => aqT(this._lang(), k);
    var sensor = (dc) => ({ entity: { domain: 'sensor', device_class: dc } });
    var ppm = { number: { min: 400, max: 5000, step: 50, mode: 'box', unit_of_measurement: 'ppm' } };
    var pct = { number: { min: 0, max: 100, step: 1, mode: 'box', unit_of_measurement: '%' } };
    var fields = {
      name: { selector: { text: {} } },
      area: { selector: { area: {} } },
      icon: { selector: { icon: {} } },
      co2: { selector: sensor('carbon_dioxide') },
      temperature: { selector: sensor('temperature') },
      humidity: { selector: sensor('humidity') },
      navigation_path: { selector: { navigation: {} } },
      alerts: { selector: { boolean: {} } },
      co2_warning: { selector: ppm },
      co2_critical: { selector: ppm },
      humidity_warning: { selector: pct },
      humidity_critical: { selector: pct },
    };
    AQ_ROOM_FIELDS.forEach((k) => { fields[k].label = t(`rf_${k}`); });
    return [
      {
        type: 'grid', name: '', schema: [
          { name: 'title', selector: { text: {} } },
          { name: 'icon', selector: { icon: {} } },
        ],
      },
      {
        type: 'grid', name: '', schema: [
          { name: 'outdoor_temperature', selector: sensor('temperature') },
          { name: 'outdoor_humidity', selector: sensor('humidity') },
        ],
      },
      { name: 'outdoor_name', selector: { text: {} } },
      {
        type: 'grid', name: '', schema: [
          { name: 'co2_warning', selector: ppm },
          { name: 'co2_critical', selector: ppm },
          { name: 'humidity_warning', selector: pct },
          { name: 'humidity_critical', selector: pct },
        ],
      },
      {
        type: 'grid', name: '', schema: [
          { name: 'show_summary', selector: { boolean: {} } },
          { name: 'show_all_rooms', selector: { boolean: {} } },
          { name: 'expanded', selector: { boolean: {} } },
          { name: 'blink', selector: { boolean: {} } },
        ],
      },
      {
        name: 'sort',
        selector: { select: { mode: 'dropdown', options: ['co2', 'name', 'none'].map((v) => ({ value: v, label: t(`sort_${v}`) })) } },
      },
      {
        name: 'language',
        selector: { select: { mode: 'dropdown', options: [{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }] } },
      },
      { name: 'rooms', selector: { object: { multiple: true, label_field: 'name', fields: fields } } },
      { name: 'exclude_areas', selector: { area: { multiple: true } } },
    ];
  }

  _render() {
    if (!this._config || !this._hass) return;
    if (!this._form) {
      this._form = document.createElement('ha-form');
      this._form.addEventListener('value-changed', (ev) => this._valueChanged(ev));
      this.appendChild(this._form);
    }
    var lang = this._lang();
    this._form.hass = this._hass;
    this._form.schema = this._schema();
    this._form.computeLabel = (s) => aqT(lang, `ed_${s.name}`);
    this._form.computeHelper = (s) => {
      var key = `ed_${s.name}_helper`;
      var txt = aqT(lang, key);
      return txt === key ? undefined : txt;
    };
    this._form.data = Object.assign({}, AQ_DEFAULTS, this._config);
  }

  _valueChanged(ev) {
    ev.stopPropagation();
    var value = Object.assign({}, ev.detail.value);
    var lang = this._lang();
    // Keep the YAML short: drop options left empty or at their default.
    Object.keys(value).forEach((key) => {
      if (value[key] === '' || value[key] === null || value[key] === undefined) delete value[key];
    });
    Object.keys(AQ_DEFAULTS).forEach((key) => {
      if (value[key] === AQ_DEFAULTS[key]) delete value[key];
    });
    if (Array.isArray(value.rooms)) {
      value.rooms = value.rooms.map((r) => {
        var room = {};
        Object.keys(r || {}).forEach((k) => { if (r[k] !== '' && r[k] !== null && r[k] !== undefined) room[k] = r[k]; });
        return room;
      });
      if (!value.rooms.length) delete value.rooms;
    }
    if (Array.isArray(value.exclude_areas) && !value.exclude_areas.length) delete value.exclude_areas;
    if (this._config.type) value = Object.assign({ type: this._config.type }, value);
    this._config = value;
    if (lang !== this._lang()) this._render();
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: value }, bubbles: true, composed: true }));
  }
}

if (!customElements.get('home-air-quality-card-editor')) {
  customElements.define('home-air-quality-card-editor', HomeAirQualityCardEditor);
}

if (!customElements.get('home-air-quality-card')) {
  customElements.define('home-air-quality-card', HomeAirQualityCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: 'home-air-quality-card',
    name: 'Home Air Quality Card',
    description: 'CO₂, temperature and humidity of every room, with alerts sorted by level and a collapsible room list',
    preview: true,
    documentationURL: 'https://github.com/juju35/ha-home-air-quality-card',
  });
}

console.info(`%c HOME-AIR-QUALITY-CARD %c v${HOME_AIR_QUALITY_CARD_VERSION} `, 'color:#fff;background:#43a047;font-weight:700', 'color:#000;background:#fff');
