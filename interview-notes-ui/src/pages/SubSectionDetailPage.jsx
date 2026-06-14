import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Edit2, Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { CodeBlock } from '../components/shared/CodeBlock';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { QuestionDialog } from '../components/dialogs/QuestionDialog';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useSubSection } from '../hooks/useSubSections';
import { useQuestionsBySubSection, useCreateQuestion, useUpdateQuestion, useDeleteQuestion, useReorderQuestions } from '../hooks/useQuestions';
import { useEditMode } from '../contexts/EditModeContext';

const PEN_COLORS = [
  { id: 'yellow', bg: '#FFF176', label: 'Yellow' },
  { id: 'green',  bg: '#CCFF90', label: 'Green'  },
  { id: 'blue',   bg: '#80D8FF', label: 'Blue'   },
  { id: 'pink',   bg: '#FF80AB', label: 'Pink'   },
  { id: 'orange', bg: '#FFD180', label: 'Orange' },
  { id: 'warm',   bg: 'rgb(245, 240, 232)', label: 'Warm' },
];

export function SubSectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isEditMode } = useEditMode();
  const subSectionId = Number(id);

  const { data: subSection, isLoading: subSectionLoading, isError } = useSubSection(subSectionId);
  const { data: questions, isLoading: questionsLoading } = useQuestionsBySubSection(subSectionId);
  const createMutation = useCreateQuestion();
  const updateMutation = useUpdateQuestion();
  const deleteMutation = useDeleteQuestion();
  const reorderMutation = useReorderQuestions(subSectionId);

  const [editingId, setEditingId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

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

  if (subSectionLoading) return <Layout><LoadingSpinner /></Layout>;
  if (isError || !subSection) return <Layout><div style={{ textAlign: 'center', padding: '48px 0' }}><p style={{ color: '#a8a29e', fontSize: '15px' }}>Topic not found</p></div></Layout>;

  const editingQuestion = editingId ? questions?.find((q) => q.id === editingId) : undefined;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <button onClick={() => navigate('/sections')} className="hover:text-accent">Sections</button>
          <ChevronRight size={14} />
          <button onClick={() => navigate(`/sections/${subSection.mainSectionId}`)} className="hover:text-accent">{subSection.mainSectionTitle}</button>
          <ChevronRight size={14} />
          <span style={{ color: '#242424' }}>{subSection.title}</span>
        </div>

        {/* Section header — no border, clean */}
        <div>
          <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '36px', fontWeight: 700, color: '#242424', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            {subSection.title}
          </h1>
          {subSection.description && (
            <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '18px', lineHeight: 1.8, color: '#6b6b6b' }}>
              {subSection.description}
            </p>
          )}
        </div>

        {/* Questions header */}
        <div className="flex items-center justify-between">
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#a8a29e', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {questions?.length || 0} Questions
          </p>
          {isEditMode && (
            <button
              onClick={handleAddQuestion}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: '#92400e', color: '#fff', fontSize: '13px', fontWeight: 500, borderRadius: '8px', border: 'none', cursor: 'pointer' }}
            >
              <Plus size={15} /> Add Question
            </button>
          )}
        </div>

        {/* Questions list */}
        {questionsLoading ? (
          <LoadingSpinner />
        ) : sortedQuestions.length > 0 ? (
          <div style={{ maxWidth: '680px' }}>
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
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <p style={{ color: '#a8a29e', fontSize: '15px', marginBottom: '16px' }}>No questions yet</p>
            {isEditMode && (
              <button
                onClick={handleAddQuestion}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#92400e', color: '#fff', fontSize: '13px', fontWeight: 500, borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              >
                <Plus size={15} /> Add First Question
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
  const [activePen, setActivePen] = useState(null);
  const storageKey = `highlights-${question.id}`;
  const contentRef = useRef(null);

  const previewLines = question.codeSnippet?.split('\n').slice(0, 7).join('\n') || '';
  const totalLines = question.codeSnippet?.split('\n').length || 0;
  const hasMore = totalLines > 7;

  // Load saved highlights from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved && contentRef.current) {
      contentRef.current.innerHTML = saved;
    }
  }, [storageKey]);

  const applyHighlight = (color) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    if (!contentRef.current?.contains(range.commonAncestorContainer)) return;

    const mark = document.createElement('mark');
    mark.style.background = color;
    mark.style.borderRadius = '2px';
    mark.style.padding = '0 1px';
    mark.dataset.highlight = 'true';
    range.surroundContents(mark);
    selection.removeAllRanges();

    // Persist
    localStorage.setItem(storageKey, contentRef.current.innerHTML);
  };

  const removeHighlights = () => {
    if (!contentRef.current) return;
    const marks = contentRef.current.querySelectorAll('mark[data-highlight]');
    marks.forEach(mark => {
      const parent = mark.parentNode;
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      parent.removeChild(mark);
    });
    localStorage.setItem(storageKey, contentRef.current.innerHTML);
  };

  return (
    <article style={{ paddingTop: '40px', paddingBottom: '40px', borderBottom: index < total - 1 ? '1px solid #f0ede8' : 'none' }}>
      {/* Question number + controls row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#c4b5a0', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Q{index + 1}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Highlighter pens — always visible, but only functional in edit mode */}
          {isEditMode && (
            <>
              {PEN_COLORS.map(pen => (
                <button
                  key={pen.id}
                  onClick={() => {
                    setActivePen(activePen === pen.id ? null : pen.id);
                    if (activePen !== pen.id) applyHighlight(pen.bg);
                  }}
                  title={`Highlight ${pen.label}`}
                  style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: pen.bg,
                    border: activePen === pen.id ? '2px solid #242424' : '2px solid transparent',
                    cursor: 'pointer', flexShrink: 0, transition: 'transform 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              ))}
              <button
                onClick={removeHighlights}
                title="Remove all highlights"
                style={{ fontSize: '11px', color: '#a8a29e', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: '4px', marginLeft: '2px' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = '#a8a29e'}
              >
                ✕
              </button>
              <div style={{ width: '1px', height: '14px', background: '#e8e5e0', margin: '0 4px' }} />
              <button onClick={onMoveUp} disabled={index === 0 || isReordering}
                style={{ padding: '3px', color: '#a8a29e', background: 'none', border: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.3 : 1 }}
                onMouseEnter={e => { if (index !== 0) e.currentTarget.style.color = '#242424'; }}
                onMouseLeave={e => e.currentTarget.style.color = '#a8a29e'}>
                <ChevronUp size={15} />
              </button>
              <button onClick={onMoveDown} disabled={index === total - 1 || isReordering}
                style={{ padding: '3px', color: '#a8a29e', background: 'none', border: 'none', cursor: index === total - 1 ? 'not-allowed' : 'pointer', opacity: index === total - 1 ? 0.3 : 1 }}
                onMouseEnter={e => { if (index !== total - 1) e.currentTarget.style.color = '#242424'; }}
                onMouseLeave={e => e.currentTarget.style.color = '#a8a29e'}>
                <ChevronDown size={15} />
              </button>
              <button onClick={onEdit}
                style={{ padding: '3px', color: '#a8a29e', background: 'none', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.color = '#242424'}
                onMouseLeave={e => e.currentTarget.style.color = '#a8a29e'}>
                <Edit2 size={14} />
              </button>
              <button onClick={onDelete}
                style={{ padding: '3px', color: '#a8a29e', background: 'none', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = '#a8a29e'}>
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '24px', fontWeight: 700, color: '#242424', lineHeight: 1.35, letterSpacing: '-0.014em' }}>
          {question.title}
        </h2>
      </div>

      {/* Highlightable content area */}
      <div
        ref={contentRef}
        style={{ cursor: activePen ? 'crosshair' : 'text' }}
        onMouseUp={() => { if (activePen) { const pen = PEN_COLORS.find(p => p.id === activePen); if (pen) applyHighlight(pen.bg); } }}
      >
        {question.answer && (
          <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '18px', lineHeight: 1.9, color: '#242424', letterSpacing: '-0.003em', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
            {question.answer}
          </p>
        )}
      </div>

      {/* Code block */}
      {question.codeSnippet && (
        <div style={{ marginBottom: '20px', borderRadius: '10px', overflow: 'hidden', background: '#282c34' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#21252b', borderBottom: '1px solid #3e4451' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#636d83', fontFamily: 'monospace' }}>
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
              <pre style={{ fontFamily: "'JetBrains Mono','Fira Code',Consolas,monospace", fontSize: '13.5px', lineHeight: 1.75, padding: '20px', margin: 0, overflowX: 'auto', color: '#abb2bf', background: '#282c34', whiteSpace: 'pre' }}>
                {previewLines}
              </pre>
              {hasMore && (
                <button
                  onClick={() => setCodeExpanded(true)}
                  style={{ width: '100%', padding: '8px', fontSize: '12px', color: '#636d83', background: '#21252b', border: 'none', borderTop: '1px solid #3e4451', cursor: 'pointer' }}
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
        <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '18px', lineHeight: 1.9, color: '#6b6b6b', letterSpacing: '-0.003em', whiteSpace: 'pre-wrap' }}>
          {question.explanation}
        </p>
      )}
    </article>
  );
}
