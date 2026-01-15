// ============================================
// The Chrono-Splinter - Victory Ending Sequence
// ============================================

const Ending = {
    active: false,
    phase: 'fadeIn',
    phaseTimer: 0,
    scrollY: 0,
    stars: [],
    player: null,

    timing: {
        fadeIn: 2000,
        title: 4000,
        story: 25000, // Increased to allow reading
        stats: 5000,
        credits: 30000, // Increased for longer credits
        fadeOut: 2000,
    },

    // Story text
    epilogue: [
        'The Chrono-Weaver falls.',
        '',
        'With the destruction of the temporal',
        'gate, Earth orbit is liberated.',
        '',
        'The Continuance retreats, their invasion',
        'force scattered across fractured timelines.',
        '',
        'Commander Kira Vance has saved humanity...',
        '',
        'For now.',
        '',
        '',
        'But whispers echo from the outer system.',
        'Mars. Jupiter. The edge of the solar system.',
        '',
        'The war is far from over.',
    ],

    credits: [
        { role: 'THE CHRONO-SPLINTER', name: '' },
        { role: '', name: '' },
        { role: 'A Game By', name: 'Patrick Faustino' },
        { role: '', name: '' },
        { role: 'Programming', name: 'Collaborative AI + Human' },
        { role: 'Game Design', name: 'Collaborative AI + Human' },
        { role: 'Art Direction', name: 'Procedural Generation' },
        { role: '', name: '' },
        { role: 'BOSSES', name: '' },
        { role: 'The Sunkeeper', name: 'Guardian of Mercury' },
        { role: 'The Stormweaver', name: 'Master of Venus' },
        { role: 'The Chrono-Weaver', name: 'Keeper of Time' },
        { role: '', name: '' },
        { role: 'SPECIAL THANKS', name: '' },
        { role: '', name: 'Classic Arcade Games' },
        { role: '', name: 'Sci-Fi Inspiration' },
        { role: '', name: 'You, the Player' },
        { role: '', name: '' },
        { role: '', name: '' },
        { role: 'TO BE CONTINUED...', name: '' },
    ],

    generateStars() {
        this.stars = [];
        for (let i = 0; i < 150; i++) {
            this.stars.push({
                x: Math.random() * GAME.WIDTH,
                y: Math.random() * GAME.HEIGHT,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.2 + 0.05,
                brightness: Math.random() * 0.7 + 0.3,
            });
        }
    },

    start(player) {
        this.active = true;
        this.player = player;
        this.phase = 'fadeIn';
        this.phaseTimer = 0;
        this.scrollY = GAME.HEIGHT;
        this.fadeAlpha = 1;
        this.generateStars();
        this.inputCooldown = 2000; // Delay before allowing restart
    },

    restart() {
        location.reload();
    },

    update(deltaTime) {
        if (!this.active) return;

        this.phaseTimer += deltaTime;

        // Update stars
        for (const star of this.stars) {
            star.y += star.speed;
            if (star.y > GAME.HEIGHT) {
                star.y = 0;
                star.x = Math.random() * GAME.WIDTH;
            }
        }

        switch (this.phase) {
            case 'fadeIn':
                this.fadeAlpha = 1 - (this.phaseTimer / this.timing.fadeIn);
                if (this.phaseTimer >= this.timing.fadeIn) {
                    this.phase = 'title';
                    this.phaseTimer = 0;
                }
                break;

            case 'title':
                if (this.phaseTimer >= this.timing.title) {
                    this.phase = 'story';
                    this.phaseTimer = 0;
                    this.scrollY = GAME.HEIGHT;
                }
                break;

            case 'story':
                this.scrollY -= 1.2; // Increased scroll speed
                if (this.phaseTimer >= this.timing.story) {
                    this.phase = 'stats';
                    this.phaseTimer = 0;
                }
                break;

            case 'stats':
                if (this.phaseTimer >= this.timing.stats) {
                    this.phase = 'credits';
                    this.phaseTimer = 0;
                    this.scrollY = GAME.HEIGHT;
                }
                break;

            case 'credits':
                this.scrollY -= 0.6;
                if (this.phaseTimer >= this.timing.credits) {
                    this.phase = 'end';
                    this.phaseTimer = 0;
                }
                break;

            case 'end':
                // Cooldown
                if (this.inputCooldown > 0) {
                    this.inputCooldown -= deltaTime;
                } else {
                    // Check for restart input
                    let restart = false;

                    // Keyboard
                    if (Input.isPressed('Enter') || Input.isPressed('Space')) restart = true;

                    // Gamepad (A or Start)
                    if (Input.gamepad) {
                        if (Input.isGamepadButtonPressed(0)) restart = true;
                        if (Input.isGamepadButtonPressed(9)) restart = true;
                    }

                    // Touch
                    if (Input.touch.active) restart = true;

                    if (restart) {
                        this.restart();
                    }
                }
                break;
        }
    },

    draw(ctx) {
        if (!this.active) return;

        // Black background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

        // Stars
        for (const star of this.stars) {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }

        switch (this.phase) {
            case 'title':
                this.drawTitle(ctx);
                break;
            case 'story':
                this.drawStory(ctx);
                break;
            case 'stats':
                this.drawStats(ctx);
                break;
            case 'credits':
                this.drawCredits(ctx);
                break;
            case 'end':
                this.drawEnd(ctx);
                break;
        }

        // Fade overlay
        if (this.fadeAlpha > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, this.fadeAlpha)})`;
            ctx.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);
        }
    },

    drawTitle(ctx) {
        const progress = Math.min(1, this.phaseTimer / 1500);

        ctx.save();
        ctx.translate(GAME.WIDTH / 2, GAME.HEIGHT / 2);

        // Victory text with glow
        ctx.globalAlpha = progress;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 48px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('VICTORY', 0, -40);

        ctx.shadowBlur = 0;
        ctx.fillStyle = COLORS.COINS;
        ctx.font = 'bold 24px "Courier New"';
        ctx.fillText('EARTH IS LIBERATED', 0, 10);

        ctx.fillStyle = '#fff';
        ctx.font = '18px "Courier New"';
        ctx.fillText('The Continuance has been defeated', 0, 50);

        ctx.restore();
    },

    drawStory(ctx) {
        ctx.save();
        ctx.translate(GAME.WIDTH / 2, 0);

        const lineHeight = 28;

        for (let i = 0; i < this.epilogue.length; i++) {
            const y = this.scrollY + i * lineHeight;

            if (y > -30 && y < GAME.HEIGHT + 30) {
                // Fade at edges
                let alpha = 1;
                if (y < 100) alpha = y / 100;
                if (y > GAME.HEIGHT - 100) alpha = (GAME.HEIGHT - y) / 100;
                alpha = Math.max(0, Math.min(1, alpha));

                ctx.globalAlpha = alpha;
                ctx.fillStyle = COLORS.COINS;
                ctx.font = '16px "Courier New"';
                ctx.textAlign = 'center';
                ctx.fillText(this.epilogue[i], 0, y);
            }
        }

        ctx.restore();
    },

    drawStats(ctx) {
        const progress = Math.min(1, this.phaseTimer / 1000);

        ctx.save();
        ctx.globalAlpha = progress;
        ctx.translate(GAME.WIDTH / 2, GAME.HEIGHT / 2 - 80);

        ctx.fillStyle = COLORS.PRIMARY;
        ctx.font = 'bold 28px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('MISSION COMPLETE', 0, 0);

        const stats = [
            { label: 'FINAL SCORE', value: this.player ? this.player.score.toLocaleString() : '0' },
            { label: 'COINS COLLECTED', value: this.player ? this.player.coins.toString() : '0' },
            { label: 'BOSSES DEFEATED', value: '12 / 12' },
            { label: 'CHAPTERS COMPLETED', value: '12 / 12' },
        ];

        ctx.font = '16px "Courier New"';
        stats.forEach((stat, i) => {
            const y = 50 + i * 35;

            ctx.fillStyle = '#888';
            ctx.textAlign = 'right';
            ctx.fillText(stat.label, -20, y);

            ctx.fillStyle = COLORS.COINS;
            ctx.textAlign = 'left';
            ctx.fillText(stat.value, 20, y);
        });

        ctx.restore();
    },

    drawCredits(ctx) {
        ctx.save();
        ctx.translate(GAME.WIDTH / 2, 0);

        const entryHeight = 50;

        for (let i = 0; i < this.credits.length; i++) {
            const credit = this.credits[i];
            const y = this.scrollY + i * entryHeight;

            if (y > -50 && y < GAME.HEIGHT + 50) {
                // Fade at edges
                let alpha = 1;
                if (y < 100) alpha = y / 100;
                if (y > GAME.HEIGHT - 100) alpha = (GAME.HEIGHT - y) / 100;
                alpha = Math.max(0, Math.min(1, alpha));

                ctx.globalAlpha = alpha;
                ctx.textAlign = 'center';

                if (credit.role && !credit.name) {
                    // Header style
                    ctx.fillStyle = COLORS.PRIMARY;
                    ctx.font = 'bold 20px "Courier New"';
                    ctx.fillText(credit.role, 0, y);
                } else if (credit.role) {
                    // Role + Name
                    ctx.fillStyle = '#888';
                    ctx.font = '14px "Courier New"';
                    ctx.fillText(credit.role, 0, y - 10);

                    ctx.fillStyle = '#fff';
                    ctx.font = '16px "Courier New"';
                    ctx.fillText(credit.name, 0, y + 10);
                } else if (credit.name) {
                    // Just name
                    ctx.fillStyle = COLORS.COINS;
                    ctx.font = '16px "Courier New"';
                    ctx.fillText(credit.name, 0, y);
                }
            }
        }

        ctx.restore();
    },

    drawEnd(ctx) {
        ctx.save();
        ctx.translate(GAME.WIDTH / 2, GAME.HEIGHT / 2);

        ctx.fillStyle = COLORS.PRIMARY;
        ctx.font = 'bold 32px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('THANK YOU FOR PLAYING', 0, -30);

        ctx.fillStyle = '#888';
        ctx.font = '16px "Courier New"';
        ctx.fillText('The story continues...', 0, 10);

        // Pulsing prompt
        ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 400) * 0.3;
        ctx.fillStyle = COLORS.COINS;
        ctx.fillText('Press ENTER or Tap to play again', 0, 60);

        ctx.restore();
    }
};
