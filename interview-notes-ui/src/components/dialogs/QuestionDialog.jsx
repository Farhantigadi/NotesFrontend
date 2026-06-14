import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useSubSections } from '../../hooks/useSubSections';
import { useUploadQuestionImage, useDeleteQuestionImage } from '../../hooks/useQuestions';
import { ImageUploader } from '../shared/ImageUploader';
import { DiagramEditor } from '../shared/DiagramEditor';

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
  const uploadImageMutation = useUploadQuestionImage();
  const deleteImageMutation = useDeleteQuestionImage();
  const [activeTab, setActiveTab] = useState('main');
  const [pendingImageFile, setPendingImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(question?.imageUrl || null);
  const [imageSettings, setImageSettings] = useState({
    width: question?.imageWidth ?? 100,
    align: question?.imageAlign ?? 'center',
  });
  const [diagramData, setDiagramData] = useState(() => {
    const key = question?.id ? `q-diagram-${question.id}` : null;
    return key ? JSON.parse(localStorage.getItem(key) || 'null') : null;
  });
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
      setImagePreview(question.imageUrl || null);
      setPendingImageFile(null);
      setImageSettings({ width: question.imageWidth ?? 100, align: question.imageAlign ?? 'center' });
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
      setImagePreview(null);
      setPendingImageFile(null);
      setImageSettings({ width: 100, align: 'center' });
    }
  }, [isOpen, question, preselectedSubSectionId, reset]);

  const handleFormSubmit = async (data) => {
    const questionId = question?.id;
    const payload = {
      title: data.title,
      answer: data.answer || null,
      codeSnippet: data.codeSnippet || null,
      codeLanguage: data.codeLanguage || null,
      explanation: data.explanation || null,
      subSectionId: Number(data.subSectionId),
      imageWidth: imageSettings.width,
      imageAlign: imageSettings.align,
    };
    const saved = await onSubmit(payload);
    const savedId = saved?.id || questionId;
    if (savedId && pendingImageFile) {
      await uploadImageMutation.mutateAsync({ id: savedId, file: pendingImageFile });
    }
    if (savedId && diagramData) {
      localStorage.setItem(`q-diagram-${savedId}`, JSON.stringify(diagramData));
    }
    reset();
  };

  const handleImageChange = (file) => {
    setPendingImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const handleDeleteImage = async () => {
    if (question?.id) await deleteImageMutation.mutateAsync(question.id);
    setImagePreview(null);
    setPendingImageFile(null);
    setImageSettings({ width: 100, align: 'center' });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 40, backdropFilter: 'blur(2px)' }} onClick={onClose} />

      {/* Dialog */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 50, width: '90vw', maxWidth: '780px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '16px', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid #f0ede8', flexShrink: 0 }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1c1c1c', letterSpacing: '-0.01em' }}>
            {question ? 'Edit Question' : 'Add Question'}
          </h2>
          <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '8px', border: 'none', background: 'none', color: '#a8a29e', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f5f0e8'; e.currentTarget.style.color = '#1c1c1c'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#a8a29e'; }}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', padding: '12px 28px 0', borderBottom: '1px solid #f0ede8', flexShrink: 0 }}>
          {[{ id: 'main', label: 'Content' }, { id: 'image', label: '🖼 Image' }, { id: 'diagram', label: '🔷 Diagram' }].map(t => (
            <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
              style={{ padding: '8px 16px', fontSize: '13px', fontWeight: activeTab === t.id ? 600 : 400, color: activeTab === t.id ? '#92400e' : '#a8a29e', background: activeTab === t.id ? '#fdf8f0' : 'none', border: 'none', borderRadius: '8px 8px 0 0', borderBottom: activeTab === t.id ? '2px solid #92400e' : '2px solid transparent', cursor: 'pointer', marginBottom: '-1px', transition: 'all 0.15s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {activeTab === 'main' && (<>

                {/* SubSection */}
                <div>
                  <label style={labelStyle}>Topic *</label>
                  <select {...register('subSectionId', { valueAsNumber: true })} style={inputStyle}>
                    <option value="">Select a topic</option>
                    {subSections?.map(s => (
                      <option key={s.id} value={s.id}>{s.mainSectionTitle} › {s.title}</option>
                    ))}
                  </select>
                  {errors.subSectionId && <p style={errorStyle}>{errors.subSectionId.message}</p>}
                </div>

                {/* Title */}
                <div>
                  <label style={labelStyle}>Question Title *</label>
                  <input {...register('title')} type="text" placeholder="e.g. What is polymorphism?" style={inputStyle} />
                  {errors.title && <p style={errorStyle}>{errors.title.message}</p>}
                </div>

                {/* Answer */}
                <div>
                  <label style={labelStyle}>Answer</label>
                  <textarea {...register('answer')} placeholder="Write the answer here..." rows={5} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }} />
                </div>

                {/* Code Language + Code Snippet side label */}
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '16px', alignItems: 'flex-start' }}>
                  <div>
                    <label style={labelStyle}>Code Language</label>
                    <select {...register('codeLanguage')} style={inputStyle}>
                      <option value="">Select language</option>
                      {codeLanguages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '1px' }}>
                    <p style={{ fontSize: '12px', color: '#a8a29e', lineHeight: 1.5 }}>Choose the language before pasting your code snippet below.</p>
                  </div>
                </div>

                {/* Code Snippet */}
                <div>
                  <label style={labelStyle}>Code Snippet</label>
                  <textarea {...register('codeSnippet')} placeholder="Paste your code here..." rows={8}
                    style={{ ...inputStyle, fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace", fontSize: '13px', lineHeight: 1.8, resize: 'vertical', background: '#1e1e2e', color: '#cdd6f4', borderColor: '#313244' }} />
                </div>

                {/* Explanation */}
                <div>
                  <label style={labelStyle}>Explanation</label>
                  <textarea {...register('explanation')} placeholder="Add any extra notes or explanation..." rows={4} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }} />
                </div>

              </>)}

              {activeTab === 'image' && (
                <div>
                  <p style={{ fontSize: '13px', color: '#a8a29e', marginBottom: '16px' }}>Upload an image to attach to this question. Saved to the server.</p>
                  <ImageUploader
                    value={imagePreview ? { src: imagePreview } : null}
                    onFileChange={handleImageChange}
                    onDelete={handleDeleteImage}
                    isDeleting={deleteImageMutation.isPending}
                    settings={imageSettings}
                    onSettingsChange={setImageSettings}
                  />
                </div>
              )}

              {activeTab === 'diagram' && (
                <div>
                  <p style={{ fontSize: '13px', color: '#a8a29e', marginBottom: '16px' }}>Build a flow diagram. Drag nodes, connect them with arrows. Stored locally.</p>
                  <DiagramEditor value={diagramData} onChange={setDiagramData} />
                </div>
              )}

            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 28px', borderTop: '1px solid #f0ede8', background: '#faf9f7', flexShrink: 0 }}>
              <button type="button" onClick={onClose} disabled={isLoading}
                style={{ padding: '9px 20px', borderRadius: '8px', border: '1px solid #e0dbd2', background: '#fff', color: '#3c3836', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f0e8'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                Cancel
              </button>
              <button type="submit" disabled={isLoading}
                style={{ padding: '9px 24px', borderRadius: '8px', border: 'none', background: '#92400e', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: isLoading ? 0.6 : 1 }}
                onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = '#78350f'; }}
                onMouseLeave={e => e.currentTarget.style.background = '#92400e'}>
                {isLoading ? 'Saving...' : 'Save Question'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b6b6b', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e0dbd2', borderRadius: '8px', fontSize: '14px', color: '#1c1c1c', background: '#fff', outline: 'none', fontFamily: 'inherit' };
const errorStyle = { fontSize: '12px', color: '#ef4444', marginTop: '4px' };
