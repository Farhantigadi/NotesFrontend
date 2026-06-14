import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export function CodeBlock({ code, language = 'javascript' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#282c34' }}>
      <div className="flex items-center justify-between px-4 py-2.5" style={{ background: '#21252b', borderBottom: '1px solid #3e4451' }}>
        <span className="text-xs font-medium tracking-widest uppercase" style={{ color: '#636d83', fontFamily: 'monospace' }}>
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: copied ? '#98c379' : '#636d83' }}
          title="Copy code"
        >
          {copied ? <><Check size={14} />Copied</> : <><Copy size={14} />Copy</>}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '1.25rem',
          fontSize: '14px',
          lineHeight: '1.75',
          background: '#282c34',
        }}
        showLineNumbers
        lineNumberStyle={{ color: '#4b5263', minWidth: '2.5em', userSelect: 'none' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
