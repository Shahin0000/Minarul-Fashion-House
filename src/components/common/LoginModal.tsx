import React, { useState, useEffect } from 'react';
import { 
  X, 
  User as UserIcon, 
  Phone, 
  Lock, 
  ArrowRight, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { formatAuthError } from '../../utils/authErrors';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (role: 'admin' | 'customer') => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { language } = useLanguage();
  const { 
    loginWithEmail, 
    registerWithEmail, 
    loginWithGoogle, 
    forgotPassword,
    loginModalTab 
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Form states
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync mode with requested tab from AuthContext whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(loginModalTab || 'login');
      setErrorMsg('');
      setSuccessMsg('');
      setLoading(false);
    }
  }, [isOpen, loginModalTab]);

  if (!isOpen) return null;

  const resetFormState = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  // 1. Email / Phone Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    if (!emailOrPhone.trim()) {
      setErrorMsg(language === 'bn' ? 'মোবাইল নম্বর অথবা ইমেইল লিখুন' : 'Please enter email or mobile number');
      return;
    }
    if (!password) {
      setErrorMsg(language === 'bn' ? 'পাসওয়ার্ড লিখুন' : 'Please enter your password');
      return;
    }

    try {
      setLoading(true);
      const role = await loginWithEmail(emailOrPhone.trim(), password);
      setSuccessMsg(language === 'bn' ? 'লগইন সফল হয়েছে!' : 'Signed in successfully!');
      
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess(role);
      }, 400);
    } catch (err: unknown) {
      console.error('❌ Login Error:', err);
      setErrorMsg(formatAuthError(err, language));
    } finally {
      setLoading(false);
    }
  };

  // 2. Email / Phone Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    if (!name.trim()) {
      setErrorMsg(language === 'bn' ? 'আপনার পূর্ণ নাম লিখুন' : 'Please enter your full name');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg(language === 'bn' ? 'মোবাইল নম্বর লিখুন' : 'Please enter your phone number');
      return;
    }
    if (!registerEmail.trim()) {
      setErrorMsg(language === 'bn' ? 'ইমেইল অ্যাড্রেস লিখুন' : 'Please enter your email');
      return;
    }
    if (password.length < 6) {
      setErrorMsg(language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const role = await registerWithEmail(name.trim(), registerEmail.trim(), phone.trim(), password);
      setSuccessMsg(
        language === 'bn' 
          ? 'অভিনন্দন! আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।' 
          : 'Account created successfully! Welcome.'
      );
      
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess(role);
      }, 500);
    } catch (err: unknown) {
      console.error('❌ Registration Error:', err);
      setErrorMsg(formatAuthError(err, language));
    } finally {
      setLoading(false);
    }
  };

  // 3. Forgot Password Submit
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    if (!forgotEmail.trim()) {
      setErrorMsg(language === 'bn' ? 'আপনার ইমেইল লিখুন' : 'Please enter your email');
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(forgotEmail.trim());
      setSuccessMsg(
        language === 'bn' 
          ? 'আপনার ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে।' 
          : 'Password reset link sent to your email.'
      );
    } catch (err: unknown) {
      console.error('❌ Forgot Password Error:', err);
      setErrorMsg(formatAuthError(err, language));
    } finally {
      setLoading(false);
    }
  };

  // 4. Google Sign-In
  const handleGoogleLogin = async () => {
    resetFormState();
    try {
      setLoading(true);
      const role = await loginWithGoogle();
      setSuccessMsg(language === 'bn' ? 'গুগল লগইন সফল হয়েছে!' : 'Google sign-in successful!');
      
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess(role);
      }, 400);
    } catch (err: unknown) {
      console.error('❌ Google Sign-In Error:', err);
      setErrorMsg(formatAuthError(err, language));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-stone-200 overflow-hidden relative">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-800 to-stone-900 text-white flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
              Minarul Fashion House
            </span>
            <h3 className="font-serif text-xl font-bold">
              {mode === 'login'
                ? language === 'bn' ? 'অ্যাকাউন্টে প্রবেশ করুন' : 'Sign In to Account'
                : mode === 'register'
                ? language === 'bn' ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create an Account'
                : language === 'bn' ? 'পাসওয়ার্ড রিসেট' : 'Reset Password'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              resetFormState();
            }}
            className={`flex-1 py-3 text-xs font-bold text-center transition-colors border-b-2 ${
              mode === 'login'
                ? 'border-amber-700 text-amber-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {language === 'bn' ? 'লগইন' : 'Login'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              resetFormState();
            }}
            className={`flex-1 py-3 text-xs font-bold text-center transition-colors border-b-2 ${
              mode === 'register'
                ? 'border-amber-700 text-amber-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {language === 'bn' ? 'রেজিস্টার' : 'Register'}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* MODE 1: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  {language === 'bn' ? 'ইমেইল অথবা মোবাইল নম্বর *' : 'Email or Mobile Number *'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="email@example.com or 017XXXXXXXX"
                    className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    {language === 'bn' ? 'পাসওয়ার্ড *' : 'Password *'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      resetFormState();
                    }}
                    className="text-[11px] text-amber-700 hover:underline font-semibold"
                  >
                    {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Signing in...'}</span>
                  </>
                ) : (
                  <>
                    <span>{language === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 2: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  {language === 'bn' ? 'আপনার পূর্ণ নাম *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Minarul Islam"
                    className="w-full text-xs pl-10 pr-4 py-2 rounded-xl border border-stone-300 focus:border-amber-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  {language === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full text-xs pl-10 pr-4 py-2 rounded-xl border border-stone-300 focus:border-amber-600 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  {language === 'bn' ? 'ইমেইল অ্যাড্রেস *' : 'Email Address *'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full text-xs pl-10 pr-4 py-2 rounded-xl border border-stone-300 focus:border-amber-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  {language === 'bn' ? 'পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *' : 'Password (min 6 characters) *'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs pl-10 pr-4 py-2 rounded-xl border border-stone-300 focus:border-amber-600 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-60 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{language === 'bn' ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating Account...'}</span>
                  </>
                ) : (
                  <>
                    <span>{language === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 3: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <p className="text-xs text-stone-600">
                {language === 'bn'
                  ? 'আপনার অ্যাকাউন্টের ইমেইল ঠিকানা দিন। আমরা পাসওয়ার্ড রিসেট করার একটি লিংক পাঠাব।'
                  : 'Enter your registered email address. We will send you a password reset link.'}
              </p>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  {language === 'bn' ? 'ইমেইল *' : 'Email Address *'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...'}</span>
                  </>
                ) : (
                  <span>{language === 'bn' ? 'রিসেট লিংক পাঠান' : 'Send Reset Link'}</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    resetFormState();
                  }}
                  className="text-xs text-stone-600 hover:text-stone-900 font-bold cursor-pointer"
                >
                  ← {language === 'bn' ? 'লগইনে ফিরে যান' : 'Back to Login'}
                </button>
              </div>
            </form>
          )}

          {/* Social Sign-in Divider (Google) */}
          {mode !== 'forgot' && (
            <div className="pt-3 border-t border-stone-100 space-y-3">
              <div className="relative flex items-center justify-center">
                <div className="border-t border-stone-200 w-full" />
                <span className="bg-white px-2 text-[10px] text-stone-400 font-semibold uppercase absolute">
                  {language === 'bn' ? 'অথবা' : 'or'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>
                  {loading 
                    ? (language === 'bn' ? 'গুগল সংযোগ যাচাই হচ্ছে...' : 'Verifying Google...') 
                    : (language === 'bn' ? 'Google দিয়ে সাইন ইন' : 'Sign in with Google')}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
