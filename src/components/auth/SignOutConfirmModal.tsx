import React from 'react';
import { LogOut, Volume2, ShieldCheck, X } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';

interface SignOutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
}

export const SignOutConfirmModal: React.FC<SignOutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
}) => {
  const { speakText, fontSize } = useAccessibility();

  if (!isOpen) return null;

  const displayName = userName || 'there';
  const confirmationPrompt = `Are you sure you want to sign out, ${displayName}? Your memories, photos, and game progress are completely saved.`;

  const handleReadAloud = () => {
    speakText(
      `${confirmationPrompt} You can click the red button to sign out, or the gray button to stay right here.`
    );
  };

  return (
    <div
      id="signout-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="signout-dialog-title"
    >
      <div
        id="signout-modal-card"
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="bg-rose-50 border-b border-rose-200/80 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h2 id="signout-dialog-title" className="text-xl font-extrabold text-slate-900 leading-tight">
                Sign Out?
              </h2>
              <p className="text-xs text-rose-700 font-semibold">MindCare Safe Exit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <p
              className={`text-slate-700 font-medium leading-relaxed ${
                fontSize === 'extra-large' ? 'text-lg' : fontSize === 'large' ? 'text-base' : 'text-sm'
              }`}
            >
              {confirmationPrompt}
            </p>
            <button
              onClick={handleReadAloud}
              className="p-2.5 rounded-xl bg-teal-100 hover:bg-teal-200 text-teal-800 transition-colors shrink-0 cursor-pointer"
              title="Listen to this question"
              aria-label="Read prompt aloud"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-xl font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All your data remains safe and ready whenever you return.</span>
          </div>

          {/* Action buttons with large touch targets */}
          <div className="space-y-3 pt-2">
            <button
              id="confirm-signout-btn"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold text-base rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[52px]"
            >
              <LogOut className="w-5 h-5" />
              <span>Yes, Sign Out</span>
            </button>

            <button
              id="cancel-signout-btn"
              onClick={onClose}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold text-base rounded-2xl transition-all cursor-pointer min-h-[48px]"
            >
              No, Stay Signed In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
