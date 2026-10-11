'use client';

import {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {Minus, Plus, RotateCcw, Pause, Play, ChevronLeft, ChevronRight} from 'lucide-react';
import type {ViewerLabels} from './architecture-viewer';

type Controller = {rotate: (angle: number) => void; zoom: (factor: number) => void; reset: () => void; setAutoRotate: (enabled: boolean) => void};

export default function ArchitectureScene({labels, reducedMotion}: {labels: ViewerLabels; reducedMotion: boolean}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<Controller | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const surface = canvas.current;
    const host = surface?.parentElement;
    if (!surface || !host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({canvas: surface, antialias: true, powerPreference: 'low-power', alpha: false});
    } catch {
      const frame = requestAnimationFrame(() => setStatus('unavailable'));
      return () => cancelAnimationFrame(frame);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#ebe8df');
    scene.fog = new THREE.Fog('#ebe8df', 20, 42);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 70);
    camera.position.set(9, 7, 11);
    const controls = new OrbitControls(camera, surface);
    controls.target.set(0, 1, 0);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.autoRotateSpeed = 0.65;
    controls.minPolarAngle = Math.PI / 6;
    controls.maxPolarAngle = Math.PI / 2.25;
    // Keep vertical page scrolling available on touch screens.
    surface.style.touchAction = 'pan-y';
    controls.update();
    controls.saveState();

    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scene.add(new THREE.HemisphereLight('#fff9ed', '#a69b85', 2.5));
    const sunlight = new THREE.DirectionalLight('#fff4df', 3.2);
    sunlight.position.set(-5, 10, 7);
    sunlight.castShadow = true;
    sunlight.shadow.mapSize.set(1024, 1024);
    sunlight.shadow.camera.left = -10;
    sunlight.shadow.camera.right = 10;
    sunlight.shadow.camera.top = 10;
    sunlight.shadow.camera.bottom = -10;
    sunlight.shadow.normalBias = 0.04;
    scene.add(sunlight);

    const materials = {
      ivory: new THREE.MeshStandardMaterial({color: '#f6f1e7', roughness: 0.82}),
      stone: new THREE.MeshStandardMaterial({color: '#d4cbb8', roughness: 0.9}),
      glass: new THREE.MeshStandardMaterial({color: '#274640', roughness: 0.18, metalness: 0.48}),
      wood: new THREE.MeshStandardMaterial({color: '#946d45', roughness: 0.8}),
      lawn: new THREE.MeshStandardMaterial({color: '#758265', roughness: 1}),
      water: new THREE.MeshStandardMaterial({color: '#5caaa5', roughness: 0.13, metalness: 0.15}),
      leaf: new THREE.MeshStandardMaterial({color: '#5a704c', roughness: 0.95}),
      lightLeaf: new THREE.MeshStandardMaterial({color: '#82936b', roughness: 0.95})
    };
    function box(size: [number, number, number], position: [number, number, number], material: THREE.Material) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
      mesh.position.set(...position);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      return mesh;
    }
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({color: '#ebe8df', roughness: 1}));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.3;
    ground.receiveShadow = true;
    scene.add(ground);
    box([9.6, 0.28, 7.8], [0, -0.14, 0], materials.stone);
    box([2.6, 0.06, 5.4], [-3.35, 0.02, -0.3], materials.lawn);
    box([4.5, 1.7, 3.1], [-0.6, 0.9, -0.65], materials.ivory);
    box([4.9, 0.18, 3.6], [-0.6, 1.82, -0.65], materials.ivory);
    box([3.15, 1.6, 3], [-1.3, 2.65, -0.8], materials.ivory);
    box([3.5, 0.17, 3.35], [-1.3, 3.51, -0.8], materials.ivory);
    box([3.7, 0.13, 1.8], [-0.5, 0.08, 1.7], materials.ivory);
    for (let i = 0; i < 4; i++) {
      box([0.82, 1.36, 0.04], [-2.12 + i * 0.95, 0.91, 0.923], materials.glass);
      box([0.04, 1.45, 0.065], [-2.57 + i * 0.95, 0.91, 0.945], materials.wood);
    }
    for (let i = 0; i < 3; i++) box([0.8, 1.13, 0.04], [-2.27 + i * 0.98, 2.64, 0.72], materials.glass);
    box([0.035, 1.18, 1.8], [1.68, 0.91, -0.85], materials.glass);
    box([0.045, 1.08, 1.5], [-2.89, 2.64, -0.85], materials.glass);
    for (let i = 0; i < 8; i++) box([0.07, 1.66, 0.16], [1.34 + i * 0.08, 0.93, 0.93], materials.wood);
    for (let i = 0; i < 9; i++) box([0.11, 0.1, 1.55], [-2.2 + i * 0.4, 1.88, 1.72], materials.wood);
    box([0.1, 1.85, 0.1], [-2.22, 0.96, 2.4], materials.wood);
    box([0.1, 1.85, 0.1], [1.02, 0.96, 2.4], materials.wood);
    box([3.35, 0.1, 1.83], [3, 0.05, 2.15], materials.ivory);
    box([2.95, 0.025, 1.43], [3, 0.12, 2.15], materials.water);
    for (let i = 0; i < 5; i++) box([0.48, 0.07, 0.48], [-3.37, 0.09, 2.8 - i * 0.8], materials.ivory);
    function tree(x: number, z: number, scale: number) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07 * scale, 0.11 * scale, 1.5 * scale, 7), materials.wood);
      trunk.position.set(x, 0.8 * scale, z);
      trunk.castShadow = true;
      scene.add(trunk);
      for (let i = 0; i < 4; i++) {
        const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.68 * scale, 1), i % 2 ? materials.leaf : materials.lightLeaf);
        crown.scale.set(1, 0.9, 0.8);
        crown.position.set(x + Math.cos(i * 2.4) * 0.35 * scale, (1.6 + i * 0.12) * scale, z + Math.sin(i * 2.4) * 0.3 * scale);
        crown.castShadow = true;
        scene.add(crown);
      }
    }
    tree(-3.35, -2.1, 1);
    tree(3.2, -2.1, 1.2);
    tree(3.8, 0, 0.65);
    for (let i = 0; i < 7; i++) box([0.18, 0.25 + (i % 3) * 0.07, 0.18], [3.85, 0.13, -3 + i * 0.45], materials.leaf);

    let frame = 0;
    let lastTime = 0;
    let inView = false;
    let disposed = false;
    let contextLost = false;
    function draw() {if (!disposed && !contextLost) renderer.render(scene, camera);}
    function tick(time: number) {
      frame = 0;
      if (disposed || contextLost || !inView || document.hidden) return;
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 1 / 30;
      if (time - lastTime >= 1000 / 30) {
        lastTime = time;
        controls.update(delta);
      }
      if (controls.autoRotate) frame = requestAnimationFrame(tick);
    }
    function resume() {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      if (!contextLost && inView && !document.hidden && controls.autoRotate) frame = requestAnimationFrame(tick);
    }
    function resize() {
      if (!host) return;
      const {width, height} = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      draw();
    }
    controller.current = {
      rotate(angle) {
        const offset = camera.position.clone().sub(controls.target);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        camera.position.copy(controls.target).add(offset);
        controls.update(); draw();
      },
      zoom(factor) {
        const offset = camera.position.clone().sub(controls.target);
        offset.multiplyScalar(factor).clampLength(7, 22);
        camera.position.copy(controls.target).add(offset);
        controls.update(); draw();
      },
      reset() {controls.reset(); draw();},
      setAutoRotate(enabled) {controls.autoRotate = enabled; resume(); draw();}
    };
    controls.addEventListener('change', draw);
    const visibility = new IntersectionObserver(([entry]) => {inView = !!entry?.isIntersecting; resume();}, {threshold: 0.05});
    visibility.observe(host);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    document.addEventListener('visibilitychange', resume);
    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      cancelAnimationFrame(frame);
      setStatus('unavailable');
    };
    surface.addEventListener('webglcontextlost', onContextLost);
    resize();
    const readyFrame = requestAnimationFrame(() => setStatus('ready'));
    return () => {
      disposed = true;
      controller.current = null;
      cancelAnimationFrame(readyFrame);
      cancelAnimationFrame(frame);
      visibility.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', resume);
      surface.removeEventListener('webglcontextlost', onContextLost);
      controls.dispose();
      const geometries = new Set<THREE.BufferGeometry>();
      const sceneMaterials = new Set<THREE.Material>();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          geometries.add(object.geometry);
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) sceneMaterials.add(material);
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      sceneMaterials.forEach((material) => material.dispose());
      sunlight.shadow.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {controller.current?.setAutoRotate(!reducedMotion && !paused);}, [reducedMotion, paused]);

  return <div className={`architecture-scene scene-${status}`} data-testid="architecture-scene" data-renderer-status={status}>
    <div className="scene-canvas-host"><canvas ref={canvas} role="img" aria-label={labels.description} /></div>
    {status === 'unavailable' ? <div className="viewer-fallback" role="status">{labels.fallback}</div> : <>
      <p className="viewer-instructions">{status === 'ready' ? labels.instructions : labels.loading}</p>
      <div className="viewer-controls" role="group" aria-label={labels.instructions}>
        <button type="button" onClick={() => controller.current?.rotate(-Math.PI / 8)} aria-label={labels.rotateLeft}><ChevronLeft size={18} /></button>
        <button type="button" onClick={() => controller.current?.rotate(Math.PI / 8)} aria-label={labels.rotateRight}><ChevronRight size={18} /></button>
        <span className="viewer-divider" />
        <button type="button" onClick={() => controller.current?.zoom(0.85)} aria-label={labels.zoomIn}><Plus size={18} /></button>
        <button type="button" onClick={() => controller.current?.zoom(1.18)} aria-label={labels.zoomOut}><Minus size={18} /></button>
        <button type="button" onClick={() => {setPaused(true); controller.current?.reset();}} aria-label={labels.reset}><RotateCcw size={18} /></button>
        {!reducedMotion && <button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? labels.play : labels.pause} aria-pressed={paused}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>}
      </div>
    </>}
  </div>;
}
