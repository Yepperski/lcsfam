import { useEffect, useRef } from "react";

const SmokeBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      opacity: number;
      fadeSpeed: number;
      color: string;
    }

    const particles: Particle[] = [];
    const maxParticles = 40;

    const colors = [
      "hsla(0, 70%, 40%, ",   // crimson
      "hsla(0, 0%, 30%, ",    // smoke gray
      "hsla(0, 50%, 25%, ",   // dark red
    ];

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -(Math.random() * 0.8 + 0.3),
      radius: Math.random() * 80 + 40,
      opacity: Math.random() * 0.12 + 0.03,
      fadeSpeed: Math.random() * 0.0005 + 0.0002,
      color: colors[Math.floor(Math.random() * colors.length)],
    });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add new particles
      if (particles.length < maxParticles && Math.random() > 0.92) {
        particles.push(createParticle());
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx + Math.sin(Date.now() * 0.001 + i) * 0.3;
        p.y += p.vy;
        p.opacity -= p.fadeSpeed;
        p.radius += 0.2;

        if (p.opacity <= 0 || p.y < -p.radius) {
          particles.splice(i, 1);
          continue;
        }

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, p.color + p.opacity + ")");
        gradient.addColorStop(1, p.color + "0)");

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};

export default SmokeBackground;
