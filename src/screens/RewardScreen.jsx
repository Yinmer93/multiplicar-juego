import { useEffect, useState } from 'react';
import { t } from '../data/translations';
import creatures from '../data/creatures';
import { getEvoDisplay } from '../data/creatures';
import LanguageToggle from '../components/LanguageToggle';
import { playSound } from '../utils/sounds';
import './RewardScreen.css';

export default function RewardScreen({
  language, onToggleLanguage, battleResult, currentTable,
  coinsEarned, collection, evolutions, evolutionMode,
  onCapture, onEvolve, onNextTable, navigate,
}) {
  const creature = creatures.find((c) => c.table === currentTable);
  const alreadyCaptured = collection.includes(creature.id);
  const currentEvoLevel = evolutions?.[creature.id] ?? (alreadyCaptured ? 1 : 0);
  const [captured, setCaptured] = useState(false);
  const [evolved, setEvolved] = useState(false);
  const [showCaptureAnim, setShowCaptureAnim] = useState(false);
  const isEvoBattle = evolutionMode === 2 || evolutionMode === 3;

  const nextCreatureIdx = creatures.findIndex((c) => c.table === currentTable) + 1;
  const nextCreature = nextCreatureIdx < creatures.length ? creatures[nextCreatureIdx] : null;
  const newEvoLevel = evolutionMode ?? 1;
  const evoDisplay = isEvoBattle ? getEvoDisplay(creature, evolutionMode) : { name: creature.name, image: creature.image };

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

  function handleEvolve() {
    playSound('capture');
    setEvolved(true);
    onEvolve(creature.id, newEvoLevel);
  }

  // ── LOSE SCREEN ────────────────────────────────────────────────────────────
  if (battleResult === 'lose') {
    return (
      <div className="screen reward-screen reward-screen--lose">
        <LanguageToggle language={language} onToggle={onToggleLanguage} />
        <div className="reward-icon">{isEvoBattle ? '💢' : '💔'}</div>
        <h2 className="reward-title">
          {isEvoBattle
            ? (language === 'en' ? 'Evolution Failed!' : '¡Evolución Fallida!')
            : t(language, 'youLose')}
        </h2>
        {isEvoBattle && (
          <p className="reward-evo-hint">
            {evolutionMode === 3
              ? (language === 'en'
                  ? 'You need a PERFECT run with every answer in 8 seconds!'
                  : '¡Necesitas una ronda PERFECTA respondiendo en 8 segundos!')
              : (language === 'en'
                  ? 'One mistake costs the evolution. Answer every question correctly!'
                  : '¡Un error cancela la evolución. Responde todo correctamente!')}
          </p>
        )}
        <div className="reward-buttons">
          <button
            className="btn btn-primary btn-large"
            onClick={() => navigate('battle')}
          >
            🔄 {t(language, 'tryAgain')}
          </button>
          <button
            className="btn btn-outline btn-large"
            onClick={() => navigate('collection')}
          >
            📦 {language === 'en' ? 'My Creatures' : 'Mis Criaturas'}
          </button>
        </div>
      </div>
    );
  }

  // ── WIN SCREEN — EVOLUTION BATTLE ─────────────────────────────────────────
  if (isEvoBattle) {
    return (
      <div className={`screen reward-screen reward-screen--win reward-screen--evo${evolutionMode}`}>
        <LanguageToggle language={language} onToggle={onToggleLanguage} />

        <div className="reward-fireworks">
          {evolutionMode === 3 ? '🌟✨🌟' : '✨⭐✨'}
        </div>
        <h2 className="reward-title">
          {language === 'en' ? 'Evolution Unlocked!' : '¡Evolución Desbloqueada!'}
        </h2>

        <div className="reward-evo-chain">
          <div className="reward-evo-stage reward-evo-stage--before">
            <CreatureImage creature={creature} image={getEvoDisplay(creature, currentEvoLevel).image} />
            <span className="reward-evo-label">{getEvoDisplay(creature, currentEvoLevel).name}</span>
          </div>
          <div className="reward-evo-arrow">{evolved ? '→' : '⟹'}</div>
          <div className={`reward-evo-stage reward-evo-stage--after${evolved ? ' evolved' : ''}`}>
            <CreatureImage creature={creature} image={evoDisplay.image} />
            <span className="reward-evo-label">{evoDisplay.name}</span>
          </div>
        </div>

        {!evolved ? (
          <button
            className={`btn btn-catch btn-large reward-evo-btn--evo${evolutionMode}`}
            onClick={handleEvolve}
          >
            {evolutionMode === 3 ? '🌟' : '✨'}{' '}
            {language === 'en' ? `Evolve to ${evoDisplay.name}!` : `¡Evolucionar a ${evoDisplay.name}!`}
          </button>
        ) : (
          <div className="reward-evolved-confirm">
            {language === 'en'
              ? `🎉 ${evoDisplay.name} is now yours!`
              : `🎉 ¡${evoDisplay.name} es tuyo!`}
          </div>
        )}

        <div className="reward-coins">
          🪙 {t(language, 'coinsEarned', { coins: coinsEarned })}
        </div>

        <div className="reward-buttons" style={{ marginTop: 12 }}>
          <button className="btn btn-outline btn-large" onClick={() => navigate('collection')}>
            📦 {language === 'en' ? 'My Creatures' : 'Mis Criaturas'}
          </button>
          <button className="btn btn-ghost btn-large" onClick={() => navigate('home')}>
            🏠 {t(language, 'goHome')}
          </button>
        </div>
      </div>
    );
  }

  // ── WIN SCREEN — NORMAL BATTLE ─────────────────────────────────────────────
  return (
    <div className="screen reward-screen reward-screen--win">
      <LanguageToggle language={language} onToggle={onToggleLanguage} />

      <div className="reward-fireworks">🎉🎊🎉</div>
      <h2 className="reward-title">{t(language, 'youWin')}</h2>

      <div className="reward-creature">
        <CreatureImage creature={creature} image={creature.image} />
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

      {captured && nextCreature && (
        <div className="reward-unlocked-banner">
          {t(language, 'tableUnlocked', { table: nextCreature.table })}
        </div>
      )}

      {captured && !nextCreature && (
        <div className="reward-unlocked-banner">
          {t(language, 'allTablesComplete')}
        </div>
      )}

      {showCaptureAnim && (
        <CaptureOverlay creature={creature} language={language} onDone={onCaptureAnimDone} />
      )}

      <div className="reward-buttons">
        {captured ? (
          <>
            {nextCreature ? (
              <button
                className="btn btn-primary btn-large"
                onClick={() => onNextTable(currentTable)}
              >
                {t(language, 'nextTable')}
              </button>
            ) : (
              <button
                className="btn btn-primary btn-large"
                onClick={() => navigate('collection')}
              >
                🏆 {t(language, 'myCreatures')}
              </button>
            )}
            <button
              className="btn btn-outline btn-large"
              onClick={() => navigate('home')}
            >
              🏠 {t(language, 'goHome')}
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
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

function CreatureImage({ creature, image }) {
  const [imgError, setImgError] = useState(false);
  const src = image || creature.image;
  if (imgError) {
    return <span style={{ fontSize: '6rem' }}>{creature.emoji}</span>;
  }
  return (
    <img
      src={src}
      alt={creature.name}
      className="reward-creature-img"
      onError={() => setImgError(true)}
      style={{ mixBlendMode: 'multiply' }}
    />
  );
}
