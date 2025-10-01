import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, RotateCcw, Maximize2, Info } from 'lucide-react';

const ARSeatPreview = ({ isOpen, onClose, seatData, theaterLayout }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isARActive, setIsARActive] = useState(false);
  const [error, setError] = useState(null);
  const [overlayData, setOverlayData] = useState(null);

  useEffect(() => {
    if (isOpen && isARActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, isARActive]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Camera access denied. Please enable camera permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const calculateSeatPosition = (seat) => {
    // Calculate seat position based on theater layout and camera view
    const theaterWidth = theaterLayout?.width || 20;
    const theaterHeight = theaterLayout?.height || 15;
    const seatX = (seat.x / theaterWidth) * 100;
    const seatY = (seat.y / theaterHeight) * 100;
    
    return {
      x: seatX,
      y: seatY,
      distance: Math.sqrt(Math.pow(seat.x - 10, 2) + Math.pow(seat.y - 7.5, 2))
    };
  };

  const drawSeatOverlay = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video || !seatData) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw seat overlay
    const seatPos = calculateSeatPosition(seatData);
    
    // Draw seat indicator
    ctx.fillStyle = seatData.available ? '#10B981' : '#EF4444';
    ctx.beginPath();
    ctx.arc(seatPos.x * canvas.width / 100, seatPos.y * canvas.height / 100, 20, 0, 2 * Math.PI);
    ctx.fill();

    // Draw seat number
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(seatData.number, seatPos.x * canvas.width / 100, seatPos.y * canvas.height / 100 + 5);

    // Draw distance indicator
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 60);
    
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Seat ${seatData.number}`, 20, 30);
    ctx.fillText(`Distance: ${seatPos.distance.toFixed(1)}m`, 20, 45);
    ctx.fillText(`View Angle: ${calculateViewAngle(seatPos)}°`, 20, 60);
  };

  const calculateViewAngle = (seatPos) => {
    // Calculate optimal viewing angle
    const optimalDistance = 8; // meters
    const angle = Math.atan2(seatPos.y - 50, seatPos.x - 50) * (180 / Math.PI);
    return Math.round(angle);
  };

  useEffect(() => {
    if (isARActive && seatData) {
      const interval = setInterval(drawSeatOverlay, 100);
      return () => clearInterval(interval);
    }
  }, [isARActive, seatData]);

  const toggleAR = () => {
    setIsARActive(!isARActive);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-gray-900 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-800">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Camera className="w-6 h-6" />
            AR Seat Preview
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAR}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isARActive 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isARActive ? 'Stop AR' : 'Start AR'}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* AR View */}
        <div className="relative">
          {isARActive ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-96 object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
              />
              
              {/* AR Controls */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button className="p-2 bg-black/50 rounded-lg text-white hover:bg-black/70">
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button className="p-2 bg-black/50 rounded-lg text-white hover:bg-black/70">
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-96 bg-gray-800 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Camera className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg">Click "Start AR" to preview your seat</p>
                <p className="text-sm mt-2">Point your camera at the theater screen</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="text-center text-white p-6">
                <Info className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                <p className="text-lg mb-2">Camera Access Required</p>
                <p className="text-sm text-gray-300">{error}</p>
                <button
                  onClick={toggleAR}
                  className="mt-4 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Seat Information */}
        {seatData && (
          <div className="p-4 bg-gray-800 border-t border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Seat Number</p>
                <p className="text-white font-medium">{seatData.number}</p>
              </div>
              <div>
                <p className="text-gray-400">Row</p>
                <p className="text-white font-medium">{seatData.row}</p>
              </div>
              <div>
                <p className="text-gray-400">Price</p>
                <p className="text-white font-medium">${seatData.price}</p>
              </div>
              <div>
                <p className="text-gray-400">Status</p>
                <p className={`font-medium ${seatData.available ? 'text-green-400' : 'text-red-400'}`}>
                  {seatData.available ? 'Available' : 'Occupied'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ARSeatPreview;
