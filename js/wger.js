// Integration mit der öffentlichen wger.de API, um passende Trainingsbilder
// zu Übungsnamen zu finden. Läuft nur im Browser des Nutzers (nicht offline).

import { getCachedImage, setCachedImage } from "./storage.js";

const SEARCH_URL = "https://wger.de/api/v2/exercise/search/";
const IMAGE_URL = "https://wger.de/api/v2/exerciseimage/";

// Sucht ein Bild für eine Übung. Gibt { imageUrl, exerciseName } oder null zurück.
// Ergebnisse (auch "nichts gefunden") werden gecacht, damit nicht bei jedem
// Rendern erneut angefragt wird.
export async function findExerciseImage(query) {
  if (!query || !query.trim()) return null;

  const cached = getCachedImage(query);
  if (cached !== null) return cached;

  try {
    const result = await lookupImage(query);
    setCachedImage(query, result);
    return result;
  } catch (e) {
    console.warn("wger-Suche fehlgeschlagen für", query, e);
    // Fehlschlag nicht cachen (z. B. offline) - beim nächsten Mal erneut versuchen.
    return null;
  }
}

async function lookupImage(query) {
  const searchRes = await fetch(
    `${SEARCH_URL}?term=${encodeURIComponent(query)}&language=english&format=json`
  );
  if (!searchRes.ok) throw new Error(`Suche fehlgeschlagen: ${searchRes.status}`);
  const searchData = await searchRes.json();
  const suggestions = searchData.suggestions ?? [];
  if (suggestions.length === 0) return null;

  for (const suggestion of suggestions.slice(0, 5)) {
    const data = suggestion.data ?? {};
    const exerciseName = suggestion.value ?? data.name ?? query;

    // Manche Antworten liefern direkt ein Bild mit dem Suchtreffer.
    if (data.image) {
      return { imageUrl: absoluteUrl(data.image), exerciseName };
    }

    const baseId = data.base_id ?? data.id ?? data.exercise_base;
    if (!baseId) continue;

    const image = await fetchImageForBase(baseId);
    if (image) return { imageUrl: absoluteUrl(image), exerciseName };
  }

  return null;
}

async function fetchImageForBase(baseId) {
  const res = await fetch(`${IMAGE_URL}?exercise_base=${baseId}&format=json`);
  if (!res.ok) return null;
  const data = await res.json();
  const results = data.results ?? [];
  if (results.length === 0) return null;
  const main = results.find((r) => r.is_main) ?? results[0];
  return main.image ?? null;
}

function absoluteUrl(url) {
  if (!url) return url;
  if (url.startsWith("http")) return url;
  return `https://wger.de${url}`;
}
