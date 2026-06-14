import { useState, useMemo } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSections, useCreateSection, useReorderSections } from '../../hooks/useSections';
import { useEditMode } from '../../contexts/EditModeContext';
import { SectionItem } from './SectionItem';
import { SectionDialog } from '../dialogs/SectionDialog';

export function Sidebar({ onAddSubSection }) {
  const { isEditMode } = useEditMode();
  const { data: sections, isLoading } = useSections();
  const createMutation = useCreateSection();
  const reorderMutation = useReorderSections();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFormSubmit = async (data) => {
    await createMutation.mutateAsync(data);
    setIsDialogOpen(false);
  };

  const sortedSections = useMemo(() => {
    if (!sections) return [];
    return [...sections].sort((a, b) => {
      if (a.displayOrder == null && b.displayOrder == null) return 0;
      if (a.displayOrder == null) return 1;
      if (b.displayOrder == null) return -1;
      return a.displayOrder - b.displayOrder;
    });
  }, [sections]);

  const handleMove = (index, direction) => {
    const list = [...sortedSections];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= list.length) return;
    const updates = list.map((s, i) => {
      let newOrder = i + 1;
      if (i === index) newOrder = swapIndex + 1;
      if (i === swapIndex) newOrder = index + 1;
      return { id: s.id, title: s.title, displayOrder: newOrder };
    });
    reorderMutation.mutate(updates);
  };

  const toggleSection = (sectionId) => {
    const next = new Set(expandedSections);
    next.has(sectionId) ? next.delete(sectionId) : next.add(sectionId);
    setExpandedSections(next);
  };

  return (
    <>
      <aside style={{ width: '240px', background: '#EDE8DF', borderRight: '1px solid #e8dfd0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>

        {isEditMode && (
          <button
            onClick={() => setIsDialogOpen(true)}
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
            {sortedSections.map((section, index) => (
              <SectionItem
                key={section.id}
                section={section}
                index={index}
                total={sortedSections.length}
                isExpanded={expandedSections.has(section.id)}
                onToggle={() => toggleSection(section.id)}
                onAddSubSection={onAddSubSection}
                onMoveUp={() => handleMove(index, -1)}
                onMoveDown={() => handleMove(index, 1)}
                isReordering={reorderMutation.isPending}
                isActive={location.pathname === `/sections/${section.id}`}
              />
            ))}
          </div>
        )}
      </div>
      </aside>

      <SectionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending}
      />
    </>
  );
}
