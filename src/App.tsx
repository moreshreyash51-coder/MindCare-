import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';
import { Header } from './components/common/Header';
import { MedicalDisclaimerBanner } from './components/common/MedicalDisclaimerBanner';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { GameHub } from './components/games/GameHub';
import { MemoryBookView } from './components/patient/MemoryBookView';
import { AIAssistantView } from './components/patient/AIAssistantView';
import { RemindersView } from './components/patient/RemindersView';
import { CaregiverDashboard } from './components/caregiver/CaregiverDashboard';
import { AuthLandingView } from './components/auth/AuthLandingView';
import { MusicTherapyView } from './components/music/MusicTherapyView';
import { PhoneCall, Volume2, ShieldCheck, HeartHandshake } from 'lucide-react';

function AppContent() {
  const { user, isLoading } = useAuth();
  const { fontSize, speakText } = useAccessibility();
  const [currentView, setCurrentView] = useState<string>('dashboard');

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 py-16">
          <div className="w-14 h-14 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-700 font-extrabold text-xl">Loading your MindCare space...</p>
        </div>
      );
    }

    if (!user) {
      return <AuthLandingView />;
    }

    if (user?.role === 'caregiver') {
      return <CaregiverDashboard />;
    }

    // Patient views
    switch (currentView) {
      case 'games':
        return <GameHub onBackToDashboard={() => setCurrentView('dashboard')} />;
      case 'memories':
        return <MemoryBookView onBack={() => setCurrentView('dashboard')} />;
      case 'ai':
        return <AIAssistantView onBack={() => setCurrentView('dashboard')} />;
      case 'reminders':
        return <RemindersView onBack={() => setCurrentView('dashboard')} />;
      case 'music':
        return <MusicTherapyView onBack={() => setCurrentView('dashboard')} patientId={user?._id} />;
      case 'dashboard':
      default:
        return <PatientDashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div
      id="app-root"
      className={`min-h-screen flex flex-col bg-slate-50 selection:bg-teal-200 selection:text-teal-900 ${
        fontSize === 'extra-large' ? 'text-lg' : fontSize === 'large' ? 'text-base' : 'text-sm'
      }`}
    >
      {/* Non-Diagnostic Assistive Banner */}
      <MedicalDisclaimerBanner />

      {/* Accessible Header */}
      <Header currentView={currentView} onNavigate={setCurrentView} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {renderView()}
      </main>

      {/* Reassuring Patient Bottom Floating Helper (Patient Mode only) */}
      {user?.role === 'patient' && currentView !== 'dashboard' && (
        <aside
          id="patient-bottom-support"
          aria-label="Quick Assistance"
          className="fixed bottom-4 right-4 z-40 bg-white/95 backdrop-blur-md border border-slate-300/80 p-3 rounded-2xl shadow-xl flex items-center gap-3"
        >
          <button
            onClick={() => {
              const contactName = user?.emergencyContact?.name || 'your caregiver or family member';
              const contactPhone = user?.emergencyContact?.phone ? ` at ${user.emergencyContact.phone}` : '';
              speakText(`If you need help or feel uncertain, ${contactName} is just a phone call away${contactPhone}.`);
            }}
            className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-teal-900 bg-teal-50 hover:bg-teal-100 px-3.5 py-2 rounded-xl border border-teal-200 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-teal-700" />
            <span>Need Help?</span>
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer"
          >
            Home Dashboard
          </button>
        </aside>
      )}

      {/* Footer */}
      <footer id="app-footer" className="bg-white border-t border-slate-200 mt-auto py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">MindCare</span>
            <span>•</span>
            <span>Cognitive Gaming & Memory Assistive Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Assistive Technology
            </span>
            <span>All Data Processed Privately</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <AppContent />
      </AccessibilityProvider>
    </AuthProvider>
  );
}
