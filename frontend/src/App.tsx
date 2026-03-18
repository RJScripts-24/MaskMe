import { useState, useEffect } from 'react';
import { ChevronDown, ArrowRight, ChevronRight, Shield, EyeOff, Upload, Download, Zap, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { toast, Toaster } from 'sonner';
import UploadPage from './components/UploadPage';
import AuthPage from './components/AuthPage';
import UserDashboard from './components/UserDashboard';
import { useIsMobile } from './components/ui/use-mobile';

// Image imports
import img1 from './assets/img1.png';
import img2 from './assets/img2.png';
import img3 from './assets/img3.png';
import img4 from './assets/img4.png';
import img5 from './assets/img5.png';
import img6 from './assets/img6.png';
import img7 from './assets/img7.png';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

interface User {
  email: string;
  name: string;
  picture: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'upload' | 'auth' | 'dashboard'>('home');
  const [user, setUser] = useState<User | null>(null);
  const isMobile = useIsMobile();
  const [isLandingCompact, setIsLandingCompact] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 1100;
  });
  const isCompactLayout = isMobile || isLandingCompact;

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1099px)');
    const onChange = () => setIsLandingCompact(window.innerWidth < 1100);
    media.addEventListener('change', onChange);
    onChange();
    return () => media.removeEventListener('change', onChange);
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      // Optionally redirect to dashboard if logged in
      if (currentPage === 'home') {
        setCurrentPage('dashboard');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('home');
    toast.success('Signed out successfully');
  };

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Toaster position="top-right" theme="dark" richColors />
      {currentPage === 'dashboard' ? (
        <UserDashboard
          user={user}
          onUploadClick={() => setCurrentPage('upload')}
          onLogout={handleLogout}
          onBackToHome={() => setCurrentPage('home')}
        />
      ) : currentPage === 'upload' ? (
        <UploadPage user={user} onBack={() => setCurrentPage('dashboard')} onLogout={handleLogout} />
      ) : currentPage === 'auth' ? (
        <AuthPage
          onSuccess={handleAuthSuccess}
          onBack={() => setCurrentPage('home')}
        />
      ) : (
        <div
          className="min-h-screen"
          style={{ backgroundColor: '#0a0a0a', color: '#ffffff', fontFamily: "'Inter', system-ui, -apple-system, sans-serif", width: '100vw', maxWidth: '100vw', overflowX: 'hidden' }}
        >
          {/* ======================== NAVBAR ======================== */}
          <motion.nav
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isCompactLayout ? '0 14px' : '0 64px', height: isCompactLayout ? '64px' : '72px', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'relative', zIndex: 100 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: isCompactLayout ? '0px' : '52px' }}>
              <motion.div
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                onClick={() => setCurrentPage('home')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg width="42" height="34" viewBox="0 0 42 34" fill="none">
                  <circle cx="15" cy="19" r="15" fill="white" />
                  <path d="M23 0 L42 34 L23 34 Z" fill="white" />
                </svg>
              </motion.div>

              <div style={{ display: isCompactLayout ? 'none' : 'flex', alignItems: 'center', gap: '28px' }}>
                {['HOME', 'FEATURES', 'COMPANY', 'PRIVACY', 'API'].map((link, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      fontSize: '11px', fontWeight: 700, letterSpacing: '1.8px',
                      color: i === 0 ? '#ffffff' : '#71717a', textDecoration: 'none',
                    }}
                    whileHover={{ color: '#ffffff' }}
                    transition={{ duration: 0.15 }}
                  >
                    {link}
                    {i > 0 && <ChevronDown style={{ width: '11px', height: '11px' }} strokeWidth={3} />}
                  </motion.a>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: isCompactLayout ? '10px' : '16px' }}>
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ display: isCompactLayout ? 'none' : 'flex', alignItems: 'center', gap: '10px', padding: '6px 14px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img
                      src={user.picture}
                      alt={user.name}
                      style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid rgba(139,92,246,0.5)' }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{(user.name || user.email || 'User').split(' ')[0]}</span>
                  </div>
                  <motion.button
                    onClick={handleLogout}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: isCompactLayout ? '9px 12px' : '10px 22px', borderRadius: '10px', fontSize: isCompactLayout ? '12px' : '14px', fontWeight: 600,
                      backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)',
                    }}
                    whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </motion.button>
                </div>
              ) : (
                <>
                  {!isCompactLayout && (
                    <motion.button
                      style={{
                        padding: '10px 22px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                        backgroundColor: '#1a1a1a', color: '#ffffff', border: '1px solid rgba(255,255,255,0.07)',
                      }}
                      whileHover={{ backgroundColor: '#2a2a2a' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setCurrentPage(user ? 'dashboard' : 'auth')}
                    >
                      Open your account
                    </motion.button>
                  )}
                  <motion.button
                    style={{
                      padding: isCompactLayout ? '9px 14px' : '10px 22px', borderRadius: '10px', fontSize: isCompactLayout ? '12px' : '14px', fontWeight: 600,
                      backgroundColor: '#ddd6fe', color: '#000000',
                    }}
                    whileHover={{ backgroundColor: '#c4b5fd' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setCurrentPage(user ? 'dashboard' : 'auth')}
                  >
                    Start Masking
                  </motion.button>
                </>
              )}
            </div>
          </motion.nav>

          {/* ======================== HERO ======================== */}
          <section style={{ position: 'relative', overflow: 'hidden', padding: isCompactLayout ? '78px 16px 44px' : '110px 24px 80px', textAlign: 'center' }}>
            {/* Ambient glow */}
            {!isCompactLayout && (
              <motion.div
                style={{
                  position: 'absolute', width: '700px', height: '700px',
                  background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)',
                  top: '-250px', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none',
                }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            {/* Floating dots */}
            {[...Array(isCompactLayout ? 2 : 8)].map((_, i) => (
              <motion.div key={i} style={{
                position: 'absolute', width: '3px', height: '3px', borderRadius: '50%',
                backgroundColor: '#8b5cf6', left: `${12 + i * 11}%`, top: `${15 + (i % 3) * 18}%`, pointerEvents: 'none',
              }}
                animate={{ y: [0, -35, 0], opacity: [0, 0.7, 0], scale: [0.5, 1.5, 0.5] }}
                transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.35, ease: 'easeInOut' }}
              />
            ))}

            <div style={{ position: 'relative', zIndex: 1, maxWidth: '1140px', margin: '0 auto' }}>
              <motion.h1
                style={{
                  fontSize: 'clamp(38px, 6.5vw, 90px)', fontWeight: 500,
                  lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: isCompactLayout ? '24px' : '36px',
                }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Introducing MaskMe — <span style={{ color: '#666666' }}>the Ultimate Privacy Tool.</span>
              </motion.h1>

              <motion.div
                style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center', marginBottom: isCompactLayout ? '34px' : '72px' }}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.button
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '15px 32px', borderRadius: '12px', fontSize: '15px', fontWeight: 600,
                    backgroundColor: '#ddd6fe', color: '#000000',
                  }}
                  whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(139,92,246,0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setCurrentPage(user ? 'dashboard' : 'auth')}
                >
                  {user ? 'Go to Dashboard' : 'Try MaskMe Now'} <ArrowRight style={{ width: '18px', height: '18px' }} />
                </motion.button>
                <motion.button
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '15px 32px', borderRadius: '12px', fontSize: '15px', fontWeight: 600,
                    backgroundColor: '#1a1a1a', color: '#ffffff', border: '1px solid rgba(255,255,255,0.07)',
                  }}
                  whileHover={{ scale: 1.04, backgroundColor: '#222222' }}
                  whileTap={{ scale: 0.97 }}
                >
                  Browse Features <ChevronRight style={{ width: '18px', height: '18px' }} />
                </motion.button>
              </motion.div>

              {/* White Banner */}
              <motion.div
                style={{
                  backgroundColor: '#ffffff', borderRadius: '16px', padding: isCompactLayout ? '14px 14px' : '18px 24px',
                  maxWidth: '700px', margin: '0 auto',
                  display: 'flex', flexWrap: 'wrap', alignItems: 'center',
                  justifyContent: 'space-between', gap: isCompactLayout ? '10px' : '16px',
                  boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
                }}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: isCompactLayout ? 'none' : 'flex', alignItems: 'center', gap: '10px', paddingRight: '16px', borderRight: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{ width: '7px', height: '22px', backgroundColor: '#3b5bdb', borderRadius: '2px', transform: `skewX(-15deg) scaleY(${0.7 + i * 0.15})` }} />
                      ))}
                    </div>
                    <svg viewBox="0 0 38 57" style={{ width: '22px', height: '22px' }} fill="none">
                      <path d="M19 28.5C19 33.75 14.75 38 9.5 38C4.25 38 0 33.75 0 28.5C0 23.25 4.25 19 9.5 19C14.75 19 19 23.25 19 28.5Z" fill="#1ABCFE"/>
                      <path d="M0 47.5C0 52.75 4.25 57 9.5 57C14.75 57 19 52.75 19 47.5V38H9.5C4.25 38 0 42.25 0 47.5Z" fill="#0ACF83"/>
                      <path d="M19 0H9.5C4.25 0 0 4.25 0 9.5C0 14.75 4.25 19 9.5 19H19V0Z" fill="#F24E1E"/>
                      <path d="M19 19H28.5C33.75 19 38 14.75 38 9.5C38 4.25 33.75 0 28.5 0H19V19Z" fill="#FF7262"/>
                      <path d="M38 28.5C38 33.75 33.75 38 28.5 38C23.25 38 19 33.75 19 28.5C19 23.25 23.25 19 28.5 19C33.75 19 38 23.25 38 28.5Z" fill="#A259FF"/>
                    </svg>
                  </div>
                  <p style={{ color: '#000', fontSize: isCompactLayout ? '13px' : '14px', fontWeight: 600, lineHeight: 1.4, maxWidth: isCompactLayout ? '100%' : '250px', textAlign: 'left' }}>
                    {user ? `Ready to mask your next photo, ${(user.name || user.email || 'friend').split(' ')[0]}?` : 'Upload your photo to protect it from AI facial recognition.'}
                  </p>
                </div>
                <motion.button
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: isCompactLayout ? '10px 14px' : '11px 22px', borderRadius: '10px', fontSize: isCompactLayout ? '13px' : '14px', fontWeight: 600,
                    border: '1px solid #d1d5db', color: '#000', backgroundColor: '#fff', whiteSpace: 'nowrap',
                  }}
                  whileHover={{ backgroundColor: '#f3f4f6' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setCurrentPage(user ? 'dashboard' : 'auth')}
                >
                  {user ? 'Upload' : 'Upload now'} <ArrowRight style={{ width: '14px', height: '14px' }} />
                </motion.button>
              </motion.div>
            </div>
          </section>

          {!isCompactLayout && (
            <>
              {/* ======================== LANDING PAGES SECTION TITLE ======================== */}
              <section style={{ padding: '80px 64px 24px' }}>
                <motion.h2
                  style={{ fontSize: '30px', fontWeight: 600, letterSpacing: '-0.02em', color: '#ffffff' }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  Landing Pages
                </motion.h2>
              </section>

              {/* ======================== LANDING CARDS GRID ======================== */}
              <section style={{ padding: '16px 64px 120px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '28px', maxWidth: '1400px', margin: '0 auto' }}>

              {/* ===== CARD 1 — "MASKME IS AN IDEAL SOLUTION..." ===== */}
              <motion.div
                style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  style={{
                    backgroundColor: '#2a2a2a', borderRadius: '28px',
                    padding: '10px', cursor: 'pointer', position: 'relative', overflow: 'hidden',
                  }}
                  whileHover="hover"
                  initial="rest"
                >
                  <motion.div
                    style={{
                      position: 'absolute', inset: 0, borderRadius: '28px', pointerEvents: 'none',
                      background: 'radial-gradient(circle at 25% 25%, rgba(139,92,246,0.1), transparent 55%)',
                    }}
                    variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
                    transition={{ duration: 0.3 }}
                  />
                  <div style={{
                    position: 'relative', overflow: 'hidden', borderRadius: '20px',
                    aspectRatio: '16/10', backgroundColor: '#0f0f0f',
                    border: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                  }}>
                    <div style={{
                      position: 'absolute', width: '180px', height: '180px',
                      background: 'radial-gradient(circle, rgba(88,28,235,0.7), transparent 70%)',
                      top: '-60px', left: '-30px', filter: 'blur(40px)', pointerEvents: 'none',
                    }} />
                    <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 3 }}>
                      <div style={{
                        width: '38px', height: '38px', backgroundColor: '#d4d4d8',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div style={{ width: '16px', height: '16px', border: '2.5px solid #000', borderRadius: '50%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '4px', height: '4px', backgroundColor: '#000', borderRadius: '50%' }} />
                        </div>
                      </div>
                    </div>
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%, -70%)', zIndex: 2,
                      textAlign: 'center', width: '70%',
                    }}>
                      <h3 style={{
                        fontSize: 'clamp(12px, 1.6vw, 20px)', fontWeight: 700,
                        color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase',
                        letterSpacing: '1.5px', lineHeight: 1.5,
                      }}>
                        MASKME IS AN IDEAL SOLUTION FOR THE PRIVACY OF YOUR PHOTOS
                      </h3>
                    </div>
                    <motion.div
                      style={{
                        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                        width: '52%', height: '45%',
                        backgroundColor: '#1c1c1c',
                        borderRadius: '14px 14px 0 0',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderBottom: 'none', overflow: 'hidden',
                        zIndex: 2,
                      }}
                      variants={{
                        rest: { y: 0 },
                        hover: { y: -8, boxShadow: '0 -20px 60px rgba(139,92,246,0.15)' },
                      }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                      <img src={img1} alt="Face scan visualization" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', opacity: 0.85 }} />
                      <motion.div
                        style={{
                          position: 'absolute', left: 0, right: 0, height: '2px',
                          background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.8), transparent)',
                        }}
                        animate={{ top: ['0%', '100%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 0.5 }}
                      />
                      {[
                        { top: '12px', left: '12px', borderRight: 'none', borderBottom: 'none' },
                        { top: '12px', right: '12px', borderLeft: 'none', borderBottom: 'none' },
                      ].map((style, i) => (
                        <motion.div key={i} style={{
                          position: 'absolute', width: '14px', height: '14px',
                          border: '2px solid rgba(139,92,246,0.8)', ...style,
                        }}
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                        />
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#d4d4d8', paddingLeft: '6px' }}>Landing 1</p>
              </motion.div>

              {/* ===== CARD 2 — "LET MASKME BE YOUR GUIDING LIGHT" ===== */}
              <motion.div
                style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <motion.div
                  style={{ backgroundColor: '#2a2a2a', borderRadius: '28px', padding: '10px', cursor: 'pointer' }}
                  whileHover="hover"
                  initial="rest"
                >
                  <div style={{
                    position: 'relative', overflow: 'hidden', borderRadius: '20px',
                    aspectRatio: '16/10', backgroundColor: '#0a0a0a',
                    border: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <motion.img
                      src={img5}
                      alt="Privacy mask concept"
                      style={{
                        position: 'absolute', inset: 0, width: '100%', height: '115%',
                        objectFit: 'cover', objectPosition: 'center top',
                        filter: 'brightness(0.45) saturate(0.8)',
                      }}
                      variants={{
                        rest: { scale: 1, y: 0 },
                        hover: { scale: 1.07, y: -12 },
                      }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                    />
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)',
                    }} />
                    <div style={{
                      position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px',
                      background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.6), transparent)',
                    }} />
                    <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 48px' }}>
                      <motion.div
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '8px',
                          padding: '5px 14px', backgroundColor: 'rgba(30,30,30,0.8)',
                          border: '1px solid rgba(167,139,250,0.2)', borderRadius: '50px',
                          marginBottom: '24px', backdropFilter: 'blur(8px)',
                        }}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <div style={{ width: '6px', height: '6px', backgroundColor: '#a78bfa', borderRadius: '50%' }} />
                        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', color: '#a78bfa', textTransform: 'uppercase' }}>
                          Security
                        </span>
                      </motion.div>
                      <motion.h3
                        style={{
                          fontSize: 'clamp(20px, 2.8vw, 36px)', fontWeight: 400,
                          color: '#ffffff', lineHeight: 1.15, letterSpacing: '-0.02em',
                          textShadow: '0 2px 20px rgba(0,0,0,0.5)',
                        }}
                        variants={{ rest: { opacity: 0.9 }, hover: { opacity: 1 } }}
                      >
                        Let MaskMe be your guiding light to online excellence
                      </motion.h3>
                    </div>
                  </div>
                </motion.div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#d4d4d8', paddingLeft: '6px' }}>Landing 2</p>
              </motion.div>

              {/* ===== CARD 3 — TEAM GRID ===== */}
              <motion.div
                style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, delay: 0.05 }}
              >
                <motion.div
                  style={{ backgroundColor: '#2a2a2a', borderRadius: '28px', padding: '10px', cursor: 'pointer' }}
                  whileHover="hover"
                  initial="rest"
                >
                  <div style={{
                    position: 'relative', overflow: 'hidden', borderRadius: '20px',
                    aspectRatio: '16/10', backgroundColor: '#0f0f0f',
                    border: '1px solid rgba(255,255,255,0.04)',
                    padding: '28px 28px 0',
                    display: 'flex', flexDirection: 'column',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ width: '70px', height: '28px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ width: '90px', height: '28px', backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>MASKING</span>
                        </div>
                        <div style={{ width: '90px', height: '28px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                      </div>
                    </div>
                    <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', margin: '8px 0 20px' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', flex: 1 }}>
                      {[img3, img4, img6].map((imgSrc, i) => (
                        <motion.div
                          key={i}
                          style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                        >
                          <p style={{
                            fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.3)',
                            textAlign: 'center', textTransform: 'uppercase',
                            letterSpacing: '0.8px', lineHeight: 1.4,
                            paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                          }}>
                            Adept minds behind MaskMe
                          </p>
                          <motion.div
                            style={{
                              flex: 1, borderRadius: '12px', overflow: 'hidden',
                              border: '1px solid rgba(255,255,255,0.05)',
                              minHeight: '90px', position: 'relative',
                            }}
                            variants={{
                              rest: { scale: 1 },
                              hover: { scale: 1.03 },
                            }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                          >
                            <img src={imgSrc} alt="" style={{
                              width: '100%', height: '100%', objectFit: 'cover',
                              objectPosition: 'top center', filter: 'brightness(0.75)',
                            }} />
                            <div style={{
                              position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
                              background: 'linear-gradient(to bottom, transparent, rgba(15,15,15,0.9))',
                            }} />
                            <div style={{ position: 'absolute', bottom: '8px', left: 0, right: 0, textAlign: 'center' }}>
                              <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Make your vision a reality
                              </span>
                            </div>
                          </motion.div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#d4d4d8', paddingLeft: '6px' }}>Landing 5</p>
              </motion.div>

              {/* ===== CARD 4 — SPLIT IMAGE + STATS ===== */}
              <motion.div
                style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <motion.div
                  style={{ backgroundColor: '#2a2a2a', borderRadius: '28px', padding: '10px', cursor: 'pointer' }}
                  whileHover="hover"
                  initial="rest"
                >
                  <div style={{
                    position: 'relative', overflow: 'hidden', borderRadius: '20px',
                    aspectRatio: '16/10', backgroundColor: '#0f0f0f',
                    border: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex', gap: '10px', padding: '10px',
                  }}>
                    <motion.div
                      style={{
                        flex: '1.3', borderRadius: '14px', overflow: 'hidden', position: 'relative',
                      }}
                      variants={{
                        rest: { scale: 1 },
                        hover: { scale: 1.03 },
                      }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                      <img src={img2} alt="Person with face detection overlay" style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        objectPosition: 'center top', filter: 'brightness(0.9)',
                      }} />
                      <motion.div
                        style={{
                          position: 'absolute', top: '20%', left: '22%', right: '22%', bottom: '10%',
                          border: '2px solid rgba(139,92,246,0.5)', borderRadius: '4px', pointerEvents: 'none',
                        }}
                        animate={{ opacity: [0.3, 0.7, 0.3], borderColor: ['rgba(139,92,246,0.3)', 'rgba(139,92,246,0.8)', 'rgba(139,92,246,0.3)'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <div style={{
                        position: 'absolute', top: '12px', left: '12px',
                        display: 'flex', alignItems: 'center', gap: '5px',
                        backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '6px',
                        padding: '3px 8px', backdropFilter: 'blur(8px)',
                      }}>
                        <div style={{ width: '5px', height: '5px', backgroundColor: '#4ade80', borderRadius: '50%' }} />
                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>AI ACTIVE</span>
                      </div>
                    </motion.div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <motion.div
                        style={{
                          flex: 1, backgroundColor: '#151515', borderRadius: '14px',
                          border: '1px solid rgba(255,255,255,0.05)',
                          padding: '20px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                          overflow: 'hidden', position: 'relative',
                        }}
                        variants={{ rest: { y: 0 }, hover: { y: -4 } }}
                        transition={{ duration: 0.3 }}
                      >
                        <img src={img7} alt="" style={{
                          position: 'absolute', inset: 0, width: '100%', height: '100%',
                          objectFit: 'cover', opacity: 0.12, filter: 'saturate(0)',
                        }} />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                          <h4 style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 500, color: '#fff', lineHeight: 1, marginBottom: '6px' }}>
                            8.4%
                          </h4>
                          <p style={{ fontSize: '9px', color: '#666666', lineHeight: 1.5 }}>
                            Invest. Curabitur blandit tempus porttitor aliquet vestibulum ex...
                          </p>
                        </div>
                      </motion.div>
                      <motion.div
                        style={{
                          flex: 1, backgroundColor: '#ddd6fe', borderRadius: '14px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          overflow: 'hidden', position: 'relative',
                        }}
                        variants={{ rest: { y: 0 }, hover: { y: -4 } }}
                        transition={{ duration: 0.3, delay: 0.05 }}
                      >
                        <img src={img6} alt="" style={{
                          position: 'absolute', inset: 0, width: '100%', height: '100%',
                          objectFit: 'cover', opacity: 0.18, mixBlendMode: 'multiply',
                        }} />
                        <svg width="60" height="38" viewBox="0 0 60 38" fill="none" style={{ position: 'relative', zIndex: 1 }}>
                          <circle cx="20" cy="19" r="19" fill="#0a0a0a" />
                          <circle cx="40" cy="19" r="19" fill="#0a0a0a" opacity="0.75" />
                        </svg>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#d4d4d8', paddingLeft: '6px' }}>Landing 6</p>
              </motion.div>
                </div>
              </section>
            </>
          )}

          {/* ======================== WHY MASKME SECTION ======================== */}
          <section style={{ padding: isCompactLayout ? '40px 16px' : '60px 64px', backgroundColor: '#0f0f0f' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <motion.h2
                style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 600, marginBottom: isCompactLayout ? '28px' : '56px', letterSpacing: '-0.02em', textAlign: 'center' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Why MaskMe?
              </motion.h2>
              <div style={{ display: 'grid', gridTemplateColumns: isCompactLayout ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
                {[
                  { icon: <EyeOff strokeWidth={1.5} />, title: 'Invisible Protection', desc: 'MaskMe cloaks your face so AI can\'t recognize you—while keeping you looking the same to humans.', img: img7 },
                  { icon: <Shield strokeWidth={1.5} />, title: 'Defense Against AI Scraping', desc: 'Shield your photos from invasive facial recognition used by social networks, advertisers, and data brokers.', img: img3 },
                  { icon: <Zap strokeWidth={1.5} />, title: 'Simple & Lightning Fast', desc: 'Upload a photo, let MaskMe work in seconds, and download your protected image. No setup needed.', img: img1 },
                ].map((card, i) => (
                  <motion.div
                    key={i}
                    style={{
                      padding: '36px 28px', borderRadius: '20px',
                      backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.05)',
                      position: 'relative', overflow: 'hidden',
                    }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    whileHover={{ y: -6, borderColor: 'rgba(139,92,246,0.2)', boxShadow: '0 20px 60px rgba(139,92,246,0.07)' }}
                  >
                    <img src={card.img} alt="" style={{
                      position: 'absolute', inset: 0, width: '100%', height: '100%',
                      objectFit: 'cover', opacity: 0.06, filter: 'saturate(0)',
                    }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ width: '44px', height: '44px', color: '#8b5cf6', marginBottom: '18px' }}>
                        {card.icon}
                      </div>
                      <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '10px', color: '#f4f4f5' }}>{card.title}</h3>
                      <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#71717a' }}>{card.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ======================== HOW IT WORKS ======================== */}
          <section style={{ padding: isCompactLayout ? '48px 16px' : '80px 64px', backgroundColor: '#0a0a0a' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <motion.h2
                style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 600, marginBottom: isCompactLayout ? '28px' : '56px', letterSpacing: '-0.02em', textAlign: 'center' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                How It Works
              </motion.h2>
              <div style={{ display: 'grid', gridTemplateColumns: isCompactLayout ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
                {[
                  { icon: <Upload strokeWidth={1.5} />, step: '01', title: 'Upload Photo', desc: 'Upload a face photo you want to protect from facial recognition AI.' },
                  { icon: <Shield strokeWidth={1.5} />, step: '02', title: 'Privacy Protection', desc: 'MaskMe applies invisible adversarial noise to shield your identity.' },
                  { icon: <Download strokeWidth={1.5} />, step: '03', title: 'Download Result', desc: 'Download your protected photo — looks the same, secured against AI.' },
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    style={{
                      padding: '40px 32px', borderRadius: '20px', backgroundColor: '#141414',
                      border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', position: 'relative',
                    }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.12 }}
                    whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(139,92,246,0.08)' }}
                  >
                    <div style={{
                      position: 'absolute', top: '-14px', right: '-8px',
                      width: '36px', height: '36px', backgroundColor: '#8b5cf6', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700, color: '#fff',
                      boxShadow: '0 4px 20px rgba(139,92,246,0.5)',
                    }}>
                      {step.step}
                    </div>
                    <div style={{ width: '48px', height: '48px', color: '#8b5cf6', margin: '0 auto 18px' }}>
                      {step.icon}
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px', color: '#f4f4f5' }}>{step.title}</h3>
                    <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#71717a' }}>{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ======================== TRUST BANNER ======================== */}
          <section style={{ padding: '36px 24px', backgroundColor: '#111111', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
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

          {/* ======================== FOOTER ======================== */}
          <footer style={{
            backgroundColor: '#ffffff', color: '#000000',
            borderRadius: isCompactLayout ? '24px 24px 0 0' : '48px 48px 0 0',
            padding: isCompactLayout ? '36px 16px 28px' : '80px 64px 48px',
          }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: isCompactLayout ? '1fr' : '5fr 7fr', gap: isCompactLayout ? '28px' : '80px', marginBottom: isCompactLayout ? '28px' : '72px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  <svg width={isCompactLayout ? '56' : '80'} height={isCompactLayout ? '44' : '64'} viewBox="0 0 80 64" fill="none">
                    <circle cx="28" cy="36" r="28" fill="#0a0a0a" />
                    <path d="M44 0 L80 64 L44 64 Z" fill="#0a0a0a" />
                  </svg>
                  <h2 style={{ fontSize: isCompactLayout ? '22px' : '30px', fontWeight: 500, lineHeight: 1.3, letterSpacing: '-0.02em', maxWidth: '300px' }}>
                    <span style={{ color: '#000' }}>MaskMe</span>{' '}
                    <span style={{ color: '#a1a1aa' }}>— The all in one Privacy Tool.</span>
                  </h2>
                </div>
                {!isCompactLayout && <div style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', display: 'grid' }}>
                  {[
                    { title: 'Solutions', links: ['Photo Masking', 'Batch Processing', 'API Access', 'Enterprise', 'Pricing', 'Documentation'] },
                    { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press Kit', 'Contact'] },
                    { title: 'Follow us', links: ['Twitter', 'GitHub', 'Dribbble', 'LinkedIn', 'YouTube'] },
                  ].map((col, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                      <h4 style={{ fontSize: '17px', fontWeight: 700 }}>{col.title}</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {col.links.map((link, j) => (
                          <motion.a
                            key={j} href="#"
                            style={{ fontSize: '15px', color: '#666666', fontWeight: 500, textDecoration: 'none' }}
                            whileHover={{ color: '#000000', x: 4 }}
                            transition={{ duration: 0.15 }}
                          >{link}</motion.a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>}
              </div>

              <div style={{ height: '1px', backgroundColor: '#e5e7eb', marginBottom: '28px' }} />

              <div style={{ display: 'flex', alignItems: isCompactLayout ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isCompactLayout ? 'column' : 'row', gap: isCompactLayout ? '10px' : '0px' }}>
                <p style={{ fontSize: '14px', color: '#666666', fontWeight: 500 }}>By MaskMe Team</p>
                <div style={{ display: 'flex', gap: isCompactLayout ? '16px' : '28px', flexWrap: 'wrap' }}>
                  {['License', 'Terms of Service', 'Privacy Policy'].map((link, i) => (
                    <motion.a key={i} href="#" style={{ fontSize: '14px', color: '#666666', fontWeight: 500, textDecoration: 'none' }}
                      whileHover={{ color: '#000' }}>{link}</motion.a>
                  ))}
                </div>
              </div>
            </div>
          </footer>
        </div>
      )}
    </GoogleOAuthProvider>
  );
}

