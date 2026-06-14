import { useState, useRef, useCallback, useEffect } from 'react';
import { Plus, Trash2, ArrowRight, Square, Diamond, Circle, Download } from 'lucide-react';

const SHAPES = { rect: 'rect', diamond: 'diamond', circle: 'circle' };

function newNode(x, y, label = 'Node', shape = 'rect') {
  return { id: crypto.randomUUID(), x, y, w: 140, h: 48, label, shape };
}

function NodeShape({ node, selected, onSelect, onDragStart }) {
  const { x, y, w, h, label, shape } = node;
  const fill = selected ? '#fdf3e7' : '#fff';
  const stroke = selected ? '#7A5230' : '#c8b89a';

  const shapeEl = shape === 'diamond' ? (
    <polygon
      points={`${w / 2},4 ${w - 4},${h / 2} ${w / 2},${h - 4} 4,${h / 2}`}
      fill={fill} stroke={stroke} strokeWidth={1.5}
    />
  ) : shape === 'circle' ? (
    <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 4} ry={h / 2 - 4} fill={fill} stroke={stroke} strokeWidth={1.5} />
  ) : (
    <rect x={2} y={2} width={w - 4} height={h - 4} rx={6} fill={fill} stroke={stroke} strokeWidth={1.5} />
  );

  return (
    <g
      transform={`translate(${x},${y})`}
      style={{ cursor: 'move', userSelect: 'none' }}
      onMouseDown={e => { e.stopPropagation(); onDragStart(e, node.id); onSelect(node.id); }}
    >
      {shapeEl}
      <text
        x={w / 2} y={h / 2}
        textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: '12px', fontFamily: "'Inter', sans-serif", fill: '#222', pointerEvents: 'none' }}
      >
        {label.length > 18 ? label.slice(0, 17) + '…' : label}
      </text>
    </g>
  );
}

function Arrow({ from, to, nodes }) {
  const a = nodes.find(n => n.id === from);
  const b = nodes.find(n => n.id === to);
  if (!a || !b) return null;
  const x1 = a.x + a.w / 2, y1 = a.y + a.h / 2;
  const x2 = b.x + b.w / 2, y2 = b.y + b.h / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ex = x2 - (dx / len) * (b.w / 2 + 4);
  const ey = y2 - (dy / len) * (b.h / 2 + 4);
  return (
    <line x1={x1} y1={y1} x2={ex} y2={ey}
      stroke="#a08060" strokeWidth={1.5} markerEnd="url(#arrow)" />
  );
}

export function DiagramEditor({ value, onChange }) {
  const [nodes, setNodes] = useState(() => {
    try { return value?.nodes ?? []; } catch { return []; }
  });
  const [edges, setEdges] = useState(() => {
    try { return value?.edges ?? []; } catch { return []; }
  });
  const [selected, setSelected] = useState(null);
  const [connecting, setConnecting] = useState(null); // id of source node
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [shape, setShape] = useState('rect');
  const dragging = useRef(null);
  const svgRef = useRef(null);

  const emit = useCallback((n, e) => onChange?.({ nodes: n, edges: e }), [onChange]);

  const addNode = () => {
    const n = newNode(60 + Math.random() * 200, 60 + Math.random() * 120, 'New Node', shape);
    const next = [...nodes, n];
    setNodes(next); emit(next, edges);
  };

  const deleteSelected = () => {
    if (!selected) return;
    const nextNodes = nodes.filter(n => n.id !== selected);
    const nextEdges = edges.filter(e => e.from !== selected && e.to !== selected);
    setNodes(nextNodes); setEdges(nextEdges); setSelected(null);
    emit(nextNodes, nextEdges);
  };

  const startEdit = () => {
    if (!selected) return;
    const node = nodes.find(n => n.id === selected);
    if (node) { setEditingId(selected); setEditText(node.label); }
  };

  const commitEdit = () => {
    const next = nodes.map(n => n.id === editingId ? { ...n, label: editText } : n);
    setNodes(next); emit(next, edges); setEditingId(null);
  };

  const onDragStart = useCallback((e, id) => {
    const svg = svgRef.current.getBoundingClientRect();
    const node = nodes.find(n => n.id === id);
    dragging.current = { id, ox: e.clientX - svg.left - node.x, oy: e.clientY - svg.top - node.y };
  }, [nodes]);

  const onMouseMove = useCallback((e) => {
    if (!dragging.current) return;
    const svg = svgRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - svg.left - dragging.current.ox);
    const y = Math.max(0, e.clientY - svg.top - dragging.current.oy);
    const next = nodes.map(n => n.id === dragging.current.id ? { ...n, x, y } : n);
    setNodes(next);
  }, [nodes]);

  const onMouseUp = useCallback(() => {
    if (dragging.current) { emit(nodes, edges); dragging.current = null; }
  }, [nodes, edges, emit]);

  const onNodeClickForConnect = (id) => {
    if (!connecting) return;
    if (connecting === id) { setConnecting(null); return; }
    const exists = edges.some(e => e.from === connecting && e.to === id);
    if (!exists) {
      const nextEdges = [...edges, { id: crypto.randomUUID(), from: connecting, to: id }];
      setEdges(nextEdges); emit(nodes, nextEdges);
    }
    setConnecting(null);
  };

  const exportSVG = () => {
    const svg = svgRef.current;
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'diagram.svg'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ border: '1px solid var(--paper-border)', borderRadius: '10px', overflow: 'hidden', background: 'var(--surface)' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderBottom: '1px solid var(--paper-border)', flexWrap: 'wrap' }}>
        {/* Shape picker */}
        {[
          { s: 'rect',    Icon: Square  },
          { s: 'diamond', Icon: Diamond },
          { s: 'circle',  Icon: Circle  },
        ].map(({ s, Icon }) => (
          <button key={s} onClick={() => setShape(s)} title={s}
            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--paper-border)', background: shape === s ? 'var(--accent)' : 'transparent', color: shape === s ? '#fff' : 'var(--text-muted)', cursor: 'pointer' }}>
            <Icon size={14} />
          </button>
        ))}

        <div style={{ width: '1px', height: '20px', background: 'var(--paper-border)', margin: '0 2px' }} />

        <button onClick={addNode} title="Add node"
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--paper-border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}>
          <Plus size={13} /> Add Node
        </button>

        <button onClick={() => setConnecting(connecting ? null : selected)}
          title="Connect nodes — click source then destination"
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--paper-border)', background: connecting ? 'var(--accent)' : 'transparent', color: connecting ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}>
          <ArrowRight size={13} /> {connecting ? 'Click target…' : 'Connect'}
        </button>

        <button onClick={startEdit} disabled={!selected} title="Rename selected node"
          style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--paper-border)', background: 'transparent', color: 'var(--text-secondary)', cursor: selected ? 'pointer' : 'not-allowed', opacity: selected ? 1 : 0.4, fontSize: '12px' }}>
          Rename
        </button>

        <button onClick={deleteSelected} disabled={!selected} title="Delete selected"
          style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--paper-border)', background: 'transparent', color: selected ? 'var(--danger)' : 'var(--text-muted)', cursor: selected ? 'pointer' : 'not-allowed', opacity: selected ? 1 : 0.4 }}>
          <Trash2 size={13} />
        </button>

        <button onClick={exportSVG} title="Export as SVG" style={{ marginLeft: 'auto', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--paper-border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <Download size={13} />
        </button>
      </div>

      {/* Rename input */}
      {editingId && (
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--paper-border)', display: 'flex', gap: '8px' }}>
          <input
            autoFocus
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingId(null); }}
            style={{ flex: 1, padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--paper-border)', fontSize: '13px', background: 'var(--surface)', color: 'var(--text-primary)' }}
          />
          <button onClick={commitEdit} style={{ padding: '4px 12px', borderRadius: '6px', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px' }}>OK</button>
        </div>
      )}

      {/* Canvas */}
      <svg
        ref={svgRef}
        width="100%" height="320"
        style={{ display: 'block', cursor: connecting ? 'crosshair' : 'default' }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClick={() => { if (!connecting) setSelected(null); }}
      >
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#a08060" />
          </marker>
        </defs>

        {/* Grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--paper-border)" strokeWidth="0.5" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {edges.map(e => <Arrow key={e.id} from={e.from} to={e.to} nodes={nodes} />)}

        {nodes.map(n => (
          <g key={n.id} onClick={() => onNodeClickForConnect(n.id)}>
            <NodeShape
              node={n}
              selected={selected === n.id}
              onSelect={setSelected}
              onDragStart={onDragStart}
            />
          </g>
        ))}

        {nodes.length === 0 && (
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
            style={{ fontSize: '13px', fill: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
            Click "Add Node" to start building your diagram
          </text>
        )}
      </svg>

      <div style={{ padding: '6px 12px', borderTop: '1px solid var(--paper-border)', fontSize: '11px', color: 'var(--text-muted)' }}>
        Click node to select · Drag to move · Use Connect to draw arrows · Double-click node to rename
      </div>
    </div>
  );
}
