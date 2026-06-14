import { useRef, useState } from 'react';
import { Upload, X, ZoomIn, ZoomOut } from 'lucide-react';

export function ImageUploader({ value, onChange }) {
  const inputRef = useRef(null);
  const [width, setWidth]   = useState(value?.width  ?? 100);
  const [height, setHeight] = useState(value?.height ?? 'auto');
  const [lockAspect, setLockAspect] = useState(true);
  const naturalSize = useRef({ w: 0, h: 0 });

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target.result;
      // Get natural dimensions
      const img = new Image();
      img.onload = () => {
        naturalSize.current = { w: img.naturalWidth, h: img.naturalHeight };
        const w = Math.min(img.naturalWidth, 600);
        const h = lockAspect ? Math.round(w * img.naturalHeight / img.naturalWidth) : img.naturalHeight;
        setWidth(w); setHeight(h);
        onChange?.({ src, width: w, height: h });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleWidth = (w) => {
    const parsed = Math.max(40, Math.min(1200, Number(w)));
    setWidth(parsed);
    if (lockAspect && naturalSize.current.w) {
      const h = Math.round(parsed * naturalSize.current.h / naturalSize.current.w);
      setHeight(h);
      onChange?.({ ...value, width: parsed, height: h });
    } else {
      onChange?.({ ...value, width: parsed, height });
    }
  };

  const handleHeight = (h) => {
    const parsed = Math.max(20, Math.min(1200, Number(h)));
    setHeight(parsed);
    onChange?.({ ...value, width, height: parsed });
  };

  const clear = () => { onChange?.(null); setWidth(100); setHeight('auto'); inputRef.current.value = ''; };

  return (
    <div style={{ border: '1px solid var(--paper-border)', borderRadius: '10px', overflow: 'hidden', background: 'var(--surface)' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderBottom: '1px solid var(--paper-border)', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => inputRef.current.click()}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '6px', border: '1px solid var(--paper-border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}
        >
          <Upload size={13} /> {value?.src ? 'Replace Image' : 'Upload Image'}
        </button>

        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />

        {value?.src && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>W</span>
              <input
                type="number" value={width} min={40} max={1200}
                onChange={e => handleWidth(e.target.value)}
                style={{ width: '64px', padding: '3px 6px', borderRadius: '5px', border: '1px solid var(--paper-border)', fontSize: '12px', background: 'var(--surface)', color: 'var(--text-primary)' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>px</span>
            </div>

            <button
              type="button"
              onClick={() => setLockAspect(l => !l)}
              title={lockAspect ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
              style={{ padding: '3px 6px', borderRadius: '5px', border: '1px solid var(--paper-border)', background: lockAspect ? 'var(--accent)' : 'transparent', color: lockAspect ? '#fff' : 'var(--text-muted)', cursor: 'pointer', fontSize: '11px' }}
            >
              {lockAspect ? '🔒' : '🔓'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>H</span>
              <input
                type="number" value={height} min={20} max={1200}
                disabled={lockAspect}
                onChange={e => handleHeight(e.target.value)}
                style={{ width: '64px', padding: '3px 6px', borderRadius: '5px', border: '1px solid var(--paper-border)', fontSize: '12px', background: lockAspect ? 'var(--paper-subtle)' : 'var(--surface)', color: 'var(--text-primary)', opacity: lockAspect ? 0.6 : 1 }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>px</span>
            </div>

            <div style={{ display: 'flex', gap: '4px', marginLeft: '4px' }}>
              <button type="button" onClick={() => handleWidth(Math.round(width * 0.8))} title="Zoom out" style={{ padding: '3px 6px', borderRadius: '5px', border: '1px solid var(--paper-border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}><ZoomOut size={13} /></button>
              <button type="button" onClick={() => handleWidth(Math.round(width * 1.25))} title="Zoom in" style={{ padding: '3px 6px', borderRadius: '5px', border: '1px solid var(--paper-border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}><ZoomIn size={13} /></button>
            </div>

            <button type="button" onClick={clear} title="Remove image" style={{ marginLeft: 'auto', padding: '3px 6px', borderRadius: '5px', border: '1px solid var(--paper-border)', background: 'transparent', color: 'var(--danger)', cursor: 'pointer' }}>
              <X size={13} />
            </button>
          </>
        )}
      </div>

      {/* Preview */}
      <div style={{ padding: '16px', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {value?.src ? (
          <img
            src={value.src}
            alt="uploaded"
            style={{ width: `${width}px`, height: `${height}px`, objectFit: 'contain', borderRadius: '6px', display: 'block' }}
          />
        ) : (
          <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', cursor: 'pointer' }}
            onClick={() => inputRef.current.click()}
          >
            <Upload size={24} style={{ opacity: 0.4 }} />
            <span style={{ fontSize: '12px' }}>Click to upload an image</span>
          </div>
        )}
      </div>
    </div>
  );
}
