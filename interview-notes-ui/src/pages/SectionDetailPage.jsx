import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Edit2, Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Layout } from '../components/layout/Layout';
import { SubSectionDialog } from '../components/dialogs/SubSectionDialog';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useSection } from '../hooks/useSections';
import { useSubSectionsBySection, useCreateSubSection, useUpdateSubSection, useDeleteSubSection, useReorderSubSections } from '../hooks/useSubSections';
import { useEditMode } from '../contexts/EditModeContext';

export function SectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isEditMode } = useEditMode();
  const sectionId = Number(id);

  const { data: section, isLoading: sectionLoading } = useSection(sectionId);
  const { data: subSections, isLoading: subSectionsLoading } = useSubSectionsBySection(sectionId);
  const createMutation = useCreateSubSection();
  const updateMutation = useUpdateSubSection();
  const deleteMutation = useDeleteSubSection();
  const reorderMutation = useReorderSubSections(sectionId);

  const sortedSubSections = useMemo(() => {
    if (!subSections) return [];
    return [...subSections].sort((a, b) => {
      if (a.displayOrder == null && b.displayOrder == null) return 0;
      if (a.displayOrder == null) return 1;
      if (b.displayOrder == null) return -1;
      return a.displayOrder - b.displayOrder;
    });
  }, [subSections]);

  const handleMove = (index, direction) => {
    const list = [...sortedSubSections];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= list.length) return;
    const updates = list.map((s, i) => {
      let newOrder = i + 1;
      if (i === index) newOrder = swapIndex + 1;
      if (i === swapIndex) newOrder = index + 1;
      return { id: s.id, title: s.title, mainSectionId: s.mainSectionId, displayOrder: newOrder };
    });
    reorderMutation.mutate(updates);
  };

  const [editingId, setEditingId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

  const handleAddSubSection = () => { setEditingId(null); setIsDialogOpen(true); };
  const handleEditSubSection = (id) => { setEditingId(id); setIsDialogOpen(true); };
  const handleDeleteSubSection = (id) => setDeleteConfirm({ isOpen: true, id });

  const handleConfirmDelete = async () => {
    if (deleteConfirm.id) {
      await deleteMutation.mutateAsync(deleteConfirm.id);
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const handleFormSubmit = async (data) => {
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setIsDialogOpen(false);
  };

  if (sectionLoading) {
    return <Layout onAddSubSection={handleAddSubSection}><LoadingSpinner /></Layout>;
  }

  if (!section) {
    return <Layout><div className="text-center py-12"><p className="text-gray-600">Section not found</p></div></Layout>;
  }

  const editingSubSection = editingId ? subSections?.find((s) => s.id === editingId) : undefined;

  return (
    <Layout onAddSubSection={handleAddSubSection}>
      <div className="space-y-8">
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <button onClick={() => navigate('/sections')} className="hover:text-accent">Sections</button>
          <ChevronRight size={16} />
          <span>{section.title}</span>
        </div>

        <div>
          <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '36px', fontWeight: 700, color: '#242424', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            {section.title}
          </h1>
          {section.description && (
            <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '18px', lineHeight: 1.8, color: '#6b6b6b' }}>
              {section.description}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#a8a29e', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {subSections?.length || 0} Topics
            </p>
            {isEditMode && (
              <button onClick={handleAddSubSection} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90">
                <Plus size={18} /> Add Topic
              </button>
            )}
          </div>

          {subSectionsLoading ? (
            <LoadingSpinner />
          ) : subSections && subSections.length > 0 ? (
            <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sortedSubSections.map((subSection, index) => (
                <SubSectionItem
                  key={subSection.id}
                  subSection={subSection}
                  index={index}
                  total={sortedSubSections.length}
                  onNavigate={() => navigate(`/subsections/${subSection.id}`)}
                  onEdit={() => handleEditSubSection(subSection.id)}
                  onDelete={() => handleDeleteSubSection(subSection.id)}
                  onMoveUp={() => handleMove(index, -1)}
                  onMoveDown={() => handleMove(index, 1)}
                  isEditMode={isEditMode}
                  isReordering={reorderMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No topics yet</p>
            </div>
          )}
        </div>
      </div>

      <SubSectionDialog
        isOpen={isDialogOpen}
        subSection={editingSubSection}
        preselectedSectionId={sectionId}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Topic"
        message="Are you sure you want to delete this topic? All questions within it will also be deleted."
        confirmText="Delete"
        isDangerous
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
        isLoading={deleteMutation.isPending}
      />
    </Layout>
  );
}

function SubSectionItem({ subSection, index, total, onNavigate, onEdit, onDelete, onMoveUp, onMoveDown, isEditMode, isReordering }) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer', borderRadius: '8px', background: '#faf9f7', transition: 'background 0.15s' }}
      onClick={onNavigate}
      onMouseEnter={e => e.currentTarget.style.background = '#f0ede8'}
      onMouseLeave={e => e.currentTarget.style.background = '#faf9f7'}
    >
      <div style={{ flex: 1 }}>
        <h3 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '18px', fontWeight: 600, color: '#242424', marginBottom: subSection.description ? '4px' : 0 }}>
          {subSection.title}
        </h3>
        {subSection.description && (
          <p style={{ fontSize: '14px', color: '#6b6b6b', lineHeight: 1.5 }}>{subSection.description}</p>
        )}
      </div>
      {isEditMode && (
        <div style={{ display: 'flex', gap: '4px', marginLeft: '16px' }} onClick={e => e.stopPropagation()}>
          <button onClick={onMoveUp} disabled={index === 0 || isReordering}
            style={{ padding: '4px', color: '#a8a29e', background: 'none', border: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.3 : 1 }}
            onMouseEnter={e => { if (index !== 0) e.currentTarget.style.color = '#242424'; }}
            onMouseLeave={e => e.currentTarget.style.color = '#a8a29e'}>
            <ChevronUp size={15} />
          </button>
          <button onClick={onMoveDown} disabled={index === total - 1 || isReordering}
            style={{ padding: '4px', color: '#a8a29e', background: 'none', border: 'none', cursor: index === total - 1 ? 'not-allowed' : 'pointer', opacity: index === total - 1 ? 0.3 : 1 }}
            onMouseEnter={e => { if (index !== total - 1) e.currentTarget.style.color = '#242424'; }}
            onMouseLeave={e => e.currentTarget.style.color = '#a8a29e'}>
            <ChevronDown size={15} />
          </button>
          <button onClick={onEdit} style={{ padding: '6px', color: '#a8a29e', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px' }}
            onMouseEnter={e => e.currentTarget.style.color = '#242424'}
            onMouseLeave={e => e.currentTarget.style.color = '#a8a29e'}>
            <Edit2 size={15} />
          </button>
          <button onClick={onDelete} style={{ padding: '6px', color: '#a8a29e', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#a8a29e'}>
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
