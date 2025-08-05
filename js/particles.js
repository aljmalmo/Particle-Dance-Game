/**
 * Particle class for individual particles in the game
 */
class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.size = options.size || random(2, 6);
        this.speedX = options.speedX || random(-1, 1);
        this.speedY = options.speedY || random(-1, 1);
        this.color = options.color || getRandomColor();
        this.life = options.life || 1; // 0-1, where 1 is full life
        this.decay = options.decay || 0.005; // How quickly the particle fades
        this.gravity = options.gravity || 0;
        this.trail = [];
        this.maxTrailLength = options.maxTrailLength || 10;
        this.active = true;
        this.pathFollowForce = options.pathFollowForce || 0.1;
        this.mass = this.size * 0.5;
    }

    /**
     * Update particle position and properties
     * @param {Array} paths - Array of paths to follow
     * @param {Array} obstacles - Array of obstacles to avoid
     */
    update(paths, obstacles) {
        if (!this.active) return;

        // Apply gravity
        this.speedY += this.gravity;

        // Follow nearby paths
        if (paths && paths.length > 0) {
            let closestPath = null;
            let closestDistance = Infinity;
            let closestPoint = null;

            // Find the closest path and point on that path
            for (const path of paths) {
                if (path.points.length < 2) continue;

                for (let i = 0; i < path.points.length - 1; i++) {
                    const p1 = path.points[i];
                    const p2 = path.points[i + 1];
                    
                    // Find closest point on line segment
                    const lineLength = distance(p1.x, p1.y, p2.x, p2.y);
                    if (lineLength === 0) continue;
                    
                    const t = clamp(((this.x - p1.x) * (p2.x - p1.x) + (this.y - p1.y) * (p2.y - p1.y)) / (lineLength * lineLength), 0, 1);
                    const closestX = p1.x + t * (p2.x - p1.x);
                    const closestY = p1.y + t * (p2.y - p1.y);
                    
                    const dist = distance(this.x, this.y, closestX, closestY);
                    if (dist < closestDistance) {
                        closestDistance = dist;
                        closestPath = path;
                        closestPoint = { x: closestX, y: closestY };
                    }
                }
            }

            // Apply force toward closest point on path
            if (closestPoint && closestDistance < 100) {
                const angleToPath = angle(this.x, this.y, closestPoint.x, closestPoint.y);
                const force = this.pathFollowForce * (1 - closestDistance / 100);
                this.speedX += Math.cos(angleToPath) * force;
                this.speedY += Math.sin(angleToPath) * force;
            }
        }

        // Avoid obstacles
        if (obstacles && obstacles.length > 0) {
            for (const obstacle of obstacles) {
                const dist = distance(this.x, this.y, obstacle.x, obstacle.y);
                if (dist < obstacle.radius + 50) {
                    const angleAway = angle(obstacle.x, obstacle.y, this.x, this.y);
                    const force = 2 * (1 - dist / (obstacle.radius + 50));
                    this.speedX += Math.cos(angleAway) * force;
                    this.speedY += Math.sin(angleAway) * force;
                }
            }
        }

        // Apply friction
        this.speedX *= 0.98;
        this.speedY *= 0.98;

        // Update position
        this.x += this.speedX;
        this.y += this.speedY;

        // Add current position to trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        // Decrease life
        this.life -= this.decay;
        if (this.life <= 0) {
            this.active = false;
        }
    }

    /**
     * Draw the particle on the canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        if (!this.active) return;

        // Draw trail
        if (this.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            
            for (let i = 1; i < this.trail.length; i++) {
                const alpha = (i / this.trail.length) * this.life * 0.5;
                ctx.strokeStyle = this.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
                ctx.lineWidth = this.size * (i / this.trail.length);
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(this.trail[i].x, this.trail[i].y);
            }
        }

        // Draw particle
        const alpha = this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // Create gradient for particle
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size
        );
        gradient.addColorStop(0, this.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba'));
        gradient.addColorStop(1, this.color.replace(')', `, 0)`).replace('rgb', 'rgba'));
        
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    /**
     * Check if particle is out of bounds
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @returns {boolean} True if particle is out of bounds
     */
    isOutOfBounds(width, height) {
        return this.x < -50 || this.x > width + 50 || 
               this.y < -50 || this.y > height + 50;
    }
}

/**
 * ParticleEmitter class for creating and managing particles
 */
class ParticleEmitter {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.rate = options.rate || 5; // Particles per frame
        this.spread = options.spread || Math.PI / 4; // Angle spread in radians
        this.speed = options.speed || 2;
        this.size = options.size || { min: 2, max: 6 };
        this.color = options.color || getRandomColor();
        this.life = options.life || { min: 0.5, max: 1 };
        this.gravity = options.gravity || 0;
        this.active = options.active !== undefined ? options.active : true;
        this.particles = [];
        this.maxParticles = options.maxParticles || 100;
    }

    /**
     * Create new particles
     * @returns {Array} Array of new particles
     */
    emit() {
        if (!this.active) return [];

        const newParticles = [];
        const particlesToCreate = Math.floor(this.rate);
        
        // Add fractional particles to maintain consistent rate over time
        this.rateFraction = this.rateFraction || 0;
        this.rateFraction += this.rate - particlesToCreate;
        
        if (this.rateFraction >= 1) {
            particlesToCreate++;
            this.rateFraction--;
        }

        for (let i = 0; i < particlesToCreate; i++) {
            if (this.particles.length >= this.maxParticles) break;
            
            const angle = random(-this.spread / 2, this.spread / 2);
            const speed = this.speed * random(0.8, 1.2);
            
            const particle = new Particle(this.x, this.y, {
                size: random(this.size.min, this.size.max),
                speedX: Math.cos(angle) * speed,
                speedY: Math.sin(angle) * speed,
                color: this.color,
                life: random(this.life.min, this.life.max),
                gravity: this.gravity
            });
            
            newParticles.push(particle);
            this.particles.push(particle);
        }

        return newParticles;
    }

    /**
     * Update all particles
     * @param {Array} paths - Array of paths to follow
     * @param {Array} obstacles - Array of obstacles to avoid
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    update(paths, obstacles, width, height) {
        // Update existing particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(paths, obstacles);
            
            // Remove particles that are no longer active or out of bounds
            if (!particle.active || particle.isOutOfBounds(width, height)) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * Draw all particles
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        for (const particle of this.particles) {
            particle.draw(ctx);
        }
    }

    /**
     * Change position of emitter
     * @param {number} x - New X position
     * @param {number} y - New Y position
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Clear all particles
     */
    clear() {
        this.particles = [];
    }
}

/**
 * Path class for drawing paths that particles can follow
 */
class Path {
    constructor(options = {}) {
        this.points = [];
        this.maxPoints = options.maxPoints || 100;
        this.color = options.color || 'rgba(255, 255, 255, 0.5)';
        this.width = options.width || 5;
        this.life = options.life || 1; // 0-1, where 1 is full life
        this.decay = options.decay || 0.005; // How quickly the path fades
        this.active = true;
    }

    /**
     * Add a point to the path
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    addPoint(x, y) {
        this.points.push({ x, y });
        
        // Limit the number of points
        if (this.points.length > this.maxPoints) {
            this.points.shift();
        }
    }

    /**
     * Update path properties
     */
    update() {
        if (!this.active) return;
        
        // Decrease life
        this.life -= this.decay;
        if (this.life <= 0) {
            this.active = false;
        }
    }

    /**
     * Draw the path on the canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        if (!this.active || this.points.length < 2) return;
        
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        
        // Draw line through all points
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        
        ctx.strokeStyle = this.color.replace(')', `, ${this.life})`).replace('rgb', 'rgba');
        ctx.lineWidth = this.width * this.life;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    }

    /**
     * Clear all points
     */
    clear() {
        this.points = [];
    }
}

/**
 * Obstacle class for obstacles that particles should avoid
 */
class Obstacle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.radius = options.radius || 30;
        this.color = options.color || 'rgba(255, 50, 50, 0.7)';
        this.pulseSpeed = options.pulseSpeed || 0.05;
        this.pulseAmount = options.pulseAmount || 0.2;
        this.pulsePhase = random(0, Math.PI * 2);
        this.active = true;
    }

    /**
     * Update obstacle properties
     */
    update() {
        if (!this.active) return;
        
        // Update pulse phase
        this.pulsePhase += this.pulseSpeed;
        if (this.pulsePhase > Math.PI * 2) {
            this.pulsePhase -= Math.PI * 2;
        }
    }

    /**
     * Draw the obstacle on the canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        if (!this.active) return;
        
        // Calculate pulse scale
        const pulseScale = 1 + Math.sin(this.pulsePhase) * this.pulseAmount;
        const currentRadius = this.radius * pulseScale;
        
        // Draw obstacle
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        
        // Create gradient for obstacle
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, currentRadius
        );
        gradient.addColorStop(0, this.color.replace('0.7', '0.9)'));
        gradient.addColorStop(1, this.color.replace('0.7', '0.3)'));
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw warning ring
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius + 10, 0, Math.PI * 2);
        ctx.strokeStyle = this.color.replace('0.7', '0.3)');
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    /**
     * Check if a point collides with this obstacle
     * @param {number} x - Point X coordinate
     * @param {number} y - Point Y coordinate
     * @returns {boolean} True if point collides with obstacle
     */
    checkCollision(x, y) {
        return distance(x, y, this.x, this.y) <= this.radius;
    }
}

/**
 * CollectionPoint class for points that give score when particles reach them
 */
class CollectionPoint {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.radius = options.radius || 20;
        this.color = options.color || 'rgba(50, 255, 50, 0.7)';
        this.value = options.value || 10;
        this.pulseSpeed = options.pulseSpeed || 0.05;
        this.pulseAmount = options.pulseAmount || 0.3;
        this.pulsePhase = random(0, Math.PI * 2);
        this.active = true;
        this.collected = false;
    }

    /**
     * Update collection point properties
     */
    update() {
        if (!this.active || this.collected) return;
        
        // Update pulse phase
        this.pulsePhase += this.pulseSpeed;
        if (this.pulsePhase > Math.PI * 2) {
            this.pulsePhase -= Math.PI * 2;
        }
    }

    /**
     * Draw the collection point on the canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        if (!this.active || this.collected) return;
        
        // Calculate pulse scale
        const pulseScale = 1 + Math.sin(this.pulsePhase) * this.pulseAmount;
        const currentRadius = this.radius * pulseScale;
        
        // Draw collection point
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        
        // Create gradient for collection point
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, currentRadius
        );
        gradient.addColorStop(0, this.color.replace('0.7', '0.9)'));
        gradient.addColorStop(1, this.color.replace('0.7', '0.3)'));
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw value text
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.value.toString(), this.x, this.y);
    }

    /**
     * Check if a point collides with this collection point
     * @param {number} x - Point X coordinate
     * @param {number} y - Point Y coordinate
     * @returns {boolean} True if point collides with collection point
     */
    checkCollision(x, y) {
        return !this.collected && distance(x, y, this.x, this.y) <= this.radius;
    }

    /**
     * Collect the point
     * @returns {number} Value of the collection point
     */
    collect() {
        if (this.collected) return 0;
        
        this.collected = true;
        return this.value;
    }
}

/**
 * PowerUp class for power-ups that give temporary abilities
 */
class PowerUp {
    constructor(x, y, type, options = {}) {
        this.x = x;
        this.y = y;
        this.type = type; // 'timeSlow', 'magnet', 'shield', 'multiplier'
        this.radius = options.radius || 15;
        this.duration = options.duration || 5000; // Duration in milliseconds
        this.color = this.getColorByType();
        this.icon = this.getIconByType();
        this.pulseSpeed = options.pulseSpeed || 0.05;
        this.pulseAmount = options.pulseAmount || 0.3;
        this.pulsePhase = random(0, Math.PI * 2);
        this.active = true;
        this.collected = false;
        this.rotation = 0;
        this.rotationSpeed = 0.02;
    }

    /**
     * Get color based on power-up type
     * @returns {string} Color for the power-up
     */
    getColorByType() {
        switch (this.type) {
            case 'timeSlow': return 'rgba(100, 200, 255, 0.7)';
            case 'magnet': return 'rgba(255, 100, 255, 0.7)';
            case 'shield': return 'rgba(255, 255, 100, 0.7)';
            case 'multiplier': return 'rgba(255, 150, 50, 0.7)';
            default: return 'rgba(255, 255, 255, 0.7)';
        }
    }

    /**
     * Get icon based on power-up type
     * @returns {string} Icon for the power-up
     */
    getIconByType() {
        switch (this.type) {
            case 'timeSlow': return '⏱';
            case 'magnet': return '🧲';
            case 'shield': return '🛡';
            case 'multiplier': return '✖';
            default: return '?';
        }
    }

    /**
     * Update power-up properties
     */
    update() {
        if (!this.active || this.collected) return;
        
        // Update pulse phase
        this.pulsePhase += this.pulseSpeed;
        if (this.pulsePhase > Math.PI * 2) {
            this.pulsePhase -= Math.PI * 2;
        }
        
        // Update rotation
        this.rotation += this.rotationSpeed;
        if (this.rotation > Math.PI * 2) {
            this.rotation -= Math.PI * 2;
        }
    }

    /**
     * Draw the power-up on the canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        if (!this.active || this.collected) return;
        
        // Calculate pulse scale
        const pulseScale = 1 + Math.sin(this.pulsePhase) * this.pulseAmount;
        const currentRadius = this.radius * pulseScale;
        
        // Save context state
        ctx.save();
        
        // Move to power-up position and rotate
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Draw power-up background
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        
        // Create gradient for power-up
        const gradient = ctx.createRadialGradient(
            0, 0, 0,
            0, 0, currentRadius
        );
        gradient.addColorStop(0, this.color.replace('0.7', '0.9)'));
        gradient.addColorStop(1, this.color.replace('0.7', '0.3)'));
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw icon
        ctx.fillStyle = 'white';
        ctx.font = `${currentRadius}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, 0, 0);
        
        // Restore context state
        ctx.restore();
    }

    /**
     * Check if a point collides with this power-up
     * @param {number} x - Point X coordinate
     * @param {number} y - Point Y coordinate
     * @returns {boolean} True if point collides with power-up
     */
    checkCollision(x, y) {
        return !this.collected && distance(x, y, this.x, this.y) <= this.radius;
    }

    /**
     * Collect the power-up
     * @returns {Object} Power-up data
     */
    collect() {
        if (this.collected) return null;
        
        this.collected = true;
        return {
            type: this.type,
            duration: this.duration
        };
    }
                                                                                                           }
