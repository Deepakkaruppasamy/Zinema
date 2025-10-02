import React, { Suspense, useMemo, useRef, useState, useCallback } from 'react';
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

function FallbackModel() {
  // Create a simple geometric shape as fallback
  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({ 
      color: '#F84565',
      roughness: 0.3,
      metalness: 0.1
    });
    return { geometry: geo, material };
  }, []);
  
  return (
    <Center>
      <mesh geometry={geometry.geometry} material={geometry.material}>
        <Html center>
          <div className="px-3 py-2 bg-black/60 text-white text-sm rounded">
            3D Model Preview
          </div>
        </Html>
      </mesh>
    </Center>
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

function ModelWithFallback({ url, fallbackUrls = [] }) {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  
  const allUrls = [url, ...fallbackUrls];
  const currentUrl = allUrls[currentUrlIndex];
  
  const handleError = useCallback(() => {
    const nextIndex = currentUrlIndex + 1;
    if (nextIndex < allUrls.length) {
      console.warn(`Failed to load 3D model from ${currentUrl}. Reason: Connection reset or CORS issue. Trying fallback ${nextIndex}/${allUrls.length - 1}`);
      setCurrentUrlIndex(nextIndex);
    } else {
      console.error('Failed to load all 3D model options, showing geometric fallback. This may be due to network issues or CORS restrictions.');
      setShowFallback(true);
    }
  }, [currentUrlIndex, allUrls.length, currentUrl]);
  
  if (showFallback) {
    return <FallbackModel />;
  }
  
  return (
    <React.Suspense fallback={<Loader />}>
      <ErrorBoundary onError={handleError}>
        <Model url={currentUrl} />
      </ErrorBoundary>
    </React.Suspense>
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
  componentDidCatch(error, errorInfo) {
    console.error('3D Model Error Boundary caught an error:', error, errorInfo);
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error);
    }
  }
  render() {
    if (this.state.hasError) {
      // Let the parent handle the fallback
      return null;
    }
    return this.props.children;
  }
}

const ThreeDView = () => {
  const q = useQuery();
  // Add cache-busting to Vercel blob URL to avoid stale cache issues
  const addCacheBuster = (url) => {
    if (url.includes('vercel-storage.com')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}v=${Date.now()}`;
    }
    return url;
  };

  // Use a working fallback model with multiple options
  const fallbackModels = [
    addCacheBuster('https://o9k2jza8ktnsxuxu.public.blob.vercel-storage.com/madame_walker_theatre.glb'), // Custom theater model with cache-busting
    '/models/theature.glb', // Local theater model
    'https://modelviewer.dev/shared-assets/models/Astronaut.glb', // Reliable external fallback
    import.meta.env.VITE_3D_MODEL_URL // Environment configured model
  ].filter(Boolean);
  
  const defaultSrc = fallbackModels[0];
  const requestedSrc = q.get('src');
  
  // Validate and sanitize the requested source
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return url.startsWith('/') || url.startsWith('./');
    }
  };
  
  const src = (requestedSrc && isValidUrl(requestedSrc)) ? requestedSrc : defaultSrc;
  const controlsRef = useRef();
  const [autoRotate, setAutoRotate] = useState(true);
  const [bgTransparent, setBgTransparent] = useState(false);
  const [webglError, setWebglError] = useState(false);
  const canvasRef = useRef();

  // Handle WebGL context lost/restored
  const handleWebGLContextLost = useCallback((event) => {
    console.warn('WebGL context lost');
    event.preventDefault();
    setWebglError(true);
  }, []);

  const handleWebGLContextRestored = useCallback(() => {
    console.log('WebGL context restored');
    setWebglError(false);
  }, []);

  if (webglError) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-xl font-semibold mb-4">WebGL Context Lost</h2>
          <p className="text-gray-400 mb-4">The 3D renderer encountered an issue.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full ${bgTransparent ? 'bg-transparent' : 'bg-black'}`}>
      <div className='h-16 flex items-center px-6 text-white border-b border-white/10 justify-between'>
        <h1 className='text-lg font-semibold'>3D View</h1>
        <div className='flex items-center gap-2'>
          <p className='text-xs opacity-70 hidden md:block'>
            Source: {(() => {
              try {
                const hostname = new URL(src).hostname;
                return hostname.includes('vercel-storage.com') ? 'Vercel Blob Storage' : hostname;
              } catch {
                return src.startsWith('/') ? 'Local file' : 'Invalid URL';
              }
            })()}
          </p>
          {src.includes('vercel-storage.com') && (
            <span className='text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded'>
              Custom Theater Model
            </span>
          )}
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
        <Canvas 
          ref={canvasRef}
          camera={{ position: [2, 2, 4], fov: 50 }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', handleWebGLContextLost);
            gl.domElement.addEventListener('webglcontextrestored', handleWebGLContextRestored);
          }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <ModelWithFallback url={src} fallbackUrls={fallbackModels.slice(1)} />
          <Environment preset='city' />
          <OrbitControls ref={controlsRef} enableDamping makeDefault autoRotate={autoRotate} autoRotateSpeed={0.5} />
          <Stats className='!left-auto !right-2 !top-20' />
        </Canvas>
      </div>
    </div>
  );
};

export default ThreeDView;

// Optional: callers may add their own preload via env or query
