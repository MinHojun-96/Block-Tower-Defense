import { useState, useEffect, useRef, useCallback } from 'react';
import './GameBoard.css';

// 오디오 컨텍스트
let audioContext = null;
let bgmOscillator = null;
let bgmGain = null;

const initAudio = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

const playSound = (type) => {
  try {
    const ctx = initAudio();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    switch (type) {
      case 'place':
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
        break;
      case 'shoot':
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.05);
        break;
      case 'hit':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.08);
        break;
      case 'kill':
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
        break;
      case 'upgrade':
        oscillator.frequency.setValueAtTime(523, ctx.currentTime);
        oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
        break;
      case 'roundStart':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        oscillator.frequency.setValueAtTime(550, ctx.currentTime + 0.15);
        oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.45);
        break;
      case 'gameOver':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.6);
        break;
      case 'victory':
        oscillator.frequency.setValueAtTime(523, ctx.currentTime);
        oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.15);
        oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.3);
        oscillator.frequency.setValueAtTime(1047, ctx.currentTime + 0.45);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.6);
        break;
      case 'click':
        oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.05);
        break;
      default:
        break;
    }
  } catch (e) {}
};

const startBgm = () => {
  try {
    const ctx = initAudio();
    if (bgmOscillator) return;
    bgmGain = ctx.createGain();
    bgmGain.gain.setValueAtTime(0.08, ctx.currentTime);
    bgmGain.connect(ctx.destination);
    bgmOscillator = ctx.createOscillator();
    bgmOscillator.type = 'triangle';
    bgmOscillator.frequency.setValueAtTime(55, ctx.currentTime);
    bgmOscillator.connect(bgmGain);
    bgmOscillator.start();
    const notes = [110, 138.59, 164.81, 138.59];
    let noteIndex = 0;
    const playNote = () => {
      if (!bgmOscillator) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(notes[noteIndex], ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
      noteIndex = (noteIndex + 1) % notes.length;
      if (bgmOscillator) setTimeout(playNote, 500);
    };
    setTimeout(playNote, 100);
  } catch (e) {}
};

const stopBgm = () => {
  try {
    if (bgmOscillator) {
      bgmOscillator.stop();
      bgmOscillator = null;
    }
  } catch (e) {}
};

const initialMap = [
  [0, 0, 0, 3, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 2, 0, 0, 0],
];

const PATH = [
  { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 },
  { row: 1, col: 6 }, { row: 2, col: 6 }, { row: 3, col: 6 },
  { row: 3, col: 5 }, { row: 3, col: 4 }, { row: 3, col: 3 },
  { row: 4, col: 3 }, { row: 5, col: 3 }, { row: 6, col: 3 },
  { row: 6, col: 4 }, { row: 6, col: 5 }, { row: 6, col: 6 },
  { row: 7, col: 6 }, { row: 8, col: 6 }, { row: 9, col: 6 },
];

const GRID_SIZE = 10;
const TOWER_COST = 50;
const INITIAL_GOLD = 350;
const BASE_MAX_HP = 100;
const MAX_ROUNDS = 10;
const MAX_STAGES = 9;

const DIFFICULTY_SETTINGS = {
  easy: { name: 'Easy', color: '#4a90d9', enemyHpMult: 0.7, enemySpeedMult: 0.85, goldMult: 1.3, baseDamageMult: 0.6 },
  normal: { name: 'Normal', color: '#44cc44', enemyHpMult: 1.0, enemySpeedMult: 1.0, goldMult: 1.0, baseDamageMult: 1.0 },
  hard: { name: 'Hard', color: '#ff4444', enemyHpMult: 1.4, enemySpeedMult: 1.15, goldMult: 0.8, baseDamageMult: 1.3 },
};

const EVOLUTION_COLORS = ['#ffd700', '#00aaff', '#ff4466', '#aa00ff'];
const EVOLUTION_NAMES = ['', '블루', '레드', '퍼플'];

const getUpgradeCost = (level, evolution) => 30 + (level * 10) + (evolution * 40);

const TOWER_BASE_STATS = {
  basic: { damage: 25, range: 2.2, attackInterval: 1000, aoe: false, aoeRadius: 0 },
  red: { damage: 60, range: 2.0, attackInterval: 1100, aoe: false, aoeRadius: 0 },
  yellow: { damage: 20, range: 2.2, attackInterval: 900, aoe: true, aoeRadius: 1.2 },
  black: { damage: 35, range: 3.5, attackInterval: 850, aoe: false, aoeRadius: 0 },
  green: { damage: 15, range: 2.0, attackInterval: 350, aoe: false, aoeRadius: 0 },
};

const TOWER_COLORS = { basic: '#4a90d9', red: '#ff4444', yellow: '#ffcc00', black: '#333333', green: '#44cc44' };
const TOWER_NAMES = { red: '파워', yellow: '범위', black: '원거리', green: '스피드' };
const PROJECTILE_COLORS = { basic: '#ffdd00', red: '#ff6600', yellow: '#ffff00', black: '#aaaaaa', green: '#88ff88' };

const TRAITS = {
  criticalHit: { name: '치명타', desc: '20% 2배', icon: '💥' },
  slow: { name: '감속', desc: '30% 감속', icon: '❄️' },
  burn: { name: '화상', desc: '지속 피해', icon: '🔥' },
  multishot: { name: '다중', desc: '2명 동시 공격', icon: '⚔️' },
  goldBonus: { name: '골드+', desc: '+20%', icon: '💰' },
  vampiric: { name: '흡혈', desc: 'HP+1', icon: '🩸' },
  explosive: { name: '폭발', desc: '주변 피해', icon: '💣' },
  piercing: { name: '관통', desc: '+15% 피해', icon: '🎯' },
};

const TRAIT_LIST = Object.keys(TRAITS);
// 특성 최대 레벨은 스테이지에 따라 결정 (함수로 관리)
const MAX_HERO_LEVEL = 5;
const SELL_REFUND_RATE = 0.5;
const SECONDARY_TYPE_COST = 300;

const TRAIT_EFFECTS = {
  criticalHit: [{ chance: 0.2, mult: 2 }, { chance: 0.3, mult: 2.5 }, { chance: 0.4, mult: 3 }],
  slow: [{ amount: 0.7, duration: 2000 }, { amount: 0.55, duration: 2500 }, { amount: 0.4, duration: 3000 }],
  burn: [{ mult: 0.25, duration: 3000 }, { mult: 0.4, duration: 4000 }, { mult: 0.6, duration: 5000 }],
  multishot: [{ targets: 2 }, { targets: 3 }, { targets: 4 }],
  goldBonus: [{ mult: 1.2 }, { mult: 1.4 }, { mult: 1.6 }],
  vampiric: [{ hp: 1 }, { hp: 2 }, { hp: 3 }],
  explosive: [{ damage: 25, radius: 1.5 }, { damage: 50, radius: 2.0 }, { damage: 80, radius: 2.5 }],
  piercing: [{ mult: 1.15 }, { mult: 1.3 }, { mult: 1.5 }],
};

const getTraitUpgradeCost = (currentLevel) => 60 + currentLevel * 50;
const getHeroUpgradeCost = (heroLevel) => 200 + heroLevel * 150;

// 고유 특성(퍽) 시스템 - 최대 레벨 3
const PERK_MAX_LEVEL = 3;
const PERKS = [
  {
    id: 'startGold',
    name: '시작 골드',
    icon: '💰',
    desc: '게임 시작 시 추가 골드',
    levels: ['+100G', '+200G', '+300G'],
    values: [100, 200, 300]
  },
  {
    id: 'towerDamage',
    name: '공격력 강화',
    icon: '⚔️',
    desc: '모든 타워 공격력 증가',
    levels: ['+10%', '+20%', '+30%'],
    values: [0.1, 0.2, 0.3]
  },
  {
    id: 'towerRange',
    name: '사거리 강화',
    icon: '🔭',
    desc: '모든 타워 사거리 증가',
    levels: ['+10%', '+20%', '+30%'],
    values: [0.1, 0.2, 0.3]
  },
  {
    id: 'towerSpeed',
    name: '공격속도 강화',
    icon: '⚡',
    desc: '모든 타워 공격속도 증가',
    levels: ['+10%', '+20%', '+30%'],
    values: [0.1, 0.2, 0.3]
  },
  {
    id: 'baseHp',
    name: '기지 체력',
    icon: '❤️',
    desc: '기지 최대 체력 증가',
    levels: ['+20', '+40', '+60'],
    values: [20, 40, 60]
  },
  {
    id: 'goldIncome',
    name: '골드 수입',
    icon: '🪙',
    desc: '적 처치 시 추가 골드',
    levels: ['+15%', '+30%', '+45%'],
    values: [0.15, 0.30, 0.45]
  },
  {
    id: 'traitDiscount',
    name: '특성 할인',
    icon: '✨',
    desc: '타워 특성 비용 감소',
    levels: ['-20%', '-35%', '-50%'],
    values: [0.2, 0.35, 0.5]
  },
  {
    id: 'towerDiscount',
    name: '타워 할인',
    icon: '🔧',
    desc: '타워 설치 비용 감소',
    levels: ['-10G', '-20G', '-30G'],
    values: [10, 20, 30]
  },
];

// 스테이지별 신규 해금 내용
const STAGE_NEW_FEATURES = {
  1: [],
  2: ['⬆️ 진화 해금!', '✨ 특성 2개'],
  3: ['⬆️ 진화 2단계', '✨ 특성 3개'],
  4: ['⬆️ 진화 3단계 (MAX)', '✨ 특성 4개'],
  5: ['✨ 특성 5개'],
  6: ['🔄 특성 강화 Lv2 해금!', '✨ 특성 6개'],
  7: ['🔄 특성 강화 Lv3 해금!', '⭐ 히어로 타워 해금!', '✨ 특성 7개'],
  8: ['🔀 보조 타입 해금!', '✨ 특성 8개 (MAX)'],
  9: ['⭐⭐ 히어로 2개 가능!'],
};

const STAGE_ICONS = {
  1: '🏰', 2: '⬆️', 3: '⬆️', 4: '⬆️', 5: '✨',
  6: '🔄', 7: '⭐', 8: '🔀', 9: '⭐⭐',
};

const TUTORIAL_PAGES = [
  {
    title: '게임 목표', icon: '🏰',
    content: ['적들이 경로를 따라 기지로 이동합니다.', '타워를 설치해 적을 처치하세요!', '기지 HP가 0이 되면 게임 오버입니다.', '10라운드를 버티면 스테이지 클리어!'],
  },
  {
    title: '타워 설치', icon: '🔧',
    content: ['초록색 영역을 터치하면 타워 설치 (50G)', '설치 후 타워를 터치해 타입을 선택하세요.', '• 파워(빨강): 높은 데미지', '• 범위(노랑): 광역 공격', '• 원거리(검정): 긴 사거리', '• 스피드(초록): 빠른 공격'],
  },
  {
    title: '타워 강화', icon: '⬆️',
    content: ['타워를 터치하고 강화 버튼을 누르세요.', '레벨이 오르면 공격력/사거리/속도 증가!', '레벨 5 달성 시 진화 가능 (스테이지 2+)', '진화하면 더욱 강력해집니다.'],
  },
  {
    title: '특성 시스템', icon: '✨',
    content: ['타워에 특성을 부여할 수 있습니다.', '스테이지 번호 = 최대 특성 개수', '• 치명타: 20% 확률로 2배 데미지', '• 감속: 적 이동속도 감소', '• 다중 공격: 2명 동시 공격', '• 화상: 지속 데미지', '• 흡혈: 처치 시 기지 HP 회복'],
  },
  {
    title: '적 유형', icon: '👾',
    content: ['• 일반(빨강): 기본 적', '• 빠름(주황): 빠르지만 약함', '• 탱커(갈색): 느리지만 강함', '• 보스(보라): 매우 강력!', '후반 라운드일수록 적이 강해집니다.'],
  },
  {
    title: '전략 팁', icon: '💡',
    content: ['경로가 겹치는 곳에 타워 배치가 효과적!', '다양한 타워 조합을 시도해보세요.', '골드를 아껴두고 급할 때 사용하세요.', '감속 특성으로 보스를 늦추세요!', '준비가 되셨나요? 행운을 빕니다!'],
  },
];

const getTowerStats = (type, level, evolution, heroLevel = 0, secondaryType = null) => {
  const base = TOWER_BASE_STATS[type];
  const totalLevel = evolution * 5 + level;
  const damageMultiplier = 1 + (totalLevel - 1) * 0.12 + evolution * 0.25 + heroLevel * 0.2;
  const rangeBonus = (totalLevel - 1) * 0.05 + evolution * 0.2 + heroLevel * 0.15;
  const intervalReduction = (totalLevel - 1) * 15 + evolution * 40 + heroLevel * 30;
  const aoeBonus = base.aoe ? (totalLevel - 1) * 0.1 + evolution * 0.3 : 0;
  let damage = Math.round(base.damage * damageMultiplier);
  let range = base.range + rangeBonus;
  let attackInterval = Math.max(type === 'green' ? 150 : 300, base.attackInterval - intervalReduction);
  let aoe = base.aoe;
  let aoeRadius = base.aoeRadius + aoeBonus;
  if (secondaryType) {
    switch (secondaryType) {
      case 'red': damage = Math.round(damage * 1.4); break;
      case 'yellow': aoe = true; aoeRadius = Math.max(aoeRadius, 0.8); break;
      case 'black': range *= 1.4; break;
      case 'green': attackInterval = Math.max(150, Math.round(attackInterval * 0.6)); break;
    }
  }
  return { damage, range, attackInterval, aoe, aoeRadius };
};

const ENEMY_TYPES = {
  normal: { hp: 120, speed: 0.032, size: 0.55, color: '#ff4444', reward: 18 },
  fast: { hp: 60, speed: 0.055, size: 0.45, color: '#ff8844', reward: 14 },
  tank: { hp: 400, speed: 0.02, size: 0.7, color: '#884444', reward: 30 },
  boss: { hp: 1200, speed: 0.015, size: 0.9, color: '#8800ff', reward: 100 },
};

const ROUND_CONFIG = [
  { normal: 4, fast: 2, tank: 0, boss: false, hpMult: 0.6, speedMult: 0.9 },
  { normal: 6, fast: 3, tank: 0, boss: false, hpMult: 0.8, speedMult: 0.95 },
  { normal: 8, fast: 4, tank: 1, boss: false, hpMult: 1.0, speedMult: 1.0 },
  { normal: 10, fast: 5, tank: 2, boss: true, hpMult: 1.2, speedMult: 1.0 },
  { normal: 12, fast: 7, tank: 3, boss: false, hpMult: 1.5, speedMult: 1.05 },
  { normal: 15, fast: 9, tank: 4, boss: true, hpMult: 1.9, speedMult: 1.1 },
  { normal: 18, fast: 12, tank: 5, boss: false, hpMult: 2.4, speedMult: 1.15 },
  { normal: 22, fast: 15, tank: 6, boss: true, hpMult: 3.0, speedMult: 1.2 },
  { normal: 26, fast: 18, tank: 8, boss: true, hpMult: 3.8, speedMult: 1.25 },
  { normal: 30, fast: 22, tank: 10, boss: true, hpMult: 5.0, speedMult: 1.3 },
];

const MAX_PROJECTILES = 100;
const MAX_DAMAGE_TEXTS = 60;
const DAMAGE_TEXT_DURATION = 800;
const ENEMY_DEATH_DELAY = 500;

const getCellClassName = (cellType) => {
  switch (cellType) {
    case 0: return 'cell cell-buildable';
    case 1: return 'cell cell-path';
    case 2: return 'cell cell-base';
    case 3: return 'cell cell-spawn';
    default: return 'cell';
  }
};

const getDistance = (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

let enemyIdCounter = 0;
let projectileIdCounter = 0;
let dmgTextIdCounter = 0;

const GAME_VERSION = '1.5';
const SAVE_KEY = 'core_guardian_save';

// 저장 데이터 불러오기
const loadSaveData = () => {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      return {
        unlockedStagesByDifficulty: data.unlockedStagesByDifficulty || { easy: [1], normal: [1], hard: [1] },
        perks: data.perks || [],
        soundEnabled: data.soundEnabled !== undefined ? data.soundEnabled : true,
      };
    }
  } catch (e) {
    console.warn('Failed to load save data:', e);
  }
  return null;
};

// 데이터 저장
const saveGameData = (unlockedStagesByDifficulty, perks, soundEnabled) => {
  try {
    const data = { unlockedStagesByDifficulty, perks, soundEnabled, version: GAME_VERSION };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save game data:', e);
  }
};

// 초기 저장 데이터 로드 (한 번만 실행)
const initialSaveData = loadSaveData();

function GameBoard() {
  const [gameState, setGameState] = useState('menu');
  const [difficulty, setDifficulty] = useState('normal');
  const [currentStage, setCurrentStage] = useState(1);
  // 난이도별 스테이지 해금 상태
  const [unlockedStagesByDifficulty, setUnlockedStagesByDifficulty] = useState(
    initialSaveData?.unlockedStagesByDifficulty || { easy: [1], normal: [1], hard: [1] }
  );
  const [soundEnabled, setSoundEnabled] = useState(initialSaveData?.soundEnabled ?? true);
  const [tutorialPage, setTutorialPage] = useState(0);

  // 일시정지 & 속도 조절
  const [isPaused, setIsPaused] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(1);

  const [, forceUpdate] = useState(0);
  const [towers, setTowers] = useState([]);
  const [gold, setGold] = useState(INITIAL_GOLD);
  const [baseHp, setBaseHp] = useState(BASE_MAX_HP);
  const [currentRound, setCurrentRound] = useState(0);
  const [roundInProgress, setRoundInProgress] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [selectedTower, setSelectedTower] = useState(null);
  const [showTypeSelect, setShowTypeSelect] = useState(false);
  const [showTraitPanel, setShowTraitPanel] = useState(false);
  const [showSecondaryTypeSelect, setShowSecondaryTypeSelect] = useState(false);
  const [cellSize, setCellSize] = useState(32);

  // 퍽 시스템
  const [perks, setPerks] = useState(initialSaveData?.perks || []);
  const [showPerkSelect, setShowPerkSelect] = useState(false);
  const [perkChoices, setPerkChoices] = useState([]);

  // 자동 저장 (스테이지 해금, 퍽, 사운드 설정 변경 시)
  useEffect(() => {
    saveGameData(unlockedStagesByDifficulty, perks, soundEnabled);
  }, [unlockedStagesByDifficulty, perks, soundEnabled]);

  // 스테이지 알림
  const [stageNotification, setStageNotification] = useState(null);

  // 고유 특성 설명 (선택된 특성)
  const [expandedPerkId, setExpandedPerkId] = useState(null);

  const boardRef = useRef(null);
  const enemiesRef = useRef([]);
  const towersRef = useRef([]);
  const projectilesRef = useRef([]);
  const damageTextsRef = useRef([]);
  const goldRef = useRef(INITIAL_GOLD);
  const baseHpRef = useRef(BASE_MAX_HP);
  const animationFrameRef = useRef();
  const spawnQueueRef = useRef([]);
  const lastSpawnTimeRef = useRef(0);
  const roundInProgressRef = useRef(false);
  const currentRoundRef = useRef(0);
  const lastShootTimeRef = useRef(0);
  const isPausedRef = useRef(false);
  const gameSpeedRef = useRef(1);

  // 현재 난이도의 해금된 스테이지
  const unlockedStages = unlockedStagesByDifficulty[difficulty] || [1];
  const difficultySettings = DIFFICULTY_SETTINGS[difficulty];

  // isPaused, gameSpeed ref 동기화
  isPausedRef.current = isPaused;
  gameSpeedRef.current = gameSpeed;
  const maxTraitsPerTower = Math.min(currentStage, TRAIT_LIST.length);
  const maxEvolution = Math.min(Math.max(0, currentStage - 1), 3);
  const canUpgradeTraits = currentStage >= 6;
  const maxHeroTowers = currentStage >= 9 ? 2 : currentStage >= 7 ? 1 : 0;
  const canAddSecondaryType = currentStage >= 8;
  const traitMaxLevel = currentStage >= 7 ? 3 : currentStage >= 6 ? 2 : 1;

  // 퍽 효과 계산 (레벨 기반)
  const getPerkLevel = (id) => {
    const perk = perks.find(p => p.id === id);
    return perk ? perk.level : 0;
  };
  const getPerkValue = (id) => {
    const level = getPerkLevel(id);
    if (level === 0) return 0;
    const perkDef = PERKS.find(p => p.id === id);
    return perkDef ? perkDef.values[level - 1] : 0;
  };

  const effectiveTowerCost = Math.max(10, TOWER_COST - getPerkValue('towerDiscount'));
  const effectiveStartGold = INITIAL_GOLD + getPerkValue('startGold');
  const effectiveBaseHp = BASE_MAX_HP + getPerkValue('baseHp');
  const perkTraitDiscount = Math.max(0.5, 1 - getPerkValue('traitDiscount'));
  const perkDmgMult = 1 + getPerkValue('towerDamage');
  const perkRangeMult = 1 + getPerkValue('towerRange');
  const perkSpdDiv = 1 + getPerkValue('towerSpeed');
  const perkGoldMult = 1 + getPerkValue('goldIncome');

  useEffect(() => {
    const updateCellSize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxBoardWidth = Math.min(vw - 20, 400);
      const maxBoardHeight = vh * 0.5;
      const sizeByWidth = Math.floor(maxBoardWidth / GRID_SIZE);
      const sizeByHeight = Math.floor(maxBoardHeight / GRID_SIZE);
      setCellSize(Math.min(sizeByWidth, sizeByHeight, 40));
    };
    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    return () => window.removeEventListener('resize', updateCellSize);
  }, []);

  const gridToPixel = useCallback((row, col) => ({
    x: (col + 0.5) * cellSize,
    y: (row + 0.5) * cellSize,
  }), [cellSize]);

  const hasTowerAt = (row, col) => towersRef.current.some((t) => t.row === row && t.col === col);
  const getTowerAt = (row, col) => towersRef.current.find((t) => t.row === row && t.col === col);
  const getStageMultiplier = () => 1 + (currentStage - 1) * 0.4;

  const playSoundEffect = useCallback((type) => {
    if (soundEnabled) playSound(type);
  }, [soundEnabled]);

  const getEffectiveTraitCost = (traitsLength) => {
    return Math.round((80 + traitsLength * 40) * perkTraitDiscount);
  };

  const resetGame = () => {
    enemiesRef.current = [];
    towersRef.current = [];
    projectilesRef.current = [];
    damageTextsRef.current = [];
    goldRef.current = effectiveStartGold;
    baseHpRef.current = effectiveBaseHp;
    spawnQueueRef.current = [];
    lastSpawnTimeRef.current = 0;
    roundInProgressRef.current = false;
    currentRoundRef.current = 0;
    enemyIdCounter = 0;
    projectileIdCounter = 0;
    dmgTextIdCounter = 0;

    setTowers([]);
    setGold(effectiveStartGold);
    setBaseHp(effectiveBaseHp);
    setCurrentRound(0);
    setRoundInProgress(false);
    setGameOver(false);
    setGameWon(false);
    setSelectedTower(null);
    setShowTypeSelect(false);
    setShowTraitPanel(false);
    setShowSecondaryTypeSelect(false);
    setShowPerkSelect(false);
    setIsPaused(false);
    setGameSpeed(1);
  };

  const startGame = () => {
    resetGame();
    setGameState('playing');
    if (soundEnabled) startBgm();
    // 스테이지 알림 표시
    const features = STAGE_NEW_FEATURES[currentStage];
    if (features && features.length > 0) {
      setStageNotification({ stage: currentStage, features });
      setTimeout(() => setStageNotification(null), 3500);
    }
  };

  const goToMenu = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    stopBgm();
    resetGame();
    setStageNotification(null);
    setGameState('menu');
  };

  const resetAllData = () => {
    if (window.confirm('모든 진행 상황이 초기화됩니다. 계속하시겠습니까?')) {
      localStorage.removeItem(SAVE_KEY);
      setUnlockedStagesByDifficulty({ easy: [1], normal: [1], hard: [1] });
      setPerks([]);
      playSoundEffect('click');
    }
  };

  const selectPerk = (perkId) => {
    setPerks(prev => {
      const existing = prev.find(p => p.id === perkId);
      if (existing) {
        // 기존 퍽 레벨업
        return prev.map(p =>
          p.id === perkId ? { ...p, level: Math.min(p.level + 1, PERK_MAX_LEVEL) } : p
        );
      } else {
        // 새 퍽 추가
        return [...prev, { id: perkId, level: 1 }];
      }
    });
    setShowPerkSelect(false);
    playSoundEffect('upgrade');
  };

  const handleCellClick = (row, col, cellType) => {
    if (gameOver || gameWon) return;
    const existingTower = getTowerAt(row, col);
    if (existingTower) {
      playSoundEffect('click');
      if (selectedTower && selectedTower.id === existingTower.id) {
        setSelectedTower(null);
        setShowTypeSelect(false);
        setShowTraitPanel(false);
      } else {
        setSelectedTower(existingTower);
        setShowTypeSelect(existingTower.type === 'basic' && existingTower.level === 1 && existingTower.evolution === 0);
        setShowTraitPanel(false);
        setShowSecondaryTypeSelect(false);
      }
      return;
    }
    if (cellType !== 0) return;
    if (goldRef.current < effectiveTowerCost) return;
    playSoundEffect('place');
    setSelectedTower(null);
    setShowTypeSelect(false);
    setShowTraitPanel(false);
    setShowSecondaryTypeSelect(false);

    const towerId = `tower-${row}-${col}`;
    const newTower = {
      id: towerId, row, col, type: 'basic', level: 1, evolution: 0,
      lastAttackTime: 0, traits: [], traitLevels: {},
      isHero: false, heroLevel: 0, secondaryType: null,
      totalInvested: effectiveTowerCost,
    };
    towersRef.current.push(newTower);
    goldRef.current -= effectiveTowerCost;
    setTowers([...towersRef.current]);
    setGold(goldRef.current);
  };

  const selectTowerType = (towerType) => {
    if (!selectedTower) return;
    const cost = getUpgradeCost(1, 0);
    if (goldRef.current < cost) return;
    playSoundEffect('upgrade');
    const tower = towersRef.current.find((t) => t.id === selectedTower.id);
    if (tower && tower.type === 'basic' && tower.level === 1 && tower.evolution === 0) {
      tower.type = towerType;
      tower.totalInvested = (tower.totalInvested || effectiveTowerCost) + cost;
      goldRef.current -= cost;
      setTowers([...towersRef.current]);
      setGold(goldRef.current);
      setSelectedTower({ ...tower });
      setShowTypeSelect(false);
    }
  };

  const upgradeTower = () => {
    if (!selectedTower) return;
    const tower = towersRef.current.find((t) => t.id === selectedTower.id);
    if (!tower || tower.type === 'basic') return;
    const cost = getUpgradeCost(tower.level, tower.evolution);
    if (goldRef.current < cost) return;
    if (tower.level >= 5) {
      if (tower.evolution < maxEvolution) { tower.evolution++; tower.level = 1; playSoundEffect('upgrade'); }
    } else {
      tower.level++;
      playSoundEffect('upgrade');
    }
    tower.totalInvested = (tower.totalInvested || effectiveTowerCost) + cost;
    goldRef.current -= cost;
    setTowers([...towersRef.current]);
    setGold(goldRef.current);
    setSelectedTower({ ...tower });
  };

  const addTrait = (traitKey) => {
    if (!selectedTower) return;
    const tower = towersRef.current.find((t) => t.id === selectedTower.id);
    if (!tower || tower.traits.length >= maxTraitsPerTower || tower.traits.includes(traitKey)) return;
    const traitCost = getEffectiveTraitCost(tower.traits.length);
    if (goldRef.current < traitCost) return;
    playSoundEffect('upgrade');
    tower.traits.push(traitKey);
    tower.traitLevels[traitKey] = 1;
    tower.totalInvested = (tower.totalInvested || effectiveTowerCost) + traitCost;
    goldRef.current -= traitCost;
    setTowers([...towersRef.current]);
    setGold(goldRef.current);
    setSelectedTower({ ...tower });
  };

  const canUpgrade = (tower) => {
    if (!tower || tower.type === 'basic') return false;
    if (tower.level >= 5 && tower.evolution >= maxEvolution) return false;
    return goldRef.current >= getUpgradeCost(tower.level, tower.evolution);
  };

  const isMaxLevel = (tower) => tower && tower.level >= 5 && tower.evolution >= maxEvolution;

  const isFullyMaxed = (tower) => {
    if (!tower || tower.type === 'basic') return false;
    if (tower.evolution < maxEvolution || tower.level < 5) return false;
    if (tower.traits.length < maxTraitsPerTower) return false;
    if (canUpgradeTraits) {
      for (const trait of tower.traits) {
        if ((tower.traitLevels[trait] || 1) < traitMaxLevel) return false;
      }
    }
    return true;
  };

  const getHeroCount = () => towersRef.current.filter(t => t.isHero).length;

  const sellTower = () => {
    if (!selectedTower) return;
    const tower = towersRef.current.find(t => t.id === selectedTower.id);
    if (!tower) return;
    const refund = Math.floor((tower.totalInvested || effectiveTowerCost) * SELL_REFUND_RATE);
    goldRef.current += refund;
    towersRef.current = towersRef.current.filter(t => t.id !== tower.id);
    setTowers([...towersRef.current]);
    setGold(goldRef.current);
    setSelectedTower(null);
    setShowTypeSelect(false);
    setShowTraitPanel(false);
    setShowSecondaryTypeSelect(false);
    playSoundEffect('click');
  };

  const upgradeTraitLevel = (traitKey) => {
    if (!selectedTower || !canUpgradeTraits) return;
    const tower = towersRef.current.find(t => t.id === selectedTower.id);
    if (!tower || !tower.traits.includes(traitKey)) return;
    const currentLevel = tower.traitLevels[traitKey] || 1;
    if (currentLevel >= traitMaxLevel) return;
    const cost = getTraitUpgradeCost(currentLevel);
    if (goldRef.current < cost) return;
    playSoundEffect('upgrade');
    tower.traitLevels[traitKey] = currentLevel + 1;
    tower.totalInvested = (tower.totalInvested || effectiveTowerCost) + cost;
    goldRef.current -= cost;
    setTowers([...towersRef.current]);
    setGold(goldRef.current);
    setSelectedTower({ ...tower });
  };

  const promoteHero = () => {
    if (!selectedTower || maxHeroTowers <= 0) return;
    const tower = towersRef.current.find(t => t.id === selectedTower.id);
    if (!tower || tower.isHero || !isFullyMaxed(tower) || getHeroCount() >= maxHeroTowers) return;
    playSoundEffect('upgrade');
    tower.isHero = true;
    tower.heroLevel = 1;
    setTowers([...towersRef.current]);
    setSelectedTower({ ...tower });
  };

  const upgradeHero = () => {
    if (!selectedTower) return;
    const tower = towersRef.current.find(t => t.id === selectedTower.id);
    if (!tower || !tower.isHero || tower.heroLevel >= MAX_HERO_LEVEL) return;
    const cost = getHeroUpgradeCost(tower.heroLevel);
    if (goldRef.current < cost) return;
    playSoundEffect('upgrade');
    tower.heroLevel++;
    tower.totalInvested = (tower.totalInvested || effectiveTowerCost) + cost;
    goldRef.current -= cost;
    setTowers([...towersRef.current]);
    setGold(goldRef.current);
    setSelectedTower({ ...tower });
  };

  const addSecondaryType = (type) => {
    if (!selectedTower || !canAddSecondaryType) return;
    const tower = towersRef.current.find(t => t.id === selectedTower.id);
    if (!tower || tower.secondaryType || !isFullyMaxed(tower) || type === tower.type) return;
    if (goldRef.current < SECONDARY_TYPE_COST) return;
    playSoundEffect('upgrade');
    tower.secondaryType = type;
    tower.totalInvested = (tower.totalInvested || effectiveTowerCost) + SECONDARY_TYPE_COST;
    goldRef.current -= SECONDARY_TYPE_COST;
    setTowers([...towersRef.current]);
    setGold(goldRef.current);
    setSelectedTower({ ...tower });
    setShowSecondaryTypeSelect(false);
  };

  const startRound = () => {
    if (roundInProgress || currentRound >= MAX_ROUNDS) return;
    playSoundEffect('roundStart');
    const roundIndex = currentRound;
    currentRoundRef.current = roundIndex;
    const config = ROUND_CONFIG[roundIndex];
    const queue = [];
    const stageMult = getStageMultiplier();
    // 스테이지 6+: 초반 라운드 쉽게, R5부터 급격히 상승
    // R5~R10: 1.3x, 1.8x, 2.5x, 4.0x, 7.0x (30%,80%,150%,300%,600%)
    // R8~R10 (index 7~9): 20% 하향 적용
    const LATE_ROUND_MULTS = [1.3, 1.8, 2.5, 4.0, 7.0];
    let roundDiffMult = 1.0;
    if (currentStage >= 6) {
      if (roundIndex < 4) {
        // R1~R4: 초반 난이도 하락 (0.75 ~ 0.9)
        roundDiffMult = 0.75 + (roundIndex / 4) * 0.15;
      } else {
        // R5~R10 (index 4~9)
        roundDiffMult = LATE_ROUND_MULTS[Math.min(roundIndex - 4, LATE_ROUND_MULTS.length - 1)];
      }
      // 스테이지별 추가 배율: S7=1.2x, S8=1.5x, S9=2.0x
      const stageBonusMult = currentStage >= 9 ? 2.0 : currentStage >= 8 ? 1.5 : currentStage >= 7 ? 1.2 : 1.0;
      roundDiffMult *= stageBonusMult;

      // R8~R10 (index 7~9) 난이도 20% 하향
      if (roundIndex >= 7) {
        roundDiffMult *= 0.8;
      }
    }
    const hpMult = config.hpMult * stageMult * difficultySettings.enemyHpMult * roundDiffMult;
    const speedMult = (config.speedMult || 1.0) * (currentStage >= 6 ? (0.9 + Math.min(roundIndex / 9, 1) * 0.15) : 1.0);
    for (let i = 0; i < config.normal; i++) queue.push({ type: 'normal', hpMult, speedMult });
    for (let i = 0; i < config.fast; i++) queue.push({ type: 'fast', hpMult, speedMult });
    for (let i = 0; i < config.tank; i++) queue.push({ type: 'tank', hpMult, speedMult });
    if (config.boss) queue.push({ type: 'boss', hpMult, speedMult });
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    if (config.boss) {
      const bossIndex = queue.findIndex(e => e.type === 'boss');
      if (bossIndex !== -1) { const boss = queue.splice(bossIndex, 1)[0]; queue.push(boss); }
    }
    spawnQueueRef.current = queue;
    lastSpawnTimeRef.current = 0;
    setRoundInProgress(true);
    roundInProgressRef.current = true;
    setCurrentRound(roundIndex + 1);
  };

  const spawnEnemy = useCallback((enemyData) => {
    const startPos = gridToPixel(PATH[0].row, PATH[0].col);
    const stats = ENEMY_TYPES[enemyData.type];
    const hp = Math.round(stats.hp * enemyData.hpMult);
    const speedMult = enemyData.speedMult || 1.0;
    const finalSpeed = stats.speed * cellSize * difficultySettings.enemySpeedMult * speedMult;
    enemiesRef.current.push({
      id: enemyIdCounter++, type: enemyData.type,
      x: startPos.x, y: startPos.y, pathIndex: 0,
      hp, maxHp: hp, speed: finalSpeed, baseSpeed: finalSpeed,
      size: stats.size * cellSize, color: stats.color,
      reward: Math.round(stats.reward * (1 + enemyData.hpMult * 0.15) * difficultySettings.goldMult),
      slowUntil: 0, slowAmount: 0.7, burnUntil: 0, burnDamage: 0,
      dying: false, deathTime: 0,
    });
  }, [gridToPixel, cellSize, difficultySettings]);

  const spawnProjectile = (startX, startY, targetId, damage, color, aoe, aoeRadius, traits = [], towerType = 'basic', traitLevels = {}, isCritical = false) => {
    if (projectilesRef.current.length >= MAX_PROJECTILES) return;
    projectilesRef.current.push({
      id: projectileIdCounter++, x: startX, y: startY, targetId,
      damage, color, aoe, aoeRadius: aoeRadius * cellSize,
      traits, towerType, traitLevels, isCritical,
    });
  };

  const spawnDamageText = (x, y, value, isCritical) => {
    if (damageTextsRef.current.length >= MAX_DAMAGE_TEXTS) {
      damageTextsRef.current.shift();
    }
    damageTextsRef.current.push({
      id: dmgTextIdCounter++, x, y: y - 10,
      value: Math.round(value), isCritical,
      spawnTime: performance.now(),
    });
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    let lastTime = 0;
    const gameLoop = (currentTime) => {
      if (baseHpRef.current <= 0 || gameWon) return;

      // 일시정지 상태면 프레임만 요청하고 종료
      if (isPausedRef.current) {
        lastTime = currentTime;
        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // 속도 조절을 위한 델타 타임 계산
      const deltaTime = lastTime ? (currentTime - lastTime) * gameSpeedRef.current : 16;
      lastTime = currentTime;

      const enemies = enemiesRef.current;
      const towers = towersRef.current;
      const projectiles = projectilesRef.current;

      const baseSpawnInterval = Math.max(350, 700 - currentRoundRef.current * 25);
      const spawnInterval = baseSpawnInterval / gameSpeedRef.current;
      if (roundInProgressRef.current && spawnQueueRef.current.length > 0) {
        if (currentTime - lastSpawnTimeRef.current > spawnInterval) {
          spawnEnemy(spawnQueueRef.current.shift());
          lastSpawnTimeRef.current = currentTime;
        }
      }

      // 라운드 종료 체크 (dying 중인 적은 제외)
      const aliveEnemies = enemies.filter(e => !e.dying);
      if (roundInProgressRef.current && spawnQueueRef.current.length === 0 && aliveEnemies.length === 0) {
        roundInProgressRef.current = false;
        setRoundInProgress(false);
        if (currentRound >= MAX_ROUNDS) {
          setGameWon(true);
          stopBgm();
          playSoundEffect('victory');
          if (currentStage < MAX_STAGES && !unlockedStages.includes(currentStage + 1)) {
            setUnlockedStagesByDifficulty(prev => ({
              ...prev,
              [difficulty]: [...prev[difficulty], currentStage + 1],
            }));
          }
          // 퍽 선택 생성 (최대 레벨 퍽은 제외)
          const availablePerks = PERKS.filter(perk => {
            const currentLevel = perks.find(p => p.id === perk.id)?.level || 0;
            return currentLevel < PERK_MAX_LEVEL;
          });
          const shuffled = [...availablePerks].sort(() => Math.random() - 0.5);
          setPerkChoices(shuffled.slice(0, 3));
          setShowPerkSelect(true);
        }
      }

      // 상태 효과
      for (const enemy of enemies) {
        if (enemy.dying) continue;
        if (enemy.burnUntil > currentTime && enemy.burnDamage > 0) enemy.hp -= enemy.burnDamage / 60;
        if (enemy.slowUntil > currentTime) enemy.speed = enemy.baseSpeed * (enemy.slowAmount || 0.7);
        else enemy.speed = enemy.baseSpeed;
      }

      // 적 이동
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (enemy.dying) continue;
        if (enemy.pathIndex >= PATH.length - 1) {
          const baseDamage = enemy.type === 'boss' ? 25 : 8;
          const damage = Math.round(baseDamage * difficultySettings.baseDamageMult);
          baseHpRef.current -= damage;
          setBaseHp(baseHpRef.current);
          enemies.splice(i, 1);
          if (baseHpRef.current <= 0) {
            setGameOver(true);
            stopBgm();
            playSoundEffect('gameOver');
            return;
          }
          continue;
        }
        const nextPoint = PATH[enemy.pathIndex + 1];
        const targetPos = gridToPixel(nextPoint.row, nextPoint.col);
        const dx = targetPos.x - enemy.x;
        const dy = targetPos.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const moveSpeed = enemy.speed * gameSpeedRef.current;
        if (distance < moveSpeed) { enemy.x = targetPos.x; enemy.y = targetPos.y; enemy.pathIndex++; }
        else { enemy.x += (dx / distance) * moveSpeed; enemy.y += (dy / distance) * moveSpeed; }
      }

      // 타워 공격
      for (const tower of towers) {
        const rawStats = tower.type === 'basic'
          ? TOWER_BASE_STATS.basic
          : getTowerStats(tower.type, tower.level, tower.evolution, tower.heroLevel, tower.secondaryType);
        // 퍽 적용
        const stats = {
          ...rawStats,
          damage: Math.round(rawStats.damage * perkDmgMult),
          range: rawStats.range * perkRangeMult,
          attackInterval: Math.max(150, Math.round(rawStats.attackInterval / perkSpdDiv)),
        };
        const effectiveInterval = stats.attackInterval / gameSpeedRef.current;
        if (currentTime - tower.lastAttackTime < effectiveInterval) continue;

        const towerPos = gridToPixel(tower.row, tower.col);
        const rangeInPixels = stats.range * cellSize;

        const multishotEffect = tower.traits.includes('multishot')
          ? TRAIT_EFFECTS.multishot[(tower.traitLevels['multishot'] || 1) - 1] : null;
        const targetsNeeded = multishotEffect ? multishotEffect.targets : 1;
        const targets = [];

        const sortedEnemies = [...enemies]
          .filter(e => !e.dying)
          .map(enemy => ({ enemy, dist: getDistance(towerPos.x, towerPos.y, enemy.x, enemy.y) }))
          .filter(e => e.dist <= rangeInPixels)
          .sort((a, b) => a.dist - b.dist);

        for (let j = 0; j < Math.min(targetsNeeded, sortedEnemies.length); j++) {
          targets.push(sortedEnemies[j].enemy);
        }

        if (targets.length > 0) {
          for (const target of targets) {
            let damage = stats.damage;
            let isCritical = false;
            if (tower.traits.includes('criticalHit')) {
              const effect = TRAIT_EFFECTS.criticalHit[(tower.traitLevels['criticalHit'] || 1) - 1];
              if (Math.random() < effect.chance) { damage = Math.round(damage * effect.mult); isCritical = true; }
            }
            if (tower.traits.includes('piercing')) {
              const effect = TRAIT_EFFECTS.piercing[(tower.traitLevels['piercing'] || 1) - 1];
              damage = Math.round(damage * effect.mult);
            }
            const projectileColor = PROJECTILE_COLORS[tower.type] || '#ffdd00';
            spawnProjectile(
              towerPos.x, towerPos.y, target.id,
              damage, projectileColor, stats.aoe, stats.aoeRadius,
              tower.traits, tower.type, tower.traitLevels || {}, isCritical
            );
          }
          tower.lastAttackTime = currentTime;
          if (currentTime - lastShootTimeRef.current > 100) {
            if (soundEnabled) playSound('shoot');
            lastShootTimeRef.current = currentTime;
          }
        }
      }

      // 투사체
      const projectileSpeed = cellSize * 0.2 * gameSpeedRef.current;
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        const targetEnemy = enemies.find((e) => e.id === projectile.targetId);

        if (!targetEnemy || targetEnemy.dying) {
          projectiles.splice(i, 1);
          continue;
        }

        const dx = targetEnemy.x - projectile.x;
        const dy = targetEnemy.y - projectile.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const hitRadius = cellSize * 0.25;

        if (distance < hitRadius) {
          const applyDamage = (enemy, dmg, showText) => {
            enemy.hp -= dmg;
            if (showText) spawnDamageText(enemy.x, enemy.y, dmg, projectile.isCritical);
            if (projectile.traits.includes('slow')) {
              const eff = TRAIT_EFFECTS.slow[(projectile.traitLevels['slow'] || 1) - 1];
              enemy.slowUntil = currentTime + eff.duration;
              enemy.slowAmount = eff.amount;
            }
            if (projectile.traits.includes('burn')) {
              const eff = TRAIT_EFFECTS.burn[(projectile.traitLevels['burn'] || 1) - 1];
              enemy.burnUntil = currentTime + eff.duration;
              enemy.burnDamage = dmg * eff.mult;
            }
          };

          if (projectile.aoe && projectile.aoeRadius > 0) {
            for (const enemy of enemies) {
              if (enemy.dying) continue;
              const aoeDist = getDistance(targetEnemy.x, targetEnemy.y, enemy.x, enemy.y);
              if (aoeDist <= projectile.aoeRadius) {
                applyDamage(enemy, projectile.damage, enemy.id === targetEnemy.id);
              }
            }
          } else {
            applyDamage(targetEnemy, projectile.damage, true);
          }
          projectiles.splice(i, 1);
          continue;
        }

        projectile.x += (dx / distance) * projectileSpeed;
        projectile.y += (dy / distance) * projectileSpeed;
      }

      // 죽은 적 처리
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        // dying 상태 적 제거 (딜레이 후)
        if (enemy.dying) {
          if (currentTime - enemy.deathTime > ENEMY_DEATH_DELAY) {
            enemies.splice(i, 1);
          }
          continue;
        }

        if (enemy.hp <= 0) {
          // 보상 처리
          let reward = enemy.reward;
          let goldBonusMult = 1;
          for (const tower of towers) {
            if (tower.traits.includes('goldBonus')) {
              const eff = TRAIT_EFFECTS.goldBonus[(tower.traitLevels['goldBonus'] || 1) - 1];
              goldBonusMult = Math.max(goldBonusMult, eff.mult);
            }
          }
          reward = Math.round(reward * goldBonusMult * perkGoldMult);
          goldRef.current += reward;
          setGold(goldRef.current);

          for (const tower of towers) {
            if (tower.traits.includes('vampiric')) {
              const eff = TRAIT_EFFECTS.vampiric[(tower.traitLevels['vampiric'] || 1) - 1];
              baseHpRef.current = Math.min(effectiveBaseHp, baseHpRef.current + eff.hp);
              setBaseHp(baseHpRef.current);
              break;
            }
          }

          for (const tower of towers) {
            if (tower.traits.includes('explosive')) {
              const eff = TRAIT_EFFECTS.explosive[(tower.traitLevels['explosive'] || 1) - 1];
              for (const other of enemies) {
                if (other.id !== enemy.id && !other.dying) {
                  const dist = getDistance(enemy.x, enemy.y, other.x, other.y);
                  if (dist < cellSize * eff.radius) other.hp -= eff.damage;
                }
              }
              break;
            }
          }

          if (soundEnabled) playSound('kill');
          // dying 상태로 전환 (즉시 제거하지 않음)
          enemy.dying = true;
          enemy.deathTime = currentTime;
          enemy.hp = 0;
        }
      }

      // 데미지 텍스트 정리
      const now = performance.now();
      damageTextsRef.current = damageTextsRef.current.filter(t => now - t.spawnTime < DAMAGE_TEXT_DURATION);

      forceUpdate((n) => n + 1);
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [gameState, currentRound, gameWon, currentStage, difficulty, cellSize, gridToPixel, spawnEnemy, playSoundEffect, soundEnabled, unlockedStages, difficultySettings, perkDmgMult, perkRangeMult, perkSpdDiv, perkGoldMult, effectiveBaseHp]);

  const enemies = enemiesRef.current;
  const projectiles = projectilesRef.current;
  const damageTexts = damageTextsRef.current;

  const renderStars = (level, evolution) => {
    const stars = [];
    const color = EVOLUTION_COLORS[evolution];
    for (let i = 0; i < level; i++) {
      stars.push(<span key={i} style={{ color, textShadow: `0 0 3px ${color}` }}>★</span>);
    }
    return stars;
  };

  const boardSize = cellSize * GRID_SIZE;

  // 메인 메뉴
  if (gameState === 'menu') {
    return (
      <div className="menu-container">
        <h1 className="game-title">Core Guardian</h1>
        <p className="menu-desc">각자만의 특성이 있는 타워 블록으로<br/>기지를 지켜보세요!</p>
        <div className="difficulty-section">
          <div className="section-label">난이도</div>
          <div className="difficulty-buttons">
            {Object.entries(DIFFICULTY_SETTINGS).map(([key, settings]) => (
              <button key={key} className={`difficulty-btn ${difficulty === key ? 'selected' : ''}`}
                style={{ borderColor: difficulty === key ? settings.color : '#555', backgroundColor: difficulty === key ? settings.color : '#3a3a50', boxShadow: difficulty === key ? `0 0 15px ${settings.color}` : 'none' }}
                onClick={() => { setDifficulty(key); playSoundEffect('click'); }}>
                {settings.name}
              </button>
            ))}
          </div>
        </div>
        <div className="menu-buttons">
          <button className="start-btn" onClick={() => { playSoundEffect('click'); setGameState('stageSelect'); }}>게임 시작</button>
          <button className="tutorial-btn" onClick={() => { playSoundEffect('click'); setTutorialPage(0); setGameState('tutorial'); }}>📖 튜토리얼</button>
        </div>
        <div className="menu-bottom-btns">
          <button className="sound-toggle" onClick={() => setSoundEnabled(!soundEnabled)}>
            {soundEnabled ? '🔊 사운드 ON' : '🔇 사운드 OFF'}
          </button>
          <button className="reset-data-btn" onClick={resetAllData}>
            🗑️ 데이터 초기화
          </button>
        </div>
        <div className="version-display">Core Guardian v{GAME_VERSION}</div>
      </div>
    );
  }

  // 튜토리얼
  if (gameState === 'tutorial') {
    const page = TUTORIAL_PAGES[tutorialPage];
    const isLastPage = tutorialPage === TUTORIAL_PAGES.length - 1;
    const isFirstPage = tutorialPage === 0;
    return (
      <div className="menu-container">
        <div className="tutorial-card">
          <div className="tutorial-header">
            <span className="tutorial-icon">{page.icon}</span>
            <h2 className="tutorial-title">{page.title}</h2>
          </div>
          <div className="tutorial-content">
            {page.content.map((line, idx) => (<p key={idx} className="tutorial-line">{line}</p>))}
          </div>
          <div className="tutorial-progress">
            {TUTORIAL_PAGES.map((_, idx) => (
              <span key={idx} className={`progress-dot ${idx === tutorialPage ? 'active' : ''}`}
                onClick={() => { playSoundEffect('click'); setTutorialPage(idx); }} />
            ))}
          </div>
          <div className="tutorial-nav">
            <button className="nav-btn" style={{ visibility: isFirstPage ? 'hidden' : 'visible' }}
              onClick={() => { playSoundEffect('click'); setTutorialPage(tutorialPage - 1); }}>◀ 이전</button>
            {isLastPage ? (
              <button className="nav-btn primary" onClick={() => { playSoundEffect('click'); setGameState('menu'); }}>완료 ✓</button>
            ) : (
              <button className="nav-btn primary" onClick={() => { playSoundEffect('click'); setTutorialPage(tutorialPage + 1); }}>다음 ▶</button>
            )}
          </div>
        </div>
        <button className="back-btn" onClick={() => { playSoundEffect('click'); setGameState('menu'); }}>메뉴로</button>
      </div>
    );
  }

  // 스테이지 선택
  if (gameState === 'stageSelect') {
    return (
      <div className="menu-container">
        <h2 className="stage-title">스테이지 선택</h2>
        <div className="menu-desc">난이도: {DIFFICULTY_SETTINGS[difficulty].name}</div>

        {/* 보유 퍽 표시 */}
        <div className="perks-display">
          <div className="section-label">보유 고유 특성</div>
          {perks.length > 0 ? (
            <>
              <div className="perks-grid">
                {perks.map(perkData => {
                  const perk = PERKS.find(p => p.id === perkData.id);
                  if (!perk) return null;
                  const isSelected = expandedPerkId === perk.id;
                  return (
                    <div
                      key={perk.id}
                      className={`perk-icon-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => setExpandedPerkId(isSelected ? null : perk.id)}
                    >
                      <span className="perk-icon">{perk.icon}</span>
                      <span className="perk-icon-level">Lv.{perkData.level}</span>
                    </div>
                  );
                })}
              </div>

              {/* 선택된 특성 설명 */}
              {expandedPerkId && (
                <div className="perk-detail-box">
                  {(() => {
                    const perk = PERKS.find(p => p.id === expandedPerkId);
                    const currentLevel = perks.find(p => p.id === expandedPerkId)?.level || 0;
                    return (
                      <>
                        <div className="perk-detail-header">
                          <span>{perk.icon}</span>
                          <span className="perk-detail-name">{perk.name}</span>
                          <span className="perk-detail-level">Lv.{currentLevel}/{PERK_MAX_LEVEL}</span>
                        </div>
                        <div className="perk-detail-desc">{perk.desc}</div>
                        <div className="perk-detail-levels">
                          {perk.levels.map((lvl, i) => (
                            <div key={i} className={`perk-detail-row ${currentLevel >= i + 1 ? 'active' : ''}`}>
                              <span>Lv.{i + 1}</span>
                              <span>{lvl}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </>
          ) : (
            <div className="perks-empty">스테이지 클리어 시 획득</div>
          )}
        </div>

        <div className="stage-grid">
          {Array.from({ length: MAX_STAGES }, (_, i) => i + 1).map((stage) => {
            const isUnlocked = unlockedStages.includes(stage);
            const stageMaxEvo = Math.min(Math.max(0, stage - 1), 3);
            const stageTraits = Math.min(stage, TRAIT_LIST.length);
            const icon = STAGE_ICONS[stage] || '🏰';
            return (
              <button key={stage} className={`stage-btn ${isUnlocked ? '' : 'locked'}`}
                onClick={() => { if (isUnlocked) { playSoundEffect('click'); setCurrentStage(stage); startGame(); } }}
                disabled={!isUnlocked}>
                <div className="stage-icon-top">{icon}</div>
                <div className="stage-number">Stage {stage}</div>
                <div className="stage-info">
                  {isUnlocked ? (
                    <>
                      <div>특성{stageTraits} 진화{stageMaxEvo > 0 ? stageMaxEvo : '-'}</div>
                      {stage >= 6 && <div className="stage-feature-icons">
                        {stage >= 6 && <span title="특성강화">🔄</span>}
                        {stage >= 7 && <span title="히어로">⭐</span>}
                        {stage >= 8 && <span title="보조타입">🔀</span>}
                        {stage >= 9 && <span title="히어로x2">⭐⭐</span>}
                      </div>}
                    </>
                  ) : (<div>🔒</div>)}
                </div>
              </button>
            );
          })}
        </div>

        <button className="back-btn" onClick={() => { playSoundEffect('click'); setGameState('menu'); }}>뒤로</button>
      </div>
    );
  }

  // 게임 플레이
  return (
    <div className="game-container">
      {/* 스테이지 시작 알림 */}
      {stageNotification && (
        <div className="stage-notification">
          <div className="stage-notif-title">Stage {stageNotification.stage}</div>
          {stageNotification.features.map((f, i) => (
            <div key={i} className="stage-notif-line">{f}</div>
          ))}
        </div>
      )}

      {/* 게임 오버 */}
      {gameOver && (
        <div className="game-overlay">
          <div className="game-message game-over">GAME OVER</div>
          <div className="game-submessage">Stage {currentStage} - Round {currentRound}</div>
          <div className="overlay-buttons">
            <button className="retry-btn" onClick={() => { playSoundEffect('click'); startGame(); }}>다시</button>
            <button className="menu-btn" onClick={() => { playSoundEffect('click'); goToMenu(); }}>메뉴</button>
          </div>
        </div>
      )}

      {/* 퍽 선택 화면 */}
      {gameWon && showPerkSelect && (
        <div className="game-overlay">
          <div className="game-message game-won">CLEAR!</div>
          <div className="game-submessage">Stage {currentStage} 클리어!</div>
          <div className="perk-select-title">고유 특성을 선택하세요</div>
          <div className="perk-select-list">
            {perkChoices.map((perk) => {
              const currentLevel = perks.find(p => p.id === perk.id)?.level || 0;
              const nextLevel = currentLevel + 1;
              return (
                <button key={perk.id} className="perk-select-item" onClick={() => selectPerk(perk.id)}>
                  <div className="perk-select-icon">{perk.icon}</div>
                  <div className="perk-select-info">
                    <div className="perk-select-name">
                      {perk.name}
                      {currentLevel > 0 && <span className="perk-current-level">Lv.{currentLevel}</span>}
                      <span className="perk-next-level">→ Lv.{nextLevel}</span>
                    </div>
                    <div className="perk-select-desc">{perk.desc}</div>
                    <div className="perk-select-effect">{perk.levels[nextLevel - 1]}</div>
                  </div>
                </button>
              );
            })}
          </div>
          {perkChoices.length === 0 && (
            <div className="perk-select-empty">
              <div>모든 특성이 최대 레벨입니다!</div>
              <button className="menu-btn" onClick={() => { setShowPerkSelect(false); playSoundEffect('click'); }}>확인</button>
            </div>
          )}
        </div>
      )}

      {/* 승리 (퍽 선택 후) */}
      {gameWon && !showPerkSelect && (
        <div className="game-overlay">
          <div className="game-message game-won">CLEAR!</div>
          <div className="game-submessage">Stage {currentStage} 클리어!</div>
          {currentStage < MAX_STAGES && (
            <div className="game-submessage">Stage {currentStage + 1} 해금!</div>
          )}
          <div className="overlay-buttons">
            <button className="menu-btn" onClick={() => { playSoundEffect('click'); goToMenu(); }}>메뉴</button>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="game-header">
        <button className="back-icon-btn" onClick={goToMenu}>✕</button>
        <div className="header-badges">
          <span className="badge">S{currentStage}</span>
          <span className="badge" style={{ backgroundColor: difficultySettings.color }}>{difficultySettings.name}</span>
        </div>
        <button className="sound-btn" onClick={() => setSoundEnabled(!soundEnabled)}>
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      {/* 상태 바 */}
      <div className="status-bar">
        <div className="status-item">
          <span>💰</span>
          <span className="gold-value">{gold}</span>
        </div>
        <div className="status-item">
          <span>R{currentRound}/{MAX_ROUNDS}</span>
        </div>
        <div className="status-item">
          <span>❤️</span>
          <div className="hp-bar-mini">
            <div className="hp-fill" style={{ width: `${(baseHp / effectiveBaseHp) * 100}%` }} />
          </div>
          <span>{baseHp}</span>
        </div>
      </div>

      {/* 라운드 버튼 */}
      <div className="round-btn-area">
        {!roundInProgress && currentRound < MAX_ROUNDS && !gameOver && !gameWon ? (
          <button className="round-btn" onClick={startRound}>▶ Round {currentRound + 1}</button>
        ) : roundInProgress ? (
          <div className="round-status">{isPaused ? '일시정지' : '전투 중...'}</div>
        ) : null}
      </div>

      {/* 일시정지 & 속도 조절 */}
      <div className="game-controls">
        <button
          className={`control-btn ${isPaused ? 'active' : ''}`}
          onClick={() => setIsPaused(!isPaused)}
          disabled={gameOver || gameWon}
        >
          {isPaused ? '▶' : '⏸'}
        </button>
        <div className="speed-controls">
          {[1, 2, 3].map((speed) => (
            <button
              key={speed}
              className={`speed-btn ${gameSpeed === speed ? 'active' : ''}`}
              onClick={() => setGameSpeed(speed)}
              disabled={gameOver || gameWon}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* 타워 타입 선택 */}
      {selectedTower && showTypeSelect && (
        <div className="panel">
          <div className="panel-title">타워 선택 ({getUpgradeCost(1, 0)}G)</div>
          <div className="tower-options">
            {[
              { type: 'red', name: '파워', desc: '고데미지', color: '#ff4444' },
              { type: 'yellow', name: '범위', desc: '광역', color: '#ffcc00' },
              { type: 'black', name: '원거리', desc: '장거리', color: '#333' },
              { type: 'green', name: '스피드', desc: '빠름', color: '#44cc44' },
            ].map(t => (
              <button key={t.type} className="tower-option" onClick={() => selectTowerType(t.type)} disabled={gold < getUpgradeCost(1, 0)}>
                <div className="tower-icon" style={{ backgroundColor: t.color }} />
                <div className="tower-label"><div>{t.name}</div><small>{t.desc}</small></div>
              </button>
            ))}
          </div>
          <div className="panel-bottom-btns">
            <button className="sell-btn" onClick={sellTower}>
              판매 ({Math.floor((selectedTower.totalInvested || effectiveTowerCost) * SELL_REFUND_RATE)}G)
            </button>
            <button className="close-btn" onClick={() => { setSelectedTower(null); setShowTypeSelect(false); }}>닫기</button>
          </div>
        </div>
      )}

      {/* 업그레이드 패널 */}
      {selectedTower && !showTypeSelect && selectedTower.type !== 'basic' && (
        <div className="panel">
          <div className="panel-title">
            {selectedTower.isHero && '⭐ '}
            {TOWER_NAMES[selectedTower.type]}
            {selectedTower.evolution > 0 && ` [${EVOLUTION_NAMES[selectedTower.evolution]}]`}
            {selectedTower.secondaryType && ` + ${TOWER_NAMES[selectedTower.secondaryType]}`}
          </div>
          <div className="tower-info">
            <div className="info-row"><span>레벨</span><span>{renderStars(selectedTower.level, selectedTower.evolution)}</span></div>
            {(() => {
              const raw = getTowerStats(selectedTower.type, selectedTower.level, selectedTower.evolution, selectedTower.heroLevel, selectedTower.secondaryType);
              const s = { damage: Math.round(raw.damage * perkDmgMult), range: raw.range * perkRangeMult, attackInterval: Math.max(150, Math.round(raw.attackInterval / perkSpdDiv)) };
              return (<>
                <div className="info-row"><span>공격력</span><span>{s.damage}</span></div>
                <div className="info-row"><span>사거리</span><span>{s.range.toFixed(1)}</span></div>
                <div className="info-row"><span>속도</span><span>{(1000 / s.attackInterval).toFixed(1)}/s</span></div>
              </>);
            })()}
            <div className="info-row"><span>특성</span><span>{selectedTower.traits.length}/{maxTraitsPerTower}</span></div>
            {maxEvolution > 0 && <div className="info-row"><span>진화</span><span>{selectedTower.evolution}/{maxEvolution}</span></div>}
            {selectedTower.isHero && <div className="info-row"><span>히어로</span><span style={{color:'#ffd700'}}>Lv.{selectedTower.heroLevel}/{MAX_HERO_LEVEL}</span></div>}
            {selectedTower.secondaryType && <div className="info-row"><span>보조</span><span style={{color:TOWER_COLORS[selectedTower.secondaryType]}}>{TOWER_NAMES[selectedTower.secondaryType]}</span></div>}
          </div>

          {selectedTower.traits.length > 0 && (
            <div className="trait-badges">
              {selectedTower.traits.map((traitKey) => (
                <span key={traitKey} className="trait-badge-small">
                  {TRAITS[traitKey].icon}
                  {canUpgradeTraits && <span className="trait-level-badge">Lv{selectedTower.traitLevels[traitKey] || 1}</span>}
                </span>
              ))}
            </div>
          )}

          {!isMaxLevel(selectedTower) ? (
            <button className="action-btn" onClick={upgradeTower} disabled={!canUpgrade(selectedTower)}>
              {selectedTower.level >= 5 ? (maxEvolution > selectedTower.evolution ? '진화' : 'MAX') : '강화'} ({getUpgradeCost(selectedTower.level, selectedTower.evolution)}G)
            </button>
          ) : (<div className="max-text">MAX LEVEL</div>)}

          {isFullyMaxed(selectedTower) && maxHeroTowers > 0 && !selectedTower.isHero && getHeroCount() < maxHeroTowers && (
            <button className="action-btn hero-btn" onClick={promoteHero}>⭐ 히어로 승격</button>
          )}
          {selectedTower.isHero && selectedTower.heroLevel < MAX_HERO_LEVEL && (
            <button className="action-btn hero-btn" onClick={upgradeHero} disabled={gold < getHeroUpgradeCost(selectedTower.heroLevel)}>
              ⭐ 히어로 강화 ({getHeroUpgradeCost(selectedTower.heroLevel)}G)
            </button>
          )}
          {selectedTower.isHero && selectedTower.heroLevel >= MAX_HERO_LEVEL && <div className="max-text">⭐ MAX HERO</div>}

          {isFullyMaxed(selectedTower) && canAddSecondaryType && !selectedTower.secondaryType && (
            <button className="action-btn secondary-btn" onClick={() => setShowSecondaryTypeSelect(!showSecondaryTypeSelect)}>
              🔀 보조 타입 추가 ({SECONDARY_TYPE_COST}G)
            </button>
          )}
          {showSecondaryTypeSelect && (
            <div className="tower-options">
              {['red','yellow','black','green'].filter(t => t !== selectedTower.type).map(t => (
                <button key={t} className="tower-option" onClick={() => addSecondaryType(t)} disabled={gold < SECONDARY_TYPE_COST}>
                  <div className="tower-icon" style={{ backgroundColor: TOWER_COLORS[t] }} />
                  <div className="tower-label"><div>{TOWER_NAMES[t]}</div>
                    <small>{t==='red'&&'공격력+40%'}{t==='yellow'&&'광역 공격'}{t==='black'&&'사거리+40%'}{t==='green'&&'속도+40%'}</small>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedTower.traits.length < maxTraitsPerTower && (
            <button className="trait-add-btn" onClick={() => setShowTraitPanel(!showTraitPanel)}>
              특성 추가 ({getEffectiveTraitCost(selectedTower.traits.length)}G)
            </button>
          )}
          {canUpgradeTraits && selectedTower.traits.length >= maxTraitsPerTower &&
            selectedTower.traits.some(t => (selectedTower.traitLevels[t] || 1) < traitMaxLevel) && (
            <button className="trait-add-btn" onClick={() => setShowTraitPanel(!showTraitPanel)}>특성 강화</button>
          )}

          {showTraitPanel && (
            <div className="trait-list">
              {TRAIT_LIST.map((traitKey) => {
                const trait = TRAITS[traitKey];
                const has = selectedTower.traits.includes(traitKey);
                const addCost = getEffectiveTraitCost(selectedTower.traits.length);
                const currentLevel = selectedTower.traitLevels[traitKey] || 1;
                const isTraitMaxed = currentLevel >= traitMaxLevel;
                const upgCost = getTraitUpgradeCost(currentLevel);
                const canUpgTrait = has && canUpgradeTraits && !isTraitMaxed;
                return (
                  <button key={traitKey}
                    className={`trait-item ${has ? 'owned' : ''} ${has && isTraitMaxed && canUpgradeTraits ? 'trait-maxed' : ''}`}
                    onClick={() => has ? (canUpgTrait ? upgradeTraitLevel(traitKey) : null) : addTrait(traitKey)}
                    disabled={has ? (!canUpgTrait || gold < upgCost) : (gold < addCost)}>
                    <span className="trait-icon-big">{trait.icon}</span>
                    <span className="trait-name">{trait.name}</span>
                    {has && canUpgradeTraits && <span className="trait-level-indicator">{isTraitMaxed ? 'MAX' : `Lv${currentLevel}`}</span>}
                    {!has && <span className="trait-cost-mini">{addCost}G</span>}
                    {has && canUpgTrait && <span className="trait-cost-mini">{upgCost}G</span>}
                  </button>
                );
              })}
            </div>
          )}

          <div className="panel-bottom-btns">
            <button className="sell-btn" onClick={sellTower}>
              판매 ({Math.floor((selectedTower.totalInvested || effectiveTowerCost) * SELL_REFUND_RATE)}G)
            </button>
            <button className="close-btn" onClick={() => { setSelectedTower(null); setShowTraitPanel(false); setShowSecondaryTypeSelect(false); }}>닫기</button>
          </div>
        </div>
      )}

      {/* 게임 보드 */}
      <div ref={boardRef} className="game-board" style={{ width: boardSize, height: boardSize }}
        onClick={() => { setSelectedTower(null); setShowTypeSelect(false); setShowTraitPanel(false); setShowSecondaryTypeSelect(false); }}>

        {initialMap.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div key={`${rowIndex}-${colIndex}`}
              className={`${getCellClassName(cell)}${cell === 0 && !hasTowerAt(rowIndex, colIndex) && gold >= effectiveTowerCost ? ' clickable' : ''}`}
              style={{ width: cellSize, height: cellSize, left: colIndex * cellSize, top: rowIndex * cellSize }}
              onClick={(e) => { e.stopPropagation(); handleCellClick(rowIndex, colIndex, cell); }} />
          ))
        )}

        {towers.map((tower) => {
          const pos = gridToPixel(tower.row, tower.col);
          const rawStats = tower.type === 'basic' ? TOWER_BASE_STATS.basic : getTowerStats(tower.type, tower.level, tower.evolution, tower.heroLevel, tower.secondaryType);
          const stats = { ...rawStats, range: rawStats.range * perkRangeMult };
          const isSelected = selectedTower && selectedTower.id === tower.id;
          const towerSize = cellSize * 0.75;
          return (
            <div key={tower.id}
              className={`tower ${isSelected ? 'selected' : ''} ${tower.evolution > 0 ? 'evolved' : ''} ${tower.isHero ? 'hero' : ''}`}
              style={{ width: towerSize, height: towerSize, left: pos.x, top: pos.y, backgroundColor: TOWER_COLORS[tower.type], borderColor: tower.evolution > 0 ? EVOLUTION_COLORS[tower.evolution] : '#2a5a8a' }}
              onClick={(e) => { e.stopPropagation(); handleCellClick(tower.row, tower.col, 0); }}>
              {tower.type !== 'basic' && tower.level > 1 && (
                <div className="tower-lvl" style={{ color: EVOLUTION_COLORS[tower.evolution] }}>{tower.level}</div>
              )}
              {tower.traits.length > 0 && <div className="tower-trait-count">{tower.traits.length}</div>}
              {tower.secondaryType && (
                <div className="tower-secondary-dot" style={{ backgroundColor: TOWER_COLORS[tower.secondaryType] }} />
              )}
              {isSelected && (
                <div className="range-circle" style={{ width: stats.range * cellSize * 2, height: stats.range * cellSize * 2 }} />
              )}
            </div>
          );
        })}

        {projectiles.map((p) => {
          const size = cellSize * 0.15;
          const baseStyle = { position: 'absolute', left: p.x, top: p.y, transform: 'translate(-50%, -50%)', zIndex: 15, pointerEvents: 'none' };
          switch (p.towerType) {
            case 'red': return <div key={p.id} style={{ ...baseStyle, width: size*1.6, height: size*1.6, backgroundColor: p.color, borderRadius: '50%', boxShadow: `0 0 8px ${p.color}, 0 0 16px ${p.color}` }} />;
            case 'yellow': return <div key={p.id} style={{ ...baseStyle, width: size*1.8, height: size*1.8, borderRadius: '50%', background: `radial-gradient(circle, ${p.color} 30%, transparent 70%)`, boxShadow: `0 0 12px ${p.color}`, opacity: 0.85 }} />;
            case 'black': return <div key={p.id} style={{ ...baseStyle, width: size*2, height: size*0.6, backgroundColor: p.color, borderRadius: '2px', boxShadow: `0 0 6px ${p.color}` }} />;
            case 'green': return <div key={p.id} style={{ ...baseStyle, width: size*0.8, height: size*0.8, backgroundColor: p.color, borderRadius: '50%', boxShadow: `0 0 4px ${p.color}` }} />;
            default: return <div key={p.id} style={{ ...baseStyle, width: size, height: size, backgroundColor: p.color, borderRadius: '50%' }} />;
          }
        })}

        {/* 데미지 텍스트 */}
        {damageTexts.map((dt) => {
          const age = (performance.now() - dt.spawnTime) / DAMAGE_TEXT_DURATION;
          const offsetY = age * 25;
          const opacity = Math.max(0, 1 - age);
          return (
            <div key={dt.id}
              className={`damage-text ${dt.isCritical ? 'damage-crit' : ''}`}
              style={{ left: dt.x, top: dt.y - offsetY, opacity }}>
              {dt.isCritical && 'CRIT '}
              {dt.value}
            </div>
          );
        })}

        {enemies.map((enemy) => {
          const dyingOpacity = enemy.dying ? Math.max(0, 1 - (performance.now() - enemy.deathTime) / ENEMY_DEATH_DELAY) : 1;
          return (
            <div key={enemy.id}
              className={`enemy ${enemy.type === 'boss' ? 'boss' : ''}`}
              style={{ left: enemy.x, top: enemy.y, width: enemy.size, height: enemy.size, backgroundColor: enemy.color, opacity: dyingOpacity }}>
              <div className="enemy-hp" style={{ width: enemy.size * 0.9 }}>
                <div className="enemy-hp-fill" style={{ width: `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="info-bar">
        <span>타워 {effectiveTowerCost}G</span>
        <span>특성 {maxTraitsPerTower}개</span>
        {maxEvolution > 0 && <span>진화 {maxEvolution}단계</span>}
      </div>

      {/* 게임 버전 */}
      <div className="version-display">Core Guardian v{GAME_VERSION}</div>
    </div>
  );
}

export default GameBoard;
