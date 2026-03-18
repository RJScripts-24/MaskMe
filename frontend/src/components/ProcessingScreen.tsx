import { Shield, LogOut, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { cloakImage, ApiError } from '../services/api';
import { ShieldResponse } from '../types/api';
import { useIsMobile } from './ui/use-mobile';

interface ProcessingScreenProps {
  file: File;
  files?: File[];
  epsilon?: number;
  attackMethod?: string;
  privacyMode?: 'standard' | 'strict';
  user: { name: string; email: string; picture: string } | null;
  onBack: () => void;
  onLogout: () => void;
  onComplete: (response: ShieldResponse) => void;
  onBatchComplete?: (results: Array<{ id: string; protected: string; fileName: string }>, failedCount: number) => void;
  onError: (error: string) => void;
}

export default function ProcessingScreen({ file, files = [], epsilon = 0.03, attackMethod = "FGSM", privacyMode = 'standard', user, onBack, onLogout, onComplete, onBatchComplete, onError }: ProcessingScreenProps) {
  const isMobile = useIsMobile();
  const [processingStatus, setProcessingStatus] = useState<string>('Uploading image...');
  const primaryName = (user?.name || user?.email || 'User').split(' ')[0];

  useEffect(() => {
    const processImage = async () => {
      try {
        if (files.length > 1 && onBatchComplete) {
          const results: Array<{ id: string; protected: string; fileName: string }> = [];
          let failedCount = 0;

          for (let i = 0; i < files.length; i += 1) {
            const currentFile = files[i];
            setProcessingStatus(`Masking image ${i + 1} of ${files.length}: ${currentFile.name}`);

            try {
              const response = await cloakImage(currentFile, epsilon, attackMethod, privacyMode);
              results.push({
                id: `${Date.now()}-${i}`,
                protected: `data:image/png;base64,${response.cloaked_image}`,
                fileName: currentFile.name,
              });
            } catch {
              failedCount += 1;
            }
          }

          setProcessingStatus('Batch protection completed');
          setTimeout(() => {
            onBatchComplete(results, failedCount);
          }, 500);
          return;
        }

        setProcessingStatus('Uploading image...');
        const response = await cloakImage(file, epsilon, attackMethod, privacyMode);
        setProcessingStatus('Protection applied!');
        setTimeout(() => {
          onComplete(response);
        }, 500);
      } catch (error) {
        console.error('Error cloaking image:', error);

        if (error instanceof ApiError) {
          if (error.details) {
            const errorMsg = error.details.detail
              .map(e => `${e.loc.join('.')}: ${e.msg}`)
              .join(', ');
            onError(`Validation error: ${errorMsg}`);
          } else {
            onError(`Error: ${error.message}`);
          }
        } else {
          onError('An unexpected error occurred while processing your image.');
        }
      }
    };

    processImage();
  }, [file, files, epsilon, attackMethod, privacyMode, onComplete, onBatchComplete, onError]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a0a0a', color: '#ffffff', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Animated background elements */}
      <motion.div
        className="fixed top-20 left-10 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: '#8b5cf6', opacity: 0.05 }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="fixed bottom-20 right-10 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: '#8b5cf6', opacity: 0.03 }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.02, 0.05, 0.02] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <motion.nav
        className="relative z-40"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '0 12px' : '0 24px',
          height: isMobile ? '64px' : '72px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="cursor-pointer"
          onClick={onBack}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.22)' }}
          >
            <Shield className="w-4 h-4" style={{ color: '#8b5cf6' }} />
          </div>
          <span className="text-lg font-semibold">MaskMe</span>
        </motion.div>

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px' }}>
          <motion.button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0px' : '8px',
              padding: isMobile ? '8px 10px' : '10px 16px',
              borderRadius: '10px',
              fontSize: isMobile ? '0px' : '14px',
              fontWeight: 600,
              backgroundColor: 'rgba(255,255,255,0.06)',
              color: '#e4e4e7',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.11)', scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <ArrowLeft size={16} />
            {!isMobile && 'Back to Home'}
          </motion.button>

          <div
            className="hidden sm:flex"
            style={{
              alignItems: 'center',
              gap: '10px',
              padding: '6px 12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <img
              src={user?.picture}
              alt={primaryName}
              style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid rgba(139,92,246,0.5)' }}
            />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{primaryName}</span>
          </div>

          <motion.button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0px' : '8px',
              padding: isMobile ? '8px 10px' : '10px 18px',
              borderRadius: '10px',
              fontSize: isMobile ? '0px' : '14px',
              fontWeight: 600,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
            whileHover={{ backgroundColor: 'rgba(239,68,68,0.2)', scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <LogOut size={16} />
            {!isMobile && 'Sign Out'}
          </motion.button>
        </div>
      </motion.nav>

      {/* Main Content - Centered Card */}
      <div className="flex-1 flex items-center justify-center px-6" style={{ paddingLeft: isMobile ? '12px' : undefined, paddingRight: isMobile ? '12px' : undefined }}>
        <motion.div
          className="rounded-2xl p-12 max-w-md w-full"
          style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)', padding: isMobile ? '24px' : '48px' }}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Status Heading */}
          <motion.h1
            className={isMobile ? 'text-xl text-center mb-6 font-medium' : 'text-2xl text-center mb-8 font-medium'}
            style={{ color: '#ffffff' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Applying Adversarial Protection…
          </motion.h1>

          {/* Shield Illustration */}
          <div className="flex justify-center mb-8">
            <motion.div
              className="relative w-32 h-32"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {/* Outer glow effect */}
              <motion.div
                className="absolute inset-0 rounded-full blur-2xl"
                style={{ backgroundColor: '#8b5cf6', opacity: 0.12 }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.18, 0.1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Main Shield Icon */}
              <motion.div
                className="relative w-full h-full flex items-center justify-center"
                animate={{
                  rotate: [0, 360]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Shield
                  className="w-full h-full"
                  style={{ color: '#8b5cf6' }}
                  strokeWidth={1}
                  fill="none"
                />
              </motion.div>

              {/* Inner animated arc/progress indicator */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
                style={{ transform: 'rotate(-90deg)' }}
              >
                <motion.circle
                  cx="50"
                  cy="50"
                  r="30"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{
                    pathLength: [0, 0.7, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </svg>

              {/* Floating dots inside shield */}
              <div className="absolute inset-0 flex items-center justify-center">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: '#8b5cf6',
                      left: '50%',
                      top: '50%'
                    }}
                    animate={{
                      x: [
                        0,
                        Math.cos((i * 120 * Math.PI) / 180) * 15,
                        0
                      ],
                      y: [
                        0,
                        Math.sin((i * 120 * Math.PI) / 180) * 15,
                        0
                      ],
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: i * 0.4,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>

              {/* Orbiting particles around shield */}
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={`orbit-${i}`}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: '#8b5cf6',
                    left: '50%',
                    top: '50%'
                  }}
                  animate={{
                    x: [
                      Math.cos((i * 72 * Math.PI) / 180) * 50,
                      Math.cos(((i * 72 + 360) * Math.PI) / 180) * 50,
                    ],
                    y: [
                      Math.sin((i * 72 * Math.PI) / 180) * 50,
                      Math.sin(((i * 72 + 360) * Math.PI) / 180) * 50,
                    ],
                    opacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "linear"
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* Divider Line */}
          <motion.div
            className="h-px w-full mb-6"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          />

          {/* Reassurance Message */}
          <motion.p
            className="text-center text-sm"
            style={{ color: '#a1a1aa' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            {processingStatus}
          </motion.p>

          {/* Pulsing dots animation */}
          <motion.div
            className="flex justify-center gap-1.5 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: '#8b5cf6' }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom spacing */}
      <div className="py-6"></div>
    </div>
  );
}
