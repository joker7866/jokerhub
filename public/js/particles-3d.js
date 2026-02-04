/**
 * 3D Particle Constellation Effect
 * Responds to mouse movement and creates a network of connected nodes.
 */

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

// Style the canvas to be the fixed background
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.zIndex = '-1';
canvas.style.background = 'radial-gradient(circle at center, #0a0a12 0%, #000000 100%)'; // Deep space look
canvas.style.pointerEvents = 'none'; // Let clicks pass through

let width, height;
let particles = [];
let mouse = { x: null, y: null, radius: 150 };

// Configuration
const PARTICLE_COUNT = 100; // Adjust for density
const CONNECTION_DISTANCE = 120;
const MOUSE_CONNECTION_DISTANCE = 180;
const PARTICLE_SPEED = 0.5;

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * PARTICLE_SPEED;
        this.vy = (Math.random() - 0.5) * PARTICLE_SPEED;
        this.size = Math.random() * 2 + 1;
        this.color = `rgba(0, 255, 136, ${Math.random() * 0.5 + 0.1})`; // Neon green hint
    }

    update() {
        // Move
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse interaction (repel or attract - let's do slight attraction + connection)
        if (mouse.x != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (mouse.radius - distance) / mouse.radius;
                const directionX = forceDirectionX * force * 0.5; // Gentle pull
                const directionY = forceDirectionY * force * 0.5;

                this.vx += directionX;
                this.vy += directionY;
            }
        }

        // Friction to stop them from accelerating forever due to mouse interactions
        this.vx *= 0.99;
        this.vy *= 0.99;

        // Keep minimum speed alive
        if (Math.abs(this.vx) < 0.1) this.vx += (Math.random() - 0.5) * 0.1;
        if (Math.abs(this.vy) < 0.1) this.vy += (Math.random() - 0.5) * 0.1;

        this.draw();
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

function init() {
    resize();
    particles = [];
    // Responsive count
    let count = (width * height) / 15000;
    if (count > 150) count = 150;

    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
            let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x))
                + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));

            if (distance < (CONNECTION_DISTANCE * CONNECTION_DISTANCE)) {
                opacityValue = 1 - (distance / (20000));
                ctx.strokeStyle = 'rgba(0, 255, 136,' + (opacityValue * 0.15) + ')'; // Faint neon green connections
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(particles[b].x, particles[b].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
    }
    connect();
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

// Event Listeners
window.addEventListener('resize', () => {
    resize();
    init();
});

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener('mouseout', () => {
    mouse.x = undefined;
    mouse.y = undefined;
});

// Start
init();
animate();
