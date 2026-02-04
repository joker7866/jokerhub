document.addEventListener('DOMContentLoaded', () => {
    // Parallax Effect for Cube
    const cube = document.querySelector('.cube');
    if (cube) {
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;

            // Calculate rotation based on mouse position
            const rotateX = 20 + (y - 0.5) * 30; // Base 20deg
            const rotateY = (x - 0.5) * 30;

            // Apply easing/animation frame for smoother performance in real app
            // For now direct application
            cube.style.transform = `rotateY(${rotateY * 10}deg) rotateX(${rotateX}deg)`;
        });
    }

    // Scroll Animations (Simple Intersection Observer)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.glass-card').forEach(card => {
        // Initial state set in CSS usually, but ensuring here
        // We'll rely on CSS animations for now, but this block is ready for scroll-triggered fades
    });
});

console.log('JokerHub Systems: Online');
