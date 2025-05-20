import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import * as THREE from "three";
import U from "../assets/U.webp";
import M from "../assets/M.webp";
import SIX from "../assets/6.webp";
import P from "../assets/P.webp";

const CubeRotation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(25, 1, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const textureLoader = new THREE.TextureLoader();
    const texturePromises = [M, P, U, SIX].map(
      (src) =>
        new Promise((resolve) => {
          textureLoader.load(src, (texture) => resolve(texture));
        })
    );

    Promise.all(texturePromises).then((textures) => {
      textures.forEach((texture) => {
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        texture.colorSpace = THREE.SRGBColorSpace;
      });

      textures[3].center.set(0.5, 0.5);
      textures[3].rotation = Math.PI / 2;
      textures[1].center.set(0.5, 0.5);
      textures[1].rotation = -Math.PI / 2;

      const materials = [
        new THREE.MeshBasicMaterial({ map: textures[0] }), // Right Face
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }), // Top (Hidden)
        new THREE.MeshBasicMaterial({ map: textures[3] }), // Back Face
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }), // Bottom (Hidden)
        new THREE.MeshBasicMaterial({ map: textures[2] }), // Front Face
        new THREE.MeshBasicMaterial({ map: textures[1] }), // Left Face
      ];

      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const cube = new THREE.Mesh(geometry, materials);
      cube.rotation.order = "YXZ";
      scene.add(cube);

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });

      // Front face visible
      tl.set(cube.rotation, { x: 0, y: 0 });

      // Front -> Right
      tl.to(cube.rotation, {
        y: "-=" + Math.PI / 2,
        duration: 0.5,
        ease: "power1.inOut",
      });

      // Right -> Top
      tl.to(cube.rotation, {
        z: "-=" + Math.PI / 2,
        duration: 0.5,
        ease: "power1.inOut",
      });

      // Top -> Right
      tl.to(cube.rotation, {
        y: "-=" + Math.PI / 2,
        duration: 0.5,
        ease: "power1.inOut",
      });

      const animate = () => {
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };

      animate();

      const onResize = () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        materials.forEach((material) => material.map?.dispose());
        cube.geometry.dispose();
        renderer.dispose();
      };
    });
  }, []);

  return <canvas ref={canvasRef} style={{ width: "30px", height: "30px" }} />;
};

export default CubeRotation;
