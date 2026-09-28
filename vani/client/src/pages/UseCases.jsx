import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Building2,
  HeartPulse,
  Users,
  Building,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Quote,
  Play,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const domainCases = [
  {
    id: 'education',
    icon: GraduationCap,
    title: 'Inclusive Education',
    subtitle: 'Classrooms, University Lectures & Lab Discussions',
    problem:
      'Over 95% of deaf children in developing countries attend schools without certified sign language interpreters. They struggle to ask spontaneous questions or follow spoken lectures.',
    solution:
      'Vani enables deaf students to sign naturally into a laptop or tablet camera, translating their questions into spoken vernacular audio for teachers. Lecturers’ spoken words are simultaneously converted to sign visuals and subtitles.',
    impact: '3.4x higher active classroom participation and engagement.',
    badge: 'Education',
    stats: '1.2M+ Students Can Benefit',
  },
  {
    id: 'healthcare',
    icon: HeartPulse,
    title: 'Hospitals & Emergency Triage',
    subtitle: 'ER Admissions, Doctor Consultations & Pharmacies',
    problem:
      'In medical emergencies, every second counts. Misinterpreting pain levels, allergy histories, or prescription dosages due to communication barriers leads to life-threatening errors.',
    solution:
      'Vani provides immediate, zero-setup translation at triage desks and hospital bedsides. A patient signs their symptoms, and Vani outputs crisp clinical terminology to the attending doctor.',
    impact: 'Sub-minute triage speed without waiting hours for an interpreter.',
    badge: 'Healthcare',
    stats: '100% Client-Side Processing',
  },
  {
    id: 'workplace',
    icon: Building2,
    title: 'Workplaces & Careers',
    subtitle: 'Interviews, Team Standups & Client Presentations',
    problem:
      'Deaf professionals face systematic underemployment because hearing teams hesitate to conduct multi-participant spoken interviews or agile sprint meetings.',
    solution:
      'Vani integrates seamlessly into video conference software and meeting room displays, converting signs into real-time voice feeds so colleagues collaborate without friction.',
    impact: 'Equal participation in career advancement and leadership roles.',
    badge: 'Corporate',
    stats: '89% Improved Candidate Interview Flow',
  },
  {
    id: 'civic',
    icon: Building,
    title: 'Civic & Public Services',
    subtitle: 'Railway Stations, Police Desks, Banks & Kiosks',
    problem:
      'Filing an FIR at a police station, purchasing an unreserved train ticket, or opening a bank account are daily sources of intense anxiety and exclusion for deaf citizens.',
    solution:
      'Low-power public kiosks running Vani’s edge software allow any citizen to sign their request, producing immediate ticket booking, token generation, or inquiry resolution.',
    impact: 'Dignified, autonomous civic interaction without third-party reliance.',
    badge: 'Civic Infrastructure',
    stats: '70% Faster Counter Turnaround',
  },
  {
    id: 'family',
    icon: Users,
    title: 'Family & Social Circles',
    subtitle: 'Parent-Child Bonding, Gatherings & Daily Chores',
    problem:
      'More than 90% of deaf infants are born to hearing parents, many of whom never achieve conversational fluency in sign language, creating emotional distancing.',
    solution:
      'Vani acts as an everyday family companion on mobile devices, facilitating bedtime storytelling, mealtime jokes, and deep parent-child heart-to-heart talks.',
    impact: 'Lifelong emotional bonding and natural linguistic development.',
    badge: 'Everyday Life',
    stats: 'Deep Emotional Connection',
  },
];

export default function UseCases() {
  const [activeTab, setActiveTab] = useState(domainCases[0].id);

  const activeCase = domainCases.find((c) => c.id === activeTab) || domainCases[0];
  const IconComp = activeCase.icon;

  return (
    <div className="usecases-page">
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
            <div className="section-label">REAL-WORLD IMPACT</div>
            <h1 className="page-hero-title">
              Accessibility for the Moments <span className="gradient-text">That Matter</span>
            </h1>
            <p className="page-hero-description">
              True accessibility isn’t a feature on a screen; it is the freedom
              to learn, work, receive medical care, and connect with loved ones
              without barriers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
         2. INTERACTIVE DOMAIN EXPLORER
         ========================================================= */}
      <section className="section cases-interactive-section">
        <div className="container">
          {/* Tabs header */}
          <div className="cases-tab-nav">
            {domainCases.map((item) => {
              const TabIcon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`case-tab-pill ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <TabIcon size={18} />
                  <span>{item.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Case Detail Showcase */}
          <motion.div
            key={activeCase.id}
            className="case-detail-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="case-detail-left">
              <div className="case-badge-row">
                <span className="case-domain-badge">{activeCase.badge}</span>
                <span className="case-stats-pill">{activeCase.stats}</span>
              </div>
              <h2>{activeCase.title}</h2>
              <p className="case-subtitle">{activeCase.subtitle}</p>

              <div className="problem-solution-block">
                <div className="ps-item problem">
                  <div className="ps-header">
                    <span className="ps-indicator red" />
                    <strong>The Real Challenge:</strong>
                  </div>
                  <p>{activeCase.problem}</p>
                </div>

                <div className="ps-item solution">
                  <div className="ps-header">
                    <span className="ps-indicator cyan" />
                    <strong>How Vani Solves It:</strong>
                  </div>
                  <p>{activeCase.solution}</p>
                </div>
              </div>

              <div className="case-impact-highlight">
                <CheckCircle2 size={20} className="text-cyan" />
                <div>
                  <strong>Measurable Outcome:</strong>
                  <p>{activeCase.impact}</p>
                </div>
              </div>
            </div>

            <div className="case-detail-right">
              <div className="case-visual-box">
                <div className="case-visual-icon">
                  <IconComp size={56} strokeWidth={1.5} />
                </div>
                <h3>{activeCase.title}</h3>
                <p>Equipped with Vani's real-time bidirectional translation engine.</p>
                <Link to="/vani" className="btn btn-primary">
                  <span>Test in Live Studio</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
         3. ALL DOMAINS OVERVIEW GRID
         ========================================================= */}
      <section className="section all-cases-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">ECOSYSTEM SPREAD</span>
            <h2 className="section-title">
              Every Sector, <span className="gradient-text">One Unified Solution</span>
            </h2>
            <p className="section-description">
              Explore how Vani adapts across various professional and public
              environments.
            </p>
          </div>

          <div className="cases-cards-grid">
            {domainCases.map((item, idx) => {
              const ItemIcon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  className="case-summary-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                >
                  <div className="case-summary-top">
                    <div className="case-icon-small">
                      <ItemIcon size={24} />
                    </div>
                    <span className="case-num">0{idx + 1}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p className="case-summary-sub">{item.subtitle}</p>
                  <p className="case-summary-body">{item.solution}</p>
                  <button
                    className="case-read-btn"
                    onClick={() => {
                      setActiveTab(item.id);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                  >
                    <span>View Deep Dive</span>
                    <ArrowRight size={14} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
         4. CORE PHILOSOPHY MANIFESTO
         ========================================================= */}
      <section className="section manifesto-section">
        <div className="container">
          <div className="manifesto-card">
            <div className="quote-icon-wrap">
              <Quote size={36} />
            </div>
            <blockquote>
              “Accessibility is not a charity, and it is not an afterthought. It is
              the fundamental acknowledgment of every individual’s right to be
              understood, respected, and included.”
            </blockquote>
            <div className="manifesto-author">
              <strong>The Vani Core Principle</strong>
              <span>Open Accessibility for 430M+ Deaf & Hard of Hearing Individuals</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
         5. CTA SECTION
         ========================================================= */}
      <section className="section">
        <div className="container mini-cta-wrap">
          <div className="mini-cta-content">
            <h2>Experience Vani’s Translation Engine</h2>
            <p>Ready to see how fast and fluid Indian Sign Language translation can be?</p>
            <div className="cta-btns">
              <Link to="/vani" className="btn btn-primary btn-large">
                <Play size={18} fill="currentColor" />
                <span>Launch Live Studio</span>
              </Link>
              <Link to="/about" className="btn btn-secondary btn-large">
                <span>Read About Our Mission</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

