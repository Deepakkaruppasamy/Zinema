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

function Model({ url }) {
  const { scene } = useGLTF(url);
  
  const scaled = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const target = 2.5;
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
    
    const isConnectionError = error?.message?.includes('Failed to fetch') || 
                             error?.message?.includes('ERR_CONNECTION_RESET') ||
                             error?.message?.includes('Could not load');
    
    const isLocalFileError = error?.message?.includes('Unexpected token') ||
                            error?.message?.includes('is not valid JSON') ||
                            (currentUrl.startsWith('/') && error?.message?.includes('version ht'));
    
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
    
    if (isConnectionError && retryCount < maxRetries) {
      const delay = Math.pow(2, retryCount) * 1000;
      console.warn(`Connection error detected. Retrying ${currentUrl} in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
      
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, delay);
      return;
    }
    
    const nextIndex = currentUrlIndex + 1;
    if (nextIndex < allUrls.length) {
      console.warn(`Failed to load 3D model from ${currentUrl}. Trying fallback ${nextIndex}/${allUrls.length - 1}`);
      setCurrentUrlIndex(nextIndex);
      setRetryCount(0);
    } else {
      console.error('Failed to load all 3D model options, showing geometric fallback.');
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
    if (this.props.onError) {
      this.props.onError(error);
    }
  }
  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

const ThreeDView = () => {
  const q = useQuery();
  
  const addCacheBuster = (url) => {
    if (url.includes('vercel-storage.com')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}v=${Date.now()}`;
    }
    return url;
  };

  const fallbackModels = [
    addCacheBuster('https://o9k2jza8ktnsxuxu.public.blob.vercel-storage.com/madame_walker_theatre.glb'),
    'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    import.meta.env.VITE_3D_MODEL_URL,
    '/models/theature.glb',
  ].filter(Boolean);
  
  const defaultSrc = fallbackModels[0];
  const requestedSrc = q.get('src');
  
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

  const handleWebGLContextLost = useCallback((event) => {
    console.warn('WebGL context lost - attempting recovery');
    event.preventDefault();
    setWebglError(true);
    
    const recoveryState = { attempts: 0, maxAttempts: 3, isRecovering: true };
    
    const attemptRecovery = () => {
      if (!recoveryState.isRecovering) return;
      
      recoveryState.attempts++;
      console.log(`WebGL recovery attempt ${recoveryState.attempts}/${recoveryState.maxAttempts}`);
      
      if (recoveryState.attempts < recoveryState.maxAttempts) {
        setTimeout(() => {
          if (recoveryState.isRecovering) {
            setWebglError(false);
            setTimeout(() => {
              if (recoveryState.isRecovering) {
                attemptRecovery();
              }
            }, 1000);
          }
        }, 2000 * recoveryState.attempts);
      } else {
        console.error('WebGL context recovery failed after multiple attempts');
        recoveryState.isRecovering = false;
      }
    };
    
    attemptRecovery();
    
    return () => {
      recoveryState.isRecovering = false;
    };
  }, []);

  const handleWebGLContextRestored = useCallback(() => {
    console.log('WebGL context restored successfully');
    setWebglError(false);
    
    setTimeout(() => {
      if (canvasRef.current) {
        window.dispatchEvent(new Event('resize'));
      }
    }, 100);
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('webglcontextlost', handleWebGLContextLost);
    canvas.addEventListener('webglcontextrestored', handleWebGLContextRestored);
    
    if (import.meta.env.PROD) {
      canvas.style.willChange = 'auto';
      canvas.style.transform = 'translateZ(0)';
      
      const checkMemoryPressure = () => {
        if (performance.memory) {
          const usedMB = performance.memory.usedJSHeapSize / 1024 / 1024;
          const limitMB = performance.memory.jsHeapSizeLimit / 1024 / 1024;
          const usagePercent = (usedMB / limitMB) * 100;
          
          if (usagePercent > 80) {
            console.warn(`High memory usage: ${usagePercent.toFixed(1)}%`);
            if (window.gc) {
              window.gc();
            }
          }
        }
      };
      
      const memoryInterval = setInterval(checkMemoryPressure, 30000);
      
      return () => {
        clearInterval(memoryInterval);
        canvas.removeEventListener('webglcontextlost', handleWebGLContextLost);
        canvas.removeEventListener('webglcontextrestored', handleWebGLContextRestored);
      };
    }
    
    return () => {
      canvas.removeEventListener('webglcontextlost', handleWebGLContextLost);
      canvas.removeEventListener('webglcontextrestored', handleWebGLContextRestored);
    };
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
          onCreated={({ gl, scene, camera }) => {
            canvasRef.current = gl.domElement;
            
            gl.setClearColor(0x000000, 0);
            gl.antialias = true;
            gl.powerPreference = "high-performance";
            
            gl.domElement.style.outline = 'none';
            gl.domElement.tabIndex = -1;
            
            if (import.meta.env.PROD) {
              gl.getContext().getParameter(gl.getContext().MAX_TEXTURE_SIZE);
              
              gl.domElement.style.imageRendering = 'optimizeSpeed';
              gl.domElement.style.imageRendering = '-webkit-optimize-contrast';
            }
            
            const preventContextLoss = () => {
              setInterval(() => {
                try {
                  gl.getContext().getParameter(gl.getContext().VERSION);
                } catch (e) {
                  console.warn('WebGL context check failed:', e);
                }
              }, 5000);
            };
            
            preventContextLoss();
          }}
          gl={{ 
            antialias: true, 
            alpha: true, 
            powerPreference: "high-performance",
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false,
            precision: "mediump",
            logarithmicDepthBuffer: false,
            physicallyCorrectLights: false,
            stencil: false,
            depth: true,
            premultipliedAlpha: false,
            preserveDrawingBuffer: false
          }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <ModelWithFallback url={src} fallbackUrls={fallbackModels.slice(1)} />
          <Environment preset='city' />
          <OrbitControls ref={controlsRef} enableDamping makeDefault autoRotate={autoRotate} autoRotateSpeed={0.5} />
          {!import.meta.env.PROD && <Stats className='!left-auto !right-2 !top-20' />}
        </Canvas>
      </div>
    </div>
  );
};

export default ThreeDView;