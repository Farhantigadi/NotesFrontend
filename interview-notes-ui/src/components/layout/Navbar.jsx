import { BookOpen } from 'lucide-react';
import { useEditMode } from '../../contexts/EditModeContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function Navbar() {
  const { isEditMode, toggleEditMode } = useEditMode();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;
    const onScroll = () => setScrolled(main.scrollTop > 10);
    main.addEventListener('scroll', onScroll);
    return () => main.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{ background: scrolled ? 'rgba(245, 240, 232, 0.75)' : '#F5F0E8', backdropFilter: scrolled ? 'blur(12px)' : 'none', WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none', borderBottom: '1px solid #e8dfd0', transition: 'background 0.3s ease, backdrop-filter 0.3s ease' }} className="sticky top-0 z-40">
      <div className="flex items-center px-6 h-20">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 flex-shrink-0"
        >
          <BookOpen size={20} className="text-amber-800" />
          <span style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '18px', fontWeight: 700, color: '#242424', letterSpacing: '-0.01em' }}>
            Interview Notes
          </span>
        </button>

        <button
          onClick={toggleEditMode}
          className="ml-auto flex items-center gap-2.5 flex-shrink-0 select-none"
          title={isEditMode ? 'Exit edit mode' : 'Enter edit mode'}
        >
          <span style={{ fontSize: '13px', fontWeight: 500, color: isEditMode ? '#92400e' : '#6b7280' }}>
            Edit
          </span>
          <div style={{ width: '40px', height: '22px', borderRadius: '11px', background: isEditMode ? '#92400e' : '#d1d5db', position: 'relative', transition: 'background 0.2s ease', flexShrink: 0 }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: isEditMode ? '21px' : '3px', transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          </div>
        </button>
      </div>
    </nav>
  );
}
