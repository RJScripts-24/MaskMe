import { motion } from 'motion/react';
import { ArrowLeft, Shield, ChevronDown, CircleHelp } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { toast } from 'sonner';
import GuidedTutorial, { TutorialStep } from './tutorial/GuidedTutorial';
import { usePageTutorial } from './tutorial/usePageTutorial';

interface AuthPageProps {
  onSuccess: (userData: any) => void;
  onBack: () => void;
}

const AUTH_TUTORIAL_STEPS: TutorialStep[] = [
  {
    selector: '[data-tutorial="auth-nav"]',
    title: 'Navigation',
    description: 'Use this navbar to return to home at any time.',
    placement: 'bottom',
  },
  {
    selector: '[data-tutorial="auth-heading"]',
    title: 'Secure Sign-In',
    description: 'This section explains why authentication is needed before using personal features.',
    placement: 'bottom',
  },
  {
    selector: '[data-tutorial="auth-card"]',
    title: 'Sign In Actions',
    description: 'Use Google sign-in to create your session and unlock your private dashboard.',
    placement: 'top',
  },
];

export default function AuthPage({ onSuccess, onBack }: AuthPageProps) {
  const {
    isTutorialOpen,
    startTutorial,
    closeTutorial,
  } = usePageTutorial('auth');

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const res = await axios.post(`${API_BASE_URL}/api/v1/auth/google-login`, {
          token: tokenResponse.access_token,
        });

        // Save token to localStorage
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        toast.success(`Welcome back, ${(res.data.user.name || res.data.user.email || 'friend').split(' ')[0]}!`);
        onSuccess(res.data.user);
      } catch (error) {
        console.error('Login failed:', error);
        toast.error('Authentication failed. Please try again.');
      }
    },
    onError: () => {
      toast.error('Google Login failed');
    },
  });

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0a0a0a', color: '#ffffff', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

      {/* ======================== BACKGROUND ELEMENTS ======================== */}
      {/* Ambient glow - matching Hero */}
      <motion.div
        style={{
          position: 'absolute', width: '800px', height: '800px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 65%)',
          top: '-300px', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none',
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating dots - matching Hero */}
      {[...Array(6)].map((_, i) => (
        <motion.div key={i} style={{
          position: 'absolute', width: '3px', height: '3px', borderRadius: '50%',
          backgroundColor: '#8b5cf6', left: `${15 + i * 14}%`, top: `${15 + (i % 3) * 20}%`, pointerEvents: 'none',
        }}
          animate={{ y: [0, -40, 0], opacity: [0, 0.6, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
        />
      ))}

      {/* ======================== MINI NAVBAR ======================== */}
      <motion.nav
        data-tutorial="auth-nav"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 64px', height: '72px', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 50 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '52px' }}>
          <motion.div
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="42" height="34" viewBox="0 0 42 34" fill="none">
              <circle cx="15" cy="19" r="15" fill="white" />
              <path d="M23 0 L42 34 L23 34 Z" fill="white" />
            </svg>
          </motion.div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            {['HOME', 'FEATURES', 'COMPANY', 'PRIVACY', 'API'].map((link, i) => (
              <span key={i} style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.8px', color: '#71717a', cursor: 'default', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {link}
                {i > 0 && <ChevronDown style={{ width: '11px', height: '11px' }} strokeWidth={3} />}
              </span>
            ))}
          </div>
        </div>
        <motion.button
          onClick={startTutorial}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
            backgroundColor: 'rgba(255,255,255,0.06)', color: '#e4e4e7',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.11)', scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <CircleHelp size={15} />
          Start Tutorial
        </motion.button>
      </motion.nav>

      {/* ======================== CONTENT ======================== */}
      <div className="flex flex-col items-center justify-center pt-24 pb-12 px-6 relative z-10">

        {/* Back link */}
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <ArrowLeft size={16} />
          <span className="text-xs font-bold tracking-widest uppercase">Go Back</span>
        </motion.button>

        {/* Main Heading - Matching Hero style but smaller */}
        <motion.div
          data-tutorial="auth-heading"
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '24px' }}>
            Secure Access —{' '}
            <span style={{ color: '#666666' }}>Your privacy starts here.</span>
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '18px', maxWidth: '440px', margin: '0 auto', lineHeight: 1.6 }}>
            Join 100k+ users who trust MaskMe to protect their digital identity.
          </p>
        </motion.div>

        {/* Auth Card - Matching Landings Grid card style */}
        <motion.div
          data-tutorial="auth-card"
          style={{
            backgroundColor: '#111111', borderRadius: '32px',
            padding: '48px', width: '100%', maxWidth: '480px',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
            position: 'relative', overflow: 'hidden'
          }}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          {/* Subtle inner card glow */}
          <div style={{
            position: 'absolute', width: '180px', height: '180px',
            background: 'radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)',
            top: '-40px', right: '-40px', filter: 'blur(30px)', pointerEvents: 'none'
          }} />

          <div className="flex flex-col items-center gap-8 relative z-10">
            {/* Google Login Button - Stylized like the Hero CTA */}
            <motion.button
              onClick={() => login()}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px',
                padding: '18px 32px', borderRadius: '14px', fontSize: '16px', fontWeight: 600,
                backgroundColor: '#ffffff', color: '#000000',
                boxShadow: '0 10px 40px rgba(255,255,255,0.05)'
              }}
              whileHover={{ scale: 1.03, backgroundColor: '#f4f4f5' }}
              whileTap={{ scale: 0.98 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </motion.button>

            {/* Accent Button - Stylized like the light-purple Landing button */}
            <motion.button
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px',
                padding: '18px 32px', borderRadius: '14px', fontSize: '16px', fontWeight: 600,
                backgroundColor: '#ddd6fe', color: '#000000',
              }}
              whileHover={{ scale: 1.03, backgroundColor: '#c4b5fd' }}
              whileTap={{ scale: 0.98 }}
            >
              Contact Support
            </motion.button>

            <div className="flex flex-col gap-4 mt-4 w-full">
              <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', width: '100%' }} />
              <p style={{ color: '#666666', fontSize: '13px', textAlign: 'center', lineHeight: 1.5 }}>
                Protected by enterprise-grade encryption. Images are never stored on our servers.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Social Proof / Trust Indicators - matching landing style */}
        <motion.div
          className="mt-20 flex flex-wrap justify-center gap-12 opacity-40 grayscale"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.6 }}
        >
          {['TECHCRUCH', 'FORBES', 'WIRED', 'VERGE'].map((brand) => (
            <span key={brand} style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '4px' }}>{brand}</span>
          ))}
        </motion.div>
      </div>

      {/* Trust Banner - exact copy from landing */}
      <section style={{ padding: '48px 24px', backgroundColor: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.04)', marginTop: '80px' }}>
        <motion.div
          style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.div animate={{ rotate: [0, 6, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <Shield style={{ width: '28px', height: '28px', color: '#8b5cf6' }} strokeWidth={1.5} />
          </motion.div>
          <p style={{ fontSize: '15px', color: '#a1a1aa', textAlign: 'center' }}>
            Your images are processed securely. Photos are never saved on our servers.
          </p>
        </motion.div>
      </section>

      <GuidedTutorial
        isOpen={isTutorialOpen}
        steps={AUTH_TUTORIAL_STEPS}
        onClose={closeTutorial}
      />

    </div>
  );
}
