// Minimales Canvas-Liniendiagramm für den Gewichtsverlauf einer Übung.
// Bewusst ohne externe Chart-Bibliothek, damit die App offline funktioniert.

export function drawWeightChart(canvas, entries) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || 320;
  const cssHeight = canvas.clientHeight || 160;
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const styles = getComputedStyle(document.documentElement);
  const gridColor = styles.getPropertyValue("--chart-grid").trim() || "#334155";
  const lineColor = styles.getPropertyValue("--chart-line").trim() || "#2dd4bf";
  const dotColor = styles.getPropertyValue("--chart-dot").trim() || "#f59e0b";
  const textColor = styles.getPropertyValue("--text-muted").trim() || "#94a3b8";

  const weights = entries.map((e) => parseFloat(e.weight)).filter((v) => !isNaN(v));
  if (weights.length === 0) {
    ctx.fillStyle = textColor;
    ctx.font = "13px 'IBM Plex Mono', monospace";
    ctx.fillText("Noch keine Gewichtswerte erfasst", 10, cssHeight / 2);
    return;
  }

  const padding = { top: 16, right: 16, bottom: 24, left: 36 };
  const w = cssWidth - padding.left - padding.right;
  const h = cssHeight - padding.top - padding.bottom;

  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;
  const yFor = (v) => padding.top + h - ((v - min) / range) * h;
  const xFor = (i) =>
    padding.left + (entries.length === 1 ? w / 2 : (i / (entries.length - 1)) * w);

  // Gitterlinien
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  ctx.font = "11px 'IBM Plex Mono', monospace";
  ctx.fillStyle = textColor;
  const ySteps = 3;
  for (let i = 0; i <= ySteps; i++) {
    const v = min + (range * i) / ySteps;
    const y = yFor(v);
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + w, y);
    ctx.stroke();
    ctx.fillText(v.toFixed(1), 2, y + 4);
  }

  // Linie
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  entries.forEach((e, i) => {
    const val = parseFloat(e.weight);
    if (isNaN(val)) return;
    const x = xFor(i);
    const y = yFor(val);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Punkte
  ctx.fillStyle = dotColor;
  entries.forEach((e, i) => {
    const val = parseFloat(e.weight);
    if (isNaN(val)) return;
    const x = xFor(i);
    const y = yFor(val);
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // X-Achsen-Labels (erstes und letztes Datum)
  ctx.fillStyle = textColor;
  ctx.font = "10px 'IBM Plex Mono', monospace";
  const first = entries[0];
  const last = entries[entries.length - 1];
  ctx.fillText(formatShort(first.date), padding.left, cssHeight - 6);
  if (entries.length > 1) {
    const lastLabel = formatShort(last.date);
    ctx.fillText(lastLabel, padding.left + w - ctx.measureText(lastLabel).width, cssHeight - 6);
  }
}

function formatShort(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.`;
}
