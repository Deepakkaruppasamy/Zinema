import React, { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Html, useProgress, useGLTF, Center, Stats } from '@react-three/drei';
import * as THREE from 'three';
import { useLocation } from 'react-router-dom';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className='px-4 py-2 rounded bg-black/60 text-white text-sm'>
        Loading {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

function Model({ url }) {
  const { scene } = useGLTF(url);
  // Auto fit: compute bounding box and scale to target size
  const scaled = useMemo(() => {
    const clone = scene.clone(true);
    // compute size
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const target = 2.5; // world units target span
    const scale = target / maxDim;
    clone.scale.setScalar(scale);
    return clone;
  }, [scene]);
  return (
    <Center>
      <primitive object={scaled} />
    </Center>
  );
}

const ThreeDView = () => {
  const q = useQuery();
  const src = q.get('src') || '/models/theature.glb';
  const controlsRef = useRef();
  const [autoRotate, setAutoRotate] = useState(true);
  const [bgTransparent, setBgTransparent] = useState(false);

  return (
    <div className={`min-h-screen w-full ${bgTransparent ? 'bg-transparent' : 'bg-black'}`}>
      <div className='h-16 flex items-center px-6 text-white border-b border-white/10 justify-between'>
        <h1 className='text-lg font-semibold'>3D View</h1>
        <div className='flex items-center gap-2'>
          <p className='text-xs opacity-70 hidden md:block'>Source: {src}</p>
          <button
            onClick={() => controlsRef.current?.reset()}
            className='ml-3 px-3 py-1 text-xs rounded bg-white/10 hover:bg-white/20'
          >Reset View</button>
          <label className='ml-2 text-xs flex items-center gap-1 cursor-pointer'>
            <input type='checkbox' checked={autoRotate} onChange={e => setAutoRotate(e.target.checked)} />
            Auto-rotate
          </label>
          <label className='ml-2 text-xs flex items-center gap-1 cursor-pointer'>
            <input type='checkbox' checked={bgTransparent} onChange={e => setBgTransparent(e.target.checked)} />
            Transparent BG
          </label>
        </div>
      </div>
      <div className='h-[calc(100vh-4rem)]'>
        <Canvas camera={{ position: [2, 2, 4], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Suspense fallback={<Loader />}>
            <Model url={src} />
            <Environment preset='city' />
          </Suspense>
          <OrbitControls ref={controlsRef} enableDamping makeDefault autoRotate={autoRotate} autoRotateSpeed={0.5} />
          <Stats className='!left-auto !right-2 !top-20' />
        </Canvas>
      </div>
    </div>
  );
};

export default ThreeDView;

// drei GLTF loader needs this for Vite to avoid warnings
useGLTF.preload('/models/theature.glb');
