// Speech service: Text-to-Speech and Speech-to-Text with accessibility tuning for elderly users

export const speech = {
  isSTTSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  },

  isTTSSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  },

  // Speak text aloud with warm, calm cadence
  speak(text: string, options: { rate?: number; pitch?: number; language?: string } = {}): void {
    if (!this.isTTSSupported()) return;

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate || 0.88; // Slightly measured rate for clear auditory processing
      utterance.pitch = options.pitch || 1.0;
      utterance.lang = options.language || 'en-US';

      // Pick warm natural voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const langPrefix = options.language?.slice(0, 2) || 'en';
        const preferredVoice =
          voices.find((v) => v.lang.startsWith(langPrefix) && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen'))) ||
          voices.find((v) => v.lang.startsWith(langPrefix)) ||
          voices.find((v) => v.lang.startsWith('en-IN') || v.lang.startsWith('hi-IN')) ||
          voices[0];

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  },

  stopSpeaking(): void {
    if (this.isTTSSupported()) {
      window.speechSynthesis.cancel();
    }
  },

  // Enhanced Speech Recognition listener with interim results and fallback
  startListening(callbacks: {
    onResult: (transcript: string) => void;
    onInterimResult?: (interim: string) => void;
    onError?: (err: any) => void;
    onStart?: () => void;
    onEnd?: () => void;
    language?: string;
  }): { stop: () => void } | null {
    if (!this.isSTTSupported()) {
      callbacks.onError?.(new Error('Speech recognition not supported in this browser.'));
      return null;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = callbacks.language || 'en-US';

      let finalTranscript = '';

      recognition.onstart = () => {
        callbacks.onStart?.();
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const part = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += (finalTranscript ? ' ' : '') + part;
          } else {
            interimTranscript += part;
          }
        }

        if (callbacks.onInterimResult) {
          callbacks.onInterimResult(finalTranscript + (interimTranscript ? ' ' + interimTranscript : ''));
        }

        if (finalTranscript.trim()) {
          callbacks.onResult(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        // If language error occurs, retry with en-IN or en-US fallback
        if (event.error === 'language-not-supported' && callbacks.language !== 'en-US') {
          console.warn(`Language ${callbacks.language} not supported for STT, falling back to English`);
          try {
            recognition.lang = 'en-US';
            recognition.start();
            return;
          } catch (_) {}
        }
        callbacks.onError?.(event.error);
      };

      recognition.onend = () => {
        callbacks.onEnd?.();
      };

      recognition.start();

      return {
        stop: () => {
          try {
            recognition.stop();
          } catch (_) {}
        },
      };
    } catch (e) {
      callbacks.onError?.(e);
      return null;
    }
  },
};
