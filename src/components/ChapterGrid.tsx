import React, { useState, useMemo } from 'react';
import { Chapter, SubjectType } from '../types/quiz';
import { ALL_CHAPTERS, MAJOR_UNITS } from '../data/syllabus';
import { Search, Play, Filter, BookOpen, Layers, Flame, ArrowRight } from 'lucide-react';

interface ChapterGridProps {
  onStartChapterTest: (chapter: Chapter, questionCount: number) => void;
  onViewChapterNotes: (chapter: Chapter) => void;
}

export const ChapterGrid: React.FC<ChapterGridProps> = ({
  onStartChapterTest,
  onViewChapterNotes,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyHighYield, setOnlyHighYield] = useState<boolean>(false);

  // Statistics
  const subjectCounts = useMemo(() => {
    return {
      all: ALL_CHAPTERS.length,
      physics: ALL_CHAPTERS.filter(c => c.subject === 'physics').length,
      chemistry: ALL_CHAPTERS.filter(c => c.subject === 'chemistry').length,
      biology: ALL_CHAPTERS.filter(c => c.subject === 'biology').length,
      nursing_aptitude: ALL_CHAPTERS.filter(c => c.subject === 'nursing_aptitude').length,
    };
  }, []);

  // Filtered chapters
  const filteredChapters = useMemo(() => {
    return ALL_CHAPTERS.filter(chapter => {
      if (selectedSubject !== 'all' && chapter.subject !== selectedSubject) {
        return false;
      }
      if (selectedClass !== 'all' && chapter.classLevel !== selectedClass) {
        return false;
      }
      if (onlyHighYield && chapter.weightage !== 'Very High') {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchEn = chapter.nameEn.toLowerCase().includes(q);
        const matchHi = chapter.nameHi.includes(q);
        const matchUnit = chapter.unit.toLowerCase().includes(q);
        const matchTopic = chapter.keyTopics.some(t => t.toLowerCase().includes(q));
        if (!matchEn && !matchHi && !matchUnit && !matchTopic) {
          return false;
        }
      }
      return true;
    });
  }, [selectedSubject, selectedClass, onlyHighYield, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Hero Banner for Chapter Section */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-500/5 via-slate-100 to-emerald-500/10 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/40 border border-slate-200 dark:border-slate-800 p-6 md:p-8 transition-colors">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span>NCERT 11th & 12th Complete Syllabus</span>
            <span aria-hidden="true">·</span>
            <span>AIIMS Nursing & BCECE Target</span>
            <span aria-hidden="true">·</span>
            <span>100+ Questions Per Chapter</span>
            <span aria-hidden="true">·</span>
            <span>क्रम: सरल ➔ मध्यम ➔ कठिन</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
            अध्याय-वार टेस्ट श्रृंखला (Chapter-wise Test Series)
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            प्रत्येक अध्याय के लिए 100+ प्रश्न जो वास्तविक परीक्षा के क्रम में आते हैं: <strong>पहले सरल (Easy)</strong> जिससे बेस मजबूत हो, <strong>फिर मध्यम (Medium)</strong> कॉन्सेप्ट एप्लीकेशन के लिए, और <strong>अंत में कठिन (Hard)</strong> रैंक बूस्टिंग के लिए।
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>भौतिक विज्ञान (27 Chapters)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              <span>रसायन विज्ञान (21 Chapters)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>जीव विज्ञान (32 Chapters)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>नर्सिंग एप्टीट्यूड</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        {/* Subject Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'सभी विषय', count: subjectCounts.all },
            { id: 'physics', label: 'भौतिक विज्ञान (Physics)', count: subjectCounts.physics },
            { id: 'chemistry', label: 'रसायन विज्ञान (Chemistry)', count: subjectCounts.chemistry },
            { id: 'biology', label: 'जीव विज्ञान (Biology)', count: subjectCounts.biology },
            { id: 'nursing_aptitude', label: 'नर्सिंग अभिरुचि', count: subjectCounts.nursing_aptitude },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedSubject(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedSubject === tab.id
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${selectedSubject === tab.id ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Class toggles */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="अध्याय या टॉपिक खोजें..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setSelectedClass('all')}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${selectedClass === 'all' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedClass('11')}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${selectedClass === '11' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              11th
            </button>
            <button
              onClick={() => setSelectedClass('12')}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${selectedClass === '12' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              12th
            </button>
          </div>

          <button
            onClick={() => setOnlyHighYield(!onlyHighYield)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              onlyHighYield
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 font-medium'
                : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="केवल उच्च वेटेज वाले अध्याय दिखाएं"
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">High Yield</span>
          </button>
        </div>
      </div>

      {/* Chapter Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChapters.map((chapter, idx) => (
          <div
            key={chapter.id}
            className="group rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/40 dark:hover:border-slate-700 p-5 transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
          >
            <div className="space-y-3">
              {/* Card Header metadata (clean unboxed text) */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">#{String(idx + 1).padStart(2, '0')}</span>
                  <span aria-hidden="true">·</span>
                  <span>{chapter.subject.toUpperCase()}</span>
                  <span aria-hidden="true">·</span>
                  <span>Class {chapter.classLevel}</span>
                </div>
                <span className={`text-[11px] font-medium ${
                  chapter.weightage === 'Very High' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {chapter.weightage} Weightage
                </span>
              </div>

              {/* Chapter Title */}
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                  {chapter.nameHi}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {chapter.nameEn}
                </p>
              </div>

              {/* Key Topics preview */}
              <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                <span className="text-slate-400 dark:text-slate-500 font-medium">मुख्य बिंदु: </span>
                {chapter.keyTopics.join(', ')}
              </div>

              {/* NCERT & Questions count */}
              <div className="text-[11px] text-slate-500 dark:text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60">
                <span>{chapter.ncertRef}</span>
                <span className="font-mono text-slate-600 dark:text-slate-400">100+ Questions</span>
              </div>
            </div>

            {/* Action Buttons: 20Q, 50Q, 100Q */}
            <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
              <button
                onClick={() => onStartChapterTest(chapter, 20)}
                className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-medium transition-colors text-center border border-slate-200 dark:border-slate-700"
              >
                20Q टेस्ट
              </button>
              <button
                onClick={() => onStartChapterTest(chapter, 50)}
                className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-medium transition-colors text-center border border-slate-200 dark:border-slate-700"
              >
                50Q टेस्ट
              </button>
              <button
                onClick={() => onStartChapterTest(chapter, 100)}
                className="flex-1 py-1.5 px-2 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-700 dark:text-emerald-400 hover:text-slate-950 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 shadow-xs"
              >
                <Play className="w-3 h-3 fill-current" />
                100Q फुल
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredChapters.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-slate-600 dark:text-slate-400 text-sm">कोई अध्याय नहीं मिला जो आपके खोज मापदंड से मेल खाता हो।</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedSubject('all'); setSelectedClass('all'); }}
            className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 underline"
          >
            सभी फ़िल्टर साफ़ करें
          </button>
        </div>
      )}
    </div>
  );
};
