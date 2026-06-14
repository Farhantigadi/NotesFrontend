import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Edit2, Trash2, ChevronLeft, ChevronRightIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { QuestionDialog } from '../components/dialogs/QuestionDialog';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { CodeBlock } from '../components/shared/CodeBlock';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useQuestion, useQuestionsBySubSection, useDeleteQuestion, useUpdateQuestion } from '../hooks/useQuestions';
import { useSubSection } from '../hooks/useSubSections';
import { useEditMode } from '../contexts/EditModeContext';

export function QuestionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isEditMode } = useEditMode();
  const questionId = Number(id);

  const { data: question, isLoading: questionLoading } = useQuestion(questionId);
  const { data: subSection } = useSubSection(question?.subSectionId || 0);
  const { data: siblingQuestions } = useQuestionsBySubSection(question?.subSectionId || 0);
  const deleteMutation = useDeleteQuestion();
  const updateMutation = useUpdateQuestion();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const currentIndex = siblingQuestions?.findIndex((q) => q.id === questionId) ?? -1;
  const previousQuestion = currentIndex > 0 ? siblingQuestions[currentIndex - 1] : null;
  const nextQuestion = currentIndex < (siblingQuestions?.length ?? 1) - 1 ? siblingQuestions[currentIndex + 1] : null;

  const handleConfirmDelete = async () => {
    await deleteMutation.mutateAsync(questionId);
    navigate(-1);
  };

  const handleFormSubmit = async (data) => {
    await updateMutation.mutateAsync({ id: questionId, data });
    setIsEditDialogOpen(false);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft' && previousQuestion) {
        navigate(`/questions/${previousQuestion.id}`);
      } else if (e.key === 'ArrowRight' && nextQuestion) {
        navigate(`/questions/${nextQuestion.id}`);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [previousQuestion, nextQuestion, navigate]);

  if (questionLoading) {
    return <Layout><LoadingSpinner /></Layout>;
  }

  if (!question) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">Question not found</p>
        </div>
      </Layout>
    );
  }

  console.log('[QUESTION PAGE] Question Object:', question);
  console.log('[QUESTION PAGE] Title:', question?.title);
  console.log('[QUESTION PAGE] Answer:', question?.answer);
  console.log('[QUESTION PAGE] Code:', question?.codeSnippet);
  console.log('[QUESTION PAGE] Explanation:', question?.explanation);
  console.log('[QUESTION PAGE] codeLanguage:', question?.codeLanguage);

  return (
    <Layout>
      <article className="max-w-4xl mx-auto">
        <div className="text-sm text-gray-600 flex items-center gap-2 mb-8">
          <button onClick={() => navigate('/sections')} className="hover:text-accent">Sections</button>
          <ChevronRight size={16} />
          <span>{question.subSectionTitle || subSection?.mainSectionTitle || ''}</span>
          <ChevronRight size={16} />
          <button onClick={() => navigate(`/subsections/${question.subSectionId}`)} className="hover:text-accent">
            {subSection?.title || ''}
          </button>
          <ChevronRight size={16} />
          <span className="text-accent font-semibold">{question.title}</span>
        </div>

        <div className="flex items-start justify-between mb-8">
          <h1 className="text-5xl font-bold text-accent reading-content font-serif">{question.title}</h1>
          {isEditMode && (
            <div className="flex gap-2 ml-4">
              <button onClick={() => setIsEditDialogOpen(true)} className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                <Edit2 size={20} />
              </button>
              <button onClick={() => setDeleteConfirm(true)} className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                <Trash2 size={20} />
              </button>
            </div>
          )}
        </div>

        {question.answer ? (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-accent mb-4">Answer</h2>
            <div className="content-area-bg rounded-lg p-6 border border-gray-200 reading-content">{question.answer}</div>
          </section>
        ) : (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-accent mb-4">Answer</h2>
            <div className="content-area-bg rounded-lg p-6 border border-gray-200 text-gray-400 italic">No Answer Available</div>
          </section>
        )}

        {question.codeSnippet ? (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-accent mb-4">Code Example</h2>
            <CodeBlock code={question.codeSnippet} language={question.codeLanguage || 'javascript'} />
          </section>
        ) : (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-accent mb-4">Code Example</h2>
            <div className="content-area-bg rounded-lg p-6 border border-gray-200 text-gray-400 italic">No Code Example Available</div>
          </section>
        )}

        {question.explanation ? (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-accent mb-4">Explanation</h2>
            <div className="content-area-bg rounded-lg p-6 border border-gray-200 reading-content">{question.explanation}</div>
          </section>
        ) : (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-accent mb-4">Explanation</h2>
            <div className="content-area-bg rounded-lg p-6 border border-gray-200 text-gray-400 italic">No Explanation Available</div>
          </section>
        )}

        <div className="flex gap-4 mt-16 pt-8 border-t border-gray-200">
          {previousQuestion ? (
            <button onClick={() => navigate(`/questions/${previousQuestion.id}`)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
              <ChevronLeft size={18} /> Previous Question
            </button>
          ) : <div />}
          {nextQuestion ? (
            <button onClick={() => navigate(`/questions/${nextQuestion.id}`)} className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white hover:bg-opacity-90 transition-colors">
              Next Question <ChevronRightIcon size={18} />
            </button>
          ) : <div className="ml-auto" />}
        </div>
      </article>

      <QuestionDialog
        isOpen={isEditDialogOpen}
        question={question}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={updateMutation.isPending}
      />

      <ConfirmDialog
        isOpen={deleteConfirm}
        title="Delete Question"
        message="Are you sure you want to delete this question?"
        confirmText="Delete"
        isDangerous
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(false)}
        isLoading={deleteMutation.isPending}
      />

      {/* DEBUG PANEL — remove before production */}
      <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999, background: '#1e1e1e', color: '#d4d4d4', padding: '12px 16px', borderRadius: 8, fontSize: 11, maxWidth: 420, fontFamily: 'monospace', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', maxHeight: 340, overflowY: 'auto' }}>
        <div style={{ fontWeight: 700, marginBottom: 6, color: '#ffd700' }}>🐛 DEBUG DATA — Raw Question Object</div>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {JSON.stringify(question, null, 2)}
        </pre>
      </div>
    </Layout>
  );
}
