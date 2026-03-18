import { Shield, Upload, ArrowLeft, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import ProcessingScreen from './ProcessingScreen';
import ResultScreen from './ResultScreen';
import { cloakImage, ApiError } from '../services/api';
import { ShieldResponse } from '../types/api';

interface UploadPageProps {
  user: { name: string; email: string; picture: string } | null;
  onBack: () => void;
  onLogout: () => void;
}

export default function UploadPage({ user, onBack, onLogout }: UploadPageProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [protectedImage, setProtectedImage] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<ShieldResponse | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProcessingScreen, setShowProcessingScreen] = useState(false);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [epsilon, setEpsilon] = useState<number>(0.03);
  const [attackMethod, setAttackMethod] = useState<string>("FGSM");

  // If result screen should be shown
  if (showResultScreen && uploadedImage && protectedImage && apiResponse) {
    return (
      <ResultScreen
        originalImage={uploadedImage}
        protectedImage={protectedImage}
        apiResponse={apiResponse}
        user={user}
        onTryAnother={() => {
          setShowResultScreen(false);
          setUploadedImage(null);
          setUploadedFile(null);
          setProtectedImage(null);
          setApiResponse(null);
          setIsProcessing(false);
          setError(null);
        }}
        onBack={onBack}
        onLogout={onLogout}
      />
    );
  }

  // If processing screen should be shown
  if (showProcessingScreen && uploadedFile) {
    return (
      <ProcessingScreen
        file={uploadedFile}
        epsilon={epsilon}
        attackMethod={attackMethod}
        user={user}
        onBack={onBack}
        onLogout={onLogout}
        onComplete={(response) => {
          setShowProcessingScreen(false);
          setApiResponse(response);
          // Convert base64 image from response to data URL
          setProtectedImage(`data:image/png;base64,${response.cloaked_image}`);
          setShowResultScreen(true);
        }}
        onError={(errorMessage) => {
          setShowProcessingScreen(false);
          setError(errorMessage);
          setIsProcessing(false);
        }}
      />
    );
  }

  const handleFileSelect = (file: File) => {
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        setUploadedFile(file);
        setError(null); // Clear any previous errors
        // Don't process immediately - wait for user to click "Mask" button
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please upload a valid JPEG or PNG image.');
    }
  };

  const handleMaskClick = () => {
    if (uploadedFile) {
      setShowProcessingScreen(true);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const primaryName = (user?.name || user?.email || 'User').split(' ')[0];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a', color: '#ffffff', fontFamily: "'Inter', system-ui, sans-serif" }}>
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
            <Shield className="w-4 h-4" style={{ color: '#8b5cf6' }} />
          </div>
          <span className="text-lg font-semibold">MaskMe</span>
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
        {/* Animated background elements */}
        <motion.div
          className="fixed top-20 left-10 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: '#8b5cf6', opacity: 0.04 }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="fixed bottom-20 right-10 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: '#8b5cf6', opacity: 0.03 }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.02, 0.05, 0.02] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {user && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                Welcome back, {primaryName}
              </motion.div>
            )}
            <h1 className="text-4xl mb-3 font-semibold" style={{ color: '#ffffff' }}>
              Upload & Protect Your Photo
            </h1>
            <p style={{ color: '#64748B' }}>
              Your image is processed securely and never stored on our servers
            </p>
            {error && (
              <motion.div
                className="mt-4 mx-auto max-w-lg p-4 rounded-lg border"
                style={{
                  backgroundColor: '#FEF2F2',
                  borderColor: '#FECACA',
                  color: '#DC2626'
                }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-sm">{error}</p>
              </motion.div>
            )}
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* LEFT COLUMN - Upload Area */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div
                className="border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center min-h-[400px] transition-all duration-300"
                style={{
                  borderColor: isDragging ? '#8b5cf6' : 'rgba(255,255,255,0.08)',
                  backgroundColor: isDragging ? 'rgba(139,92,246,0.05)' : '#111111'
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <motion.div
                  className="text-center"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  {!uploadedImage ? (
                    <>
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Upload
                          className="w-16 h-16 mx-auto mb-6"
                          style={{ color: '#8b5cf6', opacity: 0.7 }}
                          strokeWidth={1}
                        />
                      </motion.div>

                      <h2 className="text-2xl mb-6 font-medium" style={{ color: '#ffffff' }}>
                        Upload a face photo
                      </h2>

                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={handleBrowse}
                          className="hidden"
                        />
                        <div
                          className="px-8 py-3 rounded-lg transition-colors mb-4"
                          style={{
                            backgroundColor: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                            color: '#334155'
                          }}
                        >
                          Drag & Drop or Browse
                        </div>
                      </label>

                      <p className="text-sm" style={{ color: '#71717a' }}>
                        JPG / PNG only
                      </p>
                    </>
                  ) : (
                    <div className="w-full">
                      <img
                        src={uploadedImage}
                        alt="Uploaded"
                        className="w-full h-auto rounded-lg mb-6"
                      />

                      {/* Stealth Slider */}
                      {!protectedImage && (
                        <motion.div
                          className="mb-6 p-4 rounded-xl"
                          style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <label htmlFor="stealth-slider" className="text-sm font-medium" style={{ color: '#a1a1aa' }}>
                              Stealth Strength
                            </label>
                            <span className="text-sm font-mono px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: '#ddd6fe', border: '1px solid rgba(139,92,246,0.2)' }}>
                              {epsilon.toFixed(2)}
                            </span>
                          </div>
                          <input
                            id="stealth-slider"
                            type="range" min="0.00" max="0.10" step="0.01" value={epsilon}
                            onChange={(e) => setEpsilon(parseFloat(e.target.value))}
                            className="w-full h-1 rounded-lg appearance-none cursor-pointer"
                            style={{ background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(epsilon / 0.10) * 100}%, rgba(255,255,255,0.1) ${(epsilon / 0.10) * 100}%, rgba(255,255,255,0.1) 100%)` }}
                          />
                          <div className="flex justify-between mt-2">
                            <span className="text-xs" style={{ color: '#525252' }}>Subtle</span>
                            <span className="text-xs" style={{ color: '#525252' }}>Strong</span>
                          </div>
                          <p className="text-xs mt-2" style={{ color: '#525252' }}>Higher values provide stronger protection but may be more noticeable</p>
                        </motion.div>
                      )}

                      {/* Attack Method Dropdown */}
                      {!protectedImage && (
                        <motion.div
                          className="mb-6 p-4 rounded-xl"
                          style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                        >
                          <label htmlFor="attack-method" className="text-sm font-medium mb-3 block" style={{ color: '#a1a1aa' }}>Attack Algorithm</label>
                          <select
                            id="attack-method"
                            value={attackMethod}
                            onChange={(e) => setAttackMethod(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border appearance-none cursor-pointer transition-colors"
                            style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.1)', color: '#ffffff' }}
                          >
                            <option value="FGSM" style={{ backgroundColor: '#1a1a1a' }}>⚡ FGSM (Speed)</option>
                            <option value="PGD" style={{ backgroundColor: '#1a1a1a' }}>💪 PGD (Power)</option>
                          </select>
                          <p className="text-xs mt-2" style={{ color: '#525252' }}>FGSM is fast (single-step), PGD is more powerful (iterative)</p>
                        </motion.div>
                      )}

                      {!protectedImage && (
                        <motion.button
                          onClick={handleMaskClick}
                          className="w-full py-3 rounded-xl mb-3 font-semibold text-sm transition-all flex items-center justify-center gap-2"
                          style={{ backgroundColor: '#ddd6fe', color: '#000000' }}
                          whileHover={{ scale: 1.02, backgroundColor: '#c4b5fd' }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Shield className="w-5 h-5" strokeWidth={2} />
                          Mask Photo
                        </motion.button>
                      )}

                      <button
                        onClick={() => {
                          setUploadedImage(null);
                          setUploadedFile(null);
                          setProtectedImage(null);
                          setApiResponse(null);
                          setError(null);
                        }}
                        className="w-full px-6 py-2 rounded-xl transition-colors text-sm"
                        style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        Upload Different Image
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Helper Text Below Upload */}
              <motion.div
                className="mt-6 flex items-center gap-2 justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Shield className="w-4 h-4" style={{ color: '#8b5cf6' }} strokeWidth={1.5} />
                <p className="text-sm" style={{ color: '#71717a' }}>
                  Your privacy is protected. Images are processed locally when possible.
                </p>
              </motion.div>
            </motion.div>

            {/* RIGHT COLUMN - Preview Area */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div
                className="rounded-2xl p-12 flex flex-col items-center justify-center min-h-[400px]"
                style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {isProcessing ? (
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: '#8b5cf6' }} strokeWidth={1} />
                    </motion.div>
                    <p style={{ color: '#ffffff' }}>Processing your image...</p>
                    <p className="text-sm mt-2" style={{ color: '#71717a' }}>Applying privacy protection</p>
                  </motion.div>
                ) : protectedImage ? (
                  <motion.div
                    className="w-full"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="relative mb-6">
                      <img
                        src={protectedImage}
                        alt="Protected"
                        className="w-full h-auto rounded-lg"
                      />
                      <motion.div
                        className="absolute top-3 right-3 px-3 py-1.5 rounded-full flex items-center gap-2"
                        style={{ backgroundColor: '#8b5cf6' }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Shield className="w-4 h-4" style={{ color: '#ffffff' }} strokeWidth={2} />
                        <span className="text-xs font-bold" style={{ color: '#ffffff' }}>PROTECTED</span>
                      </motion.div>
                    </div>

                    <motion.button
                      className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
                      style={{ backgroundColor: '#ddd6fe', color: '#000000' }}
                      whileHover={{ scale: 1.02, backgroundColor: '#c4b5fd' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Download Protected Image
                    </motion.button>

                    <p className="text-sm mt-4 text-center" style={{ color: '#71717a' }}>
                      Looks the same to you, but AI can't recognize it
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <div
                      className="w-24 h-24 mx-auto mb-4 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}
                    >
                      <Shield className="w-12 h-12" style={{ color: '#8b5cf6', opacity: 0.5 }} strokeWidth={1} />
                    </div>
                    <p style={{ color: '#71717a' }}>Protected image will appear here</p>
                  </motion.div>
                )}
              </div>

              {/* Info Cards Below Preview */}
              {protectedImage && (
                <motion.div
                  className="mt-6 grid grid-cols-2 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs mb-1" style={{ color: '#71717a' }}>Visual Quality</p>
                    <p className="font-medium" style={{ color: '#ffffff' }}>Unchanged</p>
                  </div>
                  <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs mb-1" style={{ color: '#71717a' }}>AI Protection</p>
                    <p className="font-medium" style={{ color: '#ddd6fe' }}>Active ✓</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Bottom Info Banner */}
          <motion.div
            className="mt-16 max-w-4xl mx-auto p-6 rounded-2xl flex items-center gap-4"
            style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Shield className="w-6 h-6 flex-shrink-0" style={{ color: '#8b5cf6' }} strokeWidth={1.5} />
            <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
              <span style={{ color: '#ffffff', fontWeight: 500 }}>Your privacy matters.</span> Images are processed securely and are never saved on our servers.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}