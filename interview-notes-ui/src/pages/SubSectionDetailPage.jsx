import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Edit2, Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { CodeBlock } from '../components/shared/CodeBlock';
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
  const updateMutation = useUpdateQuestion();
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
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      setIsDialogOpen(false);
    } catch (err) {
      console.error('[QUESTION] Submit Error:', err);
    }
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
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <button onClick={onNavigate} className="flex-1 text-left">
          <h3 className="text-xl font-bold text-accent hover:opacity-80 transition-opacity">{question.title}</h3>
        </button>
        {isEditMode && (
          <div className="flex gap-1 ml-4">
            {index > 0 && <button onClick={onMoveUp} className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors" title="Move Up"><ChevronUp size={18} /></button>}
            {index < total - 1 && <button onClick={onMoveDown} className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors" title="Move Down"><ChevronDown size={18} /></button>}
            <button onClick={onEdit} className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors" title="Edit"><Edit2 size={18} /></button>
            <button onClick={onDelete} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete"><Trash2 size={18} /></button>
          </div>
        )}
      </div>

      <div className="px-6 py-5 space-y-6">
        {question.answer && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Answer</h4>
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{question.answer}</p>
          </div>
        )}

        {question.codeSnippet && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Code</h4>
            <CodeBlock code={question.codeSnippet} language={question.codeLanguage || 'java'} />
          </div>
        )}

        {question.explanation && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Explanation</h4>
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
