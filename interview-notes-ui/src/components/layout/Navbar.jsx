import { BookOpen, LogOut } from 'lucide-react';
import { useEditMode } from '../../contexts/EditModeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function Navbar() {
  const { isEditMode, toggleEditMode } = useEditMode();
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;
    const onScroll = () => setScrolled(main.scrollTop > 10);
    main.addEventListener('scroll', onScroll);
    return () => main.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav style={{ background: scrolled ? 'rgba(245, 240, 232, 0.75)' : '#F5F0E8', backdropFilter: scrolled ? 'blur(12px)' : 'none', WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none', borderBottom: '1px solid #e8dfd0', transition: 'background 0.3s ease, backdrop-filter 0.3s ease' }} className="sticky top-0 z-40">
      <div className="flex items-center px-6 h-20 gap-4">

        {/* Logo */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5 flex-shrink-0">
          <BookOpen size={20} className="text-amber-800" />
          <span style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '18px', fontWeight: 700, color: '#242424', letterSpacing: '-0.01em' }}>
            Interview Notes
          </span>
        </button>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-4 flex-shrink-0">

          {/* Edit toggle */}
          <button
            onClick={toggleEditMode}
            className="flex items-center gap-2.5 select-none"
            title={isEditMode ? 'Exit edit mode' : 'Enter edit mode'}
          >
            <span style={{ fontSize: '13px', fontWeight: 500, color: isEditMode ? '#92400e' : '#6b7280' }}>Edit</span>
            <div style={{ width: '40px', height: '22px', borderRadius: '11px', background: isEditMode ? '#92400e' : '#d1d5db', position: 'relative', transition: 'background 0.2s ease' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: isEditMode ? '21px' : '3px', transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
          </button>

          {/* Divider */}
          <div style={{ width: '1px', height: '20px', background: '#e0dbd2' }} />

          {/* Username */}
          {username && (
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#3c3836' }}>{username}</span>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Sign out"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '7px', border: '1px solid #e0dbd2', background: 'none', color: '#6b7280', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.borderColor = '#fca5a5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#e0dbd2'; }}
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
