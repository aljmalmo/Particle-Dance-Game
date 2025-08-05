# Particle Dance

Particle Dance is an interactive web game where players guide streams of particles through a field, creating beautiful patterns and avoiding obstacles by drawing paths with their finger or mouse. The particles follow physics-based movement, creating mesmerizing trails and effects as they flow through the paths players create.

## Game Mechanics

### Path Drawing
Players draw paths on the screen using their finger (mobile) or mouse (desktop). These paths act as guides for the particles.

### Particle Flow
Particles continuously spawn from emitter points and follow the paths drawn by the player. The particles have physics-based movement with momentum and fluid-like behavior.

### Obstacles
Various obstacles appear on the field that players must navigate around. If particles hit obstacles, they're destroyed, and the player loses progress.

### Collection Points
Special collection points are placed around the field. Guiding particles to these points earns the player points and unlocks special effects.

### Power-ups
Special power-ups appear that can be collected to gain temporary abilities:
- **Time Slow**: Slows down particle movement for easier navigation
- **Magnet**: Attracts particles to collection points
- **Shield**: Protects particles from obstacle hits
- **Multiplier**: Doubles points earned for a limited time

### Level Progression
The game has multiple levels with increasing difficulty:
- More complex obstacle patterns
- Faster particle flow
- Additional particle types with different behaviors
- New visual effects and backgrounds

## Technical Implementation

### Technologies Used
- HTML5 Canvas for rendering
- Vanilla JavaScript for game logic
- CSS for UI styling
- Web Audio API for sound effects (optional)

### Key Features
- Physics-based particle movement
- Touch and mouse input support
- Responsive design for all screen sizes
- Local storage for high scores and settings
- Smooth animations using requestAnimationFrame
- Optimized rendering with object pooling

## How to Play

1. Click "Start Game" to begin
2. Draw paths on the screen with your mouse or finger to guide particles
3. Navigate particles around obstacles and toward collection points
4. Collect power-ups for special abilities
5. Complete levels by collecting all collection points
6. Try to achieve the highest score possible!

## Controls

- **Desktop**: Click and drag to draw paths
- **Mobile**: Touch and drag to draw paths
- **Pause Button**: Pause/resume the game
- **Sound Button**: Toggle sound effects on/off

## Deployment

This game is designed to be easily deployed on GitHub Pages:

1. Create a new repository on GitHub
2. Upload all files from this project
3. Go to repository Settings > Pages
4. Select the main branch as source
5. Click Save

Your game will be available at: https://[username].github.io/[repository-name]

## Browser Compatibility

This game is compatible with all modern browsers that support:
- HTML5 Canvas
- ES6 JavaScript features
- Touch events (for mobile)

## Credits

Created as a showcase of creative web development using vanilla HTML, CSS, and JavaScript.
