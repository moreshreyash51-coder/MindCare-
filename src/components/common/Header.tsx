import React, { useState } from 'react';
import { HeartHandshake, User, Users, Volume2, VolumeX, Eye, Globe, ChevronDown, Check, LogOut, Database, Lock, LogIn, UserPlus, Music } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility, FontSizeOption, LanguageOption } from '../../context/AccessibilityContext';
import { AuthModal } from './AuthModal';
import { SignOutConfirmModal } from '../auth/SignOutConfirmModal';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentView }) => {
  const { user, logout } = useAuth();
  const {
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    voiceAssistance,
    setVoiceAssistance,
    language,
    setLanguage,
    t,
  } = useAccessibility();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [accessMenuOpen, setAccessMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);

  const languages: { code: LanguageOption; label: string; nativeName: string; region: string; category: 'northeast' | 'other' }[] = [
    // North Eastern States
    { code: 'as', label: 'Assamese', nativeName: 'অসমীয়া', region: 'Assam', category: 'northeast' },
    { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', region: 'Tripura & Assam', category: 'northeast' },
    { code: 'mni', label: 'Manipuri', nativeName: 'মৈতৈলোন্', region: 'Manipur', category: 'northeast' },
    { code: 'brx', label: 'Bodo', nativeName: 'बर’', region: 'Bodoland', category: 'northeast' },
    { code: 'lus', label: 'Mizo', nativeName: 'Mizo ṭawng', region: 'Mizoram', category: 'northeast' },
    { code: 'kha', label: 'Khasi', nativeName: 'Ka Ktien Khasi', region: 'Meghalaya', category: 'northeast' },
    { code: 'grt', label: 'Garo', nativeName: 'A·chik', region: 'Meghalaya', category: 'northeast' },
    { code: 'ne', label: 'Nepali', nativeName: 'नेपाली', region: 'Sikkim & Hills', category: 'northeast' },
    { code: 'ao', label: 'Ao / Nagamese', nativeName: 'Nagamese / Ao', region: 'Nagaland', category: 'northeast' },
    { code: 'trp', label: 'Kokborok', nativeName: 'Kokborok', region: 'Tripura', category: 'northeast' },
    // National & International
    { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', region: 'India', category: 'other' },
    { code: 'en', label: 'English', nativeName: 'English', region: 'Global', category: 'other' },
    { code: 'es', label: 'Spanish', nativeName: 'Español', region: 'España / LatAm', category: 'other' },
    { code: 'fr', label: 'French', nativeName: 'Français', region: 'France', category: 'other' },
    { code: 'de', label: 'German', nativeName: 'Deutsch', region: 'Deutschland', category: 'other' },
  ];

  const currentLangObj = languages.find((l) => l.code === language) || languages[11];

  return (
    <header id="main-header" className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <button
            id="brand-logo-btn"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 block leading-tight">
                Mind<span className="text-teal-600">Care</span>
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block">
                {t('memoryCognitiveCompanion')}
              </span>
            </div>
          </button>

          {/* Center User Space Indicator */}
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              {user.role === 'patient' ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-sm font-bold shadow-2xs">
                  <User className="w-4 h-4 text-teal-700" />
                  <span>{t('seniorPatientCompanion')}</span>
                  <span className="bg-teal-700 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                    {t('activeSession')}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-sm font-bold shadow-2xs">
                  <Users className="w-4 h-4 text-indigo-700" />
                  <span>{t('caregiverFamilyPortal')}</span>
                  <span className="bg-indigo-700 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                    {t('activeSession')}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-900 border border-teal-200/80 rounded-2xl text-xs font-extrabold shadow-2xs">
              <HeartHandshake className="w-4 h-4 text-teal-600" />
              <span>Compassionate Care • Easy For Seniors</span>
            </div>
          )}

          {/* Right Action Tools & Accessibility Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Font Size Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200" title="Text Size">
              <button
                id="font-size-normal-btn"
                onClick={() => setFontSize('normal')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  fontSize === 'normal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Normal text size"
              >
                A
              </button>
              <button
                id="font-size-large-btn"
                onClick={() => setFontSize('large')}
                className={`px-2.5 py-1 text-sm font-bold rounded-lg transition-colors cursor-pointer ${
                  fontSize === 'large' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Large text size"
              >
                A+
              </button>
              <button
                id="font-size-xl-btn"
                onClick={() => setFontSize('extra-large')}
                className={`px-2.5 py-1 text-base font-extrabold rounded-lg transition-colors cursor-pointer ${
                  fontSize === 'extra-large' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Extra large text size"
              >
                A++
              </button>
            </div>

            {/* Voice Assistance Button */}
            <button
              id="voice-assistance-toggle"
              onClick={() => setVoiceAssistance(!voiceAssistance)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                voiceAssistance
                  ? 'bg-teal-50 border-teal-300 text-teal-700'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title={voiceAssistance ? 'Voice Assistance is ON' : 'Voice Assistance is OFF'}
              aria-label="Toggle voice guidance"
            >
              {voiceAssistance ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* High Contrast Toggle */}
            <button
              id="high-contrast-toggle"
              onClick={() => setHighContrast(!highContrast)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                highContrast
                  ? 'bg-slate-900 border-slate-900 text-yellow-300'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title="Toggle high readability contrast"
              aria-label="Toggle high contrast"
            >
              <Eye className="w-5 h-5" />
            </button>

            {/* Quick Music Therapy Button */}
            <button
              id="header-music-btn"
              onClick={() => onNavigate('music')}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                currentView === 'music'
                  ? 'bg-teal-700 border-teal-800 text-white font-bold'
                  : 'bg-white border-slate-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300'
              }`}
              title={t('relaxingSongs')}
              aria-label={t('relaxingSongs')}
            >
              <Music className="w-5 h-5" />
              <span className="hidden xl:inline text-xs font-bold">{t('musicTherapy')}</span>
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                id="language-menu-btn"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold cursor-pointer shadow-2xs"
                aria-label="Select language"
                title={`Current language: ${currentLangObj.nativeName} (${currentLangObj.region})`}
              >
                <Globe className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-slate-800">{currentLangObj.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 max-h-[80vh] overflow-y-auto">
                  {/* North Eastern Languages Group */}
                  <div className="px-3.5 py-1.5 bg-teal-50/80 border-b border-teal-100 flex items-center justify-between">
                    <span className="text-[11px] font-black text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🏔️</span> North Eastern States
                    </span>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full">
                      8 States
                    </span>
                  </div>
                  <div className="py-1">
                    {languages
                      .filter((l) => l.category === 'northeast')
                      .map((l) => (
                        <button
                          key={l.code}
                          onClick={() => {
                            setLanguage(l.code);
                            setLangMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-sm transition-colors cursor-pointer text-left ${
                            language === l.code ? 'bg-teal-50 text-teal-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 text-sm">
                              {l.nativeName} <span className="text-xs font-normal text-slate-500">({l.label})</span>
                            </span>
                            <span className="text-[11px] text-teal-700 font-medium">{l.region}</span>
                          </div>
                          {language === l.code && <Check className="w-4 h-4 text-teal-600 shrink-0 ml-2" />}
                        </button>
                      ))}
                  </div>

                  {/* Other Languages */}
                  <div className="px-3.5 py-1.5 bg-slate-100 border-y border-slate-200 mt-1 flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
                      National & International
                    </span>
                  </div>
                  <div className="py-1">
                    {languages
                      .filter((l) => l.category === 'other')
                      .map((l) => (
                        <button
                          key={l.code}
                          onClick={() => {
                            setLanguage(l.code);
                            setLangMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-sm transition-colors cursor-pointer text-left ${
                            language === l.code ? 'bg-teal-50 text-teal-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 text-sm">
                              {l.nativeName} <span className="text-xs font-normal text-slate-500">({l.label})</span>
                            </span>
                            <span className="text-[11px] text-slate-500">{l.region}</span>
                          </div>
                          {language === l.code && <Check className="w-4 h-4 text-teal-600 shrink-0 ml-2" />}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill, Auth & Database Modal Trigger */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-2">
              {user ? (
                <>
                  <button
                    id="header-auth-account-btn"
                    onClick={() => setAuthModalOpen(true)}
                    className="flex items-center gap-2 bg-slate-50 hover:bg-teal-50/80 border border-slate-200/80 hover:border-teal-300 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer text-left"
                    title="Account, Authentication & MongoDB Database"
                  >
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
                      alt={user?.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300"
                    />
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-bold text-slate-800 leading-none">{user?.name}</p>
                      <p className="text-[10px] font-medium text-slate-500 capitalize">{user?.role} • Auth/DB</p>
                    </div>
                  </button>

                  {/* Prominent Easy-to-use Sign Out Button */}
                  <button
                    id="header-signout-btn"
                    onClick={() => setSignOutModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 border border-rose-200 text-xs sm:text-sm font-extrabold cursor-pointer transition-all shadow-2xs"
                    title="Sign Out of MindCare"
                    aria-label="Sign Out of MindCare"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span className="hidden sm:inline">{t('signOut')}</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    id="header-signin-btn"
                    onClick={() => setAuthModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs sm:text-sm font-extrabold cursor-pointer transition-all shadow-2xs"
                  >
                    <LogIn className="w-4 h-4 text-teal-700" />
                    <span>{t('signIn')}</span>
                  </button>

                  <button
                    id="header-register-btn"
                    onClick={() => setAuthModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-extrabold cursor-pointer transition-all shadow-2xs"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('createAccount')}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <SignOutConfirmModal
        isOpen={signOutModalOpen}
        onClose={() => setSignOutModalOpen(false)}
        onConfirm={() => {
          logout();
          onNavigate('dashboard');
        }}
        userName={user?.name}
      />
    </header>
  );
};
