import React from 'react';
import { Sparkles, Sun, Moon, BarChart3, Share2, Award } from 'lucide-react';
import { Theme } from '../utils/useTheme';
import { OverallProgressStats } from '../data/testHistoryEngine';

interface HeaderProps {
  activeTab: 'chapters' | 'mocks' | 'mistakes' | 'notes';
  onSelectTab: (tab: 'chapters' | 'mocks' | 'mistakes' | 'notes') => void;
  onOpenCustomTest: () => void;
  mistakeCount: number;
  theme: Theme;
  onToggleTheme: () => void;
  progressStats: OverallProgressStats;
  onOpenProgressModal: () => void;
  onOpenShareModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenCustomTest,
  mistakeCount,
  theme,
  onToggleTheme,
  progressStats,
  onOpenProgressModal,
  onOpenShareModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6 px-3 sm:px-6 py-3">
        {/* Zone 1: Brand Wordmark */}
        <div 
          onClick={() => onSelectTab('chapters')}
          className="cursor-pointer flex items-center gap-2.5 whitespace-nowrap shrink-0 group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-base transition-colors group-hover:border-emerald-500 shadow-xs">
            ल
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
            LallanTop Pariksha
          </span>
        </div>

        {/* Zone 2: Clean Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onSelectTab('chapters')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'chapters' 
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-500' 
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            अध्याय टेस्ट (78 Chapters)
          </button>
          <button
            onClick={() => onSelectTab('mocks')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'mocks' 
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-500' 
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            मॉक टेस्ट सीरीज (100 Qs)
          </button>
          <button
            onClick={() => onSelectTab('mistakes')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'mistakes' 
                ? 'text-amber-600 dark:text-amber-400 font-semibold border-b-2 border-amber-500' 
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            गलतियों की डायरी {mistakeCount > 0 ? `(${mistakeCount})` : ''}
          </button>
          <button
            onClick={() => onSelectTab('notes')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'notes' 
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-500' 
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            रिवीजन बुलेटिन
          </button>
        </nav>

        {/* Zone 3: Visual Progress Tracker + Share + Day/Night + CTA */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* USER REQUEST: Visual Progress Tracker in Header */}
          <button
            onClick={onOpenProgressModal}
            className="group flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/60 transition-all text-left shadow-xs"
            title="क्लिक करके पूरा अध्याय प्रगति विश्लेषण देखें"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col min-w-[70px] sm:min-w-[95px]">
              <div className="flex items-center justify-between gap-1 text-[11px] leading-tight font-bold text-slate-800 dark:text-slate-100">
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  {progressStats.percentage}%
                </span>
                <span className="text-[10px] text-slate-500 font-normal hidden sm:inline">
                  {progressStats.completedCount}/{progressStats.totalChapters} Ch
                </span>
              </div>
              {/* Visual mini progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(progressStats.percentage, 3)}%` }}
                />
              </div>
            </div>
          </button>

          {/* USER REQUEST: Public Sharing / Live Link Button */}
          <button
            onClick={onOpenShareModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-xs font-semibold shadow-xs"
            title="सार्वजनिक लाइव लिंक शेयर करें (Share Public App Link)"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">शेयर</span>
          </button>

          {/* Day / Night Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 transition-colors"
            title={theme === 'dark' ? "डे मोड में बदलें (Day Mode)" : "नाइट मोड में बदलें (Night Mode)"}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Custom Test Action */}
          <button
            onClick={onOpenCustomTest}
            className="hidden sm:flex px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>कस्टम टेस्ट</span>
          </button>
        </div>
      </div>

      {/* Mobile nav strip */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800/80 px-2 py-2 bg-slate-100/90 dark:bg-slate-900/60 text-xs">
        <button
          onClick={() => onSelectTab('chapters')}
          className={`px-2 py-1 rounded ${activeTab === 'chapters' ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-600 dark:text-slate-400'}`}
        >
          अध्याय
        </button>
        <button
          onClick={() => onSelectTab('mocks')}
          className={`px-2 py-1 rounded ${activeTab === 'mocks' ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-600 dark:text-slate-400'}`}
        >
          मॉक टेस्ट
        </button>
        <button
          onClick={() => onSelectTab('mistakes')}
          className={`px-2 py-1 rounded ${activeTab === 'mistakes' ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-slate-600 dark:text-slate-400'}`}
        >
          गलतियाँ ({mistakeCount})
        </button>
        <button
          onClick={() => onSelectTab('notes')}
          className={`px-2 py-1 rounded ${activeTab === 'notes' ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-600 dark:text-slate-400'}`}
        >
          रिवीजन
        </button>
        <button
          onClick={onOpenProgressModal}
          className="px-2 py-1 rounded text-emerald-600 dark:text-emerald-400 font-bold"
        >
          {progressStats.percentage}% पूर्ण
        </button>
      </div>
    </header>
  );
};

