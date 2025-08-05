// Utility functions for the game

/**
 * Generate a random number between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number between min and max
 */
function random(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer between min and max
 */
function randomInt(min, max) {
    return Math.floor(random(min, max + 1));
}

/**
 * Calculate distance between two points
 * @param {number} x1 - X coordinate of first point
 * @param {number} y1 - Y coordinate of first point
 * @param {number} x2 - X coordinate of second point
 * @param {number} y2 - Y coordinate of second point
 * @returns {number} Distance between the two points
 */
function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Calculate angle between two points in radians
 * @param {number} x1 - X coordinate of first point
 * @param {number} y1 - Y coordinate of first point
 * @param {number} x2 - X coordinate of second point
 * @param {number} y2 - Y coordinate of second point
 * @returns {number} Angle in radians
 */
function angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Linear interpolation between two values
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Check if a point is inside a circle
 * @param {number} px - Point X coordinate
 * @param {number} py - Point Y coordinate
 * @param {number} cx - Circle center X coordinate
 * @param {number} cy - Circle center Y coordinate
 * @param {number} radius - Circle radius
 * @returns {boolean} True if point is inside circle
 */
function pointInCircle(px, py, cx, cy, radius) {
    return distance(px, py, cx, cy) <= radius;
}

/**
 * Check if a point is inside a rectangle
 * @param {number} px - Point X coordinate
 * @param {number} py - Point Y coordinate
 * @param {number} rx - Rectangle X coordinate
 * @param {number} ry - Rectangle Y coordinate
 * @param {number} rw - Rectangle width
 * @param {number} rh - Rectangle height
 * @returns {boolean} True if point is inside rectangle
 */
function pointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

/**
 * Format a number with leading zeros
 * @param {number} num - Number to format
 * @param {number} size - Total string length
 * @returns {string} Formatted number with leading zeros
 */
function formatNumber(num, size) {
    let s = String(num);
    while (s.length < size) {
        s = '0' + s;
    }
    return s;
}

/**
 * Get a random color from a predefined palette
 * @returns {string} Random color in hex format
 */
function getRandomColor() {
    const colors = [
        '#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE',
        '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA', '#69F0AE',
        '#B2FF59', '#EEFF41', '#FFFF00', '#FFD740', '#FFAB40',
        '#FF6E40'
    ];
    return colors[randomInt(0, colors.length - 1)];
}

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color string
 * @returns {Object} RGB values
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Convert RGB to hex color
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} Hex color string
 */
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 */
function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

/**
 * Load data from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} Stored data or default value
 */
function loadData(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('Error loading from localStorage:', e);
        return defaultValue;
    }
}

/**
 * Check if the device is mobile
 * @returns {boolean} True if device is mobile
 */
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Play a sound effect
 * @param {string} soundPath - Path to sound file
 * @param {number} volume - Volume level (0-1)
 */
function playSound(soundPath, volume = 0.5) {
    if (!game.soundEnabled) return;
    
    try {
        const audio = new Audio(soundPath);
        audio.volume = volume;
        audio.play().catch(e => console.error('Error playing sound:', e));
    } catch (e) {
        console.error('Error creating audio element:', e);
    }
      }
