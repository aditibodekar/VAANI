
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Heart,
  Globe2,
  Users,
  Layers,
  Activity,
  Play,
  ArrowUpRight,
  Cpu,
  Eye,
  Hand,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

const featurePillars = [
  {
    icon: Hand,
    tag: "Spatial Vision",
    title: "21-Point Keypoint Mesh",
    desc: "Tracks 21 3D coordinates per hand in real-time at 60 FPS using pure browser vision. No specialized gloves, sensors, or markers required.",
  },
  {
    icon: Zap,
    tag: "Neural Engine",
    title: "Temporal Kinematics",
    desc: "Decodes gesture velocity, trajectory vectors, and spatial transitions across consecutive frames to capture natural Indian Sign Language grammar.",
  },
  {
    icon: Globe2,
    tag: "Dual Engine",
    title: "Bidirectional Speech",
    desc: "Seamlessly converts silent signs into natural spoken vernacular audio, and translates spoken conversations back into visual sign animations.",
  },
  {
    icon: ShieldCheck,
    tag: "Edge Computing",
    title: "100% Local Inference",
    desc: "All vision processing executes strictly on your device via WebAssembly and WebGL. Camera feeds never leave your browser or touch remote servers.",
  },
];

const purposePillars = [
  {
    icon: Globe2,
    number: "01",
    title: "Bridging the 63M+ Divide",
    desc: "Over 63 million individuals in India live with severe hearing impairment. Vani bridges linguistic isolation by removing reliance on scarce interpreters.",
  },
  {
    icon: Zap,
    number: "02",
    title: "Real-Time Two-Way Dialogue",
    desc: "Communication is a two-way street. Vani translates silent hand gestures to voice, and converts spoken audio back into visual sign animations.",
  },
  {
    icon: ShieldCheck,
    number: "03",
    title: "100% On-Device Processing",
    desc: "Your video stream never leaves your browser. Hand landmark tracking runs entirely on edge hardware, running locally with zero remote cloud dependency.",
  },
  {
    icon: Users,
    number: "04",
    title: "Dignity & Equal Opportunity",
    desc: "From job interviews and bank counters to university classrooms, Vani grants deaf individuals the autonomy and dignity to express themselves freely.",
  },
];


const howItWorksSteps = [
  {
    step: "01",
    title: "High-Speed Landmark Tracking",
    desc: "Using advanced vision algorithms, Vani tracks 21 spatial coordinates across each hand along with facial orientation at 60 FPS without special gloves.",
    tag: "Computer Vision",
  },
  {
    step: "02",
    title: "Temporal Gesture Classification",
    desc: "A lightweight recurrent graph neural network decodes continuous hand motion vectors, spatial grammar, and temporal trajectories into semantic tokens.",
    tag: "Neural Engine",
  },
  {
    step: "03",
    title: "Instant Voice & Text Synthesis",
    desc: "Tokens are reconstructed into grammatically fluent vernacular sentences, instantly vocalized via natural speech synthesis and rendered on screen.",
    tag: "Multilingual TTS",
  },
];

const metrics = [
  { value: "21", label: "3D Keypoints", sub: "Continuous hand landmark tracking" },
  { value: "<45ms", label: "Inference Latency", sub: "Real-time client-side computation" },
  { value: "350+", label: "Vocabulary Signs", sub: "Everyday conversation & emergency tokens" },
  { value: "Zero", label: "Cloud Video Storage", sub: "Strict 100% on-device execution" },
];

const testimonials = [
  {
    quote: "During hospital visits, explaining my symptoms was terrifying without a family member. Vani gives me my voice back with doctors.",
    author: "Rohan Verma",
    role: "Computer Science Student, Delhi",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80",
  },
  {
    quote: "Vani allowed our school to conduct inclusive science lab sessions where deaf students can participate actively with hearing peers.",
    author: "Priya Sundaram",
    role: "Special Education Coordinator, Bangalore",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
  },
  {
    quote: "In emergency triage, every second counts. Vani helped our ER team understand an injured deaf patient's medical history immediately.",
    author: "Dr. Ananya Nair",
    role: "Emergency Medicine Physician, Mumbai",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&auto=format&fit=crop&q=80",
  },
];

function Home() {
  return (
    <div className="home-page">
      {/* =========================================================
         1. HERO SECTION
         ========================================================= */}
      <section className="hero-section">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="container hero-container-layout">
          {/* Left Hero Content */}
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Pill Badge */}
            <motion.div
              className="hero-badge"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <Sparkles size={15} />
              <span>Edge AI • Indian Sign Language Platform</span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              Breaking silence,
              <br />
              <span className="gradient-text">connecting hearts</span>
              <br />
              one sign at a time.
            </motion.h1>

            {/* Description */}
            <motion.p
              className="hero-description"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
            >
              Vani harnesses edge computer vision and deep learning to translate
              Indian Sign Language into natural spoken speech and readable text in
              real time. Making conversations inclusive, fluid, and effortless.
            </motion.p>

            {/* Hero Actions */}
            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              <Link to="/vani" className="btn btn-primary btn-large">
                <Play size={18} fill="currentColor" />
                <span>Launch Live Translator</span>
              </Link>
              <a href="#features" className="btn btn-secondary btn-large">
                <span>Explore Architecture</span>
                <ArrowRight size={18} />
              </a>
            </motion.div>

            {/* Trust tags */}
            <motion.div
              className="hero-trust-row"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <div className="trust-item">
                <CheckCircle2 size={16} className="text-cyan" />
                <span>Zero hardware needed</span>
              </div>
              <div className="trust-item">
                <CheckCircle2 size={16} className="text-cyan" />
                <span>Private on-device AI</span>
              </div>
              <div className="trust-item">
                <CheckCircle2 size={16} className="text-cyan" />
                <span>Two-way speech synthesis</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Hero Visual / Interactive Avatar Mockup */}
          <motion.div
            className="hero-visual-wrapper"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.9 }}
          >
            <div className="ai-preview-card">
              <div className="ai-preview-header">
                <div className="status-indicator">
                  <span className="live-pulse" />
                  <span>VANI VISION ENGINE • LIVE</span>
                </div>
                <span className="fps-counter">60 FPS</span>
              </div>

              {/* Hand Visual Graphics */}
              <div className="ai-circle-canvas">
                <div className="ai-ring ai-ring-one" />
                <div className="ai-ring ai-ring-two" />
                <div className="hand-icon-large">🤟</div>

                {/* Landmarks overlay */}
                <div className="landmark-point pt-1" />
                <div className="landmark-point pt-2" />
                <div className="landmark-point pt-3" />
                <div className="landmark-point pt-4" />
                <div className="landmark-point pt-5" />
              </div>

              {/* Real-time recognition preview card */}
              <div className="recognition-result-bar">
                <div className="recognition-text-col">
                  <small>Recognized Sign</small>
                  <strong>Namaste / Welcome</strong>
                </div>
                <div className="status-pill-badge">
                  <Activity size={13} className="text-cyan" />
                  <span>Mesh Calibrated</span>
                </div>
              </div>

              {/* Floating badges */}
              <motion.div
                className="floating-card floating-card-one"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <div className="float-icon">🖐️</div>
                <div>
                  <strong>21 Landmarks</strong>
                  <small>Continuous 3D Mesh</small>
                </div>
              </motion.div>

              <motion.div
                className="floating-card floating-card-two"
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              >
                <div className="float-icon">🔊</div>
                <div>
                  <strong>Audio Voice</strong>
                  <small>Vernacular Speech Out</small>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
         2. CORE CAPABILITIES (REPLACING OLD DEMO)
         ========================================================= */}
      <section id="features" className="section features-showcase-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <span className="section-label">CUTTING-EDGE ARCHITECTURE</span>
            <h2 className="section-title">
              Engineered for <span className="gradient-text">Human Connection</span>
            </h2>
            <p className="section-description">
              Vani brings together high-speed spatial vision, temporal graph
              neural networks, and multilingual audio synthesis to make silent
              dialogue fluent and effortless.
            </p>
          </motion.div>

          <div className="feature-pillars-grid">
            {featurePillars.map((feat, index) => {
              const IconComp = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  className="feature-pillar-card"
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.12, duration: 0.6 }}
                >
                  <div className="pillar-icon-box">
                    <IconComp size={24} />
                  </div>
                  <span className="pillar-tag">{feat.tag}</span>
                  <h3>{feat.title}</h3>
                  <p>{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
         3. CORE PURPOSE SECTION
         ========================================================= */}
      <section className="section purpose-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <span className="section-label">CORE PURPOSE</span>
            <h2 className="section-title">
              Why Vani Exists: <span className="gradient-text">Human Inclusion</span>
            </h2>
            <p className="section-description">
              Language is how we express intellect, empathy, and dreams. When
              spoken barriers silence individuals, society loses immense human
              potential. Vani removes this barrier forever.
            </p>
          </motion.div>

          <div className="purpose-grid">
            {purposePillars.map((pillar, index) => {
              const IconComp = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  className="purpose-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <div className="purpose-card-header">
                    <span className="purpose-number">{pillar.number}</span>
                    <div className="purpose-icon-box">
                      <IconComp size={22} />
                    </div>
                  </div>
                  <h3 className="purpose-card-title">{pillar.title}</h3>
                  <p className="purpose-card-desc">{pillar.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>


      {/* =========================================================
         5. HOW IT WORKS PIPELINE
         ========================================================= */}
      <section className="section how-it-works-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <span className="section-label">HOW IT WORKS</span>
            <h2 className="section-title">
              From Silent Gesture to <span className="gradient-text">Spoken Meaning</span>
            </h2>
            <p className="section-description">
              Three seamless computational stages convert hand movements into
              crystal-clear natural conversations in under 45 milliseconds.
            </p>
          </motion.div>

          <div className="steps-flow-grid">
            {howItWorksSteps.map((step, idx) => (
              <motion.div
                key={step.step}
                className="step-flow-card"
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: idx * 0.15, duration: 0.6 }}
              >
                <div className="step-card-top">
                  <span className="step-tag-pill">{step.tag}</span>
                  <span className="step-num">{step.step}</span>
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
         6. IMPACT METRICS (NO ACCURACY MENTION)
         ========================================================= */}
      <section className="section metrics-section">
        <div className="container">
          <div className="metrics-card-wrapper">
            <div className="metrics-grid">
              {metrics.map((m, i) => (
                <motion.div
                  key={m.label}
                  className="metric-item"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <div className="metric-val gradient-text">{m.value}</div>
                  <div className="metric-title">{m.label}</div>
                  <div className="metric-sub">{m.sub}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
         7. TESTIMONIALS / REAL STORIES
         ========================================================= */}
      <section className="section stories-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="section-label">REAL IMPACT</span>
            <h2 className="section-title">
              Built For the Moments <span className="gradient-text">That Matter</span>
            </h2>
            <p className="section-description">
              Discover how Vani is transforming classrooms, healthcare
              facilities, and daily life for people across India.
            </p>
          </motion.div>

          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.author}
                className="testimonial-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
              >
                <p className="testimonial-quote">“{t.quote}”</p>
                <div className="testimonial-profile">
                  <img src={t.avatar} alt={t.author} className="profile-pic" />
                  <div className="profile-details">
                    <strong>{t.author}</strong>
                    <small>{t.role}</small>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
         8. CALL TO ACTION BANNER
         ========================================================= */}
      <section className="section home-cta-section">
        <div className="container">
          <motion.div
            className="home-cta-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="cta-content">
              <span className="badge-pill">
                <Heart size={14} fill="currentColor" /> Completely Free & Open
              </span>
              <h2>Ready to Experience Seamless Sign Translation?</h2>
              <p>
                Launch Vani's Live Translator directly in your browser. Powered by
                edge AI with zero installation and complete client-side execution.
              </p>
              <div className="cta-button-group">
                <Link to="/vani" className="btn btn-primary btn-large">
                  <Play size={18} fill="currentColor" />
                  <span>Launch Live Translator</span>
                </Link>
                <Link to="/use-cases" className="btn btn-secondary btn-large">
                  <span>Explore Real-World Use Cases</span>
                  <ArrowUpRight size={18} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default Home;



