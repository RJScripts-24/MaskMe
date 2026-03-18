import { Shield, Upload, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import ProcessingScreen from './ProcessingScreen';
import ResultScreen from './ResultScreen';
import { cloakImage, ApiError } from '../services/api';
import { ShieldResponse } from '../types/api';

interface UploadPageProps {
  onBack: () => void;
}

export default function UploadPage({ onBack }: UploadPageProps) {
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <header className="bg-white border-b" style={{ borderColor: '#E2E8F0' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6" style={{ color: '#2563EB' }} />
            <span className="text-xl" style={{ color: '#0F172A' }}>MaskMe</span>
          </div>
          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 transition-colors"
            style={{ color: '#64748B' }}
            whileHover={{ color: '#2563EB' }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-16 px-6">
        {/* Animated background elements */}
        <motion.div
          className="fixed top-20 left-10 w-40 h-40 rounded-full blur-3xl opacity-5 pointer-events-none"
          style={{ backgroundColor: '#2563EB' }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.08, 0.05]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="fixed bottom-20 right-10 w-56 h-56 rounded-full blur-3xl opacity-5 pointer-events-none"
          style={{ backgroundColor: '#2563EB' }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.05, 0.08, 0.05]
          }}
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
            <h1 className="text-4xl mb-3" style={{ color: '#0F172A' }}>
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
                className={`bg-white border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center min-h-[400px] transition-all duration-300 ${isDragging ? 'border-[#2563EB] bg-[#EFF6FF]' : ''
                  }`}
                style={{
                  borderColor: isDragging ? '#2563EB' : '#CBD5E1',
                  backgroundColor: isDragging ? '#EFF6FF' : '#FFFFFF'
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
                          style={{ color: '#2563EB', opacity: 0.6 }}
                          strokeWidth={1.5}
                        />
                      </motion.div>

                      <h2 className="text-2xl mb-6" style={{ color: '#0F172A' }}>
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

                      <p className="text-sm" style={{ color: '#64748B' }}>
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
                          className="mb-6 p-4 rounded-lg"
                          style={{
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0'
                          }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <label
                              htmlFor="stealth-slider"
                              className="text-sm font-medium"
                              style={{ color: '#334155' }}
                            >
                              Stealth Strength
                            </label>
                            <span
                              className="text-sm font-mono px-2 py-1 rounded"
                              style={{
                                backgroundColor: '#EFF6FF',
                                color: '#2563EB',
                                border: '1px solid #BFDBFE'
                              }}
                            >
                              {epsilon.toFixed(2)}
                            </span>
                          </div>
                          <input
                            id="stealth-slider"
                            type="range"
                            min="0.00"
                            max="0.10"
                            step="0.01"
                            value={epsilon}
                            onChange={(e) => setEpsilon(parseFloat(e.target.value))}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #2563EB 0%, #2563EB ${(epsilon / 0.10) * 100}%, #E2E8F0 ${(epsilon / 0.10) * 100}%, #E2E8F0 100%)`
                            }}
                          />
                          <div className="flex justify-between mt-2">
                            <span className="text-xs" style={{ color: '#64748B' }}>Subtle</span>
                            <span className="text-xs" style={{ color: '#64748B' }}>Strong</span>
                          </div>
                          <p className="text-xs mt-2" style={{ color: '#64748B' }}>
                            Higher values provide stronger protection but may be more noticeable
                          </p>
                        </motion.div>
                      )}

                      {/* Attack Method Dropdown */}
                      {!protectedImage && (
                        <motion.div
                          className="mb-6 p-4 rounded-lg"
                          style={{
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0'
                          }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                        >
                          <label
                            htmlFor="attack-method"
                            className="text-sm font-medium mb-3 block"
                            style={{ color: '#334155' }}
                          >
                            Attack Algorithm
                          </label>
                          <select
                            id="attack-method"
                            value={attackMethod}
                            onChange={(e) => setAttackMethod(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border appearance-none cursor-pointer transition-colors"
                            style={{
                              backgroundColor: '#FFFFFF',
                              borderColor: '#E2E8F0',
                              color: '#0F172A'
                            }}
                          >
                            <option value="FGSM">⚡ FGSM (Speed)</option>
                            <option value="PGD">💪 PGD (Power)</option>
                          </select>
                          <p className="text-xs mt-2" style={{ color: '#64748B' }}>
                            FGSM is fast (single-step), PGD is more powerful (iterative)
                          </p>
                        </motion.div>
                      )}

                      {!protectedImage && (
                        <motion.button
                          onClick={handleMaskClick}
                          className="w-full py-3 rounded-lg mb-3 transition-all"
                          style={{
                            backgroundColor: '#2563EB',
                            color: '#FFFFFF'
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <span className="flex items-center justify-center gap-2">
                            <Shield className="w-5 h-5" strokeWidth={2} />
                            Mask Photo
                          </span>
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
                        className="w-full px-6 py-2 rounded-lg transition-colors"
                        style={{
                          backgroundColor: '#F1F5F9',
                          color: '#334155',
                          border: '1px solid #E2E8F0'
                        }}
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
                <Shield className="w-5 h-5" style={{ color: '#2563EB' }} strokeWidth={1.5} />
                <p className="text-sm" style={{ color: '#64748B' }}>
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
                className="rounded-2xl p-12 flex flex-col items-center justify-center min-h-[400px] border"
                style={{
                  backgroundColor: '#F1F5F9',
                  borderColor: '#E2E8F0'
                }}
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
                      <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: '#2563EB' }} strokeWidth={1.5} />
                    </motion.div>
                    <p style={{ color: '#334155' }}>Processing your image...</p>
                    <p className="text-sm mt-2" style={{ color: '#64748B' }}>
                      Applying privacy protection
                    </p>
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
                        style={{ backgroundColor: '#2563EB' }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Shield className="w-4 h-4" style={{ color: '#FFFFFF' }} strokeWidth={2} />
                        <span className="text-sm" style={{ color: '#FFFFFF' }}>Protected</span>
                      </motion.div>
                    </div>

                    <motion.button
                      className="w-full py-3 rounded-lg transition-all"
                      style={{
                        backgroundColor: '#2563EB',
                        color: '#FFFFFF'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Download Protected Image
                    </motion.button>

                    <p className="text-sm mt-4 text-center" style={{ color: '#64748B' }}>
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
                      className="w-24 h-24 mx-auto mb-4 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: '#E2E8F0' }}
                    >
                      <Shield
                        className="w-12 h-12"
                        style={{ color: '#64748B', opacity: 0.4 }}
                        strokeWidth={1.5}
                      />
                    </div>
                    <p style={{ color: '#64748B' }}>
                      Protected image will appear here
                    </p>
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
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                    <p className="text-sm" style={{ color: '#64748B' }}>Visual Quality</p>
                    <p style={{ color: '#0F172A' }}>Unchanged</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                    <p className="text-sm" style={{ color: '#64748B' }}>AI Protection</p>
                    <p style={{ color: '#2563EB' }}>Active</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Bottom Info Banner */}
          <motion.div
            className="mt-16 max-w-4xl mx-auto p-6 rounded-xl flex items-center justify-center gap-4"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Shield className="w-6 h-6" style={{ color: '#2563EB' }} strokeWidth={1.5} />
            <div>
              <p style={{ color: '#334155' }}>
                <strong>Your privacy matters.</strong> Images are processed securely and are never saved on our servers.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}