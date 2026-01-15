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
};
