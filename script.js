/** * Loves Me... Loves Me Not: Neon Edition
 * Core Game Script
 **/

// --- PARTICLE BACKGROUND SYSTEM ---
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');
let particles = [];

function initParticles() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    particles = [];
    // High-density: 150 particles for a deep neon atmosphere
    for(let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * bgCanvas.width,
            y: Math.random() * bgCanvas.height,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            color: Math.random() > 0.5 ? '#00f2ff' : '#bc13fe'
        });
    }
}

function drawParticles() {
    // Semi-transparent fill creates a slight motion trail
    bgCtx.fillStyle = 'rgba(2, 2, 5, 0.15)';
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    particles.forEach(p => {
        p.x += p.speedX; p.y += p.speedY;
        
        // Bounce off edges
        if(p.x < 0 || p.x > bgCanvas.width) p.speedX *= -1;
        if(p.y < 0 || p.y > bgCanvas.height) p.speedY *= -1;
        
        bgCtx.beginPath();
        bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        bgCtx.shadowBlur = 10;
        bgCtx.shadowColor = p.color;
        bgCtx.fillStyle = p.color;
        bgCtx.fill();
    });
    requestAnimationFrame(drawParticles);
}

// --- FLOWER ENGINE ---
const fCanvas = document.getElementById('flowerCanvas');
const fCtx = fCanvas.getContext('2d');
const messageEl = document.getElementById('message');

let petals = [];
let isLovesMe = true;
let petalsRemaining = 0;
let centerX, centerY;
let currentEmoji = "🤔";

class Petal {
    constructor(angle, length, width, c1, c2) {
        this.angle = angle;
        this.length = length;
        this.width = width;
        this.c1 = c1; this.c2 = c2;
        this.isFalling = false;
        this.x = 0; this.y = 0;
        this.vY = 0; this.vX = 0;
        this.rot = 0; this.swing = 0;
    }

    update() {
        if (this.isFalling) {
            this.vY += 0.25;      // Gravity
            this.swing += 0.08;   // Sway oscillation
            this.vX = Math.sin(this.swing) * 3;
            this.y += this.vY;
            this.x += this.vX;
            this.rot += 0.05;     // Tumbling rotation
        } else {
            this.x = centerX;
            this.y = centerY;
        }
    }

    draw() {
        fCtx.save();
        fCtx.translate(this.x, this.y);
        fCtx.rotate(this.angle + this.rot);
        fCtx.beginPath();
        fCtx.moveTo(0, 0);
        fCtx.bezierCurveTo(-this.width, -this.length * 0.5, -this.width, -this.length, 0, -this.length);
        fCtx.bezierCurveTo(this.width, -this.length, this.width, -this.length * 0.5, 0, 0);
        
        const g = fCtx.createLinearGradient(0, 0, 0, -this.length);
        g.addColorStop(0, this.c1); 
        g.addColorStop(1, this.c2);
        
        fCtx.fillStyle = g;
        fCtx.fill();
        fCtx.strokeStyle = "rgba(255,255,255,0.3)";
        fCtx.lineWidth = 1.5;
        fCtx.stroke();
        fCtx.restore();
    }

    contains(mx, my) {
        if (this.isFalling) return false;
        // Check collision near the tip of the petal
        const tipX = this.x + Math.sin(this.angle) * (this.length * 0.8);
        const tipY = this.y - Math.cos(this.angle) * (this.length * 0.8);
        return Math.hypot(mx - tipX, my - tipY) < this.width;
    }
}

function initFlower() {
    const card = document.querySelector('.glass-card');
    fCanvas.width = card.clientWidth - 40;
    fCanvas.height = card.clientHeight - 200;
    centerX = fCanvas.width / 2;
    centerY = fCanvas.height / 2;
    
    petals = [];
    isLovesMe = true;
    currentEmoji = "🤔";
    messageEl.innerText = "Pick a petal...";

    // RANDOM LOGIC: Generate 5 to 15 petals every reset
    const randomCount = Math.floor(Math.random() * 11) + 5; 
    
    for (let i = 0; i < randomCount; i++) {
        const angle = (i * Math.PI * 2) / randomCount;
        // Randomly pick a color scheme for this flower
        const useRedScheme = Math.random() > 0.5;
        const color1 = useRedScheme ? '#ff4b2b' : '#bc13fe';
        const color2 = useRedScheme ? '#ff416c' : '#6e7ff3';
        
        petals.push(new Petal(angle, 120, 45, color1, color2));
    }
    petalsRemaining = petals.length;
}

function drawFlower() {
    fCtx.clearRect(0, 0, fCanvas.width, fCanvas.height);
    
    // Draw Petals
    petals.forEach(p => { p.update(); p.draw(); });

    // Draw Emoji Center
    fCtx.save();
    fCtx.beginPath();
    fCtx.arc(centerX, centerY, 38, 0, Math.PI * 2);
    fCtx.fillStyle = '#ffcc00';
    fCtx.shadowBlur = 20;
    fCtx.shadowColor = '#ffcc00';
    fCtx.fill();
    
    fCtx.textAlign = "center";
    fCtx.textBaseline = "middle";
    fCtx.font = "38px serif";
    fCtx.fillText(currentEmoji, centerX, centerY + 4);
    fCtx.restore();

    requestAnimationFrame(drawFlower);
}

// --- EVENT LISTENERS ---
fCanvas.addEventListener('mousedown', (e) => {
    const rect = fCanvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    for (let i = petals.length - 1; i >= 0; i--) {
        if (petals[i].contains(mx, my)) {
            petals[i].isFalling = true;
            
            if (isLovesMe) {
                messageEl.innerText = "Loves Me!";
                currentEmoji = "😊";
            } else {
                messageEl.innerText = "Loves Me Not...";
                currentEmoji = "😟";
            }
            
            isLovesMe = !isLovesMe;
            petalsRemaining--;

            if (petalsRemaining === 0) {
                const final = messageEl.innerText;
                currentEmoji = final.includes("Not") ? "💔" : "💖";
            }
            break;
        }
    }
});

function resetGame() { 
    initFlower(); 
}

window.addEventListener('resize', () => { 
    initParticles(); 
    initFlower(); 
});

// Start the engines
initParticles();
drawParticles();
initFlower();
drawFlower();
