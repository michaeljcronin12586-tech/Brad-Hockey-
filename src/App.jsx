import React, { useState, useEffect, useCallback } from "react";

// ---------------------------------------------------------------
// PROGRAM DATA
// Loaded lifts carry load:true + increment (lb) so the app can
// recommend weights once a baseline is logged.
// ---------------------------------------------------------------

const PROGRAM = [
  {
    id: "d1",
    num: "01",
    label: "Acceleration & Power",
    tag: "QUICKNESS",
    accent: "#E4572E",
    blocks: [
      {
        title: "Warm-up",
        items: [
          { id: "d1-w1", name: "High knees", detail: "2 x 20m" },
          { id: "d1-w2", name: "A-skips", detail: "2 x 20m" },
          { id: "d1-w3", name: "Band lateral walks", detail: "2 x 10 each way" },
        ],
      },
      {
        title: "Reactive / Plyo",
        note: "Do this first, while he's fresh — quality over quantity.",
        items: [
          { id: "d1-p1", name: "Pogo hops", detail: "2 x 10" },
          { id: "d1-p2", name: "Broad jump, stick the landing", detail: "3 x 4", sub: "hold 2 sec" },
          { id: "d1-p3", name: "Lateral bound, stick the landing", detail: "3 x 4 each side" },
        ],
      },
      {
        title: "Strength",
        deload: true,
        items: [
          { id: "d1-s1", name: "Rack / belt squat", detail: "3 x 6", sub: "fast out of the bottom", load: true, increment: 5 },
          { id: "d1-s2", name: "DB single-leg RDL", detail: "3 x 6 each leg", load: true, increment: 5 },
          { id: "d1-s3", name: "Band or cable split squat", detail: "2 x 8 each leg", load: true, increment: 2.5 },
        ],
      },
      {
        title: "Power Transfer",
        items: [
          { id: "d1-pt1", name: "Slam ball", detail: "3 x 6" },
          { id: "d1-pt2", name: "Med ball rotational throw vs wall", detail: "3 x 6 each side" },
        ],
      },
      {
        title: "Core",
        items: [{ id: "d1-c1", name: "Cable / band Pallof press", detail: "2 x 10 each side" }],
      },
    ],
  },
  {
    id: "d2",
    num: "02",
    label: "Strength & Skating Power",
    tag: "GENERAL HOCKEY",
    accent: "#4C9F70",
    blocks: [
      {
        title: "Warm-up",
        items: [
          { id: "d2-w1", name: "Band pull-aparts", detail: "2 x 15" },
          { id: "d2-w2", name: "Hip circles", detail: "2 x 10 each way" },
          { id: "d2-w3", name: "Bodyweight squats", detail: "2 x 10" },
        ],
      },
      {
        title: "Strength",
        deload: true,
        items: [
          { id: "d2-s1", name: "Rack or belt squat", detail: "3 x 6", load: true, increment: 5 },
          { id: "d2-s2", name: "DB bench press or push-ups", detail: "3 x 8", load: true, increment: 5 },
          { id: "d2-s3", name: "Cable row", detail: "3 x 10", load: true, increment: 5 },
          { id: "d2-s4", name: "Copenhagen plank", detail: "2 x 20-30s each side", sub: "regress to side plank if needed — groin health matters for skaters" },
        ],
      },
      {
        title: "Power",
        deload: true,
        items: [
          { id: "d2-p1", name: "Med ball rotational scoop throw", detail: "3 x 6 each side" },
          { id: "d2-p2", name: "Farmer carry, dumbbells", detail: "2 x 30m", load: true, increment: 5 },
        ],
      },
      {
        title: "Core",
        items: [
          { id: "d2-c1", name: "Slam ball sit-up throw", detail: "2 x 8" },
          { id: "d2-c2", name: "Band anti-rotation hold", detail: "2 x 8 each side" },
        ],
      },
    ],
  },
  {
    id: "d3",
    num: "03",
    label: "Reactive Quickness & First Step",
    tag: "QUICKNESS",
    accent: "#E4572E",
    blocks: [
      {
        title: "Warm-up",
        items: [
          { id: "d3-w1", name: "High knees", detail: "2 x 20m" },
          { id: "d3-w2", name: "A-skips", detail: "2 x 20m" },
          { id: "d3-w3", name: "Leg swings", detail: "2 x 10 each leg" },
          { id: "d3-w4", name: "Band lateral walks", detail: "2 x 10 each way" },
        ],
      },
      {
        title: "Reactive Starts",
        note: "This is the actual quickness work — react, don't anticipate.",
        items: [
          { id: "d3-r1", name: "Sprint starts on clap / whistle", detail: "6 x 10yd" },
          { id: "d3-r2", name: "Partner mirror drill", detail: "4 x 15s" },
          { id: "d3-r3", name: "Band-resisted starts", detail: "4 x 5yd", sub: "light band around waist" },
        ],
      },
      {
        title: "Strength",
        deload: true,
        items: [
          { id: "d3-s1", name: "Belt squat, single-leg or split", detail: "3 x 6 each leg", load: true, increment: 5 },
          { id: "d3-s2", name: "DB step-ups", detail: "3 x 6 each leg", load: true, increment: 5 },
          { id: "d3-s3", name: "Cable row", detail: "2 x 10", load: true, increment: 5 },
        ],
      },
      {
        title: "Power",
        items: [
          { id: "d3-p1", name: "Med ball chest pass for distance", detail: "3 x 6" },
          { id: "d3-p2", name: "Slam ball", detail: "2 x 8" },
        ],
      },
      {
        title: "Core",
        items: [{ id: "d3-c1", name: "Dead bug or band anti-rotation hold", detail: "2 x 8" }],
      },
    ],
  },
  {
    id: "d4",
    num: "04",
    label: "Conditioning & Core",
    tag: "GENERAL HOCKEY",
    accent: "#4C9F70",
    blocks: [
      {
        title: "Warm-up",
        items: [
          { id: "d4-w1", name: "Dynamic stretch flow", detail: "5 min" },
          { id: "d4-w2", name: "Band walks", detail: "2 x 10 each way" },
          { id: "d4-w3", name: "Ankle mobility rocks", detail: "2 x 10 each side" },
        ],
      },
      {
        title: "Shift Intervals",
        note: "A real shift is ~30-45s max effort. This trains the energy system he plays in.",
        items: [
          { id: "d4-i1", name: "Slam ball, max effort", detail: "6 x 20s on / 40s off" },
          { id: "d4-i2", name: "Bike or shuttle sprints", detail: "6-8 x 20-30s on/off" },
        ],
      },
      {
        title: "Core Circuit — 3 rounds",
        items: [
          { id: "d4-c1", name: "Cable / band Pallof press", detail: "8-10 each side" },
          { id: "d4-c2", name: "Dead bug", detail: "8 each side" },
          { id: "d4-c3", name: "Slam ball sit-up throw", detail: "8 reps" },
        ],
      },
      {
        title: "Mobility",
        items: [
          { id: "d4-m1", name: "90/90 hip switches", detail: "2 x 8 each side" },
          { id: "d4-m2", name: "Couch stretch", detail: "2 x 30s each side" },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------
// SKILLS DATA — hockey drills, on-ice and off-ice.
// Drawn from USA Hockey's ADM stickhandling/skating material and
// widely used skill-coach drills (e.g. Pavel Barber off-ice work).
// ---------------------------------------------------------------

const SKILLS = {
  ice: {
    label: "On-Ice",
    sub: "Rink sessions · skating + puck skills",
    banner:
      "USA Hockey's ADM calls this the golden age of skill development. Every rep should demand a real edge or a puck touch — no coasting laps. Heads up, hands out front, keep the feet moving.",
    categories: [
      {
        title: "Skating & Edges",
        accent: "#5FA8D3",
        drills: [
          { id: "ice-sk1", name: "Inside / outside edge C-cuts", detail: "2 x lap each edge", sub: "one foot at a time — feel both edges bite" },
          { id: "ice-sk2", name: "Two-foot edge pulls (slaloms)", detail: "3 x width of rink", sub: "deep knee bend, control the glide" },
          { id: "ice-sk3", name: "Forward crossovers, both circles", detail: "3 min each direction", sub: "full cross-under, push all the way through" },
          { id: "ice-sk4", name: "Backward crossovers", detail: "3 min each direction" },
          { id: "ice-sk5", name: "Tight turns around the dots", detail: "8 each direction", sub: "shoulders and stick lead the turn" },
          { id: "ice-sk6", name: "Mohawk transitions (fwd ↔ bwd)", detail: "8 each side", sub: "second speed-window skill for his age" },
          { id: "ice-sk7", name: "Power starts — first 3 steps", detail: "6 x blue line to blue line", sub: "ties straight into his off-ice acceleration work" },
          { id: "ice-sk8", name: "Hockey stops, both directions", detail: "10 each side", sub: "even snow spray off both skates" },
        ],
      },
      {
        title: "Stickhandling",
        accent: "#C9952C",
        drills: [
          { id: "ice-sh1", name: "Stationary handles — wide & narrow", detail: "2 min", sub: "eyes up, roll the wrists to cup the puck" },
          { id: "ice-sh2", name: "Figure-8s around pucks", detail: "3 x 30s", sub: "ADM staple — tighten the gap as he improves" },
          { id: "ice-sh3", name: "Toe-drag pull & push", detail: "3 x 20 reps", sub: "soft hands, pull the puck back into the body" },
          { id: "ice-sh4", name: "Puck-handling through cones, heads up", detail: "6 lengths", sub: "look at the far net, not the puck" },
          { id: "ice-sh5", name: "Stickhandle while skating circles", detail: "3 min", sub: "handle and edge at the same time" },
          { id: "ice-sh6", name: "Puck protection — one hand + body", detail: "6 x 20s", sub: "body between an imaginary defender and the puck" },
        ],
      },
    ],
  },
  offIce: {
    label: "Off-Ice",
    sub: "Driveway / garage · daily hands",
    banner:
      "15-20 focused minutes a day moves the needle fast at this age. Use a Green Biscuit or Swedish ball on a smooth surface, stay in a low skating stance, and keep the eyes up. Quality touches over speed-for-show.",
    categories: [
      {
        title: "Stickhandling",
        accent: "#C9952C",
        drills: [
          { id: "off-sh1", name: "Stationary quick-hands (ball)", detail: "3 x 45s", sub: "fast side-to-side touches, soft grip" },
          { id: "off-sh2", name: "Wide dribble", detail: "3 x 30s", sub: "reach the ball out past shoulder width" },
          { id: "off-sh3", name: "Figure-8 around two objects", detail: "3 x 30s", sub: "shrink the gap as hands get quicker" },
          { id: "off-sh4", name: "Toe-drag deception", detail: "3 x 15 each side", sub: "USA Hockey ADM drill — sell the fake" },
          { id: "off-sh5", name: "Around-the-body handles", detail: "3 x 30s", sub: "front, side, behind — feet stay moving" },
          { id: "off-sh6", name: "Random obstacle course, timed", detail: "3 rounds", sub: "beat his own time — reaction + creativity" },
          { id: "off-sh7", name: "Balance-board handles (if available)", detail: "3 x 45s", sub: "builds edge stability + core while he handles" },
        ],
      },
      {
        title: "Skating & Agility (dryland)",
        accent: "#5FA8D3",
        drills: [
          { id: "off-ag1", name: "Slide-board or lateral bounds", detail: "4 x 30s", sub: "mimics the skating push and edge load" },
          { id: "off-ag2", name: "Agility ladder — quick feet", detail: "4 patterns", sub: "in-in-out-out, lateral, single-leg" },
          { id: "off-ag3", name: "Crossover step-throughs", detail: "3 x 8 each way", sub: "rehearse the crossover pattern on land" },
          { id: "off-ag4", name: "Soccer-ball toe taps + handles", detail: "3 x 30s", sub: "tap the ball while stickhandling, head up" },
          { id: "off-ag5", name: "Single-leg balance holds", detail: "3 x 30s each leg", sub: "on a cushion or board — edge stability" },
        ],
      },
    ],
  },
};

const K_PROGRESS = "hockey-tracker:progress";
const K_WEIGHTS = "hockey-tracker:weights";
const K_PHASE = "hockey-tracker:phase";
const K_SECTION = "hockey-tracker:section";
const K_ICESIDE = "hockey-tracker:iceside";

const PHASES = {
  off: {
    label: "Off-season",
    sub: "Build · 4 days/week · progress the weights",
    banner:
      "2-month build block. Legs are fresh, so this is where he adds strength and grooves the first-step mechanics. Push the weights when reps look clean.",
  },
  in: {
    label: "In-season",
    sub: "Maintain · 2-3 days/week · the ice is the main event",
    banner:
      "6-month season. Practices and games carry the load now. Drop each strength block by a set, hold the weights steady, and keep the quickness work — the goal is fresh legs on game day, not a new PR.",
  },
};

// ---------------------------------------------------------------
// STORAGE — browser localStorage
// ---------------------------------------------------------------

function loadKey(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function saveKey(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode / quota) — app still runs this session */
  }
}

// ---------------------------------------------------------------
// WEIGHT RECOMMENDATION ENGINE
// ---------------------------------------------------------------

function recommend(item, hist, phase) {
  const inc = item.increment || 5;
  if (!hist || hist.length === 0) {
    return {
      baseline: true,
      message: "Log a weight he can move with clean form on every rep. That's his baseline.",
    };
  }
  const last = hist[hist.length - 1];
  const prev = hist[hist.length - 2];

  if (phase === "in") {
    if (last.quality === "hard") {
      return {
        recWeight: Math.max(inc, last.weight - inc),
        message: "In-season: ease off a touch to manage fatigue. Fresh legs for the ice come first.",
      };
    }
    return {
      recWeight: last.weight,
      message: "In-season: hold steady. Maintain strength and let games drive the training.",
    };
  }

  // off-season
  if (last.quality === "easy") {
    return { recWeight: last.weight + inc, message: `Last set moved fast — go up ${inc} lb.` };
  }
  if (last.quality === "solid") {
    const twoClean = prev && prev.quality === "solid" && prev.weight === last.weight;
    if (twoClean) {
      return { recWeight: last.weight + inc, message: `Two clean sessions here — add ${inc} lb.` };
    }
    return { recWeight: last.weight, message: "Repeat this weight and lock in the form before adding." };
  }
  return { recWeight: last.weight, message: "Hold here until it feels solid — no rush to add load." };
}

// ---------------------------------------------------------------
// SIGNATURE CHECKBOX
// ---------------------------------------------------------------

function GoalLamp({ checked, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={checked}
      aria-label={checked ? "Mark incomplete" : "Mark complete"}
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        border: `2px solid ${checked ? accent : "rgba(255,255,255,0.25)"}`,
        background: checked
          ? `radial-gradient(circle at 35% 30%, ${accent}, ${accent}CC 55%, ${accent}66 100%)`
          : "rgba(255,255,255,0.04)",
        boxShadow: checked ? `0 0 12px 2px ${accent}99, 0 0 2px ${accent}` : "none",
        flexShrink: 0,
        cursor: "pointer",
        transition: "all 160ms ease",
        padding: 0,
      }}
    />
  );
}

// ---------------------------------------------------------------
// QUALITY BUTTON
// ---------------------------------------------------------------

function QualityBtn({ label, tone, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "8px 4px",
        borderRadius: 8,
        border: `1px solid ${tone}66`,
        background: `${tone}1A`,
        color: tone,
        fontSize: 12.5,
        fontWeight: 700,
        letterSpacing: "0.03em",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------
// APP
// ---------------------------------------------------------------

export default function App() {
  const [progress, setProgress] = useState(() => loadKey(K_PROGRESS, {}));
  const [weights, setWeights] = useState(() => loadKey(K_WEIGHTS, {}));
  const [phase, setPhase] = useState(() => loadKey(K_PHASE, "off"));
  const [section, setSection] = useState(() => loadKey(K_SECTION, "training"));
  const [iceSide, setIceSide] = useState(() => loadKey(K_ICESIDE, "ice"));
  const [activeIdx, setActiveIdx] = useState(0);
  const [openLog, setOpenLog] = useState(null);
  const [drafts, setDrafts] = useState({});

  useEffect(() => saveKey(K_PROGRESS, progress), [progress]);
  useEffect(() => saveKey(K_WEIGHTS, weights), [weights]);
  useEffect(() => saveKey(K_PHASE, phase), [phase]);
  useEffect(() => saveKey(K_SECTION, section), [section]);
  useEffect(() => saveKey(K_ICESIDE, iceSide), [iceSide]);

  const toggle = useCallback((id) => {
    setProgress((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const logWeight = useCallback(
    (item, quality) => {
      const val = parseFloat(drafts[item.id]);
      if (!val || val <= 0) return;
      setWeights((prev) => {
        const hist = prev[item.id] ? [...prev[item.id]] : [];
        hist.push({ date: new Date().toISOString().slice(0, 10), weight: val, quality });
        return { ...prev, [item.id]: hist };
      });
      setOpenLog(null);
    },
    [drafts]
  );

  const resetDay = useCallback((day) => {
    setProgress((prev) => {
      const next = { ...prev };
      day.blocks.forEach((b) => b.items.forEach((i) => delete next[i.id]));
      return next;
    });
  }, []);

  const resetIds = useCallback((ids) => {
    setProgress((prev) => {
      const next = { ...prev };
      ids.forEach((id) => delete next[id]);
      return next;
    });
  }, []);

  const isTraining = section === "training";
  const day = PROGRAM[activeIdx];
  const activeSkill = SKILLS[iceSide];
  const viewIds = isTraining
    ? day.blocks.flatMap((b) => b.items.map((i) => i.id))
    : activeSkill.categories.flatMap((c) => c.drills.map((d) => d.id));
  const doneCount = viewIds.filter((id) => progress[id]).length;
  const pct = viewIds.length ? Math.round((doneCount / viewIds.length) * 100) : 0;
  const phaseInfo = PHASES[phase];
  const headerAccent = isTraining ? day.accent : activeSkill.categories[0].accent;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 50% -10%, #16324A 0%, #0A1826 55%, #060F1A 100%)",
        color: "#EAF3F7",
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        paddingBottom: 48,
      }}
    >
      {/* Header — safe-area aware so it clears notches / status bars */}
      <header
        style={{
          padding: "calc(env(safe-area-inset-top, 0px) + 40px) 20px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.28em",
            color: "#7FA1B5",
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          FIRST STEP PROGRAM
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 30,
            fontWeight: 800,
            fontStretch: "condensed",
            letterSpacing: "-0.01em",
            lineHeight: 1.05,
            textTransform: "uppercase",
          }}
        >
          Acceleration &amp; Hockey Performance
        </h1>

        {/* Section switcher — Training vs Skills */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginTop: 16,
            background: "rgba(255,255,255,0.05)",
            borderRadius: 10,
            padding: 4,
            width: "fit-content",
          }}
        >
          {[
            ["training", "Training"],
            ["skills", "Skills"],
          ].map(([key, lbl]) => {
            const on = section === key;
            return (
              <button
                key={key}
                onClick={() => setSection(key)}
                style={{
                  border: "none",
                  borderRadius: 7,
                  padding: "7px 18px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  background: on ? "#EAF3F7" : "transparent",
                  color: on ? "#0A1826" : "#7FA1B5",
                  transition: "all 140ms ease",
                }}
              >
                {lbl}
              </button>
            );
          })}
        </div>

        {/* Sub-toggle: phase (training) or ice side (skills) */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginTop: 10,
            background: "rgba(255,255,255,0.035)",
            borderRadius: 9,
            padding: 3,
            width: "fit-content",
          }}
        >
          {isTraining
            ? Object.entries(PHASES).map(([key, p]) => {
                const on = phase === key;
                return (
                  <button
                    key={key}
                    onClick={() => setPhase(key)}
                    style={{
                      border: "none",
                      borderRadius: 6,
                      padding: "6px 14px",
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: on ? headerAccent : "transparent",
                      color: on ? "#0A1826" : "#7FA1B5",
                      transition: "all 140ms ease",
                    }}
                  >
                    {p.label}
                  </button>
                );
              })
            : Object.entries(SKILLS).map(([key, s]) => {
                const on = iceSide === key;
                return (
                  <button
                    key={key}
                    onClick={() => setIceSide(key)}
                    style={{
                      border: "none",
                      borderRadius: 6,
                      padding: "6px 14px",
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: on ? s.categories[0].accent : "transparent",
                      color: on ? "#0A1826" : "#7FA1B5",
                      transition: "all 140ms ease",
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
        </div>

        <div style={{ fontSize: 12.5, color: "#7FA1B5", marginTop: 8 }}>
          {isTraining ? phaseInfo.sub : activeSkill.sub}
        </div>
      </header>

      {/* Banner */}
      <div
        style={{
          margin: "16px 20px 0",
          padding: "12px 14px",
          borderRadius: 10,
          background: "rgba(255,255,255,0.04)",
          borderLeft: `3px solid ${headerAccent}`,
          fontSize: 12.5,
          lineHeight: 1.45,
          color: "#B7CEDB",
        }}
      >
        {isTraining ? phaseInfo.banner : activeSkill.banner}
      </div>

      {/* Day selector — training only */}
      {isTraining && (
      <nav style={{ display: "flex", overflowX: "auto", gap: 2, padding: "14px 16px 0" }}>
        {PROGRAM.map((d, idx) => {
          const isActive = idx === activeIdx;
          const ids = d.blocks.flatMap((b) => b.items.map((i) => i.id));
          const done = ids.filter((id) => progress[id]).length;
          const complete = ids.length > 0 && done === ids.length;
          return (
            <button
              key={d.id}
              onClick={() => setActiveIdx(idx)}
              style={{
                flex: "0 0 auto",
                background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
                border: "none",
                borderBottom: isActive ? `3px solid ${d.accent}` : "3px solid transparent",
                color: isActive ? "#EAF3F7" : "#7FA1B5",
                padding: "10px 14px 12px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                minWidth: 120,
                borderRadius: "8px 8px 0 0",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  color: d.accent,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {d.num}
                {complete && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: d.accent,
                      boxShadow: `0 0 6px 1px ${d.accent}`,
                    }}
                  />
                )}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, marginTop: 3, textAlign: "left" }}>{d.label}</span>
              <span style={{ fontSize: 10, color: "#5C7E92", marginTop: 2, letterSpacing: "0.06em" }}>{d.tag}</span>
            </button>
          );
        })}
      </nav>
      )}

      {/* Progress */}
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: "#7FA1B5" }}>
            {isTraining ? "Today's session" : `${activeSkill.label} drills`}
          </span>
          <span
            style={{
              fontFamily: "'Courier New', monospace",
              fontVariantNumeric: "tabular-nums",
              fontSize: 20,
              fontWeight: 700,
              color: headerAccent,
            }}
          >
            {doneCount}/{viewIds.length}
          </span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: headerAccent,
              boxShadow: `0 0 8px ${headerAccent}`,
              transition: "width 200ms ease",
            }}
          />
        </div>
      </div>

      {/* ============ TRAINING BODY ============ */}
      {isTraining && (
      <main style={{ padding: "22px 20px 0" }}>
        {day.blocks.map((block) => (
          <section key={block.title} style={{ marginBottom: 26 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2
                style={{
                  fontSize: 13,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#9FBBCC",
                  fontWeight: 800,
                  margin: "0 0 4px",
                }}
              >
                {block.title}
              </h2>
              {block.deload && phase === "in" && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    color: "#F2C14E",
                    border: "1px solid #F2C14E55",
                    borderRadius: 6,
                    padding: "2px 6px",
                  }}
                >
                  −1 SET IN-SEASON
                </span>
              )}
            </div>
            {block.note && (
              <p style={{ fontSize: 12.5, color: "#5C7E92", margin: "0 0 10px", lineHeight: 1.4 }}>{block.note}</p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: block.note ? 0 : 10 }}>
              {block.items.map((item) => {
                const checked = !!progress[item.id];
                const hist = weights[item.id];
                const last = hist && hist.length ? hist[hist.length - 1] : null;
                const rec = item.load ? recommend(item, hist, phase) : null;
                const isOpen = openLog === item.id;
                return (
                  <div
                    key={item.id}
                    style={{
                      background: "rgba(255,255,255,0.035)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 10,
                      padding: "10px 12px",
                      opacity: checked ? 0.65 : 1,
                      transition: "opacity 160ms ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <GoalLamp checked={checked} accent={day.accent} onClick={() => toggle(item.id)} />
                      <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => toggle(item.id)}>
                        <div
                          style={{
                            fontSize: 14.5,
                            fontWeight: 600,
                            textDecoration: checked ? "line-through" : "none",
                          }}
                        >
                          {item.name}
                        </div>
                        {item.sub && <div style={{ fontSize: 11.5, color: "#5C7E92", marginTop: 2 }}>{item.sub}</div>}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Courier New', monospace",
                          fontVariantNumeric: "tabular-nums",
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#9FBBCC",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          cursor: "pointer",
                        }}
                        onClick={() => toggle(item.id)}
                      >
                        {item.detail}
                      </div>
                    </div>

                    {/* Loaded lift: recommendation + log control */}
                    {item.load && (
                      <div style={{ marginTop: 10, paddingLeft: 42 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                          <div style={{ minWidth: 0 }}>
                            {rec.baseline ? (
                              <span style={{ fontSize: 12, color: "#7FA1B5" }}>No baseline yet</span>
                            ) : (
                              <span style={{ fontSize: 12.5, color: "#EAF3F7" }}>
                                Recommended{" "}
                                <b style={{ color: day.accent, fontFamily: "'Courier New', monospace" }}>{rec.recWeight} lb</b>
                              </span>
                            )}
                            {last && (
                              <span style={{ fontSize: 11, color: "#5C7E92", display: "block", marginTop: 2 }}>
                                Last: {last.weight} lb · {last.quality}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setOpenLog(isOpen ? null : item.id);
                              setDrafts((d) => ({
                                ...d,
                                [item.id]: d[item.id] ?? (rec.recWeight ? String(rec.recWeight) : ""),
                              }));
                            }}
                            style={{
                              flexShrink: 0,
                              border: `1px solid ${day.accent}88`,
                              background: isOpen ? day.accent : "transparent",
                              color: isOpen ? "#0A1826" : day.accent,
                              borderRadius: 8,
                              padding: "6px 12px",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {isOpen ? "Close" : "Log"}
                          </button>
                        </div>

                        {rec.message && !isOpen && (
                          <div style={{ fontSize: 11.5, color: "#7FA1B5", marginTop: 6, lineHeight: 1.4 }}>{rec.message}</div>
                        )}

                        {isOpen && (
                          <div style={{ marginTop: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                              <input
                                type="number"
                                inputMode="decimal"
                                value={drafts[item.id] ?? ""}
                                onChange={(e) => setDrafts((d) => ({ ...d, [item.id]: e.target.value }))}
                                placeholder="lb"
                                style={{
                                  width: 90,
                                  padding: "8px 10px",
                                  borderRadius: 8,
                                  border: "1px solid rgba(255,255,255,0.2)",
                                  background: "rgba(0,0,0,0.25)",
                                  color: "#EAF3F7",
                                  fontSize: 15,
                                  fontFamily: "'Courier New', monospace",
                                }}
                              />
                              <span style={{ fontSize: 12, color: "#7FA1B5" }}>How did the set feel?</span>
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                              <QualityBtn label="Easy" tone="#4C9F70" onClick={() => logWeight(item, "easy")} />
                              <QualityBtn label="Solid" tone="#5FA8D3" onClick={() => logWeight(item, "solid")} />
                              <QualityBtn label="Hard" tone="#E4572E" onClick={() => logWeight(item, "hard")} />
                            </div>
                            <div style={{ fontSize: 11, color: "#5C7E92", marginTop: 8, lineHeight: 1.4 }}>
                              Log the weight, then tap how it felt. "Easy" means every rep looked fast and clean — only then does
                              the app add load.
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <button
          onClick={() => resetDay(day)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: 4,
            marginBottom: 20,
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 10,
            color: "#7FA1B5",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Reset today's checkmarks
        </button>
      </main>
      )}

      {/* ============ SKILLS BODY ============ */}
      {!isTraining && (
      <main style={{ padding: "22px 20px 0" }}>
        {activeSkill.categories.map((cat) => (
          <section key={cat.title} style={{ marginBottom: 26 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 10px" }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: cat.accent,
                  boxShadow: `0 0 6px 1px ${cat.accent}`,
                }}
              />
              <h2
                style={{
                  fontSize: 13,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#9FBBCC",
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                {cat.title}
              </h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cat.drills.map((drill) => {
                const checked = !!progress[drill.id];
                return (
                  <div
                    key={drill.id}
                    onClick={() => toggle(drill.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      background: "rgba(255,255,255,0.035)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 10,
                      padding: "10px 12px",
                      cursor: "pointer",
                      opacity: checked ? 0.65 : 1,
                      transition: "opacity 160ms ease",
                    }}
                  >
                    <GoalLamp checked={checked} accent={cat.accent} onClick={() => toggle(drill.id)} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14.5,
                          fontWeight: 600,
                          textDecoration: checked ? "line-through" : "none",
                        }}
                      >
                        {drill.name}
                      </div>
                      {drill.sub && <div style={{ fontSize: 11.5, color: "#5C7E92", marginTop: 2 }}>{drill.sub}</div>}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Courier New', monospace",
                        fontVariantNumeric: "tabular-nums",
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: "#9FBBCC",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        textAlign: "right",
                      }}
                    >
                      {drill.detail}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <button
          onClick={() => resetIds(viewIds)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: 4,
            marginBottom: 20,
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 10,
            color: "#7FA1B5",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Reset {activeSkill.label} checkmarks
        </button>
      </main>
      )}

      <footer style={{ padding: "10px 20px 0", fontSize: 11.5, color: "#4A6578", lineHeight: 1.5 }}>
        {isTraining
          ? "Progression is always technique-first. At 12, most gains come from a sharper nervous system and clean movement — small jumps in load, and only when the last session looked easy."
          : "Drills adapted from USA Hockey's ADM skill material and common skill-coach progressions. Heads up, hands out front — 15-20 focused minutes a day beats an hour of going through the motions."}
      </footer>
    </div>
  );
}
