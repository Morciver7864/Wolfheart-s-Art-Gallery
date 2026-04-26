// Initialization
const trailCanvas = document.getElementById('sparkle-canvas');
const trailCtx = trailCanvas.getContext('2d');
const starCanvas = document.createElement('canvas'); // Create dynamic star field
starCanvas.id = "star-field";
document.body.appendChild(starCanvas);
const starCtx = starCanvas.getContext('2d');

let particles = [];
let stars = [];

// Setup Canvas Sizes
function resize() {
    trailCanvas.width = 500;
    trailCanvas.height = 500;
    starCanvas.width = window.innerWidth;
    starCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// --- 1. Background Stars Logic ---
function createStarField() {
    stars = [];
    for (let i = 0; i < 150; i++) {
        stars.push({
            x: Math.random() * starCanvas.width,
            y: Math.random() * (starCanvas.height * 0.6), // Keep stars in upper part
            size: Math.random() * 2,
            opacity: Math.random()
        });
    }
}

function drawStars() {
    starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    stars.forEach(star => {
        starCtx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        starCtx.beginPath();
        starCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        starCtx.fill();
    });
}

// --- 2. Particle (Tail) Logic ---
class Sparkle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1;
        this.alpha = 1;
        this.color = Math.random() > 0.5 ? "#b3a5ef" : "#ffffff";
    }
    update() {
        this.alpha -= 0.015; // Fades out to create the line effect
    }
    draw() {
        trailCtx.globalAlpha = this.alpha;
        trailCtx.fillStyle = this.color;
        trailCtx.beginPath();
        trailCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        trailCtx.fill();
    }
}

// --- 3. Trigger Function ---
function triggerEasterEgg(element) {
    // Background Stars
    createStarField();
    drawStars();
    document.body.classList.add('twilight-mode');
    
    // Moon Animation
    element.classList.remove('animate-arc');
    void element.offsetWidth;
    element.classList.add('animate-arc');

    let duration = 1800;
    let start = performance.now();

    function createTrail(now) {
        let t = (now - start) / duration;
        if (t <= 1) {
            // Bezier Math
            let x = (1-t)**2 * 20 + 2*(1-t)*t * 150 + t**2 * 280;
            let y = (1-t)**2 * 150 + 2*(1-t)*t * -50 + t**2 * 150;

            let cX = x * (trailCanvas.width / 300);
            let cY = y * (trailCanvas.height / 200);

            // Spawn density for "Line" tail
            for(let i=0; i<8; i++) {
                particles.push(new Sparkle(cX, cY));
            }
            requestAnimationFrame(createTrail);
        }
    }
    
    setTimeout(() => {
        document.body.classList.remove('twilight-mode');
    }, 4500);

    requestAnimationFrame(createTrail);
}

// Main Animation Loop
function animate() {
    trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(animate);
}

window.triggerEasterEgg = triggerEasterEgg;
animate();