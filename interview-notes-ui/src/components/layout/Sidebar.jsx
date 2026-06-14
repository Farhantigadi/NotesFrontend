import { useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSections } from '../../hooks/useSections';
import { useEditMode } from '../../contexts/EditModeContext';
import { SectionItem } from './SectionItem';

export function Sidebar({ onAddSection, onAddSubSection }) {
  const { isEditMode } = useEditMode();
  const { data: sections, isLoading } = useSections();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState(new Set());

  const toggleSection = (sectionId) => {
    const next = new Set(expandedSections);
    next.has(sectionId) ? next.delete(sectionId) : next.add(sectionId);
    setExpandedSections(next);
  };

  return (
    <aside style={{ width: '240px', background: '#fafaf9', borderRight: '1px solid #f0ede8', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>

        {isEditMode && (
          <button
            onClick={onAddSection}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '7px 12px', marginBottom: '12px', background: '#92400e', color: '#fff', fontSize: '13px', fontWeight: 500, borderRadius: '8px', border: 'none', cursor: 'pointer' }}
          >
            <Plus size={14} /> New Section
          </button>
        )}

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: '28px', background: '#e8e5e0', borderRadius: '6px' }} />
            ))}
          </div>
        ) : !sections?.length ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#a8a29e', fontSize: '13px' }}>
            <BookOpen size={20} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
            No sections yet
          </div>
        ) : (
          <div>
            {sections.map(section => (
              <SectionItem
                key={section.id}
                section={section}
                isExpanded={expandedSections.has(section.id)}
                onToggle={() => toggleSection(section.id)}
                onAddSubSection={onAddSubSection}
                isActive={location.pathname === `/sections/${section.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
