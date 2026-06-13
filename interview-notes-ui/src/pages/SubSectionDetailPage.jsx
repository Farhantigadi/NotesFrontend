import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Edit2, Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { QuestionDialog } from '../components/dialogs/QuestionDialog';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useSubSection } from '../hooks/useSubSections';
import { useQuestionsBySubSection, useCreateQuestion, useUpdateQuestion, useDeleteQuestion } from '../hooks/useQuestions';
import { useEditMode } from '../contexts/EditModeContext';

export function SubSectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isEditMode } = useEditMode();
  const subSectionId = Number(id);

  const { data: subSection, isLoading: subSectionLoading } = useSubSection(subSectionId);
  const { data: questions, isLoading: questionsLoading } = useQuestionsBySubSection(subSectionId);
  const createMutation = useCreateQuestion();
  const updateMutation = useUpdateQuestion(0);
  const deleteMutation = useDeleteQuestion();

  const [editingId, setEditingId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [questionOrder, setQuestionOrder] = useState([]);

  const handleAddQuestion = () => { setEditingId(null); setIsDialogOpen(true); };
  const handleEditQuestion = (id) => { setEditingId(id); setIsDialogOpen(true); };
  const handleDeleteQuestion = (id) => setDeleteConfirm({ isOpen: true, id });

  const handleMoveUp = (index) => {
    if (index > 0) {
      const newOrder = [...questionOrder];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      setQuestionOrder(newOrder);
    }
  };

  const handleMoveDown = (index) => {
    if (index < questionOrder.length - 1) {
      const newOrder = [...questionOrder];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      setQuestionOrder(newOrder);
    }
  };

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

  if (subSectionLoading) {
    return <Layout><LoadingSpinner /></Layout>;
  }

  if (!subSection) {
    return <Layout><div className="text-center py-12"><p className="text-gray-600">SubSection not found</p></div></Layout>;
  }

  const orderedQuestions = questionOrder.length > 0
    ? questionOrder.map((id) => questions?.find((q) => q.id === id))
    : questions;

  const editingQuestion = editingId ? questions?.find((q) => q.id === editingId) : undefined;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <button onClick={() => navigate('/sections')} className="hover:text-accent">Sections</button>
          <ChevronRight size={16} />
          <button onClick={() => navigate(`/sections/${subSection.mainSectionId}`)} className="hover:text-accent">
            {subSection.mainSectionTitle}
          </button>
          <ChevronRight size={16} />
          <span>{subSection.title}</span>
        </div>

        <div className="content-area-bg rounded-lg p-8 border border-gray-200">
          <h1 className="text-4xl font-bold text-accent mb-4">{subSection.title}</h1>
          {subSection.description && <p className="text-gray-700 text-lg leading-relaxed">{subSection.description}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Questions ({questions?.length || 0})</h2>
            {isEditMode && (
              <button onClick={handleAddQuestion} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90">
                <Plus size={18} /> Add Question
              </button>
            )}
          </div>

          {questionsLoading ? (
            <LoadingSpinner />
          ) : orderedQuestions && orderedQuestions.length > 0 ? (
            <div className="space-y-3">
              {orderedQuestions.map((question, index) => (
                question && (
                  <QuestionItem
                    key={question.id}
                    question={question}
                    index={index}
                    total={orderedQuestions.length}
                    onNavigate={() => navigate(`/questions/${question.id}`)}
                    onEdit={() => handleEditQuestion(question.id)}
                    onDelete={() => handleDeleteQuestion(question.id)}
                    onMoveUp={() => handleMoveUp(index)}
                    onMoveDown={() => handleMoveDown(index)}
                    isEditMode={isEditMode}
                  />
                )
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No questions yet</p>
            </div>
          )}
        </div>
      </div>

      <QuestionDialog
        isOpen={isDialogOpen}
        question={editingQuestion}
        preselectedSubSectionId={subSectionId}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Question"
        message="Are you sure you want to delete this question?"
        confirmText="Delete"
        isDangerous
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
        isLoading={deleteMutation.isPending}
      />
    </Layout>
  );
}

function QuestionItem({ question, index, total, onNavigate, onEdit, onDelete, onMoveUp, onMoveDown, isEditMode }) {
  return (
    <button onClick={onNavigate} className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-accent group-hover:text-opacity-80 transition-colors mb-2">{question.title}</h3>
          <div className="flex items-center gap-2">
            {question.codeLanguage && <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">{question.codeLanguage}</span>}
            {question.answer && <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Has Answer</span>}
            {question.codeSnippet && <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Has Code</span>}
          </div>
        </div>
        {isEditMode && (
          <div className="flex gap-1 ml-4" onClick={(e) => e.stopPropagation()}>
            {index > 0 && <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }} className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors" title="Move Up"><ChevronUp size={18} /></button>}
            {index < total - 1 && <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }} className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors" title="Move Down"><ChevronDown size={18} /></button>}
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors" title="Edit"><Edit2 size={18} /></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete"><Trash2 size={18} /></button>
          </div>
        )}
      </div>
    </button>
  );
}
