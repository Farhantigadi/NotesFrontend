import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Plus, BookOpen } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { SectionDialog } from '../components/dialogs/SectionDialog';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useSections, useCreateSection, useUpdateSection, useDeleteSection } from '../hooks/useSections';
import { useSubSectionsBySection } from '../hooks/useSubSections';
import { useEditMode } from '../contexts/EditModeContext';

export function SectionsPage() {
  const navigate = useNavigate();
  const { isEditMode } = useEditMode();
  const { data: sections, isLoading } = useSections();
  const createMutation = useCreateSection();
  const updateMutation = useUpdateSection();
  const deleteMutation = useDeleteSection();

  const [editingId, setEditingId]     = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

  const handleAddSection    = () => { setEditingId(null); setIsDialogOpen(true); };
  const handleEditSection   = (id) => { setEditingId(id); setIsDialogOpen(true); };
  const handleDeleteSection = (id) => setDeleteConfirm({ isOpen: true, id });

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

  if (isLoading) return <Layout><LoadingSpinner /></Layout>;

  const editingSection = editingId ? sections?.find((s) => s.id === editingId) : undefined;

  return (
    <Layout>
      <div style={{ maxWidth: '850px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: "'Source Serif Pro', Georgia, Cambria, serif", fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Study Sections
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Select a topic to begin your interview preparation.
          </p>
        </div>

        {sections && sections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                onNavigate={() => navigate(`/sections/${section.id}`)}
                onEdit={() => handleEditSection(section.id)}
                onDelete={() => handleDeleteSection(section.id)}
                isEditMode={isEditMode}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <BookOpen size={32} style={{ margin: '0 auto 16px', opacity: 0.2, color: 'var(--text-muted)', display: 'block' }} />
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '16px' }}>No sections yet.</p>
            {isEditMode && (
              <button onClick={handleAddSection} className="btn-primary">
                <Plus size={15} /> Create First Section
              </button>
            )}
          </div>
        )}
      </div>

      <SectionDialog
        isOpen={isDialogOpen}
        section={editingSection}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Section"
        message="This will permanently delete the section and all its topics and questions."
        confirmText="Delete"
        isDangerous
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
        isLoading={deleteMutation.isPending}
      />
    </Layout>
  );
}

function SectionCard({ section, onNavigate, onEdit, onDelete, isEditMode }) {
  const { data: subSections } = useSubSectionsBySection(section.id);

  return (
    <div
      className="card"
      style={{ padding: '18px 20px', cursor: 'pointer', transition: 'border-color 0.15s' }}
      onClick={onNavigate}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-muted)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--paper-border)'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: section.description ? '5px' : '10px' }}>
            {section.title}
          </h3>
          {section.description && (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {section.description}
            </p>
          )}
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {subSections?.length || 0} topic{(subSections?.length || 0) !== 1 ? 's' : ''}
          </p>
        </div>

        {isEditMode && (
          <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <button onClick={onEdit} className="btn-ghost" style={{ padding: '6px' }} title="Edit section">
              <Edit2 size={14} />
            </button>
            <button onClick={onDelete} className="btn-ghost" style={{ padding: '6px', color: 'var(--danger)' }} title="Delete section">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
