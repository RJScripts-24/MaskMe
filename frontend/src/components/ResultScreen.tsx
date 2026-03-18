
import { Shield, X, Check, Download, Upload, Eye, EyeOff, FileText, Zap, MessageCircle, Wind, Globe, LogOut, ArrowLeft, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { ShieldResponse, VerifyResponse } from '../types/api';
import { useState } from 'react';
import { testRobustness, verifyMasking } from '../services/api';

// Shared color constants - DARK THEME (matching landing page)
const COLOR_PRIMARY = '#8b5cf6';
const COLOR_BG = '#0a0a0a';
const COLOR_BORDER = 'rgba(255,255,255,0.06)';
const COLOR_HEADER_TEXT = '#ffffff';
const COLOR_SUBTEXT = '#a1a1aa';
const COLOR_CARD_BG = '#111111';
const COLOR_CARD_BORDER = 'rgba(255,255,255,0.06)';
const COLOR_ORIG_BG = '#0d0d0d';
const COLOR_STATUS1_BG = 'rgba(239,68,68,0.08)';
const COLOR_STATUS1_BORDER = 'rgba(239,68,68,0.2)';
const COLOR_STATUS1_ICON_BG = 'rgba(239,68,68,0.12)';
const COLOR_STATUS1_ICON = '#f87171';
const COLOR_STATUS1_TEXT = '#f87171';
const COLOR_STATUS1_SUB = '#fca5a5';
const COLOR_STATUS2_BG = 'rgba(16,185,129,0.08)';
const COLOR_STATUS2_BORDER = 'rgba(16,185,129,0.2)';
const COLOR_STATUS2_ICON_BG = 'rgba(16,185,129,0.12)';
const COLOR_STATUS2_ICON = '#34d399';
const COLOR_STATUS2_TEXT = '#34d399';
const COLOR_STATUS2_SUB = '#6ee7b7';

interface ResultScreenProps {
  originalImage: string;
  protectedImage: string;
  apiResponse: ShieldResponse;
  user: { name: string; email: string; picture: string } | null;
  onTryAnother: () => void;
  onBack: () => void;
  onLogout: () => void;
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

export default function ResultScreen({ originalImage, protectedImage, apiResponse, user, onTryAnother, onBack, onLogout }: ResultScreenProps) {
  // State for X-Ray Mode toggle
  const [showNoise, setShowNoise] = useState(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);

  // State for Robustness Lab
  const [testResult, setTestResult] = useState<{
    type: string;
    label: string;
    confidence: number;
    image: string;
    survived: boolean;
  } | null>(null);
  const [isTestingRobustness, setIsTestingRobustness] = useState(false);

  // State for Verify Masking
  const [verificationResult, setVerificationResult] = useState<VerifyResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = protectedImage;
    link.download = 'masked-image-protected.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadReport = async () => {
    try {
      setIsDownloadingReport(true);

      // Get API base URL from environment or default to localhost
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

      // Prepare the request data
      const reportData = {
        original_image: originalImage,
        cloaked_image: protectedImage,
        original_label: apiResponse.original_label,
        cloaked_label: apiResponse.cloaked_label,
        original_confidence: apiResponse.original_confidence,
        cloaked_confidence: apiResponse.cloaked_confidence
      };

      // Prepare headers
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Send POST request to backend with full URL
      const response = await fetch(`${API_BASE_URL}/api/v1/shield/report`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create a temporary URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit_report_${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to generate security certificate. Please try again.');
    } finally {
      setIsDownloadingReport(false);
    }
  };

  const handleRobustnessTest = async (testType: 'jpeg' | 'blur' | 'resize') => {
    try {
      setIsTestingRobustness(true);
      setTestResult(null);

      // Convert base64 protected image to File
      const response = await fetch(protectedImage);
      const blob = await response.blob();
      const file = new File([blob], 'cloaked-image.png', { type: 'image/png' });

      // Call the robustness test API
      const result = await testRobustness(file, testType);

      // Check if attack survived (label is still different from original)
      const survived = result.new_label !== apiResponse.original_label;

      setTestResult({
        type: testType,
        label: result.new_label,
        confidence: result.new_confidence,
        image: `data:image/png;base64,${result.transformed_image}`,
        survived
      });

    } catch (error) {
      console.error('Robustness test failed:', error);
      alert('Failed to run robustness test. Please try again.');
    } finally {
      setIsTestingRobustness(false);
    }
  };

  const handleVerifyMasking = async () => {
    try {
      setIsVerifying(true);
      setVerificationResult(null);

      // Convert base64 protected image to File
      const response = await fetch(protectedImage);
      const blob = await response.blob();
      const file = new File([blob], 'cloaked-image.png', { type: 'image/png' });

      // Call the verification API
      const result = await verifyMasking(file);
      setVerificationResult(result);
    } catch (error) {
      console.error('Verification failed:', error);
      alert('Failed to verify masking. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Format confidence scores as percentages
  const originalConfidencePercent = (apiResponse.original_confidence * 100).toFixed(1);
  const cloakedConfidencePercent = (apiResponse.cloaked_confidence * 100).toFixed(1);
  const protectionEffectiveness = ((apiResponse.original_confidence - apiResponse.cloaked_confidence) / apiResponse.original_confidence * 100).toFixed(1);
  const primaryName = (user?.name || user?.email || 'User').split(' ')[0];

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLOR_BG, color: '#ffffff', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Animated background elements */}
      <motion.div
        className="fixed top-20 left-10 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: '#8b5cf6', opacity: 0.04 }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="fixed bottom-20 right-10 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: '#8b5cf6', opacity: 0.03 }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.02, 0.05, 0.02] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.nav
        className="relative z-40"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          height: '72px',
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
            <Shield className="w-4 h-4" style={{ color: COLOR_PRIMARY }} />
          </div>
          <span className="text-lg font-semibold" style={{ color: COLOR_HEADER_TEXT }}>MaskMe</span>
        </motion.div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <motion.button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              backgroundColor: 'rgba(255,255,255,0.06)',
              color: '#e4e4e7',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.11)', scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <ArrowLeft size={16} />
            Back to Home
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
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
            whileHover={{ backgroundColor: 'rgba(239,68,68,0.2)', scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <LogOut size={16} />
            Sign Out
          </motion.button>
        </div>
      </motion.nav>

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
                className="border rounded-2xl overflow-hidden"
                style={{ borderColor: COLOR_CARD_BORDER, backgroundColor: COLOR_CARD_BG }}
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
                className="border rounded-2xl overflow-hidden"
                style={{ borderColor: COLOR_CARD_BORDER, backgroundColor: COLOR_CARD_BG }}
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
                        backgroundColor: showNoise ? COLOR_PRIMARY : 'rgba(255,255,255,0.05)',
                        borderColor: showNoise ? COLOR_PRIMARY : 'rgba(255,255,255,0.1)',
                        color: showNoise ? '#FFFFFF' : '#a1a1aa'
                      }}
                      whileHover={{ scale: 1.05, backgroundColor: showNoise ? COLOR_PRIMARY : 'rgba(255,255,255,0.1)' }}
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
                {/* Verify Masking Button */}
                <div className="px-6 py-4 border-t flex flex-col gap-3" style={{ borderColor: COLOR_CARD_BORDER, backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: COLOR_SUBTEXT }}>Verify against MobileNetV2</span>
                    <motion.button
                      onClick={handleVerifyMasking}
                      disabled={isVerifying}
                      className="flex items-center gap-2 transition-all"
                      style={{
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 600,
                        backgroundColor: isVerifying ? '#a1a1aa' : '#ddd6fe',
                        color: '#000000',
                        cursor: isVerifying ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                      }}
                      whileHover={!isVerifying ? { scale: 1.04, boxShadow: '0 8px 30px rgba(139,92,246,0.25)' } : {}}
                      whileTap={!isVerifying ? { scale: 0.97 } : {}}
                    >
                      {isVerifying ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" strokeWidth={2.5} />
                      )}
                      <span>{isVerifying ? 'VERIFYING...' : 'VERIFY MASKING'}</span>
                    </motion.button>
                  </div>

                  {verificationResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 rounded-[20px] border flex items-center gap-4 mt-2"
                      style={{
                        backgroundColor: verificationResult.label !== apiResponse.original_label ? 'rgba(16, 185, 129, 0.04)' : 'rgba(239, 68, 68, 0.04)',
                        borderColor: verificationResult.label !== apiResponse.original_label ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                      }}
                    >
                      <div className={`p-2 rounded-full flex-shrink-0 ${verificationResult.label !== apiResponse.original_label ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                        {verificationResult.label !== apiResponse.original_label ? (
                          <Check className="w-5 h-5 text-emerald-400" strokeWidth={2.5} />
                        ) : (
                          <X className="w-5 h-5 text-red-400" strokeWidth={2.5} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span style={{ color: '#a1a1aa', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                          Independent Model Analysis
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-sm font-semibold" style={{ color: verificationResult.label !== apiResponse.original_label ? '#34d399' : '#f87171' }}>
                            {verificationResult.label}
                          </span>
                          <span style={{ color: '#71717a', fontSize: '12px' }}>
                            ({verificationResult.confidence.toFixed(1)}% match)
                          </span>
                        </div>
                      </div>
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

          {apiResponse.transfer_assessment && (
            <motion.div
              className="mb-10 p-5 rounded-xl border"
              style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <h3 className="text-base font-semibold" style={{ color: COLOR_HEADER_TEXT }}>
                  Cross-Model Leakage Estimate (Strict Mode)
                </h3>
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold uppercase"
                  style={{
                    backgroundColor:
                      apiResponse.transfer_assessment.level === 'low'
                        ? 'rgba(16,185,129,0.18)'
                        : apiResponse.transfer_assessment.level === 'medium'
                        ? 'rgba(245,158,11,0.18)'
                        : 'rgba(239,68,68,0.18)',
                    color:
                      apiResponse.transfer_assessment.level === 'low'
                        ? '#34d399'
                        : apiResponse.transfer_assessment.level === 'medium'
                        ? '#fbbf24'
                        : '#f87171',
                  }}
                >
                  Risk {apiResponse.transfer_assessment.score.toFixed(1)} / 100
                </span>
              </div>
              <p className="text-sm mb-4" style={{ color: COLOR_SUBTEXT }}>
                {apiResponse.transfer_assessment.note}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(apiResponse.transfer_assessment.models).map(([name, modelInfo]) => (
                  <div
                    key={name}
                    className="rounded-lg p-3"
                    style={{ backgroundColor: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#a1a1aa' }}>
                      {name.replace('_', ' ')}
                    </p>
                    <p className="text-sm font-semibold" style={{ color: '#e4e4e7' }}>
                      Top-1: {modelInfo.top1_label} ({modelInfo.top1_confidence.toFixed(1)}%)
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#71717a' }}>
                      Original-label confidence: {modelInfo.original_label_confidence.toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

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
              className="px-8 py-4 rounded-[12px] flex items-center gap-3 text-base min-w-[260px] justify-center font-semibold"
              style={{ backgroundColor: COLOR_PRIMARY, color: '#FFFFFF', boxShadow: '0 8px 30px rgba(139,92,246,0.2)' }}
              whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(139,92,246,0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              <Download className="w-5 h-5" strokeWidth={2.5} />
              <span>DOWNLOAD PROTECTED</span>
            </motion.button>

            {/* SECONDARY BUTTON - Download Report */}
            <motion.button
              onClick={handleDownloadReport}
              disabled={isDownloadingReport}
              className="px-8 py-4 rounded-[12px] flex items-center gap-3 text-base min-w-[260px] justify-center border-2 font-semibold"
              style={{
                backgroundColor: isDownloadingReport ? 'rgba(255,255,255,0.03)' : 'rgba(16, 185, 129, 0.05)',
                borderColor: isDownloadingReport ? 'rgba(255,255,255,0.05)' : '#10b981',
                color: isDownloadingReport ? '#71717a' : '#34d399',
                cursor: isDownloadingReport ? 'not-allowed' : 'pointer'
              }}
              whileHover={!isDownloadingReport ? { scale: 1.04, backgroundColor: 'rgba(16, 185, 129, 0.1)' } : {}}
              whileTap={!isDownloadingReport ? { scale: 0.97 } : {}}
            >
              <FileText className="w-5 h-5" strokeWidth={2.5} />
              <span>{isDownloadingReport ? 'GENERATING...' : 'AUDIT REPORT'}</span>
            </motion.button>

            {/* TERTIARY BUTTON - Try Another */}
            <motion.button
              onClick={onTryAnother}
              className="px-8 py-4 rounded-[12px] flex items-center gap-3 text-base min-w-[260px] justify-center border-2 font-semibold"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: '#ffffff' }}
              whileHover={{ scale: 1.04, borderColor: COLOR_PRIMARY, backgroundColor: 'rgba(255,255,255,0.06)' }}
              whileTap={{ scale: 0.97 }}
            >
              <Upload className="w-5 h-5" strokeWidth={2.5} />
              <span>TRY ANOTHER IMAGE</span>
            </motion.button>
          </motion.div>

          {/* Robustness Lab Section */}
          <motion.div
            className="mt-12 max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="p-6 rounded-xl border-2" style={{ backgroundColor: COLOR_CARD_BG, borderColor: '#A78BFA' }}>
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6" style={{ color: '#7C3AED' }} strokeWidth={2} />
                <h3 className="text-xl font-semibold" style={{ color: COLOR_HEADER_TEXT }}>
                  🧪 Robustness Lab - Simulate Real World Conditions
                </h3>
              </div>

              <p className="mb-6" style={{ color: COLOR_SUBTEXT }}>
                Test if your attack survives real-world transformations like compression, blur, and resize operations.
              </p>

              {/* Test Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <motion.button
                  onClick={() => handleRobustnessTest('jpeg')}
                  disabled={isTestingRobustness}
                  className="px-6 py-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all"
                  style={{
                    backgroundColor: testResult?.type === 'jpeg' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.03)',
                    borderColor: testResult?.type === 'jpeg' ? '#F59E0B' : 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    cursor: isTestingRobustness ? 'not-allowed' : 'pointer',
                    opacity: isTestingRobustness ? 0.6 : 1
                  }}
                  whileHover={!isTestingRobustness ? { scale: 1.02, borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.05)' } : {}}
                  whileTap={!isTestingRobustness ? { scale: 0.98 } : {}}
                >
                  <MessageCircle className="w-6 h-6" style={{ color: '#F59E0B' }} strokeWidth={2} />
                  <span className="font-semibold text-sm">📱 Simulate WhatsApp</span>
                  <span className="text-[10px] uppercase tracking-wider opacity-60">JPEG Compression</span>
                </motion.button>

                <motion.button
                  onClick={() => handleRobustnessTest('blur')}
                  disabled={isTestingRobustness}
                  className="px-6 py-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all"
                  style={{
                    backgroundColor: testResult?.type === 'blur' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.03)',
                    borderColor: testResult?.type === 'blur' ? '#6366F1' : 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    cursor: isTestingRobustness ? 'not-allowed' : 'pointer',
                    opacity: isTestingRobustness ? 0.6 : 1
                  }}
                  whileHover={!isTestingRobustness ? { scale: 1.02, borderColor: '#6366F1', backgroundColor: 'rgba(99, 102, 241, 0.05)' } : {}}
                  whileTap={!isTestingRobustness ? { scale: 0.98 } : {}}
                >
                  <Wind className="w-6 h-6" style={{ color: '#6366F1' }} strokeWidth={2} />
                  <span className="font-semibold text-sm">🌫️ Simulate Motion</span>
                  <span className="text-[10px] uppercase tracking-wider opacity-60">Gaussian Blur</span>
                </motion.button>

                <motion.button
                  onClick={() => handleRobustnessTest('resize')}
                  disabled={isTestingRobustness}
                  className="px-6 py-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all"
                  style={{
                    backgroundColor: testResult?.type === 'resize' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.03)',
                    borderColor: testResult?.type === 'resize' ? '#3B82F6' : 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    cursor: isTestingRobustness ? 'not-allowed' : 'pointer',
                    opacity: isTestingRobustness ? 0.6 : 1
                  }}
                  whileHover={!isTestingRobustness ? { scale: 1.02, borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.05)' } : {}}
                  whileTap={!isTestingRobustness ? { scale: 0.98 } : {}}
                >
                  <Globe className="w-6 h-6" style={{ color: '#3B82F6' }} strokeWidth={2} />
                  <span className="font-semibold text-sm">🌐 Simulate Social</span>
                  <span className="text-[10px] uppercase tracking-wider opacity-60">Downscale/Upscale</span>
                </motion.button>
              </div>

              {/* Test Results */}
              {isTestingRobustness && (
                <motion.div
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: '#F1F5F9' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p style={{ color: COLOR_SUBTEXT }}>Running test...</p>
                </motion.div>
              )}

              {testResult && !isTestingRobustness && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-lg border-2"
                  style={{
                    backgroundColor: testResult.survived ? COLOR_STATUS2_BG : COLOR_STATUS1_BG,
                    borderColor: testResult.survived ? COLOR_STATUS2_BORDER : COLOR_STATUS1_BORDER
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {testResult.survived ? (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: COLOR_STATUS2_ICON_BG }}>
                          <Check className="w-6 h-6" style={{ color: COLOR_STATUS2_ICON }} strokeWidth={2.5} />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: COLOR_STATUS1_ICON_BG }}>
                          <X className="w-6 h-6" style={{ color: COLOR_STATUS1_ICON }} strokeWidth={2.5} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-2" style={{ color: testResult.survived ? COLOR_STATUS2_TEXT : COLOR_STATUS1_TEXT }}>
                        {testResult.survived ? '✅ Attack Survived (Robust)' : '❌ Attack Failed (Reverted)'}
                      </h4>
                      <div className="text-sm mb-3" style={{ color: COLOR_SUBTEXT }}>
                        <p className="mb-1">
                          <strong>After Simulation:</strong> {testResult.label} ({(testResult.confidence * 100).toFixed(1)}%)
                        </p>
                        <p>
                          <strong>Original Label:</strong> {apiResponse.original_label}
                        </p>
                      </div>
                      {testResult.survived ? (
                        <p className="text-sm" style={{ color: COLOR_STATUS2_SUB }}>
                          The adversarial attack is robust and survived the {testResult.type === 'jpeg' ? 'compression' : testResult.type === 'blur' ? 'blur' : 'resize'} transformation!
                        </p>
                      ) : (
                        <p className="text-sm" style={{ color: COLOR_STATUS1_SUB }}>
                          The attack was removed by the {testResult.type === 'jpeg' ? 'compression' : testResult.type === 'blur' ? 'blur' : 'resize'} transformation. AI can now detect the original label again.
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <img
                        src={testResult.image}
                        alt="Transformed"
                        className="w-32 h-32 object-cover rounded-lg border"
                        style={{ borderColor: COLOR_BORDER }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
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
