/**
 * InputHandler class for managing user input (mouse and touch)
 */
class InputHandler {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.isDrawing = false;
        this.currentPath = null;
        this.paths = [];
        this.maxPaths = 5;
        this.pathLifetime = 3000; // Path lifetime in milliseconds
        
        this.setupEventListeners();
    }

    /**
     * Set up event listeners for mouse and touch input
     */
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleStart(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleEnd(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleEnd(e));
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleStart(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleMove(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleEnd(e);
        });
        this.canvas.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.handleEnd(e);
        });
    }

    /**
     * Handle input start (mouse down or touch start)
     * @param {Event} e - Input event
     */
    handleStart(e) {
        if (!this.game.isPlaying) return;
        
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Create a new path
        this.currentPath = new Path({
            color: 'rgba(255, 255, 255, 0.7)',
            width: 5,
            decay: 0.003
        });
        this.currentPath.addPoint(x, y);
        
        // Add to paths array
        this.paths.push({
            path: this.currentPath,
            timestamp: Date.now()
        });
        
        // Limit number of paths
        if (this.paths.length > this.maxPaths) {
            this.paths.shift();
        }
    }

    /**
     * Handle input move (mouse move or touch move)
     * @param {Event} e - Input event
     */
    handleMove(e) {
        if (!this.isDrawing || !this.currentPath) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Add point to current path
        this.currentPath.addPoint(x, y);
    }

    /**
     * Handle input end (mouse up or touch end)
     * @param {Event} e - Input event
     */
    handleEnd(e) {
        this.isDrawing = false;
        this.currentPath = null;
    }

    /**
     * Update paths (remove old paths)
     */
    update() {
        const now = Date.now();
        
        // Remove old paths
        for (let i = this.paths.length - 1; i >= 0; i--) {
            const pathObj = this.paths[i];
            const age = now - pathObj.timestamp;
            
            if (age > this.pathLifetime) {
                this.paths.splice(i, 1);
            } else {
                // Update path lifetime based on age
                pathObj.path.life = 1 - (age / this.pathLifetime);
            }
        }
    }

    /**
     * Get all active paths
     * @returns {Array} Array of active paths
     */
    getActivePaths() {
        return this.paths.map(pathObj => pathObj.path);
    }

    /**
     * Clear all paths
     */
    clearPaths() {
        this.paths = [];
        this.currentPath = null;
        this.isDrawing = false;
    }
}
