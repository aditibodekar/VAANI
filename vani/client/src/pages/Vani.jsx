import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Camera,
  Check,
  Copy,
  Languages,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Trash2,
  Undo,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import SignAnimationViewer from '../components/SignAnimationViewer.jsx';
import {
  getCustomGestures,
  extractLandmarkFeatures,
  calculateCosineSimilarity,
  fetchServerCustomGestures,
} from '../services/gestureStore';

const ML_API = '/ml';

const STUDIO_GESTURES = [
  { name: 'Hello', emoji: '👋', description: 'A friendly greeting' },
  { name: 'Hi', emoji: '🙋', description: 'Casual greeting' },
  { name: 'Good', emoji: '👍', description: 'Positive expression' },
  { name: 'Yes', emoji: '✅', description: 'Affirmative response' },
  { name: 'No', emoji: '❌', description: 'Negative response' },
  { name: 'Please', emoji: '🙏', description: 'Polite request' },
  { name: 'Sorry', emoji: '🙇', description: 'Apology' },
  { name: 'Thank You', emoji: '❤️', description: 'Expression of gratitude' },
  { name: 'Welcome', emoji: '🤝', description: 'Welcoming someone' },
  { name: 'Stop', emoji: '✋', description: 'Request to stop' },
  { name: 'Namaste', emoji: '🙏', description: 'Traditional greeting' },
];

function getGestureInfo(name) {
  return (
    STUDIO_GESTURES.find(
      (gesture) => gesture.name.toLowerCase() === String(name).toLowerCase()
    ) || {
      name,
      emoji: '',
      description: '',
    }
  );
}

function formatConfidence(value) {
  const conf = Number(value);
  if (!Number.isFinite(conf) || conf === 0) return '0%';
  return `${Math.round(Math.max(0, Math.min(1, conf)) * 100)}%`;
}

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

function drawLandmarks(canvas, hands) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  if (!Array.isArray(hands)) return;

  hands.forEach((hand) => {
    const points = Array.isArray(hand?.landmarks) ? hand.landmarks : [];
    if (points.length !== 21) return;

    const screenPoints = points.map((point) => ({
      x: Number(point.x) * width,
      y: Number(point.y) * height,
    }));

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.85)';

    HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const start = screenPoints[startIdx];
      const end = screenPoints[endIdx];
      if (!start || !end) return;

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    });

    screenPoints.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, index === 0 ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = index === 0 ? 'rgba(255, 255, 255, 0.98)' : 'rgba(34, 211, 238, 0.95)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.stroke();
    });
  });
}

const translateSentence = async (text, lang) => {
  if (!text || lang === 'English') return text;
  const langCode = lang === 'Hindi' ? 'hi' : 'mr';
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${langCode}&dt=t&q=${encodeURIComponent(text)}`
    );
    const data = await res.json();
    if (data?.[0]?.[0]?.[0]) {
      return data[0][0][0];
    }
  } catch (e) {}
  return text;
};

export default function Vani() {
  const { user } = useAuth();

  // Mode & Camera state
  const [mode, setMode] = useState('sign-to-speech');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [currentGesture, setCurrentGesture] = useState({
    name: '',
    translatedName: '',
    emoji: '',
    description: '',
  });
  const [confidence, setConfidence] = useState(0);
  const [handsDetected, setHandsDetected] = useState(0);
  const [framesCollected, setFramesCollected] = useState(0);
  
  // Audio Preference
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [, setIsSpeakingState] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Language States
  const [targetLang, setTargetLang] = useState('English');
  const [sentenceLang, setSentenceLang] = useState('English');
  const [, setTranslation] = useState('');
  const [mlConnected, setMlConnected] = useState(false);
  const [mlError, setMlError] = useState('');

  // Integrated AI Studio States
  const [tokens, setTokens] = useState([]);
  const [synthesizedSentence, setSynthesizedSentence] = useState(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [conversationFeed, setConversationFeed] = useState([]);
  
  // Speech-to-Sign Specific States
  const [speechToSignText, setSpeechToSignText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [activeAnimationPhrase, setActiveAnimationPhrase] = useState('');
  const recognitionRef = useRef(null);

  // High Performance Smooth Timing & Lock Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const predictionTimerRef = useRef(null);
  const predictionInFlightRef = useRef(false);
  const mountedRef = useRef(true);
  
  const lastRecognizedGestureRef = useRef('');
  const gestureCooldownRef = useRef(false);
  const cooldownTimerRef = useRef(null);

  useEffect(() => {
    fetchServerCustomGestures();
  }, []);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSpeechToSignText(transcript);
          setActiveAnimationPhrase(transcript);
        }
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      const languageMap = { English: 'en-IN', Hindi: 'hi-IN', Marathi: 'mr-IN' };
      recognitionRef.current.lang = languageMap[targetLang] || 'en-IN';
      recognitionRef.current.start();
    }
  };

  const handleConvertTextToSign = () => {
    if (speechToSignText.trim()) {
      setActiveAnimationPhrase(speechToSignText.trim());
    }
  };

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeakingState(false);
    }
  }, []);

  const toggleAudioPreference = useCallback(() => {
    setAudioEnabled((prev) => {
      const nextState = !prev;
      if (!nextState) {
        stopSpeech();
      }
      return nextState;
    });
  }, [stopSpeech]);

  // Multilingual Speech Engine
  const speakText = useCallback(
    async (text, lang) => {
      if (!audioEnabled || !text || typeof window === 'undefined' || !window.speechSynthesis) return;

      window.speechSynthesis.cancel();

      const textToSpeak = await translateSentence(text, lang);
      const targetLangTag = lang === 'Hindi' ? 'hi-IN' : lang === 'Marathi' ? 'mr-IN' : 'en-IN';

      const voices = window.speechSynthesis.getVoices();

      let matchedVoice = voices.find(
        (v) => v.lang === targetLangTag || v.lang.startsWith(targetLangTag.split('-')[0])
      );

      if (!matchedVoice && lang === 'Marathi') {
        matchedVoice = voices.find((v) => v.lang.startsWith('hi'));
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = matchedVoice ? matchedVoice.lang : targetLangTag;
      utterance.rate = 0.9;

      if (matchedVoice) utterance.voice = matchedVoice;

      utterance.onstart = () => mountedRef.current && setIsSpeakingState(true);
      utterance.onend = () => mountedRef.current && setIsSpeakingState(false);
      utterance.onerror = () => mountedRef.current && setIsSpeakingState(false);

      window.speechSynthesis.speak(utterance);
    },
    [audioEnabled]
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const addToken = useCallback((word) => {
    setTokens((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].toLowerCase() === word.toLowerCase()) return prev;
      return [...prev, word];
    });
  }, []);

  const handleRemoveToken = (index) => setTokens((prev) => prev.filter((_, i) => i !== index));
  const handleClearTokens = () => {
    setTokens([]);
    setSynthesizedSentence(null);
    lastRecognizedGestureRef.current = '';
  };
  const handleUndoToken = () => setTokens((prev) => prev.slice(0, -1));

  // Sentence Synthesis Logic
  const autoFormSentence = useCallback(async () => {
    if (tokens.length === 0) {
      setSynthesizedSentence(null);
      return;
    }

    setIsSynthesizing(true);

    const cleanTokens = tokens.filter((tok, idx) => idx === 0 || tok.toLowerCase() !== tokens[idx - 1].toLowerCase());
    const lowerTokens = cleanTokens.map((t) => t.toLowerCase().trim());

    let englishResult = '';
    let isCompleteSentence = false;

    const standaloneGreetings = ['hi', 'hello', 'namaste', 'please', 'sorry', 'welcome', 'stop', 'good', 'yes', 'no', 'thank you'];

    if (cleanTokens.length === 1 && standaloneGreetings.includes(lowerTokens[0])) {
      const word = cleanTokens[0];
      englishResult = word.charAt(0).toUpperCase() + word.slice(1) + '.';
      isCompleteSentence = true;
    } else if (lowerTokens.includes('how') && lowerTokens.includes('you')) {
      englishResult = 'How are you?';
      isCompleteSentence = true;
    } else if (lowerTokens.includes('i') && lowerTokens.includes('fine')) {
      englishResult = 'I am fine.';
      isCompleteSentence = true;
    } else if (lowerTokens.includes('i') && lowerTokens.includes('good')) {
      englishResult = 'I am doing good.';
      isCompleteSentence = true;
    } else if (lowerTokens.includes('you') && lowerTokens.includes('okay')) {
      englishResult = 'Are you okay?';
      isCompleteSentence = true;
    } else if (lowerTokens.includes('please') && lowerTokens.includes('help')) {
      englishResult = 'Please help';
      isCompleteSentence = true;
    }
    
    else {
      englishResult = cleanTokens.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + '.';
      if (cleanTokens.length >= 2) {
        isCompleteSentence = true;
      }
    }

    try {
      const response = await fetch(`${ML_API}/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens: cleanTokens, target_language: sentenceLang }),
      });

      if (response.ok) {
        const data = await response.json();
        const translatedText =
          sentenceLang === 'Hindi'
            ? data.hindi || (await translateSentence(data.english, 'Hindi'))
            : sentenceLang === 'Marathi'
            ? data.marathi || (await translateSentence(data.english, 'Marathi'))
            : data.english;

        setSynthesizedSentence({
          english: data.english || englishResult,
          hindi: data.hindi || (await translateSentence(data.english || englishResult, 'Hindi')),
          marathi: translatedText,
        });

        if (isCompleteSentence) {
          setConversationFeed((prev) => [
            ...prev,
            {
              id: `${Date.now()}`,
              gesture: translatedText,
              emoji: '💬',
              timestamp: new Date(),
            },
          ]);

          if (audioEnabled) speakText(translatedText, sentenceLang);

          setTimeout(() => {
            setTokens([]);
            lastRecognizedGestureRef.current = '';
          }, 500);
        }

        setIsSynthesizing(false);
        return;
      }
    } catch (e) {}

    const translatedFallback = await translateSentence(englishResult, sentenceLang);
    const hindiText = await translateSentence(englishResult, 'Hindi');
    const marathiText = await translateSentence(englishResult, 'Marathi');

    setSynthesizedSentence({
      english: englishResult,
      hindi: hindiText,
      marathi: marathiText,
    });

    if (isCompleteSentence) {
      setConversationFeed((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          gesture: translatedFallback,
          emoji: '💬',
          timestamp: new Date(),
        },
      ]);

      if (audioEnabled) speakText(translatedFallback, sentenceLang);

      setTimeout(() => {
        setTokens([]);
        lastRecognizedGestureRef.current = '';
      }, 500);
    }

    setIsSynthesizing(false);
  }, [tokens, sentenceLang, audioEnabled, speakText]);

  useEffect(() => {
    autoFormSentence();
  }, [tokens, sentenceLang]);

  // Handle Recognized Gesture
  const handleRecognizedGesture = useCallback(
    async (gesture, gestureConfidence, gestureObj = null) => {
      if (!gesture || gestureCooldownRef.current) return;

      const info = getGestureInfo(gesture);
      const translated = await translateSentence(gesture, targetLang);

      setCurrentGesture({ ...info, name: gesture, translatedName: translated });
      setConfidence(Number.isFinite(Number(gestureConfidence)) ? Number(gestureConfidence) : 0);

      if (lastRecognizedGestureRef.current !== gesture) {
        lastRecognizedGestureRef.current = gesture;
        addToken(gesture);

        gestureCooldownRef.current = true;
        if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
        cooldownTimerRef.current = setTimeout(() => {
          gestureCooldownRef.current = false;
        }, 1000);
      }
    },
    [addToken, targetLang]
  );

  // Optimized Lightweight Frame Processing Loop
  const processCurrentFrame = useCallback(async () => {
    if (!cameraActive || predictionInFlightRef.current || mode !== 'sign-to-speech') return;

    if (gestureCooldownRef.current) return;

    const video = videoRef.current;
    const captureCanvas = captureCanvasRef.current;

    if (!video || !captureCanvas || video.readyState < 2) return;

    // Downscale capture canvas to 640x360 for light ML network transmission
    const targetW = 640;
    const targetH = 360;
    captureCanvas.width = targetW;
    captureCanvas.height = targetH;

    const context = captureCanvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0, targetW, targetH);
    predictionInFlightRef.current = true;

    try {
      // Compress blob to 0.5 quality for instant low-latency transmission
      const blob = await new Promise((res) => captureCanvas.toBlob(res, 'image/jpeg', 0.5));
      if (!blob) throw new Error('Frame capture failed');

      const formData = new FormData();
      formData.append('frame', blob, 'frame.jpg');

      const response = await fetch(`${ML_API}/predict`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`ML status ${response.status}`);

      const result = await response.json();
      if (!mountedRef.current) return;

      setMlConnected(true);
      setMlError('');
      setHandsDetected(Number(result?.hands) || 0);
      setFramesCollected(Number(result?.frames_collected) || 0);

      drawLandmarks(canvasRef.current, result?.landmarks || []);

      if (!result?.hands || result.hands === 0) {
        lastRecognizedGestureRef.current = '';
      }

      if (result?.landmarks && result.landmarks.length > 0 && result.landmarks[0]?.landmarks) {
        const liveHandPoints = result.landmarks[0].landmarks;
        const liveFeatures = extractLandmarkFeatures(liveHandPoints);
        const customGestures = getCustomGestures();

        let bestMatch = null;
        let highestSim = 0;

        for (const customSign of customGestures) {
          const sim = calculateCosineSimilarity(liveFeatures, customSign.vector);
          if (sim > highestSim && sim >= 0.88) {
            highestSim = sim;
            bestMatch = customSign;
          }
        }

        if (bestMatch) {
          handleRecognizedGesture(bestMatch.name, highestSim, bestMatch);
          return;
        }
      }

      if (result?.status === 'recognized' && result?.gesture && (Number(result.confidence) || 0) >= 0.88) {
        handleRecognizedGesture(result.gesture, result.confidence);
      } else {
        if (result?.confidence !== undefined) setConfidence(Number(result.confidence) || 0);
        if (result?.status === 'waiting') {
          setCurrentGesture({ name: '', translatedName: '', emoji: '', description: '' });
          setConfidence(0);
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setMlConnected(false);
        setMlError(err?.message || 'Unable to reach ML service.');
      }
    } finally {
      predictionInFlightRef.current = false;
    }
  }, [cameraActive, mode, handleRecognizedGesture]);

  const startCamera = useCallback(async () => {
    setCameraError('');
    setMlError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      setCameraActive(false);
      setCameraError(err?.message || 'Could not access camera.');
    }
  }, []);

  const stopCamera = useCallback(async () => {
    if (predictionTimerRef.current) {
      clearInterval(predictionTimerRef.current);
      predictionTimerRef.current = null;
    }
    predictionInFlightRef.current = false;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const toggleCamera = useCallback(() => {
    if (cameraActive) stopCamera();
    else startCamera();
  }, [cameraActive, startCamera, stopCamera]);

  // Smooth polling rate (120ms)
  useEffect(() => {
    if (!cameraActive || mode !== 'sign-to-speech') return undefined;
    predictionTimerRef.current = window.setInterval(processCurrentFrame, 120);
    return () => clearInterval(predictionTimerRef.current);
  }, [cameraActive, mode, processCurrentFrame]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopSpeech();
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [stopSpeech]);

  const copyTranscript = async () => {
    const text = conversationFeed.map((item) => item.gesture).join(' ');
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const clearTranscript = () => {
    setConversationFeed([]);
    setTranslation('');
    handleClearTokens();
  };

  const handleSelectGesture = (gesture) => {
    if (mode === 'speech-to-sign') {
      setSpeechToSignText(gesture.name);
      setActiveAnimationPhrase(gesture.name);
    } else {
      const info = getGestureInfo(gesture.name);
      setCurrentGesture({ ...info, name: gesture.name, translatedName: gesture.name });
      setConfidence(1);
      addToken(gesture.name);
    }
  };

  return (
    <main className="translator-page">
      <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px' }}>
        {/* Workspace Header Bar */}
        <div className="workspace-header-bar" style={{ marginBottom: '24px' }}>
          <div className="workspace-title-col">
            <span className="eyebrow">VAANI LIVE TRANSLATOR</span>
            <h1 style={{ fontSize: '28px', margin: '4px 0' }}>
              Sign language, <span className="gradient-text">understood.</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>Real-time sign recognition powered by MediaPipe and your trained model.</p>
          </div>

          <div className="workspace-header-actions">
            <div className="studio-mode-toggle">
              <button
                type="button"
                className={`mode-btn ${mode === 'sign-to-speech' ? 'active' : ''}`}
                onClick={() => setMode('sign-to-speech')}
              >
                <Languages size={15} />
                Sign to Speech
              </button>
              <button
                type="button"
                className={`mode-btn ${mode === 'speech-to-sign' ? 'active' : ''}`}
                onClick={() => {
                  setMode('speech-to-sign');
                  if (cameraActive) stopCamera();
                }}
              >
                <Volume2 size={15} />
                Speech to Sign
              </button>
            </div>
          </div>
        </div>

        {/* Main Studio Grid */}
        <div className="studio-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
          {/* Left Column: Smooth Widescreen Camera Box */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="camera-viewport-card" style={{ background: '#090d16', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div className="camera-meta-bar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div className="cam-status" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <span className={`status-dot ${mode === 'sign-to-speech' ? (cameraActive ? 'online' : 'offline') : 'online'}`} />
                  {mode === 'sign-to-speech' ? (cameraActive ? 'HD Widescreen Active' : 'Camera Offline') : 'Animation Player Ready'}
                </div>

                <div className="cam-meta-right" style={{ display: 'flex', gap: '8px' }}>
                  <span className="edge-pill" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {mode === 'sign-to-speech' ? (
                      mlConnected ? <><Wifi size={12} /> AI Connected</> : <><WifiOff size={12} /> AI Offline</>
                    ) : (
                      <><Sparkles size={12} color="#38bdf8" /> ISL Animation Engine</>
                    )}
                  </span>
                </div>
              </div>

              {/* Viewport Frame */}
              <div
                className="camera-canvas-container"
                style={{
                  position: 'relative',
                  width: '100%',
                  minHeight: '480px',
                  aspectRatio: '16 / 9',
                  background: '#020617',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {mode === 'sign-to-speech' ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="live-webcam-feed"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    {!cameraActive && (
                      <div
                        className="camera-overlay"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          padding: '20px',
                          zIndex: 10,
                        }}
                      >
                        <div className="camera-icon-circle" style={{ padding: '16px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '50%', marginBottom: '12px' }}>
                          <Camera size={36} className="text-cyan-400" color="#38bdf8" />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 6px 0' }}>
                          Start HD Widescreen Camera
                        </h3>
                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, maxWidth: '380px' }}>
                          Position your upper body and hands inside the frame to begin signing clearly.
                        </p>
                      </div>
                    )}

                    <canvas
                      ref={canvasRef}
                      width={640}
                      height={360}
                      className="landmark-canvas-overlay"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                    />
                    <canvas ref={captureCanvasRef} width={640} height={360} style={{ display: 'none' }} aria-hidden="true" />
                  </>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', background: '#020617' }}>
                    {activeAnimationPhrase || speechToSignText || currentGesture.name ? (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Sparkles size={14} />
                          <span>Demonstrating Sign for: "{activeAnimationPhrase || speechToSignText || currentGesture.name}"</span>
                        </div>
                        <SignAnimationViewer phrase={activeAnimationPhrase || speechToSignText || currentGesture.name} />
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '32px' }}>
                        <Volume2 size={48} color="#38bdf8" style={{ marginBottom: '12px' }} />
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 6px 0' }}>
                          Speech to Sign Studio
                        </h3>
                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                          Speak or type a phrase on the right panel to generate real-time ISL video animations.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Viewport Control Bar */}
              <div className="camera-controls-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                {mode === 'sign-to-speech' ? (
                  <>
                    <div className="camera-control-info" style={{ fontSize: '12px', color: '#94a3b8' }}>
                      <span>{handsDetected > 0 ? `${handsDetected} hand${handsDetected > 1 ? 's' : ''} detected` : 'No hands detected'}</span>
                    </div>

                    <button type="button" className={`btn ${cameraActive ? 'btn-secondary' : 'btn-primary'}`} onClick={toggleCamera} style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px' }}>
                      {cameraActive ? <><Square size={15} /> Stop Camera</> : <><Camera size={15} /> Start Camera</>}
                    </button>
                  </>
                ) : (
                  <div className="camera-control-info" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <span>{activeAnimationPhrase ? `Displaying: ${activeAnimationPhrase}` : 'Waiting for audio/text input...'}</span>
                    {activeAnimationPhrase && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => setActiveAnimationPhrase('')}
                      >
                        Reset Animation
                      </button>
                    )}
                  </div>
                )}
              </div>

              {mode === 'sign-to-speech' && (cameraError || mlError) && (
                <div className="camera-error-message" role="alert" style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>
                  {cameraError || mlError}
                </div>
              )}
            </div>

            {/* Audio Settings Preference Bar */}
            <div className="auto-speak-card" style={{ background: '#090d16', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '13px', color: '#f8fafc' }}>Audio Speech Preference</strong>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{audioEnabled ? '🔊 Audio playback active' : '🔇 Audio playback muted'}</span>
              </div>

              <button
                type="button"
                onClick={toggleAudioPreference}
                style={{
                  background: audioEnabled ? '#ef4444' : '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              >
                {audioEnabled ? <VolumeX size={16} /> : <Volume2 size={16} />}
                <span>{audioEnabled ? 'Mute Audio' : 'Enable Audio'}</span>
              </button>
            </div>
          </section>

          {/* Right Column: Sidebar Controls */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {mode === 'sign-to-speech' ? (
              /* Sign-to-Speech Output Card */
              <div className="result-card" style={{ background: '#090d16', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                      CURRENT SIGN ({targetLang.toUpperCase()})
                    </span>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '4px 0 0 0', color: '#38bdf8' }}>
                      {currentGesture.translatedName || currentGesture.name || '—'}
                    </h2>
                  </div>

                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    style={{
                      background: '#020617',
                      color: '#f8fafc',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">हिंदी (Hindi)</option>
                    <option value="Marathi">मराठी (Marathi)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                  <span>Confidence</span>
                  <strong>{formatConfidence(confidence)}</strong>
                </div>

                <div style={{ height: '6px', width: '100%', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden', marginBottom: '20px' }}>
                  <div style={{ height: '100%', background: '#38bdf8', width: `${Math.max(0, Math.min(100, confidence * 100))}%`, transition: 'width 0.3s ease' }} />
                </div>

                {/* Detected Tokens Buffer */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8' }}>DETECTED SIGN TOKENS</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button type="button" onClick={handleUndoToken} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} title="Undo token"><Undo size={14} /></button>
                      <button type="button" onClick={handleClearTokens} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Clear tokens"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', minHeight: '36px', alignItems: 'center' }}>
                    {tokens.length === 0 && (
                      <span style={{ color: '#64748b', fontSize: '12px' }}>No signs detected yet...</span>
                    )}
                    {tokens.map((tok, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: 'rgba(34, 211, 238, 0.15)',
                          border: '1px solid rgba(34, 211, 238, 0.4)',
                          color: '#38bdf8',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {tok}
                        <button type="button" onClick={() => handleRemoveToken(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Formed Sentence Frame */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#34d399' }}>SENTENCE FORMED</span>

                    <select
                      value={sentenceLang}
                      onChange={(e) => setSentenceLang(e.target.value)}
                      style={{
                        background: '#020617',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        outline: 'none',
                      }}
                    >
                      <option value="English">English</option>
                      <option value="Hindi">हिंदी (Hindi)</option>
                      <option value="Marathi">मराठी (Marathi)</option>
                    </select>
                  </div>

                  <div
                    style={{
                      padding: '12px',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: '10px',
                      minHeight: '48px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', color: synthesizedSentence ? '#f8fafc' : '#64748b' }}>
                      {isSynthesizing ? (
                        <span style={{ color: '#38bdf8' }}>Forming sentence...</span>
                      ) : synthesizedSentence ? (
                        sentenceLang === 'Hindi'
                          ? synthesizedSentence.hindi
                          : sentenceLang === 'Marathi'
                          ? synthesizedSentence.marathi
                          : synthesizedSentence.english
                      ) : (
                        <span style={{ fontSize: '12px', fontWeight: 'normal' }}>
                          Signs will automatically combine into a sentence here...
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Speech-to-Sign Input Card */
              <div className="result-card" style={{ background: '#090d16', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8' }}>SPEECH & TEXT TO SIGN</span>
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    style={{
                      background: '#020617',
                      color: '#f8fafc',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '11px',
                    }}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">हिंदी (Hindi)</option>
                    <option value="Marathi">मराठी (Marathi)</option>
                  </select>
                </div>

                <textarea
                  value={speechToSignText}
                  onChange={(e) => setSpeechToSignText(e.target.value)}
                  placeholder={`Type or speak (${targetLang})... e.g. "Namaste", "Hello"`}
                  rows={3}
                  style={{
                    width: '100%',
                    background: '#020617',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '10px',
                    color: '#f8fafc',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                    marginBottom: '12px',
                  }}
                />

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={toggleListening}
                    style={{
                      background: isListening ? '#ef4444' : 'rgba(56, 189, 248, 0.15)',
                      color: isListening ? '#ffffff' : '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                    <span>{isListening ? 'Listening...' : 'Speak'}</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={handleConvertTextToSign}
                    disabled={!speechToSignText.trim()}
                  >
                    <Send size={15} />
                    <span>Generate Sign</span>
                  </button>
                </div>
              </div>
            )}

            {/* Conversation Feed Card */}
            <div className="transcript-card" style={{ background: '#090d16', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>LIVE TRANSCRIPT</span>
                  <h3 style={{ fontSize: '15px', color: '#ffffff', margin: 0 }}>Your Conversation</h3>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" onClick={copyTranscript} disabled={conversationFeed.length === 0} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} title="Copy">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                  <button type="button" onClick={clearTranscript} disabled={conversationFeed.length === 0} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Clear">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {conversationFeed.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '12px' }}>
                    <Sparkles size={18} style={{ marginBottom: '6px' }} />
                    <p style={{ margin: 0 }}>Formed sentences will appear here automatically.</p>
                  </div>
                ) : (
                  conversationFeed.map((item) => (
                    <div key={item.id} style={{ background: '#020617', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{item.emoji}</span>
                      <strong style={{ color: '#f8fafc' }}>{item.gesture}</strong>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* Gesture Library Section */}
        <section style={{ marginTop: '32px' }}>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 'bold' }}>SUPPORTED SIGNS</span>
            <h2 style={{ fontSize: '18px', color: '#ffffff', margin: '2px 0 0 0' }}>Click any sign to test</h2>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {STUDIO_GESTURES.map((gesture) => (
              <button
                type="button"
                key={gesture.name}
                onClick={() => handleSelectGesture(gesture)}
                style={{
                  background: currentGesture.name === gesture.name || activeAnimationPhrase.toLowerCase() === gesture.name.toLowerCase() ? 'rgba(56, 189, 248, 0.2)' : '#090d16',
                  border: currentGesture.name === gesture.name || activeAnimationPhrase.toLowerCase() === gesture.name.toLowerCase() ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#f8fafc',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{gesture.emoji}</span>
                <span>{gesture.name}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}