import React, { useRef, useState, useEffect, useCallback } from 'react';

const COLORS = [
  '#000000',
  '#ffffff',
  '#ef4444',
  '#3b82f6',
  '#10b981',
  '#eab308',
  '#8b5cf6',
  '#f97316',
  '#ec4899',
];

export default function Canvas({
  isDrawer,
  onSendDrawing,
  onClearCanvas,
  onUndoDrawing,
  socket,
}) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const containerRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(5);
  const [tool, setTool] = useState('pencil');

  /* ── Helpers ────────────────────────────────────────────── */

  const getCoordinates = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
  }, []);

  const drawSegment = useCallback((data) => {
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    const x = data.x * canvas.clientWidth;
    const y = data.y * canvas.clientHeight;

    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.size;

    if (data.type === 'start') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (data.type === 'draw') {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (data.type === 'end') {
      ctx.closePath();
    }
  }, []);

  /* ── Canvas initialisation & socket listeners ──────────── */

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const setupCanvas = () => {
      const { width, height } = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      contextRef.current = ctx;
    };

    setupCanvas();

    const handleResize = () => setupCanvas();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleDraw = (data) => drawSegment(data);

    const handleClear = () => {
      const ctx = contextRef.current;
      const canvas = canvasRef.current;
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    const handleDrawHistory = (history) => {
      handleClear();
      history.forEach((segment) => drawSegment(segment));
    };

    socket.on('draw', handleDraw);
    socket.on('clearCanvas', handleClear);
    socket.on('drawHistory', handleDrawHistory);

    return () => {
      socket.off('draw', handleDraw);
      socket.off('clearCanvas', handleClear);
      socket.off('drawHistory', handleDrawHistory);
    };
  }, [socket, drawSegment]);

  /* ── Drawing handlers ──────────────────────────────────── */

  const getDrawColor = () => (tool === 'eraser' ? '#ffffff' : color);
  const getDrawSize = () => (tool === 'eraser' ? size * 3 : size);

  const startDrawing = (e) => {
    if (!isDrawer) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    const data = {
      type: 'start',
      x: coords.x,
      y: coords.y,
      color: getDrawColor(),
      size: getDrawSize(),
    };

    drawSegment(data);
    onSendDrawing(data);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawer || !isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    const data = {
      type: 'draw',
      x: coords.x,
      y: coords.y,
      color: getDrawColor(),
      size: getDrawSize(),
    };

    drawSegment(data);
    onSendDrawing(data);
  };

  const stopDrawing = (e) => {
    if (!isDrawer || !isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    const data = {
      type: 'end',
      x: coords.x,
      y: coords.y,
      color: getDrawColor(),
      size: getDrawSize(),
    };

    drawSegment(data);
    onSendDrawing(data);
    setIsDrawing(false);
  };

  /* ── Render ─────────────────────────────────────────────── */

  return (
    <div className="canvas-component">
      <div
        ref={containerRef}
        className="canvas-surface"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      >
        <canvas ref={canvasRef} />
      </div>

      {isDrawer && (
        <div className="canvas-toolbar">
          {/* Color palette */}
          <div className="toolbar-colors">
            {COLORS.map((c) => (
              <button
                key={c}
                className={`color-dot${color === c ? ' active' : ''}${
                  c === '#ffffff' ? ' color-dot-white' : ''
                }`}
                style={{ backgroundColor: c }}
                onClick={() => {
                  setColor(c);
                  setTool('pencil');
                }}
              />
            ))}
          </div>

          {/* Tool toggles */}
          <div className="toolbar-tools">
            <button
              className={`btn btn-tool${tool === 'pencil' ? ' active' : ''}`}
              onClick={() => setTool('pencil')}
            >
              ✏️ Pencil
            </button>
            <button
              className={`btn btn-tool${tool === 'eraser' ? ' active' : ''}`}
              onClick={() => setTool('eraser')}
            >
              🧹 Eraser
            </button>
          </div>

          {/* Brush size */}
          <div className="toolbar-size">
            <label htmlFor="brush-size">Size: {size}px</label>
            <input
              id="brush-size"
              type="range"
              min={2}
              max={20}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
          </div>

          {/* Actions */}
          <div className="toolbar-actions">
            <button className="btn btn-clear" onClick={onClearCanvas}>
              🗑️ Clear
            </button>
            <button className="btn btn-undo" onClick={onUndoDrawing}>
              ↩️ Undo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
