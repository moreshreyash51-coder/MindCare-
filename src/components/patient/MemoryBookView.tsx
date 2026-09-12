import React, { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Volume2, Heart, Sparkles, User, Tag, Calendar, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { api } from '../../services/api';
import { Memory } from '../../types';
import { AddPhotoModal } from '../caregiver/AddPhotoModal';

interface MemoryBookViewProps {
  onBack: () => void;
}

export const MemoryBookView: React.FC<MemoryBookViewProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { speakText, fontSize, t } = useAccessibility();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const data = await api.getMemories(user?._id || 'patient_eleanor');
        setMemories(data);
        if (data.length > 0) {
          setSelectedMemory(data[0]);
        }
      } catch (err) {
        console.warn('Failed to load memories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMemories();
  }, [user]);

  const handleReadMemory = (m: Memory) => {
    const speechContent = `${m.title}. ${m.relationship}. ${m.description}`;
    speakText(speechContent);
  };

  const handleSaveMemory = async (memoryData: Omit<Memory, '_id' | 'createdAt'>) => {
    const created = await api.createMemory(memoryData);
    setMemories((prev) => [created, ...prev]);
    speakText(`Added ${created.title} to your memory photo book.`);
  };

  return (
    <div id="memory-book-view" className="max-w-5xl mx-auto space-y-6 py-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          id="memory-book-back-btn"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm shadow-xs cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToDashboard')}</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() =>
              speakText(
                `This is your Personal Memory Book with ${memories.length} treasured memories. Tap any memory to read or listen to the story.`
              )
            }
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>{t('listenOverview')}</span>
          </button>

          <button
            id="memory-book-add-photo-btn"
            onClick={() => setIsAddPhotoOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-black shadow-md cursor-pointer transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addTreasuredPhoto')}</span>
          </button>
        </div>
      </div>

      {/* Hero Title */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 bg-blue-500/30 px-3 py-1 rounded-full text-xs font-bold text-blue-200 uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t('cherishedAlbum')}</span>
          </div>
          <h1
            id="memory-book-title"
            className={`font-black tracking-tight ${
              fontSize === 'extra-large' ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
            }`}
          >
            {t('personalMemoryBook')}
          </h1>
          <p className="text-blue-200 text-base max-w-xl">
            {t('personalMemoryBookDesc')}
          </p>
        </div>
      </div>

      {/* Memory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {memories.map((memory) => (
          <article
            key={memory._id}
            id={`memory-card-${memory._id}`}
            className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              {/* Photo */}
              <div className="relative h-64 sm:h-72 w-full bg-slate-100 overflow-hidden">
                <img
                  src={memory.photoUrl}
                  alt={memory.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-full text-xs font-black text-slate-800 shadow-sm flex items-center gap-1.5 border border-slate-200/80">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>{memory.relationship}</span>
                </div>
              </div>

              {/* Text & Content */}
              <div className="p-6 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-2xl text-slate-900 leading-snug">
                      {memory.title}
                    </h3>
                    {memory.personName && (
                      <p className="text-teal-700 font-bold text-sm flex items-center gap-1.5 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                        <span>{memory.personName}</span>
                      </p>
                    )}
                  </div>

                  {/* Read Aloud Button */}
                  <button
                    id={`speak-memory-${memory._id}`}
                    onClick={() => handleReadMemory(memory)}
                    className="p-3 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-2xl border border-teal-200 flex-shrink-0 cursor-pointer transition-colors shadow-2xs"
                    title="Read Memory Aloud"
                    aria-label={`Read ${memory.title} aloud`}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-slate-700 text-base leading-relaxed whitespace-pre-line">
                  {memory.description}
                </p>

                {memory.dateEra && (
                  <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('time')}: {memory.dateEra}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags / Footer */}
            {memory.tags && memory.tags.length > 0 && (
              <div className="px-6 pb-5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                {memory.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold"
                  >
                    <Tag className="w-3 h-3 text-slate-400" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Add Custom Photo Modal */}
      <AddPhotoModal
        isOpen={isAddPhotoOpen}
        onClose={() => setIsAddPhotoOpen(false)}
        onSave={handleSaveMemory}
        patientId={user?._id || 'patient_eleanor'}
        patientName={user?.name || 'Eleanor Vance'}
      />
    </div>
  );
};
