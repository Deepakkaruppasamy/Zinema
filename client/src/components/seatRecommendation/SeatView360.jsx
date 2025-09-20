import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, ZoomIn, ZoomOut, Eye, Maximize2, Minimize2 } from 'lucide-react';

const SeatView360 = ({ seatId, isOpen, onClose, theatreLayout = 'standard' }) => {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Theatre layout configurations
  const theatreConfigs = {
    standard: {
      rows: 10,
      seatsPerRow: 12,
      screenWidth: 0.8,
      screenHeight: 0.3,
      seatSpacing: 0.08,
      rowSpacing: 0.1
    },
    imax: {
      rows: 12,
      seatsPerRow: 16,
      screenWidth: 0.9,
      screenHeight: 0.4,
      seatSpacing: 0.06,
      rowSpacing: 0.08
    },
    premium: {
      rows: 8,
      seatsPerRow: 10,
      screenWidth: 0.7,
      screenHeight: 0.25,
      seatSpacing: 0.1,
      rowSpacing: 0.12
    }
  };

  const config = theatreConfigs[theatreLayout] || theatreConfigs.standard;

  // Parse seat ID to get row and column
  const getSeatPosition = (seatId) => {
    const row = seatId.charAt(0);
    const col = parseInt(seatId.slice(1));
    const rowIndex = row.charCodeAt(0) - 65; // A=0, B=1, etc.
    return { row: rowIndex, col: col - 1 };
  };

  const seatPosition = getSeatPosition(seatId);

  // Calculate 3D position of the seat
  const getSeat3DPosition = (row, col) => {
    const x = (col - config.seatsPerRow / 2) * config.seatSpacing;
    const y = 0;
    const z = (config.rows - row) * config.rowSpacing;
    return { x, y, z };
  };

  const seat3D = getSeat3DPosition(seatPosition.row, seatPosition.col);

  // Calculate view from seat
  const calculateView = () => {
    const distance = Math.sqrt(seat3D.x * seat3D.x + seat3D.z * seat3D.z);
    const angle = Math.atan2(seat3D.x, seat3D.z) * (180 / Math.PI);
    const viewQuality = distance < 0.5 ? 'Excellent' : distance < 1 ? 'Good' : 'Fair';
    
    return {
      distance: distance.toFixed(2),
      angle: Math.round(angle),
      viewQuality,
      screenCoverage: Math.max(0, 100 - distance * 50)
    };
  };

  const viewInfo = calculateView();

  // Draw 3D theatre view
  const drawTheatre = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set up 3D projection
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 200 * zoom;

    // Apply rotation
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Draw screen
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-width * config.screenWidth / 2, -height * config.screenHeight / 2, 
                 width * config.screenWidth, height * config.screenHeight);
    
    // Draw screen border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(-width * config.screenWidth / 2, -height * config.screenHeight / 2, 
                   width * config.screenWidth, height * config.screenHeight);

    // Draw seats
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.seatsPerRow; col++) {
        const pos = getSeat3DPosition(row, col);
        const x = pos.x * scale;
        const y = pos.z * scale;
        
        // Check if this is the selected seat
        const isSelectedSeat = row === seatPosition.row && col === seatPosition.col;
        
        if (isSelectedSeat) {
          // Highlight selected seat
          ctx.fillStyle = '#f84565';
          ctx.fillRect(x - 8, y - 8, 16, 16);
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.strokeRect(x - 8, y - 8, 16, 16);
        } else {
          // Regular seat
          ctx.fillStyle = '#444';
          ctx.fillRect(x - 6, y - 6, 12, 12);
          ctx.strokeStyle = '#666';
          ctx.lineWidth = 1;
          ctx.strokeRect(x - 6, y - 6, 12, 12);
        }
      }
    }

    // Draw view cone from selected seat
    if (isSelectedSeat) {
      ctx.strokeStyle = '#f84565';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      const seatX = seat3D.x * scale;
      const seatY = seat3D.z * scale;
      const screenY = -height * config.screenHeight / 2;
      
      // Draw view lines
      ctx.beginPath();
      ctx.moveTo(seatX, seatY);
      ctx.lineTo(-width * config.screenWidth / 4, screenY);
      ctx.moveTo(seatX, seatY);
      ctx.lineTo(width * config.screenWidth / 4, screenY);
      ctx.stroke();
      
      ctx.setLineDash([]);
    }

    ctx.restore();
  };

  // Handle mouse/touch interactions
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    setRotation(prev => prev + deltaX * 0.5);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const resetView = () => {
    setRotation(0);
    setZoom(1);
  };

  useEffect(() => {
    drawTheatre();
  }, [rotation, zoom, seatId, theatreLayout]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [isDragging, dragStart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div 
        ref={containerRef}
        className="bg-gray-900 rounded-lg border border-white/10 w-full max-w-4xl h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">
              360° View from Seat {seatId}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetView}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(0.5, prev * 0.9))}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.min(3, prev * 1.1))}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* 3D View Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            style={{ imageRendering: 'pixelated' }}
          />
          
          {/* Instructions Overlay */}
          <div className="absolute top-4 left-4 bg-black/50 rounded-lg p-3 text-sm text-white">
            <p>🖱️ Drag to rotate • 🎯 Scroll to zoom • 🔄 Click reset to center</p>
          </div>
        </div>

        {/* View Information */}
        <div className="p-4 border-t border-white/10 bg-gray-800/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{viewInfo.distance}m</div>
              <div className="text-sm text-gray-400">Distance to Screen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{viewInfo.angle}°</div>
              <div className="text-sm text-gray-400">Viewing Angle</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{viewInfo.viewQuality}</div>
              <div className="text-sm text-gray-400">View Quality</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{viewInfo.screenCoverage}%</div>
              <div className="text-sm text-gray-400">Screen Coverage</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatView360;
