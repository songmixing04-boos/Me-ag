import React, { useState } from 'react';
import { ALL_CHAPTERS } from '../data/syllabus';
import { BookOpen, Zap, Search, Bookmark, Check } from 'lucide-react';

export const RevisionNotes: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<'physics' | 'chemistry' | 'biology' | 'nursing_aptitude'>('physics');
  const [searchFilter, setSearchFilter] = useState('');

  const chapters = ALL_CHAPTERS.filter(c => c.subject === selectedSubject);

  const filteredChapters = chapters.filter(c => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return c.nameEn.toLowerCase().includes(q) || c.nameHi.includes(q) || c.keyTopics.some(t => t.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-100 to-emerald-500/5 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/40 border border-slate-200 dark:border-slate-800 p-6 md:p-8 transition-colors">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span>High-Yield NCERT Bullet Points & Formulas</span>
            <span aria-hidden="true">·</span>
            <span>Last Minute Revision</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            रिवीजन बुलेटिन एवं सूत्र संग्रह (Quick Revision Notes)
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            प्रत्येक अध्याय के मुख्य सूत्र, रासायनिक अभिक्रियाएँ, नियम एवं जैविक प्रक्रमों का त्वरित पुनरावलोकन। परीक्षा से 30 मिनट पहले रिवीजन के लिए अत्यंत उपयोगी।
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'physics', label: 'भौतिक विज्ञान (Physics)' },
            { id: 'chemistry', label: 'रसायन विज्ञान (Chemistry)' },
            { id: 'biology', label: 'जीव विज्ञान (Biology)' },
            { id: 'nursing_aptitude', label: 'नर्सिंग अभिरुचि' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedSubject(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedSubject === tab.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="टॉपिक या सूत्र खोजें..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Chapter Revision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredChapters.map((chapter) => (
          <div
            key={chapter.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-medium text-emerald-600 dark:text-emerald-400">{chapter.unit}</span>
              <span>{chapter.ncertRef}</span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {chapter.nameHi}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {chapter.nameEn}
              </p>
            </div>

            {/* Bullet points for chapter */}
            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800/80 space-y-2 text-xs">
              <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                अति-महत्वपूर्ण NCERT तथ्य एवं सूत्र:
              </div>
              <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 list-disc list-inside leading-relaxed">
                {chapter.keyTopics.map((topic, i) => (
                  <li key={i}>
                    <strong className="text-slate-900 dark:text-white">{topic}:</strong> परीक्षा में प्रायः सीधे प्रश्न एवं संख्यात्मक मान पूछे जाते हैं।
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
