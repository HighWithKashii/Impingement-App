# Schulter-Reha Tracker

Progressive Web App zum Tracken des Schulter-Reha-/Aufbautrainings bei Impingement-Syndrom. Läuft komplett offline im Browser, keine Server-Komponente, keine Anmeldung – alle Daten liegen per `localStorage` auf dem Gerät.

## Funktionen

- **Wochenansicht**: 3 Einheiten/Woche (A/B/C) mit Übungen, Ziel-Sätzen/Wiederholungen, Abhaken, Eingabe von tatsächlichem Gewicht/Wdh. und kurzer Technik-Erklärung.
- **Plan bearbeiten**: Standardplan (3 Phasen) ist vorprogrammiert, aber vollständig editierbar – Übungen anpassen, hinzufügen, entfernen; jederzeit auf Standard zurücksetzbar.
- **Verlauf**: Gewichts-/Wiederholungsentwicklung pro Übung als Diagramm + Tabelle, erreichbar über den Tab „Verlauf“ oder durch Antippen einer Übung.
- **Bilder**: Automatischer Bild-Lookup über die [wger.de](https://wger.de) API; wird keine passende Übung gefunden, erscheint ein Platzhalter mit manuellem Bild-URL-Feld.
- **PWA**: Installierbar, Service Worker für Offline-Nutzung, Icon wird per Skript generiert (kein externes Bild-Asset).

## Lokal starten

Kein Build-Schritt nötig – ein statischer Webserver reicht:

```bash
python3 -m http.server 8000
# oder: npx http-server -p 8000
```

Dann `http://localhost:8000` öffnen.

## Deployment

Deployment läuft automatisch über GitHub Actions (`.github/workflows/deploy.yml`) bei jedem Push auf `main`. Einmalig muss in den Repo-Settings unter **Settings → Pages → Source** auf **GitHub Actions** umgestellt werden.

## Icons neu generieren

```bash
pip install pillow
python3 tools/generate_icons.py
```
