import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2 } from 'lucide-react';
import { useSubSections } from '../../hooks/useSubSections';
import { useUploadQuestionImage, useDeleteQuestionImage } from '../../hooks/useQuestions';
import { ImageUploader } from '../shared/ImageUploader';
import { DiagramEditor } from '../shared/DiagramEditor';

const questionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  answer: z.string().optional(),
  explanation: z.string().optional(),
  displayOrder: z.number().optional(),
  subSectionId: z.number().min(1, 'SubSection is required'),
});

const codeLanguages = ['java', 'javascript', 'typescript', 'python', 'sql', 'go', 'rust', 'cpp', 'csharp'];

const parseCodeBlocks = (raw) => {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
};

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
  const [isImageUrl, setIsImageUrl] = useState(!!(question?.imageUrl && !question?.imageUrl.startsWith('blob')));
  const [imageSettings, setImageSettings] = useState({
    width: question?.imageWidth ?? 100,
    align: question?.imageAlign ?? 'center',
  });
  const [codeBlocks, setCodeBlocks] = useState(() => parseCodeBlocks(question?.codeBlocks));
  const [diagramData, setDiagramData] = useState(() => {
    const key = question?.id ? `q-diagram-${question.id}` : null;
    return key ? JSON.parse(localStorage.getItem(key) || 'null') : null;
  });

  const addCodeBlock = () => setCodeBlocks(prev => [...prev, { code: '', language: 'java' }]);
  const removeCodeBlock = (i) => setCodeBlocks(prev => prev.filter((_, idx) => idx !== i));
  const updateCodeBlock = (i, field, value) => setCodeBlocks(prev => prev.map((b, idx) => idx === i ? { ...b, [field]: value } : b));

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
        explanation: question.explanation || '',
        displayOrder: question.displayOrder || undefined,
        subSectionId: question.subSectionId,
      });
      setCodeBlocks(parseCodeBlocks(question.codeBlocks));
      setImagePreview(question.imageUrl || null);
      setPendingImageFile(null);
      setIsImageUrl(!!(question?.imageUrl));
      setImageSettings({ width: question.imageWidth ?? 100, align: question.imageAlign ?? 'center' });
    } else if (isOpen) {
      reset({
        title: '',
        answer: '',
        explanation: '',
        displayOrder: undefined,
        subSectionId: preselectedSubSectionId || undefined,
      });
      setCodeBlocks([]);
      setImagePreview(null);
      setPendingImageFile(null);
      setIsImageUrl(false);
      setImageSettings({ width: 100, align: 'center' });
    }
  }, [isOpen, question, preselectedSubSectionId, reset]);

  const handleFormSubmit = async (data) => {
    const questionId = question?.id;
    const validBlocks = codeBlocks.filter(b => b.code.trim());
    const payload = {
      title: data.title,
      answer: data.answer || null,
      codeBlocks: validBlocks.length ? JSON.stringify(validBlocks) : null,
      explanation: data.explanation || null,
      subSectionId: Number(data.subSectionId),
      displayOrder: question?.displayOrder ?? data.displayOrder,
      imageWidth: imageSettings.width,
      imageAlign: imageSettings.align,
      ...(isImageUrl && imagePreview ? { imageUrl: imagePreview } : {}),
    };
    const saved = await onSubmit(payload);
    const savedId = saved?.id || questionId;
    if (savedId && pendingImageFile && !isImageUrl) {
      await uploadImageMutation.mutateAsync({ id: savedId, file: pendingImageFile });
    }
    if (savedId && diagramData) {
      localStorage.setItem(`q-diagram-${savedId}`, JSON.stringify(diagramData));
    }
    reset();
    onClose();
  };

  const handleImageChange = (file) => {
    setPendingImageFile(file);
    setIsImageUrl(false);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const handleImageUrl = (url) => {
    setImagePreview(url);
    setIsImageUrl(true);
    setPendingImageFile(null);
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
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 40, backdropFilter: 'blur(2px)' }} onClick={onClose} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 50, width: '90vw', maxWidth: '780px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '16px', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden' }}>

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

        <div style={{ display: 'flex', gap: '4px', padding: '12px 28px 0', borderBottom: '1px solid #f0ede8', flexShrink: 0 }}>
          {[{ id: 'main', label: 'Content' }, { id: 'image', label: '🖼 Image' }, { id: 'diagram', label: '🔷 Diagram' }].map(t => (
            <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
              style={{ padding: '8px 16px', fontSize: '13px', fontWeight: activeTab === t.id ? 600 : 400, color: activeTab === t.id ? '#92400e' : '#a8a29e', background: activeTab === t.id ? '#fdf8f0' : 'none', border: 'none', borderRadius: '8px 8px 0 0', borderBottom: activeTab === t.id ? '2px solid #92400e' : '2px solid transparent', cursor: 'pointer', marginBottom: '-1px', transition: 'all 0.15s' }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {activeTab === 'main' && (<>

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

                <div>
                  <label style={labelStyle}>Question Title *</label>
                  <input {...register('title')} type="text" placeholder="e.g. What is polymorphism?" style={inputStyle} />
                  {errors.title && <p style={errorStyle}>{errors.title.message}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Answer</label>
                  <textarea {...register('answer')} placeholder="Write the answer here..." rows={5} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }} />
                </div>

                {/* Code Blocks */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label style={labelStyle}>Code Blocks</label>
                    <button type="button" onClick={addCodeBlock}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '6px', border: '1px solid #e0dbd2', background: '#fff', color: '#92400e', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fdf8f0'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    >
                      <Plus size={12} /> Add Code
                    </button>
                  </div>
                  {codeBlocks.length === 0 && (
                    <p style={{ fontSize: '13px', color: '#a8a29e', fontStyle: 'italic' }}>No code blocks yet. Click "Add Code" to add one.</p>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {codeBlocks.map((block, i) => (
                      <div key={i} style={{ border: '1px solid #313244', borderRadius: '8px', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#181825', borderBottom: '1px solid #313244' }}>
                          <select value={block.language} onChange={e => updateCodeBlock(i, 'language', e.target.value)}
                            style={{ background: '#1e1e2e', border: '1px solid #313244', borderRadius: '5px', color: '#cdd6f4', fontSize: '12px', padding: '3px 8px', cursor: 'pointer' }}
                          >
                            {codeLanguages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                          </select>
                          <button type="button" onClick={() => removeCodeBlock(i)}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#f38ba8', fontSize: '12px', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#3a1a1a'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>
                        <textarea
                          value={block.code}
                          onChange={e => updateCodeBlock(i, 'code', e.target.value)}
                          placeholder="Paste your code here..."
                          rows={6}
                          style={{ ...inputStyle, fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace", fontSize: '13px', lineHeight: 1.8, resize: 'vertical', background: '#1e1e2e', color: '#cdd6f4', borderColor: 'transparent', borderRadius: 0 }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

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
                    onUrlChange={handleImageUrl}
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
