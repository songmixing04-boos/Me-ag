import React, { useState } from 'react';
import { Question } from '../types/quiz';
import { askDoubtExplanation } from '../services/questionService';
import { Sparkles, X, Send, GraduationCap, Check } from 'lucide-react';

interface DoubtModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DoubtModal: React.FC<DoubtModalProps> = ({
  question,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !question) return null;

  const [studentDoubt, setStudentDoubt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentDoubt.trim()) return;

    setLoading(true);
    setResponse(null);

    const questionContext = `
Question (Hindi): ${question.questionHi}
Question (English): ${question.questionEn}
Options: ${question.optionsHi.join(' | ')}
Correct Answer: Option ${String.fromCharCode(65 + question.correctAnswer)} (${question.optionsHi[question.correctAnswer]})
NCERT Solution: ${question.explanationHi}
    `;

    const answer = await askDoubtExplanation(questionContext, studentDoubt, question.subject);
    setResponse(answer);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] flex flex-col shadow-xl transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                डाउट समाधान (NCERT Concept Tutor)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {question.subject.toUpperCase()} · {question.chapterNameHi}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Snapshot */}
        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 shrink-0">
          <div className="font-semibold text-slate-800 dark:text-slate-200">
            {question.questionHi}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            सही उत्तर: Option {String.fromCharCode(65 + question.correctAnswer)} ({question.optionsHi[question.correctAnswer]})
          </div>
        </div>

        {/* Response Area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          {loading && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 py-6 justify-center">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>NCERT संकल्पना विश्लेषित की जा रही है...</span>
            </div>
          )}

          {response && (
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                <Check className="w-4 h-4" />
                <span>NCERT समाधान व स्पष्टीकरण:</span>
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300">
                {response}
              </div>
            </div>
          )}
        </div>

        {/* Ask Form */}
        <form onSubmit={handleAsk} className="pt-2 border-t border-slate-200 dark:border-slate-800 flex gap-2 shrink-0">
          <input
            type="text"
            value={studentDoubt}
            onChange={(e) => setStudentDoubt(e.target.value)}
            placeholder="जैसे: 'यह विकल्प गलत क्यों है?' या 'फार्मूला समझाएं'..."
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !studentDoubt.trim()}
            className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold rounded-lg transition-colors text-xs flex items-center gap-1 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>पूछें</span>
          </button>
        </form>
      </div>
    </div>
  );
};
