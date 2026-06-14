import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Edit2, Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { CodeBlock } from '../components/shared/CodeBlock';
import { useState, useMemo } from 'react';
import { Layout } from '../components/layout/Layout';
import { QuestionDialog } from '../components/dialogs/QuestionDialog';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useSubSection } from '../hooks/useSubSections';
import { useQuestionsBySubSection, useCreateQuestion, useUpdateQuestion, useDeleteQuestion, useReorderQuestions } from '../hooks/useQuestions';
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
  const reorderMutation = useReorderQuestions(subSectionId);

  const [editingId, setEditingId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

  // Sort questions by displayOrder (nulls last), stable
  const sortedQuestions = useMemo(() => {
    if (!questions) return [];
    return [...questions].sort((a, b) => {
      if (a.displayOrder == null && b.displayOrder == null) return 0;
      if (a.displayOrder == null) return 1;
      if (b.displayOrder == null) return -1;
      return a.displayOrder - b.displayOrder;
    });
  }, [questions]);

  const handleAddQuestion = () => { setEditingId(null); setIsDialogOpen(true); };
  const handleEditQuestion = (id) => { setEditingId(id); setIsDialogOpen(true); };
  const handleDeleteQuestion = (id) => setDeleteConfirm({ isOpen: true, id });

  const handleMove = (index, direction) => {
    const list = [...sortedQuestions];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= list.length) return;

    const updates = list.map((q, i) => {
      let newOrder = i + 1;
      if (i === index) newOrder = swapIndex + 1;
      if (i === swapIndex) newOrder = index + 1;
      return { id: q.id, title: q.title, subSectionId: q.subSectionId, displayOrder: newOrder };
    });

    reorderMutation.mutate(updates);
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
        // Assign displayOrder as max existing + 1 so new question goes to end
        const maxOrder = sortedQuestions.length > 0
          ? Math.max(...sortedQuestions.map(q => q.displayOrder ?? 0))
          : 0;
        await createMutation.mutateAsync({ ...data, displayOrder: maxOrder + 1 });
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
          ) : sortedQuestions.length > 0 ? (
            <div className="max-w-2xl">
              {sortedQuestions.map((question, index) => (
                <QuestionItem
                  key={question.id}
                  question={question}
                  index={index}
                  total={sortedQuestions.length}
                  onNavigate={() => navigate(`/questions/${question.id}`)}
                  onEdit={() => handleEditQuestion(question.id)}
                  onDelete={() => handleDeleteQuestion(question.id)}
                  onMoveUp={() => handleMove(index, -1)}
                  onMoveDown={() => handleMove(index, 1)}
                  isEditMode={isEditMode}
                  isReordering={reorderMutation.isPending}
                />
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

function QuestionItem({ question, index, total, onNavigate, onEdit, onDelete, onMoveUp, onMoveDown, isEditMode, isReordering }) {
  const [codeExpanded, setCodeExpanded] = useState(false);
  const previewLines = question.codeSnippet?.split('\n').slice(0, 7).join('\n') || '';
  const totalLines = question.codeSnippet?.split('\n').length || 0;
  const hasMore = totalLines > 7;

  return (
    <article className="border-b border-gray-200 py-10 first:pt-2">
      {/* Question number + action buttons */}
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 600, color: '#6B6B6B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Question {index + 1}
        </span>
        {isEditMode && (
          <div className="flex items-center gap-1">
            <button
              onClick={onMoveUp}
              disabled={index === 0 || isReordering}
              className="p-1 rounded transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              style={{ color: '#6B6B6B' }}
              onMouseEnter={e => { if (index !== 0) e.currentTarget.style.color = '#242424'; }}
              onMouseLeave={e => e.currentTarget.style.color = '#6B6B6B'}
              title="Move up"
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={onMoveDown}
              disabled={index === total - 1 || isReordering}
              className="p-1 rounded transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              style={{ color: '#6B6B6B' }}
              onMouseEnter={e => { if (index !== total - 1) e.currentTarget.style.color = '#242424'; }}
              onMouseLeave={e => e.currentTarget.style.color = '#6B6B6B'}
              title="Move down"
            >
              <ChevronDown size={16} />
            </button>
            <button onClick={onEdit} className="p-1 rounded transition-colors" style={{ color: '#6B6B6B' }}
              onMouseEnter={e => e.currentTarget.style.color = '#242424'}
              onMouseLeave={e => e.currentTarget.style.color = '#6B6B6B'}>
              <Edit2 size={15} />
            </button>
            <button onClick={onDelete} className="p-1 rounded transition-colors" style={{ color: '#6B6B6B' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = '#6B6B6B'}>
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <button onClick={onNavigate} className="w-full text-left group mb-5">
        <h2
          style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '26px', fontWeight: 700, color: '#242424', lineHeight: 1.3, letterSpacing: '-0.016em' }}
          className="group-hover:opacity-75 transition-opacity"
        >
          {question.title}
        </h2>
      </button>

      {/* Answer */}
      {question.answer && (
        <p
          style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '18px', lineHeight: 1.9, color: '#242424', letterSpacing: '-0.003em' }}
          className="mb-6 whitespace-pre-wrap"
        >
          {question.answer}
        </p>
      )}

      {/* Code block */}
      {question.codeSnippet && (
        <div className="mb-6 rounded-xl overflow-hidden" style={{ background: '#282c34' }}>
          <div className="flex items-center justify-between px-4 py-2.5" style={{ background: '#21252b', borderBottom: '1px solid #3e4451' }}>
            <span className="text-xs font-medium tracking-widest uppercase" style={{ color: '#636d83', fontFamily: 'monospace' }}>
              {question.codeLanguage || 'code'}
            </span>
            {hasMore && (
              <button
                onClick={() => setCodeExpanded(v => !v)}
                className="flex items-center gap-1 text-xs transition-colors"
                style={{ color: '#636d83' }}
                onMouseEnter={e => e.currentTarget.style.color = '#abb2bf'}
                onMouseLeave={e => e.currentTarget.style.color = '#636d83'}
              >
                {codeExpanded ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Show more</>}
              </button>
            )}
          </div>
          {codeExpanded ? (
            <CodeBlock code={question.codeSnippet} language={question.codeLanguage || 'java'} />
          ) : (
            <div>
              <pre style={{ fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace", fontSize: '13.5px', lineHeight: 1.75, padding: '1.25rem', margin: 0, overflowX: 'auto', color: '#abb2bf', background: '#282c34', whiteSpace: 'pre' }}>
                {previewLines}
              </pre>
              {hasMore && (
                <button
                  onClick={() => setCodeExpanded(true)}
                  className="w-full py-2 text-xs transition-colors"
                  style={{ color: '#636d83', background: '#21252b', borderTop: '1px solid #3e4451' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#abb2bf'}
                  onMouseLeave={e => e.currentTarget.style.color = '#636d83'}
                >
                  + {totalLines - 7} more lines
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Explanation */}
      {question.explanation && (
        <p
          style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '18px', lineHeight: 1.9, color: '#6B6B6B', letterSpacing: '-0.003em' }}
          className="whitespace-pre-wrap"
        >
          {question.explanation}
        </p>
      )}
    </article>
  );
}
