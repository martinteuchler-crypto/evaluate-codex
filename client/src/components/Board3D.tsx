import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import board from '../board.json';

export default function Board3D({ state }: { state: any }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(ref.current.clientWidth, ref.current.clientHeight);
    ref.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, ref.current.clientWidth / ref.current.clientHeight, 0.1, 1000);
    camera.position.set(10, 15, 10);
    const controls = new OrbitControls(camera, renderer.domElement);

    const light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0, 20, 0);
    scene.add(light);

    const geom = new THREE.BoxGeometry(1, 0.1, 1);
    board.squares.forEach((sq: any) => {
      const mat = new THREE.MeshPhongMaterial({ color: sq.sector === 'center' ? 0x888888 : 0xcccccc });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(sq.x, 0, sq.y);
      scene.add(mesh);
    });

    const pieceGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.6, 16);
    Object.entries(state.pieces).forEach(([sqId, p]: any) => {
      const sq = board.squares.find((s: any) => s.id === sqId);
      if (!sq) return;
      const color = p.color === 'white' ? 0xffffff : p.color === 'black' ? 0x000000 : 0xffd700;
      const mat = new THREE.MeshPhongMaterial({ color });
      const mesh = new THREE.Mesh(pieceGeom, mat);
      mesh.position.set(sq.x, 0.4, sq.y);
      scene.add(mesh);
    });

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      ref.current!.removeChild(renderer.domElement);
    };
  }, [state]);

  return <div ref={ref} style={{ height: '80vh' }} />;
}
