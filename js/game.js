/**
 * Game class for managing game state and logic
 */
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.input = new InputHandler(this);
        this.ui = new UI(this);
        
        // Game state
        this.isPlaying = false;
        this.isPaused = false;
        this.score = 0;
        this.level = 1;
        this.soundEnabled = loadData('particleDanceSoundEnabled', true);
        
        // Game objects
        this.emitters = [];
        this.obstacles = [];
        this.collectionPoints = [];
        this.powerUps = [];
        this.particles = [];
        
        // Power-up states
        this.activePowerUps = {
            timeSlow: false,
            magnet: false,
            shield: false,
            multiplier: false
        };
        
        // Game settings
        this.particleSpeed = 1;
        this.spawnRate = 1;
        this.obstacleCount = 3;
        this.collectionPointCount = 3;
        this.powerUpChance = 0.01; // Chance per frame to spawn a power-up
        
        // Initialize
        this.resizeCanvas();
        this.setupEventListeners();
        this.ui.updateSoundButton();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Handle visibility change to pause when tab is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isPlaying && !this.isPaused) {
                this.togglePause();
            }
        });
    }

    /**
     * Resize canvas to match window size
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * Start the game
     */
    start() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.isPaused = false;
        this.score = 0;
        this.level = 1;
        this.particleSpeed = 1;
        this.spawnRate = 1;
        
        // Clear game objects
        this.emitters = [];
        this.obstacles = [];
        this.collectionPoints = [];
        this.powerUps = [];
        this.particles = [];
        this.input.clearPaths();
        
        // Reset power-ups
        this.activePowerUps = {
            timeSlow: false,
            magnet: false,
            shield: false,
            multiplier: false
        };
        this.ui.clearPowerUps();
        
        // Create initial game objects
        this.createLevel();
        
        // Update UI
        this.ui.updateScore(this.score);
        this.ui.updateLevel(this.level);
        this.ui.showStartButton(false);
        this.ui.showPauseButton(true);
        this.ui.hideGameOver();
        
        // Start game loop
        this.gameLoop();
    }

    /**
     * Create level with appropriate game objects
     */
    createLevel() {
        // Create emitters
        const emitterCount = Math.min(1 + Math.floor(this.level / 3), 3);
        for (let i = 0; i < emitterCount; i++) {
            const angle = (i / emitterCount) * Math.PI * 2;
            const distance = Math.min(this.canvas.width, this.canvas.height) * 0.3;
            const x = this.canvas.width / 2 + Math.cos(angle) * distance;
            const y = this.canvas.height / 2 + Math.sin(angle) * distance;
            
            const emitter = new ParticleEmitter(x, y, {
                rate: this.spawnRate * (1 + this.level * 0.2),
                spread: Math.PI / 3,
                speed: this.particleSpeed * (1 + this.level * 0.1),
                size: { min: 2, max: 4 + this.level * 0.2 },
                color: getRandomColor(),
                life: { min: 0.7, max: 1 },
                maxParticles: 100 + this.level * 10
            });
            
            this.emitters.push(emitter);
        }
        
        // Create obstacles
        this.obstacles = [];
        const obstacleCount = this.obstacleCount + Math.floor(this.level / 2);
        for (let i = 0; i < obstacleCount; i++) {
            let x, y;
            let validPosition = false;
            let attempts = 0;
            
            // Try to find a valid position (not too close to emitters)
            while (!validPosition && attempts < 50) {
                x = random(50, this.canvas.width - 50);
                y = random(50, this.canvas.height - 50);
                validPosition = true;
                
                // Check distance from emitters
                for (const emitter of this.emitters) {
                    if (distance(x, y, emitter.x, emitter.y) < 150) {
                        validPosition = false;
                        break;
                    }
                }
                
                attempts++;
            }
            
            if (validPosition) {
                const obstacle = new Obstacle(x, y, {
                    radius: random(20, 40),
                    pulseSpeed: random(0.03, 0.07),
                    pulseAmount: random(0.1, 0.3)
                });
                
                this.obstacles.push(obstacle);
            }
        }
        
        // Create collection points
        this.collectionPoints = [];
        const collectionPointCount = this.collectionPointCount + Math.floor(this.level / 3);
        for (let i = 0; i < collectionPointCount; i++) {
            let x, y;
            let validPosition = false;
            let attempts = 0;
            
            // Try to find a valid position (not too close to emitters or obstacles)
            while (!validPosition && attempts < 50) {
                x = random(50, this.canvas.width - 50);
                y = random(50, this.canvas.height - 50);
                validPosition = true;
                
                // Check distance from emitters
                for (const emitter of this.emitters) {
                    if (distance(x, y, emitter.x, emitter.y) < 100) {
                        validPosition = false;
                        break;
                    }
                }
                
                // Check distance from obstacles
                if (validPosition) {
                    for (const obstacle of this.obstacles) {
                        if (distance(x, y, obstacle.x, obstacle.y) < obstacle.radius + 50) {
                            validPosition = false;
                            break;
                        }
                    }
                }
                
                attempts++;
            }
            
            if (validPosition) {
                const value = 10 * (1 + Math.floor(this.level / 2));
                const collectionPoint = new CollectionPoint(x, y, {
                    radius: 15 + this.level,
                    value: value,
                    pulseSpeed: random(0.03, 0.07),
                    pulseAmount: random(0.2, 0.4)
                });
                
                this.collectionPoints.push(collectionPoint);
            }
        }
    }

    /**
     * Toggle pause state
     */
    togglePause() {
        if (!this.isPlaying) return;
        
        this.isPaused = !this.isPaused;
        this.pauseButton.textContent = this.isPaused ? 'Resume' : 'Pause';
        
        if (!this.isPaused) {
            this.gameLoop();
        }
    }

    /**
     * Restart the game
     */
    restart() {
        this.start();
    }

    /**
     * End the game
     */
    endGame() {
        this.isPlaying = false;
        
        // Update high score
        const highScore = loadData('particleDanceHighScore', 0);
        if (this.score > highScore) {
            saveData('particleDanceHighScore', this.score);
            this.ui.updateHighScore();
        }
        
        // Show game over screen
        this.ui.showGameOver(this.score);
        this.ui.showStartButton(true);
        this.ui.showPauseButton(false);
    }

    /**
     * Update game state
     */
    update() {
        if (!this.isPlaying || this.isPaused) return;
        
        // Update input (paths)
        this.input.update();
        const paths = this.input.getActivePaths();
        
        // Update emitters and create new particles
        for (const emitter of this.emitters) {
            const newParticles = emitter.emit();
            this.particles.push(...newParticles);
            
            emitter.update(paths, this.obstacles, this.canvas.width, this.canvas.height);
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Apply time slow effect if active
            const speedMultiplier = this.activePowerUps.timeSlow ? 0.5 : 1;
            particle.speedX *= speedMultiplier;
            particle.speedY *= speedMultiplier;
            
            // Apply magnet effect if active
            if (this.activePowerUps.magnet) {
                // Find closest collection point
                let closestPoint = null;
                let closestDistance = Infinity;
                
                for (const point of this.collectionPoints) {
                    if (!point.collected) {
                        const dist = distance(particle.x, particle.y, point.x, point.y);
                        if (dist < closestDistance) {
                            closestDistance = dist;
                            closestPoint = point;
                        }
                    }
                }
                
                // Apply force toward closest collection point
                if (closestPoint && closestDistance < 200) {
                    const angle = angle(particle.x, particle.y, closestPoint.x, closestPoint.y);
                    const force = 0.2 * (1 - closestDistance / 200);
                    particle.speedX += Math.cos(angle) * force;
                    particle.speedY += Math.sin(angle) * force;
                }
            }
            
            particle.update(paths, this.obstacles);
            
            // Check collision with obstacles
            if (!this.activePowerUps.shield) {
                for (const obstacle of this.obstacles) {
                    if (obstacle.checkCollision(particle.x, particle.y)) {
                        particle.active = false;
                        break;
                    }
                }
            }
            
            // Check collision with collection points
            for (const point of this.collectionPoints) {
                if (point.checkCollision(particle.x, particle.y)) {
                    const value = point.collect();
                    const scoreGain = this.activePowerUps.multiplier ? value * 2 : value;
                    this.score += scoreGain;
                    this.ui.updateScore(this.score);
                    
                    // Play collection sound
                    playSound('assets/sounds/collect.mp3', 0.3);
                }
            }
            
            // Check collision with power-ups
            for (const powerUp of this.powerUps) {
                if (powerUp.checkCollision(particle.x, particle.y)) {
                    const powerUpData = powerUp.collect();
                    if (powerUpData) {
                        this.activatePowerUp(powerUpData.type, powerUpData.duration);
                        
                        // Play power-up sound
                        playSound('assets/sounds/powerup.mp3', 0.3);
                    }
                }
            }
            
            // Remove particles that are no longer active or out of bounds
            if (!particle.active || particle.isOutOfBounds(this.canvas.width, this.canvas.height)) {
                this.particles.splice(i, 1);
            }
        }
        
        // Update obstacles
        for (const obstacle of this.obstacles) {
            obstacle.update();
        }
        
        // Update collection points
        for (const point of this.collectionPoints) {
            point.update();
        }
        
        // Update power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.update();
            
            if (!powerUp.active || powerUp.collected) {
                this.powerUps.splice(i, 1);
            }
        }
        
        // Randomly spawn power-ups
        if (random() < this.powerUpChance) {
            this.spawnPowerUp();
        }
        
        // Check if level is complete (all collection points collected)
        if (this.collectionPoints.every(point => point.collected)) {
            this.nextLevel();
        }
        
        // Check if game is over (no active particles and emitters can't create more)
        if (this.particles.length === 0) {
            let canCreateParticles = false;
            for (const emitter of this.emitters) {
                if (emitter.active && emitter.particles.length < emitter.maxParticles) {
                    canCreateParticles = true;
                    break;
                }
            }
            
            if (!canCreateParticles) {
                this.endGame();
            }
        }
    }

    /**
     * Spawn a new power-up
     */
    spawnPowerUp() {
        const types = ['timeSlow', 'magnet', 'shield', 'multiplier'];
        const type = types[randomInt(0, types.length - 1)];
        
        let x, y;
        let validPosition = false;
        let attempts = 0;
        
        // Try to find a valid position
        while (!validPosition && attempts < 50) {
            x = random(50, this.canvas.width - 50);
            y = random(50, this.canvas.height - 50);
            validPosition = true;
            
            // Check distance from emitters
            for (const emitter of this.emitters) {
                if (distance(x, y, emitter.x, emitter.y) < 100) {
                    validPosition = false;
                    break;
                }
            }
            
            // Check distance from obstacles
            if (validPosition) {
                for (const obstacle of this.obstacles) {
                    if (distance(x, y, obstacle.x, obstacle.y) < obstacle.radius + 50) {
                        validPosition = false;
                        break;
                    }
                }
            }
            
            // Check distance from collection points
            if (validPosition) {
                for (const point of this.collectionPoints) {
                    if (!point.collected && distance(x, y, point.x, point.y) < point.radius + 50) {
                        validPosition = false;
                        break;
                    }
                }
            }
            
            attempts++;
        }
        
        if (validPosition) {
            const powerUp = new PowerUp(x, y, type, {
                duration: 5000 + this.level * 500
            });
            
            this.powerUps.push(powerUp);
        }
    }

    /**
     * Activate a power-up
     * @param {string} type - Power-up type
     * @param {number} duration - Power-up duration in milliseconds
     */
    activatePowerUp(type, duration) {
        // Set power-up as active
        this.activePowerUps[type] = true;
        
        // Add to UI
        this.ui.addPowerUp(type, duration);
        
        // Set timeout to deactivate power-up
        setTimeout(() => {
            this.activePowerUps[type] = false;
        }, duration);
    }

    /**
     * Advance to the next level
     */
    nextLevel() {
        this.level++;
        this.ui.updateLevel(this.level);
        
        // Increase difficulty
        this.particleSpeed *= 1.1;
        this.spawnRate *= 1.1;
        this.powerUpChance = Math.min(this.powerUpChance * 1.05, 0.05);
        
        // Create new level
        this.createLevel();
        
        // Bonus points for completing level
        this.score += 100 * this.level;
        this.ui.updateScore(this.score);
    }

    /**
     * Draw everything on the canvas
     */
    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw paths
        const paths = this.input.getActivePaths();
        for (const path of paths) {
            path.draw(this.ctx);
        }
        
        // Draw collection points
        for (const point of this.collectionPoints) {
            point.draw(this.ctx);
        }
        
        // Draw power-ups
        for (const powerUp of this.powerUps) {
            powerUp.draw(this.ctx);
        }
        
        // Draw obstacles
        for (const obstacle of this.obstacles) {
            obstacle.draw(this.ctx);
        }
        
        // Draw emitters
        for (const emitter of this.emitters) {
            emitter.draw(this.ctx);
        }
        
        // Draw particles
        for (const particle of this.particles) {
            particle.draw(this.ctx);
        }
        
        // Draw shield effect if active
        if (this.activePowerUps.shield) {
            this.ctx.strokeStyle = 'rgba(255, 255, 100, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 
                        Math.min(this.canvas.width, this.canvas.height) * 0.4, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Draw time slow effect if active
        if (this.activePowerUps.timeSlow) {
            this.ctx.fillStyle = 'rgba(100, 200, 255, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    /**
     * Main game loop
     */
    gameLoop() {
        if (!this.isPlaying || this.isPaused) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
          }
