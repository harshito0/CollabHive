import React, { useState, useRef, useEffect } from 'react';
import { X, Smartphone, ArrowRight, Hexagon } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { auth, isFirebaseConfigured } from '../../firebase';
import './AuthModal.css';

// ── Lazy-load Firebase auth methods only if configured ──────────────────────
let GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber;

if (isFirebaseConfigured) {
  import('firebase/auth').then((mod) => {
    GoogleAuthProvider    = mod.GoogleAuthProvider;
    signInWithPopup       = mod.signInWithPopup;
    RecaptchaVerifier     = mod.RecaptchaVerifier;
    signInWithPhoneNumber = mod.signInWithPhoneNumber;
  });
}

// ── Mock auth helpers ───────────────────────────────────────────────────────
const MOCK_OTP = '1234'; // Any 4+ digit code works in mock mode

export function AuthModal({ isOpen, onClose, onLogin }) {
  const [authMode, setAuthMode]         = useState('login');
  const [signInMethod, setSignInMethod]  = useState('select');
  const [phoneNumber, setPhoneNumber]    = useState('');
  const [otp, setOtp]                    = useState('');
  const [step, setStep]                  = useState(1);
  const [loading, setLoading]            = useState(false);
  const [error, setError]                = useState('');
  const [confirmResult, setConfirmResult] = useState(null);
  const recaptchaRef                     = useRef(null);
  const recaptchaVerifierRef             = useRef(null);

  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch (_) {}
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  const clearError = () => setError('');

  // ── GOOGLE SIGN-IN ─────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setLoading(true);
    clearError();
    try {
      if (isFirebaseConfigured && GoogleAuthProvider && signInWithPopup) {
        // -- REAL Firebase Google Sign-In --
        const provider = new GoogleAuthProvider();
        const result   = await signInWithPopup(auth, provider);
        const user     = result.user;
        onLogin({
          name:   user.displayName || 'Google User',
          email:  user.email,
          photo:  user.photoURL,
          uid:    user.uid,
          method: 'Google',
        });
      } else {
        // -- MOCK: simulate Google login --
        await new Promise(r => setTimeout(r, 900));
        onLogin({ name: 'Google User', email: 'demo@gmail.com', method: 'Google' });
      }
      onClose();
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── PHONE: SEND OTP ────────────────────────────────────────────────────────
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    try {
      if (isFirebaseConfigured && RecaptchaVerifier && signInWithPhoneNumber) {
        // -- REAL Firebase Phone Auth --
        if (recaptchaVerifierRef.current) {
          try { recaptchaVerifierRef.current.clear(); } catch (_) {}
          recaptchaVerifierRef.current = null;
        }
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
        const result = await signInWithPhoneNumber(auth, '+91' + phoneNumber, recaptchaVerifierRef.current);
        setConfirmResult(result);
      } else {
        // -- MOCK: simulate SMS sent --
        await new Promise(r => setTimeout(r, 1000));
        setConfirmResult('mock');
      }
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please check the number.');
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch (_) {}
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  // ── PHONE: VERIFY OTP ──────────────────────────────────────────────────────
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    try {
      if (isFirebaseConfigured && confirmResult && confirmResult !== 'mock') {
        // -- REAL Firebase OTP Verification --
        const result = await confirmResult.confirm(otp);
        const user   = result.user;
        onLogin({ name: 'User ' + phoneNumber.slice(-4), phone: phoneNumber, uid: user.uid, method: 'Phone' });
      } else {
        // -- MOCK: accept any code --
        await new Promise(r => setTimeout(r, 800));
        onLogin({ name: 'User ' + phoneNumber.slice(-4), phone: phoneNumber, method: 'Phone' });
      }
      onClose();
    } catch (err) {
      setError('Invalid OTP. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setSignInMethod('select');
    setStep(1);
    setPhoneNumber('');
    setOtp('');
    clearError();
    if (recaptchaVerifierRef.current) {
      try { recaptchaVerifierRef.current.clear(); } catch (_) {}
      recaptchaVerifierRef.current = null;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="auth-modal glass-panel animation-fade-in">
        <button className="close-btn" onClick={onClose} disabled={loading}>
          <X size={20} />
        </button>

        <div className="auth-header text-center">
          <div className="flex-center mb-4">
            <Hexagon size={40} className="text-primary" />
          </div>
          <h2>{authMode === 'login' ? 'Welcome Back' : 'Join CollabHive'}</h2>
          <p className="text-muted mt-2">
            {authMode === 'login'
              ? 'Log in to continue building amazing projects.'
              : 'Sign up to find your perfect hackathon team.'}
          </p>
          {!isFirebaseConfigured && (
            <p className="auth-demo-badge mt-2">🔮 Demo Mode — any phone &amp; any code works</p>
          )}
        </div>

        {error && (
          <div className="auth-error mt-4">⚠️ {error}</div>
        )}

        <div className="auth-body mt-6">
          {/* ── METHOD SELECT ── */}
          {signInMethod === 'select' && (
            <div className="auth-options flex-col gap-4">
              <button className="auth-provider-btn" onClick={handleGoogleLogin} disabled={loading}>
                <FcGoogle size={24} />
                <span>{loading ? 'Signing in…' : 'Continue with Google'}</span>
              </button>

              <button className="auth-provider-btn" onClick={() => setSignInMethod('phone')} disabled={loading}>
                <Smartphone size={24} className="text-primary" />
                <span>Continue with Phone</span>
              </button>
            </div>
          )}

          {/* ── PHONE ENTRY ── */}
          {signInMethod === 'phone' && step === 1 && (
            <form onSubmit={handlePhoneSubmit} className="phone-auth-form animation-fade-in">
              <label className="text-sm font-semibold mb-2 block text-muted">Mobile Number</label>
              <div className="phone-input-group">
                <span className="country-code">+91</span>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  autoFocus
                  required
                />
              </div>

              <div id="recaptcha-container" ref={recaptchaRef}></div>

              <button
                type="submit"
                className="btn-primary w-full mt-6 flex-center gap-2"
                disabled={loading || phoneNumber.length < 10}
              >
                {loading ? 'Sending OTP…' : 'Send OTP via SMS'} <ArrowRight size={16} />
              </button>
              <button type="button" className="btn-text w-full mt-4 text-sm text-muted" onClick={resetState} disabled={loading}>
                ← Back to all options
              </button>
            </form>
          )}

          {/* ── OTP ENTRY ── */}
          {signInMethod === 'phone' && step === 2 && (
            <form onSubmit={handleOtpSubmit} className="otp-auth-form animation-fade-in">
              <div className="text-center mb-6">
                <p className="text-sm text-muted">OTP {isFirebaseConfigured ? 'sent' : '(demo — type any 4 digits)'} to <strong>+91 {phoneNumber}</strong></p>
                <button type="button" className="btn-text text-xs text-primary mt-1" onClick={() => { setStep(1); clearError(); }} disabled={loading}>
                  Edit Number
                </button>
              </div>

              <label className="text-sm font-semibold mb-2 block text-muted text-center">Enter OTP</label>
              <input
                type="text"
                className="otp-input text-center"
                placeholder="• • • •"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                autoFocus
                required
              />

              <button
                type="submit"
                className="btn-primary w-full mt-6 flex-center gap-2"
                disabled={loading || otp.length < 4}
              >
                {loading ? 'Verifying…' : 'Verify & Login'}
              </button>
            </form>
          )}
        </div>

        {signInMethod === 'select' && (
          <div className="auth-footer mt-8 text-center border-t pt-6">
            <p className="text-sm text-muted">
              {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                className="btn-text text-primary font-semibold"
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              >
                {authMode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
