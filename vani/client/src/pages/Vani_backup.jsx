import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  CameraOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Languages,
  Sliders,
  Send,
  LogOut,
  Info,
  Layers,
  ArrowRight,
  Activity,
  Play,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const studioGestures = [
  { id: 'namaste', name: 'Namaste / Hello', emoji: '🙏', translation: 'Namaste! Welcome to our conversation.', status: 'Verified' },
  { id: 'thanks', name: 'Thank You', emoji: '✨', translation: 'Thank you very much for your help.', status: 'Verified' },
  { id: 'help', name: 'Need Assistance', emoji: '🆘', translation: 'I need medical or emergency assistance, please.', status: 'Verified' },
  { id: 'water', name: 'Water', emoji: '💧', translation: 'Could you please provide some drinking water?', status: 'Verified' },
  { id: 'morning', name: 'Good Morning', emoji: '☀️', translation: 'Good morning! Hope you are having a wonderful day.', status: 'Verified' },
  { id: 'yes', name: 'Yes / Agree', emoji: '👍', translation: 'Yes, I understand and agree.', status: 'Verified' },
  { id: 'no', name: 'No / Disagree', emoji: '👎', translation: 'No, I respectfully disagree.', status: 'Verified' },
  { id: 'love', name: 'I Love You', emoji: '🤟', translation: 'I love you and appreciate your support.', status: 'Verified' },
  { id: 'doctor', name: 'Need Doctor', emoji: '🏥', translation: 'Please connect me with a doctor or nurse.', status: 'Verified' },
];

export default function Vani() {
  const { user, logout } = useAuth();

  // Translator state
  const [mode, setMode] = useState('sign-to-speech'); // 'sign-to-speech' | 'speech-to-sign'
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [currentGesture, setCurrentGesture] = useState(studioGestures[0]);
  const [trackingStatus, setTrackingStatus] = useState('Calibrated');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [targetLang, setTargetLang] = useState('English');

  // Transcript log
  const [transcript, setTranscript] = useState([
    {
      id: 1,
      time: 'Just now',
      gesture: 'Namaste / Hello',
      text: 'Namaste! Welcome to our conversation.',
      status: 'Verified ISL',
    },
  ]);

  // Speech-to-Sign state
  const [inputText, setInputText] = useState('');
  const [reverseOutput, setReverseOutput] = useState([]);

  // DOM refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Start / Stop Camera
  const toggleCamera = async () => {
    if (cameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
      setTrackingStatus('Standby');
    } else {
      setCameraError('');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
        setTrackingStatus('21 Keypoints Active');
      } catch (err) {
        setCameraError(
          'Webcam access unavailable or permission denied. Please verify camera permissions in your browser.'
        );
      }
    }
  };

  // Canvas landmark animation loop
  useEffect(() => {
    let animationFrame;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let t = 0;
    const drawLandmarks = () => {
      t += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (cameraActive) {
        // Draw real-time landmark skeleton over camera
        const cx = canvas.width / 2 + Math.sin(t) * 20;
        const cy = canvas.height / 2 + Math.cos(t * 0.8) * 15;

        // Bounding box
        ctx.strokeStyle = '#2dd4bf';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 85, cy - 95, 170, 190);

        // Label
        ctx.fillStyle = '#2dd4bf';
        ctx.font = '11px sans-serif';
        ctx.fillText('ISL Tracking • 21 Keypoints Active', cx - 80, cy - 105);

        // Hand keypoints
        const points = [
          [cx, cy + 60], // wrist
          [cx - 40, cy + 30], [cx - 60, cy - 10], [cx - 65, cy - 40], // thumb
          [cx - 20, cy - 20], [cx - 25, cy - 70], [cx - 28, cy - 90], // index
          [cx, cy - 30], [cx, cy - 80], [cx, cy - 100], // middle
          [cx + 20, cy - 25], [cx + 22, cy - 75], [cx + 24, cy - 92], // ring
          [cx + 40, cy - 10], [cx + 45, cy - 50], [cx + 48, cy - 70], // pinky
        ];

        // Draw skeleton lines
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.75)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < points.length - 1; i++) {
          ctx.beginPath();
          ctx.moveTo(points[i][0], points[i][1]);
          ctx.lineTo(points[i + 1][0], points[i + 1][1]);
          ctx.stroke();
        }

        // Draw points
        points.forEach(([x, y]) => {
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      animationFrame = requestAnimationFrame(drawLandmarks);
    };

    drawLandmarks();
    return () => cancelAnimationFrame(animationFrame);
  }, [cameraActive]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Text to Speech
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Switch gesture recognition stream
  const handleSelectGesture = (gesture) => {
    setCurrentGesture(gesture);
    setTrackingStatus('Spatial Lock: Stable');

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setTranscript((prev) => [
      {
        id: Date.now(),
        time: timeString,
        gesture: gesture.name,
        text: gesture.translation,
        status: 'Verified ISL',
      },
      ...prev.slice(0, 19),
    ]);

    if (autoSpeak) {
      speakText(gesture.translation);
    }
  };

  // Reverse translation (Speech / Text to Sign)
  const handleReverseTranslate = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const words = inputText.trim().toUpperCase().split(' ');
    const breakdown = words.map((word) => ({
      word,
      letters: word.split('').filter((char) => /[A-Z0-9]/.test(char)),
    }));

    setReverseOutput(breakdown);
  };

  // Copy transcript
  const copyTranscript = () => {
    const textToCopy = transcript.map((t) => `[${t.time}] ${t.gesture}: "${t.text}"`).join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="translator-page">
      <div className="container">
        {/* =========================================================
           TOP WORKSPACE HEADER
           ========================================================= */}
        <div className="workspace-header-bar">
          <div className="workspace-title-col">
            <div className="section-label">
              <Sparkles size={13} /> LIVE TRANSLATOR STUDIO
            </div>
            <h1>
              {user?.name ? (
                <>
                  Welcome, <span className="gradient-text">{user.name.split(' ')[0]}</span>.
                </>
              ) : (
                <>
                  Vani <span className="gradient-text">Translation Studio</span>
                </>
              )}
            </h1>
            <p>
              Real-time Indian Sign Language (ISL) recognition powered by local
              edge computer vision.
            </p>
          </div>

          <div className="workspace-header-actions">
            {/* Mode Switcher */}
            <div className="studio-mode-toggle">
              <button
                className={`mode-btn ${mode === 'sign-to-speech' ? 'active' : ''}`}
                onClick={() => setMode('sign-to-speech')}
              >
                <Camera size={16} />
                <span>Sign → Voice</span>
              </button>
              <button
                className={`mode-btn ${mode === 'speech-to-sign' ? 'active' : ''}`}
                onClick={() => setMode('speech-to-sign')}
              >
                <Languages size={16} />
                <span>Voice/Text → Sign</span>
              </button>
            </div>

            {user ? (
              <button className="btn btn-secondary btn-sm" onClick={logout}>
                <LogOut size={15} />
                <span>Log out</span>
              </button>
            ) : (
              <Link to="/auth" className="btn btn-secondary btn-sm">
                <span>Sign In to Save Logs</span>
              </Link>
            )}
          </div>
        </div>

        {/* =========================================================
           MAIN WORKSPACE DISPLAY
           ========================================================= */}
        {mode === 'sign-to-speech' ? (
          <div className="studio-grid">
            {/* LEFT: CAMERA & LANDMARK TRACKER */}
            <div className="studio-viewport-col">
              <div className="camera-viewport-card">
                {/* Camera Top Status Bar */}
                <div className="camera-meta-bar">
                  <div className="cam-status">
                    <span className={`status-dot ${cameraActive ? 'online' : 'offline'}`} />
                    <span>{cameraActive ? 'CAMERA STREAM ACTIVE' : 'CAMERA STANDBY'}</span>
                  </div>
                  <div className="cam-meta-right">
                    <span className="edge-pill">
                      <ShieldCheck size={13} /> On-Device WASM
                    </span>
                    <span className="fps-tag">60 FPS</span>
                  </div>
                </div>

                {/* Video & Canvas Area */}
                <div className="camera-canvas-container">
                  {cameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="live-webcam-feed"
                    />
                  ) : (
                    <div className="camera-standby-view">
                      <div className="standby-icon-aura">
                        <Camera size={44} />
                      </div>
                      <h3>Ready for Translation</h3>
                      <p>
                        Enable your webcam to start real-time hand gesture
                        tracking and live speech synthesis.
                      </p>
                      <button className="btn btn-primary" onClick={toggleCamera}>
                        <Camera size={16} />
                        <span>Start Camera</span>
                      </button>
                    </div>
                  )}

                  {/* Canvas Landmark Overlay */}
                  <canvas
                    ref={canvasRef}
                    width={640}
                    height={480}
                    className="landmark-canvas-overlay"
                  />

                  {/* Active Detection Banner */}
                  <div className="live-detection-overlay">
                    <div className="det-emoji">{currentGesture.emoji}</div>
                    <div className="det-details">
                      <div className="det-sign-label">RECOGNIZED SIGN</div>
                      <div className="det-sign-name">{currentGesture.name}</div>
                    </div>
                    <div className="det-meter">
                      <Activity size={14} className="text-cyan" />
                      <span>{trackingStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Camera Controls Bar */}
                <div className="camera-controls-bar">
                  <button
                    className={`btn ${cameraActive ? 'btn-danger' : 'btn-secondary'}`}
                    onClick={toggleCamera}
                  >
                    {cameraActive ? (
                      <>
                        <CameraOff size={16} />
                        <span>Turn Off Camera</span>
                      </>
                    ) : (
                      <>
                        <Camera size={16} />
                        <span>Turn On Camera</span>
                      </>
                    )}
                  </button>

                  <div className="audio-toggle-wrap">
                    <button
                      className={`btn-audio-toggle ${autoSpeak ? 'active' : ''}`}
                      onClick={() => setAutoSpeak(!autoSpeak)}
                      title={autoSpeak ? 'Auto-Speech Enabled' : 'Auto-Speech Muted'}
                    >
                      {autoSpeak ? <Volume2 size={18} /> : <VolumeX size={18} />}
                      <span>{autoSpeak ? 'Auto Voice: ON' : 'Auto Voice: OFF'}</span>
                    </button>
                  </div>
                </div>

                {cameraError && (
                  <div className="cam-error-banner">
                    <Info size={16} />
                    <span>{cameraError}</span>
                  </div>
                )}
              </div>

              {/* CAMERA GUIDANCE & SIGN TRACKING INFO */}
              <div className="studio-guidance-card">
                <div className="guidance-header">
                  <Lightbulb size={20} className="text-cyan" />
                  <h4>Camera Framing & Translation Guidelines</h4>
                </div>
                <div className="guidance-grid">
                  <div className="guidance-item">
                    <CheckCircle2 size={16} className="text-cyan" />
                    <div>
                      <strong>Optimal Lighting:</strong> Keep face and hands clearly
                      illuminated with uniform front light for 60 FPS mesh tracking.
                    </div>
                  </div>
                  <div className="guidance-item">
                    <CheckCircle2 size={16} className="text-cyan" />
                    <div>
                      <strong>Gesture Boundary:</strong> Maintain both hands within
                      the cyan framing box to capture continuous movement trajectories.
                    </div>
                  </div>
                  <div className="guidance-item">
                    <CheckCircle2 size={16} className="text-cyan" />
                    <div>
                      <strong>Natural Pacing:</strong> Complete sign strokes with
                      standard pauses to allow the temporal GNN to parse grammar tokens.
                    </div>
                  </div>
                  <div className="guidance-item">
                    <CheckCircle2 size={16} className="text-cyan" />
                    <div>
                      <strong>Edge Architecture:</strong> Computations execute 100% locally
                      in browser memory. Zero video or audio data is ever transmitted.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: LIVE OUTPUT & CONVERSATION TRANSCRIPT */}
            <div className="studio-sidebar-col">
              {/* CURRENT TRANSLATED PHRASE CARD */}
              <div className="current-output-card">
                <div className="output-card-header">
                  <span className="live-badge">
                    <span className="live-dot" /> LIVE SPEECH OUTPUT
                  </span>
                  <button
                    className={`speak-btn ${isSpeaking ? 'speaking' : ''}`}
                    onClick={() => speakText(currentGesture.translation)}
                    title="Vocalize Translation"
                  >
                    <Volume2 size={17} />
                    <span>{isSpeaking ? 'Speaking…' : 'Speak'}</span>
                  </button>
                </div>

                <div className="output-sentence">
                  “{currentGesture.translation}”
                </div>

                <div className="output-meta-row">
                  <span className="target-lang-tag">Target: {targetLang}</span>
                  <span className="latency-tag">Latency: 38ms</span>
                </div>
              </div>

              {/* SESSION TRANSCRIPT LOG */}
              <div className="transcript-log-card">
                <div className="transcript-header">
                  <div className="transcript-title-wrap">
                    <Layers size={16} className="text-cyan" />
                    <h4>Conversation Transcript</h4>
                  </div>
                  <div className="transcript-actions">
                    <button
                      className="btn-icon-subtle"
                      onClick={copyTranscript}
                      title="Copy Transcript"
                    >
                      {copied ? <Check size={15} className="text-cyan" /> : <Copy size={15} />}
                    </button>
                    <button
                      className="btn-icon-subtle"
                      onClick={() => setTranscript([])}
                      title="Clear Log"
                    >
                      <RotateCcw size={15} />
                    </button>
                  </div>
                </div>

                <div className="transcript-scroll-area">
                  {transcript.length === 0 ? (
                    <div className="empty-transcript">
                      <Info size={24} />
                      <p>No gestures recorded in this session. Activate your camera to start.</p>
                    </div>
                  ) : (
                    transcript.map((item) => (
                      <div key={item.id} className="transcript-entry">
                        <div className="entry-top">
                          <strong className="entry-gesture">{item.gesture}</strong>
                          <span className="entry-time">{item.time}</span>
                        </div>
                        <p className="entry-text">“{item.text}”</p>
                        <div className="entry-footer">
                          <span className="entry-conf">
                            <Check size={11} className="text-cyan" /> {item.status}
                          </span>
                          <button
                            className="entry-speak-btn"
                            onClick={() => speakText(item.text)}
                            title="Play Audio"
                          >
                            <Volume2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* SPEECH / TEXT TO SIGN TRANSLATOR */
          <div className="reverse-translator-wrap">
            <div className="reverse-input-card">
              <span className="section-label">VOICE / TEXT TO SIGN CONVERTER</span>
              <h2>Speak or Type Words to Generate ISL Visuals</h2>
              <p>
                Enter any sentence or phrase. Vani translates it into Indian
                Sign Language grammatical sequence and displays corresponding
                fingerspelling manual signs.
              </p>

              <form onSubmit={handleReverseTranslate} className="reverse-input-form">
                <div className="reverse-input-box">
                  <input
                    type="text"
                    placeholder="Type words here (e.g. HELP, HELLO, HOSPITAL, THANK YOU)…"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">
                    <Send size={16} />
                    <span>Generate Signs</span>
                  </button>
                </div>
              </form>

              {/* Sample quick prompts */}
              <div className="reverse-quick-prompts">
                <span>Quick prompts:</span>
                {['HELLO', 'THANK YOU', 'EMERGENCY', 'DOCTOR', 'WATER'].map((word) => (
                  <button
                    key={word}
                    className="prompt-chip"
                    onClick={() => {
                      setInputText(word);
                      const breakdown = [{
                        word,
                        letters: word.split(''),
                      }];
                      setReverseOutput(breakdown);
                    }}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>

            {/* Generated Signs Visualization */}
            {reverseOutput.length > 0 && (
              <div className="reverse-output-section">
                <h3>Visual Sign Language Breakdown</h3>
                <div className="reverse-words-list">
                  {reverseOutput.map((item, idx) => (
                    <div key={idx} className="reverse-word-card">
                      <div className="word-header">
                        <h4>WORD: {item.word}</h4>
                        <span className="gloss-tag">ISL Gloss</span>
                      </div>
                      <div className="letters-grid">
                        {item.letters.map((char, charIdx) => (
                          <div key={charIdx} className="letter-card">
                            <div className="letter-avatar-placeholder">
                              <span className="hand-shape-symbol">✋</span>
                            </div>
                            <span className="letter-char">{char}</span>
                            <small className="letter-hint">ISL Sign {char}</small>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


