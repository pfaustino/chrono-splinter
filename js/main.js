// ============================================
// The Chrono-Splinter - Main Game Loop
// ============================================

const Game = {
    canvas: null,
    ctx: null,
    player: null,
    bulletManager: null,
    enemyManager: null,
    powerupManager: null,
    coinManager: null,
    waveManager: null,
    background: null,
    waveManager: null,
    background: null,
    particleManager: null,
    boss: null,

    lastTime: 0,
    running: false,
    paused: false,
    gameOver: false,
    chapterComplete: false,
    inShop: false,
    inShop: false,
    inIntro: false,
    waitingForInput: true, // New state for audio policy

    currentChapter: 1,
    chapterNames: [
        '', // 0 unused
        'Mercury',
        'Venus',
        'Earth Orbit',
        'The Moon',
        'Mars',
        'Asteroid Belt',
        'Jupiter',
        'Europa',
        'Saturn',
        'Uranus',
        'Neptune',
        'The Edge'
    ],

    // Wave announcement
    waveMessage: null,
    waveMessageTimer: 0,

    // Pause cooldown
    pauseCooldown: 0,

    // Victory/Collection Timer
    victoryTimer: 0,

    // Screen Shake
    shakeTimer: 0,
    shakeIntensity: 0,

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Set canvas size
        this.canvas.width = GAME.WIDTH;
        this.canvas.height = GAME.HEIGHT;

        // Initialize systems
        Input.init();
        UI.init();
        Audio.init();

        // Create managers
        this.bulletManager = new BulletManager();
        this.enemyManager = new EnemyManager();
        this.powerupManager = new PowerupManager();
        this.coinManager = new CoinManager();
        this.waveManager = new WaveManager();
        this.particleManager = new ParticleManager();
        this.floatingTextManager = new FloatingTextManager();

        // Create background for current chapter
        this.background = Backgrounds.create(this.currentChapter);

        // Create player
        this.player = new Player(
            GAME.WIDTH / 2 - PLAYER.WIDTH / 2,
            GAME.HEIGHT - 100
        );

        // Set chapter
        UI.setChapter(this.currentChapter, this.chapterNames[this.currentChapter]);

        // Start game loop
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));

        console.log(`🚀 The Chrono-Splinter v${GAME.VERSION} initialized!`);
    },

    startGame() {
        this.waitingForInput = false;

        UI.hideGameplayUI(); // Ensure UI is hidden for intro

        // Start Intro Music
        Audio.playMusic('intro');
        this.inIntro = true;

        // Start with Chapter 1 Intro
        ChapterIntro.start(1, () => {
            this.inIntro = false;
            this.beginChapter();
        });
    },

    loop(currentTime) {
        if (!this.running) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Ensure input state is fresh every frame
        Input.updateGamepad();

        // Handle Pause Input
        if (this.pauseCooldown > 0) this.pauseCooldown -= deltaTime;

        // Force user input for audio context
        if (this.waitingForInput) {
            // Space, Enter, Gamepad A (0) or Start (9), or Touch
            if (Input.isPressed('Space') || Input.isPressed('Enter') ||
                (Input.gamepad && (Input.isGamepadButtonPressed(0) || Input.isGamepadButtonPressed(9))) ||
                Input.touch.active) {
                this.startGame();
            }
            this.draw();
            requestAnimationFrame((t) => this.loop(t));
            return;
        }

        // Special Modes Input Handling (Game Over / Chapter Complete)
        if (this.gameOver || this.chapterComplete) {
            this.handleSpecialInput(deltaTime);
            this.draw();
            requestAnimationFrame((t) => this.loop(t));
            return;
        }

        let shouldTogglePause = false;
        let shouldToggleMap = false;

        if (this.pauseCooldown <= 0) {
            // Keyboard/Gamepad Toggle
            if (Input.isPressed('Escape') || (Input.gamepad && Input.isGamepadButtonPressed(9))) {
                shouldTogglePause = true;
            }
            if (Input.isPressed('KeyM') || (Input.gamepad && Input.isGamepadButtonPressed(8))) {
                shouldToggleMap = true;
            }

            // Touch/Click Toggle
            let clickAction = null;
            const touch = Input.getTouchTarget();

            // Check touch first (clean press)
            if (touch) {
                clickAction = UI.checkPauseClick(touch.x, touch.y);
            }
            // Check active Mouse/Touch (fallback)
            else if (Input.touch.active) {
                const mouseX = Input.touch.currentX;
                const mouseY = Input.touch.currentY;
                clickAction = UI.checkPauseClick(mouseX, mouseY);
            }

            if (clickAction === 'settings') shouldTogglePause = true;
            if (clickAction === 'map') shouldToggleMap = true;
        }

        if (shouldTogglePause && this.pauseCooldown <= 0) {
            // If map is open, close it first? or just switch?
            if (GameMap.active) GameMap.close();

            Settings.toggle();
            this.pauseCooldown = 300; // Debounce
        }

        if (shouldToggleMap && this.pauseCooldown <= 0) {
            // If settings open, close them
            if (Settings.active) Settings.close();

            GameMap.toggle();
            this.pauseCooldown = 300;
        }

        // Handle Settings Menu
        if (Settings.active) {
            Settings.update(deltaTime);
        }

        // Handle Map
        else if (GameMap.active) {
            GameMap.update(deltaTime);
        }

        // Handle victory ending
        if (this.victory) {
            Ending.update(deltaTime);
        }
        // Handle intro
        else if (this.inIntro) {
            ChapterIntro.update(deltaTime);
        }
        // Handle Shop
        else if (this.inShop) {
            Shop.update(deltaTime);
        }
        // Main Game Update
        else if (!Settings.active && !GameMap.active) {
            this.update(deltaTime);
        }

        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    },

    update(deltaTime) {
        // Update background
        this.background.update(deltaTime);
        this.particleManager.update(deltaTime);

        // Update Screen Shake
        if (this.shakeTimer > 0) {
            this.shakeTimer -= deltaTime;
            if (this.shakeTimer <= 0) {
                this.shakeIntensity = 0;
            }
        }

        this.floatingTextManager.update(deltaTime);

        // Update player
        this.player.update(deltaTime, this.particleManager, this.enemyManager, this.bulletManager);

        // Handle firing
        if (Input.isFiring()) {
            this.player.tryFire(this.bulletManager);
        }

        // DEBUG: Press 'B' to skip to boss
        if (Input.isPressed('KeyB') && !this.boss && !this.debugBossSpawned) {
            this.debugBossSpawned = true;
            this.enemyManager.clear();
            this.bulletManager.clear();
            this.waveManager.currentWave = 10;
            this.waveManager.bossWave = true;
            this.waveMessage = 'DEBUG: SKIPPING TO BOSS';
            this.waveMessageTimer = 2000;
            this.spawnBoss();
            console.log('🔧 DEBUG: Skipped to boss fight');
        }

        // DEBUG: Press 'I' to preview chapter intros
        if (Input.isPressed('KeyI') && !this.inIntro && !this.debugIntroShown) {
            this.debugIntroShown = true;
            this.debugIntroChapter = (this.debugIntroChapter || 0) % 3 + 1;
            this.inIntro = true;
            // Play intro music for preview
            Audio.playMusic('intro');

            ChapterIntro.start(this.debugIntroChapter, () => {
                this.inIntro = false;
                this.debugIntroShown = false;
                console.log(`🎬 DEBUG: Intro ${this.debugIntroChapter} complete`);
                // Stop music or switch back to level music if we were playing
                if (this.currentChapter === 3) Audio.playMusic('chapter3');
                else Audio.playMusic('chapter1_2');
            });
            console.log(`🎬 DEBUG: Showing Chapter ${this.debugIntroChapter} intro`);
        }

        // Update managers
        this.bulletManager.update(deltaTime, this.enemyManager.enemies, this.player);

        // Only update enemy manager spawning if no wave system or boss active
        if (!this.waveManager && !this.boss) {
            this.enemyManager.update(deltaTime, this.player, this.bulletManager);
        } else {
            // Just update existing enemies, don't spawn new ones
            for (const enemy of this.enemyManager.enemies) {
                enemy.update(deltaTime, this.player, this.bulletManager);
            }
            this.enemyManager.enemies = this.enemyManager.enemies.filter(e => e.active);
        }

        this.powerupManager.update(deltaTime);
        this.coinManager.update(deltaTime, this.player);

        // Update wave system
        if (this.waveManager && !this.boss) {
            const msg = this.waveManager.update(deltaTime, this.enemyManager);
            if (msg) {
                this.waveMessage = msg;
                this.waveMessageTimer = 2000;

                // Check for boss wave
                if (this.waveManager.bossWave) {
                    this.spawnBoss();
                }
            }
        }

        // Update boss
        if (this.boss) {
            this.boss.update(deltaTime, this.player, this.bulletManager);

            // Check boss collision with player bullets
            // Check boss collision with player bullets
            for (const bullet of this.bulletManager.playerBullets) {
                if (!this.boss) break; // Boss was defeated, exit loop
                // Bosses have large sprites, use forgiving circle collision
                if (Utils.circleCollision(bullet, this.boss, 0.5, 0.4)) {
                    const killed = this.boss.takeDamage(bullet.damage);
                    this.particleManager.spawnImpact(bullet.x, bullet.y, '#fff', bullet.angle + Math.PI);
                    bullet.onHit();

                    if (killed) {
                        this.onBossDefeated();
                        break; // Exit loop after boss defeated
                    }
                }
            }
        }

        // Check collisions
        const result = Collision.checkAll(
            this.player,
            this.bulletManager,
            this.enemyManager,
            this.powerupManager,
            this.coinManager,
            this.particleManager
        );

        // Notify wave manager of enemy kills
        if (this.waveManager && result.enemiesKilled > 0) {
            for (let i = 0; i < result.enemiesKilled; i++) {
                this.waveManager.onEnemyKilled();
            }
        }

        if (result.gameOver) {
            this.handleGameOver();
        }

        // Wave message timer
        if (this.waveMessageTimer > 0) {
            this.waveMessageTimer -= deltaTime;
        }

        if (this.victoryTimer > 0) {
            this.victoryTimer -= deltaTime;
            if (this.victoryTimer <= 0) {
                this.completeChapterPhase();
            }
        }

        // Update UI
        UI.update(this.player, this.currentChapter);
    },

    spawnBoss() {
        const wave = this.waveManager.waves[this.waveManager.currentWave - 1];
        if (wave && wave.boss) {
            this.boss = Bosses.create(wave.boss);
            // Switch to boss music
            Audio.playMusic('boss');
        }
    },

    onBossDefeated() {
        // Award bonus
        this.player.addScore(10000 * this.currentChapter);
        this.player.addCoins(100);

        // Spawn lots of coins
        if (this.boss) {
            for (let i = 0; i < 20; i++) {
                this.coinManager.spawn(
                    this.boss.x + this.boss.width / 2 + Utils.random(-50, 50),
                    this.boss.y + this.boss.height / 2 + Utils.random(-50, 50),
                    3
                );
            }
        }

        Audio.play('explosion');
        // Massive explosion for boss
        this.particleManager.spawnExplosion(this.boss.x + this.boss.width / 2, this.boss.y + this.boss.height / 2, this.boss.color || '#ff0000', 50);

        // Play victory/calm music (or just stop boss music)
        Audio.playMusic('intro');

        // Start collection phase (4 seconds)
        this.boss = null;
        this.victoryTimer = 4000;
        this.waveManager.waveComplete = true;
    },

    handleSpecialInput(deltaTime) {
        // Cooldown for inputs
        if (this.inputCooldown > 0) {
            this.inputCooldown -= deltaTime;
            return;
        }

        // Check Confirm Input (Enter, Gamepad A/Start, Touch)
        if (this.checkConfirmInput()) {
            if (this.gameOver) {
                this.restart();
            } else if (this.chapterComplete) {
                this.openShop();
            }
        }
    },

    checkConfirmInput() {
        // Keyboard: Enter
        if (Input.isPressed('Enter')) return true;

        // Gamepad: A (0) or Start (9)
        if (Input.gamepad) {
            if (Input.isGamepadButtonPressed(0)) return true;
            if (Input.isGamepadButtonPressed(9)) return true;
        }

        // Touch: Tap (Anywhere)
        // We'll use a simple check for active touch, assuming cooldown prevents instant skipping
        if (Input.touch.active) return true;

        return false;
    },

    completeChapterPhase() {
        this.chapterComplete = true;
        UI.hideGameplayUI();
        this.inputCooldown = 1500; // Delay before accepting input to avoid accidental skips
    },

    openShop() {
        this.chapterComplete = false;
        this.inShop = true;
        Shop.open(this.player, () => {
            this.inShop = false;
            this.startNextChapter();
        });
    },

    startNextChapter() {
        this.currentChapter++;

        // Check if game complete (12 chapters total)
        if (this.currentChapter > 12) {
            this.showVictory();
            return;
        }

        // Start intro
        this.inIntro = true;
        ChapterIntro.start(this.currentChapter, () => {
            this.inIntro = false;
            this.beginChapter();
        });
    },

    startChapter(num) {
        this.currentChapter = num;

        // Start intro
        this.inIntro = true;
        ChapterIntro.start(this.currentChapter, () => {
            this.inIntro = false;
            this.beginChapter();
        });
    },

    beginChapter() {
        // Reset for new chapter
        this.boss = null;
        this.debugBossSpawned = false;
        this.bulletManager.clear();
        this.enemyManager.clear();
        this.powerupManager.clear();
        this.coinManager.clear();
        this.floatingTextManager.clear();
        this.waveManager = new WaveManager(this.currentChapter);
        this.background = Backgrounds.create(this.currentChapter);

        UI.setChapter(this.currentChapter, this.chapterNames[this.currentChapter]);

        // Play level music
        if (this.currentChapter === 3) {
            Audio.playMusic('chapter3');
        } else {
            Audio.playMusic('chapter1_2');
        }

        // Start first wave
        this.waveMessage = this.waveManager.startWave(1, this.enemyManager);
        this.waveMessageTimer = 2000;
    },

    showVictory() {
        // Start the ending sequence
        this.victory = true;
        // Ensure ending music plays (re-using intro/cinematic theme)
        Audio.playMusic('intro');
        Ending.start(this.player);
    },

    draw() {
        const ctx = this.ctx;

        // Apply Screen Shake
        let shakeX = 0;
        let shakeY = 0;
        if (this.shakeTimer > 0) {
            shakeX = (Math.random() - 0.5) * this.shakeIntensity;
            shakeY = (Math.random() - 0.5) * this.shakeIntensity;
        }

        ctx.save();
        ctx.translate(shakeX, shakeY);

        // Draw background
        this.background.draw(ctx);
        this.particleManager.draw(ctx);

        // Draw game objects
        this.coinManager.draw(ctx);
        this.powerupManager.draw(ctx);
        this.enemyManager.draw(ctx);
        this.bulletManager.draw(ctx);
        this.player.draw(ctx);

        if (this.boss) {
            this.boss.draw(ctx);
        }

        this.floatingTextManager.draw(ctx);

        ctx.restore(); // END SCREEN SHAKE

        // UI Layer
        // Score/Lives are HTML overlay, handled by UI.update
        // Only draw Canvas UI elements here

        // Draw wave indicator
        if (this.waveManager) {
            this.waveManager.draw(ctx);
        }

        // Draw wave message
        if (this.waveMessage && this.waveMessageTimer > 0) {
            this.drawWaveMessage(ctx);
        }

        // Game over screen
        if (this.gameOver) {
            this.drawGameOver(ctx);
        }

        // Chapter complete screen
        if (this.chapterComplete) {
            this.drawChapterComplete(ctx);
        }

        // Shop overlay
        if (this.inShop) {
            Shop.draw(ctx);
        }

        // Intro overlay
        if (this.inIntro) {
            ChapterIntro.draw(ctx);
        }

        // Victory ending overlay
        if (this.victory) {
            Ending.draw(ctx);
        }

        // Pause Button and Map Button (Always visible during gameplay)
        // Hide when firing to reduce clutter
        if (!this.inIntro && !this.victory && !this.inShop && !Input.isFiring()) {
            UI.drawPauseButton(ctx);
        }

        // Draw Version Number (Always)
        UI.drawVersion(ctx);

        // Settings Menu Overlay
        if (Settings.active) {
            Settings.draw(ctx);
        }

        // Map Overlay
        if (GameMap.active) {
            GameMap.draw(ctx);
        }

        // Click to Start Overlay
        if (this.waitingForInput) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 32px "Courier New"';
            ctx.textAlign = 'center';
            ctx.fillText('CLICK OR PRESS KEY TO START', GAME.WIDTH / 2, GAME.HEIGHT / 2);

            ctx.font = '16px "Courier New"';
            ctx.fillStyle = '#888';
            ctx.fillText('(Required for Audio)', GAME.WIDTH / 2, GAME.HEIGHT / 2 + 40);
        }
    },

    drawWaveMessage(ctx) {
        const alpha = Math.min(1, this.waveMessageTimer / 500);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = COLORS.WARNING;
        ctx.font = 'bold 28px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText(this.waveMessage, GAME.WIDTH / 2, GAME.HEIGHT / 2 - 100);
        ctx.restore();
    },

    drawGameOver(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

        ctx.fillStyle = COLORS.HEALTH;
        ctx.font = 'bold 48px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', GAME.WIDTH / 2, GAME.HEIGHT / 2 - 30);

        ctx.fillStyle = COLORS.PRIMARY;
        ctx.font = '24px "Courier New"';
        ctx.fillText(`Score: ${this.player.score}`, GAME.WIDTH / 2, GAME.HEIGHT / 2 + 20);

        // Pulsing text
        const alpha = 0.5 + Math.sin(Date.now() / 400) * 0.5;
        ctx.globalAlpha = alpha;
        ctx.fillText('Press ENTER or Tap to restart', GAME.WIDTH / 2, GAME.HEIGHT / 2 + 60);
        ctx.globalAlpha = 1.0;
    },

    drawChapterComplete(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

        ctx.fillStyle = COLORS.PRIMARY;
        ctx.font = 'bold 36px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('CHAPTER COMPLETE!', GAME.WIDTH / 2, GAME.HEIGHT / 2 - 60);

        // Dynamic boss name
        const bossNames = {
            1: 'THE SUNKEEPER', 2: 'THE STORMWEAVER', 3: 'THE CHRONO-WEAVER',
            4: 'THE ECHO', 5: 'THE WARDEN', 6: 'THE SIEGEBREAKER',
            7: 'THE TEMPEST', 8: 'THE LEVIATHAN', 9: 'THE RINGMASTER',
            10: 'THE FORGEMASTER', 11: 'THE ARCHITECT', 12: 'THE LOOM CORE'
        };
        const bossName = bossNames[this.currentChapter] || 'BOSS';

        ctx.fillStyle = COLORS.COINS;
        ctx.font = 'bold 24px "Courier New"';
        ctx.fillText(`${bossName} DEFEATED`, GAME.WIDTH / 2, GAME.HEIGHT / 2 - 20);

        ctx.fillStyle = '#fff';
        ctx.font = '20px "Courier New"';
        ctx.fillText(`Score: ${this.player.score}`, GAME.WIDTH / 2, GAME.HEIGHT / 2 + 30);
        ctx.fillText(`Coins: ${this.player.coins}`, GAME.WIDTH / 2, GAME.HEIGHT / 2 + 60);

        ctx.fillStyle = COLORS.PRIMARY;
        // Pulsing text
        const alpha = 0.5 + Math.sin(Date.now() / 400) * 0.5;
        ctx.globalAlpha = alpha;
        ctx.fillText('Press ENTER for Upgrade Shop', GAME.WIDTH / 2, GAME.HEIGHT / 2 + 110);
        ctx.globalAlpha = 1.0;
    },

    handleGameOver() {
        this.gameOver = true;
        UI.hideGameplayUI();
        this.inputCooldown = 1000; // prevent instant restart
        // Play game over sound (music continues)
        Audio.play('gameover');
    },

    restart() {
        this.gameOver = false;
        this.chapterComplete = false;
        this.boss = null;
        this.debugBossSpawned = false; // Reset debug flag
        this.player = new Player(
            GAME.WIDTH / 2 - PLAYER.WIDTH / 2,
            GAME.HEIGHT - 100
        );
        this.bulletManager.clear();
        this.enemyManager.clear();
        this.powerupManager.clear();
        this.coinManager.clear();
        this.floatingTextManager.clear();
        this.waveManager = new WaveManager();
        this.background = Backgrounds.create(this.currentChapter);

        // Start first wave
        this.waveMessage = this.waveManager.startWave(1, this.enemyManager);
        this.waveMessageTimer = 2000;
    },

    toggleDebug() {
        this.debugMode = !this.debugMode;
    },

    triggerShake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeTimer = duration;
    },

    addFloatingText(x, y, text, color) {
        if (this.floatingTextManager) {
            this.floatingTextManager.spawn(x, y, text, color);
        }
    }
};

// Start the game when page loads
window.addEventListener('load', () => {
    Game.init();
});
