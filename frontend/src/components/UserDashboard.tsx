import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  Eye,
  LogOut,
  Download,
  Trash2,
  Search,
  ArrowRight,
  CircleHelp,
} from 'lucide-react';
import { ApiError, getHistory, deleteHistoryItem } from '../services/api';
import { toast } from 'sonner';
import GuidedTutorial, { TutorialStep } from './tutorial/GuidedTutorial';
import { usePageTutorial } from './tutorial/usePageTutorial';

interface UserDashboardProps {
  user: { name: string; email: string; picture: string } | null;
  onUploadClick: () => void;
  onLogout: () => void;
  onBackToHome: () => void;
}

const DASHBOARD_TUTORIAL_STEPS: TutorialStep[] = [
  {
    selector: '[data-tutorial="dashboard-nav"]',
    title: 'Dashboard Navigation',
    description: 'Use this bar to return home, relaunch this tutorial, or sign out.',
    placement: 'bottom',
  },
  {
    selector: '[data-tutorial="dashboard-summary"]',
    title: 'Protection Summary',
    description: 'This card shows record count, average reduction, and your quick action button.',
    placement: 'bottom',
  },
  {
    selector: '[data-tutorial="dashboard-search"]',
    title: 'Search Records',
    description: 'Filter your identity logs by original or masked labels.',
    placement: 'bottom',
  },
  {
    selector: '[data-tutorial="dashboard-logs"]',
    title: 'Identity Logs',
    description: 'View, download, and delete each protected image record from this list.',
    placement: 'top',
  },
];

export default function UserDashboard({
  user,
  onUploadClick,
  onLogout,
  onBackToHome,
}: UserDashboardProps) {
  const {
    isTutorialOpen,
    startTutorial,
    closeTutorial,
  } = usePageTutorial('dashboard');

  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const logFrontendError = (context: string, error: unknown, extra?: Record<string, unknown>) => {
    const normalized =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : { message: String(error) };

    console.error('[DashboardError]', {
      context,
      ...normalized,
      ...(extra || {}),
      timestamp: new Date().toISOString(),
    });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const data = await getHistory();
      setHistory(data);
    } catch (error) {
      logFrontendError('fetchHistory', error, {
        statusCode: error instanceof ApiError ? error.statusCode : undefined,
      });

      if (error instanceof ApiError && error.statusCode === 503) {
        toast.error('Database temporarily unavailable. Please try again shortly.');
      } else if (error instanceof ApiError && error.statusCode === 401) {
        toast.error('Session expired. Please sign in again.');
      } else {
        toast.error('Failed to load your history');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this protection record? This cannot be undone.')) {
      return;
    }

    try {
      await deleteHistoryItem(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      toast.success('Record deleted successfully');
    } catch (error) {
      logFrontendError('deleteHistoryItem', error, {
        id,
        statusCode: error instanceof ApiError ? error.statusCode : undefined,
      });

      if (error instanceof ApiError && error.statusCode === 503) {
        toast.error('Database temporarily unavailable. Delete action could not be completed.');
      } else {
        toast.error('Failed to delete record');
      }
    }
  };

  const handleDownload = (b64: string, filename: string) => {
    try {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${b64}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      logFrontendError('downloadImage', error, { filename });
      toast.error('Failed to download image');
    }
  };

  const handleOpenViewer = (id: string) => {
    try {
      const item = history.find((entry) => entry.id === id);
      if (!item || !item.cloaked_image) {
        throw new Error('Image data is missing for selected record');
      }

      const escapedLabel = String(item.cloaked_label || 'Protected Image')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const escapedTime = String(new Date(item.timestamp).toLocaleString())
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const imageDataUrl = `data:image/png;base64,${item.cloaked_image}`;

      const pageHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapedLabel}</title>
    <style>
      body { margin: 0; background: #09090b; color: #f4f4f5; font-family: system-ui, -apple-system, Segoe UI, sans-serif; }
      main { min-height: 100vh; display: grid; place-items: center; padding: 24px; box-sizing: border-box; }
      .card { width: min(1100px, 100%); border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; overflow: hidden; background: #111827; }
      .meta { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.12); font-size: 12px; letter-spacing: 0.03em; color: #c4b5fd; }
      img { display: block; width: 100%; height: auto; max-height: calc(100vh - 160px); object-fit: contain; background: #000; }
    </style>
  </head>
  <body>
    <main>
      <section class="card">
        <div class="meta">${escapedLabel} | Masked At: ${escapedTime}</div>
        <img src="${imageDataUrl}" alt="Protected image" />
      </section>
    </main>
  </body>
</html>`;

      const pageBlob = new Blob([pageHtml], { type: 'text/html' });
      const pageUrl = URL.createObjectURL(pageBlob);

      // Triggering a real anchor click from the user event is less likely to be blocked.
      const opener = document.createElement('a');
      opener.href = pageUrl;
      opener.target = '_blank';
      opener.rel = 'noopener noreferrer';
      document.body.appendChild(opener);
      opener.click();
      document.body.removeChild(opener);

      setTimeout(() => URL.revokeObjectURL(pageUrl), 60_000);
    } catch (error) {
      logFrontendError('openViewer', error, { id });
      toast.error('Failed to open image');
    }
  };

  const filteredHistory = history.filter((item) =>
    String(item?.original_label || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(item?.cloaked_label || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const primaryName = (user?.name || user?.email || 'User').split(' ')[0];
  const reductionAverage =
    history.length > 0
      ? history.reduce(
          (sum, item) => sum + ((item.original_confidence || 0) - (item.cloaked_confidence || 0)),
          0
        ) / history.length
      : 0;

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: '#0a0a0a', color: '#ffffff', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <motion.div
        style={{
          position: 'absolute',
          width: '820px',
          height: '820px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 66%)',
          top: '-320px',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: '3px',
            height: '3px',
            borderRadius: '50%',
            backgroundColor: '#8b5cf6',
            left: `${12 + i * 11}%`,
            top: `${14 + (i % 3) * 20}%`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
          animate={{ y: [0, -34, 0], opacity: [0, 0.7, 0], scale: [0.6, 1.4, 0.6] }}
          transition={{ duration: 3.2 + i * 0.35, repeat: Infinity, delay: i * 0.25, ease: 'easeInOut' }}
        />
      ))}

      <motion.nav
        data-tutorial="dashboard-nav"
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
          onClick={onBackToHome}
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
            onClick={startTutorial}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: 'rgba(255,255,255,0.06)',
              color: '#e4e4e7',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.11)', scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <CircleHelp size={15} />
            Start Tutorial
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

      <section className="relative z-10" style={{ padding: '72px 24px 48px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <motion.h1
            style={{
              fontSize: 'clamp(34px, 5.5vw, 76px)',
              fontWeight: 500,
              lineHeight: 1.06,
              letterSpacing: '-0.03em',
              marginBottom: '20px',
            }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Welcome, {primaryName} <span style={{ color: '#666666' }}>to your dashboard control center.</span>
          </motion.h1>

          <motion.p
            style={{ color: '#a1a1aa', fontSize: '16px', lineHeight: 1.7, maxWidth: '680px', margin: '0 auto 38px' }}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            Welcome back, {primaryName}. Track, inspect, and download your protected identity records from one place.
          </motion.p>

          <motion.div
            data-tutorial="dashboard-summary"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '16px 18px',
              maxWidth: '920px',
              margin: '0 auto',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              boxShadow: '0 26px 72px rgba(0,0,0,0.45)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingRight: '14px', borderRight: '1px solid #e5e7eb' }}>
                <Shield size={18} color="#3b82f6" />
                <p style={{ color: '#000', fontSize: '13px', fontWeight: 600 }}>Records: {history.length}</p>
              </div>
              <p style={{ color: '#374151', fontSize: '13px', fontWeight: 600 }}>
                Avg reduction: {(reductionAverage * 100).toFixed(1)}%
              </p>
              <p style={{ color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>Status: Secure</p>
            </div>

            <motion.button
              onClick={onUploadClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 700,
                backgroundColor: '#111827',
                color: '#ffffff',
                border: '1px solid #1f2937',
                whiteSpace: 'nowrap',
              }}
              whileHover={{ backgroundColor: '#000000' }}
              whileTap={{ scale: 0.97 }}
            >
              Protect New Image <ArrowRight size={14} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      <main className="relative z-10" style={{ padding: '16px 24px 64px' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div data-tutorial="dashboard-search" className="lg:col-span-2 rounded-2xl p-5" style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2 mb-3" style={{ color: '#71717a' }}>
                <Search size={14} />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em]">Search Records</span>
              </div>
              <input
                type="text"
                placeholder="Search by original or cloaked label"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl px-4 py-3 outline-none transition-all"
                style={{
                  backgroundColor: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.09)',
                  color: '#ffffff',
                }}
              />
            </div>

            <div className="rounded-2xl p-5" style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: '#71717a' }}>Recent Activity</p>
              <p className="text-3xl font-semibold">{filteredHistory.length}</p>
              <p className="text-xs font-semibold mt-1" style={{ color: '#34d399' }}>Matching current filter</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-5">
            <h2 className="text-2xl font-semibold tracking-tight">{primaryName}&apos;s Identity Logs</h2>
            <div className="h-px flex-1" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
          </div>

          <div data-tutorial="dashboard-logs">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-28 gap-5">
              <div className="w-14 h-14 rounded-full border-4 border-violet-500/10 border-t-violet-500 animate-spin" />
              <p className="text-[11px] uppercase tracking-[0.25em] font-bold" style={{ color: '#71717a' }}>Syncing Vault</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-24 rounded-3xl" style={{ border: '1px dashed rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Shield className="w-10 h-10" style={{ color: '#3f3f46' }} />
              </div>
              <h3 className="text-2xl font-semibold mb-3">No records found</h3>
              <p className="max-w-md mx-auto mb-8" style={{ color: '#a1a1aa' }}>
                Start by protecting your first image. Your audit-ready logs will appear here.
              </p>
              <motion.button
                onClick={onUploadClick}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
                style={{ backgroundColor: '#ddd6fe', color: '#000000' }}
                whileHover={{ backgroundColor: '#c4b5fd', y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                Protect First Image <ArrowRight size={16} />
              </motion.button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredHistory.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.25 }}
                  className="group rounded-lg overflow-hidden transition-all grid grid-cols-[32px_minmax(0,1fr)_116px] items-center gap-2.5 px-3 py-2"
                  style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.09)' }}
                >
                    <div className="w-8 h-8 rounded overflow-hidden border border-white/10">
                      <img
                        src={`data:image/png;base64,${item.cloaked_image}`}
                        alt={item.original_label}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          logFrontendError('thumbnailImageDecode', new Error('Thumbnail failed to render'), {
                            id: item.id,
                            label: item.cloaked_label,
                          });
                          e.currentTarget.style.opacity = '0.35';
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.14em] font-bold" style={{ color: '#71717a' }}>
                          Current Identification
                        </p>
                        <p className="text-sm truncate font-semibold" style={{ color: '#e4e4e7' }}>
                          {item.cloaked_label}
                        </p>
                      </div>
                      <div className="min-w-0 text-right">
                        <p className="text-[10px] uppercase tracking-[0.14em] font-bold" style={{ color: '#71717a' }}>
                          Masked At
                        </p>
                        <p className="text-[11px] truncate" style={{ color: '#a1a1aa' }}>
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1.5 justify-self-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenViewer(item.id);
                        }}
                        className="w-8 h-8 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(76,29,149,0.35)', border: '1px solid rgba(167,139,250,0.35)', color: '#ddd6fe' }}
                        title="View"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(item.cloaked_image, `protected_id_${item.id.slice(-4)}.png`);
                        }}
                        className="w-8 h-8 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.12)' }}
                        title="Download"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, item.id)}
                        className="w-8 h-8 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(127,29,29,0.4)', border: '1px solid rgba(239,68,68,0.28)', color: '#f87171' }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                </motion.div>
              ))}
            </div>
          )}
          </div>
        </div>
      </main>

      <GuidedTutorial
        isOpen={isTutorialOpen}
        steps={DASHBOARD_TUTORIAL_STEPS}
        onClose={closeTutorial}
      />

    </div>
  );
}
