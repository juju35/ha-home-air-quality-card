import assert from "node:assert/strict";
import { test } from "node:test";
import { loadCard } from "./load.mjs";

const { aqAreaSensors, aqAutoRooms, aqAreaIndex, aqEsc } = loadCard("home-air-quality-card.js", [
  "aqAreaSensors",
  "aqAutoRooms",
  "aqAreaIndex",
  "aqEsc",
]);

const st = (state, device_class) => ({ state, attributes: { device_class } });

function mockHass() {
  return {
    areas: { bedroom_1: { name: "Bedroom" }, office: { name: "Office" }, hall: { name: "Hall" } },
    devices: { d1: { area_id: "bedroom_1" }, d2: { area_id: "office" } },
    entities: {
      "sensor.bed_co2": { entity_id: "sensor.bed_co2", device_id: "d1" },
      "sensor.bed_temperature": { entity_id: "sensor.bed_temperature", device_id: "d1" },
      "sensor.office_humidity": { entity_id: "sensor.office_humidity", device_id: "d2" },
      // Area set on the entity itself wins over its device's.
      "sensor.office_co2": { entity_id: "sensor.office_co2", device_id: "d1", area_id: "office" },
      "sensor.hidden_co2": { entity_id: "sensor.hidden_co2", area_id: "hall", hidden: true },
    },
    states: {
      "sensor.bed_co2": st("800", "carbon_dioxide"),
      "sensor.bed_temperature": st("20", "temperature"),
      "sensor.office_humidity": st("50", "humidity"),
      "sensor.office_co2": st("900", "carbon_dioxide"),
      "sensor.hidden_co2": st("700", "carbon_dioxide"),
    },
  };
}

test("aqAreaSensors finds the sensors of an area (entity or device area)", () => {
  const hass = mockHass();
  assert.equal(JSON.stringify(aqAreaSensors(hass, "bedroom_1")), JSON.stringify({ co2: "sensor.bed_co2", temperature: "sensor.bed_temperature" }));
  assert.equal(JSON.stringify(aqAreaSensors(hass, "office")), JSON.stringify({ co2: "sensor.office_co2", humidity: "sensor.office_humidity" }));
  assert.equal(JSON.stringify(aqAreaSensors(hass, "hall")), "{}");
  assert.equal(aqAutoRooms(hass).length, 2);
});

test("the area index is reused for new states and rebuilt when the registry changes", () => {
  const hass = mockHass();
  aqAreaSensors(hass, "bedroom_1");
  const memo = aqAreaIndex.get(hass.entities);
  aqAreaSensors({ ...hass, states: { ...hass.states } }, "bedroom_1");
  assert.equal(aqAreaIndex.get(hass.entities), memo);

  // A device moved to another area: new hass.devices object, index rebuilt.
  const moved = { ...hass, devices: { ...hass.devices, d1: { area_id: "hall" } } };
  assert.equal(aqAreaSensors(moved, "hall").co2, "sensor.bed_co2");
  assert.equal(aqAreaSensors(moved, "bedroom_1").co2, undefined);
});

test("a sensor whose state is not loaded yet is ignored until it is", () => {
  const hass = mockHass();
  const states = { ...hass.states };
  delete states["sensor.bed_co2"];
  assert.equal(aqAreaSensors({ ...hass, states }, "bedroom_1").co2, undefined);
  assert.equal(aqAreaSensors(hass, "bedroom_1").co2, "sensor.bed_co2");
});

test("aqEsc escapes HTML text and attributes", () => {
  assert.equal(aqEsc(`<"'&>`), "&lt;&quot;&#39;&amp;&gt;");
});
