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

// 효과음 재생
const playSound = (type) => {
  try {
    const ctx = initAudio();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    switch (type) {
      case 'place': // 타워 설치
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
        break;
      case 'shoot': // 발사
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.05);
        break;
      case 'hit': // 적 피격
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.08);
        break;
      case 'kill': // 적 처치
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
        break;
      case 'upgrade': // 업그레이드
        oscillator.frequency.setValueAtTime(523, ctx.currentTime);
        oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
        break;
      case 'roundStart': // 라운드 시작
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        oscillator.frequency.setValueAtTime(550, ctx.currentTime + 0.15);
        oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.45);
        break;
      case 'gameOver': // 게임 오버
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.6);
        break;
      case 'victory': // 승리
        oscillator.frequency.setValueAtTime(523, ctx.currentTime);
        oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.15);
        oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.3);
        oscillator.frequency.setValueAtTime(1047, ctx.currentTime + 0.45);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.6);
        break;
      case 'click': // UI 클릭
        oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.05);
        break;
      default:
        break;
    }
  } catch (e) {
    // 오디오 에러 무시
  }
};

// 배경음악 시작
const startBgm = () => {
  try {
    const ctx = initAudio();
    if (bgmOscillator) return;

    bgmGain = ctx.createGain();
    bgmGain.gain.setValueAtTime(0.08, ctx.currentTime);
    bgmGain.connect(ctx.destination);

    // 베이스 드론
    bgmOscillator = ctx.createOscillator();
    bgmOscillator.type = 'triangle';
    bgmOscillator.frequency.setValueAtTime(55, ctx.currentTime);
    bgmOscillator.connect(bgmGain);
    bgmOscillator.start();

    // 아르페지오
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
      if (bgmOscillator) {
        setTimeout(playNote, 500);
      }
    };

    setTimeout(playNote, 100);
  } catch (e) {
    // 오디오 에러 무시
  }
};

// 배경음악 정지
const stopBgm = () => {
  try {
    if (bgmOscillator) {
      bgmOscillator.stop();
      bgmOscillator = null;
    }
  } catch (e) {
    // 오디오 에러 무시
  }
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
const MAX_STAGES = 5;

// 난이도 설정 (상향 조정)
const DIFFICULTY_SETTINGS = {
  easy: {
    name: 'Easy',
    color: '#4a90d9',
    enemyHpMult: 0.7,
    enemySpeedMult: 0.85,
    goldMult: 1.3,
    baseDamageMult: 0.6,
  },
  normal: {
    name: 'Normal',
    color: '#44cc44',
    enemyHpMult: 1.0,
    enemySpeedMult: 1.0,
    goldMult: 1.0,
    baseDamageMult: 1.0,
  },
  hard: {
    name: 'Hard',
    color: '#ff4444',
    enemyHpMult: 1.4,
    enemySpeedMult: 1.15,
    goldMult: 0.8,
    baseDamageMult: 1.3,
  },
};

const EVOLUTION_COLORS = ['#ffd700', '#00aaff', '#ff4466', '#aa00ff'];
const EVOLUTION_NAMES = ['', '블루', '레드', '퍼플'];

const getUpgradeCost = (level, evolution) => {
  return 30 + (level * 10) + (evolution * 40);
};

// 타워 타입별 기본 스탯
const TOWER_BASE_STATS = {
  basic: { damage: 25, range: 2.2, attackInterval: 1000, aoe: false, aoeRadius: 0 },
  red: { damage: 60, range: 2.0, attackInterval: 1100, aoe: false, aoeRadius: 0 },
  yellow: { damage: 20, range: 2.2, attackInterval: 900, aoe: true, aoeRadius: 1.2 },
  black: { damage: 35, range: 3.5, attackInterval: 850, aoe: false, aoeRadius: 0 },
  green: { damage: 15, range: 2.0, attackInterval: 350, aoe: false, aoeRadius: 0 },
};

const TOWER_COLORS = {
  basic: '#4a90d9',
  red: '#ff4444',
  yellow: '#ffcc00',
  black: '#333333',
  green: '#44cc44',
};

const TOWER_NAMES = {
  red: '파워',
  yellow: '범위',
  black: '원거리',
  green: '스피드',
};

const PROJECTILE_COLORS = {
  basic: '#ffdd00',
  red: '#ff6600',
  yellow: '#ffff00',
  black: '#aaaaaa',
  green: '#88ff88',
};

// 특성 시스템
const TRAITS = {
  criticalHit: { name: '치명타', desc: '20% 2배', icon: '💥' },
  slow: { name: '감속', desc: '30% 감속', icon: '❄️' },
  burn: { name: '화상', desc: '지속 피해', icon: '🔥' },
  multishot: { name: '다중', desc: '2명 공격', icon: '⚔️' },
  goldBonus: { name: '골드+', desc: '+20%', icon: '💰' },
  vampiric: { name: '흡혈', desc: 'HP+1', icon: '🩸' },
  explosive: { name: '폭발', desc: '주변 피해', icon: '💣' },
  piercing: { name: '관통', desc: '+15% 피해', icon: '🎯' },
};

const TRAIT_LIST = Object.keys(TRAITS);

// 튜토리얼 데이터
const TUTORIAL_PAGES = [
  {
    title: '게임 목표',
    icon: '🏰',
    content: [
      '적들이 경로를 따라 기지로 이동합니다.',
      '타워를 설치해 적을 처치하세요!',
      '기지 HP가 0이 되면 게임 오버입니다.',
      '10라운드를 버티면 스테이지 클리어!',
    ],
  },
  {
    title: '타워 설치',
    icon: '🔧',
    content: [
      '초록색 영역을 터치하면 타워 설치 (50G)',
      '설치 후 타워를 터치해 타입을 선택하세요.',
      '• 파워(빨강): 높은 데미지',
      '• 범위(노랑): 광역 공격',
      '• 원거리(검정): 긴 사거리',
      '• 스피드(초록): 빠른 공격',
    ],
  },
  {
    title: '타워 강화',
    icon: '⬆️',
    content: [
      '타워를 터치하고 강화 버튼을 누르세요.',
      '레벨이 오르면 공격력/사거리/속도 증가!',
      '레벨 5 달성 시 진화 가능 (스테이지 2+)',
      '진화하면 더욱 강력해집니다.',
    ],
  },
  {
    title: '특성 시스템',
    icon: '✨',
    content: [
      '타워에 특성을 부여할 수 있습니다.',
      '스테이지 번호 = 최대 특성 개수',
      '• 치명타: 20% 확률로 2배 데미지',
      '• 감속: 적 이동속도 감소',
      '• 화상: 지속 데미지',
      '• 흡혈: 처치 시 기지 HP 회복',
    ],
  },
  {
    title: '적 유형',
    icon: '👾',
    content: [
      '• 일반(빨강): 기본 적',
      '• 빠름(주황): 빠르지만 약함',
      '• 탱커(갈색): 느리지만 강함',
      '• 보스(보라): 매우 강력!',
      '후반 라운드일수록 적이 강해집니다.',
    ],
  },
  {
    title: '전략 팁',
    icon: '💡',
    content: [
      '경로 굽이치는 곳에 타워 배치가 효과적!',
      '다양한 타워 조합을 시도해보세요.',
      '골드를 아껴두고 급할 때 사용하세요.',
      '감속 특성으로 보스를 늦추세요!',
      '준비가 되셨나요? 행운을 빕니다!',
    ],
  },
];

const getTowerStats = (type, level, evolution) => {
  const base = TOWER_BASE_STATS[type];
  const totalLevel = evolution * 5 + level;

  const damageMultiplier = 1 + (totalLevel - 1) * 0.12 + evolution * 0.25;
  const rangeBonus = (totalLevel - 1) * 0.05 + evolution * 0.2;
  const intervalReduction = (totalLevel - 1) * 15 + evolution * 40;
  const aoeBonus = base.aoe ? (totalLevel - 1) * 0.1 + evolution * 0.3 : 0;

  return {
    damage: Math.round(base.damage * damageMultiplier),
    range: base.range + rangeBonus,
    attackInterval: Math.max(type === 'green' ? 150 : 300, base.attackInterval - intervalReduction),
    aoe: base.aoe,
    aoeRadius: base.aoeRadius + aoeBonus,
  };
};

// 적 타입 (상향 조정)
const ENEMY_TYPES = {
  normal: { hp: 120, speed: 0.032, size: 0.55, color: '#ff4444', reward: 18 },
  fast: { hp: 60, speed: 0.055, size: 0.45, color: '#ff8844', reward: 14 },
  tank: { hp: 400, speed: 0.02, size: 0.7, color: '#884444', reward: 30 },
  boss: { hp: 1200, speed: 0.015, size: 0.9, color: '#8800ff', reward: 100 },
};

// 라운드별 적 구성 (후반부로 갈수록 급격히 어려워짐)
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

function GameBoard() {
  const [gameState, setGameState] = useState('menu');
  const [difficulty, setDifficulty] = useState('normal');
  const [currentStage, setCurrentStage] = useState(1);
  const [unlockedStages, setUnlockedStages] = useState([1]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [tutorialPage, setTutorialPage] = useState(0);

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
  const [cellSize, setCellSize] = useState(32);

  const boardRef = useRef(null);
  const enemiesRef = useRef([]);
  const towersRef = useRef([]);
  const projectilesRef = useRef([]);
  const goldRef = useRef(INITIAL_GOLD);
  const baseHpRef = useRef(BASE_MAX_HP);
  const animationFrameRef = useRef();
  const spawnQueueRef = useRef([]);
  const lastSpawnTimeRef = useRef(0);
  const roundInProgressRef = useRef(false);
  const currentRoundRef = useRef(0);
  const lastShootTimeRef = useRef(0);

  const difficultySettings = DIFFICULTY_SETTINGS[difficulty];
  const maxTraitsPerTower = currentStage;
  const maxEvolution = Math.max(0, currentStage - 1); // Stage 1: 0, Stage 2: 1, etc.

  // 셀 크기 계산
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

  const getStageMultiplier = () => {
    return 1 + (currentStage - 1) * 0.4;
  };

  const playSoundEffect = useCallback((type) => {
    if (soundEnabled) playSound(type);
  }, [soundEnabled]);

  const resetGame = () => {
    enemiesRef.current = [];
    towersRef.current = [];
    projectilesRef.current = [];
    goldRef.current = INITIAL_GOLD;
    baseHpRef.current = BASE_MAX_HP;
    spawnQueueRef.current = [];
    lastSpawnTimeRef.current = 0;
    roundInProgressRef.current = false;
    currentRoundRef.current = 0;
    enemyIdCounter = 0;
    projectileIdCounter = 0;

    setTowers([]);
    setGold(INITIAL_GOLD);
    setBaseHp(BASE_MAX_HP);
    setCurrentRound(0);
    setRoundInProgress(false);
    setGameOver(false);
    setGameWon(false);
    setSelectedTower(null);
    setShowTypeSelect(false);
    setShowTraitPanel(false);
  };

  const startGame = () => {
    resetGame();
    setGameState('playing');
    if (soundEnabled) startBgm();
  };

  const goToMenu = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    stopBgm();
    resetGame();
    setGameState('menu');
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
      }
      return;
    }

    if (cellType !== 0) return;
    if (goldRef.current < TOWER_COST) return;

    playSoundEffect('place');
    setSelectedTower(null);
    setShowTypeSelect(false);
    setShowTraitPanel(false);

    const towerId = `tower-${row}-${col}`;
    const newTower = {
      id: towerId,
      row,
      col,
      type: 'basic',
      level: 1,
      evolution: 0,
      lastAttackTime: 0,
      traits: [],
    };

    towersRef.current.push(newTower);
    goldRef.current -= TOWER_COST;

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
    if (!tower) return;

    if (tower.type === 'basic') return;

    const cost = getUpgradeCost(tower.level, tower.evolution);
    if (goldRef.current < cost) return;

    if (tower.level >= 5) {
      // 진화 조건 체크
      if (tower.evolution < maxEvolution) {
        tower.evolution++;
        tower.level = 1;
        playSoundEffect('upgrade');
      }
    } else {
      tower.level++;
      playSoundEffect('upgrade');
    }

    goldRef.current -= cost;
    setTowers([...towersRef.current]);
    setGold(goldRef.current);
    setSelectedTower({ ...tower });
  };

  const addTrait = (traitKey) => {
    if (!selectedTower) return;

    const tower = towersRef.current.find((t) => t.id === selectedTower.id);
    if (!tower) return;
    if (tower.traits.length >= maxTraitsPerTower) return;
    if (tower.traits.includes(traitKey)) return;

    const traitCost = 80 + tower.traits.length * 40;
    if (goldRef.current < traitCost) return;

    playSoundEffect('upgrade');
    tower.traits.push(traitKey);
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

  const isMaxLevel = (tower) => {
    return tower && tower.level >= 5 && tower.evolution >= maxEvolution;
  };

  const startRound = () => {
    if (roundInProgress || currentRound >= MAX_ROUNDS) return;

    playSoundEffect('roundStart');
    const roundIndex = currentRound;
    currentRoundRef.current = roundIndex;
    const config = ROUND_CONFIG[roundIndex];
    const queue = [];
    const stageMult = getStageMultiplier();
    const hpMult = config.hpMult * stageMult * difficultySettings.enemyHpMult;

    const speedMult = config.speedMult || 1.0;
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
      if (bossIndex !== -1) {
        const boss = queue.splice(bossIndex, 1)[0];
        queue.push(boss);
      }
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
      id: enemyIdCounter++,
      type: enemyData.type,
      x: startPos.x,
      y: startPos.y,
      pathIndex: 0,
      hp,
      maxHp: hp,
      speed: finalSpeed,
      baseSpeed: finalSpeed,
      size: stats.size * cellSize,
      color: stats.color,
      reward: Math.round(stats.reward * (1 + enemyData.hpMult * 0.15) * difficultySettings.goldMult),
      slowUntil: 0,
      burnUntil: 0,
      burnDamage: 0,
    });
  }, [gridToPixel, cellSize, difficultySettings]);

  const spawnProjectile = (startX, startY, targetId, damage, color, aoe, aoeRadius, traits = []) => {
    if (projectilesRef.current.length >= MAX_PROJECTILES) return;

    projectilesRef.current.push({
      id: projectileIdCounter++,
      x: startX,
      y: startY,
      targetId,
      damage,
      color,
      aoe,
      aoeRadius: aoeRadius * cellSize,
      traits,
    });
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = (currentTime) => {
      if (baseHpRef.current <= 0 || gameWon) return;

      const enemies = enemiesRef.current;
      const towers = towersRef.current;
      const projectiles = projectilesRef.current;

      const spawnInterval = Math.max(350, 700 - currentRoundRef.current * 25);

      if (roundInProgressRef.current && spawnQueueRef.current.length > 0) {
        if (currentTime - lastSpawnTimeRef.current > spawnInterval) {
          const enemyData = spawnQueueRef.current.shift();
          spawnEnemy(enemyData);
          lastSpawnTimeRef.current = currentTime;
        }
      }

      if (roundInProgressRef.current && spawnQueueRef.current.length === 0 && enemies.length === 0) {
        roundInProgressRef.current = false;
        setRoundInProgress(false);
        if (currentRound >= MAX_ROUNDS) {
          setGameWon(true);
          stopBgm();
          playSoundEffect('victory');
          if (currentStage < MAX_STAGES && !unlockedStages.includes(currentStage + 1)) {
            setUnlockedStages(prev => [...prev, currentStage + 1]);
          }
        }
      }

      // 상태 효과
      for (const enemy of enemies) {
        if (enemy.burnUntil > currentTime && enemy.burnDamage > 0) {
          enemy.hp -= enemy.burnDamage / 60;
        }
        if (enemy.slowUntil > currentTime) {
          enemy.speed = enemy.baseSpeed * 0.7;
        } else {
          enemy.speed = enemy.baseSpeed;
        }
      }

      // 적 이동
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

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

        if (distance < enemy.speed) {
          enemy.x = targetPos.x;
          enemy.y = targetPos.y;
          enemy.pathIndex++;
        } else {
          enemy.x += (dx / distance) * enemy.speed;
          enemy.y += (dy / distance) * enemy.speed;
        }
      }

      // 타워 공격
      for (const tower of towers) {
        const stats = tower.type === 'basic'
          ? TOWER_BASE_STATS.basic
          : getTowerStats(tower.type, tower.level, tower.evolution);
        if (currentTime - tower.lastAttackTime < stats.attackInterval) continue;

        const towerPos = gridToPixel(tower.row, tower.col);
        const rangeInPixels = stats.range * cellSize;

        const targetsNeeded = tower.traits.includes('multishot') ? 2 : 1;
        const targets = [];

        const sortedEnemies = [...enemies]
          .map(enemy => ({
            enemy,
            dist: getDistance(towerPos.x, towerPos.y, enemy.x, enemy.y)
          }))
          .filter(e => e.dist <= rangeInPixels)
          .sort((a, b) => a.dist - b.dist);

        for (let j = 0; j < Math.min(targetsNeeded, sortedEnemies.length); j++) {
          targets.push(sortedEnemies[j].enemy);
        }

        if (targets.length > 0) {
          for (const target of targets) {
            let damage = stats.damage;

            if (tower.traits.includes('criticalHit') && Math.random() < 0.2) {
              damage *= 2;
            }
            if (tower.traits.includes('piercing')) {
              damage = Math.round(damage * 1.15);
            }

            const projectileColor = PROJECTILE_COLORS[tower.type] || '#ffdd00';
            spawnProjectile(
              towerPos.x, towerPos.y, target.id,
              damage, projectileColor,
              stats.aoe, stats.aoeRadius,
              tower.traits
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
      const projectileSpeed = cellSize * 0.2;
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        const targetEnemy = enemies.find((e) => e.id === projectile.targetId);

        if (!targetEnemy) {
          projectiles.splice(i, 1);
          continue;
        }

        const dx = targetEnemy.x - projectile.x;
        const dy = targetEnemy.y - projectile.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const hitRadius = cellSize * 0.25;

        if (distance < hitRadius) {
          const applyDamage = (enemy, dmg) => {
            enemy.hp -= dmg;

            if (projectile.traits.includes('slow')) {
              enemy.slowUntil = currentTime + 2000;
            }
            if (projectile.traits.includes('burn')) {
              enemy.burnUntil = currentTime + 3000;
              enemy.burnDamage = dmg * 0.25;
            }
          };

          if (projectile.aoe && projectile.aoeRadius > 0) {
            for (const enemy of enemies) {
              const aoeDist = getDistance(targetEnemy.x, targetEnemy.y, enemy.x, enemy.y);
              if (aoeDist <= projectile.aoeRadius) {
                applyDamage(enemy, projectile.damage);
              }
            }
          } else {
            applyDamage(targetEnemy, projectile.damage);
          }
          projectiles.splice(i, 1);
          continue;
        }

        projectile.x += (dx / distance) * projectileSpeed;
        projectile.y += (dy / distance) * projectileSpeed;
      }

      // 죽은 적 처리
      for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].hp <= 0) {
          const deadEnemy = enemies[i];
          let reward = deadEnemy.reward;

          for (const tower of towers) {
            if (tower.traits.includes('goldBonus')) {
              reward = Math.round(reward * 1.2);
              break;
            }
          }

          goldRef.current += reward;
          setGold(goldRef.current);

          for (const tower of towers) {
            if (tower.traits.includes('vampiric')) {
              baseHpRef.current = Math.min(BASE_MAX_HP, baseHpRef.current + 1);
              setBaseHp(baseHpRef.current);
              break;
            }
          }

          for (const tower of towers) {
            if (tower.traits.includes('explosive')) {
              for (const enemy of enemies) {
                if (enemy.id !== deadEnemy.id) {
                  const dist = getDistance(deadEnemy.x, deadEnemy.y, enemy.x, enemy.y);
                  if (dist < cellSize * 1.5) {
                    enemy.hp -= 25;
                  }
                }
              }
              break;
            }
          }

          if (soundEnabled) playSound('kill');
          enemies.splice(i, 1);
        }
      }

      forceUpdate((n) => n + 1);
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [gameState, currentRound, gameWon, currentStage, difficulty, cellSize, gridToPixel, spawnEnemy, playSoundEffect, soundEnabled, unlockedStages, difficultySettings]);

  const enemies = enemiesRef.current;
  const projectiles = projectilesRef.current;

  const renderStars = (level, evolution) => {
    const stars = [];
    const color = EVOLUTION_COLORS[evolution];
    for (let i = 0; i < level; i++) {
      stars.push(
        <span key={i} style={{ color, textShadow: `0 0 3px ${color}` }}>★</span>
      );
    }
    return stars;
  };

  const boardSize = cellSize * GRID_SIZE;

  // 메인 메뉴
  if (gameState === 'menu') {
    return (
      <div className="menu-container">
        <h1 className="game-title">타워 디펜스</h1>
        <p className="menu-desc">각자만의 특성이 있는 타워 블록으로<br/>기지를 지켜보세요!</p>

        <div className="difficulty-section">
          <div className="section-label">난이도</div>
          <div className="difficulty-buttons">
            {Object.entries(DIFFICULTY_SETTINGS).map(([key, settings]) => (
              <button
                key={key}
                className={`difficulty-btn ${difficulty === key ? 'selected' : ''}`}
                style={{
                  borderColor: difficulty === key ? settings.color : '#555',
                  backgroundColor: difficulty === key ? settings.color : '#3a3a50',
                  boxShadow: difficulty === key ? `0 0 15px ${settings.color}` : 'none',
                }}
                onClick={() => { setDifficulty(key); playSoundEffect('click'); }}
              >
                {settings.name}
              </button>
            ))}
          </div>
        </div>

        <div className="menu-buttons">
          <button className="start-btn" onClick={() => { playSoundEffect('click'); setGameState('stageSelect'); }}>
            게임 시작
          </button>
          <button className="tutorial-btn" onClick={() => { playSoundEffect('click'); setTutorialPage(0); setGameState('tutorial'); }}>
            📖 튜토리얼
          </button>
        </div>

        <button className="sound-toggle" onClick={() => setSoundEnabled(!soundEnabled)}>
          {soundEnabled ? '🔊 사운드 ON' : '🔇 사운드 OFF'}
        </button>
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
            {page.content.map((line, idx) => (
              <p key={idx} className="tutorial-line">{line}</p>
            ))}
          </div>
          <div className="tutorial-progress">
            {TUTORIAL_PAGES.map((_, idx) => (
              <span
                key={idx}
                className={`progress-dot ${idx === tutorialPage ? 'active' : ''}`}
                onClick={() => { playSoundEffect('click'); setTutorialPage(idx); }}
              />
            ))}
          </div>
          <div className="tutorial-nav">
            {!isFirstPage && (
              <button className="nav-btn" onClick={() => { playSoundEffect('click'); setTutorialPage(tutorialPage - 1); }}>
                ◀ 이전
              </button>
            )}
            {isFirstPage && <div />}
            {isLastPage ? (
              <button className="nav-btn primary" onClick={() => { playSoundEffect('click'); setGameState('menu'); }}>
                완료 ✓
              </button>
            ) : (
              <button className="nav-btn primary" onClick={() => { playSoundEffect('click'); setTutorialPage(tutorialPage + 1); }}>
                다음 ▶
              </button>
            )}
          </div>
        </div>
        <button className="back-btn" onClick={() => { playSoundEffect('click'); setGameState('menu'); }}>
          메뉴로
        </button>
      </div>
    );
  }

  // 스테이지 선택
  if (gameState === 'stageSelect') {
    return (
      <div className="menu-container">
        <h2 className="stage-title">스테이지 선택</h2>
        <div className="menu-desc">난이도: {DIFFICULTY_SETTINGS[difficulty].name}</div>

        <div className="stage-grid">
          {Array.from({ length: MAX_STAGES }, (_, i) => i + 1).map((stage) => {
            const isUnlocked = unlockedStages.includes(stage);
            const stageMaxEvo = Math.max(0, stage - 1);
            return (
              <button
                key={stage}
                className={`stage-btn ${isUnlocked ? '' : 'locked'}`}
                onClick={() => {
                  if (isUnlocked) {
                    playSoundEffect('click');
                    setCurrentStage(stage);
                    startGame();
                  }
                }}
                disabled={!isUnlocked}
              >
                <div className="stage-number">Stage {stage}</div>
                <div className="stage-info">
                  {isUnlocked ? (
                    <>
                      <div>특성: {stage}개</div>
                      <div>진화: {stageMaxEvo > 0 ? `${stageMaxEvo}단계` : '불가'}</div>
                    </>
                  ) : (
                    <div>🔒</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <button className="back-btn" onClick={() => { playSoundEffect('click'); setGameState('menu'); }}>
          뒤로
        </button>
      </div>
    );
  }

  // 게임 플레이
  return (
    <div className="game-container">
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
      {gameWon && (
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
            <div className="hp-fill" style={{ width: `${(baseHp / BASE_MAX_HP) * 100}%` }} />
          </div>
          <span>{baseHp}</span>
        </div>
      </div>

      {/* 라운드 버튼 */}
      <div className="round-btn-area">
        {!roundInProgress && currentRound < MAX_ROUNDS && !gameOver && !gameWon ? (
          <button className="round-btn" onClick={startRound}>
            ▶ Round {currentRound + 1}
          </button>
        ) : roundInProgress ? (
          <div className="round-status">전투 중...</div>
        ) : null}
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
              <button
                key={t.type}
                className="tower-option"
                onClick={() => selectTowerType(t.type)}
                disabled={gold < getUpgradeCost(1, 0)}
              >
                <div className="tower-icon" style={{ backgroundColor: t.color }} />
                <div className="tower-label">
                  <div>{t.name}</div>
                  <small>{t.desc}</small>
                </div>
              </button>
            ))}
          </div>
          <button className="close-btn" onClick={() => { setSelectedTower(null); setShowTypeSelect(false); }}>닫기</button>
        </div>
      )}

      {/* 업그레이드 패널 */}
      {selectedTower && !showTypeSelect && selectedTower.type !== 'basic' && (
        <div className="panel">
          <div className="panel-title">
            {TOWER_NAMES[selectedTower.type]}
            {selectedTower.evolution > 0 && ` [${EVOLUTION_NAMES[selectedTower.evolution]}]`}
          </div>
          <div className="tower-info">
            <div className="info-row">
              <span>레벨</span>
              <span>{renderStars(selectedTower.level, selectedTower.evolution)}</span>
            </div>
            {(() => {
              const stats = getTowerStats(selectedTower.type, selectedTower.level, selectedTower.evolution);
              return (
                <>
                  <div className="info-row"><span>공격력</span><span>{stats.damage}</span></div>
                  <div className="info-row"><span>사거리</span><span>{stats.range.toFixed(1)}</span></div>
                  <div className="info-row"><span>속도</span><span>{(1000 / stats.attackInterval).toFixed(1)}/s</span></div>
                </>
              );
            })()}
            <div className="info-row"><span>특성</span><span>{selectedTower.traits.length}/{maxTraitsPerTower}</span></div>
            {maxEvolution > 0 && (
              <div className="info-row"><span>진화</span><span>{selectedTower.evolution}/{maxEvolution}</span></div>
            )}
          </div>

          {selectedTower.traits.length > 0 && (
            <div className="trait-badges">
              {selectedTower.traits.map((traitKey) => (
                <span key={traitKey} className="trait-badge-small">
                  {TRAITS[traitKey].icon}
                </span>
              ))}
            </div>
          )}

          {!isMaxLevel(selectedTower) ? (
            <button
              className="action-btn"
              onClick={upgradeTower}
              disabled={!canUpgrade(selectedTower)}
            >
              {selectedTower.level >= 5 ? (maxEvolution > selectedTower.evolution ? '진화' : 'MAX') : '강화'} ({getUpgradeCost(selectedTower.level, selectedTower.evolution)}G)
            </button>
          ) : (
            <div className="max-text">MAX LEVEL</div>
          )}

          {selectedTower.traits.length < maxTraitsPerTower && (
            <button className="trait-add-btn" onClick={() => setShowTraitPanel(!showTraitPanel)}>
              특성 ({80 + selectedTower.traits.length * 40}G)
            </button>
          )}

          {showTraitPanel && (
            <div className="trait-list">
              {TRAIT_LIST.map((traitKey) => {
                const trait = TRAITS[traitKey];
                const has = selectedTower.traits.includes(traitKey);
                const cost = 80 + selectedTower.traits.length * 40;
                return (
                  <button
                    key={traitKey}
                    className={`trait-item ${has ? 'owned' : ''}`}
                    onClick={() => addTrait(traitKey)}
                    disabled={has || gold < cost}
                  >
                    <span className="trait-icon-big">{trait.icon}</span>
                    <span className="trait-name">{trait.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          <button className="close-btn" onClick={() => { setSelectedTower(null); setShowTraitPanel(false); }}>닫기</button>
        </div>
      )}

      {/* 게임 보드 */}
      <div
        ref={boardRef}
        className="game-board"
        style={{ width: boardSize, height: boardSize }}
        onClick={() => { setSelectedTower(null); setShowTypeSelect(false); setShowTraitPanel(false); }}
      >
        {initialMap.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`${getCellClassName(cell)}${
                cell === 0 && !hasTowerAt(rowIndex, colIndex) && gold >= TOWER_COST ? ' clickable' : ''
              }`}
              style={{
                width: cellSize,
                height: cellSize,
                left: colIndex * cellSize,
                top: rowIndex * cellSize,
              }}
              onClick={(e) => { e.stopPropagation(); handleCellClick(rowIndex, colIndex, cell); }}
            />
          ))
        )}

        {towers.map((tower) => {
          const pos = gridToPixel(tower.row, tower.col);
          const stats = tower.type === 'basic' ? TOWER_BASE_STATS.basic : getTowerStats(tower.type, tower.level, tower.evolution);
          const isSelected = selectedTower && selectedTower.id === tower.id;
          const towerSize = cellSize * 0.75;

          return (
            <div
              key={tower.id}
              className={`tower ${isSelected ? 'selected' : ''} ${tower.evolution > 0 ? 'evolved' : ''}`}
              style={{
                width: towerSize,
                height: towerSize,
                left: pos.x,
                top: pos.y,
                backgroundColor: TOWER_COLORS[tower.type],
                borderColor: tower.evolution > 0 ? EVOLUTION_COLORS[tower.evolution] : '#2a5a8a',
              }}
              onClick={(e) => { e.stopPropagation(); handleCellClick(tower.row, tower.col, 0); }}
            >
              {tower.type !== 'basic' && tower.level > 1 && (
                <div className="tower-lvl" style={{ color: EVOLUTION_COLORS[tower.evolution] }}>
                  {tower.level}
                </div>
              )}
              {tower.traits.length > 0 && (
                <div className="tower-trait-count">{tower.traits.length}</div>
              )}
              {isSelected && (
                <div
                  className="range-circle"
                  style={{
                    width: stats.range * cellSize * 2,
                    height: stats.range * cellSize * 2,
                  }}
                />
              )}
            </div>
          );
        })}

        {projectiles.map((p) => (
          <div
            key={p.id}
            className="projectile"
            style={{
              left: p.x,
              top: p.y,
              backgroundColor: p.color,
              width: cellSize * 0.15,
              height: cellSize * 0.15,
            }}
          />
        ))}

        {enemies.map((enemy) => (
          <div
            key={enemy.id}
            className={`enemy ${enemy.type === 'boss' ? 'boss' : ''}`}
            style={{
              left: enemy.x,
              top: enemy.y,
              width: enemy.size,
              height: enemy.size,
              backgroundColor: enemy.color,
            }}
          >
            <div className="enemy-hp" style={{ width: enemy.size * 0.9 }}>
              <div className="enemy-hp-fill" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="info-bar">
        <span>타워 {TOWER_COST}G</span>
        <span>특성 {maxTraitsPerTower}개</span>
        {maxEvolution > 0 && <span>진화 {maxEvolution}단계</span>}
      </div>
    </div>
  );
}

export default GameBoard;
