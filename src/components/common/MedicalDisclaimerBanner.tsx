import React from 'react';
import { ShieldAlert, Volume2 } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';

export const MedicalDisclaimerBanner: React.FC = () => {
  const { t, speakText, fontSize } = useAccessibility();

  return (
    <aside
      id="medical-disclaimer-banner"
      aria-label="Medical Disclaimer"
      className="bg-amber-50 border-b border-amber-200/80 text-amber-900 px-4 py-2.5 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className={`${fontSize === 'extra-large' ? 'text-base font-semibold' : fontSize === 'large' ? 'text-sm font-medium' : 'text-xs'}`}>
            <span className="font-bold uppercase tracking-wider text-amber-800 mr-1.5">Notice:</span>
            {t('disclaimer')}
          </p>
        </div>
        <button
          id="speak-disclaimer-btn"
          onClick={() => speakText(t('disclaimer'))}
          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200/90 px-2.5 py-1 rounded-full transition-colors flex-shrink-0 cursor-pointer"
          title="Read Notice Aloud"
          aria-label="Read notice aloud"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Listen</span>
        </button>
      </div>
    </aside>
  );
};
