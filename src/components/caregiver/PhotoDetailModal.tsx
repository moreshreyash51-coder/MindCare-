import React, { useState } from 'react';
import { X, Volume2, Trash2, Calendar, User, Tag, Heart, Sparkles, VolumeX } from 'lucide-react';
import { Memory } from '../../types';

interface PhotoDetailModalProps {
  memory: Memory | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  patientName?: string;
}

export const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({
  memory,
  onClose,
  onDelete,
  patientName,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!memory) return null;

  const handleSpeakStory = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      window.speechSynthesis.cancel();
      const textToRead = `${memory.title}. ${memory.personName ? `With ${memory.personName}.` : ''} ${memory.description}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.88; // Gentle, clear senior-friendly pace
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-detail-modal-title"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl my-auto border border-slate-200">
        {/* Photo view */}
        <div className="relative bg-slate-950 aspect-video sm:aspect-16/10 flex items-center justify-center overflow-hidden">
          <img
            src={memory.photoUrl}
            alt={memory.title}
            className="w-full h-full object-cover sm:object-contain"
          />
          <button
            type="button"
            onClick={() => {
              if (isSpeaking && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              onClose();
            }}
            className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
            aria-label="Close photo preview"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-600/90 backdrop-blur-xs text-white text-xs font-bold shadow-xs">
              {memory.relationship}
            </span>
            {memory.dateEra && (
              <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-slate-200 text-xs font-semibold">
                {memory.dateEra}
              </span>
            )}
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 id="photo-detail-modal-title" className="font-black text-2xl text-slate-900">
                {memory.title}
              </h3>
              {memory.personName && (
                <p className="text-sm font-bold text-teal-700 flex items-center gap-1.5 mt-0.5">
                  <User className="w-4 h-4" />
                  <span>Person in photo: {memory.personName}</span>
                </p>
              )}
            </div>

            {/* Read Aloud Voice Button */}
            <button
              type="button"
              onClick={handleSpeakStory}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-2xs ${
                isSpeaking
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>Stop Reading</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Read Story Aloud 🔊</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-800 text-sm sm:text-base leading-relaxed">
            <p>{memory.description}</p>
          </div>

          {memory.tags && memory.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Tags:
              </span>
              {memory.tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this memory from the patient\'s book?')) {
                    onDelete(memory._id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Memory</span>
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
