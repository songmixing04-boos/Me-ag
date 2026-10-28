import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageCircle, Send, Globe2, HelpCircle, Sparkles, ExternalLink } from 'lucide-react';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Use the canonical public Cloud Run URL or current origin
  const canonicalUrl = 'https://ais-pre-ooup5blw5sdoue3cgrk7u4-610615240391.asia-northeast1.run.app';
  const currentOrigin = typeof window !== 'undefined' && window.location.origin.includes('run.app') 
    ? window.location.origin 
    : canonicalUrl;
  
  const shareUrl = canonicalUrl;

  const shareText = `🩺 *लल्लनटॉप परीक्षा - BSc Nursing, BCECE, UP CNET, NEET & Paramedical CBT Test Series*\n\n🎯 78 अध्यायों का 100% शुद्ध NCERT द्विभाषी टेस्ट पोर्टल!\n⏱️ असली CBT टाइमर, निगेटिव मार्किंग और डिटेल्ड सॉल्यूशंस।\n\n👉 अभी फ्री टेस्ट दें:\n${shareUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleTelegramShare = () => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent('लल्लनटॉप परीक्षा - 78 अध्यायों का संपूर्ण CBT टेस्ट पोर्टल (BSc Nursing, BCECE, NEET, Paramedical)');
    window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-colors"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-emerald-50/40 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                पब्लिक लाइव लिंक & शेयर (Public Live Link)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                यह ऐप इंटरनेट पर लाइव है और कोई भी छात्र इसे सीधे खोल सकता है
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="font-semibold">क्लाउड सर्वर पर 100% लाइव & एक्टिव</span>
            <span className="ml-auto text-[11px] opacity-80">Free Public Access</span>
          </div>

          {/* Copy URL Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              आपका पब्लिक वेब लिंक (Public URL):
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 dark:text-slate-200 truncate select-all">
                {shareUrl}
              </div>
              <button
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>कॉपी हुआ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>कॉपी करें</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Direct Social Share Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              सीधे दोस्तों / ग्रुप में शेयर करें:
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp पर शेयर</span>
              </button>

              <button
                onClick={handleTelegramShare}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Telegram पर भेजें</span>
              </button>
            </div>
          </div>

          {/* Explanatory Help Card for Cloud Run / Google Cloud Deploy */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <HelpCircle className="w-4 h-4 text-emerald-500" />
              <span>पब्लिक करने से जुड़ी जानकारी (Why this link works):</span>
            </div>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 pl-4 list-disc text-[11px] leading-relaxed">
              <li>
                <strong>बिना लॉगिन खुलता है:</strong> छात्र इस लिंक को किसी भी मोबाइल (Android, iPhone) या कंप्यूटर में सीधे खोल सकते हैं।
              </li>
              <li>
                <strong>API Key एरर का समाधान:</strong> हमने ऐप से API Key की निर्भरता पूरी तरह हटा दी है। अब किसी अतिरिक्त GCP परमिशन की आवश्यकता नहीं है।
              </li>
              <li>
                यदि आप AI Studio के ऊपर बने <strong>Deploy</strong> बटन से अपने स्वयं के Google Cloud प्रोजेक्ट में परमानेंट कस्टम डोमेन लगाना चाहते हैं, तो प्रोजेक्ट लिस्ट में <em>"Create a new Google Cloud Project"</em> चुनकर Deploy कर सकते हैं।
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>नए टैब में टेस्ट लिंक खोलें</span>
          </a>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            ठीक है
          </button>
        </div>
      </div>
    </div>
  );
};
