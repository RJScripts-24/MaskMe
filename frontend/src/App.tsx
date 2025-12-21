import { Shield, Eye, Network, Clock, Upload, Download, Lock, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import UploadPage from './components/UploadPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'upload'>('home');

  if (currentPage === 'upload') {
    return <UploadPage onBack={() => setCurrentPage('home')} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <header className="bg-white border-b" style={{ borderColor: '#E2E8F0' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6" style={{ color: '#2563EB' }} />
            <span className="text-xl" style={{ color: '#0F172A' }}>MaskMe</span>
          </div>
          <nav className="flex gap-8">
            <a 
              href="#how-it-works" 
              className="transition-colors hover:text-[#2563EB]"
              style={{ color: '#64748B' }}
            >
              How It Works
            </a>
            <a 
              href="#privacy" 
              className="transition-colors hover:text-[#2563EB]"
              style={{ color: '#64748B' }}
            >
              Privacy
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        {/* Upper decorative animations */}
        <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none">
          {/* Top left animated icon group */}
          <motion.div
            className="absolute left-20 top-8"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 w-16 h-16 rounded-full blur-xl"
                  style={{ backgroundColor: '#2563EB', opacity: 0.2 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <Shield className="w-8 h-8 relative z-10" style={{ color: '#2563EB', opacity: 0.6 }} strokeWidth={1.5} />
              </div>
            </motion.div>
          </motion.div>

          {/* Top right animated icon group */}
          <motion.div
            className="absolute right-24 top-12"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div
              animate={{ 
                y: [0, 12, 0],
                rotate: [0, -8, 0]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 w-16 h-16 rounded-full blur-xl"
                  style={{ backgroundColor: '#2563EB', opacity: 0.2 }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
                <Lock className="w-7 h-7 relative z-10" style={{ color: '#2563EB', opacity: 0.5 }} strokeWidth={1.5} />
              </div>
            </motion.div>
          </motion.div>

          {/* Top center animated particles */}
          <div className="absolute left-1/2 top-4 transform -translate-x-1/2">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: '#2563EB',
                  left: `${(i - 2) * 40}px`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.7, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2.5 + i * 0.2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Floating network nodes */}
          <motion.div
            className="absolute left-1/4 top-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.15, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Network className="w-6 h-6" style={{ color: '#2563EB' }} strokeWidth={1.5} />
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute right-1/4 top-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <Eye className="w-5 h-5" style={{ color: '#2563EB' }} strokeWidth={1.5} />
            </motion.div>
          </motion.div>

          {/* Connecting lines between elements */}
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.1 }}>
            <motion.line
              x1="20%"
              y1="50%"
              x2="50%"
              y2="30%"
              stroke="#2563EB"
              strokeWidth="1"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 1 }}
            />
            <motion.line
              x1="80%"
              y1="60%"
              x2="50%"
              y2="30%"
              stroke="#2563EB"
              strokeWidth="1"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 1.2 }}
            />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center relative z-10">
            <motion.h1 
              className="text-6xl mb-6 tracking-tight max-w-4xl mx-auto"
              style={{ color: '#0F172A', lineHeight: '1.1', fontWeight: '700' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Protect Your Face from{' '}
              <span style={{ color: '#2563EB' }}>AI Tracking.</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl mb-8 max-w-2xl mx-auto"
              style={{ color: '#334155', lineHeight: '1.6' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Upload photos safely without breaking how you look.
            </motion.p>
            
            <motion.button 
              className="px-8 py-3 rounded-lg transition-all hover:shadow-lg"
              style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage('upload')}
            >
              Upload Photo
            </motion.button>
            
            <motion.div 
              className="mt-6 space-y-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <p className="text-sm" style={{ color: '#64748B' }}>
                Your image is processed securely.
              </p>
              <p className="text-sm" style={{ color: '#64748B' }}>
                No visual distortion.
              </p>
            </motion.div>
          </div>
          
          {/* Animated decorative elements */}
          <div className="mt-16 relative h-64">
            {/* Left side - Privacy Shield Animation */}
            <motion.div
              className="absolute left-10 top-0 w-64 h-64"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-full h-full"
              >
                {/* Glowing background circle */}
                <motion.div
                  className="absolute inset-0 rounded-full blur-3xl"
                  style={{ backgroundColor: '#2563EB', opacity: 0.15 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Main shield container */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="relative"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {/* Shield with lock */}
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <Shield 
                        className="w-full h-full" 
                        style={{ color: '#2563EB', opacity: 0.3 }} 
                        strokeWidth={1}
                      />
                      <motion.div
                        className="absolute"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      >
                        <Lock className="w-12 h-12" style={{ color: '#2563EB' }} strokeWidth={2} />
                      </motion.div>
                    </div>
                    
                    {/* Orbiting particles */}
                    {[0, 1, 2, 3].map((index) => (
                      <motion.div
                        key={index}
                        className="absolute w-3 h-3 rounded-full"
                        style={{ 
                          backgroundColor: '#2563EB',
                          top: '50%',
                          left: '50%',
                        }}
                        animate={{
                          x: [
                            Math.cos((index * Math.PI) / 2) * 60,
                            Math.cos((index * Math.PI) / 2 + Math.PI) * 60,
                          ],
                          y: [
                            Math.sin((index * Math.PI) / 2) * 60,
                            Math.sin((index * Math.PI) / 2 + Math.PI) * 60,
                          ],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "linear",
                          delay: index * 0.5,
                        }}
                      />
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right side - Face Protection Visualization */}
            <motion.div
              className="absolute right-10 top-0 w-64 h-64"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="relative w-full h-full"
              >
                {/* Glowing background circle */}
                <motion.div
                  className="absolute inset-0 rounded-full blur-3xl"
                  style={{ backgroundColor: '#2563EB', opacity: 0.15 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
                
                {/* Face protection visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div className="relative">
                    {/* Scanning lines effect */}
                    <motion.div
                      className="absolute inset-0 w-40 h-40 rounded-lg border-2"
                      style={{ borderColor: '#2563EB', opacity: 0.3 }}
                      animate={{
                        borderColor: ['#2563EB', '#64748B', '#2563EB'],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <motion.div
                        className="absolute w-full h-0.5"
                        style={{ backgroundColor: '#2563EB', opacity: 0.5 }}
                        animate={{
                          top: ['0%', '100%'],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </motion.div>
                    
                    {/* Center eye-off icon */}
                    <div className="w-40 h-40 flex items-center justify-center">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.15, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <EyeOff className="w-16 h-16" style={{ color: '#2563EB' }} strokeWidth={1.5} />
                      </motion.div>
                    </div>
                    
                    {/* Corner brackets */}
                    {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner, index) => (
                      <motion.div
                        key={corner}
                        className="absolute w-6 h-6 border-2"
                        style={{
                          borderColor: '#2563EB',
                          ...(corner === 'top-left' && { top: 0, left: 0, borderRight: 'none', borderBottom: 'none' }),
                          ...(corner === 'top-right' && { top: 0, right: 0, borderLeft: 'none', borderBottom: 'none' }),
                          ...(corner === 'bottom-left' && { bottom: 0, left: 0, borderRight: 'none', borderTop: 'none' }),
                          ...(corner === 'bottom-right' && { bottom: 0, right: 0, borderLeft: 'none', borderTop: 'none' }),
                        }}
                        animate={{
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.2,
                        }}
                      />
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            {/* Center floating particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: '#2563EB',
                    left: `${20 + i * 10}%`,
                    top: `${30 + (i % 3) * 20}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0, 0.6, 0],
                  }}
                  transition={{
                    duration: 3 + i * 0.3,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why MaskMe Section */}
      <section className="py-16 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-3xl text-center mb-12" 
            style={{ color: '#0F172A' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            Why MaskMe?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <motion.div 
              className="p-8 rounded-lg border relative overflow-hidden group"
              style={{ 
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgb(37 99 235 / 0.1)' }}
            >
              <motion.div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                style={{ backgroundColor: '#2563EB' }}
              />
              <Eye className="w-12 h-12 mb-4" style={{ color: '#2563EB' }} strokeWidth={1.5} />
              <h3 className="mb-3" style={{ color: '#0F172A' }}>
                Invisible Protection
              </h3>
              <p style={{ color: '#334155' }}>
                MaskMe cloaks your face so AI can't recognize you online—while keeping you looking the same to humans.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              className="p-8 rounded-lg border relative overflow-hidden group"
              style={{ 
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgb(37 99 235 / 0.1)' }}
            >
              <motion.div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                style={{ backgroundColor: '#2563EB' }}
              />
              <Network className="w-12 h-12 mb-4" style={{ color: '#2563EB' }} strokeWidth={1.5} />
              <h3 className="mb-3" style={{ color: '#0F172A' }}>
                Defense Against AI Face-Scraping
              </h3>
              <p style={{ color: '#334155' }}>
                Shield your photos from invasive facial recognition used by social networks, advertisers, and data brokers.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              className="p-8 rounded-lg border relative overflow-hidden group"
              style={{ 
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgb(37 99 235 / 0.1)' }}
            >
              <motion.div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                style={{ backgroundColor: '#2563EB' }}
              />
              <Clock className="w-12 h-12 mb-4" style={{ color: '#2563EB' }} strokeWidth={1.5} />
              <h3 className="mb-3" style={{ color: '#0F172A' }}>
                Simple & Fast
              </h3>
              <p style={{ color: '#334155' }}>
                Upload a photo, let MaskMe do the work in seconds, and download your protected image.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-6 relative overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
        {/* Animated background elements */}
        <motion.div
          className="absolute top-20 left-10 w-40 h-40 rounded-full blur-3xl opacity-5"
          style={{ backgroundColor: '#2563EB' }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.08, 0.05]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-56 h-56 rounded-full blur-3xl opacity-5"
          style={{ backgroundColor: '#2563EB' }}
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.05, 0.08, 0.05]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.h2 
            className="text-3xl text-center mb-12" 
            style={{ color: '#0F172A' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            How It Works
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Dotted connectors */}
            <motion.div 
              className="hidden md:block absolute top-20 left-1/3 w-1/3 border-t-2 border-dotted" 
              style={{ borderColor: '#CBD5E1' }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
            <motion.div 
              className="hidden md:block absolute top-20 right-0 w-1/3 border-t-2 border-dotted" 
              style={{ borderColor: '#CBD5E1' }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            />

            {/* Step 1 */}
            <motion.div 
              className="p-8 rounded-lg border text-center relative z-10 group"
              style={{ 
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0'
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -8, boxShadow: '0 10px 25px -5px rgb(37 99 235 / 0.15)' }}
            >
              <motion.div
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                style={{ backgroundColor: '#2563EB' }}
              />
              <motion.div
                whileInView={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: '#2563EB' }} strokeWidth={1.5} />
              </motion.div>
              <h3 className="mb-3" style={{ color: '#0F172A' }}>
                1. Upload Photo
              </h3>
              <p style={{ color: '#334155' }}>
                Upload a face photo you want to protect.
              </p>
              {/* Step number badge */}
              <div 
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-xs"
                style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
              >
                1
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              className="p-8 rounded-lg border text-center relative z-10 group"
              style={{ 
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0'
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -8, boxShadow: '0 10px 25px -5px rgb(37 99 235 / 0.15)' }}
            >
              <motion.div
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                style={{ backgroundColor: '#2563EB' }}
              />
              <motion.div
                whileInView={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <Shield className="w-12 h-12 mx-auto mb-4" style={{ color: '#2563EB' }} strokeWidth={1.5} />
              </motion.div>
              <h3 className="mb-3" style={{ color: '#0F172A' }}>
                2. Privacy Protection
              </h3>
              <p style={{ color: '#334155' }}>
                MaskMe applies invisible noise to shield your identity from facial recognition.
              </p>
              {/* Step number badge */}
              <div 
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-xs"
                style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
              >
                2
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              className="p-8 rounded-lg border text-center relative z-10 group"
              style={{ 
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0'
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ y: -8, boxShadow: '0 10px 25px -5px rgb(37 99 235 / 0.15)' }}
            >
              <motion.div
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                style={{ backgroundColor: '#2563EB' }}
              />
              <motion.div
                whileInView={{ y: [0, -8, 0] }}
                transition={{ duration: 0.5, delay: 0.7 }}
                viewport={{ once: true }}
              >
                <Download className="w-12 h-12 mx-auto mb-4" style={{ color: '#2563EB' }} strokeWidth={1.5} />
              </motion.div>
              <h3 className="mb-3" style={{ color: '#0F172A' }}>
                3. Download Result
              </h3>
              <p style={{ color: '#334155' }}>
                Download your protected photo—looks the same, but secured against AI tracking.
              </p>
              {/* Step number badge */}
              <div 
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-xs"
                style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
              >
                3
              </div>
            </motion.div>
          </div>

          {/* Additional trust indicators */}
          <motion.div 
            className="mt-12 flex justify-center gap-12 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <svg className="w-5 h-5" style={{ color: '#2563EB' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm" style={{ color: '#334155' }}>
                Does not visibly alter your face
              </span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <svg className="w-5 h-5" style={{ color: '#2563EB' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm" style={{ color: '#334155' }}>
                Built with privacy-first technology
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust & Privacy Banner */}
      <section className="py-8 px-6" style={{ backgroundColor: '#F1F5F9' }}>
        <motion.div 
          className="max-w-4xl mx-auto flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Shield className="w-8 h-8" style={{ color: '#2563EB' }} strokeWidth={1.5} />
          </motion.div>
          <p className="text-center" style={{ color: '#334155' }}>
            Your images are processed securely. Photos are not saved on the server.
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-white border-t" style={{ borderColor: '#E2E8F0' }}>
        <motion.div 
          className="max-w-6xl mx-auto text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <motion.p 
            className="mb-4" 
            style={{ color: '#64748B' }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Final Year Project • Your Name / University
          </motion.p>
          <motion.div 
            className="flex justify-center gap-6"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.a 
              href="#github" 
              className="transition-colors"
              style={{ color: '#2563EB' }}
              whileHover={{ scale: 1.1 }}
            >
              GitHub
            </motion.a>
            <motion.a 
              href="#linkedin" 
              className="transition-colors"
              style={{ color: '#2563EB' }}
              whileHover={{ scale: 1.1 }}
            >
              LinkedIn
            </motion.a>
            <motion.a 
              href="#privacy" 
              className="transition-colors"
              style={{ color: '#2563EB' }}
              whileHover={{ scale: 1.1 }}
            >
              Privacy Policy
            </motion.a>
          </motion.div>
        </motion.div>
      </footer>
    </div>
  );
}