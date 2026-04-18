import React, { useState, useEffect, useRef } from 'react';
import { Plus, Check, X, Coins, Sparkles, ShoppingBag, ListTodo, Heart, Trash2, Star, BookOpen, Lock } from 'lucide-react';

// ===== EVOLUTION STAGES =====
const STAGES = [
  { name: 'Baby Spore',    minLevel: 1,  emoji: '🌱' },
  { name: 'Orange Mushroom', minLevel: 5,  emoji: '🍄' },
  { name: 'Horned Mushroom', minLevel: 12, emoji: '👹' },
  { name: 'Mushmom',         minLevel: 20, emoji: '👑' },
];

const getStageIndex = (level) => {
  let idx = 0;
  for (let i = 0; i < STAGES.length; i++) {
    if (level >= STAGES[i].minLevel) idx = i;
  }
  return idx;
};

const xpForLevel = (lvl) => 50 + (lvl - 1) * 25;

// ===== SHOP ITEMS =====
// Hats marked with `custom: true` have hand-drawn SVG renderers in the Mushroom component.
// Other hats render as emoji floating above the cap.
const SHOP = {
  hats: [
    // Cheap (50-150 mesos) — starter cosmetics
    { id: 'bandana',   name: 'Red Bandana',     price: 80,   emoji: '🎀', custom: true },
    { id: 'cap',       name: 'Baseball Cap',    price: 60,   emoji: '🧢' },
    { id: 'beanie',    name: 'Wool Beanie',     price: 120,  emoji: '🪖' },
    { id: 'flower',    name: 'Flower Crown',    price: 150,  emoji: '🌸' },
    // Mid-tier (200-500 mesos)
    { id: 'wizard',    name: 'Wizard Hat',      price: 250,  emoji: '🧙', custom: true },
    { id: 'straw',     name: 'Straw Hat',       price: 280,  emoji: '👒' },
    { id: 'graduate',  name: 'Graduation Cap',  price: 350,  emoji: '🎓' },
    { id: 'headphones',name: 'Headphones',      price: 400,  emoji: '🎧', custom: true },
    { id: 'cowboy',    name: 'Cowboy Hat',      price: 450,  emoji: '🤠' },
    { id: 'top',       name: 'Top Hat',         price: 500,  emoji: '🎩' },
    // Premium (600-1500 mesos)
    { id: 'helmet',    name: 'Steel Helmet',    price: 650,  emoji: '⛑️' },
    { id: 'crown',     name: 'Royal Crown',     price: 800,  emoji: '👑', custom: true },
    { id: 'santa',     name: 'Santa Hat',       price: 900,  emoji: '🎅' },
    { id: 'ninja',     name: 'Ninja Hood',      price: 1100, emoji: '🥷' },
    { id: 'halo',      name: 'Angel Halo',      price: 1500, emoji: '😇' },
  ],
  backgrounds: [
    // Starter (default + cheap)
    { id: 'henesys',   name: 'Henesys Meadow',   price: 0,    colors: ['#ffe9b3', '#a8e6a3'] },
    { id: 'sunset',    name: 'Sunset Field',     price: 100,  colors: ['#ffb88a', '#ff7a5a'] },
    { id: 'sakura',    name: 'Sakura Grove',     price: 200,  colors: ['#ffd6e8', '#ff9ec4'] },
    // Mid-tier
    { id: 'ellinia',   name: 'Ellinia Forest',   price: 300,  colors: ['#bde4c8', '#5d9968'] },
    { id: 'autumn',    name: 'Autumn Hills',     price: 400,  colors: ['#ffd49a', '#d97a3a'] },
    { id: 'ludibrium', name: 'Ludibrium Sky',    price: 500,  colors: ['#ffd3e8', '#a8c5ff'] },
    { id: 'aqua',      name: 'Aquarium Depths',  price: 700,  colors: ['#a3e0ff', '#3d6a99'] },
    // Premium
    { id: 'snowy',     name: 'Snowy Peak',       price: 850,  colors: ['#e8f4ff', '#a8c8e8'] },
    { id: 'nightsky',  name: 'Starry Night',     price: 1000, colors: ['#3a3a7a', '#0a0a3a'] },
    { id: 'lava',      name: 'Lava Cave',        price: 1300, colors: ['#ffaa3a', '#8a1a0a'] },
    { id: 'rainbow',   name: 'Rainbow Falls',    price: 1800, colors: ['#ffd6e8', '#a8e6ff'] },
  ],
  furniture: [
    // Cheap utility
    { id: 'snack',   name: 'Snack Bowl',     price: 60,   emoji: '🍱', size: 55 },
    { id: 'plant',   name: 'Potted Plant',   price: 90,   emoji: '🪴', size: 70 },
    { id: 'bed',     name: 'Cozy Bed',       price: 100,  emoji: '🛏️', size: 140 },
    { id: 'rug',     name: 'Floor Rug',      price: 130,  emoji: '🟦', size: 90 },
    // Mid
    { id: 'cake',    name: 'Birthday Cake',  price: 180,  emoji: '🎂', size: 60 },
    { id: 'lantern', name: 'Paper Lantern',  price: 200,  emoji: '🏮', size: 75 },
    { id: 'guitar',  name: 'Acoustic Guitar',price: 240,  emoji: '🎸', size: 80 },
    { id: 'lamp',    name: 'Floor Lamp',     price: 280,  emoji: '🪔', size: 70 },
    { id: 'books',   name: 'Bookshelf',      price: 320,  emoji: '📚', size: 70 },
    { id: 'trophy',  name: 'Trophy Shelf',   price: 350,  emoji: '🏆', size: 65 },
    // Premium
    { id: 'piano',   name: 'Grand Piano',    price: 600,  emoji: '🎹', size: 100 },
    { id: 'tv',      name: 'Game Console',   price: 750,  emoji: '🎮', size: 70 },
    { id: 'cauldron',name: 'Magic Cauldron', price: 950,  emoji: '⚗️', size: 75 },
    { id: 'clock',   name: 'Grandfather Clock',price: 1200, emoji: '🕰️', size: 90 },
  ],
  companions: [
    // Cheap critters
    { id: 'snail',    name: 'Lil Snail',       price: 120, emoji: '🐌' },
    { id: 'bunny',    name: 'Bouncy Bunny',    price: 180, emoji: '🐰' },
    { id: 'chick',    name: 'Baby Chick',      price: 220, emoji: '🐥' },
    // Mid
    { id: 'slime',    name: 'Slime Friend',    price: 300, emoji: '💧' },
    { id: 'frog',     name: 'Forest Frog',     price: 360, emoji: '🐸' },
    { id: 'fox',      name: 'Fluffy Fox',      price: 420, emoji: '🦊' },
    { id: 'pig',      name: 'Pink Pig',        price: 450, emoji: '🐷' },
    { id: 'cat',      name: 'Tabby Cat',       price: 500, emoji: '🐈' },
    { id: 'octopus',  name: 'Tiny Octopus',    price: 600, emoji: '🐙' },
    // Premium
    { id: 'penguin',  name: 'Royal Penguin',   price: 750, emoji: '🐧' },
    { id: 'unicorn',  name: 'Pixel Unicorn',   price: 1100,emoji: '🦄' },
    { id: 'dragon',   name: 'Mini Dragon',     price: 1500,emoji: '🐉' },
    { id: 'phoenix',  name: 'Phoenix Chick',   price: 2000,emoji: '🔥' },
  ],
};

const todayStr = () => new Date().toISOString().split('T')[0];
const daysBetween = (a, b) => Math.floor((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));

// ===== MUSHROOM (smooth SVG, evolves through 4 stages) =====
// Each stage palette: cap, capDark, capLight, spot, body, bodyShade, outline,
// horn, hornDark, crown, accent
const STAGE_PALETTES = [
  // Baby Spore — peach, with leaf sprout
  { cap: '#ffb074', capLight: '#ffd1a0', capDark: '#c87838', capRim: '#a85820',
    spot: '#fff4e0', body: '#fff5dc', bodyShade: '#e8d4a8', outline: '#5a3018',
    cheek: '#ffa3a3', leaf: '#7ab368', leafDark: '#4a7838' },
  // Orange Mushroom — classic Maple orange
  { cap: '#ff7a3d', capLight: '#ffaa7a', capDark: '#c84818', capRim: '#8a2a08',
    spot: '#ffffff', body: '#fff0d4', bodyShade: '#e0c898', outline: '#3a1810',
    cheek: '#ff8585' },
  // Horned Mushroom — purple with horns
  { cap: '#a85cff', capLight: '#c490ff', capDark: '#7028b0', capRim: '#481890',
    spot: '#fff0ff', body: '#fff4dc', bodyShade: '#e0c898', outline: '#2a0a48',
    cheek: '#ff8585', horn: '#5818a8', hornDark: '#2a0858' },
  // Mushmom — dark royal, regal
  { cap: '#7838c4', capLight: '#a05ce0', capDark: '#4a1f80', capRim: '#2a0a48',
    spot: '#ffe070', body: '#ffe6c4', bodyShade: '#d8b888', outline: '#1a0a2a',
    cheek: '#ff8585', horn: '#3a1f5e', hornDark: '#1a0428',
    crown: '#ffd700', crownDark: '#a87800', jewel: '#e63946' },
];

// Where the top-center of the head sits in the SVG, per stage.
// hatX/hatY = where the BOTTOM-CENTER of the hat anchors. capWidth = how wide head is.
const HAT_ANCHORS = [
  { hatX: 50, hatY: 38, capWidth: 38, scale: 0.6 },  // baby spore — small head, hat sits on top
  { hatX: 50, hatY: 22, capWidth: 64, scale: 1.0 },  // orange — big cap top at y=20
  { hatX: 50, hatY: 22, capWidth: 64, scale: 1.0 },  // horned
  { hatX: 50, hatY: 22, capWidth: 72, scale: 1.15 }, // mushmom — widest cap
];

const Mushroom = ({ stage, mood, hat, facing = 'right' }) => {
  const p = STAGE_PALETTES[stage];
  const a = HAT_ANCHORS[stage];
  const isSad = mood === 'sad';
  const isHappy = mood === 'happy';
  const displaySize = stage === 0 ? 100 : stage === 1 ? 130 : stage === 2 ? 155 : 180;
  // Unique gradient IDs per stage so multiple mushrooms (e.g. wiki) don't clash
  const gid = `g-${stage}`;

  // === Stage-specific body/cap rendering ===
  const renderStage = () => {
    if (stage === 0) {
      // Baby spore — small rounded body with a leaf sprout
      return (
        <g>
          {/* leaf sprout */}
          <path d="M 50 30 Q 48 20 44 18 Q 47 23 49 30 Z" fill={p.leaf} stroke={p.leafDark} strokeWidth="0.8"/>
          <path d="M 50 30 Q 52 20 56 18 Q 53 23 51 30 Z" fill={p.leaf} stroke={p.leafDark} strokeWidth="0.8"/>
          <path d="M 50 32 L 50 38" stroke={p.leafDark} strokeWidth="1.5" strokeLinecap="round"/>
          {/* body — peachy sphere with subtle highlight only (no dark shadow on face) */}
          <ellipse cx="50" cy="60" rx="22" ry="22" fill={p.cap} stroke={p.outline} strokeWidth="2"/>
          <ellipse cx="42" cy="50" rx="9" ry="7" fill={p.capLight} opacity="0.6"/>
          {/* subtle bottom-right rim shading (not on face) */}
          <path d="M 68 65 Q 72 75 60 80" stroke={p.capDark} strokeWidth="3" fill="none" opacity="0.3" strokeLinecap="round"/>
          {/* cheeks */}
          <ellipse cx="38" cy="64" rx="3.5" ry="2.5" fill={p.cheek} opacity="0.7"/>
          <ellipse cx="62" cy="64" rx="3.5" ry="2.5" fill={p.cheek} opacity="0.7"/>
        </g>
      );
    }
    if (stage === 1) {
      // Orange mushroom — big rounded cap sitting flush on stubby body
      return (
        <g>
          <defs>
            <radialGradient id={gid} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor={p.capLight}/>
              <stop offset="60%" stopColor={p.cap}/>
              <stop offset="100%" stopColor={p.capDark}/>
            </radialGradient>
          </defs>
          {/* body (stem) — extended UP to y=56 so cap sits flush on it */}
          <path d="M 32 60 Q 32 92 50 92 Q 68 92 68 60 Z"
            fill={p.body} stroke={p.outline} strokeWidth="2"/>
          {/* soft side shading on body (left and right, not bottom) */}
          <path d="M 32 62 Q 30 78 36 90" fill="none" stroke={p.bodyShade} strokeWidth="2.5" opacity="0.5"/>
          <path d="M 68 62 Q 70 78 64 90" fill="none" stroke={p.bodyShade} strokeWidth="2.5" opacity="0.5"/>
          {/* cap — drawn AFTER body so it overlaps and sits on top */}
          <path d="M 14 58 Q 14 20 50 18 Q 86 20 86 58 Q 82 64 50 64 Q 18 64 14 58 Z"
            fill={`url(#${gid})`} stroke={p.outline} strokeWidth="2"/>
          {/* cap rim shadow — under the cap, ABOVE the body */}
          <path d="M 16 58 Q 50 66 84 58 Q 82 64 50 64 Q 18 64 16 58 Z" fill={p.capRim} opacity="0.55"/>
          {/* cap highlight */}
          <ellipse cx="38" cy="30" rx="9" ry="4" fill={p.capLight} opacity="0.6"/>
          {/* white spots */}
          <ellipse cx="32" cy="40" rx="6" ry="5" fill={p.spot} stroke={p.capDark} strokeWidth="0.8"/>
          <ellipse cx="64" cy="35" rx="7" ry="6" fill={p.spot} stroke={p.capDark} strokeWidth="0.8"/>
          <ellipse cx="50" cy="50" rx="4.5" ry="3.5" fill={p.spot} stroke={p.capDark} strokeWidth="0.8"/>
          {/* cheeks */}
          <ellipse cx="36" cy="80" rx="3" ry="2.2" fill={p.cheek} opacity="0.7"/>
          <ellipse cx="64" cy="80" rx="3" ry="2.2" fill={p.cheek} opacity="0.7"/>
        </g>
      );
    }
    if (stage === 2) {
      // Horned mushroom — purple cap with two big horns
      return (
        <g>
          <defs>
            <radialGradient id={gid} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor={p.capLight}/>
              <stop offset="60%" stopColor={p.cap}/>
              <stop offset="100%" stopColor={p.capDark}/>
            </radialGradient>
          </defs>
          {/* horns */}
          <path d="M 22 40 L 14 14 L 30 32 Z" fill={p.horn} stroke={p.hornDark} strokeWidth="1.5"/>
          <path d="M 78 40 L 86 14 L 70 32 Z" fill={p.horn} stroke={p.hornDark} strokeWidth="1.5"/>
          <path d="M 22 40 L 18 22 L 26 34 Z" fill={p.hornDark} opacity="0.5"/>
          <path d="M 78 40 L 82 22 L 74 34 Z" fill={p.hornDark} opacity="0.5"/>
          {/* body — extended UP to overlap cap */}
          <path d="M 30 62 Q 30 92 50 92 Q 70 92 70 62 Z"
            fill={p.body} stroke={p.outline} strokeWidth="2"/>
          {/* side shading on body */}
          <path d="M 30 64 Q 28 80 34 90" fill="none" stroke={p.bodyShade} strokeWidth="2.5" opacity="0.5"/>
          <path d="M 70 64 Q 72 80 66 90" fill="none" stroke={p.bodyShade} strokeWidth="2.5" opacity="0.5"/>
          {/* cap — drawn after body, extends down to overlap */}
          <path d="M 12 60 Q 12 22 50 20 Q 88 22 88 60 Q 82 66 50 66 Q 18 66 12 60 Z"
            fill={`url(#${gid})`} stroke={p.outline} strokeWidth="2"/>
          <path d="M 14 60 Q 50 68 86 60 Q 82 66 50 66 Q 18 66 14 60 Z" fill={p.capRim} opacity="0.55"/>
          <ellipse cx="36" cy="30" rx="9" ry="4" fill={p.capLight} opacity="0.6"/>
          {/* spots */}
          <ellipse cx="30" cy="42" rx="5" ry="4" fill={p.spot} stroke={p.capDark} strokeWidth="0.8"/>
          <ellipse cx="66" cy="38" rx="6" ry="5" fill={p.spot} stroke={p.capDark} strokeWidth="0.8"/>
          <ellipse cx="50" cy="52" rx="4" ry="3" fill={p.spot} stroke={p.capDark} strokeWidth="0.8"/>
          {/* angry brow lines */}
          <path d="M 36 68 L 42 70" stroke={p.outline} strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M 64 68 L 58 70" stroke={p.outline} strokeWidth="1.8" strokeLinecap="round"/>
          {/* cheeks */}
          <ellipse cx="36" cy="82" rx="3" ry="2.2" fill={p.cheek} opacity="0.7"/>
          <ellipse cx="64" cy="82" rx="3" ry="2.2" fill={p.cheek} opacity="0.7"/>
        </g>
      );
    }
    // Stage 3: Mushmom — bigger, regal, gold tiara built in
    return (
      <g>
        <defs>
          <radialGradient id={gid} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor={p.capLight}/>
            <stop offset="60%" stopColor={p.cap}/>
            <stop offset="100%" stopColor={p.capDark}/>
          </radialGradient>
        </defs>
        {/* horns */}
        <path d="M 18 38 L 8 8 L 28 30 Z" fill={p.horn} stroke={p.hornDark} strokeWidth="1.5"/>
        <path d="M 82 38 L 92 8 L 72 30 Z" fill={p.horn} stroke={p.hornDark} strokeWidth="1.5"/>
        {/* body — extended UP so cap sits flush */}
        <path d="M 28 62 Q 28 94 50 94 Q 72 94 72 62 Z"
          fill={p.body} stroke={p.outline} strokeWidth="2"/>
        {/* side shading on body */}
        <path d="M 28 64 Q 26 80 32 92" fill="none" stroke={p.bodyShade} strokeWidth="2.5" opacity="0.5"/>
        <path d="M 72 64 Q 74 80 68 92" fill="none" stroke={p.bodyShade} strokeWidth="2.5" opacity="0.5"/>
        {/* cap — drawn after body */}
        <path d="M 10 60 Q 10 22 50 20 Q 90 22 90 60 Q 84 66 50 66 Q 16 66 10 60 Z"
          fill={`url(#${gid})`} stroke={p.outline} strokeWidth="2"/>
        <path d="M 12 60 Q 50 68 88 60 Q 84 66 50 66 Q 16 66 12 60 Z" fill={p.capRim} opacity="0.55"/>
        <ellipse cx="36" cy="30" rx="10" ry="4" fill={p.capLight} opacity="0.6"/>
        {/* gold spots */}
        <ellipse cx="28" cy="42" rx="5" ry="4" fill={p.spot} stroke={p.capDark} strokeWidth="0.8"/>
        <ellipse cx="70" cy="38" rx="6" ry="5" fill={p.spot} stroke={p.capDark} strokeWidth="0.8"/>
        <ellipse cx="50" cy="52" rx="5" ry="3.5" fill={p.spot} stroke={p.capDark} strokeWidth="0.8"/>
        {/* built-in tiara on the cap */}
        <path d="M 38 26 L 41 18 L 44 24 L 50 14 L 56 24 L 59 18 L 62 26 Z"
          fill={p.crown} stroke={p.crownDark} strokeWidth="1"/>
        <circle cx="50" cy="20" r="2" fill={p.jewel} stroke={p.crownDark} strokeWidth="0.5"/>
        <circle cx="42" cy="22" r="1.2" fill="#3a86ff"/>
        <circle cx="58" cy="22" r="1.2" fill="#06d6a0"/>
        {/* lashes / brow */}
        <path d="M 34 70 L 40 72" stroke={p.outline} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M 66 70 L 60 72" stroke={p.outline} strokeWidth="1.5" strokeLinecap="round"/>
        {/* cheeks */}
        <ellipse cx="34" cy="84" rx="3" ry="2.2" fill={p.cheek} opacity="0.7"/>
        <ellipse cx="66" cy="84" rx="3" ry="2.2" fill={p.cheek} opacity="0.7"/>
      </g>
    );
  };

  // === Face: eyes + mouth, drawn on top ===
  // Position depends on stage (face center)
  const faceY = stage === 0 ? 60 : stage === 1 ? 78 : stage === 2 ? 78 : 80;
  const eyeSpacing = stage === 0 ? 8 : stage === 1 ? 10 : stage === 2 ? 11 : 13;

  const renderFace = () => (
    <g>
      {/* Eyes */}
      {isHappy ? (
        // ^^ shaped happy eyes
        <>
          <path d={`M ${50 - eyeSpacing - 2} ${faceY - 1} Q ${50 - eyeSpacing} ${faceY - 5} ${50 - eyeSpacing + 2} ${faceY - 1}`}
            stroke={p.outline} strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d={`M ${50 + eyeSpacing - 2} ${faceY - 1} Q ${50 + eyeSpacing} ${faceY - 5} ${50 + eyeSpacing + 2} ${faceY - 1}`}
            stroke={p.outline} strokeWidth="2" fill="none" strokeLinecap="round"/>
        </>
      ) : (
        // Round eyes with white highlight
        <>
          <ellipse cx={50 - eyeSpacing} cy={faceY - 2} rx="2.8" ry="3.5" fill={p.outline}/>
          <ellipse cx={50 + eyeSpacing} cy={faceY - 2} rx="2.8" ry="3.5" fill={p.outline}/>
          <circle cx={50 - eyeSpacing + 0.8} cy={faceY - 3} r="0.9" fill="white"/>
          <circle cx={50 + eyeSpacing + 0.8} cy={faceY - 3} r="0.9" fill="white"/>
        </>
      )}
      {/* Mouth */}
      {isSad ? (
        // Frown
        <path d={`M ${50 - 5} ${faceY + 7} Q 50 ${faceY + 3} ${50 + 5} ${faceY + 7}`}
          stroke={p.outline} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      ) : isHappy ? (
        // Big open smile
        <path d={`M ${50 - 6} ${faceY + 4} Q 50 ${faceY + 11} ${50 + 6} ${faceY + 4} Q 50 ${faceY + 7} ${50 - 6} ${faceY + 4} Z`}
          fill="#c44848" stroke={p.outline} strokeWidth="1.5"/>
      ) : (
        // Neutral small smile
        <path d={`M ${50 - 5} ${faceY + 5} Q 50 ${faceY + 8} ${50 + 5} ${faceY + 5}`}
          stroke={p.outline} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      )}
      {/* Sad tear */}
      {isSad && (
        <path d={`M ${50 - eyeSpacing - 1} ${faceY + 1} Q ${50 - eyeSpacing - 2} ${faceY + 5} ${50 - eyeSpacing + 0.5} ${faceY + 4} Z`}
          fill="#5ec3ff" stroke="#3a8ec4" strokeWidth="0.6"/>
      )}
      {/* Happy sparkles */}
      {isHappy && (
        <g>
          <text x="14" y="30" fontSize="10" fill="#ffd700">✦</text>
          <text x="80" y="38" fontSize="10" fill="#ffd700">✦</text>
          <text x="84" y="68" fontSize="8" fill="#ffd700">✦</text>
          <text x="10" y="70" fontSize="8" fill="#ffd700">✦</text>
        </g>
      )}
    </g>
  );

  // === HATS — sit naturally on the cap, drawn relative to anchor ===
  const renderHat = () => {
    if (!hat) return null;
    const cx = a.hatX;
    const by = a.hatY; // "bottom" of hat sits at this y
    const w = a.capWidth;

    if (hat === 'bandana') {
      // Wraps around forehead/cap. Curves down at the sides.
      return (
        <g transform={`translate(${cx} ${by}) scale(${a.scale})`}>
          {/* base band — follows cap curve */}
          <path d={`M ${-w/2 + 4} 0 Q 0 -8 ${w/2 - 4} 0 L ${w/2 - 4} 5 Q 0 -2 ${-w/2 + 4} 5 Z`}
            fill="#e63946" stroke="#7a0a18" strokeWidth="1.5"/>
          {/* highlight */}
          <path d={`M ${-w/2 + 4} -1 Q 0 -7 ${w/2 - 4} -1`}
            stroke="#ff8a93" strokeWidth="1" fill="none" opacity="0.7"/>
          {/* polka dots */}
          <circle cx={-w/4} cy="-1" r="1.5" fill="white"/>
          <circle cx="0" cy="-3" r="1.8" fill="white"/>
          <circle cx={w/4} cy="-1" r="1.5" fill="white"/>
          {/* knot tail flowing right */}
          <path d={`M ${w/2 - 5} -2 L ${w/2 + 6} -8 L ${w/2 + 10} -2 L ${w/2 + 6} 4 L ${w/2 - 4} 5 Z`}
            fill="#e63946" stroke="#7a0a18" strokeWidth="1.5"/>
          <path d={`M ${w/2 + 6} -8 L ${w/2 + 6} 4`}
            stroke="#7a0a18" strokeWidth="0.8" fill="none"/>
        </g>
      );
    }
    if (hat === 'wizard') {
      // Tall pointy purple cone with brim, gold star, slight tilt for character
      return (
        <g transform={`translate(${cx} ${by}) scale(${a.scale})`}>
          <defs>
            <linearGradient id={`wiz-${stage}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5a30a0"/>
              <stop offset="50%" stopColor="#3a1f5e"/>
              <stop offset="100%" stopColor="#1a0838"/>
            </linearGradient>
          </defs>
          {/* brim — wide flat */}
          <ellipse cx="0" cy="0" rx={w/2 + 4} ry="3" fill="#1a0838" stroke="#0a0218" strokeWidth="1.2"/>
          <ellipse cx="0" cy="-1" rx={w/2 + 3} ry="2" fill="#3a1f5e"/>
          {/* tall cone, slightly tilted right at the tip for character */}
          <path d={`M ${-w/2 + 6} -2 Q ${-w/2 + 10} -8 ${-w/4} -16 Q -2 -28 4 -38 L 7 -42 L 5 -36 Q 8 -22 ${w/4 + 2} -10 Q ${w/2 - 2} -4 ${w/2 - 6} -2 Z`}
            fill={`url(#wiz-${stage})`} stroke="#0a0218" strokeWidth="1.5"/>
          {/* fold/shadow line down the middle */}
          <path d={`M -2 -2 Q 0 -16 4 -36`} stroke="#1a0838" strokeWidth="1" fill="none" opacity="0.7"/>
          {/* gold star */}
          <path d="M 0 -16 L 1.5 -12 L 6 -12 L 2.5 -9 L 4 -5 L 0 -7.5 L -4 -5 L -2.5 -9 L -6 -12 L -1.5 -12 Z"
            fill="#ffd700" stroke="#a87800" strokeWidth="0.6"/>
          {/* tip glint */}
          <circle cx="6" cy="-40" r="1.2" fill="#ffeb6e"/>
        </g>
      );
    }
    if (hat === 'headphones') {
      // Headband ARCHES OVER the cap, with red ear cups straddling the sides
      return (
        <g transform={`translate(${cx} ${by}) scale(${a.scale})`}>
          {/* headband arc — drawn ABOVE the cap */}
          <path d={`M ${-w/2 - 1} 4 Q ${-w/2 - 1} -16 0 -16 Q ${w/2 + 1} -16 ${w/2 + 1} 4`}
            stroke="#1a1a1a" strokeWidth="4" fill="none" strokeLinecap="round"/>
          {/* metallic shine on band */}
          <path d={`M ${-w/2 - 1} 4 Q ${-w/2 - 1} -14 0 -14 Q ${w/2 + 1} -14 ${w/2 + 1} 4`}
            stroke="#666" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8"/>
          {/* left ear cup */}
          <ellipse cx={-w/2 - 1} cy="6" rx="6" ry="8" fill="#e63946" stroke="#1a1a1a" strokeWidth="1.5"/>
          <ellipse cx={-w/2 - 1} cy="6" rx="3" ry="4.5" fill="#1a1a1a"/>
          <ellipse cx={-w/2 - 2.5} cy="4.5" rx="1" ry="1.5" fill="#ff8a93" opacity="0.6"/>
          {/* right ear cup */}
          <ellipse cx={w/2 + 1} cy="6" rx="6" ry="8" fill="#e63946" stroke="#1a1a1a" strokeWidth="1.5"/>
          <ellipse cx={w/2 + 1} cy="6" rx="3" ry="4.5" fill="#1a1a1a"/>
          <ellipse cx={w/2 - 0.5} cy="4.5" rx="1" ry="1.5" fill="#ff8a93" opacity="0.6"/>
        </g>
      );
    }
    if (hat === 'crown') {
      // Royal gold crown sitting on the cap
      return (
        <g transform={`translate(${cx} ${by}) scale(${a.scale})`}>
          {/* base band */}
          <rect x={-w/2 + 6} y="-3" width={w - 12} height="6" fill="#ffd700" stroke="#7a5810" strokeWidth="1.2"/>
          <rect x={-w/2 + 6} y="-1" width={w - 12} height="4" fill="#c89818"/>
          <rect x={-w/2 + 6} y="-3" width={w - 12} height="2" fill="#ffeb6e"/>
          {/* spikes */}
          <path d={`M ${-w/2 + 6} -3 L ${-w/2 + 9} -12 L ${-w/2 + 14} -5 L 0 -16 L ${w/2 - 14} -5 L ${w/2 - 9} -12 L ${w/2 - 6} -3 Z`}
            fill="#ffd700" stroke="#7a5810" strokeWidth="1.2"/>
          {/* spike highlights */}
          <path d={`M ${-w/2 + 9} -10 L ${-w/2 + 8} -4`} stroke="#ffeb6e" strokeWidth="1" opacity="0.8"/>
          <path d={`M 0 -14 L -1 -4`} stroke="#ffeb6e" strokeWidth="1" opacity="0.8"/>
          <path d={`M ${w/2 - 9} -10 L ${w/2 - 8} -4`} stroke="#ffeb6e" strokeWidth="1" opacity="0.8"/>
          {/* gems on spikes */}
          <circle cx={-w/2 + 9} cy="-12" r="1.5" fill="#e63946" stroke="#7a0a18" strokeWidth="0.5"/>
          <circle cx="0" cy="-15" r="2" fill="#3a86ff" stroke="#1a508a" strokeWidth="0.5"/>
          <circle cx={w/2 - 9} cy="-12" r="1.5" fill="#06d6a0" stroke="#048058" strokeWidth="0.5"/>
          {/* gem on band */}
          <ellipse cx="0" cy="0" rx="2.5" ry="1.5" fill="#e63946" stroke="#7a0a18" strokeWidth="0.5"/>
        </g>
      );
    }
    // Fallback: render the hat as a floating emoji above the head, sized to the cap
    const hatItem = SHOP.hats.find(h => h.id === hat);
    if (hatItem && hatItem.emoji) {
      const emojiSize = a.capWidth * 0.65 * a.scale;
      return (
        <g>
          <text
            x={a.hatX}
            y={a.hatY - 2}
            textAnchor="middle"
            fontSize={emojiSize}
            style={{ filter: 'drop-shadow(1px 1px 0 rgba(0,0,0,0.25))' }}
          >
            {hatItem.emoji}
          </text>
        </g>
      );
    }
    return null;
  };

  return (
    <div
      className="mushroom-wrapper"
      style={{
        animation: isSad
          ? 'mushroom-droop 2.5s ease-in-out infinite'
          : isHappy
          ? 'mushroom-bounce-happy 0.4s ease-in-out 4'
          : 'none',
      }}
    >
      <div
        className="mushroom-flip"
        style={{
          transform: facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
          transition: 'transform 0.15s',
        }}
      >
        <svg width={displaySize} height={displaySize} viewBox="0 0 100 100" style={{ display: 'block', overflow: 'visible' }}>
          {/* drop shadow under mushroom */}
          <ellipse cx="50" cy="94" rx="22" ry="3" fill="rgba(0,0,0,0.25)"/>
          {renderStage()}
          {renderFace()}
          {renderHat()}
        </svg>
      </div>
    </div>
  );
};


// ===== COMPANION SPRITE =====
const Companion = ({ id }) => {
  const animMap = {
    slime: 'companion-bounce',
    snail: 'companion-crawl',
    octopus: 'companion-wiggle',
    bunny: 'companion-bounce',
    chick: 'companion-bounce',
    frog: 'companion-bounce',
    fish: 'companion-wiggle',
    cat: 'companion-crawl',
    fox: 'companion-crawl',
    pig: 'companion-bounce',
    penguin: 'companion-bounce',
    unicorn: 'companion-bounce',
    dragon: 'companion-wiggle',
    phoenix: 'companion-wiggle',
  };
  const item = SHOP.companions.find(c => c.id === id);
  if (!item) return null;
  const anim = animMap[id] || 'companion-bounce';
  return <div style={{ fontSize: '32px', animation: `${anim} 2.5s ease-in-out infinite` }}>{item.emoji}</div>;
};

// ===== MAIN APP =====
const TEST_TASK_ID = 'preview-boost-100';

export default function MushroomTasks() {
  const [view, setView] = useState('home'); // home | tasks | shop | wiki
  const [loaded, setLoaded] = useState(false);
  const [state, setState] = useState({
    level: 1,
    xp: 0,
    mesos: 0,
    streak: 0,
    lastCompletedDate: null,
    tasks: [],
    owned: [],
    equipped: { hat: null, background: 'henesys', furniture: [], companion: null },
    petName: 'Sporlie',
  });
  const [mood, setMood] = useState('idle'); // idle | happy | sad
  const [floatingMsg, setFloatingMsg] = useState(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskValue, setNewTaskValue] = useState(10);
  const [showLevelUp, setShowLevelUp] = useState(null);
  const [shopTab, setShopTab] = useState('hats');
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  // Pet wandering: position is left % within the room (10%-85%)
  const [petPos, setPetPos] = useState(50);
  const [petFacing, setPetFacing] = useState('right');
  const [petHopping, setPetHopping] = useState(false);
  const moodTimer = useRef(null);
  const hopTimer = useRef(null);

  // Wandering AI: every 2-5s, the mushroom hops to a new spot
  useEffect(() => {
    const scheduleHop = () => {
      const delay = mood === 'sad'
        ? 4000 + Math.random() * 4000  // sad mushroom moves slower
        : 1800 + Math.random() * 2500;
      hopTimer.current = setTimeout(() => {
        setPetPos(prev => {
          // Pick a new position 10-40% away in either direction, clamped
          const range = 15 + Math.random() * 25;
          let next = Math.random() < 0.5 ? prev - range : prev + range;
          if (next < 12) next = 12;
          if (next > 85) next = 85;
          // If clamped, force opposite direction
          if (next === prev) next = prev > 50 ? 12 : 85;
          setPetFacing(next > prev ? 'right' : 'left');
          return next;
        });
        // Trigger hop animation
        setPetHopping(true);
        setTimeout(() => setPetHopping(false), 600);
        scheduleHop();
      }, delay);
    };
    scheduleHop();
    return () => clearTimeout(hopTimer.current);
  }, [mood]);

  // Helper: ensure the preview test task is present (resets daily like any task)
  const ensureTestTask = (tasks) => {
    const has = tasks.some(t => t.id === TEST_TASK_ID);
    if (has) return tasks;
    return [
      {
        id: TEST_TASK_ID,
        text: '⚡ Test Boost (preview only)',
        value: 100,
        completed: false,
        completedDate: null,
        isTest: true,
      },
      ...tasks,
    ];
  };

  // Load state
  useEffect(() => {
    (async () => {
      try {
        const r = localStorage.getItem('mushroom_state');
        if (r) {
          const saved = JSON.parse(r);
          // Migration / defaults
          saved.equipped = saved.equipped || { hat: null, background: 'henesys', furniture: [], companion: null };
          saved.equipped.furniture = saved.equipped.furniture || [];
          saved.owned = saved.owned || [];
          saved.tasks = saved.tasks || [];
          // Check if missed a day -> mood sad
          if (saved.lastCompletedDate) {
            const gap = daysBetween(saved.lastCompletedDate, todayStr());
            if (gap > 1) setMood('sad');
            if (gap > 1) saved.streak = 0; // streak resets but xp safe
          }
          // Reset task completion for new day
          saved.tasks = saved.tasks.map(t => {
            if (t.completedDate && t.completedDate !== todayStr()) {
              return { ...t, completed: false, completedDate: null };
            }
            return t;
          });
          // Ensure preview test task is present
          saved.tasks = ensureTestTask(saved.tasks);
          setState(saved);
        } else {
          // First-time user: still inject the test task
          setState(prev => ({ ...prev, tasks: ensureTestTask(prev.tasks) }));
        }
      } catch (e) {
        setState(prev => ({ ...prev, tasks: ensureTestTask(prev.tasks) }));
      }
      setLoaded(true);
    })();
  }, []);

  // Save state
  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try { localStorage.setItem('mushroom_state', JSON.stringify(state)); } catch (e) {}
    })();
  }, [state, loaded]);

  const triggerMood = (m, msg) => {
    setMood(m);
    if (msg) setFloatingMsg(msg);
    if (moodTimer.current) clearTimeout(moodTimer.current);
    moodTimer.current = setTimeout(() => {
      setMood('idle');
      setFloatingMsg(null);
    }, 1800);
  };

  const completeTask = (taskId) => {
    setState(prev => {
      const task = prev.tasks.find(t => t.id === taskId);
      if (!task || task.completed) return prev;

      let newXp = prev.xp + task.value;
      let newLevel = prev.level;
      let newMesos = prev.mesos + Math.ceil(task.value * 1.5);
      let leveledUp = false;
      let need = xpForLevel(newLevel);
      while (newXp >= need) {
        newXp -= need;
        newLevel++;
        leveledUp = true;
        need = xpForLevel(newLevel);
      }

      // streak logic
      let newStreak = prev.streak;
      if (prev.lastCompletedDate !== todayStr()) {
        if (prev.lastCompletedDate && daysBetween(prev.lastCompletedDate, todayStr()) === 1) {
          newStreak = prev.streak + 1;
        } else if (!prev.lastCompletedDate || daysBetween(prev.lastCompletedDate, todayStr()) > 1) {
          newStreak = 1;
        }
      }

      const newTasks = prev.tasks.map(t =>
        t.id === taskId ? { ...t, completed: true, completedDate: todayStr() } : t
      );

      if (leveledUp) {
        const oldStage = getStageIndex(prev.level);
        const newStage = getStageIndex(newLevel);
        setShowLevelUp({ level: newLevel, evolved: newStage > oldStage, stageName: STAGES[newStage].name });
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        mesos: newMesos,
        streak: newStreak,
        lastCompletedDate: todayStr(),
        tasks: newTasks,
      };
    });

    triggerMood('happy', `+${state.tasks.find(t => t.id === taskId)?.value} XP`);
  };

  const uncompleteTask = (taskId) => {
    setState(prev => {
      const task = prev.tasks.find(t => t.id === taskId);
      if (!task || !task.completed) return prev;
      // refund — but only for today's completions
      let newXp = prev.xp - task.value;
      let newLevel = prev.level;
      let newMesos = Math.max(0, prev.mesos - Math.ceil(task.value * 1.5));
      while (newXp < 0 && newLevel > 1) {
        newLevel--;
        newXp += xpForLevel(newLevel);
      }
      if (newXp < 0) newXp = 0;
      const newTasks = prev.tasks.map(t =>
        t.id === taskId ? { ...t, completed: false, completedDate: null } : t
      );
      return { ...prev, xp: newXp, level: newLevel, mesos: newMesos, tasks: newTasks };
    });
    triggerMood('sad');
  };

  const addTask = () => {
    if (!newTaskText.trim()) return;
    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, {
        id: Date.now(),
        text: newTaskText.trim(),
        value: parseInt(newTaskValue) || 10,
        completed: false,
        completedDate: null,
      }],
    }));
    setNewTaskText('');
    setNewTaskValue(10);
  };

  const deleteTask = (id) => {
    if (id === TEST_TASK_ID) return; // protect the preview test task
    setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
  };

  const savePetName = () => {
    const trimmed = nameDraft.trim().slice(0, 16);
    if (trimmed) {
      setState(prev => ({ ...prev, petName: trimmed }));
    }
    setEditingName(false);
  };

  const startEditingName = () => {
    setNameDraft(state.petName);
    setEditingName(true);
  };

  const buyItem = (category, item) => {
    if (state.owned.includes(item.id) || state.mesos < item.price) return;
    setState(prev => {
      const newEquipped = { ...prev.equipped };
      if (category === 'hats') newEquipped.hat = item.id;
      else if (category === 'backgrounds') newEquipped.background = item.id;
      else if (category === 'furniture') newEquipped.furniture = [...prev.equipped.furniture, item.id];
      else if (category === 'companions') newEquipped.companion = item.id;
      return {
        ...prev,
        mesos: prev.mesos - item.price,
        owned: [...prev.owned, item.id],
        equipped: newEquipped,
      };
    });
    triggerMood('happy', '✨ Yay!');
  };

  const equipItem = (category, itemId) => {
    setState(prev => {
      const newEquipped = { ...prev.equipped };
      if (category === 'hats') {
        newEquipped.hat = newEquipped.hat === itemId ? null : itemId;
      } else if (category === 'backgrounds') {
        newEquipped.background = itemId;
      } else if (category === 'companions') {
        newEquipped.companion = newEquipped.companion === itemId ? null : itemId;
      } else if (category === 'furniture') {
        // Toggle: if placed, remove it; otherwise add it
        const isPlaced = newEquipped.furniture.includes(itemId);
        newEquipped.furniture = isPlaced
          ? newEquipped.furniture.filter(f => f !== itemId)
          : [...newEquipped.furniture, itemId];
      }
      return { ...prev, equipped: newEquipped };
    });
  };

  if (!loaded) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#fff8e7', fontFamily:'monospace'}}>
        <div>Loading your mushroom...</div>
      </div>
    );
  }

  const stageIdx = getStageIndex(state.level);
  const stage = STAGES[stageIdx];
  const xpNeeded = xpForLevel(state.level);
  const xpPct = (state.xp / xpNeeded) * 100;
  const bg = SHOP.backgrounds.find(b => b.id === state.equipped.background) || SHOP.backgrounds[0];

  const todayCompleted = state.tasks.filter(t => t.completed && t.completedDate === todayStr()).length;
  const todayTotal = state.tasks.length;

  return (
    <div className="app-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Nunito:wght@400;700;900&display=swap');

        * { box-sizing: border-box; }
        body { margin: 0; }

        .app-root {
          font-family: 'Nunito', sans-serif;
          max-width: 430px;
          margin: 0 auto;
          min-height: 100vh;
          background: #fff8e7;
          color: #4a3520;
          position: relative;
          padding-bottom: 80px;
          overflow: hidden;
        }

        .pixel-font { font-family: 'Press Start 2P', monospace; }

        /* TOP BAR */
        .top-bar {
          background: linear-gradient(180deg, #ffd699 0%, #ffb84d 100%);
          padding: 14px 16px 12px;
          border-bottom: 4px solid #d4853a;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 0 #b86d20;
        }
        .top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }
        .pet-name {
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          color: #4a2818;
          text-shadow: 1px 1px 0 rgba(255,255,255,0.5);
        }
        .pet-name.editable {
          cursor: pointer;
          padding: 2px 4px;
          margin: -2px -4px;
          border-radius: 6px;
          transition: background 0.15s;
        }
        .pet-name.editable:hover { background: rgba(255,255,255,0.4); }
        .name-input {
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          color: #4a2818;
          background: white;
          border: 2px solid #ff6b35;
          border-radius: 6px;
          padding: 2px 6px;
          width: 100%;
          max-width: 140px;
          outline: none;
        }
        .task-card.test-task {
          background: linear-gradient(180deg, #fff5d6 0%, #ffe9b3 100%);
          border-color: #ffb84d;
          box-shadow: 0 2px 0 #c87820;
        }
        .task-card.test-task .task-text { color: #8a4a18; }
        .test-badge {
          background: #ffb84d;
          color: white;
          font-family: 'Press Start 2P', monospace;
          font-size: 7px;
          padding: 3px 6px;
          border-radius: 6px;
          margin-left: 4px;
        }

        /* WIKI */
        .wiki-intro {
          background: white;
          border: 2px solid #d4853a;
          border-radius: 14px;
          padding: 12px 14px;
          margin-bottom: 14px;
          font-size: 13px;
          font-weight: 700;
          color: #4a3520;
          line-height: 1.4;
          box-shadow: 0 2px 0 #c8a378;
        }
        .wiki-stage-card {
          background: white;
          border: 2px solid #e0c098;
          border-radius: 14px;
          padding: 14px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 2px 0 #c8a378;
          position: relative;
          overflow: hidden;
        }
        .wiki-stage-card.unlocked {
          background: linear-gradient(180deg, #fff8e7, #ffe9b3);
          border-color: #ffb84d;
        }
        .wiki-stage-card.current {
          background: linear-gradient(180deg, #fff0d4, #ffd699);
          border-color: #ff6b35;
          box-shadow: 0 3px 0 #b54218;
        }
        .wiki-preview-box {
          width: 80px;
          height: 80px;
          background: linear-gradient(180deg, #ffe9b3 0%, #a8e6a3 100%);
          border: 2px solid #8a5a2a;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
        }
        .wiki-stage-info {
          flex: 1;
          min-width: 0;
        }
        .wiki-stage-name {
          font-family: 'Press Start 2P', monospace;
          font-size: 11px;
          color: #4a2818;
          margin-bottom: 6px;
          line-height: 1.3;
        }
        .wiki-stage-name.locked { color: #8a7560; }
        .wiki-stage-level {
          font-size: 12px;
          font-weight: 800;
          color: #8a4a18;
        }
        .wiki-stage-level .lvl-num {
          color: #ff6b35;
          font-family: 'Press Start 2P', monospace;
          font-size: 11px;
          margin: 0 2px;
        }
        .wiki-current-badge {
          display: inline-block;
          background: #ff6b35;
          color: white;
          font-family: 'Press Start 2P', monospace;
          font-size: 7px;
          padding: 3px 6px;
          border-radius: 6px;
          margin-top: 6px;
        }
        .wiki-locked-badge {
          display: inline-block;
          background: #aaa;
          color: white;
          font-family: 'Press Start 2P', monospace;
          font-size: 7px;
          padding: 3px 6px;
          border-radius: 6px;
          margin-top: 6px;
        }
        .silhouette-q {
          font-family: 'Press Start 2P', monospace;
          font-size: 36px;
          color: #6a4a30;
          opacity: 0.7;
        }

        .stat-pill {
          background: rgba(255,255,255,0.85);
          border: 2px solid #d4853a;
          border-radius: 14px;
          padding: 4px 10px;
          font-weight: 900;
          font-size: 13px;
          color: #4a2818;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .level-badge {
          background: #ff6b35;
          color: white;
          border: 2px solid #b54218;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          box-shadow: 0 2px 0 #8a3010;
        }
        .xp-bar-wrap {
          background: rgba(74,40,24,0.25);
          border-radius: 8px;
          height: 12px;
          margin-top: 8px;
          overflow: hidden;
          border: 1.5px solid #8a4a18;
          position: relative;
        }
        .xp-bar-fill {
          background: linear-gradient(90deg, #6cd968, #3aaf3a);
          height: 100%;
          border-radius: 6px;
          transition: width 0.5s ease;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.4);
        }
        .xp-text {
          font-family: 'Press Start 2P', monospace;
          font-size: 7px;
          color: white;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-shadow: 1px 1px 0 rgba(0,0,0,0.5);
        }

        /* PET ROOM */
        .pet-room {
          height: 380px;
          position: relative;
          overflow: hidden;
          border-bottom: 4px solid #8a5a2a;
        }
        .pet-room-bg {
          position: absolute;
          inset: 0;
          background: var(--bg-gradient);
          transition: background 0.6s;
        }
        /* Distant mountains silhouette */
        .mountains {
          position: absolute;
          bottom: 80px;
          left: 0;
          right: 0;
          height: 70px;
          background:
            radial-gradient(ellipse 80px 50px at 15% 100%, #8aa878 50%, transparent 51%),
            radial-gradient(ellipse 100px 60px at 45% 100%, #6a8858 50%, transparent 51%),
            radial-gradient(ellipse 70px 45px at 75% 100%, #8aa878 50%, transparent 51%),
            radial-gradient(ellipse 90px 50px at 95% 100%, #6a8858 50%, transparent 51%);
          opacity: 0.65;
          z-index: 1;
        }
        /* Background trees */
        .tree-bg {
          position: absolute;
          bottom: 75px;
          width: 36px;
          height: 50px;
          z-index: 2;
        }
        .tree-bg-1 { left: 8%; }
        .tree-bg-2 { left: 78%; transform: scaleX(-1); }
        .tree-bg .trunk {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 16px;
          background: #6b3818;
          border: 2px solid #3a1a08;
          border-radius: 1px;
        }
        .tree-bg .leaves {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 36px;
          height: 36px;
          background: #4a8a3a;
          border: 2px solid #2a5a1a;
          border-radius: 50%;
          box-shadow: inset -4px -4px 0 #3a6a2a, inset 4px 4px 0 #6cb858;
        }
        .tree-bg .leaves::after {
          content:'';
          position:absolute;
          top: 6px; left: 8px;
          width: 8px; height: 8px;
          background: #6cb858;
          border-radius: 50%;
        }
        /* Ground — pixel grass and dirt */
        .ground {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 75px;
          background:
            linear-gradient(180deg, #5a8a3a 0%, #5a8a3a 12px, #c79e6f 12px, #8a6740 100%);
          border-top: 3px solid #2a5a1a;
          z-index: 3;
        }
        /* Pixel dirt texture */
        .ground::before {
          content: '';
          position: absolute;
          top: 15px;
          left: 0;
          right: 0;
          bottom: 0;
          background-image:
            radial-gradient(circle 2px at 12% 30%, #6b4a2e 50%, transparent 51%),
            radial-gradient(circle 2px at 45% 70%, #6b4a2e 50%, transparent 51%),
            radial-gradient(circle 2px at 78% 40%, #6b4a2e 50%, transparent 51%),
            radial-gradient(circle 1px at 25% 60%, #4a3018 50%, transparent 51%),
            radial-gradient(circle 1px at 65% 25%, #4a3018 50%, transparent 51%),
            radial-gradient(circle 1px at 90% 80%, #4a3018 50%, transparent 51%),
            radial-gradient(circle 2px at 5% 85%, #6b4a2e 50%, transparent 51%);
        }
        /* Grass tufts on top of ground */
        .ground::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 12px;
          background:
            linear-gradient(180deg, transparent 0%, transparent 50%, #4a7a2a 50%, #4a7a2a 100%),
            repeating-linear-gradient(90deg,
              #5a8a3a 0px, #5a8a3a 4px,
              #6cb858 4px, #6cb858 6px,
              #5a8a3a 6px, #5a8a3a 10px,
              #4a7a2a 10px, #4a7a2a 12px);
        }
        /* Decorative flowers scattered on ground */
        .flower {
          position: absolute;
          width: 8px;
          height: 10px;
          z-index: 4;
        }
        .flower::before {
          content: '';
          position: absolute;
          left: 3px;
          bottom: 0;
          width: 2px;
          height: 6px;
          background: #2a5a1a;
        }
        .flower::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 8px;
          height: 6px;
          background: var(--petal, #ff6bb5);
          border-radius: 50%;
          box-shadow:
            0 0 0 1px var(--petal-dark, #c43880),
            inset 0 0 0 2px var(--petal-light, #ffaad4);
        }
        .flower-1 { left: 18%; bottom: 60px; --petal: #ff6bb5; --petal-dark: #c43880; --petal-light: #ffaad4; }
        .flower-2 { left: 72%; bottom: 58px; --petal: #ffd93d; --petal-dark: #c89818; --petal-light: #fff299; }
        .flower-3 { left: 35%; bottom: 62px; --petal: #6bd9ff; --petal-dark: #2880c4; --petal-light: #aae5ff; }
        .flower-4 { left: 88%; bottom: 60px; --petal: #ff6bb5; --petal-dark: #c43880; --petal-light: #ffaad4; }
        .flower-5 { left: 5%; bottom: 58px; --petal: #c8a5ff; --petal-dark: #6838c4; --petal-light: #e0c5ff; }
        /* Pebbles */
        .pebble {
          position: absolute;
          background: #aaa;
          border: 1px solid #555;
          border-radius: 50%;
          z-index: 4;
        }
        .pebble-1 { width: 6px; height: 4px; left: 25%; bottom: 52px; }
        .pebble-2 { width: 5px; height: 3px; left: 60%; bottom: 50px; background: #888; }
        .pebble-3 { width: 7px; height: 4px; left: 95%; bottom: 53px; }
        /* Butterfly */
        .butterfly {
          position: absolute;
          font-size: 14px;
          z-index: 6;
          animation: butterfly-fly 12s ease-in-out infinite;
          filter: drop-shadow(1px 1px 0 rgba(0,0,0,0.2));
        }

        .cloud {
          position: absolute;
          background: white;
          border-radius: 50%;
          opacity: 0.85;
          animation: cloud-drift 30s linear infinite;
          z-index: 1;
        }
        .cloud-1 { width: 50px; height: 20px; top: 30px; left: -50px; animation-duration: 35s; }
        .cloud-1::before { content:''; position:absolute; width:25px; height:25px; border-radius:50%; background:white; top:-12px; left:10px; }
        .cloud-1::after { content:''; position:absolute; width:18px; height:18px; border-radius:50%; background:white; top:-8px; left:30px; }
        .cloud-2 { width: 40px; height: 16px; top: 60px; left: -40px; animation-delay: -15s; animation-duration: 45s; }
        .cloud-2::before { content:''; position:absolute; width:20px; height:20px; border-radius:50%; background:white; top:-10px; left:8px; }

        /* PET POSITION & ANIMATION */
        .pet-stage-area {
          position: absolute;
          bottom: 60px;
          transform: translateX(-50%);
          display: flex;
          align-items: flex-end;
          gap: 8px;
          z-index: 7;
        }
        .pet-stage-area.hopping .mushroom-wrapper {
          animation: mushroom-hop 0.6s ease-out !important;
        }

        .mushroom-wrapper {
          display: inline-block;
          transform-origin: bottom center;
        }
        @keyframes mushroom-hop {
          0%   { transform: translateY(0) scaleY(1); }
          15%  { transform: translateY(0) scaleY(0.85); }
          40%  { transform: translateY(-22px) scaleY(1.05); }
          70%  { transform: translateY(-10px) scaleY(1.02); }
          90%  { transform: translateY(0) scaleY(0.95); }
          100% { transform: translateY(0) scaleY(1); }
        }
        @keyframes mushroom-bounce-happy {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-14px); }
          50% { transform: translateY(0); }
          75% { transform: translateY(-10px); }
        }
        @keyframes mushroom-droop {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(2px) rotate(2deg); }
        }
        @keyframes companion-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes companion-crawl {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        @keyframes companion-wiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes cloud-drift {
          from { transform: translateX(0); }
          to { transform: translateX(500px); }
        }
        @keyframes butterfly-fly {
          0%   { transform: translate(0, 0) rotate(-5deg); }
          25%  { transform: translate(80px, -20px) rotate(8deg); }
          50%  { transform: translate(160px, 10px) rotate(-3deg); }
          75%  { transform: translate(80px, -10px) rotate(5deg); }
          100% { transform: translate(0, 0) rotate(-5deg); }
        }
        @keyframes float-up {
          0% { transform: translate(-50%, 0); opacity: 1; }
          100% { transform: translate(-50%, -60px); opacity: 0; }
        }
        @keyframes pop-in {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        .floating-msg {
          position: absolute;
          left: 50%;
          bottom: 220px;
          transform: translateX(-50%);
          background: white;
          border: 2px solid #ff6b35;
          border-radius: 16px;
          padding: 6px 14px;
          font-family: 'Press Start 2P', monospace;
          font-size: 11px;
          color: #ff6b35;
          animation: float-up 1.6s ease-out forwards;
          z-index: 20;
          white-space: nowrap;
          box-shadow: 0 4px 0 rgba(0,0,0,0.15);
        }

        .speech-bubble {
          position: absolute;
          background: white;
          border: 2px solid #4a3520;
          border-radius: 14px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 700;
          color: #4a3520;
          max-width: 180px;
          z-index: 10;
          animation: pop-in 0.4s ease-out;
        }
        .speech-bubble::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 10px solid #4a3520;
        }
        .speech-bubble::before {
          content: '';
          position: absolute;
          bottom: -7px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 8px solid white;
          z-index: 1;
        }

        .stage-banner {
          position: absolute;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255,255,255,0.85);
          border: 2px solid #8a5a2a;
          border-radius: 12px;
          padding: 4px 12px;
          font-family: 'Press Start 2P', monospace;
          font-size: 9px;
          color: #4a2818;
          z-index: 8;
        }

        .furniture-row {
          position: absolute;
          bottom: 60px;
          left: 12px;
          right: 12px;
          display: flex;
          justify-content: space-between;
          z-index: 5;
          pointer-events: none;
        }
        .furniture-item {
          filter: drop-shadow(2px 2px 0 rgba(0,0,0,0.25));
        }

        /* CONTENT AREA */
        .content {
          padding: 16px;
        }

        .section-title {
          font-family: 'Press Start 2P', monospace;
          font-size: 11px;
          color: #8a4a18;
          margin: 0 0 12px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .task-progress {
          background: white;
          border: 2px solid #d4853a;
          border-radius: 14px;
          padding: 10px 14px;
          margin-bottom: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 3px 0 #b86d20;
        }
        .task-progress-label {
          font-weight: 800;
          font-size: 13px;
          color: #4a2818;
        }
        .task-progress-count {
          font-family: 'Press Start 2P', monospace;
          font-size: 12px;
          color: #ff6b35;
        }

        .task-card {
          background: white;
          border: 2px solid #e0c098;
          border-radius: 14px;
          padding: 12px 14px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s;
          box-shadow: 0 2px 0 #c8a378;
        }
        .task-card.done {
          background: #e9f7e0;
          border-color: #6cd968;
          box-shadow: 0 2px 0 #4aa84a;
        }
        .task-checkbox {
          width: 28px;
          height: 28px;
          border: 2.5px solid #d4853a;
          border-radius: 8px;
          background: #fff8e7;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .task-checkbox:active { transform: scale(0.9); }
        .task-checkbox.checked {
          background: #6cd968;
          border-color: #4aa84a;
        }
        .task-text {
          flex: 1;
          font-size: 14px;
          font-weight: 700;
          color: #4a3520;
        }
        .task-text.done {
          text-decoration: line-through;
          color: #8a7560;
        }
        .task-xp {
          background: #ff6b35;
          color: white;
          font-family: 'Press Start 2P', monospace;
          font-size: 9px;
          padding: 4px 8px;
          border-radius: 8px;
        }
        .task-delete {
          color: #c44;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }

        .add-task-form {
          background: linear-gradient(180deg, #fff5d6 0%, #ffe4a8 100%);
          border: 2px solid #d4853a;
          border-radius: 14px;
          padding: 14px;
          margin-top: 16px;
          box-shadow: 0 3px 0 #b86d20;
        }
        .add-task-form input[type="text"] {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #d4853a;
          border-radius: 10px;
          background: white;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #4a2818;
          margin-bottom: 10px;
        }
        .add-task-form input[type="text"]:focus { outline: none; border-color: #ff6b35; }
        .xp-selector {
          display: flex;
          gap: 6px;
          margin-bottom: 10px;
        }
        .xp-btn {
          flex: 1;
          padding: 8px 4px;
          border: 2px solid #d4853a;
          border-radius: 8px;
          background: white;
          font-family: 'Press Start 2P', monospace;
          font-size: 9px;
          color: #4a2818;
          cursor: pointer;
        }
        .xp-btn.active { background: #ff6b35; color: white; border-color: #b54218; }
        .add-btn {
          width: 100%;
          padding: 12px;
          background: #ff6b35;
          color: white;
          border: 2px solid #b54218;
          border-radius: 10px;
          font-family: 'Press Start 2P', monospace;
          font-size: 11px;
          cursor: pointer;
          box-shadow: 0 3px 0 #8a3010;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .add-btn:active { transform: translateY(2px); box-shadow: 0 1px 0 #8a3010; }

        /* SHOP */
        .shop-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 14px;
          background: white;
          border: 2px solid #d4853a;
          border-radius: 12px;
          padding: 4px;
        }
        .shop-tab {
          flex: 1;
          padding: 8px 4px;
          border: none;
          background: transparent;
          border-radius: 8px;
          font-family: 'Press Start 2P', monospace;
          font-size: 8px;
          color: #8a4a18;
          cursor: pointer;
          text-transform: uppercase;
        }
        .shop-tab.active { background: #ff6b35; color: white; }

        .shop-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .shop-item {
          background: white;
          border: 2px solid #e0c098;
          border-radius: 14px;
          padding: 12px 10px;
          text-align: center;
          box-shadow: 0 2px 0 #c8a378;
        }
        .shop-item.owned { background: #e9f7e0; border-color: #6cd968; }
        .shop-item.equipped { background: #fff5cc; border-color: #ffb84d; }
        .shop-item-preview {
          font-size: 36px;
          margin-bottom: 6px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bg-preview {
          height: 50px;
          border-radius: 8px;
          margin-bottom: 6px;
          border: 1.5px solid #4a3520;
        }
        .shop-item-name {
          font-size: 11px;
          font-weight: 800;
          color: #4a2818;
          margin-bottom: 6px;
          line-height: 1.2;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .shop-item-btn {
          width: 100%;
          padding: 6px;
          border: 2px solid #b54218;
          border-radius: 8px;
          background: #ff6b35;
          color: white;
          font-family: 'Press Start 2P', monospace;
          font-size: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        .shop-item-btn:disabled { background: #ccc; border-color: #999; cursor: not-allowed; }
        .shop-item-btn.equipped-btn { background: #4aa84a; border-color: #2a682a; }
        .shop-item-btn.equip-btn { background: #ffb84d; border-color: #c87820; }

        /* BOTTOM NAV */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 430px;
          background: linear-gradient(180deg, #ffd699 0%, #ffb84d 100%);
          border-top: 4px solid #d4853a;
          display: flex;
          justify-content: space-around;
          padding: 8px 0 12px;
          z-index: 100;
          box-shadow: 0 -2px 0 #b86d20;
        }
        .nav-btn {
          flex: 1;
          background: none;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          color: #8a4a18;
          cursor: pointer;
          padding: 4px 2px;
          font-family: 'Press Start 2P', monospace;
          font-size: 7px;
          text-transform: uppercase;
        }
        .nav-btn.active { color: #ff6b35; }
        .nav-btn.active .nav-icon-wrap {
          background: #ff6b35;
          color: white;
        }
        .nav-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: rgba(255,255,255,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #d4853a;
        }

        /* LEVEL UP MODAL */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal-card {
          background: linear-gradient(180deg, #fff8e7, #ffe4a8);
          border: 4px solid #ff6b35;
          border-radius: 20px;
          padding: 24px;
          max-width: 320px;
          width: 100%;
          text-align: center;
          box-shadow: 0 8px 0 #b54218;
          animation: pop-in 0.5s ease-out;
        }
        .modal-title {
          font-family: 'Press Start 2P', monospace;
          font-size: 14px;
          color: #ff6b35;
          margin: 0 0 12px;
        }
        .modal-msg {
          font-size: 14px;
          font-weight: 700;
          color: #4a2818;
          margin-bottom: 16px;
        }
        .modal-btn {
          padding: 10px 24px;
          background: #ff6b35;
          color: white;
          border: 2px solid #b54218;
          border-radius: 10px;
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          cursor: pointer;
          box-shadow: 0 3px 0 #8a3010;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #8a7560;
          font-size: 14px;
          font-weight: 700;
        }

        .streak-flame {
          font-size: 14px;
          margin-right: 2px;
        }
      `}</style>

      {/* TOP BAR */}
      <div className="top-bar">
        <div className="top-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            <div className="level-badge">{state.level}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {editingName ? (
                <input
                  type="text"
                  className="name-input"
                  value={nameDraft}
                  autoFocus
                  maxLength={16}
                  onChange={e => setNameDraft(e.target.value)}
                  onBlur={savePetName}
                  onKeyDown={e => {
                    if (e.key === 'Enter') savePetName();
                    if (e.key === 'Escape') setEditingName(false);
                  }}
                />
              ) : (
                <div
                  className="pet-name editable"
                  onClick={startEditingName}
                  title="Tap to rename"
                >
                  {state.petName} <span style={{ opacity: 0.5, fontSize: 8 }}>✎</span>
                </div>
              )}
              <div style={{ fontSize: 10, color: '#6a3818', marginTop: 2 }}>{stage.name}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div className="stat-pill">
              <span className="streak-flame">🔥</span>{state.streak}
            </div>
            <div className="stat-pill">
              <Coins size={14} color="#daa520" />{state.mesos}
            </div>
          </div>
        </div>
        <div className="xp-bar-wrap">
          <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
          <div className="xp-text">{state.xp} / {xpNeeded} XP</div>
        </div>
      </div>

      {/* PET ROOM */}
      <div className="pet-room">
        <div
          className="pet-room-bg"
          style={{ '--bg-gradient': `linear-gradient(180deg, ${bg.colors[0]} 0%, ${bg.colors[1]} 100%)` }}
        />
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="mountains" />
        <div className="tree-bg tree-bg-1">
          <div className="leaves" />
          <div className="trunk" />
        </div>
        <div className="tree-bg tree-bg-2">
          <div className="leaves" />
          <div className="trunk" />
        </div>
        <div className="butterfly" style={{ top: 100, left: 30 }}>🦋</div>
        <div className="ground" />
        <div className="flower flower-1" />
        <div className="flower flower-2" />
        <div className="flower flower-3" />
        <div className="flower flower-4" />
        <div className="flower flower-5" />
        <div className="pebble pebble-1" />
        <div className="pebble pebble-2" />
        <div className="pebble pebble-3" />

        <div className="stage-banner">{stage.name} • Lv.{state.level}</div>

        {mood === 'sad' && (
          <div className="speech-bubble" style={{ left: '50%', top: 60, transform: 'translateX(-50%)' }}>
            {state.streak === 0 && state.lastCompletedDate
              ? "I missed you yesterday... 💧"
              : "I'm waiting for tasks..."}
          </div>
        )}
        {mood === 'happy' && (
          <div className="speech-bubble" style={{ left: '50%', top: 60, transform: 'translateX(-50%)' }}>
            Yippee! Thanks! ⭐
          </div>
        )}

        <div className="furniture-row">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            {state.equipped.furniture.slice(0, 2).map(fId => {
              const item = SHOP.furniture.find(f => f.id === fId);
              return item ? (
                <div key={fId} className="furniture-item" style={{ fontSize: `${item.size}px`, lineHeight: 1 }}>
                  {item.emoji}
                </div>
              ) : null;
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            {state.equipped.furniture.slice(2).map(fId => {
              const item = SHOP.furniture.find(f => f.id === fId);
              return item ? (
                <div key={fId} className="furniture-item" style={{ fontSize: `${item.size}px`, lineHeight: 1 }}>
                  {item.emoji}
                </div>
              ) : null;
            })}
          </div>
        </div>

        <div
          className={`pet-stage-area ${petHopping ? 'hopping' : ''}`}
          style={{
            left: `${petPos}%`,
            transition: 'left 0.6s cubic-bezier(0.25, 0.5, 0.5, 1)',
          }}
        >
          <Mushroom stage={stageIdx} mood={mood} hat={state.equipped.hat} facing={petFacing} />
          {state.equipped.companion && <Companion id={state.equipped.companion} />}
        </div>

        {floatingMsg && <div className="floating-msg">{floatingMsg}</div>}
      </div>

      {/* CONTENT */}
      <div className="content">
        {view === 'home' && (
          <>
            <h2 className="section-title">
              <Star size={14} /> Today's Quests
            </h2>
            <div className="task-progress">
              <span className="task-progress-label">Daily Progress</span>
              <span className="task-progress-count">{todayCompleted} / {todayTotal}</span>
            </div>
            {state.tasks.length === 0 ? (
              <div className="empty-state">
                No quests yet!<br />
                Tap <strong>Tasks</strong> below to add some.
              </div>
            ) : (
              state.tasks.map(task => (
                <div key={task.id} className={`task-card ${task.completed ? 'done' : ''} ${task.isTest ? 'test-task' : ''}`}>
                  <div
                    className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                    onClick={() => task.completed ? uncompleteTask(task.id) : completeTask(task.id)}
                  >
                    {task.completed && <Check size={18} color="white" strokeWidth={3.5} />}
                  </div>
                  <span className={`task-text ${task.completed ? 'done' : ''}`}>{task.text}</span>
                  <span className="task-xp">+{task.value}</span>
                </div>
              ))
            )}
          </>
        )}

        {view === 'tasks' && (
          <>
            <h2 className="section-title">
              <ListTodo size={14} /> Manage Quests
            </h2>
            {state.tasks.length === 0 && (
              <div className="empty-state" style={{padding:'20px'}}>No quests yet — add your first below!</div>
            )}
            {state.tasks.map(task => (
              <div key={task.id} className={`task-card ${task.isTest ? 'test-task' : ''}`}>
                <span className="task-text">{task.text}</span>
                <span className="task-xp">+{task.value}</span>
                {task.isTest ? (
                  <span className="test-badge">DEV</span>
                ) : (
                  <button className="task-delete" onClick={() => deleteTask(task.id)}>
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            <div className="add-task-form">
              <input
                type="text"
                placeholder="e.g. Drink water 💧"
                value={newTaskText}
                onChange={e => setNewTaskText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTask()}
              />
              <div className="xp-selector">
                {[5, 10, 20, 35, 50].map(v => (
                  <button
                    key={v}
                    className={`xp-btn ${newTaskValue === v ? 'active' : ''}`}
                    onClick={() => setNewTaskValue(v)}
                  >+{v}</button>
                ))}
              </div>
              <button className="add-btn" onClick={addTask}>
                <Plus size={14} /> Add Quest
              </button>
            </div>
          </>
        )}

        {view === 'shop' && (
          <>
            <h2 className="section-title">
              <ShoppingBag size={14} /> Mushroom Shop
            </h2>
            <div className="shop-tabs">
              {['hats', 'backgrounds', 'furniture', 'companions'].map(t => (
                <button
                  key={t}
                  className={`shop-tab ${shopTab === t ? 'active' : ''}`}
                  onClick={() => setShopTab(t)}
                >{t}</button>
              ))}
            </div>
            <div className="shop-grid">
              {SHOP[shopTab].map(item => {
                const owned = state.owned.includes(item.id);
                const equipped =
                  (shopTab === 'hats' && state.equipped.hat === item.id) ||
                  (shopTab === 'backgrounds' && state.equipped.background === item.id) ||
                  (shopTab === 'companions' && state.equipped.companion === item.id) ||
                  (shopTab === 'furniture' && state.equipped.furniture.includes(item.id));
                const canAfford = state.mesos >= item.price;

                return (
                  <div key={item.id} className={`shop-item ${owned ? 'owned' : ''} ${equipped ? 'equipped' : ''}`}>
                    {shopTab === 'backgrounds' ? (
                      <div className="bg-preview" style={{ background: `linear-gradient(180deg, ${item.colors[0]}, ${item.colors[1]})` }} />
                    ) : (
                      <div className="shop-item-preview">{item.emoji}</div>
                    )}
                    <div className="shop-item-name">{item.name}</div>
                    {owned ? (
                      shopTab === 'furniture' ? (
                        equipped ? (
                          <button className="shop-item-btn equipped-btn" onClick={() => equipItem(shopTab, item.id)}>
                            <Check size={10} /> Placed
                          </button>
                        ) : (
                          <button className="shop-item-btn equip-btn" onClick={() => equipItem(shopTab, item.id)}>
                            Place
                          </button>
                        )
                      ) : equipped ? (
                        <button className="shop-item-btn equipped-btn" onClick={() => equipItem(shopTab, item.id)}>
                          Equipped
                        </button>
                      ) : (
                        <button className="shop-item-btn equip-btn" onClick={() => equipItem(shopTab, item.id)}>
                          Equip
                        </button>
                      )
                    ) : (
                      <button
                        className="shop-item-btn"
                        disabled={!canAfford}
                        onClick={() => buyItem(shopTab, item)}
                      >
                        <Coins size={10} /> {item.price}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {view === 'wiki' && (
          <>
            <h2 className="section-title">
              <BookOpen size={14} /> Mushroom Wiki
            </h2>
            <div className="wiki-intro">
              Complete daily quests to grow {state.petName} and unlock new evolution stages! Each stage looks completely different — some changes are still a mystery 🔮
            </div>
            {STAGES.map((s, idx) => {
              const isUnlocked = state.level >= s.minLevel;
              const isCurrent = idx === stageIdx;
              const stageBgColors = [
                ['#fff4dc', '#ffd699'], // baby spore
                ['#fff0d4', '#ffa86b'], // orange
                ['#f0d4ff', '#a85cff'], // horned
                ['#e6d4ff', '#5b3a8a'], // mushmom
              ][idx];

              return (
                <div
                  key={idx}
                  className={`wiki-stage-card ${isCurrent ? 'current' : isUnlocked ? 'unlocked' : ''}`}
                >
                  <div
                    className="wiki-preview-box"
                    style={{ background: `linear-gradient(180deg, ${stageBgColors[0]}, ${stageBgColors[1]})` }}
                  >
                    {isUnlocked ? (
                      <div style={{ transform: 'scale(0.7)', transformOrigin: 'center' }}>
                        <Mushroom stage={idx} mood="idle" hat={null} />
                      </div>
                    ) : (
                      <div className="silhouette-q">?</div>
                    )}
                  </div>
                  <div className="wiki-stage-info">
                    <div className={`wiki-stage-name ${!isUnlocked ? 'locked' : ''}`}>
                      {isUnlocked ? s.name : '???'}
                    </div>
                    <div className="wiki-stage-level">
                      Unlocks at Lv<span className="lvl-num">{s.minLevel}</span>
                    </div>
                    {isCurrent && <div className="wiki-current-badge">★ Current</div>}
                    {!isUnlocked && (
                      <div className="wiki-locked-badge">
                        <Lock size={8} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                        {s.minLevel - state.level} lvls to go
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div className="bottom-nav">
        <button className={`nav-btn ${view === 'home' ? 'active' : ''}`} onClick={() => setView('home')}>
          <div className="nav-icon-wrap"><Heart size={18} /></div>
          Pet
        </button>
        <button className={`nav-btn ${view === 'tasks' ? 'active' : ''}`} onClick={() => setView('tasks')}>
          <div className="nav-icon-wrap"><ListTodo size={18} /></div>
          Tasks
        </button>
        <button className={`nav-btn ${view === 'shop' ? 'active' : ''}`} onClick={() => setView('shop')}>
          <div className="nav-icon-wrap"><ShoppingBag size={18} /></div>
          Shop
        </button>
        <button className={`nav-btn ${view === 'wiki' ? 'active' : ''}`} onClick={() => setView('wiki')}>
          <div className="nav-icon-wrap"><BookOpen size={18} /></div>
          Wiki
        </button>
      </div>

      {/* LEVEL UP MODAL */}
      {showLevelUp && (
        <div className="modal-overlay" onClick={() => setShowLevelUp(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <Sparkles size={32} color="#ffb84d" style={{ marginBottom: 8 }} />
            <h3 className="modal-title">
              {showLevelUp.evolved ? 'Evolution!' : 'Level Up!'}
            </h3>
            <p className="modal-msg">
              {showLevelUp.evolved
                ? `${state.petName} evolved into a ${showLevelUp.stageName}!`
                : `${state.petName} is now Level ${showLevelUp.level}!`}
            </p>
            <button className="modal-btn" onClick={() => setShowLevelUp(null)}>Awesome!</button>
          </div>
        </div>
      )}
    </div>
  );
}
