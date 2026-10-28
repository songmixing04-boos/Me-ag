import React from 'react';
import { EXAM_PRESETS, MAJOR_UNITS } from '../data/syllabus';
import { Award, Clock, HelpCircle, CheckCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface ExamPresetCardsProps {
  onStartPresetTest: (presetId: string) => void;
  onStartUnitTest: (unitId: string) => void;
  onOpenCustomModal: () => void;
}

export const ExamPresetCards: React.FC<ExamPresetCardsProps> = ({
  onStartPresetTest,
  onStartUnitTest,
  onOpenCustomModal,
}) => {
  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-500/10 via-slate-100 to-indigo-500/5 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-slate-200 dark:border-slate-800 p-6 md:p-8 transition-colors">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            <span>Official Exam Simulation</span>
            <span aria-hidden="true">·</span>
            <span>Real Timer & Marking Scheme</span>
            <span aria-hidden="true">·</span>
            <span>All India Rank Predictor</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">सरल ➔ मध्यम ➔ कठिन क्रम</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
            सम्पूर्ण 100-प्रश्नीय मॉक टेस्ट श्रृंखला (All-India Full Mock Tests)
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            AIIMS B.Sc. Nursing, BCECE, UP CNET एवं NEET की वास्तविक परीक्षा के समान 100 प्रश्न: <strong>पहले सरल प्रश्न (1-35)</strong>, फिर <strong>मध्यम प्रश्न (36-75)</strong>, और अंत में <strong>कठिन व रैंक-बूस्टर प्रश्न (76-100)</strong>। सही उत्तर पर पॉजिटिव अंक एवं गलत उत्तर पर नेगेटिव मार्किंग के साथ वास्तविक परीक्षा अनुभव प्राप्त करें।
          </p>
        </div>
      </div>

      {/* Preset 100Q Mock Test Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>प्रमुख प्रवेश परीक्षा मॉक टेस्ट (100 Questions)</span>
          </h2>
          <button
            onClick={onOpenCustomModal}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-medium flex items-center gap-1"
          >
            <span>कस्टम टेस्ट बनाएं</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EXAM_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 dark:hover:border-slate-700 p-6 transition-all flex flex-col justify-between space-y-5 group shadow-xs hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white uppercase">{preset.examType.replace('_', ' ')}</span>
                    <span aria-hidden="true">·</span>
                    <span>100 MCQs</span>
                  </div>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                    +{preset.positiveMarks} / -{preset.negativeMarks} Marks
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {preset.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {preset.nameHi}
                  </p>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {preset.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>{preset.durationMinutes} मिनट</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>CBT + OMR Mode</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>द्विभाषी (Hindi/Eng)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onStartPresetTest(preset.id)}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>मॉक टेस्ट प्रारंभ करें (Start 100Q Test)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Major Unit Tests Section */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          <span>मेजर यूनिट टेस्ट (Unit-wise Combined Tests)</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          एक साथ कई संबंधित अध्यायों के प्रश्नों का मिश्रण कर गहन विषयवार तैयारी करें।
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MAJOR_UNITS.map((unit) => (
            <div
              key={unit.id}
              className="rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  <span className="uppercase font-medium text-emerald-600 dark:text-emerald-400">{unit.subject}</span>
                  <span aria-hidden="true">·</span>
                  <span>{unit.chapters.length} Chapters Combined</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {unit.titleHi}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {unit.title}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => onStartUnitTest(unit.id)}
                  className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-medium transition-colors border border-slate-200 dark:border-slate-700"
                >
                  यूनिट टेस्ट दें (50 Qs)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
