import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Bot,
  User as UserIcon,
  Camera,
  ImageIcon,
  CheckCircle2,
  Clock,
  Pill,
  Coffee,
  X,
  RefreshCw,
  Bell,
  Check,
  AlertCircle,
  Copy,
  SwitchCamera,
  Compass,
  Smile,
  BookOpen,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { api } from '../../services/api';
import { speech } from '../../services/speech';
import { ChatMessage, Reminder, LanguageOption } from '../../types';

interface AIAssistantViewProps {
  onBack: () => void;
}

type QuestionCategory = 'northeast' | 'curiosity' | 'reminders' | 'memories';

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { speakText, fontSize, language, highContrast } = useAccessibility();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Microphone & Speech-to-Text State
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechActiveObj, setSpeechActiveObj] = useState<{ stop: () => void } | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  // Camera & Image State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // UI tabs & states
  const [activeTab, setActiveTab] = useState<QuestionCategory>('curiosity');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeReminders, setActiveReminders] = useState<Reminder[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Play gentle subtle web-audio chime for mic feedback
  const playChime = (freq = 440, duration = 0.12) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  };

  // Quick prompt categories
  const categories: { id: QuestionCategory; label: string; icon: string }[] = [
    { id: 'curiosity', label: 'Any Random Question', icon: '🧠' },
    { id: 'northeast', label: 'North East Heritage', icon: '🏔️' },
    { id: 'reminders', label: 'My Daily Reminders', icon: '🔔' },
    { id: 'memories', label: 'Family & Memories', icon: '🏡' },
  ];

  const quickQuestions: Record<QuestionCategory, string[]> = {
    curiosity: [
      '🌤️ Why is the sky blue?',
      '🐝 How do honeybees make honey?',
      '🌈 What creates a rainbow?',
      '☕ How do I make a soothing ginger-tulsi tea?',
      '😄 Tell me a sweet gentle joke',
      '📖 Tell me a peaceful short story',
      '🌙 Why does the moon change shape?',
    ],
    northeast: [
      '🌾 Tell me about Assam tea & Kaziranga rhino',
      '🌧️ How are Meghalaya living root bridges made?',
      '🪷 Tell me about Manipur Loktak lake and Sangai deer',
      '🎋 What is Mizoram Cheraw bamboo dance?',
      '🦅 Tell me about Nagaland Hornbill festival',
      '👑 Tell me about Tripura Neermahal water palace',
      '🏔️ Tell me about Sikkim & Mount Kanchenjunga',
    ],
    reminders: [
      '🔔 What are my reminders for today?',
      '💊 Did I take my morning pills?',
      '✅ I took my morning medicine',
      '💧 I just drank a fresh glass of water',
    ],
    memories: [
      '🌻 Tell me about my daughter Sarah',
      '🎨 Tell me about my grandson Leo',
      '🐕 Tell me about our dog Sunny',
      '🌲 Tell me about our Blue Ridge mountain cabin',
    ],
  };

  const cameraQuickQuestions = [
    { label: '💊 Check Pill Container', prompt: 'What medication is this pill bottle, and when should I take it?' },
    { label: '⏰ Read Clock Time', prompt: 'What time does this clock show, and what is next on my schedule?' },
    { label: '📝 Read Note / Paper', prompt: 'Please read the text written on this paper out loud for me.' },
    { label: '🥛 Check Drink', prompt: 'Is this a fresh drink or glass of water for my daily hydration?' },
    { label: '🌸 Identify Object', prompt: 'Please look closely at this item and tell me gently what it is.' },
  ];

  useEffect(() => {
    const loadInitialData = async () => {
      const patientId = user?._id || 'patient_eleanor';
      try {
        const [history, remList] = await Promise.all([
          api.getAIHistory(patientId),
          api.getReminders(patientId),
        ]);
        setActiveReminders(remList);

        if (history && history.length > 0) {
          setMessages(history);
        } else {
          setMessages([
            {
              id: 'init_1',
              role: 'assistant',
              content: `Hello ${user?.name || 'Eleanor'}! I am your MindCare Companion. You can ask me ANY random question about nature, science, or our beautiful North Eastern Indian heritage, check your daily medicine reminders, or turn on your camera so I can look at items with you!`,
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      } catch (_) {
        setMessages([
          {
            id: 'init_1',
            role: 'assistant',
            content: `Hello ${user?.name || 'Eleanor'}! I am here to answer any question, help you remember family and medications, and look at objects through your camera.`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    };
    loadInitialData();

    return () => {
      stopCamera();
      speechActiveObj?.stop();
    };
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, interimTranscript]);

  // Clean, high-performance camera startup
  const startCamera = async (targetMode = facingMode) => {
    setCameraError(null);
    setIsCameraOpen(true);
    // Stop any existing stream
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera hardware access is not supported by this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: targetMode,
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
        },
        audio: false,
      });

      setCameraStream(stream);
      setFacingMode(targetMode);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.warn('Video play error:', e));
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      // Try fallback to any available video device
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setCameraStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play().catch(() => {});
        }
      } catch (fallbackErr) {
        setCameraError('Camera access was blocked or is unavailable. You can also pick a photo from your device.');
      }
    }
  };

  const flipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    startCamera(nextMode);
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  // Capture snapshot with optimal resolution and high compression for instant AI transmission
  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');

    const maxDim = 800;
    let w = video.videoWidth || 640;
    let h = video.videoHeight || 480;

    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.84);
      setCapturedImage(dataUrl);
      stopCamera();
      playChime(660, 0.15);
      speakText('Photo captured! Tap an action below or ask me about this item.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedImage(event.target.result as string);
          playChime(580, 0.12);
          speakText('Photo attached. Ask me anything about this item or medicine.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Main Send Message Handler
  const handleSendMessage = async (customText?: string) => {
    const query = (customText || inputText).trim();
    if ((!query && !capturedImage) || isLoading) return;

    const patientId = user?._id || 'patient_eleanor';
    const messageText = query || 'Please look closely at what I am showing you in my camera.';
    const imageToSend = capturedImage;

    // Reset input states immediately
    setInputText('');
    setInterimTranscript('');
    setCapturedImage(null);

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
      imagePreview: imageToSend || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await api.sendAIChat(
        patientId,
        messageText,
        messages.map((m) => ({ role: m.role, content: m.content })),
        imageToSend || undefined,
        imageToSend ? 'image/jpeg' : undefined
      );

      const assistantMsg: ChatMessage = {
        id: 'msg_ai_' + Date.now(),
        role: 'assistant',
        content: response.reply,
        timestamp: response.timestamp,
        actionTaken: response.actionTaken,
        affectedReminder: response.affectedReminder,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If reminder completed/created, update state
      if (response.actionTaken === 'reminder_completed' || response.actionTaken === 'reminder_created') {
        const freshReminders = await api.getReminders(patientId);
        setActiveReminders(freshReminders);
      }

      // Read aloud automatically for elder ease
      speakText(response.reply);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        role: 'assistant',
        content: `I am right here with you! You can ask me any question about nature, North Eastern traditions, or your family and daily reminders.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Locale mapper for speech recognition
  const getSpeechLocale = (lang: LanguageOption): string => {
    const map: Record<LanguageOption, string> = {
      en: 'en-US',
      as: 'as-IN',
      bn: 'bn-IN',
      mni: 'mni-IN',
      brx: 'brx-IN',
      lus: 'lus-IN',
      kha: 'kha-IN',
      grt: 'grt-IN',
      ne: 'ne-NP',
      ao: 'en-IN',
      trp: 'bn-IN',
      hi: 'hi-IN',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
    };
    return map[lang] || 'en-US';
  };

  // Microphone toggle with real-time audio wave and interim speech
  const toggleSpeechRecognition = () => {
    setMicError(null);
    if (isListening) {
      speechActiveObj?.stop();
      setIsListening(false);
      playChime(330, 0.1);
      if (interimTranscript.trim()) {
        handleSendMessage(interimTranscript);
      }
      return;
    }

    if (!speech.isSTTSupported()) {
      setMicError('Speech recognition is not supported in this browser. You can type or tap prompt buttons.');
      return;
    }

    playChime(520, 0.15);
    setIsListening(true);
    setInterimTranscript('');

    const locale = getSpeechLocale(language);

    const recognition = speech.startListening({
      language: locale,
      onStart: () => {
        setIsListening(true);
      },
      onInterimResult: (interim) => {
        setInterimTranscript(interim);
      },
      onResult: (transcript) => {
        setInterimTranscript('');
        setIsListening(false);
        playChime(660, 0.1);
        handleSendMessage(transcript);
      },
      onError: (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
        setMicError('Microphone timed out or had trouble hearing. Tap again and speak clearly.');
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    setSpeechActiveObj(recognition);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="ai-assistant-view" className="max-w-4xl mx-auto space-y-4 py-2">
      {/* Top Bar Navigation & Badges */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          id="ai-back-btn"
          onClick={() => {
            stopCamera();
            speechActiveObj?.stop();
            onBack();
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm shadow-xs cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-900 border border-teal-200 px-3 py-1.5 rounded-2xl text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Random Question & NE AI</span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-900 border border-purple-200 px-3 py-1.5 rounded-2xl text-xs font-bold shadow-2xs">
            <Camera className="w-3.5 h-3.5 text-purple-600" />
            <span>Smart Vision</span>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[720px] overflow-hidden">
        {/* Assistant Top Header */}
        <div className="bg-gradient-to-r from-teal-900 via-indigo-950 to-purple-950 text-white p-4 sm:p-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/30 flex items-center justify-center text-white border border-teal-400/40 shrink-0">
              <Bot className="w-7 h-7 text-teal-200" />
            </div>
            <div>
              <h2 className="font-black text-xl leading-tight flex items-center gap-2">
                <span>MindCare AI Companion</span>
              </h2>
              <p className="text-teal-200 text-xs font-medium">
                Trained to answer any random question, North Eastern heritage, voice, & camera vision
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => speech.stopSpeaking()}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
              title="Stop voice playback"
            >
              <VolumeX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Camera Viewfinder Overlay with Enhanced Target Brackets */}
        {isCameraOpen && (
          <div className="bg-slate-950 p-4 border-b border-purple-400/40 relative flex flex-col items-center">
            <div className="relative max-w-sm w-full bg-black rounded-2xl overflow-hidden border-2 border-teal-400 shadow-2xl aspect-4/3">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover bg-black"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Target Alignment Corner Brackets for Medicine / Object Recognition */}
              <div className="absolute inset-5 pointer-events-none flex flex-col justify-between">
                <div className="flex justify-between">
                  <span className="w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-lg" />
                  <span className="w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-lg" />
                </div>
                <div className="self-center bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full border border-teal-400/40 shadow-sm flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
                  <span>Center pill bottle, note, clock, or object</span>
                </div>
                <div className="flex justify-between">
                  <span className="w-6 h-6 border-b-4 border-l-4 border-teal-400 rounded-bl-lg" />
                  <span className="w-6 h-6 border-b-4 border-r-4 border-teal-400 rounded-br-lg" />
                </div>
              </div>

              {cameraError && (
                <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-4 text-center">
                  <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
                  <p className="text-xs text-white mb-3">{cameraError}</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Select Photo from Device
                  </button>
                </div>
              )}
            </div>

            {/* Camera Controls with Flip Camera */}
            <div className="flex items-center gap-2 sm:gap-3 mt-3 flex-wrap justify-center">
              <button
                id="camera-snap-btn"
                onClick={captureSnapshot}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-sm rounded-2xl shadow-md cursor-pointer transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span>Snap & Analyze</span>
              </button>

              <button
                id="camera-flip-btn"
                onClick={flipCamera}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-200 font-bold text-sm rounded-2xl cursor-pointer transition-colors"
                title="Switch between front and back camera"
              >
                <SwitchCamera className="w-4 h-4" />
                <span>Flip Camera</span>
              </button>

              <button
                id="camera-close-btn"
                onClick={stopCamera}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-2xl cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>
          </div>
        )}

        {/* Live Microphone Active Wave Banner */}
        {isListening && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 py-3 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-6 bg-rose-600 rounded-full animate-pulse" />
                <span className="w-1.5 h-8 bg-rose-500 rounded-full animate-pulse [animation-delay:0.15s]" />
                <span className="w-1.5 h-5 bg-rose-600 rounded-full animate-pulse [animation-delay:0.3s]" />
                <span className="w-1.5 h-9 bg-rose-500 rounded-full animate-pulse [animation-delay:0.45s]" />
                <span className="w-1.5 h-4 bg-rose-600 rounded-full animate-pulse [animation-delay:0.2s]" />
              </div>
              <div className="truncate">
                <span className="text-xs font-black text-rose-950 block">Listening carefully...</span>
                <span className="text-xs text-rose-800 italic truncate block">
                  {interimTranscript || 'Speak your question or thoughts aloud...'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  if (interimTranscript.trim()) {
                    handleSendMessage(interimTranscript);
                  }
                  speechActiveObj?.stop();
                  setIsListening(false);
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs"
              >
                Send
              </button>
              <button
                onClick={() => {
                  speechActiveObj?.stop();
                  setIsListening(false);
                  setInterimTranscript('');
                }}
                className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl cursor-pointer"
                title="Cancel voice input"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {micError && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{micError}</span>
            </div>
            <button onClick={() => setMicError(null)} className="text-amber-700 font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Message Log */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/60">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[92%] sm:max-w-[85%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold shadow-xs ${
                    isUser ? 'bg-teal-700' : 'bg-indigo-900'
                  }`}
                >
                  {isUser ? <UserIcon className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                <div
                  className={`p-4 sm:p-5 rounded-3xl shadow-xs space-y-3 ${
                    isUser
                      ? 'bg-teal-700 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {/* Attached photo preview */}
                  {msg.imagePreview && (
                    <div className="rounded-2xl overflow-hidden border-2 border-teal-500/50 max-w-xs shadow-xs">
                      <img
                        src={msg.imagePreview}
                        alt="Patient camera snapshot"
                        className="w-full h-44 object-cover"
                      />
                      <div className="bg-teal-800/80 px-2.5 py-1 text-[11px] font-bold text-teal-100 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Camera Snapshot</span>
                      </div>
                    </div>
                  )}

                  <p
                    className={`leading-relaxed whitespace-pre-wrap ${
                      fontSize === 'extra-large' ? 'text-lg' : fontSize === 'large' ? 'text-base' : 'text-sm'
                    }`}
                  >
                    {msg.content}
                  </p>

                  {/* Reminder Action Tag */}
                  {msg.actionTaken === 'reminder_completed' && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 font-bold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Reminder Completed: {msg.affectedReminder?.title || 'Scheduled task'}</span>
                    </div>
                  )}

                  {/* Footer actions on assistant response */}
                  {!isUser && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 cursor-pointer font-semibold"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => speakText(msg.content)}
                        className="inline-flex items-center gap-1.5 font-extrabold text-teal-700 hover:text-teal-900 cursor-pointer"
                        title="Listen to this message"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen Aloud</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <div className="w-10 h-10 rounded-2xl bg-indigo-900 flex items-center justify-center text-white flex-shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-3xl rounded-tl-none flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-bounce" />
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs font-black text-teal-900 ml-1">Thinking with care...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Interactive Captured Photo Tray (When photo is ready) */}
        {capturedImage && (
          <div className="p-4 bg-teal-50 border-t border-teal-200 space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-16 h-16 rounded-xl object-cover ring-2 ring-teal-500 shadow-xs"
                  />
                  <button
                    onClick={() => setCapturedImage(null)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-xs cursor-pointer"
                    title="Remove Photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <span className="text-xs font-black text-teal-950 block">Photo Ready for AI Vision</span>
                  <span className="text-[11px] text-teal-800">
                    Tap a quick question below, or type your own question
                  </span>
                </div>
              </div>

              <button
                onClick={() => startCamera()}
                className="text-xs font-bold text-teal-900 bg-white border border-teal-300 px-3 py-1.5 rounded-xl hover:bg-teal-100 cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retake</span>
              </button>
            </div>

            {/* Quick Vision Prompts */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {cameraQuickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q.prompt)}
                  className="text-xs font-bold px-3 py-1.5 bg-white border border-teal-300 hover:bg-teal-600 hover:text-white text-teal-950 rounded-xl whitespace-nowrap shadow-2xs transition-colors cursor-pointer shrink-0"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Question Category Switcher & Prompts */}
        {!capturedImage && (
          <div className="bg-slate-100/90 border-t border-slate-200">
            {/* Category Tabs */}
            <div className="flex items-center gap-1 px-3 pt-2 border-b border-slate-200 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`px-3 py-1 rounded-t-xl text-xs font-bold cursor-pointer whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    activeTab === cat.id
                      ? 'bg-white text-teal-900 border-t border-x border-slate-200 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Questions for Active Category */}
            <div className="px-3 py-2 flex items-center gap-2 overflow-x-auto">
              {quickQuestions[activeTab].map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(q.replace(/^[^\w\s]+\s*/, ''))}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white hover:bg-teal-50 hover:text-teal-900 border border-slate-200 text-slate-700 whitespace-nowrap transition-colors cursor-pointer shadow-2xs shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Input Area with Large Accessible Controls */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2 sm:gap-3">
          {/* Camera Button */}
          <button
            id="ai-camera-btn"
            type="button"
            onClick={() => (isCameraOpen ? stopCamera() : startCamera())}
            className={`p-3.5 sm:p-4 rounded-2xl font-bold flex items-center justify-center transition-all cursor-pointer ${
              isCameraOpen || capturedImage
                ? 'bg-teal-700 text-white shadow-md ring-2 ring-teal-300'
                : 'bg-slate-100 hover:bg-teal-50 text-teal-900 border border-slate-200'
            }`}
            title="Open camera to identify medicine bottles, clocks, or notes"
            aria-label="Open Camera"
          >
            <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Hidden File Input for Device Photo Alternative */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            id="ai-upload-photo-btn"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3.5 sm:p-4 rounded-2xl font-bold flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer"
            title="Upload photo from device"
            aria-label="Upload photo"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Microphone Speech-to-Text Button */}
          <button
            id="ai-mic-btn"
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-3.5 sm:p-4 rounded-2xl font-bold flex items-center justify-center transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse shadow-md ring-4 ring-rose-200'
                : 'bg-teal-100 hover:bg-teal-200 text-teal-900 border border-teal-300'
            }`}
            title={isListening ? 'Listening... Tap to send now' : 'Tap to speak your question'}
            aria-label="Voice input microphone"
          >
            {isListening ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              id="ai-text-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder={
                isListening
                  ? 'Listening to your voice now...'
                  : capturedImage
                  ? 'Ask about this photo or medicine bottle...'
                  : 'Ask any question (science, North East heritage, reminders)...'
              }
              className="w-full bg-slate-100 border border-slate-300 rounded-2xl px-4 py-3 sm:py-3.5 text-sm sm:text-base font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:bg-white transition-colors"
            />
          </div>

          {/* Send Button */}
          <button
            id="ai-send-btn"
            type="button"
            onClick={() => handleSendMessage()}
            disabled={(!inputText.trim() && !capturedImage) || isLoading}
            className={`p-3.5 sm:p-4 rounded-2xl font-bold flex items-center justify-center shadow-xs transition-all ${
              (inputText.trim() || capturedImage) && !isLoading
                ? 'bg-teal-700 hover:bg-teal-800 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
