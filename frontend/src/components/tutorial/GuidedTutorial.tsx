import { useEffect, useMemo, useState } from 'react';

export type TutorialPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface TutorialStep {
  selector?: string;
  title: string;
  description: string;
  placement?: TutorialPlacement;
}

interface GuidedTutorialProps {
  isOpen: boolean;
  steps: TutorialStep[];
  onClose: () => void;
}

const TOOLTIP_MAX_WIDTH = 360;
const VIEWPORT_MARGIN = 16;
const TARGET_MARGIN = 10;
const TARGET_GAP = 14;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function GuidedTutorial({ isOpen, steps, onClose }: GuidedTutorialProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex >= steps.length - 1;

  useEffect(() => {
    if (!isOpen) return;
    setStepIndex(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !currentStep) return;

    const updateTargetRect = () => {
      if (!currentStep.selector) {
        setTargetRect(null);
        return;
      }
      const element = document.querySelector(currentStep.selector) as HTMLElement | null;
      if (!element) {
        setTargetRect(null);
        return;
      }
      setTargetRect(element.getBoundingClientRect());
    };

    const selectorTarget = currentStep.selector
      ? (document.querySelector(currentStep.selector) as HTMLElement | null)
      : null;
    if (selectorTarget) {
      selectorTarget.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
    }

    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);
    const intervalId = window.setInterval(updateTargetRect, 200);

    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
      window.clearInterval(intervalId);
    };
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const tooltipPosition = useMemo(() => {
    if (!currentStep) {
      return { top: VIEWPORT_MARGIN, left: VIEWPORT_MARGIN, width: TOOLTIP_MAX_WIDTH };
    }

    const viewportWidth = typeof window === 'undefined' ? 1280 : window.innerWidth;
    const viewportHeight = typeof window === 'undefined' ? 720 : window.innerHeight;
    const width = Math.min(TOOLTIP_MAX_WIDTH, viewportWidth - VIEWPORT_MARGIN * 2);
    const placement = currentStep.placement || 'bottom';

    if (!targetRect || placement === 'center') {
      const centeredLeft = (viewportWidth - width) / 2;
      const centeredTop = (viewportHeight - 220) / 2;
      return {
        left: clamp(centeredLeft, VIEWPORT_MARGIN, viewportWidth - width - VIEWPORT_MARGIN),
        top: clamp(centeredTop, VIEWPORT_MARGIN, viewportHeight - 220 - VIEWPORT_MARGIN),
        width,
      };
    }

    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;
    let left = targetCenterX - width / 2;
    let top = targetRect.bottom + TARGET_GAP;

    if (placement === 'top') {
      top = targetRect.top - 220 - TARGET_GAP;
    } else if (placement === 'left') {
      left = targetRect.left - width - TARGET_GAP;
      top = targetCenterY - 110;
    } else if (placement === 'right') {
      left = targetRect.right + TARGET_GAP;
      top = targetCenterY - 110;
    }

    return {
      left: clamp(left, VIEWPORT_MARGIN, viewportWidth - width - VIEWPORT_MARGIN),
      top: clamp(top, VIEWPORT_MARGIN, viewportHeight - 220 - VIEWPORT_MARGIN),
      width,
    };
  }, [currentStep, targetRect]);

  if (!isOpen || !currentStep || steps.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.68)',
        zIndex: 2000,
      }}
    >
      {targetRect && currentStep.selector && (
        <div
          style={{
            position: 'fixed',
            top: Math.max(targetRect.top - TARGET_MARGIN, 0),
            left: Math.max(targetRect.left - TARGET_MARGIN, 0),
            width: targetRect.width + TARGET_MARGIN * 2,
            height: targetRect.height + TARGET_MARGIN * 2,
            borderRadius: '14px',
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.68)',
            border: '2px solid rgba(139,92,246,0.95)',
            pointerEvents: 'none',
            zIndex: 2001,
          }}
        />
      )}

      <div
        style={{
          position: 'fixed',
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          width: tooltipPosition.width,
          borderRadius: '14px',
          backgroundColor: '#111111',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.55)',
          color: '#ffffff',
          padding: '18px',
          zIndex: 2002,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Step {stepIndex + 1} of {steps.length}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#a1a1aa',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            Skip
          </button>
        </div>

        <h3 style={{ margin: '0 0 8px', fontSize: '18px', lineHeight: 1.2 }}>{currentStep.title}</h3>
        <p style={{ margin: '0 0 16px', color: '#d4d4d8', fontSize: '14px', lineHeight: 1.6 }}>{currentStep.description}</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setStepIndex((prev) => Math.max(prev - 1, 0))}
            disabled={stepIndex === 0}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              color: stepIndex === 0 ? '#71717a' : '#ffffff',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: stepIndex === 0 ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Back
          </button>

          <button
            onClick={() => {
              if (isLastStep) {
                onClose();
                return;
              }
              setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
            }}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              backgroundColor: '#ddd6fe',
              color: '#000000',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            {isLastStep ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
