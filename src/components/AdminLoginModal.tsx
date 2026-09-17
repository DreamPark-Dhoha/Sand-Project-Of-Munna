import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Shield, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2, X, Sparkles } from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const { language, showLoginModal, setShowLoginModal, loginAdmin } = useApp();
  const t = translations[language];

  const [username, setUsername] = useState('MunnaSand2026');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!showLoginModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const res = loginAdmin(username, password);
    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setPassword('');
        setShowLoginModal(false);
      }, 500);
    } else {
      setErrorMsg(res.message || t.loginErrorMsg);
    }
  };

  const handleQuickFill = () => {
    setUsername('MunnaSand2026');
    setPassword('MS12345');
    setErrorMsg(null);
  };

  const handleClose = () => {
    setErrorMsg(null);
    setIsSuccess(false);
    setShowLoginModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-login-heading"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-5 text-white relative">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title={t.cancel}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center border border-white/20 shadow-inner">
              <Shield className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h3 id="admin-login-heading" className="text-lg font-bold text-white tracking-tight">
                {t.adminLoginTitle}
              </h3>
              <p className="text-xs text-amber-100 font-medium">
                {t.adminLoginSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t.loginSuccessMsg}</span>
            </div>
          )}

          {/* Quick Credential Badge & Autofill */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 flex items-center justify-between gap-2 text-xs">
            <div className="space-y-0.5 text-slate-700">
              <div className="font-semibold text-amber-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{language === 'bn' ? 'অ্যাডমিন তথ্য:' : 'Admin Credentials:'}</span>
              </div>
              <div className="text-[11px] text-slate-600 font-mono">
                User: <span className="font-bold text-slate-800">MunnaSand2026</span> | Pass: <span className="font-bold text-slate-800">MS12345</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg shadow-2xs transition-colors shrink-0"
            >
              {language === 'bn' ? 'অটো-ফিল' : 'Auto Fill'}
            </button>
          </div>

          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              {t.usernameLabel}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="admin-login-username"
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="MunnaSand2026"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              {t.passwordLabel}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="admin-login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              id="admin-login-submit-btn"
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{t.loginBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
