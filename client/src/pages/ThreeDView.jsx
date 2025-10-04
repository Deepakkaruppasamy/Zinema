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
  // Create a more sophisticated fallback model
  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({ 
      color: '#F84565',
      roughness: 0.3,
      metalness: 0.1,
      emissive: '#F84565',
      emissiveIntensity: 0.1
    });
    return { geometry: geo, material };
  }, []);
  
  return (
    <Center>
      <mesh geometry={geometry.geometry} material={geometry.material}>
        <Html center>
          <div className="px-4 py-3 bg-black/80 text-white text-sm rounded-lg border border-white/20">
            <div className="text-center">
              <div className="text-lg mb-1">🎭</div>
              <div className="font-semibold">3D Model Preview</div>
              <div className="text-xs opacity-75 mt-1">
                Original model unavailable
              </div>
            </div>
          </div>
        </Html>
      </mesh>
    </Center>
  );
}

function PerformanceMonitor() {
  const [fps, setFps] = useState(60);
  const [frameTime, setFrameTime] = useState(16);
  const [showStats, setShowStats] = useState(false);
  
  React.useEffect(() => {
    // Only show performance stats in development
    if (import.meta.env.PROD) {
      return;
    }
    
    let frameCount = 0;
    let lastTime = performance.now();
    
    const monitor = () => {
      frameCount++;
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= 1000) {
        const currentFps = Math.round((frameCount * 1000) / deltaTime);
        const currentFrameTime = Math.round(deltaTime / frameCount);
        
        setFps(currentFps);
        setFrameTime(currentFrameTime);
        
        // Warn if performance is poor
        if (currentFps < 30) {
          console.warn('Low FPS detected:', currentFps, 'fps');
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(monitor);
    };
    
    requestAnimationFrame(monitor);
  }, []);
  
  // Don't render in production
  if (import.meta.env.PROD) {
    return null;
  }
  
  return (
    <Html position={[0, 0, 0]}>
      <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
        FPS: {fps} | Frame: {frameTime}ms
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

function ModelWithFallback({ url, fallbackUrls = [] }) {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const maxRetries = 2;
  
  const allUrls = [url, ...fallbackUrls];
  const currentUrl = allUrls[currentUrlIndex];
  
  // Preload test function to check URL accessibility
  const testUrlAccessibility = useCallback(async (testUrl) => {
    try {
      const response = await fetch(testUrl, { 
        method: 'HEAD',
        mode: 'cors',
        cache: 'no-cache'
      });
      return response.ok;
    } catch (error) {
      console.warn(`URL accessibility test failed for ${testUrl}:`, error.message);
      return false;
    }
  }, []);
  
  // Test current URL accessibility on mount and URL change
  React.useEffect(() => {
    const testCurrentUrl = async () => {
      setIsLoading(true);
      const isAccessible = await testUrlAccessibility(currentUrl);
      
      if (!isAccessible) {
        console.warn(`URL ${currentUrl} is not accessible, moving to next option`);
        handleError(new Error('URL not accessible'));
      } else {
        setIsLoading(false);
      }
    };
    
    testCurrentUrl();
  }, [currentUrl, testUrlAccessibility]);
  
  const handleError = useCallback((error) => {
    console.error('3D Model loading error:', error);
    
    // Check if this is a connection reset error or local file serving issue
    const isConnectionError = error?.message?.includes('Failed to fetch') || 
                             error?.message?.includes('ERR_CONNECTION_RESET') ||
                             error?.message?.includes('Could not load');
    
    const isLocalFileError = error?.message?.includes('Unexpected token') ||
                            error?.message?.includes('is not valid JSON') ||
                            (currentUrl.startsWith('/') && error?.message?.includes('version ht'));
    
    // Don't retry for local file serving issues - move to next URL immediately
    if (isLocalFileError) {
      console.warn(`Local file serving issue detected for ${currentUrl}. Moving to next fallback immediately.`);
      const nextIndex = currentUrlIndex + 1;
      if (nextIndex < allUrls.length) {
        setCurrentUrlIndex(nextIndex);
        setRetryCount(0);
      } else {
        setShowFallback(true);
      }
      return;
    }
    
    // Special handling for your custom theater model
    if (currentUrl.includes('vercel-storage.com')) {
      console.warn(`Custom theater model connection issue detected. This may be due to network restrictions or Vercel blob storage availability.`);
    }
    
    if (isConnectionError && retryCount < maxRetries) {
      // Retry the same URL with exponential backoff
      const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      console.warn(`Connection error detected. Retrying ${currentUrl} in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
      
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, delay);
      return;
    }
    
    // Move to next URL or show fallback
    const nextIndex = currentUrlIndex + 1;
    if (nextIndex < allUrls.length) {
      console.warn(`Failed to load 3D model from ${currentUrl}. Trying fallback ${nextIndex}/${allUrls.length - 1}`);
      setCurrentUrlIndex(nextIndex);
      setRetryCount(0); // Reset retry count for new URL
    } else {
      console.error('Failed to load all 3D model options, showing geometric fallback. This may be due to network issues or CORS restrictions.');
      setShowFallback(true);
    }
  }, [currentUrlIndex, allUrls.length, currentUrl, retryCount, maxRetries]);
  
  if (showFallback) {
    return <FallbackModel />;
  }
  
  if (isLoading) {
    return <Loader />;
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

  // Use a working fallback model with multiple options - prioritize your custom theater model
  const fallbackModels = [
    // Start with your custom theater model first
    addCacheBuster('https://o9k2jza8ktnsxuxu.public.blob.vercel-storage.com/madame_walker_theatre.glb'), // Your custom theater model with cache-busting
    'https://modelviewer.dev/shared-assets/models/Astronaut.glb', // Reliable external fallback
    import.meta.env.VITE_3D_MODEL_URL, // Environment configured model
    '/models/theature.glb', // Local theater model (may have serving issues)
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

  // Handle WebGL context lost/restored with enhanced recovery
  const handleWebGLContextLost = useCallback((event) => {
    console.warn('WebGL context lost - attempting recovery');
    event.preventDefault();
    setWebglError(true);
    
    // Multiple recovery attempts for production environments
    let attempts = 0;
    const maxAttempts = 3;
    
    const attemptRecovery = () => {
      attempts++;
      console.log(`WebGL recovery attempt ${attempts}/${maxAttempts}`);
      
      if (attempts < maxAttempts) {
        setTimeout(() => {
          setWebglError(false);
          // Check if context is actually restored
          setTimeout(() => {
            if (webglError) {
              attemptRecovery();
            }
          }, 500);
        }, 1000 * attempts);
      } else {
        console.error('WebGL context recovery failed after multiple attempts');
      }
    };
    
    attemptRecovery();
  }, [webglError]);

  const handleWebGLContextRestored = useCallback(() => {
    console.log('WebGL context restored successfully');
    setWebglError(false);
  }, []);

  // Cleanup WebGL event listeners on unmount
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('webglcontextlost', handleWebGLContextLost);
      canvas.addEventListener('webglcontextrestored', handleWebGLContextRestored);
      
      // Production-specific optimizations
      if (import.meta.env.PROD) {
        // Reduce memory pressure in production
        canvas.style.willChange = 'auto';
        canvas.style.transform = 'translateZ(0)'; // Force hardware acceleration
      }
      
      return () => {
        canvas.removeEventListener('webglcontextlost', handleWebGLContextLost);
        canvas.removeEventListener('webglcontextrestored', handleWebGLContextRestored);
      };
    }
  }, [handleWebGLContextLost, handleWebGLContextRestored]);

  if (webglError) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center text-white p-8 max-w-md">
          <div className="text-6xl mb-4">🎭</div>
          <h2 className="text-2xl font-bold mb-4">3D View Temporarily Unavailable</h2>
          <p className="text-gray-300 mb-6">
            WebGL context was lost. This can happen due to browser limitations or system resources.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => setWebglError(false)}
              className="bg-[#F84565] hover:bg-[#e63950] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
            {import.meta.env.PROD && (
              <button 
                onClick={() => window.location.href = '/movies'}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors ml-2"
              >
                Browse Movies
              </button>
            )}
            <div className="text-sm text-gray-400">
              <p>If the issue persists, try:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Refreshing the page</li>
                <li>Closing other browser tabs</li>
                <li>Updating your browser</li>
                {import.meta.env.PROD && <li>Try a different browser</li>}
              </ul>
            </div>
          </div>
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
            <span className='text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded'>
              🎭 Your Custom Theater Model
            </span>
          )}
          {src.startsWith('/models/') && (
            <span className='text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded'>
              ⚠️ Local model (may have serving issues)
            </span>
          )}
          {src.includes('modelviewer.dev') && (
            <span className='text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded'>
              🌐 External fallback model
            </span>
          )}
          {src.includes('modelviewer.dev') === false && src.startsWith('/') === false && !src.includes('vercel-storage.com') && (
            <span className='text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded'>
              ✅ Environment model
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
            // Add WebGL context event listeners
            gl.domElement.addEventListener('webglcontextlost', handleWebGLContextLost);
            gl.domElement.addEventListener('webglcontextrestored', handleWebGLContextRestored);
            
            // Optimize WebGL settings to prevent context loss
            gl.setClearColor(0x000000, 0);
            gl.antialias = true;
            gl.powerPreference = "high-performance";
            
            // Set up context loss prevention
            gl.domElement.style.outline = 'none';
            gl.domElement.tabIndex = -1;
          }}
          gl={{ 
            antialias: true, 
            alpha: true, 
            powerPreference: "high-performance",
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false,
            // Production optimizations
            precision: "mediump",
            logarithmicDepthBuffer: false,
            physicallyCorrectLights: false
          }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <ModelWithFallback url={src} fallbackUrls={fallbackModels.slice(1)} />
          <Environment preset='city' />
          <OrbitControls ref={controlsRef} enableDamping makeDefault autoRotate={autoRotate} autoRotateSpeed={0.5} />
          {/* Only show Stats in development */}
          {!import.meta.env.PROD && <Stats className='!left-auto !right-2 !top-20' />}
          {/* Performance monitoring */}
          <PerformanceMonitor />
        </Canvas>
      </div>
    </div>
  );
};

export default ThreeDView;

// Optional: callers may add their own preload via env or query
