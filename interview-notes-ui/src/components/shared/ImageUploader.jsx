import { useRef, useState } from 'react';
import { Upload, X, AlignLeft, AlignCenter, AlignRight, Link } from 'lucide-react';

const PRESETS = [
  { label: 'S', value: 25 },
  { label: 'M', value: 50 },
  { label: 'L', value: 75 },
  { label: 'Full', value: 100 },
];

const ALIGNMENTS = [
  { value: 'left',   Icon: AlignLeft },
  { value: 'center', Icon: AlignCenter },
  { value: 'right',  Icon: AlignRight },
];

export function ImageUploader({ value, onFileChange, onUrlChange, onDelete, isDeleting, settings, onSettingsChange }) {
  const inputRef = useRef(null);
  const [width, setWidth]     = useState(settings?.width ?? 100);
  const [align, setAlign]     = useState(settings?.align ?? 'center');
  const [tab, setTab]         = useState('upload');
  const [urlInput, setUrlInput] = useState('');

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileChange?.(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleUrlApply = () => {
    if (!urlInput.trim()) return;
    onUrlChange?.(urlInput.trim());
    setUrlInput('');
  };

  const updateWidth = (w) => {
    setWidth(w);
    onSettingsChange?.({ width: w, align });
  };

  const updateAlign = (a) => {
    setAlign(a);
    onSettingsChange?.({ width, align: a });
  };

  const justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end' };

  return (
    <div style={{ border: '1px solid #e0dbd2', borderRadius: '10px', overflow: 'hidden', background: '#faf9f7' }}>

      {/* Toolbar row 1 — tabs + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderBottom: '1px solid #e0dbd2' }}>

        {/* Tab toggle */}
        <div style={{ display: 'flex', gap: '3px', background: '#f0ede8', borderRadius: '7px', padding: '3px' }}>
          {[{ id: 'upload', label: 'Upload' }, { id: 'url', label: 'URL' }].map(t => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              style={{ padding: '4px 12px', borderRadius: '5px', border: 'none', background: tab === t.id ? '#fff' : 'transparent', color: tab === t.id ? '#3c3836' : '#a8a29e', fontSize: '12px', fontWeight: tab === t.id ? 600 : 400, cursor: 'pointer', boxShadow: tab === t.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'upload' && (
          <button type="button" onClick={() => inputRef.current.click()}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '6px', border: '1px solid #e0dbd2', background: '#fff', color: '#3c3836', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f0e8'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            <Upload size={13} /> {value?.src ? 'Replace' : 'Upload Image'}
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />

        {value?.src && (
          <button type="button" onClick={onDelete} disabled={isDeleting}
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '6px', border: '1px solid #fca5a5', background: 'transparent', color: '#ef4444', cursor: isDeleting ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 500, opacity: isDeleting ? 0.6 : 1 }}
            onMouseEnter={e => { if (!isDeleting) e.currentTarget.style.background = '#fef2f2'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <X size={12} /> {isDeleting ? 'Deleting...' : 'Delete Image'}
          </button>
        )}
      </div>

      {/* URL input row */}
      {tab === 'url' && (
        <div style={{ display: 'flex', gap: '8px', padding: '10px 12px', borderBottom: '1px solid #e0dbd2', background: '#fff' }}>
          <input
            type="text"
            placeholder="Paste image URL here..."
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleUrlApply()}
            style={{ flex: 1, padding: '7px 12px', border: '1px solid #e0dbd2', borderRadius: '6px', fontSize: '13px', color: '#1c1c1c', outline: 'none', fontFamily: 'inherit' }}
          />
          <button type="button" onClick={handleUrlApply}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '6px', border: 'none', background: '#92400e', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
            onMouseEnter={e => e.currentTarget.style.background = '#78350f'}
            onMouseLeave={e => e.currentTarget.style.background = '#92400e'}
          >
            <Link size={13} /> Apply
          </button>
        </div>
      )}

      {/* Toolbar row 2 — size + alignment (only when image exists) */}
      {value?.src && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '8px 12px', borderBottom: '1px solid #e0dbd2', background: '#fff', flexWrap: 'wrap' }}>

          {/* Size presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#a8a29e', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Size</span>
            <div style={{ display: 'flex', gap: '3px' }}>
              {PRESETS.map(p => (
                <button key={p.value} type="button" onClick={() => updateWidth(p.value)}
                  style={{ padding: '3px 8px', borderRadius: '5px', border: `1px solid ${width === p.value ? '#92400e' : '#e0dbd2'}`, background: width === p.value ? '#92400e' : 'transparent', color: width === p.value ? '#fff' : '#6b6b6b', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '140px' }}>
            <input type="range" min={10} max={100} value={width}
              onChange={e => updateWidth(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#92400e', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#3c3836', minWidth: '36px' }}>{width}%</span>
          </div>

          {/* Alignment */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#a8a29e', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Align</span>
            <div style={{ display: 'flex', gap: '3px' }}>
              {ALIGNMENTS.map(({ value: a, Icon }) => (
                <button key={a} type="button" onClick={() => updateAlign(a)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '5px', border: `1px solid ${align === a ? '#92400e' : '#e0dbd2'}`, background: align === a ? '#92400e' : 'transparent', color: align === a ? '#fff' : '#6b6b6b', cursor: 'pointer' }}
                >
                  <Icon size={13} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      <div style={{ padding: '20px', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: value?.src ? justifyMap[align] : 'center' }}>
        {value?.src ? (
          <img src={value.src} alt="uploaded"
            style={{ width: `${width}%`, objectFit: 'contain', borderRadius: '6px', display: 'block' }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#a8a29e', cursor: 'pointer' }}
            onClick={() => inputRef.current.click()}
          >
            <Upload size={28} style={{ opacity: 0.35 }} />
            <span style={{ fontSize: '13px' }}>Click to upload an image</span>
            <span style={{ fontSize: '11px', color: '#c4b5a5' }}>PNG, JPG, GIF up to 10MB</span>
          </div>
        )}
      </div>
    </div>
  );
}
