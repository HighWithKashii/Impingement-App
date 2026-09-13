// localStorage-Persistenz. Kein Login, ein Nutzer, alles bleibt lokal im Browser.

import { DEFAULT_PLAN } from "./data.js";

const KEYS = {
  plan: "shoulder.plan.v1",
  currentPhase: "shoulder.currentPhase.v1",
  weekState: "shoulder.weekState.v1",
  history: "shoulder.history.v1",
  imageCache: "shoulder.imageCache.v1",
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Konnte", key, "nicht lesen, nutze Fallback.", e);
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Konnte", key, "nicht speichern.", e);
  }
}

// ---- Plan ----

export function getPlan() {
  return readJSON(KEYS.plan, null) ?? structuredClone(DEFAULT_PLAN);
}

export function savePlan(plan) {
  writeJSON(KEYS.plan, plan);
}

export function resetPlanToDefault() {
  const plan = structuredClone(DEFAULT_PLAN);
  savePlan(plan);
  return plan;
}

// ---- Aktuelle Phase ----

export function getCurrentPhaseId() {
  return readJSON(KEYS.currentPhase, null) ?? DEFAULT_PLAN.phases[0].id;
}

export function setCurrentPhaseId(phaseId) {
  writeJSON(KEYS.currentPhase, phaseId);
}

// ---- ISO-Wochen-Key (Jahr + Kalenderwoche), damit Haken jede Woche zurückgesetzt werden ----

export function isoWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function entryKey(sessionId, exerciseId) {
  return `${sessionId}__${exerciseId}`;
}

// ---- Wochen-Status (Haken + zuletzt eingegebene Werte für die aktuelle Woche) ----

export function getWeekState(weekKey = isoWeekKey()) {
  const all = readJSON(KEYS.weekState, {});
  return all[weekKey] ?? {};
}

export function getWeekEntry(sessionId, exerciseId, weekKey = isoWeekKey()) {
  const week = getWeekState(weekKey);
  return week[entryKey(sessionId, exerciseId)] ?? { done: false, weight: "", reps: "" };
}

export function setWeekEntry(sessionId, exerciseId, entry, weekKey = isoWeekKey()) {
  const all = readJSON(KEYS.weekState, {});
  if (!all[weekKey]) all[weekKey] = {};
  all[weekKey][entryKey(sessionId, exerciseId)] = entry;
  writeJSON(KEYS.weekState, all);
}

// ---- Verlauf ----
// Ein Eintrag wird angelegt/aktualisiert, sobald für eine Übung an einem Tag
// Gewicht/Wiederholungen gespeichert werden. Name wird als Snapshot mitgespeichert,
// damit der Verlauf auch nach Umbenennen/Löschen der Übung lesbar bleibt.

export function getHistory() {
  return readJSON(KEYS.history, []);
}

export function addOrUpdateHistoryEntry({ exerciseId, exerciseName, sessionId, phaseId, date, weight, reps }) {
  const history = getHistory();
  const idx = history.findIndex(
    (h) => h.exerciseId === exerciseId && h.date === date
  );
  const entry = { exerciseId, exerciseName, sessionId, phaseId, date, weight, reps };
  if (idx >= 0) {
    history[idx] = entry;
  } else {
    history.push(entry);
  }
  history.sort((a, b) => a.date.localeCompare(b.date));
  writeJSON(KEYS.history, history);
}

export function getHistoryForExercise(exerciseId) {
  return getHistory()
    .filter((h) => h.exerciseId === exerciseId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ---- Bild-Cache für wger-Suchergebnisse ----

export function getImageCache() {
  return readJSON(KEYS.imageCache, {});
}

export function getCachedImage(query) {
  const cache = getImageCache();
  return cache[query.toLowerCase()] ?? null;
}

export function setCachedImage(query, value) {
  const cache = getImageCache();
  cache[query.toLowerCase()] = value;
  writeJSON(KEYS.imageCache, cache);
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}
