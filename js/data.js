// Standard-Trainingsplan: Schulter-Reha & Aufbau (Impingement)
// Dient nur als Erstbefüllung von localStorage – der Nutzer kann alles bearbeiten.

export const PLAN_META = {
  title: "Schulter-Trainingsplan",
  subtitle: "Impingement-Rehab & Aufbau (Handball)",
  goal:
    "Rotatorenmanschette und Scapula-Stabilisatoren so aufbauen, dass die Wurfbelastung im Handball wieder schmerzfrei wird.",
  scope: "3 Einheiten/Woche, zusätzlich zu Di/Mi/Fr Handballtraining + Wochenendspiel.",
  dayHint:
    "Montag, Donnerstag, plus dein spielfreier Wochenendtag – lege die intensivste Einheit nicht direkt vor das Spiel.",
  principles: [
    "Kein Training durch scharfen Schmerz. Ziehen oder Muskelkater ist ok, ein stechender Schmerz im Gelenk ist ein Stopp-Signal.",
    "Der schmerzhafte Bogen liegt meist zwischen 60° und 120° Abduktion in Kombination mit Innenrotation – Übungen in diesem Bereich anfangs vermeiden oder mit wenig Gewicht ausführen.",
    "Zugbewegungen (Rudern, Face Pulls, Latzug) bekommen mehr Volumen als Druckbewegungen, um das bei Werfern typische Ungleichgewicht auszugleichen.",
    "Gewicht/Widerstand erst steigern, wenn die aktuelle Belastung über alle Sätze schmerzfrei ist.",
    "Die drei Phasen sind Richtwerte (je 3–4 Wochen), kein starres Datum – wechsle erst weiter, wenn eine Phase komplett schmerzfrei läuft.",
  ],
  important:
    "Sprich mit deinem Physio ab, wann du im Handballtraining wieder volle Wurfgeschwindigkeit gehen darfst – das sollte parallel zu Phase 2/3 schrittweise passieren, nicht isoliert vom restlichen Training.",
};

function ex(id, name, sets, reps, technique, wgerQuery) {
  return { id, name, sets, reps, technique, wgerQuery, imageUrl: null };
}

export const DEFAULT_PLAN = {
  phases: [
    {
      id: "phase1",
      name: "Phase 1: Grundlage & Kontrolle",
      weeks: "Wochen 1–3",
      sessions: [
        {
          id: "a",
          name: "Einheit A",
          note: "",
          exercises: [
            ex(
              "p1-a-1",
              "Seitlage Außenrotation (Kurzhantel)",
              3,
              "15 pro Seite",
              "Lege dich auf die Seite, der obere Ellbogen bleibt 90° angewinkelt und fest am Körper. Hebe den Unterarm langsam nach oben, ohne die Schulter mitzuziehen oder auszuweichen. Kein Schwung – die Bewegung kommt allein aus der Außenrotation im Schultergelenk.",
              "side lying external rotation"
            ),
            ex(
              "p1-a-2",
              "Prone Y-T-W",
              3,
              "10 pro Buchstabe",
              "Bauchlage auf einer Bank, Oberkörper leicht angehoben. Führe die Arme nacheinander in Y-, T- und W-Position, dabei die Schulterblätter aktiv nach hinten/unten ziehen. Kein Hohlkreuz – die Bewegung kommt aus Schulter und oberem Rücken, nicht aus dem unteren Rücken.",
              "prone Y raise shoulder"
            ),
            ex(
              "p1-a-3",
              "Wandschieben mit Scapula-Kontrolle (Wall Slides)",
              3,
              "10",
              "Rücken und Arme haben Kontakt zur Wand, Ellbogen und Handrücken bleiben dran. Arme langsam nach oben gleiten lassen und die Schulterblätter bewusst mitführen. Der untere Rücken darf sich dabei nicht von der Wand lösen.",
              "wall slide shoulder"
            ),
            ex(
              "p1-a-4",
              "Band Pull-Aparts",
              3,
              "20",
              "Band schulterbreit greifen, Arme gestreckt vor dem Körper. Band bis auf Brusthöhe auseinanderziehen und am Ende die Schulterblätter bewusst zusammenziehen. Langsam ausführen, keine Schwungholung.",
              "band pull apart"
            ),
          ],
        },
        {
          id: "b",
          name: "Einheit B",
          note: "",
          exercises: [
            ex(
              "p1-b-1",
              "Face Pulls am Kabel",
              3,
              "15",
              "Seil auf Augenhöhe einstellen, mit beiden Händen greifen und zum Gesicht ziehen. Die Ellbogen bleiben hoch, die Hände enden neben den Ohren – am Ende die Außenrotation betonen.",
              "face pull cable"
            ),
            ex(
              "p1-b-2",
              "Serratus Punch (Kabel oder Band)",
              3,
              "15",
              "Arm gestreckt gegen Band oder Kabel nach vorne 'stanzen' und am Ende das Schulterblatt bewusst nach vorne/oben schieben. Die Bewegung kommt aus dem Schulterblatt, nicht aus dem Ellbogen.",
              "serratus punch"
            ),
            ex(
              "p1-b-3",
              "Vorgebeugtes Reverse Fly (leicht)",
              3,
              "15",
              "Leicht vorgebeugter Stand, Kurzhanteln seitlich bis auf Schulterhöhe anheben. Ellbogen leicht gebeugt, Bewegung kontrolliert ohne Schwung aus dem Rücken ausführen.",
              "reverse fly rear delt"
            ),
            ex(
              "p1-b-4",
              "Außenrotation stehend am Kabel (Ellbogen am Körper)",
              3,
              "15 pro Seite",
              "Ellbogen 90° angewinkelt und fest am Körper fixiert. Unterarm nach außen drehen, ohne dass sich der Ellbogen vom Körper löst oder die Schulter hochzieht.",
              "standing cable external rotation"
            ),
          ],
        },
        {
          id: "c",
          name: "Einheit C",
          note: "Leicht, näher am Spieltag – ausgewählte Übungen aus A/B mit reduziertem Gewicht, Fokus auf saubere Technik.",
          exercises: [
            ex(
              "p1-c-1",
              "Ausgewählte Übungen aus A/B (reduziertes Gewicht)",
              2,
              "12–15",
              "Wähle 2–3 Übungen aus Einheit A oder B, die sich diese Woche gut angefühlt haben. Gewicht deutlich reduzieren, Fokus liegt komplett auf sauberer Technik statt Belastung.",
              "shoulder rehab exercise"
            ),
            ex(
              "p1-c-2",
              "Mobility BWS & Schulterkapsel (optional)",
              1,
              "5–10 Min",
              "Sanfte Mobilisation der Brustwirbelsäule (z. B. Rotationen im Vierfüßlerstand) und der Schulterkapsel. Kein Dehnen bis in den Schmerz, ruhig und kontrolliert atmen.",
              "thoracic spine mobility"
            ),
          ],
        },
      ],
    },
    {
      id: "phase2",
      name: "Phase 2: Belastung steigern",
      weeks: "Wochen 4–7",
      sessions: [
        {
          id: "a",
          name: "Einheit A",
          note: "",
          exercises: [
            ex(
              "p2-a-1",
              "Außenrotation stehend am Kabel (progressiv schwerer)",
              4,
              "12",
              "Ellbogen 90° angewinkelt und fest am Körper fixiert. Unterarm nach außen drehen, Gewicht nur steigern, wenn die aktuelle Stufe über alle Sätze schmerzfrei bleibt.",
              "standing cable external rotation"
            ),
            ex(
              "p2-a-2",
              "Innenrotation am Kabel",
              3,
              "12",
              "Ellbogen 90° am Körper fixiert, Unterarm von außen nach innen zum Bauch ziehen. Kontrolliert ausführen, keine Rotation im Rumpf mitschwingen lassen.",
              "cable internal rotation shoulder"
            ),
            ex(
              "p2-a-3",
              "Latzug breit (kontrolliert)",
              3,
              "10",
              "Griff breiter als schulterbreit, Stange kontrolliert zur oberen Brust ziehen. Brust raus, Schulterblätter aktiv nach unten ziehen – nicht hinter den Nacken ziehen.",
              "lat pulldown wide grip"
            ),
            ex(
              "p2-a-4",
              "Landmine Press (schulterfreundlicher Winkel)",
              3,
              "10",
              "Hantelstange in der Landmine-Halterung diagonal vor dem Körper nach oben drücken. Der schräge Winkel entlastet die Schulter gegenüber einem klassischen Overhead Press.",
              "landmine press"
            ),
          ],
        },
        {
          id: "b",
          name: "Einheit B",
          note: "",
          exercises: [
            ex(
              "p2-b-1",
              "Rudern vorgebeugt (Langhantel oder Kabel)",
              3,
              "10",
              "Oberkörper vorgebeugt, Rücken gerade. Stange oder Griffe zum unteren Bauch ziehen, Ellbogen nah am Körper führen und am Ende die Schulterblätter zusammenziehen.",
              "bent over row"
            ),
            ex(
              "p2-b-2",
              "Face Pulls",
              3,
              "15",
              "Seil auf Augenhöhe einstellen, zum Gesicht ziehen. Ellbogen bleiben hoch, am Ende die Außenrotation betonen.",
              "face pull cable"
            ),
            ex(
              "p2-b-3",
              "Bottoms-up Kettlebell Carry oder Halten",
              3,
              "30 Sek pro Seite",
              "Kettlebell mit dem Kugelkopf nach oben greifen und halten oder gehen. Das erfordert aktive Stabilisation der Rotatorenmanschette – Handgelenk bleibt neutral, keine Verkrampfung.",
              "bottoms up kettlebell hold"
            ),
            ex(
              "p2-b-4",
              "Prone Y-T-W (etwas mehr Gewicht)",
              3,
              "10",
              "Wie in Phase 1, jetzt mit etwas mehr Gewicht. Schulterblätter aktiv nach hinten/unten ziehen, kein Hohlkreuz, Bewegung kontrolliert und sauber.",
              "prone Y raise shoulder"
            ),
          ],
        },
        {
          id: "c",
          name: "Einheit C",
          note: "Kombination leichterer Sätze aus A/B, Fokus auf Bewegungsqualität.",
          exercises: [
            ex(
              "p2-c-1",
              "Ausgewählte Übungen aus A/B (leichter)",
              2,
              "12–15",
              "Wähle 2–3 Übungen aus A oder B mit reduziertem Gewicht. Fokus liegt auf sauberer Bewegungsqualität statt Belastungssteigerung.",
              "shoulder rehab exercise"
            ),
            ex(
              "p2-c-2",
              "Klimmzüge unterstützt (optional, schmerzfreier Bereich)",
              3,
              "6–8",
              "Mit Band oder Maschine unterstützt, nur im aktuell schmerzfreien Bewegungsbereich trainieren. Sauberer Zug, Schulterblätter aktiv einsetzen, kein Einrollen der Schultern am oberen Punkt.",
              "assisted pull up"
            ),
          ],
        },
      ],
    },
    {
      id: "phase3",
      name: "Phase 3: Sportspezifisch",
      weeks: "ab Woche 8, nur wenn Phase 2 komplett schmerzfrei",
      sessions: [
        {
          id: "a",
          name: "Einheit A",
          note: "",
          exercises: [
            ex(
              "p3-a-1",
              "Exzentrische Außenrotation",
              3,
              "10",
              "Wie die stehende Außenrotation, aber der Rückweg (Innenrotation) wird über 3–4 Sekunden bewusst abgebremst. Fokus liegt komplett auf der langsamen, kontrollierten exzentrischen Phase.",
              "eccentric external rotation shoulder"
            ),
            ex(
              "p3-a-2",
              "Cable Diagonal Pattern D2 (wurfähnlich)",
              3,
              "12",
              "Diagonale Zugbewegung am Kabel von unten außen nach oben innen (oder umgekehrt), ähnlich der Wurfbewegung. Rotation kommt kontrolliert aus Rumpf und Schulter gemeinsam.",
              "cable diagonal D2 pattern shoulder"
            ),
            ex(
              "p3-a-3",
              "Latzug/Klimmzüge (schwerer)",
              4,
              "8",
              "Wie zuvor, jetzt mit mehr Gewicht bzw. weniger Unterstützung. Brust raus, Schulterblätter aktiv nach unten ziehen, saubere Technik geht vor mehr Gewicht.",
              "lat pulldown wide grip"
            ),
            ex(
              "p3-a-4",
              "Overhead Press (wenn komplett schmerzfrei)",
              3,
              "8",
              "Nur ausführen, wenn die Schulter komplett schmerzfrei ist. Hantel/Kurzhanteln kontrolliert über Kopf drücken, Rumpf stabil halten, kein Ausweichen ins Hohlkreuz.",
              "overhead press dumbbell"
            ),
          ],
        },
        {
          id: "b",
          name: "Einheit B",
          note: "",
          exercises: [
            ex(
              "p3-b-1",
              "Medizinball-Würfe (Rotationswurf gegen Wand)",
              3,
              "8 pro Seite",
              "Seitlich zur Wand stehen, Ball mit Rumpfrotation kraftvoll gegen die Wand werfen und aus der Rotation wieder auffangen. Intensität und Tempo nur langsam steigern.",
              "medicine ball rotational throw"
            ),
            ex(
              "p3-b-2",
              "Rudern (schwerer)",
              4,
              "8",
              "Wie vorgebeugtes Rudern, jetzt mit mehr Gewicht. Rücken bleibt gerade, Ellbogen nah am Körper, Schulterblätter am Ende aktiv zusammenziehen.",
              "bent over row"
            ),
            ex(
              "p3-b-3",
              "Außenrotation am Kabel (schwerer)",
              3,
              "10",
              "Wie zuvor, jetzt mit mehr Gewicht – nur steigern, wenn die aktuelle Stufe komplett schmerzfrei ist. Ellbogen bleibt fest am Körper.",
              "standing cable external rotation"
            ),
            ex(
              "p3-b-4",
              "Face Pulls",
              3,
              "15",
              "Seil auf Augenhöhe einstellen, zum Gesicht ziehen. Ellbogen bleiben hoch, am Ende die Außenrotation betonen.",
              "face pull cable"
            ),
          ],
        },
        {
          id: "c",
          name: "Einheit C",
          note:
            "Leichtere Wiederholung, Fokus auf Wurfbewegung mit Medizinball bei geringer Intensität. Wurfgeschwindigkeit im Handballtraining selbst schrittweise steigern, nicht sprunghaft.",
          exercises: [
            ex(
              "p3-c-1",
              "Medizinball-Wurfbewegung (geringe Intensität)",
              2,
              "8 pro Seite",
              "Gleiche Bewegung wie die Rotationswürfe, aber mit deutlich geringerem Tempo und Krafteinsatz. Ziel ist sauberes Bewegungsmuster, nicht maximale Power.",
              "medicine ball rotational throw"
            ),
          ],
        },
      ],
    },
  ],
};
