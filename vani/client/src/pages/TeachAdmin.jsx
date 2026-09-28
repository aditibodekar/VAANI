import React, { useState, useRef, useEffect } from "react";
import { GraduationCap, Camera, Sparkles, Hand } from "lucide-react";
import {
  extractLandmarkFeatures,
  computeCentroidVector,
  saveCustomGesture,
  calculateCosineSimilarity,
} from "../services/gestureStore";

export default function TeachAdmin() {
  const videoRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const currentLandmarksRef = useRef(null);
  const requestInFlightRef = useRef(false);

  // Form States
  const [signName, setSignName] = useState("");
  const [hindiTranslation, setHindiTranslation] = useState("");
  const [marathiTranslation, setMarathiTranslation] = useState("");
  const [category, setCategory] = useState("custom");
  const [description, setDescription] = useState("");

  // System States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [learnedGesture, setLearnedGesture] = useState(null);
  const [liveSimilarity, setLiveSimilarity] = useState(0);

  // Real-time Translation
  useEffect(() => {
    const text = signName.trim();
    if (!text) {
      setHindiTranslation("");
      setMarathiTranslation("");
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const [hiRes, mrRes] = await Promise.all([
          fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(text)}`),
          fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=mr&dt=t&q=${encodeURIComponent(text)}`),
        ]);
        const hiData = await hiRes.json();
        const mrData = await mrRes.json();
        if (hiData?.[0]?.[0]?.[0]) setHindiTranslation(hiData[0][0][0]);
        if (mrData?.[0]?.[0]?.[0]) setMarathiTranslation(mrData[0][0][0]);
      } catch (e) {}
    }, 300);

    return () => clearTimeout(timer);
  }, [signName]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Optimized Frame Processing Loop
  useEffect(() => {
    let intervalId;

    const detectHandFromBackend = async () => {
      if (!isCameraActive || requestInFlightRef.current || !videoRef.current || videoRef.current.readyState < 2) return;

      const video = videoRef.current;
      const canvas = captureCanvasRef.current || document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, 320, 240);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        requestInFlightRef.current = true;
        const formData = new FormData();
        formData.append("frame", blob, "frame.jpg");

        try {
          const res = await fetch("/ml/predict", { method: "POST", body: formData });
          if (res.ok) {
            const data = await res.json();
            
            // Flexible Landmark Extractor (Supports multiple ML backend return schemas)
            let rawPoints = null;
            if (Array.isArray(data?.landmarks) && data.landmarks.length > 0) {
              if (Array.isArray(data.landmarks[0]?.landmarks)) {
                rawPoints = data.landmarks[0].landmarks;
              } else if (Array.isArray(data.landmarks[0]) && data.landmarks[0].length === 21) {
                rawPoints = data.landmarks[0];
              }
            }

            if (rawPoints && rawPoints.length === 21) {
              currentLandmarksRef.current = rawPoints;
              setIsHandDetected(true);

              if (learnedGesture?.vector) {
                const feats = extractLandmarkFeatures(rawPoints);
                const sim = calculateCosineSimilarity(feats, learnedGesture.vector);
                setLiveSimilarity(Math.round(sim * 100));
              }
            } else {
              currentLandmarksRef.current = null;
              setIsHandDetected(false);
              setLiveSimilarity(0);
            }
          } else {
            setIsHandDetected(false);
          }
        } catch (e) {
          setIsHandDetected(false);
        } finally {
          requestInFlightRef.current = false;
        }
      }, "image/jpeg", 0.6);
    };

    if (isCameraActive) {
      // 150ms interval prevents HTTP request stacking
      intervalId = setInterval(detectHandFromBackend, 150);
    }

    return () => clearInterval(intervalId);
  }, [isCameraActive, learnedGesture]);

  // Camera Initialization
  const initCamera = async () => {
    if (isCameraActive && streamRef.current) return true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      return true;
    } catch (err) {
      setStatusMessage("Could not access camera. Please allow browser camera permissions.");
      setIsCameraActive(false);
      return false;
    }
  };

  // Trigger Countdown & Training
  const handleStartTeaching = async () => {
    if (!signName.trim()) {
      setStatusMessage("Please enter a sign name first!");
      return;
    }

    setStatusMessage(null);
    const cameraReady = await initCamera();
    if (!cameraReady) return;

    let count = 3;
    setCountdown(count);

    const countTimer = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(countTimer);
        setCountdown(null);
        executeSampling();
      }
    }, 1000);
  };

  // Sample Landmark Snapshot Vectors
  const executeSampling = () => {
    setIsCapturing(true);
    setCaptureProgress(0);

    const samples = [];
    const totalFramesNeeded = 12;
    let framesCollected = 0;

    const sampleInterval = setInterval(() => {
      if (currentLandmarksRef.current) {
        const features = extractLandmarkFeatures(currentLandmarksRef.current);
        if (features.length === 68) {
          samples.push(features);
          framesCollected++;
          setCaptureProgress(Math.round((framesCollected / totalFramesNeeded) * 100));
        }
      }

      if (framesCollected >= totalFramesNeeded) {
        clearInterval(sampleInterval);
        finishTraining(samples);
      }
    }, 150);

    // Timeout fallback if hand is removed during recording
    setTimeout(() => {
      if (framesCollected < totalFramesNeeded) {
        clearInterval(sampleInterval);
        if (samples.length >= 4) {
          finishTraining(samples);
        } else {
          setIsCapturing(false);
          setStatusMessage("❌ Hand lost! Keep your hand steady inside the frame and try again.");
        }
      }
    }, 5000);
  };

  const finishTraining = (samples) => {
    const centroidVector = computeCentroidVector(samples);

    const newGesture = {
      id: `custom_${signName.toLowerCase()}_${Date.now()}`,
      name: signName.trim(),
      hindi: hindiTranslation.trim() || signName.trim(),
      marathi: marathiTranslation.trim() || signName.trim(),
      category,
      description: description.trim() || `Custom sign for "${signName}"`,
      vector: centroidVector,
      sampleCount: samples.length,
    };

    saveCustomGesture(newGesture);
    setLearnedGesture(newGesture);
    setIsCapturing(false);
    setStatusMessage(`✅ Successfully learned "${newGesture.name}"! Available instantly in Vani Studio.`);

    setSignName("");
    setHindiTranslation("");
    setMarathiTranslation("");
    setDescription("");
  };

  return (
    <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 16px", color: "#f8fafc" }}>
      <canvas ref={captureCanvasRef} style={{ display: "none" }} aria-hidden="true" />

      <div style={{ background: "linear-gradient(to right, #0f172a, #020617)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <GraduationCap size={20} color="#38bdf8" />
          <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#ffffff", margin: 0 }}>
            Train Indian Sign Language Words
          </h2>
        </div>
        <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
          Captures 3D anatomical landmark geometry in real-time. Custom signs predict across VAANI Live Studio instantly.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px", alignItems: "start" }}>
        {/* Form Box */}
        <div style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", color: "#f8fafc", margin: 0 }}>
            1. Enter Sign Details
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#cbd5e1", marginBottom: "6px" }}>
                Word / Sign Name (English) *
              </label>
              <input
                type="text"
                value={signName}
                onChange={(e) => setSignName(e.target.value)}
                placeholder="e.g. Doctor, Water, Family..."
                style={{ width: "100%", background: "#020617", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "10px", padding: "8px 12px", fontSize: "12px", color: "#f8fafc", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#fcd34d", marginBottom: "6px" }}>हिंदी (Hindi)</label>
                <input type="text" value={hindiTranslation} onChange={(e) => setHindiTranslation(e.target.value)} placeholder="उदा. डॉक्टर" style={{ width: "100%", background: "#020617", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "10px", padding: "8px 12px", fontSize: "12px", color: "#f8fafc", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#34d399", marginBottom: "6px" }}>मराठी (Marathi)</label>
                <input type="text" value={marathiTranslation} onChange={(e) => setMarathiTranslation(e.target.value)} placeholder="उदा. डॉक्टर" style={{ width: "100%", background: "#020617", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "10px", padding: "8px 12px", fontSize: "12px", color: "#f8fafc", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#cbd5e1", marginBottom: "6px" }}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%", background: "#020617", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "10px", padding: "8px 12px", fontSize: "12px", color: "#f8fafc", outline: "none", boxSizing: "border-box" }}>
                <option value="custom">Custom Gesture (सानुकूल जेश्चर)</option>
                <option value="greetings">Greetings (अभिवादन)</option>
                <option value="daily_needs">Daily Needs (दैनिक गरजा)</option>
                <option value="family">Family & Relations (कुटुंब आणि नातेसंबंध)</option>
                <option value="emergency">Emergency & Medical (आपत्कालीन आणि वैद्यकीय)</option>
                <option value="courtesy">Expressions & Courtesy (विनम्रता आणि भावना)</option>
                <option value="numbers">Numbers & Counting (संख्या आणि गणना)</option>
                <option value="alphabets">Alphabets (मुळाक्षरे)</option>
                <option value="education">School & Education (शाळा आणि शिक्षण)</option>
                <option value="food">Food & Dining (अन्न आणि पेय)</option>
                <option value="verbs">Actions & Verbs (क्रियापद)</option>
                <option value="travel">Places & Travel (ठिकाणे आणि प्रवास)</option>
                <option value="time">Time & Calendar (वेळ आणि कॅलेंडर)</option>
              </select>
            </div>
          </div>

          {statusMessage && (
            <div style={{ padding: "10px 12px", background: statusMessage.includes("Successfully") ? "rgba(52, 211, 153, 0.1)" : "rgba(239, 68, 68, 0.1)", border: `1px solid ${statusMessage.includes("Successfully") ? "rgba(52, 211, 153, 0.3)" : "rgba(239, 68, 68, 0.3)"}`, borderRadius: "8px", fontSize: "12px", color: statusMessage.includes("Successfully") ? "#34d399" : "#f87171", display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={16} />
              <span>{statusMessage}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleStartTeaching}
            disabled={!signName.trim() || isCapturing || countdown !== null}
            style={{ width: "100%", padding: "12px", background: "linear-gradient(to right, #0891b2, #0d9488, #059669)", border: "none", borderRadius: "10px", color: "#ffffff", fontSize: "12px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            <Camera size={16} />
            <span>
              {countdown !== null ? `Get Ready... (${countdown})` : isCapturing ? `Sampling Landmarks (${captureProgress}%)...` : "Record & Teach Gesture"}
            </span>
          </button>
        </div>

        {/* Viewport Box */}
        <div style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "12px" }}>
            <h3 style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", color: "#f8fafc", margin: "0 0 4px 0" }}>
              2. Live Pose Capture & Accuracy Test
            </h3>
            <p style={{ fontSize: "11px", color: isHandDetected ? "#34d399" : "#f87171", margin: 0, fontWeight: "600" }}>
              {isHandDetected ? "🟢 Hand Detected in Frame" : "🔴 Hand Offline - Raise hand into camera frame"}
            </p>
          </div>

          <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 3", background: "#000000", borderRadius: "12px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", display: isCameraActive ? "block" : "none" }} />

            {!isCameraActive && (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Camera size={40} color="#64748b" style={{ marginBottom: "8px" }} />
                <p style={{ fontSize: "13px", fontWeight: "bold", color: "#f8fafc", margin: "0 0 4px 0" }}>Camera Viewport Offline</p>
                <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>Click "Record & Teach Gesture" to start live capture.</p>
              </div>
            )}

            {countdown !== null && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(2, 6, 23, 0.85)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 20 }}>
                <span style={{ fontSize: "72px", fontWeight: "800", color: "#38bdf8" }}>{countdown}</span>
                <span style={{ fontSize: "12px", color: "#f8fafc", marginTop: "8px" }}>Hold hand steady!</span>
              </div>
            )}

            {isCapturing && (
              <div style={{ position: "absolute", bottom: "16px", left: "16px", right: "16px", background: "rgba(2, 6, 23, 0.9)", borderRadius: "10px", padding: "12px", border: "1px solid rgba(56, 189, 248, 0.4)", zIndex: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "bold", color: "#38bdf8", marginBottom: "6px" }}>
                  <span>Capturing Landmark Geometry...</span>
                  <span>{captureProgress}%</span>
                </div>
                <div style={{ width: "100%", height: "6px", background: "#0f172a", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${captureProgress}%`, background: "linear-gradient(to right, #38bdf8, #34d399)", transition: "width 0.1s linear" }} />
                </div>
              </div>
            )}

            {learnedGesture && !isCapturing && countdown === null && (
              <div style={{ position: "absolute", bottom: "16px", left: "16px", right: "16px", background: "rgba(2, 6, 23, 0.9)", borderRadius: "10px", padding: "10px 14px", border: "1px solid rgba(255, 255, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: "bold", color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Hand size={14} color="#34d399" />
                    <span>Real-time Match ({learnedGesture.name}):</span>
                  </div>
                </div>
                <span style={{ fontSize: "18px", fontWeight: "bold", fontFamily: "monospace", color: liveSimilarity >= 88 ? "#34d399" : "#94a3b8" }}>
                  {liveSimilarity}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}