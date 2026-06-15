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
  const [deleteCodeConfirm, setDeleteCodeConfirm] = useState({ isOpen: false, id: null });
  const [deleteTopicConfirm, setDeleteTopicConfirm] = useState(false);

  const sortedQuestions = useMemo(() => {
    if (!questions) return [];
    return [...questions].sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
  }, [questions]);

  const handleAddQuestion    = () => { setEditingId(null); setIsDialogOpen(true); };
  const handleEditQuestion   = (id) => { setEditingId(id); setIsDialogOpen(true); };
  const handleDeleteQuestion = (id) => setDeleteConfirm({ isOpen: true, id });
  const handleDeleteCode     = (id) => setDeleteCodeConfirm({ isOpen: true, id });

  const handleMove = (index, direction) => {
    const list = [...sortedQuestions];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= list.length) return;
    const updates = list.map((q, i) => {
      let newOrder = i + 1;
      if (i === index) newOrder = swapIndex + 1;
      if (i === swapIndex) newOrder = index + 1;
      return {
        id: q.id,
        title: q.title,
        subSectionId: q.subSectionId,
        answer: q.answer || '',
        codeBlocks: q.codeBlocks || null,
        explanation: q.explanation || '',
        imageUrl: q.imageUrl || null,
        imageWidth: q.imageWidth,
        imageAlign: q.imageAlign,
        displayOrder: newOrder
      };
    });
    reorderMutation.mutate(updates);
  };

  const handleConfirmDeleteQuestion = async () => {
    if (deleteConfirm.id) {
      await deleteMutation.mutateAsync(deleteConfirm.id);
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const handleConfirmDeleteCode = async () => {
    if (deleteCodeConfirm.id) {
      const q = questions.find(q => q.id === deleteCodeConfirm.id);
      await updateMutation.mutateAsync({
        id: deleteCodeConfirm.id,
        data: { title: q.title, subSectionId: q.subSectionId, answer: q.answer || '', codeBlocks: null, explanation: q.explanation || '', displayOrder: q.displayOrder }
      });
      setDeleteCodeConfirm({ isOpen: false, id: null });
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
        <div style={{ marginBottom: '56px' }}>
          <div className="flex items-start justify-between gap-4">
            <h1 style={{ fontFamily: SERIF, fontSize: '42px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.025em', margin: 0 }}>
              {subSection.title}
            </h1>
            {isEditMode && (
              <button
                onClick={() => setDeleteTopicConfirm(true)}
                className="btn-ghost flex-shrink-0"
                style={{ color: 'var(--danger)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}
              >
                <Trash2 size={14} /> Delete Topic
              </button>
            )}
          </div>
          {subSection.description && (
            <p style={{ fontFamily: SERIF, fontSize: '18px', lineHeight: 1.8, color: 'var(--text-secondary)', marginTop: '16px' }}>
              {subSection.description}
            </p>
          )}
        </div>

        {/* Questions header */}
        {isEditMode && (
          <div className="flex items-center justify-end" style={{ marginBottom: '16px' }}>
            <button onClick={handleAddQuestion} className="btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }}>
              <Plus size={13} /> Add Question
            </button>
          </div>
        )}

        {/* Questions list */}
        {questionsLoading ? (
          <LoadingSpinner />
        ) : sortedQuestions.length > 0 ? (
          <div>
            {sortedQuestions.map((question, index) => (
              <QuestionItem
                key={question.id}
                question={question}
                index={index}
                total={sortedQuestions.length}
                onEdit={() => handleEditQuestion(question.id)}
                onDelete={() => handleDeleteQuestion(question.id)}
                onDeleteCode={() => handleDeleteCode(question.id)}
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
        isOpen={deleteCodeConfirm.isOpen}
        title="Delete Code"
        message="Remove the code block from this question?"
        confirmText="Delete"
        isDangerous
        onConfirm={handleConfirmDeleteCode}
        onCancel={() => setDeleteCodeConfirm({ isOpen: false, id: null })}
        isLoading={updateMutation.isPending}
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

function QuestionItem({ question, index, total, onEdit, onDelete, onDeleteCode, onMoveUp, onMoveDown, isEditMode, isReordering }) {
  return (
    <article style={{ paddingTop: '32px', paddingBottom: '32px', borderBottom: index < total - 1 ? '1px solid var(--paper-border)' : 'none' }}>

      {/* Edit controls row — only in edit mode */}
      {isEditMode && (
        <div className="flex items-center justify-end gap-0.5 mb-2">
          <button onClick={onMoveUp} disabled={index === 0 || isReordering} className="btn-ghost p-1" style={{ opacity: index === 0 ? 0.3 : 1 }}><ChevronUp size={13} /></button>
          <button onClick={onMoveDown} disabled={index === total - 1 || isReordering} className="btn-ghost p-1" style={{ opacity: index === total - 1 ? 0.3 : 1 }}><ChevronDown size={13} /></button>
          <button onClick={onEdit} className="btn-ghost p-1"><Edit2 size={13} /></button>
          {question.codeBlocks && (
            <button onClick={onDeleteCode} className="btn-ghost p-1" style={{ color: 'var(--danger)', opacity: 0.6 }} title="Delete All Codes"><Trash2 size={13} /></button>
          )}
          <button onClick={onDelete} className="btn-ghost p-1" style={{ color: 'var(--danger)' }} title="Delete Question"><Trash2 size={13} /></button>
        </div>
      )}

      {/* Q{n} label inline left of title */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
        <span style={{ fontFamily: SERIF, fontSize: '24px', fontWeight: 700, color: 'var(--accent-muted)', flexShrink: 0 }}>
          Q{index + 1}
        </span>
        <h2 style={{ fontFamily: SERIF, fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35, letterSpacing: '-0.015em', margin: 0 }}>
          {question.title}
        </h2>
      </div>

      {/* Answer — 20px serif */}
      {question.answer && (
        <p style={{ fontFamily: SERIF, fontSize: '20px', fontWeight: 400, lineHeight: 1.8, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', marginTop: '20px', marginBottom: '20px' }}>
          {question.answer}
        </p>
      )}

      {/* Code blocks */}
      {(() => {
        const blocks = (() => { try { return JSON.parse(question.codeBlocks || '[]'); } catch { return []; } })();
        if (!blocks.length) return null;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {blocks.map((block, i) => (
              <CodeBlock key={i} code={block.code} language={block.language || 'java'} />
            ))}
          </div>
        );
      })()}

      {/* Explanation */}
      {question.explanation && (
        <p style={{ fontFamily: SERIF, fontSize: '20px', fontWeight: 400, lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', marginTop: '16px' }}>
          {question.explanation}
        </p>
      )}

      {/* Image from server */}
      {question.imageUrl && (() => {
        const w = question.imageWidth ?? 100;
        const a = question.imageAlign ?? 'center';
        const justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end' };
        return (
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: justifyMap[a] }}>
            <img src={question.imageUrl} alt="attached"
              style={{ width: `${w}%`, objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--paper-border)', display: 'block' }}
            />
          </div>
        );
      })()}

      {/* Diagram (localStorage) */}
      {(() => {
        const diag = JSON.parse(localStorage.getItem(`q-diagram-${question.id}`) || 'null');
        if (!diag?.nodes?.length) return null;
        const { nodes, edges } = diag;
        const maxX = Math.max(...nodes.map(n => n.x + n.w)) + 20;
        const maxY = Math.max(...nodes.map(n => n.y + n.h)) + 20;
        return (
          <div style={{ marginTop: '20px', border: '1px solid var(--paper-border)', borderRadius: '10px', overflow: 'hidden' }}>
            <svg width={Math.max(maxX, 300)} height={Math.max(maxY, 160)} style={{ display: 'block', background: 'var(--surface)' }}>
              <defs>
                <marker id={`arrow-${question.id}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#a08060" />
                </marker>
                <pattern id={`grid-${question.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--paper-border)" strokeWidth="0.5" opacity="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#grid-${question.id})`} />
              {edges.map(e => {
                const a = nodes.find(n => n.id === e.from);
                const b = nodes.find(n => n.id === e.to);
                if (!a || !b) return null;
                const x1 = a.x + a.w / 2, y1 = a.y + a.h / 2;
                const x2 = b.x + b.w / 2, y2 = b.y + b.h / 2;
                const dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx*dx+dy*dy)||1;
                return <line key={e.id} x1={x1} y1={y1} x2={x2-(dx/len)*(b.w/2+4)} y2={y2-(dy/len)*(b.h/2+4)} stroke="#a08060" strokeWidth={1.5} markerEnd={`url(#arrow-${question.id})`} />;
              })}
              {nodes.map(n => (
                <g key={n.id} transform={`translate(${n.x},${n.y})`}>
                  {n.shape === 'diamond'
                    ? <polygon points={`${n.w/2},4 ${n.w-4},${n.h/2} ${n.w/2},${n.h-4} 4,${n.h/2}`} fill="var(--surface)" stroke="#c8b89a" strokeWidth={1.5} />
                    : n.shape === 'circle'
                    ? <ellipse cx={n.w/2} cy={n.h/2} rx={n.w/2-4} ry={n.h/2-4} fill="var(--surface)" stroke="#c8b89a" strokeWidth={1.5} />
                    : <rect x={2} y={2} width={n.w-4} height={n.h-4} rx={6} fill="var(--surface)" stroke="#c8b89a" strokeWidth={1.5} />}
                  <text x={n.w/2} y={n.h/2} textAnchor="middle" dominantBaseline="central" style={{ fontSize: '12px', fontFamily: "'Inter',sans-serif", fill: 'var(--text-primary)', pointerEvents: 'none' }}>
                    {n.label.length > 18 ? n.label.slice(0,17)+'…' : n.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        );
      })()}
    </article>
  );
}
