import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Edit2, Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { CodeBlock } from '../components/shared/CodeBlock';
import { useState, useMemo } from 'react';
import { Layout } from '../components/layout/Layout';
import { QuestionDialog } from '../components/dialogs/QuestionDialog';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useSubSection, useDeleteSubSection } from '../hooks/useSubSections';
import { useQuestionsBySubSection, useCreateQuestion, useUpdateQuestion, useDeleteQuestion, useReorderQuestions } from '../hooks/useQuestions';
import { useEditMode } from '../contexts/EditModeContext';

const SERIF = "'Source Serif Pro', Georgia, Cambria, serif";

export function SubSectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isEditMode } = useEditMode();
  const subSectionId = Number(id);

  const { data: subSection, isLoading: subSectionLoading, isError } = useSubSection(subSectionId);
  const { data: questions, isLoading: questionsLoading } = useQuestionsBySubSection(subSectionId);
  const createMutation    = useCreateQuestion();
  const updateMutation    = useUpdateQuestion();
  const deleteMutation    = useDeleteQuestion();
  const deleteTopicMutation = useDeleteSubSection();
  const reorderMutation   = useReorderQuestions(subSectionId);

  const [editingId, setEditingId]         = useState(null);
  const [isDialogOpen, setIsDialogOpen]   = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [deleteTopicConfirm, setDeleteTopicConfirm] = useState(false);

  const sortedQuestions = useMemo(() => {
    if (!questions) return [];
    return [...questions].sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
  }, [questions]);

  const handleAddQuestion    = () => { setEditingId(null); setIsDialogOpen(true); };
  const handleEditQuestion   = (id) => { setEditingId(id); setIsDialogOpen(true); };
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

  const handleConfirmDeleteQuestion = async () => {
    if (deleteConfirm.id) {
      await deleteMutation.mutateAsync(deleteConfirm.id);
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const handleConfirmDeleteTopic = async () => {
    await deleteTopicMutation.mutateAsync(subSectionId);
    navigate(`/sections/${subSection.mainSectionId}`);
  };

  const handleFormSubmit = async (data) => {
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data });
    } else {
      const maxOrder = sortedQuestions.length > 0
        ? Math.max(...sortedQuestions.map(q => q.displayOrder ?? 0))
        : 0;
      await createMutation.mutateAsync({ ...data, displayOrder: maxOrder + 1 });
    }
    setIsDialogOpen(false);
  };

  if (subSectionLoading) return <Layout><LoadingSpinner /></Layout>;
  if (isError || !subSection) return (
    <Layout><p style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>Topic not found</p></Layout>
  );

  const editingQuestion = editingId ? questions?.find((q) => q.id === editingId) : undefined;

  return (
    <Layout>
      <div style={{ maxWidth: '850px' }}>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 mb-8 flex-wrap" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          <button onClick={() => navigate('/sections')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>Sections</button>
          <ChevronRight size={13} />
          <button onClick={() => navigate(`/sections/${subSection.mainSectionId}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>{subSection.mainSectionTitle}</button>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{subSection.title}</span>
        </nav>

        {/* Topic heading + delete topic button */}
        <div className="mb-10">
          <div className="flex items-start justify-between gap-4">
            <h1 style={{ fontFamily: SERIF, fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.25, letterSpacing: '-0.02em', margin: '42.8px 0 -9.2px' }}>
              {subSection.title}
            </h1>
            {isEditMode && (
              <button
                onClick={() => setDeleteTopicConfirm(true)}
                className="btn-ghost flex-shrink-0"
                style={{ color: 'var(--danger)', marginTop: '44px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}
              >
                <Trash2 size={14} /> Delete Topic
              </button>
            )}
          </div>
          {subSection.description && (
            <p style={{ fontFamily: SERIF, fontSize: '20px', lineHeight: 1.8, color: 'var(--text-secondary)', marginTop: '20px' }}>
              {subSection.description}
            </p>
          )}
        </div>

        {/* Questions header */}
        <div className="flex items-center justify-between mb-6">
          <span style={{ fontFamily: SERIF, fontSize: '26px', fontWeight: 700, color: 'var(--text-muted)', margin: '42.8px 0 -9.2px', display: 'block' }}>
            {questions?.length || 0} Questions
          </span>
          {isEditMode && (
            <button onClick={handleAddQuestion} className="btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }}>
              <Plus size={13} /> Add Question
            </button>
          )}
        </div>

        {/* Questions list */}
        {questionsLoading ? (
          <LoadingSpinner />
        ) : sortedQuestions.length > 0 ? (
          <div style={{ marginTop: '24px' }}>
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
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', marginTop: '24px' }}>
            <p style={{ fontSize: '14px', marginBottom: '16px' }}>No questions yet.</p>
            {isEditMode && (
              <button onClick={handleAddQuestion} className="btn-primary" style={{ fontSize: '13px' }}>
                <Plus size={14} /> Add First Question
              </button>
            )}
          </div>
        )}
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
        message="This question will be permanently deleted."
        confirmText="Delete"
        isDangerous
        onConfirm={handleConfirmDeleteQuestion}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
        isLoading={deleteMutation.isPending}
      />

      <ConfirmDialog
        isOpen={deleteTopicConfirm}
        title="Delete Topic"
        message={`Delete "${subSection.title}"? All questions inside will also be permanently deleted.`}
        confirmText="Delete Topic"
        isDangerous
        onConfirm={handleConfirmDeleteTopic}
        onCancel={() => setDeleteTopicConfirm(false)}
        isLoading={deleteTopicMutation.isPending}
      />
    </Layout>
  );
}

function QuestionItem({ question, index, total, onNavigate, onEdit, onDelete, onMoveUp, onMoveDown, isEditMode, isReordering }) {
  const [codeExpanded, setCodeExpanded] = useState(false);
  const lines = question.codeSnippet?.split('\n') ?? [];
  const previewLines = lines.slice(0, 7).join('\n');
  const hasMore = lines.length > 7;

  return (
    <article style={{ paddingTop: '40px', paddingBottom: '40px', borderBottom: index < total - 1 ? '1px solid var(--paper-border)' : 'none' }}>

      {/* Q label + edit controls */}
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Q{index + 1}
        </span>
        {isEditMode && (
          <div className="flex items-center gap-0.5">
            <button onClick={onMoveUp} disabled={index === 0 || isReordering} className="btn-ghost p-1" style={{ opacity: index === 0 ? 0.3 : 1 }}><ChevronUp size={13} /></button>
            <button onClick={onMoveDown} disabled={index === total - 1 || isReordering} className="btn-ghost p-1" style={{ opacity: index === total - 1 ? 0.3 : 1 }}><ChevronDown size={13} /></button>
            <button onClick={onEdit} className="btn-ghost p-1"><Edit2 size={13} /></button>
            <button onClick={onDelete} className="btn-ghost p-1" style={{ color: 'var(--danger)' }}><Trash2 size={13} /></button>
          </div>
        )}
      </div>

      {/* Question title — 24px bold serif */}
      <h2
        style={{ fontFamily: SERIF, fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35, letterSpacing: '-0.015em', margin: '42.8px 0 -9.2px', cursor: 'pointer' }}
        onClick={onNavigate}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
      >
        {question.title}
      </h2>

      {/* Answer — 20px serif */}
      {question.answer && (
        <p style={{ fontFamily: SERIF, fontSize: '20px', fontWeight: 400, lineHeight: 1.8, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', marginTop: '20px', marginBottom: '20px' }}>
          {question.answer}
        </p>
      )}

      {/* Code block */}
      {question.codeSnippet && (
        <div style={{ marginBottom: '20px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--code-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'var(--code-header)', borderBottom: '1px solid var(--code-border)' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#636d83' }}>
              {question.codeLanguage || 'code'}
            </span>
            {hasMore && (
              <button
                onClick={() => setCodeExpanded(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#636d83', background: 'none', border: 'none', cursor: 'pointer' }}
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
              <pre style={{ fontFamily: "'JetBrains Mono','Fira Code',Consolas,monospace", fontSize: '14px', lineHeight: 1.75, padding: '20px', margin: 0, overflowX: 'auto', color: '#abb2bf', background: 'var(--code-bg)', whiteSpace: 'pre' }}>
                {previewLines}
              </pre>
              {hasMore && (
                <button
                  onClick={() => setCodeExpanded(true)}
                  style={{ width: '100%', padding: '8px', fontSize: '12px', color: '#636d83', background: 'var(--code-header)', border: 'none', borderTop: '1px solid var(--code-border)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#abb2bf'}
                  onMouseLeave={e => e.currentTarget.style.color = '#636d83'}
                >
                  + {lines.length - 7} more lines — click to expand
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Explanation */}
      {question.explanation && (
        <p style={{ fontFamily: SERIF, fontSize: '20px', fontWeight: 400, lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', marginTop: '16px' }}>
          {question.explanation}
        </p>
      )}
    </article>
  );
}
