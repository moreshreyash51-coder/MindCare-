import React, { useState, useRef } from 'react';
import {
  Upload,
  Music,
  Link,
  Sparkles,
  X,
  Check,
  AlertCircle,
  Play,
  Square,
  Volume2,
  FolderOpen,
} from 'lucide-react';
import { CustomSongInput, SongCategory } from '../../types';
import { useAccessibility } from '../../context/AccessibilityContext';

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (song: CustomSongInput) => void;
  patientId?: string;
}

const PRESET_SONG_IDEAS = [
  {
    title: 'Moon River & Strings',
    artist: 'Vintage Orchestra',
    category: 'nostalgia' as SongCategory,
    eraOrMood: '1961 Classic Melody',
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Pachelbel%27s_Canon_in_D.ogg',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    description: 'A timeless, nostalgic melody inspiring feelings of peace, romance, and gentle comfort.',
  },
  {
    title: 'Warm Fireside Acoustic Lullaby',
    artist: 'Serenity Strings',
    category: 'ambient' as SongCategory,
    eraOrMood: 'Gentle Acoustic Guitar',
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Clair_de_lune_%28Claude_Debussy%29_Suite_bergamasque.ogg',
    coverImage: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500&auto=format&fit=crop&q=80',
    description: 'Soft fingerpicked guitar notes that evoke memories of cozy evenings with family.',
  },
  {
    title: 'Gentle Rain on Cedar Leaves',
    artist: 'Nature Acoustic',
    category: 'nature' as SongCategory,
    eraOrMood: 'Deep Rest & Calming Sounds',
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Erik_Satie_-_Gymnop%C3%A9die_No._1.ogg',
    coverImage: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=500&auto=format&fit=crop&q=80',
    description: 'Continuous soothing rain drops falling gently on leaves to quiet anxiety and encourage sleep.',
  },
];

export const AddSongModal: React.FC<AddSongModalProps> = ({
  isOpen,
  onClose,
  onSave,
  patientId,
}) => {
  const { t, fontSize, speakText } = useAccessibility();

  const [sourceType, setSourceType] = useState<'upload' | 'url' | 'preset'>('upload');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [category, setCategory] = useState<SongCategory>('custom');
  const [audioUrl, setAudioUrl] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [eraOrMood, setEraOrMood] = useState('');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSizeText, setFileSizeText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const processAudioFile = (file: File) => {
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i)) {
      setErrorMessage('Please select a valid audio file (MP3, WAV, OGG, M4A, AAC).');
      return;
    }

    // Limit to 25MB
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('Audio file is too large. Please select a song under 25MB.');
      return;
    }

    setErrorMessage(null);
    setFileName(file.name);
    setFileSizeText(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);

    // Extract auto-title from file name
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Create DataURL or object URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setAudioUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAudioFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAudioFile(file);
    }
  };

  const togglePreview = () => {
    if (!audioUrl) return;

    if (previewPlaying) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setPreviewPlaying(false);
    } else {
      if (!previewAudioRef.current) {
        previewAudioRef.current = new Audio(audioUrl);
        previewAudioRef.current.onended = () => setPreviewPlaying(false);
      } else {
        previewAudioRef.current.src = audioUrl;
      }
      previewAudioRef.current.play().catch(() => {});
      setPreviewPlaying(true);
    }
  };

  const handleSelectPreset = (preset: (typeof PRESET_SONG_IDEAS)[0]) => {
    setTitle(preset.title);
    setArtist(preset.artist);
    setCategory(preset.category);
    setEraOrMood(preset.eraOrMood);
    setAudioUrl(preset.audioUrl);
    setCoverImage(preset.coverImage);
    setDescription(preset.description);
    setFileName('Preset Stream Track');
    setFileSizeText('Online Stream');
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Please enter a song title.');
      return;
    }
    if (!audioUrl.trim()) {
      setErrorMessage('Please select or provide an audio file or stream URL.');
      return;
    }

    // Stop any preview playback
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }

    onSave({
      title: title.trim(),
      artist: artist.trim() || 'Treasured Memory Song',
      category,
      audioUrl: audioUrl.trim(),
      coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
      eraOrMood: eraOrMood.trim() || 'Cherished Melody',
      description: description.trim() || 'A personal favorite song chosen for comfort and memory stimulation.',
      patientId,
    });

    speakText(`${title} has been added to your song collection.`);
    onClose();
  };

  return (
    <div
      id="add-song-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (previewAudioRef.current) previewAudioRef.current.pause();
          onClose();
        }
      }}
    >
      <div
        id="add-song-modal-card"
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-song-modal-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-slate-800 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white shadow-xs">
              <Music className="w-6 h-6" />
            </div>
            <div>
              <h2
                id="add-song-modal-title"
                className={`font-black tracking-tight ${
                  fontSize === 'extra-large' ? 'text-2xl' : 'text-xl'
                }`}
              >
                {t('uploadCustomSong')}
              </h2>
              <p className="text-teal-100 text-xs sm:text-sm">
                Add any song, melody, or personal audio file for comfort and memory stimulation.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (previewAudioRef.current) previewAudioRef.current.pause();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Switcher */}
        <div className="px-6 pt-5 pb-2">
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setSourceType('upload')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                sourceType === 'upload'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{t('chooseAudioFile')}</span>
            </button>
            <button
              type="button"
              onClick={() => setSourceType('url')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                sourceType === 'url'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Link className="w-4 h-4" />
              <span>Web Stream / URL</span>
            </button>
            <button
              type="button"
              onClick={() => setSourceType('preset')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                sourceType === 'preset'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Calming Presets</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm font-bold animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SOURCE 1: UPLOAD FROM DEVICE */}
          {sourceType === 'upload' && (
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Select Audio File from Your Device
              </label>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-teal-500 bg-teal-50/60'
                    : audioUrl
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : 'border-slate-300 hover:border-teal-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center space-y-2">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      audioUrl ? 'bg-emerald-100 text-emerald-700' : 'bg-teal-100 text-teal-700'
                    }`}
                  >
                    {audioUrl ? <Check className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                  </div>
                  {audioUrl ? (
                    <div>
                      <p className="font-extrabold text-sm text-slate-900">{fileName || 'Custom Audio Selected'}</p>
                      <p className="text-xs text-emerald-700 font-bold mt-0.5">{fileSizeText} • Ready to save</p>
                      <p className="text-xs text-slate-400 mt-1">Tap to choose a different file</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-extrabold text-sm text-slate-900">
                        Click to select an audio file, or drag and drop here
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Supports MP3, WAV, OGG, M4A, FLAC (up to 25MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SOURCE 2: WEB URL */}
          {sourceType === 'url' && (
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Direct Audio or Stream URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://example.com/audio/song.mp3 or web radio stream"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-hidden font-medium text-sm text-slate-800"
                />
              </div>
              <p className="text-xs text-slate-500">
                Paste any web audio link or live streaming radio URL.
              </p>
            </div>
          )}

          {/* SOURCE 3: PRESETS */}
          {sourceType === 'preset' && (
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Select from Curated Nostalgic Ideas
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {PRESET_SONG_IDEAS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="p-3 rounded-2xl border border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-teal-50/40 text-left transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs mb-2">
                        🎵
                      </div>
                      <p className="font-extrabold text-xs text-slate-900 leading-snug">{preset.title}</p>
                      <p className="text-[11px] text-teal-700 font-medium">{preset.artist}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 font-semibold">{preset.eraOrMood}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AUDIO TEST PREVIEW */}
          {audioUrl && (
            <div className="p-3 bg-teal-50/80 border border-teal-200 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs text-teal-900 font-bold">
                <Volume2 className="w-4 h-4 text-teal-700" />
                <span>Test Audio Preview</span>
              </div>
              <button
                type="button"
                onClick={togglePreview}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                {previewPlaying ? (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Listen Preview</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* SONG DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                {t('songTitle')} *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. You Are My Sunshine"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                {t('artistName')}
              </label>
              <input
                type="text"
                placeholder="e.g. Frank Sinatra / Family Recording"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-semibold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SongCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-semibold text-slate-900 bg-white"
              >
                <option value="custom">My Custom Song</option>
                <option value="nostalgia">Golden Nostalgia & Oldies</option>
                <option value="classical">Peaceful Classical Piano</option>
                <option value="nature">Nature & Ambient Waves</option>
                <option value="ambient">Ambient Comfort</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Era / Mood Cue
              </label>
              <input
                type="text"
                placeholder="e.g. 1950s Swing / Sweet Lullaby"
                value={eraOrMood}
                onChange={(e) => setEraOrMood(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-semibold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
              Personal Story or Memory Cue
            </label>
            <textarea
              rows={2}
              placeholder="e.g. This was our favorite anniversary song we danced to in the garden."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-medium text-slate-900"
            />
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                if (previewAudioRef.current) previewAudioRef.current.pause();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-sm cursor-pointer transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm shadow-md cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-2"
            >
              <Music className="w-4 h-4" />
              <span>Add to Song Collection</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
