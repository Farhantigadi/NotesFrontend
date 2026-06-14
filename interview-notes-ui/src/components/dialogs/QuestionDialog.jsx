import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useSubSections } from '../../hooks/useSubSections';

const questionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  answer: z.string().optional(),
  codeSnippet: z.string().optional(),
  codeLanguage: z.string().optional(),
  explanation: z.string().optional(),
  displayOrder: z.number().optional(),
  subSectionId: z.number().min(1, 'SubSection is required'),
});

const codeLanguages = ['java', 'javascript', 'typescript', 'python', 'sql', 'go', 'rust', 'cpp', 'csharp'];

export function QuestionDialog({
  isOpen,
  question,
  preselectedSubSectionId,
  onClose,
  onSubmit,
  isLoading = false,
}) {
  const { data: subSections } = useSubSections();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      title: question?.title || '',
      answer: question?.answer || '',
      codeSnippet: question?.codeSnippet || '',
      codeLanguage: question?.codeLanguage || '',
      explanation: question?.explanation || '',
      displayOrder: question?.displayOrder || undefined,
      subSectionId: question?.subSectionId || preselectedSubSectionId || undefined,
    },
  });

  useEffect(() => {
    if (isOpen && question) {
      reset({
        title: question.title,
        answer: question.answer || '',
        codeSnippet: question.codeSnippet || '',
        codeLanguage: question.codeLanguage || '',
        explanation: question.explanation || '',
        displayOrder: question.displayOrder || undefined,
        subSectionId: question.subSectionId,
      });
    } else if (isOpen) {
      reset({
        title: '',
        answer: '',
        codeSnippet: '',
        codeLanguage: '',
        explanation: '',
        displayOrder: undefined,
        subSectionId: preselectedSubSectionId || undefined,
      });
    }
  }, [isOpen, question, preselectedSubSectionId, reset]);

  const handleFormSubmit = async (data) => {
    console.log('[QUESTION] Save button clicked');
    console.log('[QUESTION] Form Values:', data);
    console.log('[QUESTION] Form Fields → title:', data.title, '| answer:', data.answer, '| codeSnippet:', data.codeSnippet, '| codeLanguage:', data.codeLanguage, '| explanation:', data.explanation, '| subSectionId:', data.subSectionId);
    const payload = {
      title: data.title,
      answer: data.answer || null,
      codeSnippet: data.codeSnippet || null,
      codeLanguage: data.codeLanguage || null,
      explanation: data.explanation || null,
      subSectionId: Number(data.subSectionId),
    };
    console.log('[QUESTION] Payload Being Sent:', payload);
    await onSubmit(payload);
    reset();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />

      {/* Dialog */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-h-[90vh] overflow-y-auto">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
            <h2 className="text-lg font-semibold text-gray-900">
              {question ? 'Edit Question' : 'Add Question'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SubSection *
              </label>
              <select
                {...register('subSectionId', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Select a subsection</option>
                {subSections?.map((subSection) => (
                  <option key={subSection.id} value={subSection.id}>
                    {subSection.mainSectionTitle} &gt; {subSection.title}
                  </option>
                ))}
              </select>
              {errors.subSectionId && (
                <p className="text-red-500 text-sm mt-1">{errors.subSectionId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                {...register('title')}
                type="text"
                placeholder="Enter question title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Answer
              </label>
              <textarea
                {...register('answer')}
                placeholder="Enter the answer"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
              {errors.answer && (
                <p className="text-red-500 text-sm mt-1">{errors.answer.message}</p>
              )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code Language
                </label>
                <select
                  {...register('codeLanguage')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Select language</option>
                  {codeLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code Snippet
              </label>
              <textarea
                {...register('codeSnippet')}
                placeholder="Enter code snippet"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm"
              />
              {errors.codeSnippet && (
                <p className="text-red-500 text-sm mt-1">{errors.codeSnippet.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Explanation
              </label>
              <textarea
                {...register('explanation')}
                placeholder="Enter explanation"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
              {errors.explanation && (
                <p className="text-red-500 text-sm mt-1">{errors.explanation.message}</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-accent text-white font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
