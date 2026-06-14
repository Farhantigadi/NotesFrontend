import { useNavigate, useLocation } from 'react-router-dom';
import { useEditMode } from '../../contexts/EditModeContext';
import { useSubSectionsBySection } from '../../hooks/useSubSections';
import { ChevronDown, ChevronRight, ChevronUp, Plus } from 'lucide-react';
import { SubSectionItem } from './SubSectionItem';

export function SectionItem({ section, index, total, isExpanded, onToggle, onAddSubSection, onMoveUp, onMoveDown, isReordering, isActive }) {
  const navigate = useNavigate();
  const { isEditMode } = useEditMode();
  const { data: subSections } = useSubSectionsBySection(section.id);

  return (
    <div style={{ marginBottom: '2px' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', borderRadius: '7px', background: isActive ? '#d9cfc3' : 'transparent', padding: '1px 4px 1px 0' }}
        className="group"
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#cfc4b8'; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
      >
        <button
          onClick={onToggle}
          style={{ padding: '6px', color: '#a8a29e', flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button>

        <button
          onClick={() => navigate(`/sections/${section.id}`)}
          style={{ flex: 1, textAlign: 'left', padding: '6px 0', fontSize: '13.5px', fontWeight: isActive ? 600 : 500, color: isActive ? '#92400e' : '#3c3836', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {section.title}
        </button>

        {isEditMode && (
          <div style={{ display: 'flex', gap: '1px', marginLeft: '2px' }} onClick={e => e.stopPropagation()}>
            <button onClick={onMoveUp} disabled={index === 0 || isReordering}
              style={{ padding: '3px', color: '#a8a29e', background: 'none', border: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.3 : 1, borderRadius: '4px', display: 'flex' }}
              onMouseEnter={e => { if (index !== 0) e.currentTarget.style.color = '#92400e'; }}
              onMouseLeave={e => e.currentTarget.style.color = '#a8a29e'}>
              <ChevronUp size={11} />
            </button>
            <button onClick={onMoveDown} disabled={index === total - 1 || isReordering}
              style={{ padding: '3px', color: '#a8a29e', background: 'none', border: 'none', cursor: index === total - 1 ? 'not-allowed' : 'pointer', opacity: index === total - 1 ? 0.3 : 1, borderRadius: '4px', display: 'flex' }}
              onMouseEnter={e => { if (index !== total - 1) e.currentTarget.style.color = '#92400e'; }}
              onMouseLeave={e => e.currentTarget.style.color = '#a8a29e'}>
              <ChevronDown size={11} />
            </button>
            <button
              onClick={() => onAddSubSection?.(section.id)}
              title="Add subsection"
              className="group-hover:opacity-100"
              style={{ padding: '4px', color: '#a8a29e', background: 'none', border: 'none', cursor: 'pointer', opacity: 0, flexShrink: 0, borderRadius: '4px' }}
              onMouseEnter={e => e.currentTarget.style.color = '#92400e'}
              onMouseLeave={e => e.currentTarget.style.color = '#a8a29e'}
            >
              <Plus size={12} />
            </button>
          </div>
        )}
      </div>

      {isExpanded && subSections?.length > 0 && (
        <div style={{ position: 'relative', marginLeft: '20px', marginTop: '1px', marginBottom: '4px' }}>
          {subSections.map((sub, i) => (
            <div key={sub.id} style={{ position: 'relative', paddingLeft: '16px' }}>
              {/* Vertical line — stop at mid of last item */}
              {i < subSections.length - 1 && (
                <div style={{
                  position: 'absolute', left: 0, top: 0,
                  width: '1.5px', height: '100%',
                  background: '#d6d0c8',
                }} />
              )}
              {/* L-shaped curve using border-radius */}
              <div style={{
                position: 'absolute', left: 0, top: 0,
                width: '10px', height: '13px',
                borderLeft: '1.5px solid #d6d0c8',
                borderBottom: '1.5px solid #d6d0c8',
                borderBottomLeftRadius: '6px',
                background: 'transparent',
              }} />
              <SubSectionItem subSection={sub} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
