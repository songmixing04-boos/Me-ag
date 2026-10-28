import React, { useState } from 'react';
import { ALL_CHAPTERS } from '../data/syllabus';
import { SubjectType, ExamConfig } from '../types/quiz';
import { Sparkles, X, Sliders, Check } from 'lucide-react';

interface CustomTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCustomTest: (config: ExamConfig, useDynamic: boolean) => void;
}

export const CustomTestModal: React.FC<CustomTestModalProps> = ({
  isOpen,
  onClose,
  onStartCustomTest,
}) => {
  if (!isOpen) return null;

  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('physics');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(50);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [markingScheme, setMarkingScheme] = useState<'neet' | 'aiims' | 'cnet'>('aiims');
  const [useDynamic, setUseDynamic] = useState<boolean>(false);

  const chaptersForSubject = ALL_CHAPTERS.filter(c => c.subject === selectedSubject);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let positiveMarks = 1;
    let negativeMarks = 0.33;

    if (markingScheme === 'neet') {
      positiveMarks = 4;
      negativeMarks = 1;
    } else if (markingScheme === 'cnet') {
      positiveMarks = 1;
      negativeMarks = 0;
    }

    const chapterObj = ALL_CHAPTERS.find(c => c.id === selectedChapterId);
    const title = selectedChapterId === 'all' 
      ? `कस्टम टेस्ट: ${selectedSubject.toUpperCase()} (${questionCount} प्रश्न)`
      : `${chapterObj?.nameHi || 'कस्टम अध्याय'} टेस्ट (${questionCount} प्रश्न)`;

    const config: ExamConfig = {
      id: `custom-${Date.now()}`,
      title,
      subtitle: `LallanTop Pariksha Custom Practice · ${durationMinutes} Mins`,
      examType: 'all',
      totalQuestions: questionCount,
      durationMinutes,
      positiveMarks,
      negativeMarks,
      subjects: [selectedSubject],
      mode: selectedChapterId === 'all' ? 'custom' : 'chapter',
      chapterId: selectedChapterId === 'all' ? undefined : selectedChapterId,
    };

    onStartCustomTest(config, useDynamic);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-xl transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              अपनी पसंद का टेस्ट बनाएं (Custom Test Generator)
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Subject Selection */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">विषय चुनें (Select Subject):</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'physics', label: 'भौतिक विज्ञान' },
                { id: 'chemistry', label: 'रसायन विज्ञान' },
                { id: 'biology', label: 'जीव विज्ञान' },
                { id: 'nursing_aptitude', label: 'नर्सिंग अभिरुचि' },
              ].map(sub => (
                <button
                  type="button"
                  key={sub.id}
                  onClick={() => { setSelectedSubject(sub.id as any); setSelectedChapterId('all'); }}
                  className={`p-2 rounded-lg border text-center transition-colors ${
                    selectedSubject === sub.id
                      ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-500 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chapter Selection */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">अध्याय चुनें (Select Chapter):</label>
            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 text-xs transition-colors"
            >
              <option value="all">सम्पूर्ण विषय (All Chapters Combined)</option>
              {chaptersForSubject.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nameHi} ({c.nameEn})
                </option>
              ))}
            </select>
          </div>

          {/* Questions Count & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">प्रश्नों की संख्या (Questions):</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[10, 25, 50, 100].map(cnt => (
                  <button
                    type="button"
                    key={cnt}
                    onClick={() => {
                      setQuestionCount(cnt);
                      setDurationMinutes(cnt <= 10 ? 15 : cnt <= 25 ? 30 : cnt <= 50 ? 50 : 100);
                    }}
                    className={`py-1.5 rounded-lg border text-center font-mono font-semibold transition-colors ${
                      questionCount === cnt
                        ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">समय (Minutes):</label>
              <input
                type="number"
                min="5"
                max="180"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Marking Scheme */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">मार्किंग स्कीम (Marking Scheme):</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMarkingScheme('aiims')}
                className={`p-2 rounded-lg border text-center transition-colors ${
                  markingScheme === 'aiims' ? 'bg-emerald-50 dark:bg-slate-800 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-semibold shadow-xs' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div>AIIMS Nursing</div>
                <div className="font-mono text-[10px] text-slate-500">+1 / -0.33</div>
              </button>
              <button
                type="button"
                onClick={() => setMarkingScheme('neet')}
                className={`p-2 rounded-lg border text-center transition-colors ${
                  markingScheme === 'neet' ? 'bg-emerald-50 dark:bg-slate-800 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-semibold shadow-xs' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div>NEET / BCECE</div>
                <div className="font-mono text-[10px] text-slate-500">+4 / -1</div>
              </button>
              <button
                type="button"
                onClick={() => setMarkingScheme('cnet')}
                className={`p-2 rounded-lg border text-center transition-colors ${
                  markingScheme === 'cnet' ? 'bg-emerald-50 dark:bg-slate-800 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-semibold shadow-xs' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div>UP CNET</div>
                <div className="font-mono text-[10px] text-slate-500">+1 / 0 (No Neg)</div>
              </button>
            </div>
          </div>

          {/* Dynamic Question Generator Toggle */}
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5 pr-2">
              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>डायनामिक ताज़ा NCERT प्रश्न जेनरेटर</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                चयनित अध्याय के मुख्य बिंदुओं से नए एवं अद्वितीय प्रश्नों का सेट बनाएं
              </p>
            </div>
            <input
              type="checkbox"
              checked={useDynamic}
              onChange={(e) => setUseDynamic(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors text-xs shadow-xs"
          >
            कस्टम टेस्ट प्रारंभ करें (Start Test)
          </button>
        </form>
      </div>
    </div>
  );
};
