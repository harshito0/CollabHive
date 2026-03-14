import React, { useState, useRef, useEffect } from 'react';
import { X, Smartphone, ArrowRight, Hexagon } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { auth, db, isFirebaseConfigured, githubProvider } from '../../firebase';
import { useToast } from '../layout/ToastContainer';
import './AuthModal.css';

import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export function AuthModal({ isOpen, onClose, onLogin }) {
  const [authMode, setAuthMode]          = useState('login');
  const [signInMethod, setSignInMethod]  = useState('select');
  const [phoneNumber, setPhoneNumber]    = useState('');
  const [otp, setOtp]                   = useState('');
  const [step, setStep]                 = useState(1);
  const [loading, setLoading]           = useState(false);
  const confirmResult = useRef(null);
  const recaptchaVerifierRef = useRef(null);
  const { toast } = useToast();

  // Clear reCAPTCHA verifier on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch (_) {}
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  // No longer using local error state, using toasts instead.

  // ── Helper: ensure a fresh reCAPTCHA verifier ────────────────────────────
  const getRecaptchaVerifier = () => {
    // Clear any stale verifier first
    if (recaptchaVerifierRef.current) {
      try { recaptchaVerifierRef.current.clear(); } catch (_) {}
      recaptchaVerifierRef.current = null;
    }
    recaptchaVerifierRef.current = new RecaptchaVerifier(
      auth,
      'recaptcha-container',
      { size: 'invisible' }
    );
    return recaptchaVerifierRef.current;
  };

  // ── GOOGLE SIGN-IN ───────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        const provider = new GoogleAuthProvider();
        const result   = await signInWithPopup(auth, provider);
        const user     = result.user;
        // Step 1: Check Firestore for existing profile
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          // Returning user
          onLogin({
            ...userSnap.data(),
            method: 'Google'
          });
          toast.success(`Welcome back, ${userSnap.data().name}!`);
        } else {
          // New user -> Trigger Profile Setup
          onLogin({
            name:   user.displayName || '',
            email:  user.email,
            photo:  user.photoURL,
            uid:    user.uid,
            method: 'Google',
            isNewUser: true
          });
        }
      } else {
        // Demo fallback
        await new Promise(r => setTimeout(r, 900));
        onLogin({ name: 'Google User', email: 'demo@gmail.com', method: 'Google' });
      }
      onClose();
    } catch (err) {
      console.error('Google login error:', err);
      toast.error('Google login failed: ' + (err.code || 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // ── GITHUB SIGN-IN ───────────────────────────────────────────────────────
  const handleGithubLogin = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        const result = await signInWithPopup(auth, githubProvider);
        const user = result.user;
        
        // This gives you a GitHub Access Token. You can use it to access the GitHub API.
        const credential = GithubAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;

        // Step 1: Check Firestore for existing profile
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          // Returning user
          onLogin({
            ...userSnap.data(),
            method: 'GitHub',
            githubToken: token
          });
          toast.success(`Welcome back, ${userSnap.data().name}!`);
        } else {
          // New user -> Trigger Profile Setup
          onLogin({
            name: user.displayName || '',
            email: user.email,
            photo: user.photoURL,
            uid: user.uid,
            method: 'GitHub',
            githubToken: token,
            isNewUser: true
          });
        }
      } else {
        await new Promise(r => setTimeout(r, 900));
        onLogin({ name: 'GitHub Demo User', email: 'demo-gh@github.com', method: 'GitHub' });
        toast.success('Signed in with GitHub (Demo)');
      }
      onClose();
    } catch (err) {
      console.error('GitHub login error:', err);
      toast.error('GitHub login failed: ' + (err.code || 'Check your internet connection.'));
    } finally {
      setLoading(false);
    }
  };

  // ── PHONE: SEND OTP ──────────────────────────────────────────────────────
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!isFirebaseConfigured) {
      await new Promise(r => setTimeout(r, 1000));
      confirmResult.current = 'mock';
      setStep(2);
      setLoading(false);
      return;
    }

    try {
      const verifier = getRecaptchaVerifier();
      // Explicitly render the invisible reCAPTCHA widget before use
      await verifier.render();
      const result = await signInWithPhoneNumber(auth, '+91' + phoneNumber, verifier);
      confirmResult.current = result;
      setStep(2);
      toast.info('OTP sent to your phone');
    } catch (err) {
      console.error('Phone OTP error:', err);
      // Clean up reCAPTCHA on failure so the next attempt works
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch (_) {}
        recaptchaVerifierRef.current = null;
      }
      // Give a readable error message
      let msg = 'Failed to send OTP. ';
      if (err.code === 'auth/invalid-phone-number')    msg += 'Invalid phone number format.';
      else if (err.code === 'auth/too-many-requests')  msg += 'Too many attempts. Please wait and try again.';
      else if (err.code === 'auth/operation-not-allowed') msg += 'Phone auth is not enabled in Firebase Console.';
      else msg += err.message || 'Please check the number.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── PHONE: VERIFY OTP ────────────────────────────────────────────────────
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isFirebaseConfigured && confirmResult.current && confirmResult.current !== 'mock') {
        const result = await confirmResult.current.confirm(otp);
        const user   = result.user;
        onLogin({ name: 'User ' + phoneNumber.slice(-4), phone: phoneNumber, uid: user.uid, method: 'Phone' });
        toast.success('Logged in successfully!');
      } else {
        // Demo mode — accept any code
        await new Promise(r => setTimeout(r, 800));
        onLogin({ name: 'User ' + phoneNumber.slice(-4), phone: phoneNumber, method: 'Phone' });
        toast.success('Demo Login Success');
      }
      onClose();
    } catch (err) {
      console.error('OTP verify error:', err);
      toast.error('Invalid OTP. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setSignInMethod('select');
    setStep(1);
    setPhoneNumber('');
    setOtp('');
    if (recaptchaVerifierRef.current) {
      try { recaptchaVerifierRef.current.clear(); } catch (_) {}
      recaptchaVerifierRef.current = null;
    }
  };

  return (
    <div className="modal-overlay">
      {/* 
        ⚠️ Keep recaptcha-container OUTSIDE the conditional so it
        is always present in the DOM when Firebase needs to render into it.
      */}
      <div id="recaptcha-container" style={{ position: 'fixed', bottom: 0, left: 0 }} />

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

        {/* Error notifications now handled by toasts */}

        <div className="auth-body mt-6">
          {/* ── METHOD SELECT ── */}
          {signInMethod === 'select' && (
            <div className="auth-options flex-col gap-4">
              <button className="auth-provider-btn" onClick={handleGoogleLogin} disabled={loading}>
                <FcGoogle size={24} />
                <span>Google</span>
              </button>

              <button className="auth-provider-btn" onClick={handleGithubLogin} disabled={loading}>
                <Hexagon size={24} className="text-primary" />
                <span>GitHub</span>
              </button>

              <button className="auth-provider-btn" onClick={() => setSignInMethod('phone')} disabled={loading}>
                <Smartphone size={24} className="text-secondary" />
                <span>Phone</span>
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
                <button type="button" className="btn-text text-xs text-primary mt-1" onClick={() => { setStep(1); }} disabled={loading}>
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
