import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Link,
  Sparkles,
  X,
  Check,
  Heart,
  Tag,
  Calendar,
  User as UserIcon,
  AlertCircle,
  Camera,
} from 'lucide-react';
import { Memory } from '../../types';
import { useAccessibility } from '../../context/AccessibilityContext';

interface AddPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memoryData: Omit<Memory, '_id' | 'createdAt'>) => Promise<void>;
  patientName?: string;
  patientId: string;
}

// Curated senior-friendly memory presets
const PRESET_MEMORIES = [
  {
    title: 'Sunday Morning in the Garden',
    personName: 'Sarah Vance',
    relationship: 'Daughter',
    photoUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80',
    dateEra: 'Recent Summer',
    tags: ['Family', 'Nature', 'Garden'],
    description: 'We sat on the porch drinking fresh iced tea while the sunflowers were blooming in full gold.',
  },
  {
    title: 'Grandson Leo at the Park',
    personName: 'Leo Vance',
    relationship: 'Grandson',
    photoUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80',
    dateEra: '2023',
    tags: ['Family', 'Joyful', 'Grandchildren'],
    description: 'Leo proudly showed you his dinosaur drawing and gave you the warmest big hug.',
  },
  {
    title: 'Sunny the Golden Retriever',
    personName: 'Sunny',
    relationship: 'Beloved Pet',
    photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop&q=80',
    dateEra: 'Cherished Companion',
    tags: ['Pets', 'Comfort', 'Home'],
    description: 'Sunny resting his chin on your knee beside your rocking chair, always keeping you company.',
  },
  {
    title: 'Summer Cottage by the Lake',
    personName: 'Family Gathering',
    relationship: 'Special Place',
    photoUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=80',
    dateEra: '1980s Vacation',
    tags: ['Travel', 'Nature', 'Peaceful'],
    description: 'Crisp morning air, wooden docks, and warm campfires with the entire family listening to the water.',
  },
  {
    title: 'Wedding Anniversary Celebration',
    personName: 'Arthur Vance',
    relationship: 'Spouse',
    photoUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80',
    dateEra: 'Golden Years',
    tags: ['Celebration', 'Love', 'Milestone'],
    description: 'Dancing under the warm string lights to our favorite swing music with all our closest friends.',
  },
  {
    title: 'Baking Apple Cinnamon Pie',
    personName: 'Mother & Daughter',
    relationship: 'Family Tradition',
    photoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    dateEra: 'Autumn Tradition',
    tags: ['Tradition', 'Kitchen', 'Warmth'],
    description: 'The kitchen smelled of warm nutmeg and spiced apples as we rolled out the flaky pastry crust.',
  },
];

export const AddPhotoModal: React.FC<AddPhotoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  patientName,
  patientId,
}) => {
  const { t, speakText } = useAccessibility();
  const [photoSource, setPhotoSource] = useState<'upload' | 'preset' | 'url'>('upload');
  const [title, setTitle] = useState('');
  const [personName, setPersonName] = useState('');
  const [relationship, setRelationship] = useState('Family');
  const [dateEra, setDateEra] = useState('Recent Years');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Family']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    // Limit to 8MB
    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('Image size is too large. Please select a photo under 8MB.');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const result = loadEvt.target?.result as string;
      if (result) {
        setPhotoUrl(result);
        if (!title) {
          const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setTitle(rawName.charAt(0).toUpperCase() + rawName.slice(1));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSelectPreset = (preset: (typeof PRESET_MEMORIES)[0]) => {
    setPhotoUrl(preset.photoUrl);
    setTitle(preset.title);
    setPersonName(preset.personName);
    setRelationship(preset.relationship);
    setDateEra(preset.dateEra);
    setDescription(preset.description);
    setSelectedTags(preset.tags);
    setErrorMessage(null);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Please give this memory photo a title.');
      return;
    }
    if (!photoUrl.trim()) {
      setErrorMessage('Please upload or select a photo for the memory.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Please write a short description or cue to spark recognition.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onSave({
        patientId,
        title: title.trim(),
        personName: personName.trim() || undefined,
        relationship: relationship.trim() || 'Family',
        description: description.trim(),
        photoUrl: photoUrl.trim(),
        dateEra: dateEra.trim() || 'Cherished Memory',
        tags: selectedTags.length > 0 ? selectedTags : ['Personal'],
      });
      onClose();
    } catch (err: any) {
      console.error('Failed to save memory photo:', err);
      setErrorMessage(err.message || 'Failed to save photo memory. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableTags = [
    'Family',
    'Grandchildren',
    'Spouse',
    'Pets',
    'Home',
    'Garden',
    'Travel',
    'Celebration',
    'Childhood',
    'Music',
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-photo-modal-title"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-auto border border-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-100 text-teal-800">
                <ImageIcon className="w-5 h-5" />
              </span>
              <h2 id="add-photo-modal-title" className="font-black text-2xl text-slate-900">
                Add Photo for Patient
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Adding photos to <strong className="text-slate-800">{patientName || 'your patient'}</strong>'s memory book helps spark emotional recognition and comfort.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo Selection Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase text-slate-700 tracking-wider">
                1. Select or Upload Photo
              </label>
              <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPhotoSource('upload')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    photoSource === 'upload'
                      ? 'bg-white text-teal-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoSource('preset')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    photoSource === 'preset'
                      ? 'bg-white text-teal-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Presets Gallery
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoSource('url')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    photoSource === 'url'
                      ? 'bg-white text-teal-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Web Link
                </button>
              </div>
            </div>

            {/* Source: File Upload */}
            {photoSource === 'upload' && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-teal-500 bg-teal-50/50'
                    : photoUrl
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : 'border-slate-300 hover:border-teal-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="caregiver-photo-file-input"
                />
                {photoUrl ? (
                  <div className="flex items-center justify-center gap-4">
                    <img
                      src={photoUrl}
                      alt="Selected preview"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-2xs"
                    />
                    <div className="text-left">
                      <p className="text-xs font-black text-emerald-800 flex items-center gap-1">
                        <Check className="w-4 h-4 text-emerald-600" /> Photo attached successfully
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Click or drag another image to replace
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 mx-auto flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black text-slate-800">
                      Click to browse or drag and drop a photo here
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Supports JPG, PNG, and WebP (up to 8MB)
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Source: Presets Gallery */}
            {photoSource === 'preset' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">
                  Select a classic, comforting memory photo with auto-filled story cues:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
                  {PRESET_MEMORIES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`relative text-left p-1.5 rounded-xl border transition-all cursor-pointer group ${
                        photoUrl === preset.photoUrl
                          ? 'border-teal-600 ring-2 ring-teal-500 bg-teal-50/50'
                          : 'border-slate-200 hover:border-teal-300 bg-white'
                      }`}
                    >
                      <img
                        src={preset.photoUrl}
                        alt={preset.title}
                        className="w-full h-16 object-cover rounded-lg"
                      />
                      <p className="font-bold text-[11px] text-slate-900 truncate mt-1">
                        {preset.title}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{preset.relationship}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Source: Web URL */}
            {photoSource === 'url' && (
              <div className="space-y-2">
                <div className="relative">
                  <Link className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://example.com/family-photo.jpg"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                {photoUrl && (
                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <img
                      src={photoUrl}
                      alt="URL Preview"
                      onError={() => setErrorMessage('Could not load image from this URL. Please verify the link.')}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <span className="text-xs text-slate-600 truncate">Image link validated</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Fields: Details */}
          <div className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                2. Memory Title / Event
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Summer Garden Visit with Sarah"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500 font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Person(s) in Photo
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    placeholder="e.g., Sarah & Leo Vance"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Relationship / Category
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-teal-500 font-medium"
                >
                  <option value="Daughter">Daughter</option>
                  <option value="Son">Son</option>
                  <option value="Spouse">Spouse / Partner</option>
                  <option value="Grandchild">Grandchild</option>
                  <option value="Family">Whole Family</option>
                  <option value="Sibling">Brother / Sister</option>
                  <option value="Best Friend">Close Friend</option>
                  <option value="Beloved Pet">Beloved Pet</option>
                  <option value="Special Place">Special Place / Home</option>
                  <option value="Milestone">Milestone Celebration</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Era / Time Period
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={dateEra}
                    onChange={(e) => setDateEra(e.target.value)}
                    placeholder="e.g., Summer 2023 or 1970s"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Tag Categories
                </label>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {availableTags.map((t) => {
                    const isSelected = selectedTags.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTag(t)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-teal-700 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        #{t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                3. Story & Recall Cue
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the moment in warm, reassuring sensory details to spark pleasant memory recall..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Tip: Mention familiar names, sunny weather, laughs, or favorite songs to stimulate positive recall.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-black rounded-xl text-sm transition-colors shadow-xs cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Saving Photo...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save to Patient's Memory Book</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
