import { PLAN_META } from "./data.js";
import {
  getPlan,
  savePlan,
  resetPlanToDefault,
  getCurrentPhaseId,
  setCurrentPhaseId,
  getWeekEntry,
  setWeekEntry,
  isoWeekKey,
  addOrUpdateHistoryEntry,
  getHistory,
  getHistoryForExercise,
  todayISO,
} from "./storage.js";
import { findExerciseImage } from "./wger.js";
import { drawWeightChart } from "./charts.js";

let plan = getPlan();
let activeTab = "home";
let historyExerciseId = null;
let highlightSessionId = null;
let editorPhaseId = getCurrentPhaseId();
let editorSessionId = plan.phases.find((p) => p.id === editorPhaseId)?.sessions[0].id;

const view = document.getElementById("view");
const phaseBar = document.getElementById("phase-bar");
const tabBar = document.getElementById("tab-bar");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findPhase(phaseId) {
  return plan.phases.find((p) => p.id === phaseId) ?? plan.phases[0];
}

function findSession(phase, sessionId) {
  return phase.sessions.find((s) => s.id === sessionId) ?? phase.sessions[0];
}

function isSessionDone(session, weekKey) {
  if (session.exercises.length === 0) return false;
  return session.exercises.every((ex) => getWeekEntry(session.id, ex.id, weekKey).done);
}

function getTodaysSession(phase, weekKey) {
  return phase.sessions.find((s) => !isSessionDone(s, weekKey)) ?? null;
}

function findExerciseAnywhere(exerciseId) {
  for (const phase of plan.phases) {
    for (const session of phase.sessions) {
      const ex = session.exercises.find((e) => e.id === exerciseId);
      if (ex) return { phase, session, exercise: ex };
    }
  }
  return null;
}

function escapeHTML(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toast.hidden = true;
  }, 1800);
}

// ---------------------------------------------------------------------------
// Phase bar (shared across tabs)
// ---------------------------------------------------------------------------

function renderPhaseBar() {
  const currentPhaseId = getCurrentPhaseId();
  const phase = findPhase(currentPhaseId);
  phaseBar.innerHTML = `
    <select id="phase-select" class="phase-select">
      ${plan.phases
        .map(
          (p) =>
            `<option value="${p.id}" ${p.id === currentPhaseId ? "selected" : ""}>${escapeHTML(
              p.name
            )}</option>`
        )
        .join("")}
    </select>
    <span class="phase-weeks">${escapeHTML(phase.weeks)}</span>
  `;
  document.getElementById("phase-select").addEventListener("change", (e) => {
    setCurrentPhaseId(e.target.value);
    editorPhaseId = e.target.value;
    editorSessionId = findPhase(editorPhaseId).sessions[0].id;
    render();
  });
}

// ---------------------------------------------------------------------------
// Tab: Home
// ---------------------------------------------------------------------------

function renderHome() {
  const phase = findPhase(getCurrentPhaseId());
  const weekKey = isoWeekKey();
  const todaysSession = getTodaysSession(phase, weekKey);
  const doneCount = phase.sessions.filter((s) => isSessionDone(s, weekKey)).length;

  const heroHTML = todaysSession
    ? `
      <div class="hero-eyebrow">Als Nächstes fällig</div>
      <div class="hero-row">
        <div class="hero-letter">${escapeHTML(todaysSession.name.replace("Einheit ", ""))}</div>
        <div class="hero-body">
          <div class="hero-session-name">${escapeHTML(todaysSession.name)}</div>
          <div class="hero-meta">${todaysSession.exercises.length} Übungen &middot; ${escapeHTML(phase.name)}</div>
        </div>
      </div>
      <button class="btn-hero" data-action="go-to-session" data-session="${todaysSession.id}">Jetzt starten</button>
    `
    : `
      <div class="hero-eyebrow">Diese Woche</div>
      <div class="hero-row">
        <div class="hero-letter">&#10003;</div>
        <div class="hero-body">
          <div class="hero-session-name">Alles erledigt</div>
          <div class="hero-meta">Alle Einheiten dieser Woche sind abgehakt. Stark!</div>
        </div>
      </div>
      <button class="btn-hero" data-action="go-to-session" data-session="${phase.sessions[0].id}">Woche ansehen</button>
    `;

  const pillsHTML = phase.sessions
    .map((s) => {
      const done = isSessionDone(s, weekKey);
      const isCurrent = todaysSession && s.id === todaysSession.id;
      return `
        <div class="week-pill ${done ? "is-done" : ""} ${isCurrent ? "is-current" : ""}">
          <span class="pill-letter">${escapeHTML(s.name.replace("Einheit ", ""))}</span>
          <span>${done ? "erledigt" : "offen"}</span>
        </div>
      `;
    })
    .join("");

  const monthDots = buildMonthDots();
  const phaseIndex = plan.phases.findIndex((p) => p.id === phase.id) + 1;
  const totalPhases = plan.phases.length;
  const phasePct = phaseIndex / totalPhases;
  const phaseShortName = phase.name.split(":")[1]?.trim() ?? phase.name;

  view.innerHTML = `
    <div class="hero-card">
      ${heroHTML}
      <div class="week-pills">${pillsHTML}</div>
    </div>
    <div class="stat-grid">
      <div class="stat-tile ring-tile">
        <div class="stat-tile-label">Aktuelle Phase</div>
        <div class="ring" style="--pct:${phasePct}">
          <div class="ring-inner">
            <div class="n">${phaseIndex}</div>
            <div class="of">VON ${totalPhases}</div>
          </div>
        </div>
        <div class="phase-name">${escapeHTML(phaseShortName)}</div>
      </div>
      <div class="stat-tile">
        <div class="stat-tile-label">Diese Woche</div>
        <div class="stat-tile-value">${doneCount}<span class="unit">/${phase.sessions.length} Einheiten</span></div>
      </div>
    </div>
    <div class="card dot-grid-card">
      <div class="stat-tile-label">Aktivität &middot; ${escapeHTML(monthDots.label)}</div>
      <div class="dot-grid">${monthDots.dotsHTML}</div>
    </div>
  `;
}

function buildMonthDots() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = todayISO();
  const history = getHistory();
  const trainedDates = new Set(history.map((h) => h.date));

  const label = now.toLocaleDateString("de-DE", { month: "long" });
  let dotsHTML = "";
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const isActive = trainedDates.has(dateStr);
    const isToday = dateStr === todayStr;
    dotsHTML += `<span class="dot ${isActive ? "is-active" : ""} ${isToday ? "is-today" : ""}"></span>`;
  }
  return { label, dotsHTML };
}

// ---------------------------------------------------------------------------
// Tab: Woche
// ---------------------------------------------------------------------------

function renderWoche() {
  const phase = findPhase(getCurrentPhaseId());
  const weekKey = isoWeekKey();

  const principlesHTML = `
    <details class="info-panel">
      <summary><span>Grundprinzipien &amp; Sicherheit</span><span>&#9662;</span></summary>
      <div class="info-panel-body">
        <p>${escapeHTML(PLAN_META.goal)}</p>
        <ul>
          ${PLAN_META.principles.map((p) => `<li>${escapeHTML(p)}</li>`).join("")}
        </ul>
        <div class="info-important">${escapeHTML(PLAN_META.important)}</div>
      </div>
    </details>
  `;

  const sessionsHTML = phase.sessions
    .map((session) => {
      const doneCount = session.exercises.filter(
        (ex) => getWeekEntry(session.id, ex.id, weekKey).done
      ).length;
      return `
        <div class="card" data-session-card="${session.id}">
          <div class="session-title">
            <h2>${escapeHTML(session.name)}</h2>
            <span class="session-progress">${doneCount}/${session.exercises.length} erledigt</span>
          </div>
          ${session.note ? `<p class="session-note">${escapeHTML(session.note)}</p>` : ""}
          ${session.exercises.map((ex) => exerciseCardHTML(phase, session, ex, weekKey)).join("")}
        </div>
      `;
    })
    .join("");

  view.innerHTML = `${principlesHTML}${sessionsHTML}`;
  hydrateImages(phase.sessions.flatMap((s) => s.exercises));
}

function exerciseCardHTML(phase, session, ex, weekKey) {
  const entry = getWeekEntry(session.id, ex.id, weekKey);
  return `
    <div class="exercise ${entry.done ? "is-done" : ""}" data-exercise-card="${ex.id}">
      <div class="exercise-top">
        <div class="exercise-image-wrap" data-role="image" data-exercise-id="${ex.id}" data-action="open-history">
          <div class="exercise-image-placeholder">Lädt…</div>
        </div>
        <div class="exercise-main">
          <div class="exercise-name-row">
            <div class="exercise-name" data-action="open-history" data-exercise-id="${ex.id}">${escapeHTML(
              ex.name
            )}</div>
            <button
              class="done-toggle ${entry.done ? "is-done" : ""}"
              data-action="toggle-done"
              data-session="${session.id}"
              data-exercise="${ex.id}"
              aria-label="Erledigt"
            >&#10003;</button>
          </div>
          <div class="exercise-target">${ex.sets} × ${escapeHTML(ex.reps)}</div>
        </div>
      </div>
      <p class="exercise-technique">${escapeHTML(ex.technique)}</p>
      <div class="exercise-inputs">
        <div class="field">
          <label>Gewicht (kg)</label>
          <input
            type="text"
            inputmode="decimal"
            placeholder="z.B. 8"
            value="${escapeHTML(entry.weight)}"
            data-role="weight-input"
            data-session="${session.id}"
            data-exercise="${ex.id}"
            data-phase="${phase.id}"
          />
        </div>
        <div class="field">
          <label>Wdh. (Ø/Satz)</label>
          <input
            type="text"
            inputmode="decimal"
            placeholder="z.B. 15"
            value="${escapeHTML(entry.reps)}"
            data-role="reps-input"
            data-session="${session.id}"
            data-exercise="${ex.id}"
            data-phase="${phase.id}"
          />
        </div>
      </div>
      <div id="imgform-${ex.id}" class="btn-row" hidden></div>
    </div>
  `;
}

async function hydrateImages(exercises) {
  for (const ex of exercises) {
    const wrap = view.querySelector(`[data-role="image"][data-exercise-id="${ex.id}"]`);
    if (!wrap) continue;

    if (ex.imageUrl) {
      wrap.innerHTML = `<img src="${escapeHTML(ex.imageUrl)}" alt="${escapeHTML(ex.name)}" />`;
      continue;
    }

    const result = await findExerciseImage(ex.wgerQuery || ex.name);
    // View may have re-rendered while we waited; re-query.
    const currentWrap = view.querySelector(`[data-role="image"][data-exercise-id="${ex.id}"]`);
    if (!currentWrap) continue;

    if (result?.imageUrl) {
      currentWrap.innerHTML = `<img src="${escapeHTML(result.imageUrl)}" alt="${escapeHTML(ex.name)}" />`;
    } else {
      currentWrap.innerHTML = `<div class="exercise-image-placeholder">Kein Bild gefunden</div>`;
      const form = document.getElementById(`imgform-${ex.id}`);
      if (form) {
        form.hidden = false;
        form.innerHTML = `
          <input
            type="url"
            placeholder="Bild-URL einfügen…"
            data-role="manual-image-input"
            data-exercise="${ex.id}"
            class="field"
            style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:7px 8px;font-size:12px;"
          />
          <button class="btn btn-sm" data-action="set-image-url" data-exercise="${ex.id}">Setzen</button>
        `;
      }
    }
  }
}

function persistWeekValue(session, exercise, field, value) {
  const entry = getWeekEntry(session, exercise);
  entry[field] = value;
  setWeekEntry(session, exercise, entry);
}

function persistHistoryIfNeeded(phaseId, session, exercise) {
  const entry = getWeekEntry(session, exercise);
  if (!entry.weight && !entry.reps) return;
  const found = findExerciseAnywhere(exercise);
  addOrUpdateHistoryEntry({
    exerciseId: exercise,
    exerciseName: found?.exercise.name ?? exercise,
    sessionId: session,
    phaseId,
    date: todayISO(),
    weight: entry.weight,
    reps: entry.reps,
  });
}

// ---------------------------------------------------------------------------
// Tab: Verlauf
// ---------------------------------------------------------------------------

function allExercisesGrouped() {
  return plan.phases.flatMap((phase) =>
    phase.sessions.flatMap((session) =>
      session.exercises.map((ex) => ({ phase, session, exercise: ex }))
    )
  );
}

function renderVerlauf() {
  const grouped = allExercisesGrouped();
  if (grouped.length === 0) {
    view.innerHTML = `<p class="empty-hint">Noch keine Übungen im Plan.</p>`;
    return;
  }
  if (!historyExerciseId || !grouped.some((g) => g.exercise.id === historyExerciseId)) {
    historyExerciseId = grouped[0].exercise.id;
  }

  const optionsHTML = plan.phases
    .map(
      (phase) => `
        <optgroup label="${escapeHTML(phase.name)}">
          ${phase.sessions
            .flatMap((session) =>
              session.exercises.map(
                (ex) =>
                  `<option value="${ex.id}" ${ex.id === historyExerciseId ? "selected" : ""}>${escapeHTML(
                    session.name
                  )}: ${escapeHTML(ex.name)}</option>`
              )
            )
            .join("")}
        </optgroup>
      `
    )
    .join("");

  const entries = getHistoryForExercise(historyExerciseId);
  const found = findExerciseAnywhere(historyExerciseId);
  const rowsHTML = entries
    .slice()
    .reverse()
    .map(
      (e) => `
        <tr>
          <td>${formatDate(e.date)}</td>
          <td>${escapeHTML(e.weight) || "–"} kg</td>
          <td>${escapeHTML(e.reps) || "–"}</td>
        </tr>
      `
    )
    .join("");

  view.innerHTML = `
    <select id="history-select" class="phase-select history-select">${optionsHTML}</select>
    <div class="card chart-card">
      <h2 style="font-size:14px;margin-bottom:8px;">${escapeHTML(found?.exercise.name ?? "")}</h2>
      <canvas id="history-canvas"></canvas>
    </div>
    ${
      entries.length === 0
        ? `<p class="empty-hint">Für diese Übung wurden noch keine Werte erfasst. Trage Gewicht/Wdh. in der Wochenansicht ein.</p>`
        : `
      <div class="card">
        <table class="history-table">
          <thead><tr><th>Datum</th><th>Gewicht</th><th>Wdh.</th></tr></thead>
          <tbody>${rowsHTML}</tbody>
        </table>
      </div>
    `
    }
  `;

  document.getElementById("history-select").addEventListener("change", (e) => {
    historyExerciseId = e.target.value;
    renderVerlauf();
  });

  if (entries.length > 0) {
    drawWeightChart(document.getElementById("history-canvas"), entries);
  }
}

function formatDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

// ---------------------------------------------------------------------------
// Tab: Bearbeiten
// ---------------------------------------------------------------------------

function renderBearbeiten() {
  const phase = findPhase(editorPhaseId) ?? plan.phases[0];
  editorPhaseId = phase.id;
  const session = findSession(phase, editorSessionId) ?? phase.sessions[0];
  editorSessionId = session.id;

  const sessionIndex = phase.sessions.findIndex((s) => s.id === session.id);

  view.innerHTML = `
    <div class="editor-select-row">
      <select id="editor-phase-select" class="phase-select">
        ${plan.phases
          .map((p) => `<option value="${p.id}" ${p.id === phase.id ? "selected" : ""}>${escapeHTML(p.name)}</option>`)
          .join("")}
      </select>
      <div class="segmented" id="editor-session-segmented">
        <div class="slide-indicator" style="transform: translateX(${sessionIndex * 100}%);"></div>
        ${phase.sessions
          .map(
            (s) =>
              `<button class="${s.id === session.id ? "active" : ""}" data-session-id="${s.id}">${escapeHTML(
                s.name.replace("Einheit ", "")
              )}</button>`
          )
          .join("")}
      </div>
    </div>

    <div class="card">
      <div class="field">
        <label>Hinweis-Text für ${escapeHTML(session.name)} (optional)</label>
        <textarea id="session-note-input" rows="2">${escapeHTML(session.note || "")}</textarea>
      </div>
    </div>

    ${session.exercises.map((ex) => editorExerciseHTML(ex)).join("")}

    <button class="btn btn-primary btn-block" data-action="add-exercise">+ Übung hinzufügen</button>

    <div class="btn-row" style="margin-top:20px;">
      <button class="btn btn-danger btn-block" data-action="reset-plan">Plan auf Standard zurücksetzen</button>
    </div>
  `;

  document.getElementById("editor-phase-select").addEventListener("change", (e) => {
    editorPhaseId = e.target.value;
    editorSessionId = findPhase(editorPhaseId).sessions[0].id;
    renderBearbeiten();
  });
  document.getElementById("editor-session-segmented").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-session-id]");
    if (!btn) return;
    editorSessionId = btn.dataset.sessionId;
    renderBearbeiten();
  });
  document.getElementById("session-note-input").addEventListener("focusout", (e) => {
    session.note = e.target.value;
    savePlan(plan);
  });
}

function editorExerciseHTML(ex) {
  return `
    <div class="editor-exercise" data-exercise-editor="${ex.id}">
      <div class="field">
        <label>Name</label>
        <input type="text" value="${escapeHTML(ex.name)}" data-edit-field="name" data-exercise="${ex.id}" />
      </div>
      <div class="editor-field-row" style="margin-top:8px;">
        <div class="field">
          <label>Sätze</label>
          <input type="number" min="1" value="${escapeHTML(ex.sets)}" data-edit-field="sets" data-exercise="${ex.id}" />
        </div>
        <div class="field">
          <label>Wiederholungen</label>
          <input type="text" value="${escapeHTML(ex.reps)}" data-edit-field="reps" data-exercise="${ex.id}" />
        </div>
      </div>
      <div class="field" style="margin-top:8px;">
        <label>Ausführung / Technik</label>
        <textarea rows="3" data-edit-field="technique" data-exercise="${ex.id}">${escapeHTML(ex.technique)}</textarea>
      </div>
      <div class="field" style="margin-top:8px;">
        <label>Bild-URL (manuell, überschreibt wger-Suche)</label>
        <input type="url" value="${escapeHTML(ex.imageUrl || "")}" placeholder="https://…" data-edit-field="imageUrl" data-exercise="${ex.id}" />
      </div>
      <div class="editor-actions">
        <button class="btn btn-danger btn-sm" data-action="delete-exercise" data-exercise="${ex.id}">Entfernen</button>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Rendering dispatcher
// ---------------------------------------------------------------------------

function render() {
  renderPhaseBar();
  if (activeTab === "home") renderHome();
  else if (activeTab === "woche") renderWoche();
  else if (activeTab === "verlauf") renderVerlauf();
  else if (activeTab === "bearbeiten") renderBearbeiten();

  if (activeTab === "woche" && highlightSessionId) {
    const target = view.querySelector(`[data-session-card="${highlightSessionId}"]`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.classList.add("is-highlighted");
      setTimeout(() => target.classList.remove("is-highlighted"), 2000);
    }
    highlightSessionId = null;
  }
}

// ---------------------------------------------------------------------------
// Event delegation
// ---------------------------------------------------------------------------

tabBar.addEventListener("click", (e) => {
  const btn = e.target.closest(".tab-btn");
  if (!btn) return;
  activeTab = btn.dataset.tab;
  tabBar.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("is-active", b === btn));
  render();
});

view.addEventListener("click", (e) => {
  const goToSessionBtn = e.target.closest('[data-action="go-to-session"]');
  if (goToSessionBtn) {
    highlightSessionId = goToSessionBtn.dataset.session;
    activeTab = "woche";
    tabBar.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("is-active", b.dataset.tab === "woche"));
    render();
    return;
  }

  const historyLink = e.target.closest('[data-action="open-history"]');
  if (historyLink) {
    historyExerciseId = historyLink.dataset.exerciseId;
    activeTab = "verlauf";
    tabBar.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("is-active", b.dataset.tab === "verlauf"));
    render();
    return;
  }

  const toggleBtn = e.target.closest('[data-action="toggle-done"]');
  if (toggleBtn) {
    const { session, exercise } = toggleBtn.dataset;
    const entry = getWeekEntry(session, exercise);
    entry.done = !entry.done;
    setWeekEntry(session, exercise, entry);
    if (entry.done) {
      persistHistoryIfNeeded(getCurrentPhaseId(), session, exercise);
    }
    renderWoche();
    return;
  }

  const setImageBtn = e.target.closest('[data-action="set-image-url"]');
  if (setImageBtn) {
    const exerciseId = setImageBtn.dataset.exercise;
    const input = view.querySelector(`[data-role="manual-image-input"][data-exercise="${exerciseId}"]`);
    const url = input?.value.trim();
    if (!url) return;
    const found = findExerciseAnywhere(exerciseId);
    if (found) {
      found.exercise.imageUrl = url;
      savePlan(plan);
      renderWoche();
      showToast("Bild gespeichert");
    }
    return;
  }

  const addBtn = e.target.closest('[data-action="add-exercise"]');
  if (addBtn) {
    const phase = findPhase(editorPhaseId);
    const session = findSession(phase, editorSessionId);
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    session.exercises.push({
      id,
      name: "Neue Übung",
      sets: 3,
      reps: "10",
      technique: "",
      wgerQuery: "",
      imageUrl: null,
    });
    savePlan(plan);
    renderBearbeiten();
    return;
  }

  const deleteBtn = e.target.closest('[data-action="delete-exercise"]');
  if (deleteBtn) {
    const exerciseId = deleteBtn.dataset.exercise;
    const phase = findPhase(editorPhaseId);
    const session = findSession(phase, editorSessionId);
    if (!confirm("Diese Übung wirklich entfernen? Der Verlauf bleibt erhalten.")) return;
    session.exercises = session.exercises.filter((e2) => e2.id !== exerciseId);
    savePlan(plan);
    renderBearbeiten();
    return;
  }

  const resetBtn = e.target.closest('[data-action="reset-plan"]');
  if (resetBtn) {
    if (!confirm("Wirklich den gesamten Plan auf den Standard zurücksetzen? Eigene Änderungen gehen verloren.")) return;
    plan = resetPlanToDefault();
    editorPhaseId = plan.phases[0].id;
    editorSessionId = plan.phases[0].sessions[0].id;
    render();
    showToast("Plan zurückgesetzt");
    return;
  }
});

view.addEventListener("input", (e) => {
  const weightInput = e.target.closest('[data-role="weight-input"]');
  if (weightInput) {
    persistWeekValue(weightInput.dataset.session, weightInput.dataset.exercise, "weight", weightInput.value);
    return;
  }
  const repsInput = e.target.closest('[data-role="reps-input"]');
  if (repsInput) {
    persistWeekValue(repsInput.dataset.session, repsInput.dataset.exercise, "reps", repsInput.value);
    return;
  }
});

view.addEventListener("focusout", (e) => {
  const isWeight = e.target.matches('[data-role="weight-input"]');
  const isReps = e.target.matches('[data-role="reps-input"]');
  if (isWeight || isReps) {
    persistHistoryIfNeeded(e.target.dataset.phase, e.target.dataset.session, e.target.dataset.exercise);
    return;
  }

  const editField = e.target.closest("[data-edit-field]");
  if (editField) {
    const { editField: field, exercise } = editField.dataset;
    const found = findExerciseAnywhere(exercise);
    if (!found) return;
    let value = editField.value;
    if (field === "sets") value = parseInt(value, 10) || 1;
    if (field === "imageUrl") value = value.trim() || null;
    found.exercise[field] = value;
    savePlan(plan);
  }
});

// ---------------------------------------------------------------------------
// PWA: Service Worker + Install-Prompt
// ---------------------------------------------------------------------------

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((err) => {
      console.warn("Service Worker Registrierung fehlgeschlagen:", err);
    });
  });
}

let deferredInstallPrompt = null;
const installBtn = document.getElementById("install-btn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  installBtn.hidden = false;
});

installBtn.addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installBtn.hidden = true;
});

window.addEventListener("appinstalled", () => {
  installBtn.hidden = true;
});

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

render();
