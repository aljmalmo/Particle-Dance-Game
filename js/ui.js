/**
 * UI class for managing game UI elements
 */
class UI {
    constructor(game) {
        this.game = game;
        this.scoreElement = document.getElementById('scoreValue');
        this.highScoreElement = document.getElementById('highScoreValue');
        this.levelElement = document.getElementById('levelValue');
        this.startButton = document.getElementById('startButton');
        this.pauseButton = document.getElementById('pauseButton');
        this.soundButton = document.getElementById('soundButton');
        this.restartButton = document.getElementById('restartButton');
        this.gameOverContainer = document.getElementById('gameOverContainer');
        this.finalScoreElement = document.getElementById('finalScoreValue');
        this.powerUpContainer = document.getElementById('powerUpContainer');
        
        this.setupEventListeners();
        this.updateHighScore();
    }

    /**
     * Set up event listeners for UI elements
     */
    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.game.start());
        this.pauseButton.addEventListener('click', () => this.game.togglePause());
        this.soundButton.addEventListener('click', () => this.toggleSound());
        this.restartButton.addEventListener('click', () => this.game.restart());
    }

    /**
     * Update score display
     * @param {number} score - Current score
     */
    updateScore(score) {
        this.scoreElement.textContent = score;
    }

    /**
     * Update high score display
     */
    updateHighScore() {
        const highScore = loadData('particleDanceHighScore', 0);
        this.highScoreElement.textContent = highScore;
    }

    /**
     * Update level display
     * @param {number} level - Current level
     */
    updateLevel(level) {
        this.levelElement.textContent = level;
    }

    /**
     * Show/hide pause button
     * @param {boolean} show - Whether to show the pause button
     */
    showPauseButton(show) {
        if (show) {
            this.pauseButton.classList.remove('hidden');
        } else {
            this.pauseButton.classList.add('hidden');
        }
    }

    /**
     * Show/hide start button
     * @param {boolean} show - Whether to show the start button
     */
    showStartButton(show) {
        if (show) {
            this.startButton.classList.remove('hidden');
        } else {
            this.startButton.classList.add('hidden');
        }
    }

    /**
     * Show game over screen
     * @param {number} score - Final score
     */
    showGameOver(score) {
        this.finalScoreElement.textContent = score;
        this.gameOverContainer.classList.remove('hidden');
    }

    /**
     * Hide game over screen
     */
    hideGameOver() {
        this.gameOverContainer.classList.add('hidden');
    }

    /**
     * Toggle sound on/off
     */
    toggleSound() {
        this.game.soundEnabled = !this.game.soundEnabled;
        this.soundButton.textContent = `Sound: ${this.game.soundEnabled ? 'ON' : 'OFF'}`;
        saveData('particleDanceSoundEnabled', this.game.soundEnabled);
    }

    /**
     * Update sound button text
     */
    updateSoundButton() {
        this.soundButton.textContent = `Sound: ${this.game.soundEnabled ? 'ON' : 'OFF'}`;
    }

    /**
     * Add power-up to UI
     * @param {string} type - Power-up type
     * @param {number} duration - Power-up duration in milliseconds
     */
    addPowerUp(type, duration) {
        const powerUpElement = document.createElement('div');
        powerUpElement.className = 'power-up';
        powerUpElement.id = `powerUp-${type}`;
        
        // Set icon based on type
        let icon = '';
        let color = '';
        
        switch (type) {
            case 'timeSlow':
                icon = '⏱';
                color = 'rgba(100, 200, 255, 0.7)';
                break;
            case 'magnet':
                icon = '🧲';
                color = 'rgba(255, 100, 255, 0.7)';
                break;
            case 'shield':
                icon = '🛡';
                color = 'rgba(255, 255, 100, 0.7)';
                break;
            case 'multiplier':
                icon = '✖';
                color = 'rgba(255, 150, 50, 0.7)';
                break;
        }
        
        powerUpElement.textContent = icon;
        powerUpElement.style.backgroundColor = color;
        
        this.powerUpContainer.appendChild(powerUpElement);
        
        // Set timeout to remove power-up
        setTimeout(() => {
            if (powerUpElement.parentNode) {
                powerUpElement.parentNode.removeChild(powerUpElement);
            }
        }, duration);
    }

    /**
     * Clear all power-ups from UI
     */
    clearPowerUps() {
        this.powerUpContainer.innerHTML = '';
    }
}
