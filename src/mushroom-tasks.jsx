import React, { useState, useEffect, useRef } from 'react';
import { Plus, Check, ListTodo, Heart, Trash2, Trophy, Flame, RotateCw, X, Award, BarChart3 } from 'lucide-react';

// ============ DATE / TIME HELPERS (LOCAL TIME, NOT UTC) ============
const todayStr = () => {
  // Use LOCAL time so day boundary matches user's wall clock
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const daysBetween = (a, b) => {
  // a, b are 'YYYY-MM-DD' strings — compute diff in calendar days
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
};
const nowMs = () => Date.now();

// ============ PET CARE CONFIG ============
// Meters drain at this rate (points per hour). Max value: 100.
const DRAIN_PER_HOUR = { hunger: 4, happiness: 3, energy: 5 }; // ~20-33 hours to drain fully
const MAX_METER = 100;
// Each completed task gives this much to each meter
const TASK_REWARD = { hunger: 12, happiness: 15, energy: 10 };

// Compute current meter values based on last update timestamp
const projectMeters = (meters, lastUpdate) => {
  const hoursElapsed = (nowMs() - lastUpdate) / (1000 * 60 * 60);
  return {
    hunger: Math.max(0, Math.round(meters.hunger - DRAIN_PER_HOUR.hunger * hoursElapsed)),
    happiness: Math.max(0, Math.round(meters.happiness - DRAIN_PER_HOUR.happiness * hoursElapsed)),
    energy: Math.max(0, Math.round(meters.energy - DRAIN_PER_HOUR.energy * hoursElapsed)),
  };
};

// Pet mood derived from average meter level
const moodFrom = (meters) => {
  const avg = (meters.hunger + meters.happiness + meters.energy) / 3;
  if (avg >= 70) return 'happy';
  if (avg >= 40) return 'neutral';
  if (avg >= 15) return 'sad';
  return 'sick';
};

// ============ ACHIEVEMENTS ============
const ACHIEVEMENTS = [
  { id: 'first_task',   name: 'First Step',       desc: 'Complete your first task',           check: (s) => s.totalCompleted >= 1 },
  { id: 'tasks_10',     name: 'Getting Going',    desc: 'Complete 10 tasks',                  check: (s) => s.totalCompleted >= 10 },
  { id: 'tasks_50',     name: 'Habit Forming',    desc: 'Complete 50 tasks',                  check: (s) => s.totalCompleted >= 50 },
  { id: 'tasks_100',    name: 'Centurion',        desc: 'Complete 100 tasks',                 check: (s) => s.totalCompleted >= 100 },
  { id: 'tasks_500',    name: 'Task Master',      desc: 'Complete 500 tasks',                 check: (s) => s.totalCompleted >= 500 },
  { id: 'streak_3',     name: 'Three In A Row',   desc: '3-day streak',                       check: (s) => s.bestStreak >= 3 },
  { id: 'streak_7',     name: 'Week Warrior',     desc: '7-day streak',                       check: (s) => s.bestStreak >= 7 },
  { id: 'streak_30',    name: 'Unbroken Month',   desc: '30-day streak',                      check: (s) => s.bestStreak >= 30 },
  { id: 'streak_100',   name: 'Century Streak',   desc: '100-day streak',                     check: (s) => s.bestStreak >= 100 },
  { id: 'recurring_5',  name: 'Routine',          desc: 'Set up 5 recurring tasks',           check: (s) => s.recurringCount >= 5 },
  { id: 'pet_max',      name: 'Perfect Care',     desc: 'All meters above 90 at once',        check: (s) => s.metersAllAbove90 },
  { id: 'pet_revive',   name: 'Back From Brink',  desc: 'Revive pet from sick state',         check: (s) => s.didRevive },
  { id: 'big_day',      name: 'Productive Day',   desc: 'Complete 10 tasks in a single day',  check: (s) => s.bestDayCount >= 10 },
];

// ============ PIXEL SPRITE — 1-bit Tamagotchi style ============
// Each sprite is a grid of '#' (filled) and '.' (empty). Renders as black pixels on the LCD bg.
// Two frames per state for idle animation.

const SPRITE = {
  happy: [
    [
      '..............',
      '....######....',
      '...#......#...',
      '..#..#..#..#..',
      '..#........#..',
      '..#..#..#..#..',
      '..#..####..#..',
      '...#......#...',
      '....######....',
      '....#....#....',
      '....#....#....',
      '...##....##...',
    ],
    [
      '..............',
      '....######....',
      '...#......#...',
      '..#..#..#..#..',
      '..#........#..',
      '..#..#..#..#..',
      '..#..####..#..',
      '...#......#...',
      '....######....',
      '...##....##...',
      '...#......#...',
      '..##......##..',
    ],
  ],
  neutral: [
    [
      '..............',
      '....######....',
      '...#......#...',
      '..#..#..#..#..',
      '..#........#..',
      '..#..#..#..#..',
      '..#...##...#..',
      '...#......#...',
      '....######....',
      '....#....#....',
      '....#....#....',
      '...##....##...',
    ],
    [
      '..............',
      '....######....',
      '...#......#...',
      '..#..#..#..#..',
      '..#........#..',
      '..#..#..#..#..',
      '..#...##...#..',
      '...#......#...',
      '....######....',
      '....#....#....',
      '...##....##...',
      '...#......#...',
    ],
  ],
  sad: [
    [
      '..............',
      '....######....',
      '...#......#...',
      '..#.##..##.#..',
      '..#........#..',
      '..#..#..#..#..',
      '..#..####..#..',  // inverted frown
      '...#......#...',
      '....######....',
      '....#....#....',
      '....#....#....',
      '...##....##...',
    ],
    [
      '..............',
      '....######....',
      '...#......#...',
      '..#.##..##.#..',
      '..#........#..',
      '..#..#..#..#..',
      '..#..####..#..',
      '...#......#...',
      '....######....',
      '....#....#....',
      '....##..##....',  // slumped
      '....#....#....',
    ],
  ],
  sick: [
    [
      '..............',
      '....######....',
      '...#......#...',
      '..#.X#..#X.#..',  // X eyes
      '..#........#..',
      '..#........#..',
      '..#..####..#..',
      '...#......#...',
      '....######....',
      '....#....#....',
      '....##..##....',
      '....#....#....',
    ],
    [
      '..............',
      '....######....',
      '...#......#...',
      '..#.X#..#X.#..',
      '..#........#..',
      '..#........#..',
      '..#..####..#..',
      '...#......#...',
      '....######....',
      '....##..##....',
      '....#....#....',
      '....#....#....',
    ],
  ],
};

// Render a sprite frame as SVG pixels
const PetSprite = ({ mood, frame, size = 240 }) => {
  const grid = SPRITE[mood][frame];
  const w = grid[0].length;
  const h = grid.length;
  const pixels = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = grid[y][x];
      if (ch === '#') {
        pixels.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#1a2a1a"/>);
      } else if (ch === 'X') {
        // Render X as two crossing lines (stylized dead eyes)
        pixels.push(<rect key={`xa-${x}-${y}`} x={x} y={y} width="1" height="1" fill="#1a2a1a"/>);
      }
    }
  }
  return (
    <svg
      width={size}
      height={size * (h / w)}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      style={{ display: 'block' }}
    >
      {pixels}
    </svg>
  );
};

// ============ MAIN APP ============
export default function MushroomTasks() {
  const [view, setView] = useState('home'); // home | tasks | stats | achievements
  const [loaded, setLoaded] = useState(false);
  const [state, setState] = useState({
    petName: 'Tama',
    meters: { hunger: 80, happiness: 80, energy: 80 },
    metersUpdatedAt: nowMs(),
    tasks: [], // { id, text, recurring, completed, completedDate }
    streak: 0,
    bestStreak: 0,
    lastCompletedDate: null,
    totalCompleted: 0,
    bestDayCount: 0,
    todayCount: 0,
    todayCountDate: null,
    unlockedAchievements: [], // ids
    didRevive: false,
    history: [], // [{date, count}] for stats — last 30 days
  });
  const [animFrame, setAnimFrame] = useState(0);
  const [feedingPulse, setFeedingPulse] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskRecurring, setNewTaskRecurring] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [achievementToast, setAchievementToast] = useState(null);
  const [toastQueue, setToastQueue] = useState([]);

  // ---- Load state from localStorage ----
  useEffect(() => {
    try {
      const r = localStorage.getItem('tama_state');
      if (r) {
        const saved = JSON.parse(r);
        // Project meters forward based on time elapsed
        if (saved.metersUpdatedAt) {
          saved.meters = projectMeters(saved.meters, saved.metersUpdatedAt);
        }
        // Reset today's count if it's a new day
        if (saved.todayCountDate !== todayStr()) {
          saved.todayCount = 0;
          saved.todayCountDate = todayStr();
        }
        // Daily reset: vanish completed one-shots, refresh recurring tasks
        saved.tasks = (saved.tasks || []).flatMap(t => {
          if (t.completed && t.completedDate !== todayStr()) {
            // Old completion
            if (t.recurring) {
              return [{ ...t, completed: false, completedDate: null }];
            }
            return []; // one-shot completed — gone
          }
          return [t];
        });
        // Streak check: if last completed was >1 day ago, streak resets
        if (saved.lastCompletedDate) {
          const gap = daysBetween(saved.lastCompletedDate, todayStr());
          if (gap > 1) saved.streak = 0;
        }
        // Defaults for new fields
        saved.bestStreak = saved.bestStreak || 0;
        saved.totalCompleted = saved.totalCompleted || 0;
        saved.bestDayCount = saved.bestDayCount || 0;
        saved.unlockedAchievements = saved.unlockedAchievements || [];
        saved.history = saved.history || [];
        saved.didRevive = saved.didRevive || false;
        setState(saved);
      }
    } catch (e) { /* fresh start */ }
    setLoaded(true);
  }, []);

  // ---- Save state ----
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem('tama_state', JSON.stringify(state)); } catch (e) {}
  }, [state, loaded]);

  // ---- Tick: update meters every minute ----
  useEffect(() => {
    if (!loaded) return;
    const interval = setInterval(() => {
      setState(prev => {
        const newMeters = projectMeters(prev.meters, prev.metersUpdatedAt);
        if (
          newMeters.hunger === prev.meters.hunger &&
          newMeters.happiness === prev.meters.happiness &&
          newMeters.energy === prev.meters.energy
        ) {
          return prev; // no change, don't trigger re-render
        }
        return { ...prev, meters: newMeters, metersUpdatedAt: nowMs() };
      });
    }, 60000); // every minute
    return () => clearInterval(interval);
  }, [loaded]);

  // ---- Sprite animation: 2-frame loop ----
  useEffect(() => {
    const interval = setInterval(() => setAnimFrame(f => 1 - f), 700);
    return () => clearInterval(interval);
  }, []);

  // ---- Achievement detection ----
  useEffect(() => {
    if (!loaded) return;
    const metersAllAbove90 = state.meters.hunger > 90 && state.meters.happiness > 90 && state.meters.energy > 90;
    const recurringCount = state.tasks.filter(t => t.recurring).length;
    const ctx = {
      ...state,
      metersAllAbove90,
      recurringCount,
    };
    const newlyUnlocked = ACHIEVEMENTS.filter(a =>
      !state.unlockedAchievements.includes(a.id) && a.check(ctx)
    );
    if (newlyUnlocked.length > 0) {
      setState(prev => ({
        ...prev,
        unlockedAchievements: [...prev.unlockedAchievements, ...newlyUnlocked.map(a => a.id)],
      }));
      setToastQueue(q => [...q, ...newlyUnlocked]);
    }
  }, [state.totalCompleted, state.bestStreak, state.meters, state.tasks, loaded]);

  // ---- Toast display loop ----
  useEffect(() => {
    if (toastQueue.length > 0 && !achievementToast) {
      const next = toastQueue[0];
      setAchievementToast(next);
      setToastQueue(q => q.slice(1));
      setTimeout(() => setAchievementToast(null), 3500);
    }
  }, [toastQueue, achievementToast]);

  // ---- Actions ----
  const completeTask = (taskId) => {
    setState(prev => {
      const task = prev.tasks.find(t => t.id === taskId);
      if (!task || task.completed) return prev;

      // Update meters (clamped to 100)
      const meters = {
        hunger: Math.min(MAX_METER, prev.meters.hunger + TASK_REWARD.hunger),
        happiness: Math.min(MAX_METER, prev.meters.happiness + TASK_REWARD.happiness),
        energy: Math.min(MAX_METER, prev.meters.energy + TASK_REWARD.energy),
      };

      // Detect revive (was sick, now not)
      const wasSick = moodFrom(prev.meters) === 'sick';
      const nowOk = moodFrom(meters) !== 'sick';
      const didRevive = prev.didRevive || (wasSick && nowOk);

      // Streak logic
      let streak = prev.streak;
      let bestStreak = prev.bestStreak;
      if (prev.lastCompletedDate !== todayStr()) {
        if (prev.lastCompletedDate && daysBetween(prev.lastCompletedDate, todayStr()) === 1) {
          streak = prev.streak + 1;
        } else {
          streak = 1;
        }
        if (streak > bestStreak) bestStreak = streak;
      }

      // Today's count + best day
      let todayCount = prev.todayCountDate === todayStr() ? prev.todayCount + 1 : 1;
      let bestDayCount = Math.max(prev.bestDayCount, todayCount);

      // History (last 30 days)
      const today = todayStr();
      let history = [...(prev.history || [])];
      const idx = history.findIndex(h => h.date === today);
      if (idx >= 0) {
        history[idx] = { ...history[idx], count: history[idx].count + 1 };
      } else {
        history.push({ date: today, count: 1 });
      }
      if (history.length > 30) history = history.slice(-30);

      const newTasks = prev.tasks.map(t =>
        t.id === taskId ? { ...t, completed: true, completedDate: today } : t
      );

      return {
        ...prev,
        meters,
        metersUpdatedAt: nowMs(),
        streak,
        bestStreak,
        lastCompletedDate: today,
        totalCompleted: prev.totalCompleted + 1,
        todayCount,
        todayCountDate: today,
        bestDayCount,
        tasks: newTasks,
        history,
        didRevive,
      };
    });

    // Pulse the meter bars briefly
    setFeedingPulse(true);
    setTimeout(() => setFeedingPulse(false), 700);
  };

  const addTask = () => {
    const text = newTaskText.trim();
    if (!text) return;
    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, {
        id: Date.now(),
        text,
        recurring: newTaskRecurring,
        completed: false,
        completedDate: null,
      }],
    }));
    setNewTaskText('');
    setNewTaskRecurring(false);
  };

  const deleteTask = (id) => {
    setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
  };

  const toggleRecurring = (id) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, recurring: !t.recurring } : t),
    }));
  };

  const savePetName = () => {
    const trimmed = nameDraft.trim().slice(0, 12);
    if (trimmed) setState(prev => ({ ...prev, petName: trimmed }));
    setEditingName(false);
  };

  if (!loaded) {
    return (
      <div className="boot-screen">
        <div>Loading...</div>
      </div>
    );
  }

  const mood = moodFrom(state.meters);
  const todayKey = todayStr();
  const visibleTasks = state.tasks; // all visible — completed one-shots are removed on next-day reset
  const todayTotal = visibleTasks.length;
  const todayDone = visibleTasks.filter(t => t.completed).length;

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&family=Press+Start+2P&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }

        :root {
          --lcd-bg: #8aa874;
          --lcd-bg-dark: #6a8a54;
          --lcd-edge: #4a6a38;
          --lcd-pixel: #1a2a1a;
          --shell: #d4d8c8;
          --shell-dark: #a8ad98;
          --shell-shadow: #7a8068;
          --shell-highlight: #f0f4e0;
          --accent: #c44848;
          --accent-dark: #8a2828;
          --text: #1a2a1a;
          --text-light: #4a5a3a;
        }

        .app {
          font-family: 'VT323', 'Courier New', monospace;
          max-width: 430px;
          margin: 0 auto;
          min-height: 100vh;
          background: var(--shell);
          color: var(--text);
          position: relative;
          padding-bottom: 70px;
          overflow: hidden;
          font-size: 18px;
        }
        .boot-screen {
          font-family: 'VT323', monospace;
          font-size: 22px;
          color: var(--text);
          background: var(--lcd-bg);
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pixel-font { font-family: 'Press Start 2P', monospace; }

        /* TOP NAME BAR */
        .name-bar {
          background: var(--shell-dark);
          padding: 10px 14px;
          border-bottom: 3px solid var(--shell-shadow);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }
        .pet-name {
          font-family: 'Press Start 2P', monospace;
          font-size: 12px;
          color: var(--text);
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 4px;
        }
        .pet-name:hover { background: rgba(0,0,0,0.05); }
        .pet-name .edit-hint { opacity: 0.4; font-size: 9px; margin-left: 4px; }
        .name-input {
          font-family: 'Press Start 2P', monospace;
          font-size: 12px;
          background: var(--lcd-bg);
          border: 2px solid var(--lcd-edge);
          padding: 3px 6px;
          color: var(--text);
          width: 130px;
          outline: none;
        }
        .streak-display {
          display: flex;
          align-items: center;
          gap: 4px;
          background: var(--lcd-bg);
          padding: 4px 10px;
          border: 2px solid var(--lcd-edge);
          font-family: 'Press Start 2P', monospace;
          font-size: 11px;
          color: var(--text);
        }
        .streak-display.zero { opacity: 0.4; }

        /* LCD SCREEN AREA */
        .lcd-frame {
          padding: 16px;
          background: var(--shell-dark);
        }
        .lcd-screen {
          background: var(--lcd-bg);
          border: 4px solid var(--lcd-edge);
          border-radius: 8px;
          padding: 14px;
          position: relative;
          box-shadow: inset 0 4px 0 rgba(0,0,0,0.15), inset 0 -2px 0 rgba(255,255,255,0.15);
        }
        .lcd-screen::before {
          content: '';
          position: absolute;
          inset: 4px;
          background: repeating-linear-gradient(0deg,
            transparent 0px, transparent 2px,
            rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 3px);
          pointer-events: none;
          border-radius: 4px;
        }
        .lcd-content {
          position: relative;
          z-index: 1;
        }

        /* PET STAGE */
        .pet-stage {
          display: flex;
          justify-content: center;
          padding: 20px 0 12px;
          min-height: 220px;
          align-items: center;
        }
        .pet-status {
          text-align: center;
          font-family: 'Press Start 2P', monospace;
          font-size: 9px;
          color: var(--text);
          margin-top: 8px;
          letter-spacing: 1px;
          text-transform: uppercase;
          opacity: 0.7;
        }
        .pet-status.alert {
          color: var(--accent-dark);
          opacity: 1;
          animation: alert-blink 1s steps(2) infinite;
        }
        @keyframes alert-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }

        /* METERS */
        .meters {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
          padding: 12px 4px 4px;
        }
        .meter {
          text-align: center;
        }
        .meter-label {
          font-family: 'Press Start 2P', monospace;
          font-size: 7px;
          letter-spacing: 1px;
          color: var(--text);
          margin-bottom: 4px;
        }
        .meter-bar {
          background: var(--lcd-bg-dark);
          border: 1.5px solid var(--lcd-edge);
          height: 10px;
          position: relative;
          overflow: hidden;
        }
        .meter-fill {
          background: var(--lcd-pixel);
          height: 100%;
          transition: width 0.4s cubic-bezier(0.5, 0, 0.5, 1);
        }
        .meter-bar.pulse .meter-fill {
          animation: meter-flash 0.5s steps(2);
        }
        @keyframes meter-flash {
          0%, 100% { background: var(--lcd-pixel); }
          50% { background: var(--accent); }
        }

        /* TODAY SUMMARY */
        .today-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 4px;
          font-family: 'Press Start 2P', monospace;
          font-size: 9px;
          color: var(--text);
          border-top: 1.5px dashed var(--lcd-edge);
          margin-top: 6px;
        }

        /* CONTENT (below LCD) */
        .content {
          padding: 14px 16px;
        }
        .section-title {
          font-family: 'Press Start 2P', monospace;
          font-size: 11px;
          color: var(--text);
          margin: 0 0 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        /* TASK CARDS */
        .task-card {
          background: var(--shell-highlight);
          border: 2px solid var(--shell-shadow);
          padding: 10px 12px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .task-card.done {
          opacity: 0.5;
        }
        .task-checkbox {
          width: 24px;
          height: 24px;
          border: 2.5px solid var(--text);
          background: var(--shell-highlight);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }
        .task-checkbox:active { transform: scale(0.92); }
        .task-checkbox.checked {
          background: var(--text);
        }
        .task-text {
          flex: 1;
          font-size: 18px;
          color: var(--text);
          line-height: 1.2;
        }
        .task-text.done { text-decoration: line-through; }
        .task-recurring {
          color: var(--text-light);
          flex-shrink: 0;
          opacity: 0.6;
          padding: 2px;
          border: none;
          background: none;
          cursor: pointer;
        }
        .task-recurring.active {
          color: var(--accent-dark);
          opacity: 1;
        }
        .task-delete {
          color: var(--text-light);
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
        }

        .empty {
          text-align: center;
          padding: 30px 20px;
          color: var(--text-light);
          font-size: 18px;
        }

        /* ADD TASK FORM */
        .add-form {
          background: var(--shell-highlight);
          border: 2px solid var(--shell-shadow);
          padding: 12px;
          margin-top: 12px;
        }
        .add-form input[type="text"] {
          width: 100%;
          padding: 10px;
          border: 2px solid var(--shell-shadow);
          background: white;
          font-family: 'VT323', monospace;
          font-size: 18px;
          color: var(--text);
          margin-bottom: 8px;
          outline: none;
        }
        .add-form input[type="text"]:focus { border-color: var(--text); }
        .recurring-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          color: var(--text);
          margin-bottom: 10px;
          cursor: pointer;
          user-select: none;
        }
        .recurring-toggle .checkbox {
          width: 18px;
          height: 18px;
          border: 2px solid var(--text);
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .recurring-toggle.active .checkbox { background: var(--text); }
        .add-btn {
          width: 100%;
          padding: 11px;
          background: var(--accent);
          color: white;
          border: 2px solid var(--accent-dark);
          font-family: 'Press Start 2P', monospace;
          font-size: 11px;
          cursor: pointer;
          letter-spacing: 1px;
        }
        .add-btn:active { transform: translateY(1px); }
        .add-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* STATS */
        .stat-card {
          background: var(--shell-highlight);
          border: 2px solid var(--shell-shadow);
          padding: 14px;
          margin-bottom: 10px;
        }
        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          font-size: 18px;
        }
        .stat-row + .stat-row { border-top: 1.5px dashed var(--shell-shadow); }
        .stat-label {
          font-family: 'Press Start 2P', monospace;
          font-size: 9px;
          color: var(--text);
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .stat-value {
          font-family: 'Press Start 2P', monospace;
          font-size: 14px;
          color: var(--accent-dark);
        }
        .chart {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 100px;
          padding: 8px 4px;
          margin-top: 8px;
          border-bottom: 2px solid var(--shell-shadow);
        }
        .chart-bar {
          flex: 1;
          background: var(--text);
          min-height: 2px;
          opacity: 0.6;
          transition: height 0.3s;
        }
        .chart-bar.today { background: var(--accent); opacity: 1; }
        .chart-bar.empty { background: var(--shell-shadow); opacity: 0.3; min-height: 2px; }
        .chart-caption {
          font-size: 13px;
          color: var(--text-light);
          text-align: center;
          margin-top: 4px;
          letter-spacing: 1px;
        }

        /* ACHIEVEMENTS */
        .achievement {
          background: var(--shell-highlight);
          border: 2px solid var(--shell-shadow);
          padding: 12px;
          margin-bottom: 8px;
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .achievement.locked {
          opacity: 0.45;
          background: var(--shell-dark);
        }
        .achievement-icon {
          width: 36px;
          height: 36px;
          background: var(--accent);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 2px solid var(--accent-dark);
        }
        .achievement.locked .achievement-icon {
          background: var(--shell-shadow);
          border-color: var(--text-light);
        }
        .achievement-text { flex: 1; }
        .achievement-name {
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          color: var(--text);
          margin-bottom: 4px;
          letter-spacing: 0.5px;
        }
        .achievement-desc {
          font-size: 15px;
          color: var(--text-light);
          line-height: 1.2;
        }

        /* TOAST */
        .achievement-toast {
          position: fixed;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--text);
          color: var(--shell-highlight);
          border: 3px solid var(--accent);
          padding: 10px 14px;
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: toast-in 0.3s ease-out, toast-out 0.3s ease-in 3.2s forwards;
          max-width: 380px;
          width: calc(100% - 32px);
        }
        @keyframes toast-in {
          from { transform: translate(-50%, -60px); }
          to { transform: translate(-50%, 0); }
        }
        @keyframes toast-out {
          to { transform: translate(-50%, -60px); opacity: 0; }
        }
        .toast-name {
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          margin-bottom: 2px;
          letter-spacing: 1px;
        }
        .toast-desc { font-size: 14px; opacity: 0.8; }

        /* BOTTOM NAV */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 430px;
          background: var(--shell-dark);
          border-top: 3px solid var(--shell-shadow);
          display: flex;
          z-index: 100;
        }
        .nav-btn {
          flex: 1;
          background: none;
          border: none;
          padding: 10px 4px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          color: var(--text-light);
          cursor: pointer;
          font-family: 'Press Start 2P', monospace;
          font-size: 8px;
          letter-spacing: 1px;
          text-transform: uppercase;
          border-top: 3px solid transparent;
        }
        .nav-btn.active {
          color: var(--text);
          border-top-color: var(--accent);
          background: var(--shell);
        }
      `}</style>

      {/* TOP NAME BAR */}
      <div className="name-bar">
        {editingName ? (
          <input
            className="name-input"
            type="text"
            value={nameDraft}
            autoFocus
            maxLength={12}
            onChange={e => setNameDraft(e.target.value)}
            onBlur={savePetName}
            onKeyDown={e => {
              if (e.key === 'Enter') savePetName();
              if (e.key === 'Escape') setEditingName(false);
            }}
          />
        ) : (
          <div
            className="pet-name"
            onClick={() => { setNameDraft(state.petName); setEditingName(true); }}
          >
            {state.petName}<span className="edit-hint">✎</span>
          </div>
        )}
        <div className={`streak-display ${state.streak === 0 ? 'zero' : ''}`}>
          <Flame size={12} /> {state.streak}
        </div>
      </div>

      {/* LCD SCREEN — only shown on home */}
      {view === 'home' && (
        <div className="lcd-frame">
          <div className="lcd-screen">
            <div className="lcd-content">
              <div className="pet-stage">
                <PetSprite mood={mood} frame={animFrame} size={220} />
              </div>
              <div className={`pet-status ${mood === 'sick' ? 'alert' : ''}`}>
                {mood === 'happy' && '♥ Feeling Great ♥'}
                {mood === 'neutral' && '... ok ...'}
                {mood === 'sad' && '~ needs care ~'}
                {mood === 'sick' && '! ! ! sick ! ! !'}
              </div>
              <div className="meters">
                <div className="meter">
                  <div className="meter-label">FOOD</div>
                  <div className={`meter-bar ${feedingPulse ? 'pulse' : ''}`}>
                    <div className="meter-fill" style={{ width: `${state.meters.hunger}%` }} />
                  </div>
                </div>
                <div className="meter">
                  <div className="meter-label">FUN</div>
                  <div className={`meter-bar ${feedingPulse ? 'pulse' : ''}`}>
                    <div className="meter-fill" style={{ width: `${state.meters.happiness}%` }} />
                  </div>
                </div>
                <div className="meter">
                  <div className="meter-label">ENERGY</div>
                  <div className={`meter-bar ${feedingPulse ? 'pulse' : ''}`}>
                    <div className="meter-fill" style={{ width: `${state.meters.energy}%` }} />
                  </div>
                </div>
              </div>
              <div className="today-line">
                <span>TODAY</span>
                <span>{todayDone} / {todayTotal}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="content">
        {view === 'home' && (
          <>
            <h2 className="section-title"><Heart size={14} /> Today's Tasks</h2>
            {visibleTasks.length === 0 ? (
              <div className="empty">No tasks. Tap <strong>Tasks</strong> below to add some.</div>
            ) : (
              visibleTasks.map(t => (
                <div key={t.id} className={`task-card ${t.completed ? 'done' : ''}`}>
                  <div
                    className={`task-checkbox ${t.completed ? 'checked' : ''}`}
                    onClick={() => !t.completed && completeTask(t.id)}
                  >
                    {t.completed && <Check size={16} color="white" strokeWidth={3.5} />}
                  </div>
                  <span className={`task-text ${t.completed ? 'done' : ''}`}>{t.text}</span>
                  {t.recurring && <RotateCw size={14} className="task-recurring active" title="Recurring" />}
                </div>
              ))
            )}
          </>
        )}

        {view === 'tasks' && (
          <>
            <h2 className="section-title"><ListTodo size={14} /> Manage Tasks</h2>
            {state.tasks.length === 0 && (
              <div className="empty">No tasks yet — add your first below.</div>
            )}
            {state.tasks.map(t => (
              <div key={t.id} className="task-card">
                <span className="task-text">{t.text}</span>
                <button
                  className={`task-recurring ${t.recurring ? 'active' : ''}`}
                  onClick={() => toggleRecurring(t.id)}
                  title={t.recurring ? 'Recurring (resets daily)' : 'One-shot'}
                >
                  <RotateCw size={16} />
                </button>
                <button className="task-delete" onClick={() => deleteTask(t.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <div className="add-form">
              <input
                type="text"
                placeholder="Drink water"
                value={newTaskText}
                onChange={e => setNewTaskText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTask()}
              />
              <div
                className={`recurring-toggle ${newTaskRecurring ? 'active' : ''}`}
                onClick={() => setNewTaskRecurring(r => !r)}
              >
                <div className="checkbox">
                  {newTaskRecurring && <Check size={12} color="white" strokeWidth={3.5} />}
                </div>
                <RotateCw size={14} /> Repeat daily
              </div>
              <button className="add-btn" onClick={addTask} disabled={!newTaskText.trim()}>
                <Plus size={12} style={{ verticalAlign: 'middle' }} /> ADD TASK
              </button>
            </div>
          </>
        )}

        {view === 'stats' && (
          <>
            <h2 className="section-title"><BarChart3 size={14} /> Stats</h2>
            <div className="stat-card">
              <div className="stat-row">
                <span className="stat-label">Current Streak</span>
                <span className="stat-value">{state.streak}d</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Best Streak</span>
                <span className="stat-value">{state.bestStreak}d</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Total Done</span>
                <span className="stat-value">{state.totalCompleted}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Best Day</span>
                <span className="stat-value">{state.bestDayCount}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Today</span>
                <span className="stat-value">{state.todayCount}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label" style={{ marginBottom: 8 }}>Last 30 Days</div>
              <Last30Chart history={state.history} today={todayKey} />
            </div>
          </>
        )}

        {view === 'achievements' && (
          <>
            <h2 className="section-title">
              <Award size={14} /> Achievements
              <span style={{ marginLeft: 'auto', fontFamily: "'Press Start 2P'", fontSize: 9 }}>
                {state.unlockedAchievements.length}/{ACHIEVEMENTS.length}
              </span>
            </h2>
            {ACHIEVEMENTS.map(a => {
              const unlocked = state.unlockedAchievements.includes(a.id);
              return (
                <div key={a.id} className={`achievement ${unlocked ? '' : 'locked'}`}>
                  <div className="achievement-icon">
                    {unlocked ? <Trophy size={18} /> : '?'}
                  </div>
                  <div className="achievement-text">
                    <div className="achievement-name">{unlocked ? a.name : '???'}</div>
                    <div className="achievement-desc">{unlocked ? a.desc : 'Locked'}</div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* ACHIEVEMENT TOAST */}
      {achievementToast && (
        <div className="achievement-toast">
          <Trophy size={22} color="#ffd700" />
          <div>
            <div className="toast-name">{achievementToast.name}</div>
            <div className="toast-desc">{achievementToast.desc}</div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div className="bottom-nav">
        <button className={`nav-btn ${view === 'home' ? 'active' : ''}`} onClick={() => setView('home')}>
          <Heart size={18} /> Pet
        </button>
        <button className={`nav-btn ${view === 'tasks' ? 'active' : ''}`} onClick={() => setView('tasks')}>
          <ListTodo size={18} /> Tasks
        </button>
        <button className={`nav-btn ${view === 'stats' ? 'active' : ''}`} onClick={() => setView('stats')}>
          <BarChart3 size={18} /> Stats
        </button>
        <button className={`nav-btn ${view === 'achievements' ? 'active' : ''}`} onClick={() => setView('achievements')}>
          <Award size={18} /> Awards
        </button>
      </div>
    </div>
  );
}

// ---- 30-day chart ----
const Last30Chart = ({ history, today }) => {
  // Build 30-day window ending today
  const days = [];
  const now = new Date(today + 'T00:00:00');
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${day}`;
    const entry = history.find(h => h.date === key);
    days.push({ date: key, count: entry ? entry.count : 0 });
  }
  const max = Math.max(1, ...days.map(d => d.count));
  return (
    <>
      <div className="chart">
        {days.map((d, i) => {
          const isToday = d.date === today;
          const pct = (d.count / max) * 100;
          return (
            <div
              key={d.date}
              className={`chart-bar ${d.count === 0 ? 'empty' : ''} ${isToday ? 'today' : ''}`}
              style={{ height: `${Math.max(2, pct)}%` }}
              title={`${d.date}: ${d.count}`}
            />
          );
        })}
      </div>
      <div className="chart-caption">30 days ago → today</div>
    </>
  );
};
