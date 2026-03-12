import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Pen, Square, Circle, Triangle, Minus, ArrowRight, Type, Eraser,
  Trash2, Undo2, Redo2, Download, Minus as LineIcon, MousePointer2
} from 'lucide-react';
import './Whiteboard.css';

// ─── PREDEFINED COLOR PALETTES ──────────────────────────────────────────────
const COLORS = [
  // Whites & Grays
  '#ffffff', '#f1f5f9', '#94a3b8', '#64748b', '#334155', '#1e293b',
  // Reds & Pinks
  '#ef4444', '#ec4899', '#f43f5e', '#fb923c', '#f97316',
  // Yellows & Greens
  '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  // Blues & Purples
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#6d28d9',
  // Pastel shades
  '#fca5a5', '#fdba74', '#fde68a', '#86efac', '#93c5fd', '#c4b5fd',
];

const STROKE_SIZES = [2, 4, 6, 10, 16, 24];

const TOOLS = [
  { id: 'select',    icon: MousePointer2,  label: 'Select' },
  { id: 'pen',       icon: Pen,            label: 'Pen' },
  { id: 'line',      icon: LineIcon,       label: 'Line' },
  { id: 'arrow',     icon: ArrowRight,     label: 'Arrow' },
  { id: 'rect',      icon: Square,         label: 'Rectangle' },
  { id: 'circle',    icon: Circle,         label: 'Circle' },
  { id: 'triangle',  icon: Triangle,       label: 'Triangle' },
  { id: 'text',      icon: Type,           label: 'Text' },
  { id: 'eraser',    icon: Eraser,         label: 'Eraser' },
];

const SHAPE_PRESETS = [
  { label: '⬛ Rectangle', shape: 'rect' },
  { label: '⭕ Circle',    shape: 'circle' },
  { label: '🔺 Triangle',  shape: 'triangle' },
  { label: '➡️ Arrow',    shape: 'arrow' },
  { label: '─ Line',       shape: 'line' },
];

export function Whiteboard() {
  const canvasRef     = useRef(null);
  const overlayRef    = useRef(null); // for shape preview
  const [tool, setTool]       = useState('pen');
  const [color, setColor]     = useState('#818cf8');
  const [strokeSize, setStrokeSize] = useState(3);
  const [fill, setFill]       = useState(false);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [textInput, setTextInput] = useState({ active: false, x: 0, y: 0, value: '' });

  const drawing  = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  // Helpers
  const getCanvas  = () => canvasRef.current;
  const getCtx     = () => canvasRef.current?.getContext('2d');
  const getOverlay = () => overlayRef.current;
  const getOCtx    = () => overlayRef.current?.getContext('2d');

  const getPos = (e) => {
    const rect = getCanvas().getBoundingClientRect();
    const scaleX = getCanvas().width  / rect.width;
    const scaleY = getCanvas().height / rect.height;
    const client = e.touches ? e.touches[0] : e;
    return {
      x: (client.clientX - rect.left) * scaleX,
      y: (client.clientY - rect.top)  * scaleY,
    };
  };

  const saveHistory = () => {
    const snapshot = getCanvas().toDataURL();
    setHistory(h => [...h.slice(-30), snapshot]);
    setRedoStack([]);
  };

  // ── UNDO ──────────────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    if (history.length === 0) { clearCanvas(false); return; }
    const prev = [...history];
    const last = prev.pop();
    setHistory(prev);
    setRedoStack(r => [...r, getCanvas().toDataURL()]);
    const img = new Image();
    img.src = last;
    img.onload = () => { getCtx().clearRect(0, 0, getCanvas().width, getCanvas().height); getCtx().drawImage(img, 0, 0); };
  }, [history]);

  // ── REDO ──────────────────────────────────────────────────────────────────
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const stack = [...redoStack];
    const next = stack.pop();
    setRedoStack(stack);
    setHistory(h => [...h, getCanvas().toDataURL()]);
    const img = new Image();
    img.src = next;
    img.onload = () => { getCtx().clearRect(0, 0, getCanvas().width, getCanvas().height); getCtx().drawImage(img, 0, 0); };
  }, [redoStack]);

  // ── CLEAR ─────────────────────────────────────────────────────────────────
  const clearCanvas = (save = true) => {
    if (save) saveHistory();
    const c = getCanvas();
    if (c) getCtx().clearRect(0, 0, c.width, c.height);
  };

  // ── DOWNLOAD ──────────────────────────────────────────────────────────────
  const downloadCanvas = () => {
    const link = document.createElement('a');
    link.download = 'collabhive-whiteboard.png';
    link.href = getCanvas().toDataURL('image/png');
    link.click();
  };

  // ── DRAW SHAPE ON OVERLAY ─────────────────────────────────────────────────
  const drawShapeOnCtx = (ctx, sx, sy, ex, ey) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.fillStyle   = fill ? color + '44' : 'transparent';
    ctx.lineWidth   = strokeSize;
    ctx.lineCap     = 'round';

    if (tool === 'rect') {
      ctx.rect(sx, sy, ex - sx, ey - sy);
    } else if (tool === 'circle') {
      const rx = (ex - sx) / 2;
      const ry = (ey - sy) / 2;
      ctx.ellipse(sx + rx, sy + ry, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
    } else if (tool === 'triangle') {
      ctx.moveTo(sx + (ex - sx) / 2, sy);
      ctx.lineTo(ex, ey);
      ctx.lineTo(sx, ey);
      ctx.closePath();
    } else if (tool === 'line') {
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
    } else if (tool === 'arrow') {
      const angle = Math.atan2(ey - sy, ex - sx);
      const hw = 14 + strokeSize;
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - hw * Math.cos(angle - Math.PI / 6), ey - hw * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - hw * Math.cos(angle + Math.PI / 6), ey - hw * Math.sin(angle + Math.PI / 6));
    }
    ctx.stroke();
    if (fill && tool !== 'line' && tool !== 'arrow') ctx.fill();
  };

  // ── POINTER DOWN ──────────────────────────────────────────────────────────
  const handlePointerDown = (e) => {
    if (textInput.active) {
      commitText();
      return;
    }
    const pos = getPos(e);

    if (tool === 'text') {
      setTextInput({ active: true, x: pos.x, y: pos.y, value: '' });
      return;
    }

    saveHistory();
    drawing.current = true;
    startPos.current = pos;

    if (tool === 'pen' || tool === 'eraser') {
      const ctx = getCtx();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  // ── POINTER MOVE ──────────────────────────────────────────────────────────
  const handlePointerMove = (e) => {
    if (!drawing.current) return;
    const pos = getPos(e);

    if (tool === 'pen') {
      const ctx = getCtx();
      ctx.strokeStyle = color;
      ctx.lineWidth   = strokeSize;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      const ctx = getCtx();
      ctx.clearRect(pos.x - strokeSize * 3, pos.y - strokeSize * 3, strokeSize * 6, strokeSize * 6);
    } else {
      // Preview shape on overlay canvas
      const oct = getOCtx();
      const oc  = getOverlay();
      oct.clearRect(0, 0, oc.width, oc.height);
      drawShapeOnCtx(oct, startPos.current.x, startPos.current.y, pos.x, pos.y);
    }
  };

  // ── POINTER UP ────────────────────────────────────────────────────────────
  const handlePointerUp = (e) => {
    if (!drawing.current) return;
    drawing.current = false;
    const pos = getPos(e);

    if (tool !== 'pen' && tool !== 'eraser') {
      // Commit overlay to main canvas
      const oct = getOCtx();
      const oc  = getOverlay();
      oct.clearRect(0, 0, oc.width, oc.height);
      drawShapeOnCtx(getCtx(), startPos.current.x, startPos.current.y, pos.x, pos.y);
    }
  };

  // ── COMMIT TEXT ───────────────────────────────────────────────────────────
  const commitText = () => {
    if (textInput.value.trim()) {
      const ctx = getCtx();
      ctx.font      = `${Math.max(16, strokeSize * 4)}px Inter, sans-serif`;
      ctx.fillStyle = color;
      // Scale back to canvas coords
      const scaleX = getCanvas().width / getCanvas().getBoundingClientRect().width;
      ctx.fillText(textInput.value, textInput.x, textInput.y);
    }
    setTextInput({ active: false, x: 0, y: 0, value: '' });
  };

  // ── KEYBOARD SHORTCUTS ────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
      if (e.key === 'Escape') setTextInput({ active: false, x: 0, y: 0, value: '' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  return (
    <div className="whiteboard-wrapper">
      {/* ── TOP TOOLBAR ─────────────────────────────────────────────────── */}
      <div className="wb-toolbar">
        
        {/* Tools */}
        <div className="wb-tool-group">
          {TOOLS.map(t => (
            <button
              key={t.id}
              className={`wb-tool-btn ${tool === t.id ? 'active' : ''}`}
              onClick={() => setTool(t.id)}
              title={t.label}
            >
              <t.icon size={18} />
            </button>
          ))}
        </div>

        <div className="wb-divider" />

        {/* Quick Shape Presets */}
        <div className="wb-tool-group">
          {SHAPE_PRESETS.map(p => (
            <button
              key={p.shape}
              className={`wb-preset-btn ${tool === p.shape ? 'active' : ''}`}
              onClick={() => setTool(p.shape)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="wb-divider" />

        {/* Stroke size */}
        <div className="wb-tool-group">
          {STROKE_SIZES.map(s => (
            <button
              key={s}
              className={`wb-size-btn ${strokeSize === s ? 'active' : ''}`}
              onClick={() => setStrokeSize(s)}
              title={`${s}px`}
            >
              <div style={{ width: Math.min(s, 20), height: Math.min(s, 20), borderRadius: '50%', background: 'currentColor' }} />
            </button>
          ))}
        </div>

        <div className="wb-divider" />

        {/* Fill toggle */}
        <button
          className={`wb-tool-btn ${fill ? 'active' : ''}`}
          onClick={() => setFill(f => !f)}
          title="Toggle Fill"
          style={{ fontSize: '0.7rem', fontWeight: 700, gap: '2px' }}
        >
          <Square size={14} style={{ fill: fill ? color : 'none' }} />
          Fill
        </button>

        <div className="wb-divider" />

        {/* Actions */}
        <div className="wb-tool-group">
          <button className="wb-tool-btn" onClick={undo} title="Undo (Ctrl+Z)"><Undo2 size={18} /></button>
          <button className="wb-tool-btn" onClick={redo} title="Redo (Ctrl+Y)"><Redo2 size={18} /></button>
          <button className="wb-tool-btn text-danger" onClick={() => clearCanvas(true)} title="Clear Board"><Trash2 size={18} /></button>
          <button className="wb-tool-btn text-success" onClick={downloadCanvas} title="Download as PNG"><Download size={18} /></button>
        </div>
      </div>

      {/* ── COLOR BAR ───────────────────────────────────────────────────── */}
      <div className="wb-color-bar">
        <div className="wb-colors">
          {COLORS.map(c => (
            <button
              key={c}
              className={`color-swatch ${color === c ? 'selected' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              title={c}
            />
          ))}
        </div>
        {/* Custom color picker */}
        <label className="custom-color-btn" title="Custom Color">
          🎨
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            style={{ opacity: 0, position: 'absolute', width: 0, height: 0 }}
          />
        </label>
        {/* Active color display */}
        <div className="active-color-display" style={{ background: color }} />
      </div>

      {/* ── CANVAS AREA ─────────────────────────────────────────────────── */}
      <div className="wb-canvas-area" style={{ cursor: tool === 'eraser' ? 'cell' : tool === 'text' ? 'text' : 'crosshair' }}>
        <canvas
          ref={canvasRef}
          width={1600}
          height={800}
          className="wb-canvas"
        />
        {/* Overlay canvas for shape preview */}
        <canvas
          ref={overlayRef}
          width={1600}
          height={800}
          className="wb-canvas-overlay"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />

        {/* ── TEXT INPUT OVERLAY ── */}
        {textInput.active && (
          <input
            className="wb-text-input"
            autoFocus
            style={{
              left:     (textInput.x / 1600) * 100 + '%',
              top:      (textInput.y / 800)  * 100 + '%',
              color:    color,
              fontSize: Math.max(16, strokeSize * 4) + 'px',
            }}
            value={textInput.value}
            onChange={e => setTextInput(p => ({ ...p, value: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter') commitText(); if (e.key === 'Escape') setTextInput({ active: false, x: 0, y: 0, value: '' }); }}
            placeholder="Type here..."
          />
        )}
      </div>

      <div className="wb-footer">
        <span>Tool: <strong>{TOOLS.find(t => t.id === tool)?.label}</strong></span>
        <span>Color: <strong>{color}</strong></span>
        <span>Size: <strong>{strokeSize}px</strong></span>
        <span className="text-muted">Ctrl+Z = Undo · Ctrl+Y = Redo · Click canvas to draw</span>
      </div>
    </div>
  );
}
