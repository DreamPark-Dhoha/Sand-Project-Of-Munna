import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Sparkles, X, Shield, ArrowRight, BookOpen } from 'lucide-react';

export const NewUserWelcomeBanner: React.FC = () => {
  const {
    language,
    isDemoData,
    showNewUserBanner,
    dismissNewUserBanner,
    setShowDataCleanModal,
    isAdminAuthenticated
  } = useApp();
  const t = translations[language];

  if (!showNewUserBanner || !isDemoData) {
    return null;
  }

  return (
    <div
      id="new-user-welcome-banner"
      className="mb-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-500/10 border border-amber-300/80 p-4 sm:p-5 shadow-xs relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs ring-4 ring-amber-200/50">
            <Sparkles className="w-5 h-5" />
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300">
                {language === 'bn' ? '✨ নতুন ব্যবহারকারী' : '✨ New User Guide'}
              </span>
              <span className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>Munna Sand 2026</span>
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {t.newUserBannerTitle}
            </h3>

            <p className="text-xs sm:text-sm text-slate-700 max-w-3xl leading-relaxed">
              {t.newUserBannerDesc}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                id="banner-start-fresh-btn"
                onClick={() => setShowDataCleanModal(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-md"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>{t.startFreshNowBtn}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </button>

              <button
                type="button"
                id="banner-keep-demo-btn"
                onClick={dismissNewUserBanner}
                className="px-3.5 py-2 bg-white/80 hover:bg-white text-slate-700 text-xs font-semibold rounded-xl border border-amber-200 hover:border-amber-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.keepDemoBtn}</span>
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={dismissNewUserBanner}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-amber-200/50 transition-colors"
          title={t.cancel}
          aria-label="Close banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
