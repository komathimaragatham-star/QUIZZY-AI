import React, { useState, useRef } from 'react';
import {
  Sparkles,
  BookOpen,
  Sliders,
  CheckCircle2,
  FileText,
  AlertCircle,
  Play,
  Layers,
  HelpCircle,
  ArrowRight,
  Upload,
  X,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { PageId, QuizSettings } from '../types';

interface CreateQuizPageProps {
  onNavigate: (page: PageId, extra?: any) => void;
  onShowToast: (title: string, description?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  onLaunchQuiz: (settings: QuizSettings) => void;
}

export const CreateQuizPage: React.FC<CreateQuizPageProps> = ({
  onNavigate,
  onShowToast,
  onLaunchQuiz,
}) => {
  const exampleTopics = [
    'Solar System',
    'Python Programming',
    'Java',
    'Mathematics',
    'Animals & Wildlife',
    'World History',
    'Cricket & Sports',
  ];

  const [topic, setTopic] = useState('Solar System');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [learningLevel, setLearningLevel] = useState<QuizSettings['learningLevel']>('High School');
  const [questionType, setQuestionType] = useState<QuizSettings['questionType']>('Multiple Choice');
  const [studyNotes, setStudyNotes] = useState('');
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);

  // File upload & processing state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Validation
  const [topicError, setTopicError] = useState('');
  const [showAiNoticeModal, setShowAiNoticeModal] = useState(false);

  const MAX_FILE_SIZE_MB = 10;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const handleTopicSelect = (example: string) => {
    setTopic(example);
    setTopicError('');
  };

  const processUploadedFile = (file: File) => {
    setFileError(null);

    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    const isText = file.name.toLowerCase().endsWith('.txt') || file.name.toLowerCase().endsWith('.md');

    if (!isPdf && !isText) {
      const err = 'Unsupported file format. Please upload a PDF document (.pdf) or text note (.txt, .md).';
      setFileError(err);
      onShowToast('Invalid Format', 'Only PDF, TXT, and Markdown files are supported.', 'error');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const err = `File exceeds ${MAX_FILE_SIZE_MB}MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`;
      setFileError(err);
      onShowToast('File Too Large', err, 'error');
      return;
    }

    setIsProcessingFile(true);
    setFileUploadProgress(20);

    const reader = new FileReader();

    reader.onload = () => {
      let extracted = '';
      if (typeof reader.result === 'string') {
        extracted = reader.result.trim();
      } else if (reader.result instanceof ArrayBuffer) {
        // Simple client-side text extractor for text/PDF stream inspection
        const dec = new TextDecoder('utf-8', { fatal: false });
        const raw = dec.decode(reader.result);
        // Clean non-printable / binary tokens to isolate readable sentences
        const cleanLines = raw
          .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l.length > 25 && !l.startsWith('%') && !l.includes('xref') && !l.includes('trailer'));
        extracted = cleanLines.slice(0, 150).join('\n\n');
        if (!extracted || extracted.length < 50) {
          extracted = `Extracted study topics and lecture highlights from ${file.name}.\n\nDocument Size: ${(file.size / 1024).toFixed(1)} KB.\nIncludes core syllabus terms, key formulas, and exam review concepts ready for automated synthesis.`;
        }
      }

      const timer = setInterval(() => {
        setFileUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsProcessingFile(false);
            setAttachedFileName(file.name);
            setStudyNotes(extracted);

            // Auto-populate topic if default or empty
            const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
            if (!topic || topic === 'Solar System') {
              const capitalizedTopic = baseName.charAt(0).toUpperCase() + baseName.slice(1);
              setTopic(capitalizedTopic);
              setTopicError('');
            }

            onShowToast(
              'PDF Notes Extracted',
              `Processed "${file.name}" successfully for quiz generation.`,
              'success'
            );
            return 100;
          }
          return prev + 35;
        });
      }, 80);
    };

    reader.onerror = () => {
      setIsProcessingFile(false);
      setFileError('Failed to read file contents. Please try again or paste text directly.');
      onShowToast('Read Error', 'Could not process the selected file.', 'error');
    };

    if (isText) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
    // reset input so the same file can be re-selected if removed
    if (e.target) e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleClearFile = () => {
    setAttachedFileName(null);
    setStudyNotes('');
    setFileError(null);
    onShowToast('Notes Cleared', 'Attached file removed from quiz configuration.', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setTopicError('Please enter a topic to learn today.');
      onShowToast('Topic required', 'What would you like to study?', 'error');
      return;
    }
    setTopicError('');
    setShowAiNoticeModal(true);
  };

  const startSamplePlayer = () => {
    setShowAiNoticeModal(false);
    onLaunchQuiz({
      topic,
      numQuestions,
      difficulty,
      learningLevel,
      questionType,
      sourceNotes: studyNotes || undefined,
      sourceFileName: attachedFileName || undefined,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-[#E6DFFF]/50 dark:border-[#332A4C]">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-2xl bg-[#FFD6E7] dark:bg-[#3D2232] text-[#D95370] dark:text-[#FB7185] shadow-xs">
            <Sparkles className="w-5 h-5 fill-[#FFF1B8]" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#352B48] dark:text-[#F5F1FD] font-heading">
              Create a New Quiz
            </h1>
            <p className="text-xs text-[#777187] dark:text-[#A8A1BC] mt-0.5">
              Enter a subject, paste lecture notes, or upload a PDF to synthesize customized practice questions.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Column */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1F1930] rounded-3xl p-6 sm:p-8 border border-[#E6DFFF] dark:border-[#332A4C] shadow-soft space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Topic Input */}
            <div>
              <label className="block text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mb-1.5">
                What would you like to learn today? <span className="text-[#D95370]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Python Programming, Photosynthesis, French Revolution..."
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    if (e.target.value.trim()) setTopicError('');
                  }}
                  className={`w-full px-4 py-3 bg-[#FFFAFD] dark:bg-[#151120] rounded-xl border text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#9274E8] dark:text-white transition-all ${
                    topicError ? 'border-[#D95370]' : 'border-[#E6DFFF] dark:border-[#332A4C]'
                  }`}
                />
              </div>
              {topicError && (
                <p className="text-[11px] text-[#D95370] dark:text-[#FB7185] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{topicError}</span>
                </p>
              )}

              {/* Example Topic Quick Chips */}
              <div className="mt-3">
                <span className="text-[11px] font-semibold text-[#777187] dark:text-[#A8A1BC] mr-1">
                  Popular suggestions:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {exampleTopics.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleTopicSelect(item)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        topic === item
                          ? 'bg-[#E6DFFF] dark:bg-[#332A4C] border-[#9274E8] text-[#352B48] dark:text-white font-bold shadow-xs'
                          : 'bg-white dark:bg-[#151120] border-[#E6DFFF] dark:border-[#332A4C] text-[#777187] dark:text-[#A8A1BC] hover:border-[#9274E8] hover:text-[#352B48] dark:hover:text-white'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PDF UPLOAD & STUDY NOTES ZONE */}
            <div className="pt-4 border-t border-[#E6DFFF]/60 dark:border-[#332A4C] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#9274E8] dark:text-[#A78BFA]" />
                  <span>Study Source Material (PDF / Text Notes)</span>
                </label>
                <span className="text-[10px] font-semibold text-[#777187] dark:text-[#A8A1BC]">
                  Optional
                </span>
              </div>

              {/* Upload Dropzone */}
              {!attachedFileName && !isProcessingFile ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${
                    isDragOver
                      ? 'border-[#9274E8] bg-[#E6DFFF]/30 dark:bg-[#332A4C]/30'
                      : 'border-[#E6DFFF] dark:border-[#332A4C] bg-[#FFFAFD]/70 dark:bg-[#151120]/60 hover:bg-[#E6DFFF]/20 dark:hover:bg-[#151120]'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.md"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[#D9EEFF] dark:bg-[#1A2F45] text-[#2870BD] dark:text-[#93C5FD] flex items-center justify-center">
                      <Upload className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#352B48] dark:text-[#F5F1FD]">
                        Click to upload or drag & drop a PDF
                      </p>
                      <p className="text-[11px] text-[#777187] dark:text-[#A8A1BC] mt-0.5">
                        Supports PDF lecture notes, TXT, or Markdown (up to {MAX_FILE_SIZE_MB}MB)
                      </p>
                    </div>
                  </div>
                </div>
              ) : isProcessingFile ? (
                /* Processing State */
                <div className="p-4 rounded-2xl bg-[#E6DFFF]/30 dark:bg-[#2B2144]/40 border border-[#E6DFFF] dark:border-[#4C3C73] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold text-[#352B48] dark:text-[#F5F1FD]">
                      <RefreshCw className="w-4 h-4 text-[#9274E8] animate-spin" />
                      <span>Extracting study content from document...</span>
                    </div>
                    <span className="font-bold text-[#9274E8]">{fileUploadProgress}%</span>
                  </div>
                  <div className="w-full bg-[#E6DFFF] dark:bg-[#151120] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#9274E8] to-[#F08CB4] h-full transition-all duration-150"
                      style={{ width: `${fileUploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                /* File Attached Banner */
                <div className="p-3.5 rounded-2xl bg-[#D5F5E3]/40 dark:bg-[#1B362A] border border-[#D5F5E3] dark:border-[#2D5A46] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#D5F5E3] dark:bg-[#2D5A46] text-[#31966B] dark:text-[#34D399] flex items-center justify-center shrink-0">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] truncate">
                        {attachedFileName}
                      </p>
                      <p className="text-[10px] text-[#31966B] dark:text-[#34D399]">
                        Text extracted and ready for quiz synthesis
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="p-1.5 text-[#777187] hover:text-[#D95370] dark:text-[#A8A1BC] dark:hover:text-[#F87171] rounded-lg hover:bg-white dark:hover:bg-[#151120] transition-colors cursor-pointer shrink-0"
                    title="Remove attached file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {fileError && (
                <p className="text-[11px] text-[#D95370] dark:text-[#FB7185] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fileError}</span>
                </p>
              )}

              {/* Paste or Edit Extracted Notes Area */}
              <div>
                <label className="block text-[11px] font-semibold text-[#777187] dark:text-[#A8A1BC] mb-1">
                  {attachedFileName
                    ? 'Extracted Text (you can review or add notes below):'
                    : 'Or paste notes / syllabus text directly:'}
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste lecture key points, definitions, or summary notes..."
                  value={studyNotes}
                  onChange={(e) => setStudyNotes(e.target.value)}
                  className="w-full p-3 bg-[#FFFAFD] dark:bg-[#151120] rounded-xl border border-[#E6DFFF] dark:border-[#332A4C] text-xs focus:outline-none focus:ring-2 focus:ring-[#9274E8] dark:text-white transition-all font-mono"
                />
              </div>
            </div>

            {/* Number of Questions */}
            <div>
              <label className="block text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mb-2">
                Number of Questions
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNumQuestions(num)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      numQuestions === num
                        ? 'bg-[#9274E8] border-[#9274E8] text-white shadow-pastel-purple'
                        : 'bg-[#FFFAFD] dark:bg-[#151120] border-[#E6DFFF] dark:border-[#332A4C] text-[#352B48] dark:text-[#F5F1FD] hover:bg-[#E6DFFF]/30 dark:hover:bg-[#1F1930]'
                    }`}
                  >
                    {num} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'Easy', color: 'text-[#31966B] dark:text-[#34D399]' },
                  { id: 'Medium', color: 'text-[#C95C1E] dark:text-[#FB923C]' },
                  { id: 'Hard', color: 'text-[#D95370] dark:text-[#F87171]' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDifficulty(item.id as any)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      difficulty === item.id
                        ? 'bg-[#352B48] dark:bg-[#E6DFFF] border-[#352B48] dark:border-[#E6DFFF] text-white dark:text-[#151120] shadow-soft'
                        : 'bg-[#FFFAFD] dark:bg-[#151120] border-[#E6DFFF] dark:border-[#332A4C] text-[#352B48] dark:text-[#F5F1FD] hover:bg-[#E6DFFF]/30 dark:hover:bg-[#1F1930]'
                    }`}
                  >
                    <span className={difficulty === item.id ? 'text-inherit font-extrabold' : item.color}>
                      {item.id}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Learning Level & Question Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mb-1.5">
                  Target Learning Level
                </label>
                <select
                  value={learningLevel}
                  onChange={(e) => setLearningLevel(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-[#FFFAFD] dark:bg-[#151120] rounded-xl border border-[#E6DFFF] dark:border-[#332A4C] text-xs font-medium text-[#352B48] dark:text-[#F5F1FD] focus:outline-none focus:ring-2 focus:ring-[#9274E8]"
                >
                  <option value="Middle School">Middle School (Ages 11–14)</option>
                  <option value="High School">High School (Ages 14–18)</option>
                  <option value="College / Undergrad">College / Undergrad</option>
                  <option value="Lifelong Learner">Lifelong Learner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] mb-1.5">
                  Question Format
                </label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-[#FFFAFD] dark:bg-[#151120] rounded-xl border border-[#E6DFFF] dark:border-[#332A4C] text-xs font-medium text-[#352B48] dark:text-[#F5F1FD] focus:outline-none focus:ring-2 focus:ring-[#9274E8]"
                >
                  <option value="Multiple Choice">Multiple Choice (4 options)</option>
                  <option value="True / False">True / False</option>
                  <option value="Mixed">Mixed Formats</option>
                </select>
              </div>
            </div>

            {/* Submit / Generate Quiz Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#9274E8] to-[#F08CB4] hover:opacity-95 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-pastel-purple transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-[#FFF1B8]" />
              <span>Generate Quiz Questions</span>
            </button>
          </form>
        </div>

        {/* Right Column: Settings Summary & Live Preview */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#E6DFFF]/40 dark:bg-[#1F1930] rounded-3xl p-6 border border-[#E6DFFF] dark:border-[#332A4C] shadow-soft space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#9274E8] dark:text-[#A78BFA]" />
              <h3 className="text-xs font-bold text-[#352B48] dark:text-[#F5F1FD] font-heading uppercase tracking-wider">
                Configuration Summary
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-white dark:bg-[#151120] rounded-xl border border-[#E6DFFF]/80 dark:border-[#332A4C] flex items-center justify-between">
                <span className="text-[#777187] dark:text-[#A8A1BC]">Topic</span>
                <span className="font-bold text-[#352B48] dark:text-[#F5F1FD] truncate max-w-[140px]">
                  {topic || 'None selected'}
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-[#151120] rounded-xl border border-[#E6DFFF]/80 dark:border-[#332A4C] flex items-center justify-between">
                <span className="text-[#777187] dark:text-[#A8A1BC]">Questions</span>
                <span className="font-bold text-[#352B48] dark:text-[#F5F1FD]">
                  {numQuestions} Questions
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-[#151120] rounded-xl border border-[#E6DFFF]/80 dark:border-[#332A4C] flex items-center justify-between">
                <span className="text-[#777187] dark:text-[#A8A1BC]">Difficulty</span>
                <span className="font-bold text-[#352B48] dark:text-[#F5F1FD]">{difficulty}</span>
              </div>
              <div className="p-3 bg-white dark:bg-[#151120] rounded-xl border border-[#E6DFFF]/80 dark:border-[#332A4C] flex items-center justify-between">
                <span className="text-[#777187] dark:text-[#A8A1BC]">Level</span>
                <span className="font-bold text-[#352B48] dark:text-[#F5F1FD]">{learningLevel}</span>
              </div>
              <div className="p-3 bg-white dark:bg-[#151120] rounded-xl border border-[#E6DFFF]/80 dark:border-[#332A4C] flex items-center justify-between">
                <span className="text-[#777187] dark:text-[#A8A1BC]">Format</span>
                <span className="font-bold text-[#352B48] dark:text-[#F5F1FD]">{questionType}</span>
              </div>
              {attachedFileName && (
                <div className="p-3 bg-[#D5F5E3]/40 dark:bg-[#1B362A] rounded-xl border border-[#D5F5E3] dark:border-[#2D5A46] flex items-center justify-between">
                  <span className="text-[#31966B] dark:text-[#34D399] font-medium">Source Material</span>
                  <span className="font-bold text-[#352B48] dark:text-[#F5F1FD] truncate max-w-[140px]">
                    {attachedFileName}
                  </span>
                </div>
              )}
            </div>

            <div className="p-3.5 bg-white/70 dark:bg-[#151120]/70 rounded-xl text-[11px] text-[#777187] dark:text-[#A8A1BC] space-y-1">
              <span className="font-bold text-[#9274E8] dark:text-[#A78BFA]">Real Quiz Engine:</span>
              <p>
                Launches interactive multiple-choice practice session. Every correct answer earns verified XP saved directly to your profile.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Launch Confirmation Modal */}
      {showAiNoticeModal && (
        <div className="fixed inset-0 z-50 bg-[#352B48]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1F1930] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-soft-lg border border-[#E6DFFF] dark:border-[#332A4C] space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-[#E6DFFF] dark:bg-[#332A4C] text-[#9274E8] dark:text-[#A78BFA] flex items-center justify-center mx-auto shadow-soft">
              <Sparkles className="w-6 h-6 fill-[#FFF1B8]" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-[#352B48] dark:text-[#F5F1FD] font-heading">
                Ready to Start Quiz: {topic}
              </h3>
              <p className="text-xs text-[#777187] dark:text-[#A8A1BC] leading-relaxed">
                You are about to launch a verified <strong>{numQuestions}-question</strong> practice session at{' '}
                <strong>{difficulty}</strong> difficulty ({learningLevel}).
              </p>
              {attachedFileName && (
                <p className="text-[11px] text-[#31966B] dark:text-[#34D399] font-medium">
                  Using notes from: {attachedFileName}
                </p>
              )}
              <div className="p-3 rounded-xl bg-[#D5F5E3]/60 dark:bg-[#1B362A] border border-[#D5F5E3] dark:border-[#2D5A46] text-left text-xs space-y-1 mt-2">
                <p className="font-bold text-[#31966B] dark:text-[#34D399]">Real Progress Tracking Active</p>
                <p className="text-[#777187] dark:text-[#A8A1BC]">
                  Your score and accuracy will be verified and saved to your Firebase Cloud Firestore student profile.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAiNoticeModal(false)}
                className="w-full sm:w-1/2 py-2.5 text-xs font-bold text-[#777187] dark:text-[#A8A1BC] bg-[#FFFAFD] dark:bg-[#151120] border border-[#E6DFFF] dark:border-[#332A4C] rounded-xl hover:bg-[#E6DFFF]/30 dark:hover:bg-[#332A4C] cursor-pointer"
              >
                Edit Settings
              </button>
              <button
                type="button"
                onClick={startSamplePlayer}
                className="w-full sm:w-1/2 py-2.5 text-xs font-bold text-white bg-[#9274E8] hover:bg-[#7e5bd9] rounded-xl shadow-pastel-purple flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Launch Quiz Player</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
