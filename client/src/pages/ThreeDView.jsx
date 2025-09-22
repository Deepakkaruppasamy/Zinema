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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error) {
    // no-op; could log to monitoring here
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className='h-full w-full flex items-center justify-center'>
          <div className='px-4 py-3 rounded bg-black/60 text-white text-sm max-w-xl text-center'>
            <p className='font-medium'>Failed to load 3D model.</p>
            <p className='opacity-80 mt-1'>
              Ensure the GLB is a real binary (not a Git LFS pointer) and accessible.
            </p>
            <p className='opacity-80 mt-1'>
              You can provide a model URL via query: <code>?src=https://your-cdn/theatre.glb</code>
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ThreeDView = () => {
  const q = useQuery();
  const defaultSrc = import.meta.env.VITE_3D_MODEL_URL || '/models/theature.glb';
  const src = q.get('src') || defaultSrc;
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
        <ErrorBoundary>
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
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default ThreeDView;

// drei GLTF loader needs this for Vite to avoid warnings
useGLTF.preload('/models/theature.glb');
