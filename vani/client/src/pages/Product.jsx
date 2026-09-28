import { motion } from 'framer-motion';
import {
  Camera,
  MessageSquareText,
  ArrowRight,
  Cpu,
  Layers,
  Zap,
  Play,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Product() {
  return (
    <div className="product-page">
      {/* =========================================================
         1. PRODUCT HERO
         ========================================================= */}
      <section className="page-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="section-label">THE VANI PLATFORM</div>
            <h1 className="page-hero-title">
              Engineered for <span className="gradient-text">Frictionless Dialogue</span>
            </h1>
            <p className="page-hero-description">
              A state-of-the-art dual-engine translation system built on edge
              computer vision, neural gesture kinematics, and natural language
              synthesis. Experience Indian Sign Language translation with zero latency.
            </p>
            <div className="page-hero-actions">
              <Link to="/vani" className="btn btn-primary">
                <Play size={16} fill="currentColor" />
                <span>Launch Live Studio</span>
              </Link>
              <a href="#architecture" className="btn btn-secondary">
                <span>Explore Architecture</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
         2. DUAL-ENGINE ARCHITECTURE
         ========================================================= */}
      <section id="architecture" className="section dual-engine-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">DUAL-ENGINE SYSTEM</span>
            <h2 className="section-title">
              True <span className="gradient-text">Two-Way Inclusivity</span>
            </h2>
            <p className="section-description">
              Real communication requires listening as well as speaking. Vani
              operates in two synchronized directions to bridge deaf and hearing
              conversants.
            </p>
          </div>

          <div className="engine-grid">
            {/* Engine 1: Sign to Speech */}
            <motion.div
              className="engine-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="engine-badge badge-sign">
                <Camera size={16} />
                <span>ENGINE 01 • SIGN → SPEECH</span>
              </div>
              <h3>Visual Hand Kinematics to Natural Voice</h3>
              <p>
                Takes standard video stream from any laptop, smartphone, or USB
                camera. Processes 21 3D coordinates per hand at 60 FPS.
              </p>
              <div className="pipeline-steps-list">
                <div className="pipeline-step-item">
                  <span className="dot" />
                  <div>
                    <strong>Spatial Keypoint Extraction:</strong> MediaPipe
                    geometry calculates joint angles and finger curl vectors.
                  </div>
                </div>
                <div className="pipeline-step-item">
                  <span className="dot" />
                  <div>
                    <strong>Temporal Trajectory GNN:</strong> Graph Neural
                    Network classifies gestures over consecutive frame windows.
                  </div>
                </div>
                <div className="pipeline-step-item">
                  <span className="dot" />
                  <div>
                    <strong>Vernacular Speech Synthesis:</strong> Reconstructs
                    words into sentences and vocalizes via Web Speech API.
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Engine 2: Speech to Sign */}
            <motion.div
              className="engine-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="engine-badge badge-speech">
                <MessageSquareText size={16} />
                <span>ENGINE 02 • SPEECH → SIGN</span>
              </div>
              <h3>Spoken Conversation to Visual Sign Guide</h3>
              <p>
                Hearing participants speak normally into the microphone. Vani
                parses vernacular speech and generates visual signs & fingerspelling.
              </p>
              <div className="pipeline-steps-list">
                <div className="pipeline-step-item">
                  <span className="dot" />
                  <div>
                    <strong>Acoustic Speech-to-Text:</strong> Real-time
                    continuous transcription with high dialectal resilience.
                  </div>
                </div>
                <div className="pipeline-step-item">
                  <span className="dot" />
                  <div>
                    <strong>Grammar Parser & ISL Glossing:</strong> Converts
                    spoken SVO (Subject-Verb-Object) to ISL SOV grammatical syntax.
                  </div>
                </div>
                <div className="pipeline-step-item">
                  <span className="dot" />
                  <div>
                    <strong>Animated Sign Cards:</strong> Displays corresponding
                    sign demonstrations and finger-spelling representations.
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================
         3. TECHNICAL BENCHMARKS & EDGE ARCHITECTURE
         ========================================================= */}
      <section className="section tech-specs-section">
        <div className="container">
          <div className="tech-specs-card">
            <div className="tech-specs-left">
              <span className="section-label">EDGE ARCHITECTURE SPECIFICATION</span>
              <h2>Zero Cloud Latency. 100% Client-Side Execution.</h2>
              <p>
                Unlike conventional cloud-vision platforms, Vani executes gesture
                recognition locally in the user's browser via WebAssembly (WASM)
                and WebGL. Raw camera video frames are processed directly in local
                memory with zero remote dependency.
              </p>
              <div className="specs-pills-row">
                <div className="spec-pill">
                  <Cpu size={16} className="text-cyan" />
                  <span>WASM Inference</span>
                </div>
                <div className="spec-pill">
                  <Layers size={16} className="text-cyan" />
                  <span>WebGL Acceleration</span>
                </div>
                <div className="spec-pill">
                  <Zap size={16} className="text-cyan" />
                  <span>Real-Time 60 FPS</span>
                </div>
              </div>
            </div>
            <div className="tech-specs-right">
              <Link to="/vani" className="btn btn-primary btn-large">
                <Play size={18} fill="currentColor" />
                <span>Launch Vani Studio</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

