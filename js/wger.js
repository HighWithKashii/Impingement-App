// Integration mit der öffentlichen wger.de API, um passende Trainingsbilder
// zu Übungsnamen zu finden. Läuft nur im Browser des Nutzers (nicht offline).
//
// Die wger-API hat über die Zeit Feldnamen geändert (z.B. exercise_base -> exercise).
// Deshalb wird hier bewusst defensiv geparst und mit mehreren Parameter-Varianten
// versucht, statt sich auf ein einzelnes starres Schema zu verlassen.

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
  const searchData = await fetchJSON(
    `${SEARCH_URL}?term=${encodeURIComponent(query)}&language=en&format=json`
  );
  const suggestions = searchData?.suggestions ?? (Array.isArray(searchData) ? searchData : []);
  if (suggestions.length === 0) {
    console.debug("wger: keine Suggestions für", query, searchData);
    return null;
  }

  for (const suggestion of suggestions.slice(0, 5)) {
    const data = suggestion.data ?? suggestion ?? {};
    const exerciseName = suggestion.value ?? data.name ?? query;

    // Manche Antworten liefern direkt ein Bild mit dem Suchtreffer.
    if (data.image) {
      return { imageUrl: absoluteUrl(data.image), exerciseName };
    }

    // Die wger-API hat den Feldnamen für die Übungs-ID über verschiedene
    // Versionen hinweg geändert - alle bekannten Varianten durchprobieren.
    const candidateIds = [data.base_id, data.exercise_base, data.id, data.exercise].filter(
      (v) => v !== undefined && v !== null
    );

    for (const id of candidateIds) {
      const image = await fetchImageForId(id);
      if (image) return { imageUrl: absoluteUrl(image), exerciseName };
    }
  }

  return null;
}

async function fetchImageForId(id) {
  // Je nach API-Version heißt der Filterparameter "exercise_base" oder "exercise".
  for (const param of ["exercise", "exercise_base"]) {
    try {
      const data = await fetchJSON(`${IMAGE_URL}?${param}=${id}&format=json`);
      const results = data?.results ?? [];
      if (results.length === 0) continue;
      const main = results.find((r) => r.is_main) ?? results[0];
      if (main?.image) return main.image;
    } catch (e) {
      console.debug("wger: Bildabfrage fehlgeschlagen für", param, id, e);
    }
  }
  return null;
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`wger-Anfrage fehlgeschlagen (${res.status}): ${url} ${body.slice(0, 200)}`);
  }
  return res.json();
}

function absoluteUrl(url) {
  if (!url) return url;
  if (url.startsWith("http")) return url;
  return `https://wger.de${url}`;
}
