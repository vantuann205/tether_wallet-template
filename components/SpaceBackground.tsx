"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2));

    // Scene & Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05050a);
    scene.fog = new THREE.FogExp2(0x05050a, 0.002);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    // Starfield particles
    const starsCount = 1800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starsCount * 3);
    const colors = new Float32Array(starsCount * 3);
    const sizes = new Float32Array(starsCount);

    const starColors = [
      new THREE.Color(0xac53ff), // Neon Purple
      new THREE.Color(0x00ffd5), // Neon Cyan
      new THREE.Color(0xff00a2), // Pink / Magenta
      new THREE.Color(0xffffff), // Pure White
      new THREE.Color(0x2a3bb5), // Tech Blue
    ];

    for (let i = 0; i < starsCount; i++) {
      // Spread stars in spherical space
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 20 + Math.random() * 180; // Distance range

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi) - 20;

      // Assign colors
      const color = starColors[Math.floor(Math.random() * starColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Star sizes
      sizes[i] = Math.random() * 2.0 + 0.5;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Custom Canvas Texture for perfectly round glowing stars
    const createStarTexture = () => {
      const size = 16;
      const canvasTex = document.createElement("canvas");
      canvasTex.width = size;
      canvasTex.height = size;
      const ctx = canvasTex.getContext("2d");
      if (ctx) {
        // Gradient fill for soft edge glow
        const gradient = ctx.createRadialGradient(
          size / 2,
          size / 2,
          0,
          size / 2,
          size / 2,
          size / 2
        );
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.8)");
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.2)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
      }
      return new THREE.CanvasTexture(canvasTex);
    };

    const material = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      map: createStarTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const starfield = new THREE.Points(geometry, material);
    scene.add(starfield);

    // Floating Ambient Dust Geometry
    const dustCount = 80;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustVelocities: number[] = [];

    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 120;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 120;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 100 - 30;
      dustVelocities.push(
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.05
      );
    }
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));

    const dustMaterial = new THREE.PointsMaterial({
      size: 3.5,
      color: 0xac53ff,
      map: createStarTexture(),
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const dustParticles = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustParticles);

    // Nebula Cloud Mesh Planes (Creating volumetric colors)
    const nebulaGeometry = new THREE.PlaneGeometry(80, 80);
    const createNebulaTexture = (colorHex: string) => {
      const size = 128;
      const canvasNeb = document.createElement("canvas");
      canvasNeb.width = size;
      canvasNeb.height = size;
      const ctx = canvasNeb.getContext("2d");
      if (ctx) {
        const gradient = ctx.createRadialGradient(
          size / 2,
          size / 2,
          0,
          size / 2,
          size / 2,
          size / 2
        );
        gradient.addColorStop(0, colorHex);
        gradient.addColorStop(0.5, "rgba(0, 0, 0, 0.05)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
      }
      return new THREE.CanvasTexture(canvasNeb);
    };

    const purpleNebulaMat = new THREE.MeshBasicMaterial({
      map: createNebulaTexture("rgba(172, 83, 255, 0.08)"),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const cyanNebulaMat = new THREE.MeshBasicMaterial({
      map: createNebulaTexture("rgba(0, 255, 213, 0.06)"),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    const nebulaPurple = new THREE.Mesh(nebulaGeometry, purpleNebulaMat);
    nebulaPurple.position.set(-25, 10, -40);
    scene.add(nebulaPurple);

    const nebulaCyan = new THREE.Mesh(nebulaGeometry, cyanNebulaMat);
    nebulaCyan.position.set(30, -15, -45);
    scene.add(nebulaCyan);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Mouse drift interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 4;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 4;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!canvas) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Slow starfield rotation
      starfield.rotation.y = elapsedTime * 0.008;
      starfield.rotation.x = elapsedTime * 0.003;

      // Ambient dust movement
      const posArr = dustParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < dustCount; i++) {
        posArr[i * 3] += dustVelocities[i * 3];
        posArr[i * 3 + 1] += dustVelocities[i * 3 + 1];
        posArr[i * 3 + 2] += dustVelocities[i * 3 + 2];

        // Wrap around boundaries
        if (Math.abs(posArr[i * 3]) > 60) posArr[i * 3] = -posArr[i * 3];
        if (Math.abs(posArr[i * 3 + 1]) > 60) posArr[i * 3 + 1] = -posArr[i * 3 + 1];
        if (posArr[i * 3 + 2] > 20 || posArr[i * 3 + 2] < -80) {
          posArr[i * 3 + 2] = -posArr[i * 3 + 2];
        }
      }
      dustParticles.geometry.attributes.position.needsUpdate = true;

      // Slow drifting nebula meshes
      nebulaPurple.position.x = -25 + Math.sin(elapsedTime * 0.2) * 5;
      nebulaPurple.position.y = 10 + Math.cos(elapsedTime * 0.15) * 3;
      nebulaCyan.position.x = 30 + Math.cos(elapsedTime * 0.1) * 4;
      nebulaCyan.position.y = -15 + Math.sin(elapsedTime * 0.25) * 4;

      // Parallax mouse follow
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x += (targetX * 5 - camera.position.x) * 0.03;
      camera.position.y += (-targetY * 5 - camera.position.y) * 0.03;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // Clean up on unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);

      // Memory Cleanup
      geometry.dispose();
      material.dispose();
      dustGeometry.dispose();
      dustMaterial.dispose();
      nebulaGeometry.dispose();
      purpleNebulaMat.dispose();
      cyanNebulaMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas id="space-canvas" ref={canvasRef} />;
}
