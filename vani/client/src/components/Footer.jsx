import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Hand,
  Heart,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Github,
  Twitter,
  Linkedin,
  Sparkles,
} from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="footer-wrapper">
      <div className="container">
        {/* TOP PURPOSE HIGHLIGHT BANNER */}
        <div className="footer-purpose-card">
          <div className="footer-purpose-content">
            <span className="badge-pill">
              <Sparkles size={14} /> Core Mission
            </span>
            <h3>Empowering Every Voice Through Silent Gestures</h3>
            <p>
              Over 63 million deaf and hard-of-hearing individuals in India and
              430 million worldwide experience daily communication barriers.
              Vani’s mission is to provide free, real-time bidirectional
              translation so that silence is never a limitation to connection,
              learning, or opportunity.
            </p>
          </div>
          <div className="footer-purpose-action">
            <Link to="/vani" className="btn btn-primary">
              Try Vani Translator <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* MAIN FOOTER COLUMNS */}
        <div className="footer-grid">
          {/* Brand column */}
          <div className="footer-col brand-col">
            <Link to="/" className="vani-logo">
              <div className="logo-icon">
                <Hand size={22} strokeWidth={2.5} />
              </div>
              <div className="logo-text">
                <span>VANI</span>
                <small>Sign Beyond Words</small>
              </div>
            </Link>
            <p className="footer-desc">
              Next-generation AI translation engine bridging Indian Sign
              Language (ISL) and spoken vernacular languages in real time.
            </p>
            <div className="footer-social-links">
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
                <Github size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="footer-col">
            <h4>Explore Vani</h4>
            <ul className="footer-links-list">
              <li><Link to="/">Home Overview</Link></li>
              <li><Link to="/product">Product Architecture</Link></li>
              <li><Link to="/vani">Live Translator Studio</Link></li>
              <li><Link to="/use-cases">Real-World Use Cases</Link></li>
              <li><Link to="/about">About & Mission</Link></li>
            </ul>
          </div>

          {/* Technology & Resources */}
          <div className="footer-col">
            <h4>Resources & AI</h4>
            <ul className="footer-links-list">
              <li><Link to="/product#architecture">Dual-Engine Architecture</Link></li>
              <li><Link to="/product#tech">MediaPipe & Landmarks</Link></li>
              <li><Link to="/use-cases#classroom">Education Inclusivity</Link></li>
              <li><Link to="/about">Our Mission & Story</Link></li>
              <li>
                <span className="edge-badge">
                  <ShieldCheck size={14} /> 100% On-Device Edge Processing
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter subscription */}
          <div className="footer-col newsletter-col">
            <h4>Stay Updated</h4>
            <p className="newsletter-text">
              Subscribe to get updates on new ISL gesture additions, language
              models, and accessibility features.
            </p>
            {subscribed ? (
              <div className="newsletter-success">
                <CheckCircle2 size={18} />
                <span>Thank you! You are now subscribed to Vani updates.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <div className="newsletter-input-wrap">
                  <Mail size={16} className="newsletter-icon" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button type="submit" aria-label="Subscribe">
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* BOTTOM COPYRIGHT ROW */}
        <div className="footer-bottom-row">
          <div className="copyright-text">
            © {new Date().getFullYear()} Vani Platform. All rights reserved. Open
            accessibility initiative.
          </div>
          <div className="footer-bottom-tags">
            <span>Built with <Heart size={14} className="heart-icon" /> for universal inclusion</span>
            <span className="wcag-tag">WCAG 2.1 AAA Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

