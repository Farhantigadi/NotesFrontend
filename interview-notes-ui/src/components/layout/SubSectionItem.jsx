import { useNavigate, useLocation } from 'react-router-dom';

export function SubSectionItem({ subSection }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === `/subsections/${subSection.id}`;

  return (
    <button
      onClick={() => navigate(`/subsections/${subSection.id}`)}
      style={{
        width: '100%', textAlign: 'left', padding: '5px 8px', borderRadius: '6px',
        fontSize: '13px', fontWeight: isActive ? 500 : 400,
        color: isActive ? '#92400e' : '#6b6b6b',
        background: isActive ? '#fef3c7' : 'transparent',
        border: 'none', cursor: 'pointer', display: 'block',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        marginBottom: '1px',
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f5f0e8'; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
    >
      {subSection.title}
    </button>
  );
}
