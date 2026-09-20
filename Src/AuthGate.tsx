import React, { useState } from 'react';
import {
  HeartPulse,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Building2,
  Clock,
  PhoneCall,
  Loader2,
  ExternalLink,
  Info,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthGateProps {
  onDismiss?: () => void;
  isModal?: boolean;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onDismiss, isModal = false }) => {
  const {
    loginWithGoogle,
    loginWithEmailPass,
    signupWithEmailPass,
    loginAsDemoPatient,
    loginAsAdminUser,
    enterAsGuest,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOperationNotAllowed, setIsOperationNotAllowed] = useState(false);

  const cleanErrorMessage = (error: any): string => {
    const code = error?.code || '';
    const msg = error?.message || '';

    if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
      setIsOperationNotAllowed(true);
      return 'Email/Password sign-in is not enabled yet in your Firebase console project.';
    }
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'Invalid email or password. Please check your credentials or create a new account.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'An account already exists with this email address. Please sign in instead.';
    }
    if (code === 'auth/weak-password') {
      return 'Password is too weak. Please use at least 6 characters.';
    }
    if (code === 'auth/invalid-email') {
      return 'Please enter a valid email address format.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Google sign-in popup was closed before completing.';
    }
    if (code === 'auth/popup-blocked') {
      return 'Google sign-in popup was blocked by your browser. Please allow popups for this site.';
    }
    return error?.message || 'An unexpected authentication error occurred. Please try again.';
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMessage(null);
    setIsOperationNotAllowed(false);
    try {
      await loginWithGoogle();
      if (onDismiss) onDismiss();
    } catch (err: any) {
      setErrorMessage(cleanErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemoLogin = () => {
    loginAsDemoPatient();
    if (onDismiss) onDismiss();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsOperationNotAllowed(false);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        await loginWithEmailPass(email, password);
      } else {
        await signupWithEmailPass(email, password, name);
      }
      if (onDismiss) onDismiss();
    } catch (err: any) {
      setErrorMessage(cleanErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setMode('signin');
    setEmail('patient.demo@wecarehospital.org');
    setPassword('WeCare2026!');
    setErrorMessage(null);
    setIsOperationNotAllowed(false);
  };

  const handleFillAdmin = () => {
    setMode('signin');
    setEmail('aashish@gmail.com');
    setPassword('Aashish@2007');
    setErrorMessage(null);
    setIsOperationNotAllowed(false);
  };

  return (
    <div
      className={
        isModal
          ? 'w-full'
          : 'min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8'
      }
    >
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Clinical Brand Showcase Banner (visible on desktop) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0B1E36] via-[#0E2849] to-[#0A2240] p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle glow background element */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Hospital Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 border border-sky-300/30">
                <HeartPulse className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight font-serif text-white flex items-baseline gap-1.5">
                  We Care <span className="text-sky-400 font-light">Hospital</span>
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                  Patient & Clinical Portal
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-950/80 text-sky-300 border border-sky-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                JCI & NABH Accredited Healthcare
              </span>
              <h2 className="text-2xl lg:text-3xl font-extrabold font-serif leading-tight">
                Secure Access to Your Healthcare Journey
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Sign in to book doctor appointments, consult specialists, access clinical records,
                and communicate with your healthcare team.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Instant outpatient scheduling with 180+ board-certified specialists</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Encrypted medical appointment records and visit history</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Secure in-person consultations and telehealth video appointments</span>
              </div>
            </div>
          </div>

          {/* Bottom Security Assurance */}
          <div className="relative z-10 pt-8 mt-8 border-t border-slate-700/60 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-sky-400" />
              256-Bit SSL Encrypted
            </span>
            <span>24/7 Helpline: (555) 911-CARE</span>
          </div>
        </div>

        {/* Right Authentication Form Area */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Header Tabs: Sign In vs Sign Up */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  id="auth-tab-signin"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage(null);
                  }}
                  className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  id="auth-tab-signup"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                  }}
                  className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Quick actions on right */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleInstantDemoLogin}
                  id="auth-instant-demo-btn"
                  className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/70 border border-teal-200/70 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  title="Instant access as demo patient"
                >
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  <span>Demo Patient</span>
                </button>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  id="auth-quick-demo-btn"
                  className="text-[11px] font-semibold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100/70 border border-sky-200/70 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  title="Populate test credentials"
                >
                  <span>Fill Form</span>
                </button>
                <button
                  type="button"
                  onClick={handleFillAdmin}
                  id="auth-quick-admin-btn"
                  className="text-[11px] font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  title="Admin: aashish@gmail.com"
                >
                  <ShieldCheck className="w-3 h-3 text-amber-600" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            {/* Specialized Operation-Not-Allowed Guidance or Standard Error */}
            {isOperationNotAllowed ? (
              <div
                id="auth-operation-not-allowed-card"
                className="mb-6 p-4 sm:p-5 bg-amber-50/90 border border-amber-300 rounded-2xl text-xs text-amber-900 animate-in fade-in space-y-3 shadow-xs"
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-amber-200/80 rounded-lg text-amber-800 shrink-0 mt-0.5">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-950">
                      Firebase Notice: Email/Password Provider Not Yet Enabled
                    </h4>
                    <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                      Firebase requires the <strong>Email/Password</strong> sign-in provider to be enabled in your Firebase Console project.
                    </p>
                  </div>
                </div>

                {/* Step-by-step instructions */}
                <div className="bg-white/90 rounded-xl p-3 border border-amber-200/80 space-y-2 text-xs text-slate-700">
                  <div className="font-semibold text-slate-900 flex items-center justify-between">
                    <span>How to enable in Firebase Console (30 seconds):</span>
                    <a
                      href="https://console.firebase.google.com/project/rapid-xenolalia-rrmnt/authentication/providers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:text-sky-700 inline-flex items-center gap-1 font-semibold hover:underline"
                    >
                      <span>Open Firebase Console</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 text-[11px] leading-relaxed">
                    <li>Open the link above to your Firebase Authentication tab.</li>
                    <li>Click on <strong>Email/Password</strong> under the <em>Sign-in providers</em> list.</li>
                    <li>Switch the toggle to <strong>Enable</strong> and click <strong>Save</strong>.</li>
                  </ol>
                </div>

                {/* Instant 1-click alternative options */}
                <div className="pt-1">
                  <div className="text-[11px] font-semibold text-amber-900 mb-2">
                    Or proceed immediately without configuring:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Sign In with Google (Active)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleInstantDemoLogin}
                      className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Instant Demo Patient Access</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : errorMessage && (
              <div
                id="auth-error-banner"
                className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Google Sign-In Button */}
            <div className="space-y-4 mb-6">
              <button
                type="button"
                id="google-signin-btn"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-between py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-800 rounded-xl text-sm font-semibold shadow-xs transition-all active:scale-99 cursor-pointer disabled:opacity-60 group"
              >
                <div className="flex items-center gap-3">
                  {/* Official Google 'G' SVG */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span className="group-hover:text-slate-900">
                    {mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
                  </span>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  <Check className="w-3 h-3" />
                  <span>Ready & Active</span>
                </span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider relative">
                  Or with email & password
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              {/* Informative Tip */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Google Sign-In works immediately; Email/password requires console enablement.</span>
                </span>
                <button
                  type="button"
                  onClick={handleInstantDemoLogin}
                  className="font-semibold text-sky-600 hover:text-sky-800 hover:underline cursor-pointer shrink-0 ml-2"
                >
                  Quick Test Login
                </button>
              </div>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Legal Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      id="auth-name-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Eleanor Vance"
                      required={mode === 'signup'}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-hidden transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    id="auth-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-hidden transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password *
                  </label>
                  {mode === 'signin' && (
                    <span className="text-[11px] text-sky-700 hover:underline cursor-pointer">
                      Forgot password?
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="auth-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-hidden transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="auth-confirm-password-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-hidden transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Password must have at least 6 characters.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                id="auth-submit-btn"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 shadow-md shadow-sky-700/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'signin'
                        ? 'Sign In to Hospital Portal'
                        : 'Create Patient Account'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Optional Guest Tour Bypass */}
          <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>Just exploring clinical services?</span>
            <button
              type="button"
              id="auth-guest-bypass-btn"
              onClick={enterAsGuest}
              className="text-sky-700 font-semibold hover:text-sky-800 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Browse Hospital Site as Guest</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
