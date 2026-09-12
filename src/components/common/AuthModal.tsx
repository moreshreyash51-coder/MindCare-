import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus,
  ArrowRight,
  Server,
  Eye,
  EyeOff,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { DatabaseStatus, DEFAULT_FEMALE_PATIENT_AVATAR, DEFAULT_MALE_PATIENT_AVATAR, DEFAULT_FEMALE_CAREGIVER_AVATAR, DEFAULT_MALE_CAREGIVER_AVATAR } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, login, register, logout, updateUser } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'patient' | 'caregiver'>('patient');
  const [selectedGender, setSelectedGender] = useState<'female' | 'male'>('female');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [avatarSuccessMsg, setAvatarSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setAvatarSuccessMsg(null);
      if (user) {
        setSelectedGender((user.gender as 'female' | 'male') || 'female');
        setSelectedAvatar(user.avatar || '');
      }
      api
        .getDatabaseStatus()
        .then(setDbStatus)
        .catch((e) => console.warn('Could not fetch DB status:', e));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({
          name,
          email,
          role,
          gender: selectedGender,
          avatar: selectedAvatar || (selectedGender === 'male' ? DEFAULT_MALE_PATIENT_AVATAR : DEFAULT_FEMALE_PATIENT_AVATAR),
          password,
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
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAvatarGender = async (gender: 'female' | 'male', avatarUrl: string) => {
    setIsUpdatingAvatar(true);
    setAvatarSuccessMsg(null);
    try {
      const res = await api.updateProfile({ gender, avatar: avatarUrl });
      updateUser(res.user);
      setSelectedGender(gender);
      setSelectedAvatar(avatarUrl);
      setAvatarSuccessMsg('Profile photo & gender updated successfully!');
      setTimeout(() => setAvatarSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="auth-modal-content"
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-emerald-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600/50 flex items-center justify-center border border-teal-400/40">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black">
                {user ? 'Account & Database Settings' : mode === 'login' ? 'Sign In to MindCare' : 'Create Account'}
              </h2>
              <p className="text-xs text-teal-200">Secure JWT Authentication & MongoDB</p>
            </div>
          </div>
          <button
            id="auth-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database Status Card */}
        <div className="px-6 pt-5">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>MongoDB Status:</span>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                  dbStatus?.isMongoConnected
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-teal-50 text-teal-800 border border-teal-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {dbStatus?.isMongoConnected ? 'MongoDB Connected' : 'Resilient In-Memory MongoDB Engine'}
              </span>
            </div>

            {dbStatus && (
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-center">
                <div className="bg-white p-1.5 rounded-xl border border-slate-200">
                  <span className="block text-[10px] text-slate-500 font-semibold">Users</span>
                  <span className="font-extrabold text-xs text-slate-800">{dbStatus.counts.users}</span>
                </div>
                <div className="bg-white p-1.5 rounded-xl border border-slate-200">
                  <span className="block text-[10px] text-slate-500 font-semibold">Memories</span>
                  <span className="font-extrabold text-xs text-slate-800">{dbStatus.counts.memories}</span>
                </div>
                <div className="bg-white p-1.5 rounded-xl border border-slate-200">
                  <span className="block text-[10px] text-slate-500 font-semibold">Reminders</span>
                  <span className="font-extrabold text-xs text-slate-800">{dbStatus.counts.reminders}</span>
                </div>
                <div className="bg-white p-1.5 rounded-xl border border-slate-200">
                  <span className="block text-[10px] text-slate-500 font-semibold">Games</span>
                  <span className="font-extrabold text-xs text-slate-800">{dbStatus.counts.gameResults}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Current Active User Information & Switcher */}
        <div className="p-6 space-y-6">
          {user ? (
            <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Active Signed-In User:
              </span>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      user?.avatar ||
                      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={user?.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-teal-500"
                  />
                  <div>
                    <h4 className="font-extrabold text-slate-900 leading-tight">{user?.name}</h4>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                    <span className="inline-block mt-0.5 text-[10px] font-extrabold px-2 py-0.5 bg-slate-100 rounded-md text-slate-700 uppercase tracking-wider">
                      Role: {user?.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    logout();
                    setEmail('');
                    setPassword('');
                    onClose();
                  }}
                  className="text-xs font-extrabold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer border border-rose-200 flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>

              {/* Active Account Details */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                <span>
                  Member ID: <span className="font-mono font-bold text-slate-700">{user?._id}</span>
                </span>
                <span className="font-semibold text-teal-700">
                  Status: Active & Synced to Database
                </span>
              </div>

              {/* Gender and Profile Photo Selection */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">
                    Profile Photo & Gender:
                  </span>
                  {avatarSuccessMsg && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {avatarSuccessMsg}
                    </span>
                  )}
                </div>

                {/* Gender profile toggle buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isUpdatingAvatar}
                    onClick={() => {
                      const newGender = 'female';
                      const defaultAvatar = user?.role === 'caregiver' ? DEFAULT_FEMALE_CAREGIVER_AVATAR : DEFAULT_FEMALE_PATIENT_AVATAR;
                      handleSaveAvatarGender(newGender, defaultAvatar);
                    }}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      selectedGender === 'female'
                        ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>👩 Female Profile</span>
                    {selectedGender === 'female' && <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />}
                  </button>

                  <button
                    type="button"
                    disabled={isUpdatingAvatar}
                    onClick={() => {
                      const newGender = 'male';
                      const defaultAvatar = user?.role === 'caregiver' ? DEFAULT_MALE_CAREGIVER_AVATAR : DEFAULT_MALE_PATIENT_AVATAR;
                      handleSaveAvatarGender(newGender, defaultAvatar);
                    }}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      selectedGender === 'male'
                        ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>👨 Male Profile</span>
                    {selectedGender === 'male' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 text-center pt-1">
                  Default profile photo is automatically assigned according to your selected gender.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center space-y-1">
              <p className="text-xs font-bold text-slate-700">
                You are currently signed out.
              </p>
              <p className="text-xs text-slate-500">
                Please enter your credentials below to access your account or create a new one.
              </p>
            </div>
          )}

          {/* Form to Sign In with Another Account or Register */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-extrabold text-sm text-slate-800">
                {mode === 'login' ? 'Sign in with specific credentials' : 'Register a new profile'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError(null);
                }}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer underline"
              >
                {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign In'}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Miller"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('patient')}
                        className={`py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                          role === 'patient'
                            ? 'bg-teal-700 text-white border-teal-700'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        Patient
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('caregiver')}
                        className={`py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                          role === 'caregiver'
                            ? 'bg-indigo-700 text-white border-indigo-700'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        Caregiver
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-bold text-teal-700 hover:text-teal-900 cursor-pointer flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>


              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : mode === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
