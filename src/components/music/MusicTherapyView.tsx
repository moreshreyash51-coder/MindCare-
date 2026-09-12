import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
  Plus,
  Heart,
  Volume1,
  Sparkles,
  Info,
  Trash2,
  Radio,
  Headphones,
  Compass,
} from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { SongTrack, SongCategory, CustomSongInput } from '../../types';
import { musicService, MusicPlayerState } from '../../services/musicService';
import { AddSongModal } from './AddSongModal';

interface MusicTherapyViewProps {
  onBack: () => void;
  patientId?: string;
}

export const MusicTherapyView: React.FC<MusicTherapyViewProps> = ({ onBack, patientId }) => {
  const { t, fontSize, highContrast, speakText } = useAccessibility();

  const [playerState, setPlayerState] = useState<MusicPlayerState>(musicService.getState());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = musicService.subscribe((state) => {
      setPlayerState(state);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLooping,
    isShuffling,
    isSynthesizing,
    playlist,
    favorites,
  } = playerState;

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value);
    musicService.seekTo(targetTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    musicService.setVolume(val);
  };

  const handlePlaySong = (song: SongTrack) => {
    musicService.playSong(song);
    speakText(`Now playing: ${song.title} by ${song.artist}`);
  };

  const handleSaveCustomSong = (input: CustomSongInput) => {
    const added = musicService.addCustomSong(input);
    musicService.playSong(added);
  };

  const handleDeleteSong = (song: SongTrack, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Remove "${song.title}" from your song collection?`)) {
      musicService.deleteCustomSong(song.id);
      speakText(`Removed ${song.title} from your songs.`);
    }
  };

  const handleToggleFav = (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    musicService.toggleFavorite(songId);
  };

  const handleReadStory = (song: SongTrack, e: React.MouseEvent) => {
    e.stopPropagation();
    speakText(`${song.title}, by ${song.artist}. ${song.eraOrMood}. ${song.description}`);
  };

  const handleReadOverview = () => {
    speakText(
      'Welcome to the Relaxing Songs and Music section. Listening to your favorite melodies and calming piano stimulates memory recall, reduces anxiety, and brings joy. You can choose any song below or tap the Add Any Song button to upload songs from your own device.'
    );
  };

  // Filter songs by active category
  const filteredSongs = playlist.filter((song) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'favorites') return favorites.includes(song.id);
    if (selectedCategory === 'custom') return song.isCustom;
    return song.category === selectedCategory;
  });

  // Calculate progress percent
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div id="music-therapy-view-root" className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Top Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          id="music-back-to-dashboard-btn"
          onClick={onBack}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm sm:text-base border-2 transition-all cursor-pointer ${
            highContrast
              ? 'bg-black text-white border-black hover:bg-slate-800'
              : 'bg-white text-slate-800 border-slate-200 hover:border-teal-500 hover:text-teal-700 shadow-xs'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('backToDashboard')}</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            id="music-read-overview-btn"
            onClick={handleReadOverview}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
          >
            <Volume2 className="w-4 h-4 text-teal-600" />
            <span>{t('listenAloud')}</span>
          </button>

          <button
            id="music-add-custom-song-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-black text-sm sm:text-base shadow-md cursor-pointer transition-all hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5" />
            <span>{t('uploadCustomSong')}</span>
          </button>
        </div>
      </div>

      {/* HERO SECTION: Senior Comfort Audio Player Deck */}
      <div
        id="senior-music-player-deck"
        className={`rounded-3xl p-6 sm:p-8 border-2 transition-all overflow-hidden relative shadow-lg ${
          highContrast
            ? 'bg-slate-900 border-slate-950 text-white'
            : 'bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 border-teal-800/40 text-white'
        }`}
      >
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Album Artwork & Visualizer */}
          <div className="lg:col-span-5 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="relative group w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
              <img
                src={
                  currentSong?.coverImage ||
                  'https://images.unsplash.com/photo-1520523839898-507125cd53c1?w=500&auto=format&fit=crop&q=80'
                }
                alt={currentSong?.title || 'Relaxing Music'}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? 'scale-105' : 'scale-100'
                }`}
              />

              {/* Glowing playback status badge */}
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1.5 border border-white/20">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'
                  }`}
                />
                <span>{isPlaying ? 'Playing Now' : 'Paused'}</span>
              </div>

              {/* Visualizer Sound Waves Overlay */}
              {isPlaying && (
                <div className="absolute bottom-3 right-3 left-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center justify-between border border-white/20">
                  <span className="text-[11px] font-bold text-teal-300 flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                    {isSynthesizing ? 'Peaceful Chimes' : 'Therapy Audio'}
                  </span>
                  {/* Dynamic bouncing equalizer bars */}
                  <div className="flex items-end gap-1 h-4">
                    <span className="w-1 bg-teal-400 rounded-full animate-bounce [animation-delay:0.1s] h-3" />
                    <span className="w-1 bg-teal-300 rounded-full animate-bounce [animation-delay:0.3s] h-4" />
                    <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s] h-2" />
                    <span className="w-1 bg-teal-200 rounded-full animate-bounce [animation-delay:0.4s] h-3.5" />
                  </div>
                </div>
              )}
            </div>

            {/* Song Meta Text */}
            <div className="mt-4 space-y-1 w-full">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-400/30">
                  {currentSong?.category.toUpperCase() || 'CALMING'}
                </span>
                {currentSong?.isCustom && (
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    My Song
                  </span>
                )}
              </div>

              <h2
                className={`font-black tracking-tight text-white line-clamp-1 ${
                  fontSize === 'extra-large' ? 'text-3xl' : 'text-2xl'
                }`}
              >
                {currentSong?.title || 'Select a Song to Begin'}
              </h2>
              <p className="text-teal-200 text-sm sm:text-base font-semibold">
                {currentSong?.artist || 'Calming Music Therapy'} • {currentSong?.eraOrMood || 'Comfort'}
              </p>
            </div>
          </div>

          {/* Player Controls & Scrubber */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            {/* Story / Description Callout */}
            {currentSong?.description && (
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-xs sm:text-sm text-slate-200 flex items-start gap-3">
                <Info className="w-5 h-5 text-teal-300 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="leading-relaxed">{currentSong.description}</p>
                </div>
                <button
                  onClick={(e) => handleReadStory(currentSong, e)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Read story aloud"
                >
                  <Volume1 className="w-4 h-4 text-teal-300" />
                </button>
              </div>
            )}

            {/* Progress Scrubber */}
            <div className="space-y-2">
              <div className="relative flex items-center">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  aria-label="Seek track"
                  className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400 focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #2dd4bf ${progressPercent}%, #334155 ${progressPercent}%)`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-teal-200">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Giant Primary Controls */}
            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Shuffle Button */}
                <button
                  id="music-shuffle-btn"
                  onClick={() => musicService.toggleShuffle()}
                  className={`p-3 rounded-2xl transition-colors cursor-pointer ${
                    isShuffling ? 'bg-teal-500 text-slate-900 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                  title="Shuffle playlist"
                  aria-label="Shuffle playlist"
                >
                  <Shuffle className="w-5 h-5" />
                </button>

                {/* Repeat / Loop Button */}
                <button
                  id="music-repeat-btn"
                  onClick={() => musicService.toggleRepeat()}
                  className={`p-3 rounded-2xl transition-colors cursor-pointer ${
                    isLooping ? 'bg-teal-500 text-slate-900 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                  title="Loop song"
                  aria-label="Loop song"
                >
                  <Repeat className="w-5 h-5" />
                </button>
              </div>

              {/* Core Play / Skip Center Controls */}
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Previous Track */}
                <button
                  id="music-prev-track-btn"
                  onClick={() => musicService.previousSong()}
                  className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                  aria-label={t('previousSong')}
                >
                  <SkipBack className="w-6 h-6" />
                </button>

                {/* GIANT PLAY / PAUSE BUTTON */}
                <button
                  id="music-play-pause-toggle-btn"
                  onClick={() => musicService.togglePlayPause()}
                  className={`w-18 h-18 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                    isPlaying
                      ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 ring-4 ring-amber-400/40'
                      : 'bg-emerald-400 text-slate-950 hover:bg-emerald-300 ring-4 ring-emerald-400/40'
                  }`}
                  aria-label={isPlaying ? t('pauseSong') : t('playSong')}
                >
                  {isPlaying ? (
                    <Pause className="w-9 h-9 fill-current" />
                  ) : (
                    <Play className="w-9 h-9 fill-current translate-x-0.5" />
                  )}
                </button>

                {/* Next Track */}
                <button
                  id="music-next-track-btn"
                  onClick={() => musicService.nextSong()}
                  className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                  aria-label={t('nextSong')}
                >
                  <SkipForward className="w-6 h-6" />
                </button>
              </div>

              {/* Volume & Favorite Right Controls */}
              <div className="flex items-center gap-3">
                {/* Favorite Toggle */}
                {currentSong && (
                  <button
                    id="music-current-fav-btn"
                    onClick={(e) => handleToggleFav(currentSong.id, e)}
                    className={`p-3 rounded-2xl transition-colors cursor-pointer ${
                      favorites.includes(currentSong.id)
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-400/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                    title="Add to Favorites"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        favorites.includes(currentSong.id) ? 'fill-rose-400' : ''
                      }`}
                    />
                  </button>
                )}

                {/* Volume Slider Control */}
                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-2xl border border-white/10">
                  <button
                    onClick={() => musicService.toggleMute()}
                    className="text-teal-300 hover:text-white transition-colors cursor-pointer"
                    aria-label={isMuted ? t('unmute') : t('mute')}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5 text-rose-400" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 sm:w-20 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
                    aria-label={t('volume')}
                  />
                  <span className="text-[11px] font-bold text-teal-200 w-7 text-right">
                    {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY SELECTOR & FILTER TABS */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3
            className={`font-black text-slate-900 flex items-center gap-2 ${
              fontSize === 'extra-large' ? 'text-2xl' : 'text-xl'
            }`}
          >
            <Headphones className="w-6 h-6 text-teal-700" />
            <span>Song Library & Playlists</span>
          </h3>

          <span className="text-xs sm:text-sm font-bold text-slate-500">
            Showing {filteredSongs.length} comfort songs
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'all', label: t('allSongs'), icon: '🎶' },
            { id: 'classical', label: t('classicalPiano'), icon: '🎹' },
            { id: 'nostalgia', label: t('goldenOldies'), icon: '📻' },
            { id: 'nature', label: t('natureSounds'), icon: '🌿' },
            { id: 'ambient', label: t('ambientComfort'), icon: '🕯️' },
            { id: 'custom', label: t('myUploadedSongs'), icon: '⭐' },
            { id: 'favorites', label: 'My Favorites', icon: '❤️' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'bg-teal-700 text-white shadow-md scale-102'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SONG LIST GRID */}
      {filteredSongs.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-slate-300 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
            <Music className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-extrabold text-lg text-slate-900">No songs found in this category</h4>
            <p className="text-slate-500 text-sm mt-1">
              Add any song of your choice using the button below or choose another category.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-700 text-white font-black text-sm cursor-pointer shadow-md hover:bg-teal-800"
          >
            <Plus className="w-4 h-4" />
            <span>{t('uploadCustomSong')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredSongs.map((song) => {
            const isThisPlaying = currentSong?.id === song.id && isPlaying;
            const isThisSelected = currentSong?.id === song.id;

            return (
              <div
                key={song.id}
                onClick={() => handlePlaySong(song)}
                className={`group rounded-3xl p-4 sm:p-5 border-2 transition-all text-left shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between relative ${
                  isThisSelected
                    ? 'bg-teal-50/70 border-teal-500 ring-2 ring-teal-300/50'
                    : highContrast
                    ? 'bg-white border-slate-900 hover:border-black'
                    : 'bg-white border-slate-200 hover:border-teal-300'
                }`}
              >
                <div>
                  {/* Top Thumbnail & Action Badges */}
                  <div className="flex items-start gap-4">
                    <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden shrink-0 border border-slate-100 shadow-xs">
                      <img
                        src={song.coverImage}
                        alt={song.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div
                        className={`absolute inset-0 flex items-center justify-center backdrop-blur-xs transition-opacity ${
                          isThisPlaying
                            ? 'bg-black/40 opacity-100'
                            : 'bg-black/20 opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {isThisPlaying ? (
                          <Pause className="w-7 h-7 text-white fill-white" />
                        ) : (
                          <Play className="w-7 h-7 text-white fill-white translate-x-0.5" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                          {song.category}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleToggleFav(song.id, e)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                            title="Favorite"
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                favorites.includes(song.id) ? 'fill-rose-500 text-rose-500' : ''
                              }`}
                            />
                          </button>

                          {song.isCustom && (
                            <button
                              onClick={(e) => handleDeleteSong(song, e)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete custom song"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <h4 className="font-extrabold text-base sm:text-lg text-slate-900 mt-1 leading-snug line-clamp-1 group-hover:text-teal-800 transition-colors">
                        {song.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 font-semibold line-clamp-1">
                        {song.artist}
                      </p>
                      <p className="text-[11px] text-teal-700 font-medium mt-0.5">
                        {song.eraOrMood}
                      </p>
                    </div>
                  </div>

                  {/* Description / Therapeutic Cue */}
                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {song.description}
                  </p>
                </div>

                {/* Bottom Footer Details */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Music className="w-3.5 h-3.5 text-teal-600" />
                    {formatTime(song.durationSeconds)}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleReadStory(song, e)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
                      title="Read Story"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <span
                      className={`font-black flex items-center gap-1 ${
                        isThisPlaying ? 'text-teal-700' : 'text-slate-700 group-hover:text-teal-700'
                      }`}
                    >
                      {isThisPlaying ? 'Playing' : 'Tap to Play'}
                      <span>→</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CLINICAL BENEFITS INFORMATION CARD */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-teal-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Why Music Therapy Works for Seniors & Memory Care</span>
          </div>
          <h4 className="font-extrabold text-xl sm:text-2xl text-white">
            Music Activates Preserved Pathways in the Brain
          </h4>
          <p className="text-teal-100 text-xs sm:text-sm leading-relaxed">
            Familiar melodies, classical piano, and childhood lullabies access emotional and procedural memory
            centers that remain strong even with memory loss. Music relieves anxiety, evokes smiles, and brings family comfort.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 rounded-2xl bg-white text-teal-900 hover:bg-teal-50 font-black text-sm shrink-0 shadow-sm cursor-pointer transition-all hover:scale-105 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('uploadCustomSong')}</span>
        </button>
      </div>

      {/* Add Custom Song Modal */}
      <AddSongModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveCustomSong}
        patientId={patientId}
      />
    </div>
  );
};
