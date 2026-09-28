import { motion } from 'framer-motion';
import {
  Heart,
  Code2,
  Sparkles,
  ShieldCheck,
  Users,
} from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Human-Centered Inclusivity',
    desc: 'Technology must serve human dignity. We do not treat sign language as a novelty, but as a rich, full-fledged natural linguistic medium.',
  },
  {
    icon: Users,
    title: 'Co-Designed with the Deaf Community',
    desc: 'Every gesture dataset, recognition threshold, and user interface is tested and guided by deaf educators, students, and native ISL signers.',
  },
  {
    icon: ShieldCheck,
    title: 'Edge-First Architecture',
    desc: 'Medical triage and everyday conversations demand zero latency. All hand tracking is processed strictly on your local edge device.',
  },
  {
    icon: Code2,
    title: 'Open Public Good',
    desc: 'Accessibility should never be locked behind exorbitant subscription paywalls or proprietary hardware gloves. Vani is built for everyone.',
  },
];

export default function About() {
  return (
    <div className="about-page">
      {/* =========================================================
         1. HERO SECTION
         ========================================================= */}
      <section className="page-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="section-label">OUR MISSION & STORY</div>
            <h1 className="page-hero-title">
              The Word Means <span className="gradient-text">“Voice”</span>.<br />
              The Mission is Inclusion.
            </h1>
            <p className="page-hero-description">
              In Sanskrit, <strong>Vani (वाणी)</strong> signifies voice, speech,
              and expression. We chose this name because our ambition goes far
              beyond translating hand signals—we are building an equitable world
              where silence never silences human connection.
            </p>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
         2. THE ORIGIN STORY
         ========================================================= */}
      <section className="section story-section">
        <div className="container">
          <div className="story-split-layout">
            <motion.div
              className="story-left"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="section-label">HOW IT BEGAN</span>
              <h2>Technology should open doors, not create walls.</h2>
              <p>
                The inspiration for Vani began when our team witnessed a deaf
                traveler struggling at an unreserved railway counter in New Delhi.
                Despite having a pen and paper, the rushing crowd and high counter
                glass turned a 30-second ticket purchase into an ordeal of anxiety
                and misunderstanding.
              </p>
              <p>
                With modern AI, smartphones, and web browsers ubiquitous in
                everyone’s hands, why should 63 million deaf individuals in India
                remain linguistically stranded? Vani was founded to deliver an
                accessible, browser-native translation bridge that anyone can launch
                in seconds.
              </p>
            </motion.div>

            <motion.div
              className="story-right"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="story-stat-card">
                <div className="stat-big gradient-text">63M+</div>
                <p className="stat-label">
                  Deaf & Hard-of-Hearing Citizens in India
                </p>
                <div className="stat-sub">
                  Only ~300 certified sign language interpreters currently exist
                  nationwide—a ratio of 1 interpreter per 210,000 deaf individuals.
                </div>
                <div className="ratio-bar">
                  <div className="ratio-fill" />
                </div>
                <small className="stat-note">
                  Vani bridges this staggering shortage with accessible software.
                </small>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================
         3. OUR CORE VALUES
         ========================================================= */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">WHAT WE BELIEVE</span>
            <h2 className="section-title">
              Our Guiding <span className="gradient-text">Principles</span>
            </h2>
            <p className="section-description">
              Ethics, inclusivity, and community ownership are baked into the first
              line of code we wrote.
            </p>
          </div>

          <div className="values-grid">
            {values.map((val, idx) => {
              const ValIcon = val.icon;
              return (
                <motion.div
                  key={val.title}
                  className="value-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                >
                  <div className="value-icon-box">
                    <ValIcon size={24} />
                  </div>
                  <h3>{val.title}</h3>
                  <p>{val.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

