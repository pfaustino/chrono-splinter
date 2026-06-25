// ============================================
// The Chrono-Splinter - Utility Functions
// ============================================

const Utils = {
    /**
     * Clamp a value between min and max
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    /**
     * Get a random number between min and max
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Get a random integer between min and max (inclusive)
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Check if two rectangles overlap (AABB collision)
     */
    rectCollision(a, b) {
        if (!a || !b) return false;
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    },

    /**
     * Check if two circles overlap
     * Assumes objects have x, y, width, height (uses min dimension for radius)
     * Optional: can pass custom radius multiplier (e.g. 0.8 for smaller hitboxes)
     */
    circleCollision(a, b, scaleA = 0.4, scaleB = 0.4) { // Default to 40% width as radius (creates a forgiving, smaller hitbox)
        if (!a || !b) return false;

        const rA = (Math.min(a.width, a.height) / 2) * scaleA;
        const rB = (Math.min(b.width, b.height) / 2) * scaleB;

        const cxA = a.x + a.width / 2;
        const cyA = a.y + a.height / 2;
        const cxB = b.x + b.width / 2;
        const cyB = b.y + b.height / 2;

        const dx = cxA - cxB;
        const dy = cyA - cyB;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < (rA + rB);
    },

    /**
     * Get distance between two points
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Get angle between two points (in radians)
     */
    angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },

    /**
     * Lerp (linear interpolation) between two values
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    /**
     * Format a number with leading zeros
     */
    padNumber(num, length) {
        return String(num).padStart(length, '0');
    },

    /**
     * Pick a random element from an array
     */
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    /**
     * Shuffle an array (Fisher-Yates)
     */
    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },

    /**
     * Create a debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    isCompactView() {
        const vw = window.visualViewport?.width ?? window.innerWidth;
        const vh = window.visualViewport?.height ?? window.innerHeight;
        return vw <= 900 || vh <= 700;
    },

    getViewSafe() {
        if (typeof Game !== 'undefined' && Game.viewSafe) {
            return Game.viewSafe;
        }
        return Utils.estimateViewSafe();
    },

    estimateViewSafe() {
        const edgePad = 20;
        const canvas = typeof Game !== 'undefined' ? Game.canvas : null;
        const container = canvas?.parentElement;

        if (!canvas || !container) {
            const fallbackCropX = Utils.isCompactView() ? 200 : 0;
            const fallbackCropY = Utils.isCompactView() ? 24 : 0;
            return Utils._buildViewSafe(fallbackCropX, fallbackCropY, edgePad);
        }

        const containerW = container.clientWidth;
        const containerH = container.clientHeight;
        if (containerW <= 0 || containerH <= 0) {
            const fallbackCropX = Utils.isCompactView() ? 200 : 0;
            const fallbackCropY = Utils.isCompactView() ? 24 : 0;
            return Utils._buildViewSafe(fallbackCropX, fallbackCropY, edgePad);
        }

        const scale = Math.max(containerW / GAME.WIDTH, containerH / GAME.HEIGHT);
        const cropX = Math.max(0, (GAME.WIDTH * scale - containerW) / 2 / scale);
        const cropY = Math.max(0, (GAME.HEIGHT * scale - containerH) / 2 / scale);
        return Utils._buildViewSafe(cropX, cropY, edgePad);
    },

    _buildViewSafe(cropX, cropY, edgePad) {
        const left = cropX + edgePad;
        const top = cropY + edgePad;
        const right = GAME.WIDTH - cropX - edgePad;
        const bottom = GAME.HEIGHT - cropY - edgePad;
        return {
            padX: left,
            padY: top,
            left,
            top,
            right,
            bottom,
            contentWidth: Math.max(120, right - left),
            contentHeight: Math.max(120, bottom - top),
            centerX: GAME.WIDTH / 2,
        };
    },

    getSafeWidth() {
        return Utils.getViewSafe().contentWidth;
    },

    getSafeCenterX() {
        return Utils.getViewSafe().centerX;
    },

    _font(fontSpec, size) {
        return fontSpec.replace(/\{size\}/g, String(size));
    },

    measureTextWidth(ctx, text, fontSpec, size) {
        ctx.font = Utils._font(fontSpec, size);
        return ctx.measureText(text).width;
    },

    fitFontSize(ctx, text, maxSize, minSize, fontSpec, maxWidth) {
        const maxW = maxWidth ?? Utils.getSafeWidth();
        let size = maxSize;
        while (size > minSize) {
            if (Utils.measureTextWidth(ctx, text, fontSpec, size) <= maxW) {
                return size;
            }
            size -= 1;
        }
        return minSize;
    },

    wrapTextLines(ctx, text, size, fontSpec, maxWidth) {
        const maxW = maxWidth ?? Utils.getSafeWidth();
        const words = text.split(' ');
        const lines = [];
        let line = words[0] || '';

        for (let i = 1; i < words.length; i++) {
            const next = `${line} ${words[i]}`;
            if (Utils.measureTextWidth(ctx, next, fontSpec, size) <= maxW) {
                line = next;
            } else {
                lines.push(line);
                line = words[i];
            }
        }
        if (line) lines.push(line);
        return lines;
    },

    drawFitCenterText(ctx, text, y, maxSize, minSize, fontSpec, x, maxWidth) {
        const size = Utils.fitFontSize(ctx, text, maxSize, minSize, fontSpec, maxWidth);
        ctx.font = Utils._font(fontSpec, size);
        ctx.textAlign = 'center';
        ctx.fillText(text, x ?? Utils.getSafeCenterX(), y);
        return size;
    },

    drawFitCenterWrapped(ctx, text, startY, lineHeight, maxSize, minSize, fontSpec, x, maxWidth) {
        const maxW = maxWidth ?? Utils.getSafeWidth();
        let size = maxSize;
        let lines = [];

        while (size >= minSize) {
            lines = Utils.wrapTextLines(ctx, text, size, fontSpec, maxW);
            const tooWide = lines.some((line) => Utils.measureTextWidth(ctx, line, fontSpec, size) > maxW);
            if (!tooWide) break;
            size -= 1;
        }

        ctx.font = Utils._font(fontSpec, size);
        ctx.textAlign = 'center';
        const cx = x ?? Utils.getSafeCenterX();
        lines.forEach((line, i) => {
            ctx.fillText(line, cx, startY + i * lineHeight);
        });
        return { size, lineCount: lines.length };
    },

    drawFitLeftText(ctx, text, x, y, maxSize, minSize, fontSpec, maxWidth) {
        const size = Utils.fitFontSize(ctx, text, maxSize, minSize, fontSpec, maxWidth);
        ctx.font = Utils._font(fontSpec, size);
        ctx.textAlign = 'left';
        ctx.fillText(text, x, y);
        return size;
    },
};
