// متغيرات عامة
let canvas, ctx;
let gameState = 'start'; // الحالة الابتدائية هي 'start'
let score = 0;
let level = 1;
let animationFrameId;
let gameStarted = false;

// دالة التهيئة الرئيسية
function init() {
    console.log("تهيئة اللعبة...");
    
    // الحصول على العناصر
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // تعيين أبعاد اللوحة
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // إعداد مستمعي الأحداث
    setupEventListeners();
    
    // إظهار شاشة البداية
    showStartScreen();
    
    console.log("اكتملت تهيئة اللعبة");
}

// تعديل حجم اللوحة
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // زر البدء
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.addEventListener('click', startGame);
    }
    
    // زر إعادة اللعب
    const playAgainButton = document.getElementById('play-again-button');
    if (playAgainButton) {
        playAgainButton.addEventListener('click', restartGame);
    }
    
    // زر الإيقاف المؤقت
    const pauseButton = document.getElementById('pause-button');
    if (pauseButton) {
        pauseButton.addEventListener('click', togglePause);
    }
    
    // زر الصوت
    const soundButton = document.getElementById('sound-button');
    if (soundButton) {
        soundButton.addEventListener('click', toggleSound);
    }
}

// إظهار شاشة البداية
function showStartScreen() {
    console.log("إظهار شاشة البداية");
    document.getElementById('start-screen').style.display = 'flex';
    document.getElementById('game-over-screen').style.display = 'none';
    document.getElementById('game-ui').style.display = 'none';
    gameState = 'start';
    gameStarted = false;
}

// بدء اللعبة
function startGame() {
    console.log("بدء اللعبة");
    
    if (gameStarted) {
        console.log("اللعبة بدأت بالفعل");
        return;
    }
    
    gameStarted = true;
    gameState = 'playing';
    score = 0;
    level = 1;
    
    // إخفاء شاشة البداية وعرض واجهة المستخدم
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-over-screen').style.display = 'none';
    document.getElementById('game-ui').style.display = 'block';
    
    // تحديث واجهة المستخدم
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    
    // تهيئة المستوى الأول
    initLevel();
    
    // بدء حلقة اللعبة
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    gameLoop();
}

// إعادة تشغيل اللعبة
function restartGame() {
    console.log("إعادة تشغيل اللعبة");
    
    // إعادة تعيين المتغيرات
    score = 0;
    level = 1;
    gameState = 'playing';
    
    // إخفاء شاشة انتهاء اللعبة
    document.getElementById('game-over-screen').style.display = 'none';
    document.getElementById('game-ui').style.display = 'block';
    
    // تحديث واجهة المستخدم
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    
    // إعادة تهيئة المستوى
    initLevel();
    
    // إعادة تشغيل حلقة اللعبة
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    gameLoop();
}

// حلقة اللعبة
function gameLoop() {
    if (gameState !== 'playing') {
        console.log("حلقة اللعبة متوقفة، الحالة:", gameState);
        return;
    }
    
    update();
    render();
    
    animationFrameId = requestAnimationFrame(gameLoop);
}

// تحديث حالة اللعبة
function update() {
    // تحديث الجسيمات، العوائق، إلخ.
    updateParticles();
    checkCollisions();
    checkLevelComplete();
}

// رسم اللعبة
function render() {
    // مسح اللوحة
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // رسم العناصر
    drawBackground();
    drawParticles();
    drawObstacles();
    drawCollectionPoints();
    drawPowerUps();
}

// انتهاء اللعبة
function gameOver() {
    console.log("انتهاء اللعبة");
    gameState = 'gameOver';
    gameStarted = false;
    cancelAnimationFrame(animationFrameId);
    
    // عرض النتيجة النهائية
    document.getElementById('final-score').textContent = score;
    
    // إظهار شاشة انتهاء اللعبة
    document.getElementById('game-over-screen').style.display = 'flex';
    document.getElementById('game-ui').style.display = 'none';
}

// بدء اللعبة عند تحميل الصفحة
window.addEventListener('load', init);
