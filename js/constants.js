// ============================================
// The Chrono-Splinter - Game Constants
// ============================================

const GAME = {
    WIDTH: 800,
    HEIGHT: 600,
    FPS: 60,
};

const PLAYER = {
    WIDTH: 40,
    HEIGHT: 50,
    SPEED: 6,
    FIRE_RATE: 200, // ms between shots
    BASE_ATK: 10,
    BASE_DEF: 0,
    MAX_LIVES: 3,
    INVINCIBILITY_TIME: 2000, // ms after being hit
};

const BULLET = {
    WIDTH: 6,
    HEIGHT: 15,
    SPEED: 12,
    COLOR: '#00ffcc',
};

const ENEMY_TYPES = {
    DRIFTER: {
        name: 'Drifter',
        width: 35,
        height: 35,
        speed: 2,
        health: 20,
        points: 100,
        coins: 1,
        color: '#ff6b35',
    },
    STITCHER: {
        name: 'Stitcher',
        width: 30,
        height: 30,
        speed: 1.5,
        health: 15,
        points: 150,
        coins: 2,
        color: '#50fa7b',
    },
    WRAITH: {
        name: 'Wraith',
        width: 40,
        height: 40,
        speed: 4,
        health: 30,
        points: 200,
        coins: 3,
        color: '#bd93f9',
    },
    HARVESTER: {
        name: 'Harvester',
        width: 50,
        height: 50,
        speed: 1,
        health: 60,
        points: 300,
        coins: 5,
        color: '#f1fa8c',
    },
    SPLITTER: {
        name: 'Splitter',
        width: 40,
        height: 40,
        speed: 2.5,
        health: 25,
        points: 50,
        coins: 1,
        color: '#ff79c6',
        splitInto: 2,
    },
};

const POWERUP_TYPES = {
    // Temporary power-ups
    RAPID_FIRE: { name: 'Rapid Fire', duration: 15000, color: '#00bfff', symbol: '⚡' },
    SHIELD: { name: 'Shield', duration: 0, hits: 3, color: '#ffd700', symbol: '🛡' },
    MAGNET: { name: 'Magnet', duration: 20000, color: '#da70d6', symbol: '🧲' },
    SLOW_MO: { name: 'Slow-Mo', duration: 10000, color: '#87ceeb', symbol: '⏱' },

    // Weapon mods (permanent until death)
    SPREAD_SHOT: { name: 'Spread Shot', weapon: true, color: '#ff4500', symbol: '⋔' },
    PIERCING: { name: 'Piercing', weapon: true, color: '#00ff00', symbol: '→' },
    HOMING: { name: 'Homing', weapon: true, color: '#ff1493', symbol: '◎' },
    RICOCHET: { name: 'Ricochet', weapon: true, color: '#7fff00', symbol: '↺' },
    DRONE: { name: 'Drone', weapon: true, color: '#1e90ff', symbol: '◇' },
    REAR_GUN: { name: 'Rear Gun', weapon: true, color: '#ff8c00', symbol: '↕' },
};

const UPGRADE_COSTS = {
    ATK: [50, 100, 200, 400, 800],
    DEF: [50, 100, 200, 400, 800],
    SPD: [30, 60, 120, 240, 480],
    FIRE_RATE: [40, 80, 160, 320, 640],
};

const COLORS = {
    PRIMARY: '#00ffcc',
    SECONDARY: '#ff6b35',
    WARNING: '#ffcc00',
    HEALTH: '#ff4757',
    COINS: '#ffd700',
    BG: '#0a0a12',
};

const MUSIC = {
    INTRO: 'assets/music/space-cinematic-music.mp3',
    CHAPTER_1_2: 'assets/music/electropower-hard-cyberpunk-electro.mp3',
    CHAPTER_3: 'assets/music/chemical-racing-hard-edm-breakbeat.mp3',
    BOSS: 'assets/music/cyberpunk-terror-hard-edm-electro.mp3',
    GAME_OVER: 'assets/gameover.mp3',
};
