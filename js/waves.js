// ============================================
// The Chrono-Splinter - Wave System
// ============================================

class WaveManager {
    constructor(chapter = 1) {
        this.currentWave = 0;
        this.totalWaves = 10;
        this.waveActive = false;
        this.waveComplete = false;
        this.enemiesRemaining = 0;
        this.waveDelay = 3000; // ms between waves
        this.waveTimer = 0;
        this.waveStartTime = 0;
        this.bossWave = false;
        this.chapter = chapter;

        // Set waves based on chapter
        this.waves = this.getWavesForChapter(chapter);
    }

    getWavesForChapter(chapter) {
        switch (chapter) {
            case 1: return this.getMercuryWaves();
            case 2: return this.getVenusWaves();
            case 3: return this.getEarthWaves();
            case 4: return this.getProceduralWaves(4, 'THEECHO', 'THE ECHO AWAKENS');
            case 5: return this.getProceduralWaves(5, 'THEWARDEN', 'THE WARDEN APPROACHES');
            case 6: return this.getProceduralWaves(6, 'THESIEGEBREAKER', 'ASTEROID ALERT');
            case 7: return this.getProceduralWaves(7, 'THETEMPEST', 'STORM WARNING');
            case 8: return this.getProceduralWaves(8, 'THELEVIATHAN', 'DEPTH WARNING');
            case 9: return this.getProceduralWaves(9, 'THERINGMASTER', 'RING FORTRESS AHEAD');
            case 10: return this.getProceduralWaves(10, 'THEFORGEMASTER', 'FACTORY ONLINE');
            case 11: return this.getProceduralWaves(11, 'THEARCHITECT', 'THE ARCHITECT');
            case 12: return this.getProceduralWaves(12, 'THELOOMCORE', 'TIMELINE COLLAPSE');
            default: return this.getMercuryWaves();
        }
    }

    getEarthWaves() {
        return [
            // Wave 1: Orbital defense forces
            {
                enemies: [
                    { type: 'DRIFTER', count: 24, pattern: 'scattered', delay: 75 },
                    { type: 'STITCHER', count: 10, pattern: 'line', delay: 200 }
                ],
                message: 'WAVE 1 - ENTERING EARTH ORBIT'
            },
            // Wave 2: Time-displaced scouts
            {
                enemies: [
                    { type: 'WRAITH', count: 14, pattern: 'scattered', delay: 150 },
                    { type: 'DRIFTER', count: 20, pattern: 'v-formation', delay: 100 }
                ],
                message: 'WAVE 2 - TEMPORAL SCOUTS'
            },
            // Wave 3: Heavy temporal infantry
            {
                enemies: [
                    { type: 'HARVESTER', count: 10, pattern: 'center', delay: 250 },
                    { type: 'SPLITTER', count: 14, pattern: 'scattered', delay: 150 },
                    { type: 'DRIFTER', count: 16, pattern: 'left', delay: 75 }
                ],
                message: 'WAVE 3 - HEAVY INFANTRY'
            },
            // Wave 4: Pincer formation
            {
                enemies: [
                    { type: 'STITCHER', count: 8, pattern: 'left', delay: 200 },
                    { type: 'STITCHER', count: 8, pattern: 'right', delay: 200 },
                    { type: 'WRAITH', count: 12, pattern: 'center', delay: 150 }
                ],
                message: 'WAVE 4 - PINCER ATTACK'
            },
            // Wave 5: Splitter storm
            {
                enemies: [
                    { type: 'SPLITTER', count: 20, pattern: 'line', delay: 100 },
                    { type: 'DRIFTER', count: 24, pattern: 'scattered', delay: 50 }
                ],
                message: 'WAVE 5 - SPLITTER STORM'
            },
            // Wave 6: Elite guard
            {
                enemies: [
                    { type: 'HARVESTER', count: 8, pattern: 'line', delay: 300 },
                    { type: 'WRAITH', count: 16, pattern: 'scattered', delay: 100 },
                    { type: 'STITCHER', count: 10, pattern: 'center', delay: 200 }
                ],
                message: 'WAVE 6 - ELITE GUARD'
            },
            // Wave 7: Temporal barrage
            {
                enemies: [
                    { type: 'DRIFTER', count: 20, pattern: 'left', delay: 50 },
                    { type: 'DRIFTER', count: 20, pattern: 'right', delay: 50 },
                    { type: 'SPLITTER', count: 12, pattern: 'center', delay: 150 }
                ],
                message: 'WAVE 7 - TEMPORAL BARRAGE'
            },
            // Wave 8: All-out assault
            {
                enemies: [
                    { type: 'HARVESTER', count: 6, pattern: 'scattered', delay: 250 },
                    { type: 'WRAITH', count: 14, pattern: 'scattered', delay: 125 },
                    { type: 'STITCHER', count: 10, pattern: 'line', delay: 175 },
                    { type: 'DRIFTER', count: 20, pattern: 'v-formation', delay: 50 }
                ],
                message: 'WAVE 8 - ALL-OUT ASSAULT'
            },
            // Wave 9: Last stand
            {
                enemies: [
                    { type: 'SPLITTER', count: 16, pattern: 'scattered', delay: 100 },
                    { type: 'HARVESTER', count: 10, pattern: 'line', delay: 200 },
                    { type: 'WRAITH', count: 14, pattern: 'scattered', delay: 125 },
                    { type: 'STITCHER', count: 8, pattern: 'center', delay: 225 }
                ],
                message: 'WAVE 9 - LAST STAND'
            },
            // Wave 10: BOSS
            {
                enemies: [],
                boss: 'CHRONOWEAVER',
                message: 'WARNING - THE CHRONO-WEAVER MANIFESTS'
            }
        ];
    }

    getVenusWaves() {
        return [
            // Wave 1: Acid rain of Drifters
            {
                enemies: [
                    { type: 'DRIFTER', count: 20, pattern: 'scattered', delay: 100 }
                ],
                message: 'WAVE 1 - ENTERING ATMOSPHERE'
            },
            // Wave 2: Stitchers among the clouds
            {
                enemies: [
                    { type: 'STITCHER', count: 8, pattern: 'line', delay: 300 },
                    { type: 'DRIFTER', count: 16, pattern: 'scattered', delay: 100 }
                ],
                message: 'WAVE 2'
            },
            // Wave 3: Storm formation
            {
                enemies: [
                    { type: 'WRAITH', count: 10, pattern: 'scattered', delay: 200 },
                    { type: 'DRIFTER', count: 20, pattern: 'v-formation', delay: 100 }
                ],
                message: 'WAVE 3 - STORM FORMATION'
            },
            // Wave 4: Heavy resistance
            {
                enemies: [
                    { type: 'HARVESTER', count: 6, pattern: 'center', delay: 400 },
                    { type: 'STITCHER', count: 8, pattern: 'scattered', delay: 200 },
                    { type: 'DRIFTER', count: 12, pattern: 'left', delay: 100 }
                ],
                message: 'WAVE 4'
            },
            // Wave 5: Splitter swarm
            {
                enemies: [
                    { type: 'SPLITTER', count: 12, pattern: 'line', delay: 200 },
                    { type: 'WRAITH', count: 8, pattern: 'scattered', delay: 250 }
                ],
                message: 'WAVE 5 - SPLITTER SWARM'
            },
            // Wave 6: Cloud ambush
            {
                enemies: [
                    { type: 'DRIFTER', count: 16, pattern: 'left', delay: 75 },
                    { type: 'DRIFTER', count: 16, pattern: 'right', delay: 75 },
                    { type: 'STITCHER', count: 6, pattern: 'center', delay: 300 }
                ],
                message: 'WAVE 6 - AMBUSH!'
            },
            // Wave 7: Elite forces
            {
                enemies: [
                    { type: 'HARVESTER', count: 8, pattern: 'scattered', delay: 300 },
                    { type: 'SPLITTER', count: 10, pattern: 'v-formation', delay: 200 }
                ],
                message: 'WAVE 7 - ELITE FORCES'
            },
            // Wave 8: Storm surge
            {
                enemies: [
                    { type: 'WRAITH', count: 16, pattern: 'scattered', delay: 150 },
                    { type: 'STITCHER', count: 8, pattern: 'center', delay: 250 },
                    { type: 'DRIFTER', count: 20, pattern: 'scattered', delay: 50 }
                ],
                message: 'WAVE 8 - STORM SURGE'
            },
            // Wave 9: Final defense
            {
                enemies: [
                    { type: 'HARVESTER', count: 6, pattern: 'line', delay: 300 },
                    { type: 'SPLITTER', count: 10, pattern: 'scattered', delay: 150 },
                    { type: 'WRAITH', count: 10, pattern: 'scattered', delay: 200 },
                    { type: 'STITCHER', count: 6, pattern: 'center', delay: 300 }
                ],
                message: 'WAVE 9 - FINAL DEFENSE'
            },
            // Wave 10: BOSS
            {
                enemies: [],
                boss: 'STORMWEAVER',
                message: 'WARNING - THE STORMWEAVER AWAKENS'
            }
        ];
    }

    getMercuryWaves() {
        return [
            // Wave 1: Introduction - Drifters
            {
                enemies: [
                    { type: 'DRIFTER', count: 16, pattern: 'line', delay: 200 },
                    { type: 'DRIFTER', count: 16, pattern: 'v-formation', delay: 150 }
                ],
                message: 'WAVE 1 - INCOMING!'
            },
            // Wave 2: More Drifters
            {
                enemies: [
                    { type: 'DRIFTER', count: 20, pattern: 'v-formation', delay: 125 },
                    { type: 'DRIFTER', count: 20, pattern: 'scattered', delay: 100 }
                ],
                message: 'WAVE 2'
            },
            // Wave 3: Introduce Stitchers
            {
                enemies: [
                    { type: 'DRIFTER', count: 24, pattern: 'scattered', delay: 75 },
                    { type: 'STITCHER', count: 8, pattern: 'center', delay: 250 }
                ],
                message: 'WAVE 3 - STITCHERS DETECTED'
            },
            // Wave 4: Mixed assault
            {
                enemies: [
                    { type: 'DRIFTER', count: 16, pattern: 'left', delay: 100 },
                    { type: 'DRIFTER', count: 16, pattern: 'right', delay: 100 },
                    { type: 'STITCHER', count: 8, pattern: 'center', delay: 200 }
                ],
                message: 'WAVE 4'
            },
            // Wave 5: Introduce Wraiths
            {
                enemies: [
                    { type: 'WRAITH', count: 12, pattern: 'scattered', delay: 250 },
                    { type: 'DRIFTER', count: 24, pattern: 'line', delay: 100 }
                ],
                message: 'WAVE 5 - WRAITHS INCOMING'
            },
            // Wave 6: Harvester wave (bonus coins!)
            {
                enemies: [
                    { type: 'HARVESTER', count: 8, pattern: 'center', delay: 300 },
                    { type: 'DRIFTER', count: 24, pattern: 'scattered', delay: 75 }
                ],
                message: 'WAVE 6 - HARVESTERS!'
            },
            // Wave 7: Splitter madness
            {
                enemies: [
                    { type: 'SPLITTER', count: 16, pattern: 'line', delay: 200 },
                    { type: 'STITCHER', count: 8, pattern: 'center', delay: 300 }
                ],
                message: 'WAVE 7 - SPLITTERS'
            },
            // Wave 8: Heavy assault
            {
                enemies: [
                    { type: 'DRIFTER', count: 24, pattern: 'scattered', delay: 50 },
                    { type: 'WRAITH', count: 12, pattern: 'scattered', delay: 150 },
                    { type: 'STITCHER', count: 8, pattern: 'center', delay: 250 }
                ],
                message: 'WAVE 8 - HEAVY ASSAULT'
            },
            // Wave 9: Pre-boss
            {
                enemies: [
                    { type: 'HARVESTER', count: 8, pattern: 'line', delay: 250 },
                    { type: 'SPLITTER', count: 12, pattern: 'scattered', delay: 150 },
                    { type: 'WRAITH', count: 12, pattern: 'scattered', delay: 200 },
                    { type: 'DRIFTER', count: 16, pattern: 'v-formation', delay: 75 }
                ],
                message: 'WAVE 9 - FINAL WAVE'
            },
            // Wave 10: BOSS
            {
                enemies: [],
                boss: 'SUNKEEPER',
                message: 'WARNING - THE SUNKEEPER APPROACHES'
            }
        ];
    }

    getProceduralWaves(chapter, bossName, bossTitle) {
        const waves = [];
        const difficulty = 1 + (chapter - 1) * 0.15; // 15% harder per chapter

        // Helper to scale enemy counts
        const count = (base) => Math.floor(base * difficulty);

        // Define varied wave types
        const waveTypes = [
            // 0: Light Swarm
            () => ({
                enemies: [
                    { type: 'DRIFTER', count: count(15), pattern: 'scattered', delay: 100 },
                    { type: 'STITCHER', count: count(5), pattern: 'center', delay: 300 }
                ],
                message: `WAVE 1 - CHAPTER ${chapter}`
            }),
            // 1: Heavy Line
            () => ({
                enemies: [
                    { type: 'HARVESTER', count: count(4), pattern: 'line', delay: 400 },
                    { type: 'DRIFTER', count: count(20), pattern: 'scattered', delay: 50 }
                ],
                message: 'WAVE 2'
            }),
            // 2: Fast Attack
            () => ({
                enemies: [
                    { type: 'WRAITH', count: count(12), pattern: 'v-formation', delay: 150 },
                    { type: 'SPLITTER', count: count(8), pattern: 'scattered', delay: 200 }
                ],
                message: 'WAVE 3'
            }),
            // 3: Tank & Spank
            () => ({
                enemies: [
                    { type: 'HARVESTER', count: count(6), pattern: 'center', delay: 300 },
                    { type: 'STITCHER', count: count(8), pattern: 'line', delay: 200 }
                ],
                message: 'WAVE 4'
            }),
            // 4: Swarm
            () => ({
                enemies: [
                    { type: 'DRIFTER', count: count(30), pattern: 'scattered', delay: 50 },
                    { type: 'SPLITTER', count: count(10), pattern: 'scattered', delay: 100 }
                ],
                message: 'WAVE 5'
            }),
            // 5: Elite Squad
            () => ({
                enemies: [
                    { type: 'WRAITH', count: count(15), pattern: 'left', delay: 100 },
                    { type: 'WRAITH', count: count(15), pattern: 'right', delay: 100 },
                    { type: 'HARVESTER', count: count(5), pattern: 'center', delay: 400 }
                ],
                message: 'WAVE 6'
            }),
            // 6: Mixed Bag
            () => ({
                enemies: [
                    { type: 'DRIFTER', count: count(20), pattern: 'scattered', delay: 75 },
                    { type: 'STITCHER', count: count(10), pattern: 'line', delay: 200 },
                    { type: 'SPLITTER', count: count(8), pattern: 'v-formation', delay: 150 }
                ],
                message: 'WAVE 7'
            }),
            // 7: Chaos
            () => ({
                enemies: [
                    { type: 'SPLITTER', count: count(15), pattern: 'scattered', delay: 100 },
                    { type: 'WRAITH', count: count(10), pattern: 'scattered', delay: 150 }
                ],
                message: 'WAVE 8'
            }),
            // 8: Pre-Boss
            () => ({
                enemies: [
                    { type: 'HARVESTER', count: count(8), pattern: 'line', delay: 250 },
                    { type: 'WRAITH', count: count(12), pattern: 'v-formation', delay: 150 },
                    { type: 'STITCHER', count: count(8), pattern: 'center', delay: 300 }
                ],
                message: 'WAVE 9 - FINAL DEFENSE'
            })
        ];

        // Generate 9 waves
        for (let i = 0; i < 9; i++) {
            waves.push(waveTypes[i]());
        }

        // Add Boss Wave
        waves.push({
            enemies: [],
            boss: bossName,
            message: `WARNING - ${bossTitle}`
        });

        return waves;
    }

    startWave(waveNum, enemyManager) {
        this.currentWave = waveNum;
        this.waveActive = true;
        this.waveComplete = false;
        this.waveStartTime = Date.now();
        this.enemiesRemaining = 0;

        const wave = this.waves[waveNum - 1];
        if (!wave) return;

        // Spawn enemies with delays
        let totalDelay = 0;
        for (const group of wave.enemies) {
            for (let i = 0; i < group.count; i++) {
                totalDelay += group.delay;
                this.enemiesRemaining++;

                setTimeout(() => {
                    this.spawnEnemy(group.type, group.pattern, i, group.count, enemyManager);
                }, totalDelay);
            }
        }

        // Check if boss wave
        if (wave.boss) {
            this.bossWave = true;
        }

        return wave.message;
    }

    spawnEnemy(type, pattern, index, total, enemyManager) {
        let x, y;
        const config = ENEMY_TYPES[type];

        switch (pattern) {
            case 'line':
                x = (GAME.WIDTH / (total + 1)) * (index + 1) - config.width / 2;
                y = -50 - index * 20;
                break;

            case 'v-formation':
                const centerX = GAME.WIDTH / 2;
                const spread = 40;
                const offset = index - Math.floor(total / 2);
                x = centerX + offset * spread - config.width / 2;
                y = -50 - Math.abs(offset) * 30;
                break;

            case 'scattered':
                x = Utils.random(50, GAME.WIDTH - 50 - config.width);
                y = Utils.random(-100, -50);
                break;

            case 'left':
                x = Utils.random(50, GAME.WIDTH / 3);
                y = -50 - index * 30;
                break;

            case 'right':
                x = Utils.random(GAME.WIDTH * 2 / 3, GAME.WIDTH - 50 - config.width);
                y = -50 - index * 30;
                break;

            case 'center':
                x = Utils.random(GAME.WIDTH / 3, GAME.WIDTH * 2 / 3 - config.width);
                y = -50 - index * 40;
                break;

            default:
                x = Utils.random(50, GAME.WIDTH - 50 - config.width);
                y = -50;
        }

        const enemy = new Enemy(type, x, y);

        // Assign movement patterns
        const patterns = ['dive', 'sine', 'zigzag'];
        enemy.pattern = Utils.randomChoice(patterns);

        enemyManager.enemies.push(enemy);
    }

    onEnemyKilled() {
        this.enemiesRemaining--;
    }

    update(deltaTime, enemyManager) {
        // Check if wave is complete
        if (this.waveActive && !this.bossWave) {
            if (this.enemiesRemaining <= 0 && enemyManager.enemies.length === 0) {
                this.waveActive = false;
                this.waveComplete = true;
                this.waveTimer = this.waveDelay;
            }
        }

        // Countdown to next wave
        if (this.waveComplete && this.currentWave < this.totalWaves) {
            this.waveTimer -= deltaTime;
            if (this.waveTimer <= 0) {
                this.waveComplete = false;
                return this.startWave(this.currentWave + 1, enemyManager);
            }
        }

        return null;
    }

    isAllWavesComplete() {
        return this.currentWave >= this.totalWaves && this.waveComplete;
    }

    draw(ctx) {
        // Wave indicator
        ctx.fillStyle = COLORS.PRIMARY;
        ctx.font = 'bold 14px "Courier New"';
        ctx.textAlign = 'right';
        ctx.fillText(`WAVE ${this.currentWave}/${this.totalWaves}`, GAME.WIDTH - 20, 70);
    }
}
