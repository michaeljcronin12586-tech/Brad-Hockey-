import React, { useState, useEffect, useCallback, useMemo } from "react";

// =================================================================
// PROGRAM MODEL
// 32-week calendar = 8 blocks of 4 weeks.
//   Weeks 1-8  (blocks 1-2)  -> Off-Season
//   Weeks 9-32 (blocks 3-8)  -> In-Season
// Four modes share ONE global week timeline. Exercises change every
// block. Each item declares which log fields it accepts.
//   log fields: "weight" | "reps" | "time" | "notes"
// =================================================================

// item helper: ex(id, name, target, log[], sub?)
const ex = (id, name, target, log, sub) => ({ id, name, target, log, sub });

const L_STR = ["weight", "reps", "notes"]; // strength
const L_REP = ["reps", "notes"];           // bodyweight / plyo
const L_TIME = ["time", "notes"];          // sprints / holds / drills
const L_TR = ["time", "reps", "notes"];    // drills w/ count + time

// -----------------------------------------------------------------
// OFF-SEASON S&C  (blocks 1-2, weeks 1-8)
// -----------------------------------------------------------------
const OFFSEASON = {
  key: "offseason",
  label: "Off-Season",
  accent: "#E4572E",
  range: [1, 8],
  blocks: {
    1: {
      name: "Block 1 · Foundation",
      focus: "Build movement quality and a base of strength. Every rep clean and controlled — no grinding. 3 sessions this week.",
      groups: [
        {
          title: "Prep / Plyo",
          items: [
            ex("os1-pogo", "Pogo hops", "2 x 10", L_REP, "quick ground contact, tall posture"),
            ex("os1-broad", "Broad jump, stick landing", "3 x 4", L_REP, "hold the landing 2 sec"),
          ],
        },
        {
          title: "Strength",
          items: [
            ex("os1-sq", "Rack / belt squat", "3 x 6", L_STR, "fast out of the bottom"),
            ex("os1-rdl", "DB single-leg RDL", "3 x 6 / leg", L_STR),
            ex("os1-bench", "DB bench press", "3 x 8", L_STR),
            ex("os1-row", "Cable row", "3 x 10", L_STR),
            ex("os1-pallof", "Pallof press", "2 x 10 / side", L_REP),
          ],
        },
        {
          title: "Power",
          items: [
            ex("os1-rot", "Med ball rotational throw", "3 x 6 / side", L_REP),
            ex("os1-slam", "Slam ball", "3 x 6", L_REP),
          ],
        },
      ],
    },
    2: {
      name: "Block 2 · Power",
      focus: "Same base, more explosive. Loads climb a little; jumps get more reactive. Move fast, rest fully between sets.",
      groups: [
        {
          title: "Prep / Plyo",
          items: [
            ex("os2-depth", "Depth drop to broad jump", "3 x 4", L_REP, "land soft, then explode out"),
            ex("os2-lat", "Lateral bound, stick landing", "3 x 4 / side", L_REP),
          ],
        },
        {
          title: "Strength",
          items: [
            ex("os2-sq", "Rack / belt squat", "4 x 5", L_STR, "heavier than Block 1, still fast"),
            ex("os2-step", "DB step-up", "3 x 6 / leg", L_STR),
            ex("os2-incl", "DB incline press", "3 x 6", L_STR),
            ex("os2-chin", "Chin-ups (or assisted)", "3 x AMRAP", L_REP, "as many clean reps as possible"),
            ex("os2-cope", "Copenhagen plank", "2 x 30s / side", L_TIME, "groin health for skating"),
          ],
        },
        {
          title: "Power",
          items: [
            ex("os2-scoop", "Med ball scoop throw", "3 x 5", L_REP),
            ex("os2-bdist", "Broad jump for distance", "4 x 3", L_TR, "log best distance in notes"),
          ],
        },
      ],
    },
  },
};

// -----------------------------------------------------------------
// IN-SEASON S&C  (blocks 3-8, weeks 9-32)
// Maintain strength, stay fresh for the ice. Lower volume, rotate
// emphasis every block so it changes every 4 weeks.
// -----------------------------------------------------------------
const INSEASON = {
  key: "inseason",
  label: "In-Season",
  accent: "#4C9F70",
  range: [9, 32],
  blocks: {
    3: {
      name: "Block 3 · Re-entry",
      focus: "First month back on ice. Dial volume back so legs stay fresh — 2 short sessions/week. Movement quality over load.",
      groups: [
        {
          title: "Strength (2x/week)",
          items: [
            ex("is3-sq", "Belt / goblet squat", "2 x 6", L_STR, "moderate, smooth"),
            ex("is3-rdl", "DB RDL", "2 x 8", L_STR),
            ex("is3-push", "Push-ups or DB bench", "2 x 10", L_STR),
            ex("is3-row", "Cable row", "2 x 10", L_STR),
            ex("is3-core", "Pallof press", "2 x 10 / side", L_REP),
          ],
        },
        {
          title: "Power (keep it snappy)",
          items: [ex("is3-slam", "Slam ball", "2 x 6", L_REP)],
        },
      ],
    },
    4: {
      name: "Block 4 · Maintain A",
      focus: "Hold strength with minimal fatigue. Heavier but very low volume — 2 sessions/week. Stop sets with reps in the tank.",
      groups: [
        {
          title: "Strength (2x/week)",
          items: [
            ex("is4-sq", "Belt squat", "3 x 4", L_STR, "heavier, leave 2 reps in reserve"),
            ex("is4-split", "DB split squat", "2 x 6 / leg", L_STR),
            ex("is4-bench", "DB bench", "3 x 5", L_STR),
            ex("is4-pull", "Chin-ups / row", "2 x 8", L_STR),
            ex("is4-cope", "Copenhagen plank", "2 x 25s / side", L_TIME),
          ],
        },
        {
          title: "Power",
          items: [ex("is4-rot", "Med ball rotational throw", "2 x 5 / side", L_REP)],
        },
      ],
    },
    5: {
      name: "Block 5 · Maintain B",
      focus: "Same idea, swapped exercises to keep it fresh. Single-leg emphasis for skating balance.",
      groups: [
        {
          title: "Strength (2x/week)",
          items: [
            ex("is5-step", "DB step-up", "3 x 5 / leg", L_STR),
            ex("is5-hinge", "DB single-leg RDL", "2 x 6 / leg", L_STR),
            ex("is5-incl", "DB incline press", "3 x 6", L_STR),
            ex("is5-row", "Cable row", "2 x 10", L_STR),
            ex("is5-core", "Anti-rotation hold", "2 x 20s / side", L_TIME),
          ],
        },
        {
          title: "Power",
          items: [ex("is5-lat", "Lateral bound", "2 x 4 / side", L_REP)],
        },
      ],
    },
    6: {
      name: "Block 6 · Mid-Season Refresh",
      focus: "Planned lighter block — legs are probably feeling the season. Cut a set everywhere, prioritize sleep and movement.",
      groups: [
        {
          title: "Strength (light, 2x/week)",
          items: [
            ex("is6-sq", "Goblet squat", "2 x 6", L_STR, "easy, tidy reps"),
            ex("is6-rdl", "DB RDL", "2 x 8", L_STR),
            ex("is6-push", "Push-ups", "2 x 12", L_REP),
            ex("is6-row", "Band / cable row", "2 x 12", L_STR),
          ],
        },
        {
          title: "Mobility",
          items: [
            ex("is6-hip", "90/90 hip switches", "2 x 8 / side", L_REP),
            ex("is6-couch", "Couch stretch", "2 x 30s / side", L_TIME),
          ],
        },
      ],
    },
    7: {
      name: "Block 7 · Maintain A",
      focus: "Back to holding strength for the stretch run. Low volume, moderate-heavy, always fresh for games.",
      groups: [
        {
          title: "Strength (2x/week)",
          items: [
            ex("is7-sq", "Belt squat", "3 x 4", L_STR, "leave 2 in reserve"),
            ex("is7-split", "DB split squat", "2 x 6 / leg", L_STR),
            ex("is7-bench", "DB bench", "3 x 5", L_STR),
            ex("is7-pull", "Chin-ups / row", "2 x 8", L_STR),
            ex("is7-cope", "Copenhagen plank", "2 x 25s / side", L_TIME),
          ],
        },
        {
          title: "Power",
          items: [ex("is7-scoop", "Med ball scoop throw", "2 x 5", L_REP)],
        },
      ],
    },
    8: {
      name: "Block 8 · Late-Season Sharpen",
      focus: "Playoffs push. Keep the nervous system snappy: low reps, explosive intent, almost no fatigue. Quality only.",
      groups: [
        {
          title: "Strength (2x/week, crisp)",
          items: [
            ex("is8-sq", "Belt squat", "3 x 3", L_STR, "fast, powerful, well short of failure"),
            ex("is8-step", "DB step-up", "2 x 5 / leg", L_STR),
            ex("is8-push", "DB bench", "2 x 5", L_STR),
            ex("is8-pull", "Row", "2 x 8", L_STR),
          ],
        },
        {
          title: "Power",
          items: [
            ex("is8-broad", "Broad jump", "3 x 3", L_TR, "log best distance"),
            ex("is8-slam", "Slam ball", "2 x 5", L_REP),
          ],
        },
      ],
    },
  },
};

// -----------------------------------------------------------------
// OFF-ICE DRILLS  (blocks 1-8, all 32 weeks) — progress every block
// -----------------------------------------------------------------
const OFFICE = {
  key: "office",
  label: "Off-Ice",
  accent: "#C9952C",
  range: [1, 32],
  blocks: {
    1: {
      name: "Block 1 · Hands Fundamentals",
      focus: "Ball on a smooth surface, low stance, eyes up. 10-15 focused minutes a day. Control before speed.",
      groups: [{ title: "Stickhandling", items: [
        ex("of1-quick", "Stationary quick-hands", "3 x 45s", L_TIME, "soft grip, small fast touches"),
        ex("of1-wide", "Wide dribble", "3 x 30s", L_TR, "reach past shoulder width"),
        ex("of1-fig8", "Figure-8 around 2 objects", "3 x 30s", L_TR),
        ex("of1-toe", "Soccer-ball toe taps + handles", "3 x 30s", L_TIME, "head up, wiring awareness"),
      ] }],
    },
    2: {
      name: "Block 2 · Range & Control",
      focus: "Expand where the puck can go. Keep the head up the whole time.",
      groups: [{ title: "Stickhandling", items: [
        ex("of2-quick", "Quick-hands", "3 x 60s", L_TIME),
        ex("of2-body", "Around-the-body handles", "3 x 30s", L_TR, "front, side, behind"),
        ex("of2-fig8", "Figure-8, tighter gap", "3 x 40s", L_TR),
        ex("of2-fig8b", "One-hand control (each hand)", "2 x 20s / hand", L_TIME),
      ] }],
    },
    3: {
      name: "Block 3 · Add Movement",
      focus: "Now the feet move while the hands work. Stay in a skating stance.",
      groups: [{ title: "Stickhandling + Agility", items: [
        ex("of3-course", "Timed obstacle course", "3 rounds", L_TR, "log best time, beat it next week"),
        ex("of3-toedrag", "Toe-drag deception", "3 x 15 / side", L_REP, "sell the fake"),
        ex("of3-ladder", "Agility ladder + ball", "4 patterns", L_TIME),
        ex("of3-lat", "Lateral bounds", "4 x 30s", L_TIME, "mimic the skating push"),
      ] }],
    },
    4: {
      name: "Block 4 · Speed & Reaction",
      focus: "Faster hands, react to a cue. Add a balance surface if you have one.",
      groups: [{ title: "Stickhandling + Agility", items: [
        ex("of4-course", "Obstacle course, timed", "3 rounds", L_TR, "log best time"),
        ex("of4-balance", "Balance-board handles", "3 x 45s", L_TIME, "core + edges while handling"),
        ex("of4-react", "Reaction-ball catch + handle", "3 x 30s", L_REP),
        ex("of4-cross", "Crossover step-throughs", "3 x 8 / way", L_REP),
      ] }],
    },
    5: {
      name: "Block 5 · Deception",
      focus: "Build a small move-set: fakes, drags, changes of pace. Functional, not flashy.",
      groups: [{ title: "Stickhandling", items: [
        ex("of5-fake", "Fake-shot to pull", "3 x 12 / side", L_REP),
        ex("of5-toe", "Backhand toe drag", "3 x 12", L_REP),
        ex("of5-course", "Course, timed", "3 rounds", L_TR),
        ex("of5-balance", "Balance-board combos", "3 x 45s", L_TIME),
      ] }],
    },
    6: {
      name: "Block 6 · Combine",
      focus: "String moves together at game pace. Head up, scan while you handle.",
      groups: [{ title: "Stickhandling + Agility", items: [
        ex("of6-combo", "Move combos (drag→fake→go)", "3 x 40s", L_TIME),
        ex("of6-course", "Course, timed", "3 rounds", L_TR, "chase a new best"),
        ex("of6-ladder", "Ladder speed + ball", "4 patterns", L_TIME),
        ex("of6-1hand", "One-hand extend + pull", "2 x 20s / hand", L_TIME),
      ] }],
    },
    7: {
      name: "Block 7 · Compete",
      focus: "Put a clock and a target on everything. Beat last week's numbers.",
      groups: [{ title: "Stickhandling", items: [
        ex("of7-course", "Course for time", "5 rounds", L_TR, "record every round"),
        ex("of7-combo", "Combo circuit", "3 x 45s", L_TIME),
        ex("of7-react", "Reaction ball + handle", "3 x 40s", L_REP),
        ex("of7-balance", "Balance-board handles", "3 x 60s", L_TIME),
      ] }],
    },
    8: {
      name: "Block 8 · Sharpen",
      focus: "Playoffs: keep hands crisp with short, high-quality sessions. Don't gas yourself.",
      groups: [{ title: "Stickhandling", items: [
        ex("of8-quick", "Quick-hands bursts", "4 x 20s", L_TIME, "max speed, full rest"),
        ex("of8-combo", "Favorite combos", "3 x 30s", L_TIME),
        ex("of8-course", "Course, best time", "3 rounds", L_TR),
      ] }],
    },
  },
};

// -----------------------------------------------------------------
// ON-ICE DRILLS  (blocks 1-8, all 32 weeks) — progress every block
// -----------------------------------------------------------------
const ONICE = {
  key: "onice",
  label: "On-Ice",
  accent: "#5FA8D3",
  range: [1, 32],
  blocks: {
    1: {
      name: "Block 1 · Edges & Base",
      focus: "USA Hockey's golden age of skill. Every rep demands an edge or a puck touch — no coasting laps.",
      groups: [
        { title: "Skating & Edges", items: [
          ex("on1-ccut", "Inside/outside edge C-cuts", "2 laps / edge", L_REP, "feel both edges bite"),
          ex("on1-pull", "Two-foot edge pulls", "3 x width", L_REP, "deep knee bend"),
          ex("on1-cross", "Forward crossovers, both circles", "3 min / dir", L_TIME),
        ] },
        { title: "Puck Skills", items: [
          ex("on1-hands", "Stationary handles wide/narrow", "2 min", L_TIME, "eyes up, cup the puck"),
          ex("on1-fig8", "Figure-8 around pucks", "3 x 30s", L_TR),
        ] },
      ],
    },
    2: {
      name: "Block 2 · Edges + Puck",
      focus: "Combine edges and handling. Add backward crossovers.",
      groups: [
        { title: "Skating & Edges", items: [
          ex("on2-bcross", "Backward crossovers", "3 min / dir", L_TIME),
          ex("on2-turn", "Tight turns around the dots", "8 / dir", L_REP, "shoulders + stick lead"),
        ] },
        { title: "Puck Skills", items: [
          ex("on2-circle", "Stickhandle while skating circles", "3 min", L_TIME),
          ex("on2-toe", "Toe-drag pull & push", "3 x 20", L_REP, "soft hands"),
        ] },
      ],
    },
    3: {
      name: "Block 3 · Transitions",
      focus: "Change direction under control. Mohawk turns are a key skill for his age (second speed window).",
      groups: [
        { title: "Skating", items: [
          ex("on3-mohawk", "Mohawk transitions (fwd↔bwd)", "8 / side", L_REP),
          ex("on3-start", "Power starts — first 3 steps", "6 x blue-blue", L_TIME, "log time; ties to off-ice acceleration"),
        ] },
        { title: "Puck Skills", items: [
          ex("on3-heads", "Heads-up handling thru cones", "6 lengths", L_REP, "look at far net, not puck"),
        ] },
      ],
    },
    4: {
      name: "Block 4 · Speed Starts",
      focus: "Sharpen acceleration and stops. This block is where the gym speed work shows up on ice.",
      groups: [
        { title: "Skating", items: [
          ex("on4-start", "Power starts for time", "6 x blue-blue", L_TIME, "record each rep"),
          ex("on4-stop", "Hockey stops both directions", "10 / side", L_REP, "even snow spray"),
        ] },
        { title: "Puck Skills", items: [
          ex("on4-protect", "Puck protection (one-hand + body)", "6 x 20s", L_TIME),
        ] },
      ],
    },
    5: {
      name: "Block 5 · Edge + Puck Combos",
      focus: "Do two things at once: carry the puck through edge work and turns.",
      groups: [
        { title: "Combined", items: [
          ex("on5-turnpuck", "Tight turns with puck", "8 / dir", L_REP),
          ex("on5-crosspuck", "Crossovers with puck, both circles", "3 min / dir", L_TIME),
          ex("on5-fig8", "Figure-8 puck + tight radius", "3 x 40s", L_TR),
        ] },
      ],
    },
    6: {
      name: "Block 6 · 1-on-1 Moves",
      focus: "Apply a move against a cone/defender, then finish. Functional deception at speed.",
      groups: [
        { title: "Skills", items: [
          ex("on6-move", "1-on-1 move on cone → drive", "10 reps", L_REP),
          ex("on6-toe", "Toe-drag around stick", "10 / side", L_REP),
          ex("on6-start", "Power starts", "6 x blue-blue", L_TIME),
        ] },
      ],
    },
    7: {
      name: "Block 7 · Finish",
      focus: "Speed into a shot. Log finishes (makes/attempts) so he sees the trend.",
      groups: [
        { title: "Skills + Finishing", items: [
          ex("on7-drive", "Drive wide → shot", "12 reps", L_TR, "log makes in reps, notes for spot"),
          ex("on7-quick", "Quick-release off the pass", "15 reps", L_TR, "log makes"),
          ex("on7-start", "Power starts", "6 x blue-blue", L_TIME),
        ] },
      ],
    },
    8: {
      name: "Block 8 · Game Speed",
      focus: "Playoffs: everything at game pace, short and sharp. Compete against his own numbers.",
      groups: [
        { title: "Game Speed", items: [
          ex("on8-combo", "Skate-handle-finish combo", "10 reps", L_TR, "log makes"),
          ex("on8-start", "Power starts, best time", "6 x blue-blue", L_TIME),
          ex("on8-stop", "Stops + starts both ways", "10 / side", L_REP),
        ] },
      ],
    },
  },
};

const MODES = { offseason: OFFSEASON, inseason: INSEASON, office: OFFICE, onice: ONICE };
const MODE_ORDER = ["offseason", "inseason", "office", "onice"];

const TOTAL_WEEKS = 32;
const blockForWeek = (w) => Math.ceil(w / 4);
const phaseForWeek = (w) => (w <= 8 ? "Off-Season" : "In-Season");

// Resolve which block's content a mode shows for a given week.
// S&C modes clamp to their own range; drills use the week's block.
function resolveBlock(mode, week) {
  const [lo, hi] = mode.range;
  let b = blockForWeek(Math.min(Math.max(week, lo), hi));
  if (!mode.blocks[b]) {
    const keys = Object.keys(mode.blocks).map(Number).sort((a, z) => a - z);
    b = keys.reduce((best, k) => (Math.abs(k - blockForWeek(week)) < Math.abs(best - blockForWeek(week)) ? k : best), keys[0]);
  }
  const inRange = week >= lo && week <= hi;
  return { block: b, content: mode.blocks[b], inRange };
}

const FIELD_META = {
  weight: { label: "Weight", unit: "lb", type: "number", ph: "lb" },
  reps: { label: "Reps", unit: "", type: "number", ph: "reps" },
  time: { label: "Time / Speed", unit: "", type: "text", ph: "e.g. 12.3s" },
  notes: { label: "Notes", unit: "", type: "text", ph: "how it felt, cues…" },
};

const K = {
  logs: "hockey-tracker:logs",
  done: "hockey-tracker:done",
  week: "hockey-tracker:week",
  mode: "hockey-tracker:mode",
};

// =================================================================
// STORAGE (localStorage)
// =================================================================
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
    /* private mode / quota — session still works */
  }
}

const logKey = (mode, week, id) => `${mode}|${week}|${id}`;
const summarize = (entry) => {
  if (!entry) return "";
  const bits = [];
  if (entry.weight && entry.reps) bits.push(`${entry.weight}×${entry.reps}`);
  else if (entry.weight) bits.push(`${entry.weight} lb`);
  else if (entry.reps) bits.push(`${entry.reps} reps`);
  if (entry.time) bits.push(entry.time);
  return bits.join(" · ");
};
const hasData = (e) => e && (e.weight || e.reps || e.time || e.notes);

// =================================================================
// SMALL UI PIECES
// =================================================================
function GoalLamp({ checked, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={checked}
      aria-label={checked ? "Mark incomplete" : "Mark complete"}
      style={{
        width: 30, height: 30, borderRadius: "50%",
        border: `2px solid ${checked ? accent : "rgba(255,255,255,0.25)"}`,
        background: checked
          ? `radial-gradient(circle at 35% 30%, ${accent}, ${accent}CC 55%, ${accent}66 100%)`
          : "rgba(255,255,255,0.04)",
        boxShadow: checked ? `0 0 12px 2px ${accent}99, 0 0 2px ${accent}` : "none",
        flexShrink: 0, cursor: "pointer", transition: "all 160ms ease", padding: 0,
      }}
    />
  );
}

// =================================================================
// APP
// =================================================================
export default function App() {
  const [logs, setLogs] = useState(() => loadKey(K.logs, {}));
  const [done, setDone] = useState(() => loadKey(K.done, {}));
  const [week, setWeek] = useState(() => loadKey(K.week, 1));
  const [modeKey, setModeKey] = useState(() => loadKey(K.mode, "offseason"));
  const [openItem, setOpenItem] = useState(null); // item id whose log panel is open
  const [showHistory, setShowHistory] = useState(null); // item id whose history is open

  useEffect(() => saveKey(K.logs, logs), [logs]);
  useEffect(() => saveKey(K.done, done), [done]);
  useEffect(() => saveKey(K.week, week), [week]);
  useEffect(() => saveKey(K.mode, modeKey), [modeKey]);

  const mode = MODES[modeKey];
  const { block, content, inRange } = useMemo(() => resolveBlock(mode, week), [mode, week]);

  const items = useMemo(
    () => content.groups.flatMap((g) => g.items.map((i) => i.id)),
    [content]
  );
  const doneCount = items.filter((id) => done[logKey(modeKey, week, id)]).length;
  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  const toggleDone = useCallback((id) => {
    const k = logKey(modeKey, week, id);
    setDone((prev) => ({ ...prev, [k]: !prev[k] }));
  }, [modeKey, week]);

  const setField = useCallback((id, field, value) => {
    const k = logKey(modeKey, week, id);
    setLogs((prev) => ({ ...prev, [k]: { ...(prev[k] || {}), [field]: value } }));
  }, [modeKey, week]);

  const getEntry = (id) => logs[logKey(modeKey, week, id)];

  // history for an item = every week (this mode) that has data
  const historyFor = (id) => {
    const out = [];
    for (let w = 1; w <= TOTAL_WEEKS; w++) {
      const e = logs[logKey(modeKey, w, id)];
      if (hasData(e)) out.push({ week: w, entry: e });
    }
    return out;
  };

  const resetWeek = () => {
    setDone((prev) => {
      const next = { ...prev };
      items.forEach((id) => delete next[logKey(modeKey, week, id)]);
      return next;
    });
  };

  const accent = mode.accent;

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 50% -10%, #16324A 0%, #0A1826 55%, #060F1A 100%)",
      color: "#EAF3F7", fontFamily: "'Helvetica Neue', Arial, sans-serif", paddingBottom: 56,
    }}>
      {/* Header */}
      <header style={{
        padding: "calc(env(safe-area-inset-top, 0px) + 34px) 20px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ fontSize: 11.5, letterSpacing: "0.28em", color: "#7FA1B5", fontWeight: 700, marginBottom: 6 }}>
          FIRST STEP PROGRAM
        </div>
        <h1 style={{
          margin: 0, fontSize: 27, fontWeight: 800, fontStretch: "condensed",
          letterSpacing: "-0.01em", lineHeight: 1.05, textTransform: "uppercase",
        }}>
          Hockey Performance
        </h1>

        {/* Mode tabs */}
        <div style={{ display: "flex", gap: 4, overflowX: "auto", marginTop: 14, paddingBottom: 2 }}>
          {MODE_ORDER.map((mk) => {
            const m = MODES[mk];
            const on = mk === modeKey;
            return (
              <button
                key={mk}
                onClick={() => { setModeKey(mk); setOpenItem(null); setShowHistory(null); }}
                style={{
                  flex: "0 0 auto", border: "none", borderRadius: 8,
                  padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  background: on ? m.accent : "rgba(255,255,255,0.05)",
                  color: on ? "#0A1826" : "#9FBBCC", transition: "all 140ms ease",
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Week navigator */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px 0", gap: 12,
      }}>
        <button
          onClick={() => setWeek((w) => Math.max(1, w - 1))}
          disabled={week <= 1}
          style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.04)",
            color: week <= 1 ? "#3A5165" : "#EAF3F7",
            fontSize: 20, cursor: week <= 1 ? "default" : "pointer", lineHeight: 1,
          }}
        >‹</button>

        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "0.02em" }}>
            Week {week} <span style={{ color: "#5C7E92", fontWeight: 600 }}>/ {TOTAL_WEEKS}</span>
          </div>
          <div style={{ fontSize: 11.5, color: accent, fontWeight: 700, letterSpacing: "0.06em", marginTop: 2 }}>
            BLOCK {block} · {phaseForWeek(week).toUpperCase()}
          </div>
        </div>

        <button
          onClick={() => setWeek((w) => Math.min(TOTAL_WEEKS, w + 1))}
          disabled={week >= TOTAL_WEEKS}
          style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.04)",
            color: week >= TOTAL_WEEKS ? "#3A5165" : "#EAF3F7",
            fontSize: 20, cursor: week >= TOTAL_WEEKS ? "default" : "pointer", lineHeight: 1,
          }}
        >›</button>
      </div>

      {/* Block banner */}
      <div style={{
        margin: "14px 20px 0", padding: "12px 14px", borderRadius: 10,
        background: "rgba(255,255,255,0.04)", borderLeft: `3px solid ${accent}`,
      }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{content.name}</div>
        <div style={{ fontSize: 12.5, lineHeight: 1.45, color: "#B7CEDB" }}>{content.focus}</div>
        {!inRange && (
          <div style={{ fontSize: 11.5, color: "#F2C14E", marginTop: 8, lineHeight: 1.4 }}>
            {mode.label} programming runs weeks {mode.range[0]}–{mode.range[1]}. Showing the nearest block as a reference for this week.
          </div>
        )}
      </div>

      {/* Progress */}
      <div style={{ padding: "16px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: "#7FA1B5" }}>Week {week} complete</span>
          <span style={{
            fontFamily: "'Courier New', monospace", fontVariantNumeric: "tabular-nums",
            fontSize: 20, fontWeight: 700, color: accent,
          }}>
            {doneCount}/{items.length}
          </span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: accent, boxShadow: `0 0 8px ${accent}`, transition: "width 200ms ease" }} />
        </div>
      </div>

      {/* Groups + items */}
      <main style={{ padding: "22px 20px 0" }}>
        {content.groups.map((group) => (
          <section key={group.title} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 10px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: accent, boxShadow: `0 0 6px 1px ${accent}` }} />
              <h2 style={{ fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9FBBCC", fontWeight: 800, margin: 0 }}>
                {group.title}
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {group.items.map((item) => {
                const dk = logKey(modeKey, week, item.id);
                const checked = !!done[dk];
                const entry = getEntry(item.id);
                const summary = summarize(entry);
                const isOpen = openItem === item.id;
                const histOpen = showHistory === item.id;
                const hist = histOpen ? historyFor(item.id) : null;
                return (
                  <div key={item.id} style={{
                    background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 10, padding: "10px 12px", opacity: checked ? 0.7 : 1, transition: "opacity 160ms ease",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <GoalLamp checked={checked} accent={accent} onClick={() => toggleDone(item.id)} />
                      <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                        onClick={() => setOpenItem(isOpen ? null : item.id)}>
                        <div style={{ fontSize: 14.5, fontWeight: 600, textDecoration: checked ? "line-through" : "none" }}>
                          {item.name}
                        </div>
                        {item.sub && <div style={{ fontSize: 11.5, color: "#5C7E92", marginTop: 2 }}>{item.sub}</div>}
                        {summary && (
                          <div style={{ fontSize: 12, color: accent, marginTop: 3, fontFamily: "'Courier New', monospace", fontWeight: 700 }}>
                            {summary}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{
                          fontFamily: "'Courier New', monospace", fontVariantNumeric: "tabular-nums",
                          fontSize: 12.5, fontWeight: 700, color: "#9FBBCC", whiteSpace: "nowrap",
                        }}>{item.target}</div>
                        <button
                          onClick={() => setOpenItem(isOpen ? null : item.id)}
                          style={{
                            marginTop: 6, border: `1px solid ${accent}88`,
                            background: isOpen ? accent : "transparent",
                            color: isOpen ? "#0A1826" : accent, borderRadius: 7,
                            padding: "4px 10px", fontSize: 11.5, fontWeight: 700, cursor: "pointer",
                          }}
                        >{isOpen ? "Close" : "Log"}</button>
                      </div>
                    </div>

                    {isOpen && (
                      <div style={{ marginTop: 12, paddingLeft: 42 }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {item.log.filter((f) => f !== "notes").map((f) => (
                            <div key={f} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                              <label style={{ fontSize: 10.5, color: "#7FA1B5", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 700 }}>
                                {FIELD_META[f].label}
                              </label>
                              <input
                                type={FIELD_META[f].type}
                                inputMode={FIELD_META[f].type === "number" ? "decimal" : "text"}
                                value={(entry && entry[f]) || ""}
                                onChange={(e) => setField(item.id, f, e.target.value)}
                                placeholder={FIELD_META[f].ph}
                                style={{
                                  width: f === "time" ? 110 : 80, padding: "8px 10px", borderRadius: 8,
                                  border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.25)",
                                  color: "#EAF3F7", fontSize: 15, fontFamily: "'Courier New', monospace",
                                }}
                              />
                            </div>
                          ))}
                        </div>
                        {item.log.includes("notes") && (
                          <div style={{ marginTop: 8 }}>
                            <label style={{ fontSize: 10.5, color: "#7FA1B5", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 700 }}>
                              Notes
                            </label>
                            <input
                              type="text"
                              value={(entry && entry.notes) || ""}
                              onChange={(e) => setField(item.id, "notes", e.target.value)}
                              placeholder={FIELD_META.notes.ph}
                              style={{
                                width: "100%", marginTop: 3, padding: "8px 10px", borderRadius: 8,
                                border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.25)",
                                color: "#EAF3F7", fontSize: 14,
                              }}
                            />
                          </div>
                        )}

                        <button
                          onClick={() => setShowHistory(histOpen ? null : item.id)}
                          style={{
                            marginTop: 10, background: "transparent", border: "none",
                            color: "#7FA1B5", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0,
                            textDecoration: "underline", textUnderlineOffset: 3,
                          }}
                        >{histOpen ? "Hide history" : "View history"}</button>

                        {histOpen && (
                          <div style={{ marginTop: 8, background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "8px 10px" }}>
                            {hist.length === 0 ? (
                              <div style={{ fontSize: 12, color: "#5C7E92" }}>No entries logged yet.</div>
                            ) : (
                              hist.map((h) => (
                                <div key={h.week} style={{
                                  display: "flex", justifyContent: "space-between", gap: 10,
                                  fontSize: 12, padding: "3px 0", color: h.week === week ? accent : "#B7CEDB",
                                }}>
                                  <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>Wk {h.week}</span>
                                  <span style={{ fontFamily: "'Courier New', monospace", textAlign: "right" }}>
                                    {summarize(h.entry) || "—"}{h.entry.notes ? `  · ${h.entry.notes}` : ""}
                                  </span>
                                </div>
                              ))
                            )}
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
          onClick={resetWeek}
          style={{
            width: "100%", padding: "12px", marginTop: 4, marginBottom: 18,
            background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 10, color: "#7FA1B5", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >Reset Week {week} checkmarks</button>
      </main>

      <footer style={{ padding: "6px 20px 0", fontSize: 11.5, color: "#4A6578", lineHeight: 1.5 }}>
        S&C is technique-first and age-appropriate: small load jumps, always short of failure. Drills follow USA Hockey's ADM
        skill progressions. Logged numbers are a guide for a coach or parent to eyeball — clean form always wins over the target.
      </footer>
    </div>
  );
}
