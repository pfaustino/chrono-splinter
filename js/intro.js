// ============================================
// The Chrono-Splinter - Chapter Intro System
// Star Wars style scrolling text with full polish
// ============================================

const ChapterIntro = {
    active: false,
    phase: 'fadeIn',  // fadeIn, preText, titleReveal, crawl, fadeOut
    phaseTimer: 0,
    scrollY: 0,
    scrollSpeed: 0.6,
    onComplete: null,
    chapter: 1,
    text: [],

    // Timing configuration (in ms)
    timing: {
        fadeIn: 1500,
        preText: 3000,
        titleReveal: 2500,
        fadeOut: 1000,
    },

    // Animation state
    fadeAlpha: 1,
    titleScale: 0,
    preTextAlpha: 0,

    // Starfield for parallax
    stars: [],

    // Chapter intro texts
    intros: {
        1: {
            title: 'CHAPTER I',
            subtitle: 'THE SOLAR FORGE',
            preText: 'In the year 2847...',
            text: [
                'Humanity faces extinction as',
                'THE CONTINUANCE, a faction from',
                'a dying future, invades the past',
                'to harvest our resources.',
                '',
                'Commander KIRA VANCE pilots',
                'THE EPOCH, humanity\'s last hope,',
                'beginning her mission at Mercury\'s',
                'orbital defense station.',
                '',
                'The Sunkeeper awaits...',
            ]
        },
        2: {
            title: 'CHAPTER II',
            subtitle: 'THE ACID CLOUDS',
            preText: 'Mercury has fallen silent...',
            text: [
                'The Sunkeeper\'s destruction',
                'sends shockwaves through the',
                'Continuance command structure.',
                '',
                'But there is no time to rest.',
                'Venus\'s cloud refineries pulse',
                'with temporal energy, feeding',
                'the enemy war machine.',
                '',
                'Commander Vance must descend',
                'into the toxic atmosphere',
                'to face THE STORMWEAVER,',
                'master of Venus\'s eternal storms.',
                '',
                'The clouds grow dark...',
            ]
        },
        3: {
            title: 'CHAPTER III',
            subtitle: 'HOME ORBIT',
            preText: 'Two generals have fallen...',
            text: [
                'Two victories. Two generals fallen.',
                '',
                'The Continuance grows desperate.',
                'They have fortified Earth orbit,',
                'humanity\'s birthright now ringed',
                'with temporal displacement weapons.',
                '',
                'THE CHRONO-WEAVER awaits,',
                'guardian of the orbital gate,',
                'the key to Earth\'s liberation.',
                '',
                'Commander Vance returns home...',
            ]
        }
    },

    generateStars() {
        this.stars = [];
        for (let i = 0; i < 200; i++) {
            this.stars.push({
                x: Math.random() * GAME.WIDTH,
                y: Math.random() * GAME.HEIGHT,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.3 + 0.1,
                brightness: Math.random() * 0.7 + 0.3,
            });
        }
    },

    start(chapterNum, onComplete) {
        this.active = true;
        this.chapter = chapterNum;
        this.onComplete = onComplete;
        this.phase = 'fadeIn';
        this.phaseTimer = 0;
        this.fadeAlpha = 1;
        this.titleScale = 0;
        this.preTextAlpha = 0;
        this.scrollY = GAME.HEIGHT + 50;

        const intro = this.intros[chapterNum];
        if (!intro) {
            this.skip();
            return;
        }

        this.title = intro.title;
        this.subtitle = intro.subtitle;
        this.preText = intro.preText || '';
        this.text = intro.text;

        // Generate starfield
        this.generateStars();

        // Skip handler
        this.keyHandler = (e) => {
            if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
                this.skip();
            }
        };
        window.addEventListener('keydown', this.keyHandler);

        // Touch to skip
        this.touchHandler = () => this.skip();
        document.addEventListener('touchstart', this.touchHandler, { once: true });
    },

    skip() {
        this.phase = 'fadeOut';
        this.phaseTimer = 0;
    },

    finish() {
        this.active = false;
        window.removeEventListener('keydown', this.keyHandler);
        document.removeEventListener('touchstart', this.touchHandler);
        if (this.onComplete) this.onComplete();
    },

    update(deltaTime) {
        if (!this.active) return;

        this.phaseTimer += deltaTime;

        // Update stars (parallax)
        for (const star of this.stars) {
            star.y += star.speed;
            if (star.y > GAME.HEIGHT) {
                star.y = 0;
                star.x = Math.random() * GAME.WIDTH;
            }
        }

        switch (this.phase) {
            case 'fadeIn':
                // Fade from black
                this.fadeAlpha = 1 - (this.phaseTimer / this.timing.fadeIn);
                if (this.phaseTimer >= this.timing.fadeIn) {
                    this.phase = 'preText';
                    this.phaseTimer = 0;
                }
                break;

            case 'preText':
                // Show "In the year..." text
                const preTextMid = this.timing.preText / 2;
                if (this.phaseTimer < preTextMid) {
                    this.preTextAlpha = this.phaseTimer / (preTextMid * 0.5);
                } else {
                    this.preTextAlpha = 1 - ((this.phaseTimer - preTextMid) / preTextMid);
                }
                this.preTextAlpha = Math.max(0, Math.min(1, this.preTextAlpha));

                if (this.phaseTimer >= this.timing.preText) {
                    this.phase = 'titleReveal';
                    this.phaseTimer = 0;
                }
                break;

            case 'titleReveal':
                // Dramatic title zoom
                const progress = this.phaseTimer / this.timing.titleReveal;
                // Ease out cubic
                this.titleScale = 1 - Math.pow(1 - Math.min(1, progress), 3);

                if (this.phaseTimer >= this.timing.titleReveal) {
                    this.phase = 'crawl';
                    this.phaseTimer = 0;
                }
                break;

            case 'crawl':
                // Scroll the text
                this.scrollY -= this.scrollSpeed;

                // Check if crawl is complete
                const totalHeight = this.text.length * 35 + 200;
                if (this.scrollY < -totalHeight) {
                    this.phase = 'fadeOut';
                    this.phaseTimer = 0;
                }
                break;

            case 'fadeOut':
                // Fade to gameplay
                this.fadeAlpha = this.phaseTimer / this.timing.fadeOut;
                if (this.phaseTimer >= this.timing.fadeOut) {
                    this.finish();
                }
                break;
        }
    },

    draw(ctx) {
        if (!this.active) return;

        // Black background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

        // Draw starfield
        for (const star of this.stars) {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw based on phase
        switch (this.phase) {
            case 'preText':
                this.drawPreText(ctx);
                break;

            case 'titleReveal':
                this.drawTitleReveal(ctx);
                break;

            case 'crawl':
                this.drawCrawl(ctx);
                break;
        }

        // Fade overlay
        if (this.fadeAlpha > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, this.fadeAlpha)})`;
            ctx.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);
        }

        // Skip prompt (during crawl and title reveal)
        if (this.phase === 'crawl' || this.phase === 'titleReveal') {
            ctx.globalAlpha = 0.4 + Math.sin(Date.now() / 500) * 0.2;
            ctx.fillStyle = '#666';
            ctx.font = '12px "Courier New"';
            ctx.textAlign = 'center';
            ctx.fillText('PRESS SPACE TO SKIP', GAME.WIDTH / 2, GAME.HEIGHT - 20);
            ctx.globalAlpha = 1;
        }
    },

    drawPreText(ctx) {
        // "A long time ago..." style text
        ctx.globalAlpha = this.preTextAlpha;
        ctx.fillStyle = '#4169E1';  // Classic blue
        ctx.font = 'italic 20px "Georgia", serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.preText, GAME.WIDTH / 2, GAME.HEIGHT / 2);
        ctx.globalAlpha = 1;
    },

    drawTitleReveal(ctx) {
        ctx.save();
        ctx.translate(GAME.WIDTH / 2, GAME.HEIGHT / 2);

        // Scale effect (starts big, shrinks to normal)
        const scale = 3 - (this.titleScale * 2);  // 3 -> 1
        ctx.scale(scale, scale);

        // Fade in as it scales
        ctx.globalAlpha = this.titleScale;

        // Chapter title
        ctx.fillStyle = COLORS.PRIMARY;
        ctx.font = 'bold 36px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText(this.title, 0, -20);

        // Subtitle
        ctx.fillStyle = COLORS.SECONDARY;
        ctx.font = 'bold 18px "Courier New"';
        ctx.fillText(this.subtitle, 0, 20);

        ctx.restore();
    },

    drawCrawl(ctx) {
        ctx.save();

        // Apply 3D perspective transform
        // Vanishing point at top center
        ctx.translate(GAME.WIDTH / 2, 0);

        // Title stays at top briefly then scrolls
        const titleY = Math.min(80, 80 - (this.timing.titleReveal - this.scrollY) * 0.1);
        if (this.scrollY > GAME.HEIGHT - 200) {
            ctx.fillStyle = COLORS.PRIMARY;
            ctx.font = 'bold 32px "Courier New"';
            ctx.textAlign = 'center';

            const titleAlpha = Math.min(1, (this.scrollY - (GAME.HEIGHT - 200)) / 100);
            ctx.globalAlpha = titleAlpha;
            ctx.fillText(this.title, 0, 60);

            ctx.fillStyle = COLORS.SECONDARY;
            ctx.font = 'bold 18px "Courier New"';
            ctx.fillText(this.subtitle, 0, 90);
            ctx.globalAlpha = 1;
        }

        // Draw scrolling text with perspective
        const lineHeight = 35;

        for (let i = 0; i < this.text.length; i++) {
            const baseY = this.scrollY + i * lineHeight;

            // Only draw if potentially visible
            if (baseY > -50 && baseY < GAME.HEIGHT + 50) {
                // Calculate perspective
                // Lines closer to bottom are larger and more opaque
                const distFromHorizon = GAME.HEIGHT - baseY;
                const perspectiveFactor = distFromHorizon / GAME.HEIGHT;

                // Scale: 0.4 at top (horizon) to 1.0 at bottom
                const scale = 0.4 + perspectiveFactor * 0.6;

                // Alpha: fade near horizon
                const alpha = Math.min(1, perspectiveFactor * 1.5);

                // Y position with perspective compression
                const perspectiveY = GAME.HEIGHT - (distFromHorizon * 0.7);

                if (alpha > 0 && perspectiveY > 100) {
                    ctx.save();
                    ctx.translate(0, perspectiveY);
                    ctx.scale(scale, scale);

                    ctx.globalAlpha = alpha;
                    ctx.fillStyle = COLORS.COINS;  // Classic yellow
                    ctx.font = '18px "Courier New"';
                    ctx.textAlign = 'center';
                    ctx.fillText(this.text[i], 0, 0);

                    ctx.restore();
                }
            }
        }

        // Gradient fade at top (horizon)
        const horizonGradient = ctx.createLinearGradient(0, 100, 0, 250);
        horizonGradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        horizonGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = horizonGradient;
        ctx.fillRect(-GAME.WIDTH / 2, 100, GAME.WIDTH, 150);

        ctx.restore();
    }
};
