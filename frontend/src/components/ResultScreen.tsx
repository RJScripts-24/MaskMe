
import { Shield, X, Check, Download, Upload, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { ShieldResponse } from '../types/api';
import { useState } from 'react';

// Shared color constants
const COLOR_PRIMARY = '#2563EB';
const COLOR_BG = '#F8FAFC';
const COLOR_BORDER = '#E2E8F0';
const COLOR_HEADER_TEXT = '#0F172A';
const COLOR_SUBTEXT = '#64748B';
const COLOR_CARD_BG = '#FFFFFF';
const COLOR_CARD_BORDER = '#E2E8F0';
const COLOR_ORIG_BG = '#F1F5F9';
const COLOR_STATUS1_BG = '#FEF2F2';
const COLOR_STATUS1_BORDER = '#FECACA';
const COLOR_STATUS1_ICON_BG = '#FEE2E2';
const COLOR_STATUS1_ICON = '#DC2626';
const COLOR_STATUS1_TEXT = '#DC2626';
const COLOR_STATUS1_SUB = '#991B1B';
const COLOR_STATUS2_BG = '#F0FDF4';
const COLOR_STATUS2_BORDER = '#BBF7D0';
const COLOR_STATUS2_ICON_BG = '#DCFCE7';
const COLOR_STATUS2_ICON = '#16A34A';
const COLOR_STATUS2_TEXT = '#16A34A';
const COLOR_STATUS2_SUB = '#166534';

interface ResultScreenProps {
  originalImage: string;
  protectedImage: string;
  apiResponse: ShieldResponse;
  onTryAnother: () => void;
  onBack: () => void;
}

interface StatusCardProps {
  icon: React.ReactNode;
  bg: string;
  border: string;
  iconBg: string;
  title: string;
  titleColor: string;
  subtitle: React.ReactNode;
  subtitleColor: string;
  delay: number;
}

function StatusCard({ icon, bg, border, iconBg, title, titleColor, subtitle, subtitleColor, delay }: StatusCardProps) {
  return (
    <motion.div
      className="p-5 rounded-xl border-2 flex items-center gap-4"
      style={{ backgroundColor: bg, borderColor: border }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      <motion.div
        className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: iconBg }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.2, type: 'spring' }}
      >
        {icon}
      </motion.div>
      <div>
        <p className="text-lg" style={{ color: titleColor, fontWeight: 600 }}>{title}</p>
        <div className="text-sm" style={{ color: subtitleColor }}>{subtitle}</div>
      </div>
    </motion.div>
  );
}

export default function ResultScreen({ originalImage, protectedImage, apiResponse, onTryAnother, onBack }: ResultScreenProps) {
  // State for X-Ray Mode toggle
  const [showNoise, setShowNoise] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = protectedImage;
    link.download = 'masked-image-protected.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format confidence scores as percentages
  const originalConfidencePercent = (apiResponse.original_confidence * 100).toFixed(1);
  const cloakedConfidencePercent = (apiResponse.cloaked_confidence * 100).toFixed(1);
  const protectionEffectiveness = ((apiResponse.original_confidence - apiResponse.cloaked_confidence) / apiResponse.original_confidence * 100).toFixed(1);

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLOR_BG }}>
      {/* Animated background elements */}
      <motion.div
        className="fixed top-20 left-10 w-40 h-40 rounded-full blur-3xl opacity-5 pointer-events-none"
        style={{ backgroundColor: COLOR_PRIMARY }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.08, 0.05] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="fixed bottom-20 right-10 w-56 h-56 rounded-full blur-3xl opacity-5 pointer-events-none"
        style={{ backgroundColor: COLOR_PRIMARY }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.08, 0.05] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      {/* Header */}
      <header className="bg-white border-b" style={{ borderColor: COLOR_BORDER }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6" style={{ color: COLOR_PRIMARY }} />
            <span className="text-xl" style={{ color: COLOR_HEADER_TEXT }}>MaskMe</span>
          </div>
          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 transition-colors"
            style={{ color: COLOR_SUBTEXT }}
            whileHover={{ color: COLOR_PRIMARY }}
          >
            <span>Back to Home</span>
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ backgroundColor: '#EFF6FF' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Shield className="w-8 h-8" style={{ color: COLOR_PRIMARY }} strokeWidth={2} />
            </motion.div>
            <h1 className="text-4xl mb-3" style={{ color: COLOR_HEADER_TEXT }}>
              Protection Applied Successfully
            </h1>
            <p style={{ color: COLOR_SUBTEXT }}>
              Your image now looks identical to you, but AI cannot recognize it
            </p>
          </motion.div>

          {/* Image Comparison Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* LEFT COLUMN - Original Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <section
                className="bg-white border rounded-2xl overflow-hidden"
                style={{ borderColor: COLOR_CARD_BORDER }}
                aria-label="Original Image"
              >
                <div className="p-4 border-b" style={{ borderColor: COLOR_CARD_BORDER }}>
                  <h2 className="text-lg" style={{ color: COLOR_HEADER_TEXT }}>
                    Original Image
                  </h2>
                </div>
                <div
                  className="p-6 flex items-center justify-center"
                  style={{ backgroundColor: COLOR_ORIG_BG, minHeight: '400px' }}
                >
                  <img
                    src={originalImage}
                    alt="Original"
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              </section>
            </motion.div>

            {/* RIGHT COLUMN - Masked Image (Protected) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <section
                className="bg-white border rounded-2xl overflow-hidden"
                style={{ borderColor: COLOR_CARD_BORDER }}
                aria-label="Masked Image (Protected)"
              >
                <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: COLOR_CARD_BORDER }}>
                  <h2 className="text-lg" style={{ color: COLOR_HEADER_TEXT }}>
                    {showNoise ? 'Noise Pattern (X-Ray Mode)' : 'Masked Image (Protected)'}
                  </h2>
                  {apiResponse.noise_map && (
                    <motion.button
                      onClick={() => setShowNoise(!showNoise)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors text-sm"
                      style={{ 
                        backgroundColor: showNoise ? COLOR_PRIMARY : '#FFFFFF',
                        borderColor: showNoise ? COLOR_PRIMARY : '#CBD5E1',
                        color: showNoise ? '#FFFFFF' : '#64748B'
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {showNoise ? (
                        <>
                          <EyeOff className="w-4 h-4" strokeWidth={2} />
                          <span>Hide Noise</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" strokeWidth={2} />
                          <span>X-Ray Mode</span>
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
                <div
                  className="p-6 flex items-center justify-center relative"
                  style={{ backgroundColor: COLOR_ORIG_BG, minHeight: '400px' }}
                >
                  <img
                    src={showNoise && apiResponse.noise_map ? `data:image/png;base64,${apiResponse.noise_map}` : protectedImage}
                    alt={showNoise ? "Noise Pattern" : "Protected"}
                    className="max-w-full h-auto rounded-lg"
                  />
                  {!showNoise && (
                    <motion.div
                      className="absolute top-3 right-3 px-3 py-1.5 rounded-full flex items-center gap-2"
                      style={{ backgroundColor: COLOR_PRIMARY }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      <Shield className="w-4 h-4" style={{ color: '#FFFFFF' }} strokeWidth={2} />
                      <span className="text-sm" style={{ color: '#FFFFFF' }}>Protected</span>
                    </motion.div>
                  )}
                </div>
              </section>
            </motion.div>
          </div>

          {/* Verification / Status Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <StatusCard
              icon={<X className="w-6 h-6" style={{ color: COLOR_STATUS1_ICON }} strokeWidth={2.5} />}
              bg={COLOR_STATUS1_BG}
              border={COLOR_STATUS1_BORDER}
              iconBg={COLOR_STATUS1_ICON_BG}
              title={`AI Confidence: ${cloakedConfidencePercent}%`}
              titleColor={COLOR_STATUS1_TEXT}
              subtitle={
                <>
                  <div className="font-semibold mb-1">Detected as: {apiResponse.cloaked_label}</div>
                  <div>Reduced from {originalConfidencePercent}% ({protectionEffectiveness}% reduction)</div>
                  <div className="text-xs mt-1 opacity-75">Original: {apiResponse.original_label}</div>
                </>
              }
              subtitleColor={COLOR_STATUS1_SUB}
              delay={0.5}
            />
            <StatusCard
              icon={<Check className="w-6 h-6" style={{ color: COLOR_STATUS2_ICON }} strokeWidth={2.5} />}
              bg={COLOR_STATUS2_BG}
              border={COLOR_STATUS2_BORDER}
              iconBg={COLOR_STATUS2_ICON_BG}
              title="Human Quality: Looks the Same"
              titleColor={COLOR_STATUS2_TEXT}
              subtitle="Visually identical to the original"
              subtitleColor={COLOR_STATUS2_SUB}
              delay={0.6}
            />
          </div>

          {/* Action Buttons Section */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            {/* PRIMARY BUTTON - Download */}
            <motion.button
              onClick={handleDownload}
              className="px-8 py-3 rounded-lg flex items-center gap-2 text-lg min-w-[260px] justify-center"
              style={{ backgroundColor: COLOR_PRIMARY, color: '#FFFFFF' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Download className="w-5 h-5" strokeWidth={2} />
              Download Protected Image
            </motion.button>

            {/* SECONDARY BUTTON - Try Another */}
            <motion.button
              onClick={onTryAnother}
              className="px-8 py-3 rounded-lg flex items-center gap-2 text-lg min-w-[260px] justify-center border-2"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', color: '#334155' }}
              whileHover={{ scale: 1.03, borderColor: COLOR_PRIMARY, color: COLOR_PRIMARY }}
              whileTap={{ scale: 0.97 }}
            >
              <Upload className="w-5 h-5" strokeWidth={2} />
              Try Another Image
            </motion.button>
          </motion.div>

          {/* Bottom Info */}
          <motion.div
            className="mt-12 max-w-3xl mx-auto p-6 rounded-xl flex items-start gap-4"
            style={{ backgroundColor: COLOR_CARD_BG, border: `1px solid ${COLOR_CARD_BORDER}` }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Shield className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: COLOR_PRIMARY }} strokeWidth={1.5} />
            <div>
              <p style={{ color: COLOR_HEADER_TEXT, fontWeight: 600, marginBottom: '0.25rem' }}>
                How does this work?
              </p>
              <p style={{ color: COLOR_SUBTEXT, fontSize: '0.9rem' }}>
                MaskMe applies imperceptible adversarial perturbations to your image.
                These changes are invisible to the human eye but effectively prevent AI-based
                facial recognition systems from identifying you, protecting your privacy in digital spaces.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
