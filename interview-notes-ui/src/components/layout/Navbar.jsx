import { BookOpen } from 'lucide-react';
import { useEditMode } from '../../contexts/EditModeContext';
import { SearchBar } from '../shared/SearchBar';
import { useNavigate } from 'react-router-dom';

export function Navbar({ onSearch }) {
  const { isEditMode, toggleEditMode } = useEditMode();
  const navigate = useNavigate();

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #e8e8e8' }} className="sticky top-0 z-40">
      <div className="flex items-center gap-6 px-6 h-14">
        {/* Logo — click goes home */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 flex-shrink-0 group"
        >
          <BookOpen size={20} className="text-amber-800" />
          <span style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '18px', fontWeight: 700, color: '#242424', letterSpacing: '-0.01em' }}>
            Interview Notes
          </span>
        </button>

        <div className="flex-1 max-w-lg">
          <SearchBar onSearch={onSearch} placeholder="Search questions, answers, code..." />
        </div>

        {/* Toggle switch edit button */}
        <button
          onClick={toggleEditMode}
          className="ml-auto flex items-center gap-2.5 flex-shrink-0 select-none"
          title={isEditMode ? 'Exit edit mode' : 'Enter edit mode'}
        >
          <span style={{ fontSize: '13px', fontWeight: 500, color: isEditMode ? '#92400e' : '#6b7280' }}>
            Edit
          </span>
          {/* Toggle track */}
          <div
            style={{
              width: '40px', height: '22px', borderRadius: '11px',
              background: isEditMode ? '#92400e' : '#d1d5db',
              position: 'relative', transition: 'background 0.2s ease',
              flexShrink: 0,
            }}
          >
            {/* Toggle thumb */}
            <div
              style={{
                width: '16px', height: '16px', borderRadius: '50%',
                background: '#fff',
                position: 'absolute', top: '3px',
                left: isEditMode ? '21px' : '3px',
                transition: 'left 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
            />
          </div>
        </button>
      </div>
    </nav>
  );
}
