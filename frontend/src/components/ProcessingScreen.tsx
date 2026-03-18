import { Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { cloakImage, ApiError } from '../services/api';
import { ShieldResponse } from '../types/api';

interface ProcessingScreenProps {
  file: File;
  epsilon?: number;
  attackMethod?: string;
  onComplete: (response: ShieldResponse) => void;
  onError: (error: string) => void;
}

export default function ProcessingScreen({ file, epsilon = 0.03, attackMethod = "FGSM", onComplete, onError }: ProcessingScreenProps) {
  const [processingStatus, setProcessingStatus] = useState<string>('Uploading image...');

  useEffect(() => {
    const processImage = async () => {
      try {
        setProcessingStatus('Uploading image...');

        // Call the actual API
        const response = await cloakImage(file, epsilon, attackMethod);

        setProcessingStatus('Protection applied!');

        // Wait a brief moment to show success message
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
  }, [file, epsilon, attackMethod, onComplete, onError]);

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

      {/* Header */}
      <motion.header
        className="py-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-5 h-5" style={{ color: '#8b5cf6' }} />
          <span className="text-lg font-semibold" style={{ color: '#ffffff' }}>MaskMe</span>
        </div>
      </motion.header>

      {/* Main Content - Centered Card */}
      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div
          className="rounded-2xl p-12 max-w-md w-full"
          style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Status Heading */}
          <motion.h1
            className="text-2xl text-center mb-8 font-medium"
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
