import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Edit2, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { SubSectionDialog } from '../components/dialogs/SubSectionDialog';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useSection } from '../hooks/useSections';
import { useSubSectionsBySection, useCreateSubSection, useUpdateSubSection, useDeleteSubSection } from '../hooks/useSubSections';
import { useEditMode } from '../contexts/EditModeContext';

export function SectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isEditMode } = useEditMode();
  const sectionId = Number(id);

  const { data: section, isLoading: sectionLoading } = useSection(sectionId);
  const { data: subSections, isLoading: subSectionsLoading } = useSubSectionsBySection(sectionId);
  const createMutation = useCreateSubSection();
  const updateMutation = useUpdateSubSection(0);
  const deleteMutation = useDeleteSubSection();

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
      await updateMutation.mutateAsync(data);
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

        <div className="content-area-bg rounded-lg p-8 border border-gray-200">
          <h1 className="text-4xl font-bold text-accent mb-4">{section.title}</h1>
          {section.description && <p className="text-gray-700 text-lg leading-relaxed">{section.description}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Topics</h2>
            {isEditMode && (
              <button onClick={handleAddSubSection} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90">
                <Plus size={18} /> Add Topic
              </button>
            )}
          </div>

          {subSectionsLoading ? (
            <LoadingSpinner />
          ) : subSections && subSections.length > 0 ? (
            <div className="space-y-3">
              {subSections.map((subSection) => (
                <SubSectionItem
                  key={subSection.id}
                  subSection={subSection}
                  onNavigate={() => navigate(`/subsections/${subSection.id}`)}
                  onEdit={() => handleEditSubSection(subSection.id)}
                  onDelete={() => handleDeleteSubSection(subSection.id)}
                  isEditMode={isEditMode}
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

function SubSectionItem({ subSection, onNavigate, onEdit, onDelete, isEditMode }) {
  return (
    <button onClick={onNavigate} className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-accent group-hover:text-opacity-80 transition-colors">{subSection.title}</h3>
          {subSection.description && <p className="text-gray-600 text-sm mt-1 line-clamp-2">{subSection.description}</p>}
        </div>
        {isEditMode && (
          <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors" title="Edit"><Edit2 size={18} /></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete"><Trash2 size={18} /></button>
          </div>
        )}
      </div>
    </button>
  );
}
