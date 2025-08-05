// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create game instance
    window.game = new Game();
    
    // Set global soundEnabled for playSound function
    window.game.soundEnabled = loadData('particleDanceSoundEnabled', true);
    
    // Initialize sound state
    if (isMobile()) {
        // Mute by default on mobile
        window.game.soundEnabled = false;
        saveData('particleDanceSoundEnabled', false);
        window.game.ui.updateSoundButton();
    }
});
