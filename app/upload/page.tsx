'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Trash2,
  Plus,
  ClipboardPaste,
  CheckCircle,
  AlertCircle,
  Loader2,
  BookOpen,
} from 'lucide-react';
import {
  addStudyDocument,
  getStudyDocuments,
  deleteStudyDocument,
  extractTextFromFile,
  type StudyDocument,
} from '@/app/lib/study-content';

const ACCEPTED_TYPES = ['.txt', '.md', '.csv', '.text'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export default function UploadPage() {
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteContent, setPasteContent] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadDocuments = async () => {
    try {
      const docs = await getStudyDocuments();
      setDocuments(docs);
    } catch {
      setToast({ type: 'error', message: 'Failed to load documents' });
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setUploading(true);
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ACCEPTED_TYPES.includes(ext)) {
        showToast('error', `Unsupported file type: ${file.name}. Use .txt or .md files.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        showToast('error', `File too large: ${file.name}. Max size is 2MB.`);
        continue;
      }

      try {
        const content = await extractTextFromFile(file);
        if (!content.trim()) {
          showToast('error', `File is empty: ${file.name}`);
          continue;
        }
        await addStudyDocument(file.name, content);
        showToast('success', `Uploaded: ${file.name}`);
      } catch {
        showToast('error', `Failed to read: ${file.name}`);
      }
    }

    await loadDocuments();
    setUploading(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handlePasteSubmit = async () => {
    const title = pasteTitle.trim() || 'Pasted Content';
    const content = pasteContent.trim();
    if (!content) {
      showToast('error', 'Please enter some content');
      return;
    }
    setUploading(true);
    try {
      await addStudyDocument(title, content);
      showToast('success', `Added: ${title}`);
      setPasteTitle('');
      setPasteContent('');
      setShowPaste(false);
      await loadDocuments();
    } catch {
      showToast('error', 'Failed to save content');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: StudyDocument) => {
    try {
      await deleteStudyDocument(doc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      showToast('success', `Deleted: ${doc.title}`);
    } catch {
      showToast('error', 'Failed to delete document');
    }
  };

  const totalChars = documents.reduce((sum, d) => sum + d.content.length, 0);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 text-gray-900">
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-lg font-bold text-indigo-700 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Study Materials
        </h1>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-12">
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8"
        >
          <h2 className="text-xl font-bold mb-2">Upload Your Study Materials</h2>
          <p className="text-gray-600 text-sm">
            Upload notes, study guides, or any text content. Your materials will be used as context
            by the AI Coach and can generate custom practice quizzes tailored to your content.
          </p>
          {documents.length > 0 && (
            <div className="mt-3 flex gap-4 text-xs text-gray-500">
              <span>{documents.length} document{documents.length !== 1 ? 's' : ''}</span>
              <span>{(totalChars / 1000).toFixed(1)}k characters</span>
            </div>
          )}
        </motion.div>

        {/* Upload Area */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Drag & Drop / File Picker */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
              dragOver
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 bg-white hover:border-indigo-300 hover:bg-indigo-50/30'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.csv,.text"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files);
                e.target.value = '';
              }}
            />
            {uploading ? (
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-3" />
            ) : (
              <Upload className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
            )}
            <p className="font-semibold text-gray-700">
              {dragOver ? 'Drop files here' : 'Drag & drop files'}
            </p>
            <p className="text-sm text-gray-500 mt-1">or click to browse</p>
            <p className="text-xs text-gray-400 mt-3">.txt, .md files up to 2MB</p>
          </motion.div>

          {/* Paste Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border-2 border-dashed border-gray-300 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 p-8 text-center transition-all cursor-pointer"
            onClick={() => setShowPaste(true)}
          >
            <ClipboardPaste className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
            <p className="font-semibold text-gray-700">Paste text</p>
            <p className="text-sm text-gray-500 mt-1">Copy & paste your notes directly</p>
            <p className="text-xs text-gray-400 mt-3">Study guides, notes, summaries</p>
          </motion.div>
        </div>

        {/* Paste Modal */}
        <AnimatePresence>
          {showPaste && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowPaste(false);
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[80vh] flex flex-col"
              >
                <h3 className="text-lg font-bold mb-4">Paste Study Content</h3>
                <input
                  type="text"
                  placeholder="Title (optional)"
                  value={pasteTitle}
                  onChange={(e) => setPasteTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all mb-3"
                />
                <textarea
                  placeholder="Paste your study notes, guides, or any text here..."
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  className="w-full flex-1 min-h-[200px] px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                />
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setShowPaste(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasteSubmit}
                    disabled={uploading || !pasteContent.trim()}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Add Content
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Document List */}
        <div>
          <h3 className="text-lg font-bold mb-4">
            {loading ? 'Loading...' : `Your Documents (${documents.length})`}
          </h3>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No documents yet</p>
              <p className="text-sm mt-1">Upload files or paste text to get started</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {documents.map((doc) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-start gap-4 hover:border-indigo-200 transition-colors"
                  >
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{doc.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {doc.content.slice(0, 200)}
                        {doc.content.length > 200 ? '...' : ''}
                      </p>
                      <div className="flex gap-3 mt-2 text-xs text-gray-400">
                        <span>{(doc.content.length / 1000).toFixed(1)}k chars</span>
                        <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(doc)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium z-50 ${
              toast.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
