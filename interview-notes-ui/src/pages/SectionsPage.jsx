import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Plus } from 'lucide-react';
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

  const [editingId, setEditingId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [debugInfo, setDebugInfo] = useState({ formData: null, apiResponse: null, apiError: null });

  const handleAddSection = () => { setEditingId(null); setIsDialogOpen(true); };
  const handleEditSection = (id) => { setEditingId(id); setIsDialogOpen(true); };
  const handleDeleteSection = (id) => setDeleteConfirm({ isOpen: true, id });

  const handleConfirmDelete = async () => {
    if (deleteConfirm.id) {
      await deleteMutation.mutateAsync(deleteConfirm.id);
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const handleFormSubmit = async (data) => {
    console.log('[SECTION] Form Data:', data);
    setDebugInfo(prev => ({ ...prev, formData: data, apiResponse: null, apiError: null }));
    try {
      if (editingId) {
        console.log('[SECTION] Starting update mutation for id:', editingId);
        const response = await updateMutation.mutateAsync({ id: editingId, data });
        setDebugInfo(prev => ({ ...prev, apiResponse: response }));
      } else {
        console.log('[SECTION] Starting create mutation');
        const response = await createMutation.mutateAsync(data);
        setDebugInfo(prev => ({ ...prev, apiResponse: response }));
      }
      setIsDialogOpen(false);
    } catch (err) {
      console.error('[SECTION] API Error:', err);
      setDebugInfo(prev => ({ ...prev, apiError: err.message }));
    }
  };

  if (isLoading) {
    return <Layout onAddSection={handleAddSection}><LoadingSpinner /></Layout>;
  }

  const editingSection = editingId ? sections?.find((s) => s.id === editingId) : undefined;

  return (
    <Layout onAddSection={handleAddSection}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sections</h1>
          <p className="text-gray-600">Organize your interview knowledge by topic</p>
        </div>

        {sections && sections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No sections yet. Create one to get started!</p>
            {isEditMode && (
              <button onClick={handleAddSection} className="inline-flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90">
                <Plus size={18} /> Create First Section
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
        message="Are you sure you want to delete this section? All subsections and questions within it will also be deleted."
        confirmText="Delete"
        isDangerous
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
        isLoading={deleteMutation.isPending}
      />

      {/* DEBUG PANEL */}
      {(debugInfo.formData || debugInfo.apiResponse || debugInfo.apiError) && (
        <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999, background: '#1e1e1e', color: '#d4d4d4', padding: '12px 16px', borderRadius: 8, fontSize: 12, maxWidth: 380, fontFamily: 'monospace', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
          <div style={{ fontWeight: 700, marginBottom: 6, color: '#ffd700' }}>🐛 Section Debug Panel</div>
          {debugInfo.formData && (
            <div style={{ marginBottom: 6 }}>
              <span style={{ color: '#9cdcfe' }}>Form Data:</span>{' '}
              <span>{JSON.stringify(debugInfo.formData)}</span>
            </div>
          )}
          <div style={{ marginBottom: 6 }}>
            <span style={{ color: '#9cdcfe' }}>Mutation Status:</span>{' '}
            <span style={{ color: createMutation.isPending ? '#ffd700' : createMutation.isError ? '#f48771' : createMutation.isSuccess ? '#89d185' : '#888' }}>
              {createMutation.isPending ? 'pending' : createMutation.isError ? 'error' : createMutation.isSuccess ? 'success' : 'idle'}
            </span>
          </div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ color: '#9cdcfe' }}>Loading:</span>{' '}
            <span>{String(createMutation.isPending)}</span>
          </div>
          {debugInfo.apiError && (
            <div style={{ marginBottom: 6 }}>
              <span style={{ color: '#f48771' }}>Error:</span>{' '}
              <span style={{ color: '#f48771' }}>{debugInfo.apiError}</span>
            </div>
          )}
          {debugInfo.apiResponse && (
            <div>
              <span style={{ color: '#89d185' }}>Response:</span>{' '}
              <span>{JSON.stringify(debugInfo.apiResponse)}</span>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

function SectionCard({ section, onNavigate, onEdit, onDelete, isEditMode }) {
  const { data: subSections } = useSubSectionsBySection(section.id);
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <button onClick={onNavigate} className="flex-1 text-left">
          <h3 className="text-lg font-semibold text-accent hover:text-opacity-80 transition-colors">{section.title}</h3>
        </button>
        {isEditMode && (
          <div className="flex gap-2 ml-4">
            <button onClick={onEdit} className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors" title="Edit"><Edit2 size={18} /></button>
            <button onClick={onDelete} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete"><Trash2 size={18} /></button>
          </div>
        )}
      </div>
      {section.description && <p className="text-gray-600 text-sm mb-3 line-clamp-2">{section.description}</p>}
      <div className="text-xs text-gray-500">
        {subSections?.length || 0} subsection{(subSections?.length || 0) !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
