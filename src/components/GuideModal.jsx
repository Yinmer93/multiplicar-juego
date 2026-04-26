import { useState, useEffect } from 'react';
import './GuideModal.css';

/**
 * GuideModal — step-through bottom popup
 *
 * Props:
 *   title     {string}   — shown above the step icon
 *   sections  {Array}    — [{ icon, heading, text }]
 *   language  {string}   — 'en' | 'es'
 *   onClose   {function}
 */
export default function GuideModal({ title, sections, language, onClose }) {
  const [step, setStep] = useState(0);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const s = sections[step];
  const isLast = step === sections.length - 1;

  return (
    <div className="guide-overlay" onClick={onClose}>
      <div className="guide-popup" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">

        {/* Title + close */}
        <div className="guide-popup-header">
          <span className="guide-popup-title">{title}</span>
          <button className="guide-close" onClick={onClose} aria-label="Close guide">✕</button>
        </div>

        {/* Current step card */}
        <div className="guide-popup-step">
          <span className="guide-popup-icon">{s.icon}</span>
          <div className="guide-popup-content">
            <div className="guide-popup-heading">{s.heading}</div>
            <div className="guide-popup-text">{s.text}</div>
          </div>
        </div>

        {/* Navigation */}
        <div className="guide-popup-nav">
          <button
            className={`guide-nav-btn${step === 0 ? ' invisible' : ''}`}
            onClick={() => setStep((i) => i - 1)}
          >
            ← {language === 'en' ? 'Prev' : 'Ant'}
          </button>

          {/* Step dots */}
          <div className="guide-popup-dots">
            {sections.map((_, i) => (
              <button
                key={i}
                className={`guide-dot${i === step ? ' active' : ''}`}
                onClick={() => setStep(i)}
                aria-label={`Step ${i + 1}`}
              />
            ))}
          </div>

          {isLast ? (
            <button className="guide-nav-btn guide-nav-done" onClick={onClose}>
              {language === 'en' ? 'Got it! 👍' : '¡Listo! 👍'}
            </button>
          ) : (
            <button className="guide-nav-btn guide-nav-next" onClick={() => setStep((i) => i + 1)}>
              {language === 'en' ? 'Next →' : 'Sig →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Small circular "?" button to open the guide.
 */
export function GuideButton({ onClick, className = '' }) {
  return (
    <button className={`guide-btn${className ? ' ' + className : ''}`} onClick={onClick} aria-label="Help / Guide">
      ?
    </button>
  );
}
