import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Hand,
  Sparkles,
  ShieldCheck,
  RotateCw,
  Zap,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'verify'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState('');
  const [resendTimer, setResendTimer] = useState(30);

  const { login, signup, verifyCode, quickDemoLogin, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user && user.isVerified) {
      navigate('/vani');
    }
  }, [user, navigate]);

  // Resend countdown timer
  useEffect(() => {
    let timer;
    if (mode === 'verify' && resendTimer > 0) {
      timer = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [mode, resendTimer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setStatusMsg({ type: '', text: '' });
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      if (mode === 'login') {
        await login({ email: formData.email, password: formData.password });
        setStatusMsg({ type: 'success', text: 'Signed in successfully! Redirecting…' });
        setTimeout(() => navigate('/vani'), 800);
      } else if (mode === 'signup') {
        const result = await signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        setDevCode(result.devCode);
        setMode('verify');
        setResendTimer(30);
        setStatusMsg({
          type: 'success',
          text: `Verification code generated! Enter code ${result.devCode} below.`,
        });
      } else if (mode === 'verify') {
        await verifyCode({
          email: formData.email,
          code: formData.otp,
        });
        setStatusMsg({
          type: 'success',
          text: 'Account successfully verified! Launching Vani…',
        });
        setTimeout(() => navigate('/vani'), 800);
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Authentication error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    quickDemoLogin();
    setStatusMsg({ type: 'success', text: 'Logged in as Demo User! Redirecting…' });
    setTimeout(() => navigate('/vani'), 600);
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setDevCode(newOtp);
    setResendTimer(30);
    setStatusMsg({
      type: 'info',
      text: `A new 6-digit verification code has been sent: ${newOtp}`,
    });
  };

  return (
    <div className="auth-viewport">
      {/* Background ambient light orbs */}
      <div className="auth-orb auth-orb-purple" />
      <div className="auth-orb auth-orb-cyan" />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Brand Header */}
        <div className="auth-brand-row">
          <Link to="/" className="auth-brand-logo">
            <div className="logo-icon small">
              <Hand size={18} strokeWidth={2.5} />
            </div>
            <span>VANI</span>
          </Link>
          <div className="auth-security-pill">
            <ShieldCheck size={14} />
            <span>Secure Access</span>
          </div>
        </div>

        {/* Tab switcher (Login vs Signup) */}
        {mode !== 'verify' && (
          <div className="auth-tab-group">
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login');
                setStatusMsg({ type: '', text: '' });
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setMode('signup');
                setStatusMsg({ type: '', text: '' });
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Header Text */}
        <div className="auth-heading-block">
          <h2>
            {mode === 'verify'
              ? 'Verify Your Email'
              : mode === 'signup'
              ? 'Join the Vani Network'
              : 'Welcome Back'}
          </h2>
          <p>
            {mode === 'verify'
              ? `We sent a 6-digit confirmation code to ${formData.email || 'your email'}.`
              : mode === 'signup'
              ? 'Start translating Indian Sign Language into speech and text in real time.'
              : 'Sign in to access your translation history, custom vocabularies & models.'}
          </p>
        </div>

        {/* Dev Helper OTP Banner for frictionless testing */}
        {mode === 'verify' && devCode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="dev-otp-banner"
          >
            <Sparkles size={16} />
            <span>
              <strong>Verification OTP:</strong> <code>{devCode}</code>
            </span>
            <button
              type="button"
              className="copy-otp-btn"
              onClick={() => setFormData({ ...formData, otp: devCode })}
            >
              Auto-fill Code
            </button>
          </motion.div>
        )}

        {/* Status Message Alert */}
        <AnimatePresence>
          {statusMsg.text && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`auth-alert-message ${statusMsg.type}`}
            >
              {statusMsg.type === 'success' && <CheckCircle2 size={16} />}
              <span>{statusMsg.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Forms */}
        <form onSubmit={handleSubmit} className="auth-form-fields">
          {mode === 'signup' && (
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-field-wrap">
                <User size={18} className="field-icon" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Aditi Sharma"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {mode !== 'verify' && (
            <>
              <div className="input-group">
                <label>Email Address</label>
                <div className="input-field-wrap">
                  <Mail size={18} className="field-icon" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="input-field-wrap">
                  <Lock size={18} className="field-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </>
          )}

          {mode === 'verify' && (
            <div className="input-group">
              <label>6-Digit Verification Code</label>
              <div className="input-field-wrap otp-input-wrap">
                <input
                  type="text"
                  name="otp"
                  maxLength={6}
                  required
                  placeholder="Enter 6-digit code"
                  className="otp-field-input"
                  value={formData.otp}
                  onChange={handleChange}
                  autoFocus
                />
              </div>
              <div className="otp-resend-row">
                <span>Didn't receive the email?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendTimer > 0}
                  className="resend-btn"
                >
                  <RotateCw size={13} className={resendTimer > 0 ? '' : 'spin-on-hover'} />
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span>Please wait…</span>
            ) : mode === 'verify' ? (
              <>
                <span>Verify & Launch Vani</span>
                <ArrowRight size={18} />
              </>
            ) : mode === 'signup' ? (
              <>
                <span>Create Account</span>
                <ArrowRight size={18} />
              </>
            ) : (
              <>
                <span>Sign In to Vani</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Option */}
        {mode === 'login' && (
          <div className="demo-login-block">
            <div className="auth-divider">
              <span>OR FOR TESTING</span>
            </div>
            <button
              type="button"
              className="btn btn-demo-login"
              onClick={handleDemoLogin}
            >
              <Zap size={16} className="zap-icon" />
              <span>1-Click Instant Demo Login</span>
            </button>
          </div>
        )}

        {/* Bottom Switcher */}
        <div className="auth-footer-note">
          {mode === 'verify' ? (
            <button
              type="button"
              className="auth-link-text"
              onClick={() => {
                setMode('login');
                setStatusMsg({ type: '', text: '' });
              }}
            >
              ← Back to Sign In
            </button>
          ) : mode === 'login' ? (
            <p>
              New to Vani?{' '}
              <button
                type="button"
                className="auth-link-inline"
                onClick={() => {
                  setMode('signup');
                  setStatusMsg({ type: '', text: '' });
                }}
              >
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                className="auth-link-inline"
                onClick={() => {
                  setMode('login');
                  setStatusMsg({ type: '', text: '' });
                }}
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

