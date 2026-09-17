import React, { useState } from 'react';
import { useApp, ADMIN_CREDENTIALS } from '../context/AppContext';
import { translations } from '../translations';
import {
  Waves,
  Globe,
  UserCheck,
  Shield,
  Download,
  Upload,
  RotateCcw,
  Menu,
  X,
  Printer,
  Lock,
  LogOut,
  Trash2,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const {
    language,
    setLanguage,
    userRole,
    setUserRole,
    exportJSON,
    importJSON,
    isAdminAuthenticated,
    logoutAdmin,
    setShowLoginModal,
    setShowDataCleanModal,
    isDemoData
  } = useApp();
  const t = translations[language];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  const navItems = [
    { id: 'dashboard', label: t.dashboard },
    { id: 'extraction', label: t.extraction },
    { id: 'stockpile', label: t.stockpile },
    { id: 'sales', label: t.sales },
    { id: 'customers', label: t.customerLedger },
    { id: 'expenses', label: t.expenses },
    { id: 'shareholders', label: t.shareholders },
    { id: 'reports', label: t.reports }
  ];

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const success = importJSON(content);
        if (success) {
          alert(language === 'bn' ? 'ডাটা ব্যাকআপ সফলভাবে রিস্টোর হয়েছে!' : 'Data backup restored successfully!');
        } else {
          alert(language === 'bn' ? 'ভুল ফাইল ফরম্যাট! ব্যাকআপ রিস্টোর ব্যর্থ।' : 'Invalid file format! Restore failed.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-xs">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight flex items-center gap-1.5">
                {t.appTitle}
              </span>
              <p className="text-xs text-amber-700 font-medium hidden sm:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map(item => (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-amber-50 text-amber-900 border border-amber-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Action Controls: Role, Language, Backup, Mobile menu */}
          <div className="flex items-center gap-2">
            {/* User Role Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                id="role-admin-btn"
                onClick={() => setUserRole('admin')}
                title={userRole === 'admin' && isAdminAuthenticated ? `${t.adminAccessDesc} (${ADMIN_CREDENTIALS.username})` : t.unlockAdmin}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                  userRole === 'admin'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isAdminAuthenticated ? (
                  <Shield className="w-3.5 h-3.5" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span className="hidden sm:inline">{t.roleBadgeAdmin}</span>
              </button>

              {userRole === 'admin' && isAdminAuthenticated && (
                <button
                  id="admin-logout-btn"
                  onClick={() => logoutAdmin()}
                  title={t.logoutBtn}
                  className="p-1 text-white hover:bg-amber-700 rounded-md transition-colors mr-1"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              )}

              <button
                id="role-shareholder-btn"
                onClick={() => setUserRole('shareholder')}
                title={t.shareholderAccessDesc}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                  userRole === 'shareholder'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.roleBadgeShareholder}</span>
              </button>
            </div>

            {/* Language Toggle */}
            <button
              id="lang-toggle-btn"
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>

            {/* Print Shortcut */}
            <button
              id="quick-print-btn"
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors"
              title={t.printReport}
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
            </button>

            {/* Quick Start Fresh Action for Demo/New Users */}
            {isDemoData && (
              <button
                id="nav-start-fresh-btn"
                onClick={() => setShowDataCleanModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-all shadow-2xs hover:shadow-xs"
                title={t.startFreshMenu}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>{t.startFreshMenu}</span>
              </button>
            )}

            {/* Backup / Restore / Data Clean Menu */}
            <div className="relative">
              <button
                id="backup-menu-btn"
                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center gap-1"
                title="Backup, Clean & Settings"
              >
                <Download className="w-4 h-4" />
              </button>

              {showSettingsDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => {
                      exportJSON();
                      setShowSettingsDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>{t.backupData} (JSON)</span>
                  </button>

                  <label className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span>{t.restoreData}</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={e => {
                        handleImportFile(e);
                        setShowSettingsDropdown(false);
                      }}
                      className="hidden"
                    />
                  </label>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    id="dropdown-start-fresh-btn"
                    onClick={() => {
                      setShowSettingsDropdown(false);
                      setShowDataCleanModal(true);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-amber-900 hover:bg-amber-50 flex items-center gap-2.5 font-bold"
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span className="flex-1">{t.startFreshMenu}</span>
                    {isDemoData && (
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">New</span>
                    )}
                  </button>

                  <button
                    id="open-data-clean-btn"
                    onClick={() => {
                      setShowSettingsDropdown(false);
                      setShowDataCleanModal(true);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-semibold"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>{t.cleanDataMenu}</span>
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  {isAdminAuthenticated ? (
                    <button
                      onClick={() => {
                        logoutAdmin();
                        setShowSettingsDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <LogOut className="w-4 h-4 text-amber-600" />
                      <span>{t.logoutBtn} ({ADMIN_CREDENTIALS.username})</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowLoginModal(true);
                        setShowSettingsDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-amber-800 hover:bg-amber-50 flex items-center gap-2.5 font-semibold"
                    >
                      <Shield className="w-4 h-4 text-amber-600" />
                      <span>{t.adminLoginTitle}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-200 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                  activeTab === item.id
                    ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="border-t border-slate-100 pt-2 mt-2 space-y-1">
              <button
                onClick={() => {
                  setShowDataCleanModal(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-50 rounded-lg flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{t.startFreshMenu}</span>
                {isDemoData && (
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold ml-auto">New</span>
                )}
              </button>

              <button
                onClick={() => {
                  setShowDataCleanModal(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t.cleanDataMenu}</span>
              </button>

              {!isAdminAuthenticated ? (
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-50 rounded-lg flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>{t.adminLoginTitle}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    logoutAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.logoutBtn} ({ADMIN_CREDENTIALS.username})</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
