import { useEffect, useState } from 'react';
import { t } from '../data/translations';
import creatures from '../data/creatures';
import LanguageToggle from '../components/LanguageToggle';
import { playSound } from '../utils/sounds';
import './RewardScreen.css';

export default function RewardScreen({
  language, onToggleLanguage, battleResult, currentTable,
  coinsEarned, collection, onCapture, navigate,
}) {
  const creature = creatures.find((c) => c.table === currentTable);
  const alreadyCaptured = collection.includes(creature.id);
  const [captured, setCaptured] = useState(false);
  const [showCaptureAnim, setShowCaptureAnim] = useState(false);

  useEffect(() => {
    if (battleResult === 'win') {
      playSound('win');
    } else {
      playSound('lose');
    }
  }, [battleResult]);

  function handleCapture() {
    playSound('capture');
    setShowCaptureAnim(true);
  }

  function onCaptureAnimDone() {
    setShowCaptureAnim(false);
    setCaptured(true);
    onCapture(creature.id);
  }

  if (battleResult === 'lose') {
    return (
      <div className="screen reward-screen reward-screen--lose">
        <LanguageToggle language={language} onToggle={onToggleLanguage} />
        <div className="reward-icon">💔</div>
        <h2 className="reward-title">{t(language, 'youLose')}</h2>
        <div className="reward-buttons">
          <button
            className="btn btn-primary btn-large"
            onClick={() => navigate('battle')}
          >
            🔄 {t(language, 'tryAgain')}
          </button>
          <button
            className="btn btn-outline btn-large"
            onClick={() => navigate('home')}
          >
            🏠 {t(language, 'goHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen reward-screen reward-screen--win">
      <LanguageToggle language={language} onToggle={onToggleLanguage} />

      <div className="reward-fireworks">🎉🎊🎉</div>
      <h2 className="reward-title">{t(language, 'youWin')}</h2>

      <div className="reward-creature">
        <CreatureImage creature={creature} />
        <span className="reward-creature-name">{creature.name}</span>
      </div>

      <div className="reward-coins">
        🪙 {t(language, 'coinsEarned', { coins: coinsEarned })}
      </div>

      {!alreadyCaptured && !captured && (
        <button
          className="btn btn-catch btn-large"
          onClick={handleCapture}
        >
          ✨ {t(language, 'catchCreature', { name: creature.name })}
        </button>
      )}

      {(alreadyCaptured || captured) && (
        <div className="reward-already-captured">
          {captured
            ? t(language, 'captured', { name: creature.name })
            : t(language, 'alreadyCaptured')}
        </div>
      )}

      {showCaptureAnim && (
        <CaptureOverlay creature={creature} language={language} onDone={onCaptureAnimDone} />
      )}

      <div className="reward-buttons">
        <button
          className="btn btn-secondary btn-large"
          onClick={() => navigate('battle')}
        >
          ⚔️ {t(language, 'startBattle')}
        </button>
        <button
          className="btn btn-outline btn-large"
          onClick={() => navigate('home')}
        >
          🏠 {t(language, 'goHome')}
        </button>
      </div>
    </div>
  );
}

function CaptureOverlay({ creature, language, onDone }) {
  const [step, setStep] = useState(0);
  // step 0: creature large + beam grows
  // step 1: creature shrinks into ball
  // step 2: ball wobbles
  // step 3: stars + CAPTURED text

  useEffect(() => {
    const t0 = setTimeout(() => setStep(1), 700);
    const t1 = setTimeout(() => setStep(2), 1400);
    const t2 = setTimeout(() => setStep(3), 2000);
    const t3 = setTimeout(onDone, 3400);
    return () => [t0, t1, t2, t3].forEach(clearTimeout);
  }, []);

  return (
    <div className="capture-overlay">
      <div className="capture-bg" />

      <div className={`capture-beam step-${step}`} />

      <div className={`capture-creature-wrap step-${step}`}>
        <CaptureCreatureImg creature={creature} />
      </div>

      <div className={`capture-ball step-${step}`}>
        <CaptureBall />
      </div>

      {step >= 3 && (
        <>
          <div className="capture-stars">
            {['✨', '⭐', '🌟', '✨', '⭐'].map((s, i) => (
              <span key={i} className="capture-star" style={{ '--i': i }}>{s}</span>
            ))}
          </div>
          <div className="capture-text">
            {language === 'en' ? 'CAPTURED!' : '¡CAPTURADO!'}
          </div>
        </>
      )}
    </div>
  );
}

function CaptureBall() {
  return (
    <div className="reward-capture-ball">
      <div className="rcb-top" />
      <div className="rcb-bottom" />
      <div className="rcb-band">
        <div className="rcb-button" />
      </div>
    </div>
  );
}

function CaptureCreatureImg({ creature }) {
  const [imgError, setImgError] = useState(false);
  if (imgError) return <span style={{ fontSize: '5rem' }}>{creature.emoji}</span>;
  return (
    <img
      src={creature.image}
      alt={creature.name}
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      onError={() => setImgError(true)}
    />
  );
}

function CreatureImage({ creature }) {
  const [imgError, setImgError] = useState(false);
  if (imgError) {
    return <span style={{ fontSize: '6rem' }}>{creature.emoji}</span>;
  }
  return (
    <img
      src={creature.image}
      alt={creature.name}
      className="reward-creature-img"
      onError={() => setImgError(true)}
      style={{ mixBlendMode: 'multiply' }}
    />
  );
}
