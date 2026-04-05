"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  life: number;
  type: "thread" | "seed";
  length: number;
  angle: number;
  rotationSpeed: number;
  color: string;
};

const PARTICLE_COLORS = [
  "rgba(40, 90, 53, 0.2)",
  "rgba(58, 105, 138, 0.2)",
  "rgba(26, 26, 26, 0.1)",
  "rgba(255, 74, 28, 0.1)",
];

function createParticle(
  width: number,
  height: number,
  initial = false
): Particle {
  return {
    x: Math.random() * width,
    y: initial ? Math.random() * height : height + 10,
    size: Math.random() * 2 + 0.5,
    speedY: -(Math.random() * 0.5 + 0.1),
    speedX: (Math.random() - 0.5) * 0.5,
    life: Math.random(),
    type: Math.random() > 0.8 ? "thread" : "seed",
    length: Math.random() * 20 + 10,
    angle: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.02,
    color:
      PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)] ||
      PARTICLE_COLORS[0],
  };
}

function updateParticle(
  particle: Particle,
  width: number,
  height: number
): Particle {
  const next = {
    ...particle,
    y: particle.y + particle.speedY,
    x: particle.x + particle.speedX + Math.sin(particle.life * 10) * 0.2,
    life: particle.life + 0.005,
    angle: particle.angle + particle.rotationSpeed,
  };

  if (next.y < -30 || next.x < -30 || next.x > width + 30) {
    return createParticle(width, height);
  }

  return next;
}

function drawParticle(
  context: CanvasRenderingContext2D,
  particle: Particle
) {
  context.save();
  context.translate(particle.x, particle.y);
  context.rotate(particle.angle);

  if (particle.type === "seed") {
    context.beginPath();
    context.arc(0, 0, particle.size, 0, Math.PI * 2);
    context.fillStyle = particle.color;
    context.fill();
  } else {
    context.beginPath();
    context.moveTo(-particle.length / 2, 0);
    context.lineTo(particle.length / 2, 0);
    context.strokeStyle = particle.color;
    context.lineWidth = 0.5;
    context.stroke();
  }

  context.restore();
}

export function NatureCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    let frameId = 0;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    particles = Array.from({ length: 30 }, () =>
      createParticle(canvas.width, canvas.height, true)
    );

    const animate = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.map((particle) =>
        updateParticle(particle, canvas.width, canvas.height)
      );
      particles.forEach((particle) => drawParticle(context, particle));
      frameId = window.requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-40"
      aria-hidden="true"
    />
  );
}
