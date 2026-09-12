import React, { useState } from 'react';
import {
  HeartHandshake,
  User,
  Users,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  Volume2,
  LogIn,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  Brain,
  BookOpen,
  Bell,
  Check,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import {
  DEFAULT_FEMALE_PATIENT_AVATAR,
  DEFAULT_MALE_PATIENT_AVATAR,
  DEFAULT_FEMALE_CAREGIVER_AVATAR,
  DEFAULT_MALE_CAREGIVER_AVATAR,
} from '../../types';

export const AuthLandingView: React.FC = () => {
  const { login, register } = useAuth();
  const { speakText, fontSize } = useAccessibility();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regRole, setRegRole] = useState<'patient' | 'caregiver'>('patient');
  const [regGender, setRegGender] = useState<'female' | 'male'>('female');
  const [regAvatar, setRegAvatar] = useState<string>(DEFAULT_FEMALE_PATIENT_AVATAR);
  const [regEmergencyName, setRegEmergencyName] = useState('');
  const [regEmergencyPhone, setRegEmergencyPhone] = useState('');
  const [regEmergencyRelation, setRegEmergencyRelation] = useState('');
  const [consentChecked, setConsentChecked] = useState(true);

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    if (pass.length < 6) return { score: 1, label: 'Too short (min 6 chars)', color: 'bg-rose-500' };
    const hasLetters = /[a-zA-Z]/.test(pass);
    const hasNumbers = /[0-9]/.test(pass);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pass);
    if (pass.length >= 8 && hasLetters && (hasNumbers || hasSpecial)) {
      return { score: 3, label: 'Strong password', color: 'bg-emerald-500' };
    }
    return { score: 2, label: 'Moderate password', color: 'bg-amber-500' };
  };

  const passwordStrength = getPasswordStrength(regPassword);

  const handleReadInstructions = () => {
    if (activeTab === 'login') {
      speakText(
        'You are on the Sign In page. Please enter your email address and your password, then select Sign In to access your personal dashboard. If you do not have an account yet, select Create Account.'
      );
    } else {
      speakText(
        'You are on the Create Account page. Please choose whether this account is for a Patient or a Family Caregiver. Then enter your full name, email address, a secure password, and an optional emergency contact phone number.'
      );
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      const msg = 'Please enter a valid email address.';
      setError(msg);
      speakText(msg);
      return;
    }

    if (!loginPassword) {
      const msg = 'Please enter your password.';
      setError(msg);
      speakText(msg);
      return;
    }

    setActionLoading(true);
    try {
      await login(cleanEmail, loginPassword);
      speakText('Welcome back to MindCare! Signing you in now.');
    } catch (err: any) {
      const msg =
        err.message ||
        'Could not sign in with those credentials. Please verify your email and password, or create a new account if you have not registered yet.';
      setError(msg);
      speakText('Sign in unsuccessful. Please double check your email and password.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();

    if (!cleanName) {
      const msg = 'Please provide your full name.';
      setError(msg);
      speakText(msg);
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      const msg = 'Please provide a valid email address.';
      setError(msg);
      speakText(msg);
      return;
    }

    if (regPassword.length < 6) {
      const msg = 'Password must be at least 6 characters long.';
      setError(msg);
      speakText(msg);
      return;
    }

    if (regPassword !== regConfirmPassword) {
      const msg = 'Passwords do not match. Please re-enter your password to confirm.';
      setError(msg);
      speakText(msg);
      return;
    }

    if (!consentChecked) {
      const msg = 'Please acknowledge the privacy and assistive terms.';
      setError(msg);
      speakText(msg);
      return;
    }

    setActionLoading(true);
    try {
      await register({
        name: cleanName,
        email: cleanEmail,
        password: regPassword,
        role: regRole,
        gender: regGender,
        avatar: regAvatar || (regGender === 'male' ? DEFAULT_MALE_PATIENT_AVATAR : DEFAULT_FEMALE_PATIENT_AVATAR),
        emergencyContact: regEmergencyName
          ? {
              name: regEmergencyName,
              phone: regEmergencyPhone || '(555) 234-5678',
              relation: regEmergencyRelation || (regRole === 'patient' ? 'Family Member' : 'Patient'),
            }
          : undefined,
        language: 'en',
        cognitiveDifficulty: 'easy',
        accessibilitySettings: {
          fontSize: 'large',
          highContrast: false,
          voiceAssistance: true,
          speechRate: 0.9,
          simpleNavigation: true,
        },
      });
      speakText(`Welcome to MindCare, ${cleanName}! Your account and secure database records have been established.`);
    } catch (err: any) {
      const msg = err.message || 'Could not create account. That email may already be in use.';
      setError(msg);
      speakText(msg);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div id="auth-landing-view" className="max-w-4xl mx-auto py-4 sm:py-8 space-y-8 animate-fade-in">
      {/* Warm, Calming Header Banner */}
      <section
        id="auth-welcome-banner"
        className="bg-gradient-to-br from-teal-700 via-teal-800 to-emerald-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-teal-600/60 backdrop-blur-xs px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold text-teal-100 border border-teal-500/30">
              <Sparkles className="w-4 h-4 text-teal-200" />
              <span>Welcoming, Senior-Friendly Cognitive Companion</span>
            </div>

            <h1
              id="auth-welcome-title"
              className={`font-black tracking-tight leading-tight ${
                fontSize === 'extra-large'
                  ? 'text-3xl sm:text-5xl'
                  : fontSize === 'large'
                  ? 'text-2xl sm:text-4xl'
                  : 'text-2xl sm:text-3xl'
              }`}
            >
              Welcome to MindCare
            </h1>

            <p className="text-teal-100 text-base sm:text-lg leading-relaxed">
              A serene and supportive space for memory stimulation, daily medication reminders, cherished family
              photographs, and reassuring voice companionship.
            </p>
          </div>

          {/* Audio Reading Guide */}
          <button
            id="auth-listen-instructions-btn"
            type="button"
            onClick={handleReadInstructions}
            className="flex items-center gap-3 bg-white hover:bg-teal-50 text-teal-900 px-5 py-3.5 rounded-2xl font-black shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
            aria-label="Listen to page instructions aloud"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-800">
              <Volume2 className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="block text-xs uppercase tracking-wider text-teal-700 font-extrabold">Audio Guide</span>
              <span className="block text-sm font-bold leading-tight">Listen to Page</span>
            </div>
          </button>
        </div>
      </section>

      {/* Primary Mode Selector: 2 Clean Production Tabs */}
      <nav
        id="auth-mode-selector"
        aria-label="Account Access Tabs"
        className="grid grid-cols-2 gap-3 bg-slate-200/80 p-2 rounded-3xl border border-slate-300 shadow-inner"
      >
        <button
          id="tab-login-btn"
          type="button"
          onClick={() => {
            setActiveTab('login');
            setError(null);
          }}
          className={`py-3.5 px-4 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer min-h-[56px] ${
            activeTab === 'login'
              ? 'bg-white text-teal-900 shadow-md ring-2 ring-teal-600'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <LogIn className="w-5 h-5 text-teal-600 shrink-0" />
          <span>Sign In to Your Account</span>
        </button>

        <button
          id="tab-register-btn"
          type="button"
          onClick={() => {
            setActiveTab('register');
            setError(null);
          }}
          className={`py-3.5 px-4 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer min-h-[56px] ${
            activeTab === 'register'
              ? 'bg-white text-teal-900 shadow-md ring-2 ring-teal-600'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <UserPlus className="w-5 h-5 text-teal-600 shrink-0" />
          <span>Create a New Account</span>
        </button>
      </nav>

      {/* Global Error Banner */}
      {error && (
        <div
          id="auth-error-banner"
          role="alert"
          className="bg-rose-50 border-2 border-rose-300 text-rose-800 p-4 sm:p-5 rounded-2xl flex items-start gap-3 shadow-xs animate-shake"
        >
          <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-extrabold text-sm sm:text-base">Notice</h4>
            <p className="text-sm">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-xs font-bold text-rose-700 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. SIGN IN FORM */}
      {activeTab === 'login' && (
        <div id="login-form-section" className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Sign In</h2>
            <p className="text-sm sm:text-base text-slate-500 mt-1">
              Access your personal memory exercises, medication reminders, and family photos.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="login-email-input" className="block text-base font-extrabold text-slate-800 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-4 pointer-events-none" />
                <input
                  id="login-email-input"
                  type="email"
                  required
                  autoComplete="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-base sm:text-lg text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500 focus:outline-hidden min-h-[52px]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="login-password-input" className="block text-base font-extrabold text-slate-800">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-900 cursor-pointer flex items-center gap-1.5 p-1"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{showLoginPassword ? 'Hide Password' : 'Show Password'}</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-4 pointer-events-none" />
                <input
                  id="login-password-input"
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-base sm:text-lg text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500 focus:outline-hidden min-h-[52px]"
                />
              </div>
            </div>

            {/* Remember Me & Help */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 rounded-md border-slate-300 text-teal-700 focus:ring-teal-500 cursor-pointer"
                />
                <span className="text-sm font-semibold text-slate-700">Remember me on this device</span>
              </label>

              <button
                type="button"
                onClick={() => setShowHelpDialog(true)}
                className="text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-900 underline text-left cursor-pointer"
              >
                Need help with your account?
              </button>
            </div>

            {/* Help Modal Dialog */}
            {showHelpDialog && (
              <div className="bg-teal-50 border border-teal-200 p-4 rounded-2xl space-y-2 text-sm text-teal-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black">
                    <Info className="w-4 h-4 text-teal-700" />
                    <span>Account Assistance</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowHelpDialog(false)}
                    className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                <p>
                  If you are a new user, please click <strong>Create a New Account</strong> above to register your profile.
                  All your cognitive exercise progress and memories are saved securely to your private database record.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={actionLoading}
              className="w-full py-4 px-6 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-black text-lg sm:text-xl rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-3 min-h-[58px]"
            >
              {actionLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In to MindCare</span>
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="pt-6 border-t border-slate-100 text-center">
            <p className="text-sm sm:text-base text-slate-600">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setError(null);
                }}
                className="font-black text-teal-700 hover:text-teal-900 underline cursor-pointer ml-1"
              >
                Create an Account Here
              </button>
            </p>
          </div>
        </div>
      )}

      {/* 2. CREATE ACCOUNT FORM */}
      {activeTab === 'register' && (
        <div id="register-form-section" className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Create a New Account</h2>
            <p className="text-sm sm:text-base text-slate-500 mt-1">
              Set up your profile in seconds. All your memory albums, games, and reminders will be stored in your private database.
            </p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-6">
            {/* Role Selection: Patient vs Caregiver */}
            <div>
              <label className="block text-base font-extrabold text-slate-800 mb-2">
                1. Select Account Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  id="reg-role-patient-btn"
                  type="button"
                  onClick={() => setRegRole('patient')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3.5 min-h-[72px] ${
                    regRole === 'patient'
                      ? 'bg-teal-50/90 border-teal-600 shadow-sm ring-1 ring-teal-600'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      regRole === 'patient' ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-base text-slate-900">Patient / Senior Profile</h4>
                      {regRole === 'patient' && <CheckCircle2 className="w-4 h-4 text-teal-700" />}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Daily brain stimulation games, photo memory book, and voice reminders.
                    </p>
                  </div>
                </button>

                <button
                  id="reg-role-caregiver-btn"
                  type="button"
                  onClick={() => setRegRole('caregiver')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3.5 min-h-[72px] ${
                    regRole === 'caregiver'
                      ? 'bg-indigo-50/90 border-indigo-600 shadow-sm ring-1 ring-indigo-600'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      regRole === 'caregiver' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-base text-slate-900">Family Caregiver Profile</h4>
                      {regRole === 'caregiver' && <CheckCircle2 className="w-4 h-4 text-indigo-700" />}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Track cognitive trends, upload cherished family memories, and schedule care plans.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Gender and Profile Photo Selection */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-base font-extrabold text-slate-800 mb-1">
                  2. Gender & Profile Photo
                </label>
                <p className="text-xs sm:text-sm text-slate-600">
                  Select gender to automatically set your profile photo, or tap any photo below to customize.
                </p>
              </div>

              {/* Female vs Male Toggle */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  id="reg-gender-female-btn"
                  type="button"
                  onClick={() => {
                    setRegGender('female');
                    setRegAvatar(
                      regRole === 'caregiver'
                        ? DEFAULT_FEMALE_CAREGIVER_AVATAR
                        : DEFAULT_FEMALE_PATIENT_AVATAR
                    );
                    speakText('Selected Female. Profile photo updated.');
                  }}
                  className={`py-3.5 px-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer border-2 ${
                    regGender === 'female'
                      ? 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-300'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xl">👩</span>
                  <span>Female</span>
                  {regGender === 'female' && <CheckCircle2 className="w-4 h-4 text-rose-600" />}
                </button>

                <button
                  id="reg-gender-male-btn"
                  type="button"
                  onClick={() => {
                    setRegGender('male');
                    setRegAvatar(
                      regRole === 'caregiver'
                        ? DEFAULT_MALE_CAREGIVER_AVATAR
                        : DEFAULT_MALE_PATIENT_AVATAR
                    );
                    speakText('Selected Male. Profile photo updated.');
                  }}
                  className={`py-3.5 px-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer border-2 ${
                    regGender === 'male'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-300'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xl">👨</span>
                  <span>Male</span>
                  {regGender === 'male' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </button>
              </div>

              {/* Assigned Default Profile Preview */}
              <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl">
                <img
                  src={
                    regRole === 'caregiver'
                      ? regGender === 'female'
                        ? DEFAULT_FEMALE_CAREGIVER_AVATAR
                        : DEFAULT_MALE_CAREGIVER_AVATAR
                      : regGender === 'female'
                        ? DEFAULT_FEMALE_PATIENT_AVATAR
                        : DEFAULT_MALE_PATIENT_AVATAR
                  }
                  alt={regGender === 'female' ? 'Female Profile' : 'Male Profile'}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-teal-600/30 shadow-xs flex-shrink-0"
                />
                <div>
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <span>{regGender === 'female' ? '👩 Default Female Profile' : '👨 Default Male Profile'}</span>
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Profile picture assigned automatically according to your selected gender.
                  </p>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="reg-name-input" className="block text-base font-extrabold text-slate-800 mb-2">
                3. Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-4 top-4 pointer-events-none" />
                <input
                  id="reg-name-input"
                  type="text"
                  required
                  autoComplete="name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Eleanor Vance or John Davis"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-base sm:text-lg text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500 focus:outline-hidden min-h-[52px]"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="reg-email-input" className="block text-base font-extrabold text-slate-800 mb-2">
                4. Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-4 pointer-events-none" />
                <input
                  id="reg-email-input"
                  type="email"
                  required
                  autoComplete="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-base sm:text-lg text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500 focus:outline-hidden min-h-[52px]"
                />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="reg-password-input" className="block text-base font-extrabold text-slate-800">
                    5. Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer flex items-center gap-1"
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showRegPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-4 pointer-events-none" />
                  <input
                    id="reg-password-input"
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-base sm:text-lg text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500 focus:outline-hidden min-h-[52px]"
                  />
                </div>
                {regPassword && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">{passwordStrength.label}</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="reg-confirm-password-input" className="block text-base font-extrabold text-slate-800">
                    Confirm Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer flex items-center gap-1"
                  >
                    {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showRegConfirmPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-4 pointer-events-none" />
                  <input
                    id="reg-confirm-password-input"
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-base sm:text-lg text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500 focus:outline-hidden min-h-[52px]"
                  />
                </div>
                {regConfirmPassword && (
                  <p
                    className={`mt-1.5 text-xs font-bold ${
                      regPassword === regConfirmPassword ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {regPassword === regConfirmPassword ? '✓ Passwords match' : '✗ Passwords do not match yet'}
                  </p>
                )}
              </div>
            </div>

            {/* Optional Support / Emergency Contact (Valuable reassurance for seniors) */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-teal-700" />
                <span className="text-sm font-black text-slate-800">
                  6. Support & Emergency Contact (Optional)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Provide a loved one or family caregiver's contact so one-touch assistance is readily available in your dashboard.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={regEmergencyName}
                  onChange={(e) => setRegEmergencyName(e.target.value)}
                  placeholder="Contact Name (e.g. Sarah)"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-teal-600 focus:outline-hidden"
                />
                <input
                  type="text"
                  value={regEmergencyRelation}
                  onChange={(e) => setRegEmergencyRelation(e.target.value)}
                  placeholder="Relationship (e.g. Daughter)"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-teal-600 focus:outline-hidden"
                />
                <input
                  type="tel"
                  value={regEmergencyPhone}
                  onChange={(e) => setRegEmergencyPhone(e.target.value)}
                  placeholder="Phone (e.g. 555-234-5678)"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-teal-600 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Privacy & Consent Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer p-1">
              <input
                type="checkbox"
                required
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded-md border-slate-300 text-teal-700 focus:ring-teal-500 cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-slate-600 leading-normal">
                I understand MindCare is a cognitive wellness and memory companion tool (not a medical diagnostic device) and
                agree to store my exercise records and photo albums in my secure database account.
              </span>
            </label>

            {/* Submit Button */}
            <button
              id="reg-submit-btn"
              type="submit"
              disabled={actionLoading}
              className="w-full py-4 px-6 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-black text-lg sm:text-xl rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-3 min-h-[58px]"
            >
              {actionLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Your Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Create Account & Get Started</span>
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="pt-6 border-t border-slate-100 text-center">
            <p className="text-sm sm:text-base text-slate-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setError(null);
                }}
                className="font-black text-teal-700 hover:text-teal-900 underline cursor-pointer ml-1"
              >
                Sign In to Your Account
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Accessible Reassurance Footer Card */}
      <section
        id="auth-security-reassurance"
        className="bg-teal-50/80 border border-teal-200 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-2xs"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-extrabold text-base sm:text-lg text-slate-900">
              Secure, Private, and Non-Diagnostic
            </h4>
            <p className="text-slate-600 text-sm">
              Your memory exercises, medication times, and photos are saved exclusively to your authenticated database profile.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            speakText(
              'MindCare features large high contrast typography, voice assistance, and simple one-tap navigation to make every step comfortable for you.'
            )
          }
          className="inline-flex items-center gap-2 bg-white hover:bg-teal-100 text-teal-900 px-4 py-2.5 rounded-xl font-bold border border-teal-300 text-sm transition-colors cursor-pointer shrink-0"
        >
          <Volume2 className="w-4 h-4 text-teal-700" />
          <span>Senior Accessibility Info</span>
        </button>
      </section>
    </div>
  );
};
