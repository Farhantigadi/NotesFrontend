import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const BG = '#1e1e2e';
const HEADER_BG = '#181825';
const BORDER = '#313244';

export function CodeBlock({ code, language = 'javascript', maxLines, onToggle, expanded }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalLines = code.split('\n').length;
  const hasMore = totalLines > 7;
  const isTruncated = hasMore && maxLines != null;
  const displayCode = isTruncated ? code.split('\n').slice(0, maxLines).join('\n') : code;

  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${BORDER}`, background: BG, boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: HEADER_BG, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', display: 'block' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e', display: 'block' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840', display: 'block' }} />
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6c7086' }}>
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: copied ? '#a6e3a1' : '#6c7086', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
          onMouseEnter={e => { if (!copied) e.currentTarget.style.color = '#cdd6f4'; }}
          onMouseLeave={e => { if (!copied) e.currentTarget.style.color = '#6c7086'; }}
        >
          {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
        </button>
      </div>

      {/* Code + fade overlay */}
      <div style={{ position: 'relative' }}>
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{ margin: 0, padding: '20px 20px 20px 0', fontSize: '14px', lineHeight: '1.8', background: BG }}
          showLineNumbers
          lineNumberStyle={{ color: '#45475a', minWidth: '3em', paddingRight: '16px', userSelect: 'none', textAlign: 'right' }}
        >
          {displayCode}
        </SyntaxHighlighter>

        {isTruncated && !expanded && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0', borderTop: `1px solid ${BORDER}`, background: HEADER_BG }}>
            <button
              onClick={onToggle}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#6c7086', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}
              onMouseEnter={e => e.currentTarget.style.color = '#cdd6f4'}
              onMouseLeave={e => e.currentTarget.style.color = '#6c7086'}
            >
              <span>Show more</span>
              <ChevronDown size={13} />
 
            </button>
          </div>
        )}

        {!isTruncated && expanded && onToggle && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0', borderTop: `1px solid ${BORDER}`, background: HEADER_BG }}>
            <button
              onClick={onToggle}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer', color: '#6c7086', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}
              onMouseEnter={e => e.currentTarget.style.color = '#cdd6f4'}
              onMouseLeave={e => e.currentTarget.style.color = '#6c7086'}
            > 
              <span>Show less ⏶</span>
 
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
