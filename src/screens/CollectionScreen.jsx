import { useState } from 'react';
import { t } from '../data/translations';
import creatures from '../data/creatures';
import { getEvoDisplay } from '../data/creatures';
import LanguageToggle from '../components/LanguageToggle';
import GuideModal, { GuideButton } from '../components/GuideModal';
import useGuide from '../hooks/useGuide';
import './CollectionScreen.css';

const EVO_LABELS = {
  1: { icon: '🥚', label: { en: 'Base',   es: 'Base'    } },
  2: { icon: '✨', label: { en: 'Stage 2', es: 'Etapa 2' } },
  3: { icon: '🌟', label: { en: 'MAX',     es: 'MÁX'    } },
};

const COLLECTION_GUIDE = {
  en: {
    title: '🏆 Your Creature Collection',
    sections: [
      { icon: '👾', heading: 'How to Catch Creatures', text: 'Win a battle to earn the chance to catch the creature. Hit the "✨ Catch!" button on the reward screen.' },
      { icon: '✨', heading: 'Evolve to Stage 2', text: 'Tap "⚡ Evolve!" on a captured creature. Win the evolution battle with ZERO mistakes to unlock the golden form.' },
      { icon: '🌟', heading: 'Max Evolution', text: 'Tap "🌟 Max Evolve!" on a Stage 2 creature. Answer every question correctly AND within 8 seconds each!' },
      { icon: '🌟', heading: 'Complete Your Dex', text: 'There are 9 creatures to capture — one for each table from ×2 to ×10. Can you max-evolve them all?' },
    ],
  },
  es: {
    title: '🏆 Tu Colección de Criaturas',
    sections: [
      { icon: '👾', heading: 'Cómo Atrapar Criaturas', text: 'Gana una batalla para atrapar la criatura. Toca el botón "✨ ¡Atrapar!" en la pantalla de recompensa.' },
      { icon: '✨', heading: 'Evolucionar a Etapa 2', text: 'Toca "⚡ ¡Evolucionar!" en una criatura capturada. ¡Gana la batalla de evolución sin errores para desbloquear la forma dorada!' },
      { icon: '🌟', heading: 'Evolución Máxima', text: 'Toca "🌟 ¡Evolución Máx!" en una criatura de Etapa 2. ¡Responde todo correctamente en 8 segundos cada pregunta!' },
      { icon: '🌟', heading: 'Completa tu Colección', text: 'Hay 9 criaturas para capturar. ¿¡Puedes evolucionar a todas al máximo?' },
    ],
  },
};

export default function CollectionScreen({
  language, onToggleLanguage, collection, evolutions, onStartEvoBattle, navigate,
}) {
  const [selected, setSelected] = useState(null);
  const [guideOpen, openGuide, closeGuide, isPulse] = useGuide('collection');
  const guide = COLLECTION_GUIDE[language];

  const captured = collection.length;
  const total = creatures.length;

  return (
    <div className="screen collection-screen">
      <LanguageToggle language={language} onToggle={onToggleLanguage} />

      <button className="btn btn-ghost back-btn" onClick={() => navigate('home')}>
        ← {t(language, 'back')}
      </button>

      <h2 className="collection-title">{t(language, 'collectionTitle')}</h2>

      <div className="collection-counter">
        {language === 'en' ? `${captured} / ${total} Caught` : `${captured} / ${total} Capturadas`}
      </div>

      <div className="collection-grid">
        {creatures.map((creature) => {
          const isCaptured = collection.includes(creature.id);
          const evoLevel = evolutions?.[creature.id] ?? 1;
          if (!isCaptured) {
            return <ShadowCard key={creature.id} creature={creature} language={language} />;
          }
          return (
            <CreatureCard
              key={creature.id}
              creature={creature}
              evoLevel={evoLevel}
              language={language}
              onClick={() => setSelected(creature)}
              onEvolve={evoLevel < 3 ? () => onStartEvoBattle(creature.id, evoLevel + 1) : null}
            />
          );
        })}
      </div>

      {collection.length === 0 && (
        <button
          className="btn btn-primary btn-large"
          style={{ marginTop: 24 }}
          onClick={() => navigate('home')}
        >
          ⚔️ {t(language, 'startGame')}
        </button>
      )}

      {selected && (
        <CreatureModal
          creature={selected}
          evoLevel={evolutions?.[selected.id] ?? 1}
          language={language}
          onClose={() => setSelected(null)}
          onEvolve={
            (evolutions?.[selected.id] ?? 1) < 3
              ? () => { setSelected(null); onStartEvoBattle(selected.id, (evolutions?.[selected.id] ?? 1) + 1); }
              : null
          }
        />
      )}

      <GuideButton onClick={openGuide} className={isPulse ? 'guide-btn--pulse' : ''} />
      {guideOpen && (
        <GuideModal
          title={guide.title}
          sections={guide.sections}
          language={language}
          onClose={closeGuide}
        />
      )}
    </div>
  );
}

function CreatureCard({ creature, evoLevel, language, onClick, onEvolve }) {
  const [imgError, setImgError] = useState(false);
  const { name, image } = getEvoDisplay(creature, evoLevel);
  const evoInfo = EVO_LABELS[evoLevel];

  return (
    <div className={`collection-card collection-card--evo${evoLevel}`}>
      <div className="collection-card-evo-badge">
        {evoInfo.icon} {evoInfo.label[language]}
      </div>
      <div onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
        {imgError ? (
          <span className="collection-card-emoji">{creature.emoji}</span>
        ) : (
          <img
            src={image}
            alt={name}
            className="collection-card-img"
            onError={() => setImgError(true)}
            style={{ mixBlendMode: 'multiply' }}
          />
        )}
        <div className="collection-card-name">{name}</div>
        <div className="collection-card-table">
          {t(language, 'tableLabel', { table: creature.table })}
        </div>
      </div>
      {onEvolve && (
        <button
          className={`btn collection-evo-btn collection-evo-btn--${evoLevel + 1}`}
          onClick={(e) => { e.stopPropagation(); onEvolve(); }}
        >
          {evoLevel === 1 ? '⚡' : '🌟'}{' '}
          {language === 'en'
            ? (evoLevel === 1 ? 'Evolve!' : 'Max Evolve!')
            : (evoLevel === 1 ? '¡Evolucionar!' : '¡Evolución Máx!')}
        </button>
      )}
      {!onEvolve && (
        <div className="collection-card-maxed">
          🌟 {language === 'en' ? 'MAX EVOLVED' : 'EVOLUCIÓN MÁX'}
        </div>
      )}
    </div>
  );
}

function CreatureModal({ creature, evoLevel, language, onClose, onEvolve }) {
  const [imgError, setImgError] = useState(false);
  const { name, image } = getEvoDisplay(creature, evoLevel);
  const evoInfo = EVO_LABELS[evoLevel];

  // Power scale: evo1=1x, evo2=1.5x, evo3=2x
  const powerMult = evoLevel === 3 ? 2 : evoLevel === 2 ? 1.5 : 1;
  const power = Math.round(((creature.maxHp + creature.attack * 5) * powerMult));

  return (
    <div className="creature-modal-overlay" onClick={onClose}>
      <div className="creature-modal" onClick={(e) => e.stopPropagation()}>
        <button className="creature-modal-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="creature-modal-evo-badge">
          {evoInfo.icon} {evoInfo.label[language]}
        </div>

        <div className="creature-modal-img-wrap">
          {imgError ? (
            <span style={{ fontSize: '8rem' }}>{creature.emoji}</span>
          ) : (
            <img
              src={image}
              alt={name}
              className="creature-modal-img"
              onError={() => setImgError(true)}
            />
          )}
        </div>

        <h3 className="creature-modal-name">{name}</h3>
        <div className="creature-modal-table">
          {t(language, 'tableLabel', { table: creature.table })}
        </div>
        <div className="creature-modal-stats">
          <span>❤️ {Math.round(creature.maxHp * powerMult)} HP</span>
          <span>⚡ {Math.round(creature.attack * powerMult)} ATK</span>
          <span>💥 {power} PWR</span>
        </div>

        {/* Evolution chain strip */}
        <div className="creature-modal-evo-chain">
          {[1, 2, 3].map((lvl) => {
            const d = getEvoDisplay(creature, lvl);
            return (
              <div key={lvl} className={`modal-evo-pip${lvl <= evoLevel ? ' unlocked' : ''}`}>
                <span>{EVO_LABELS[lvl].icon}</span>
                <span style={{ fontSize: '0.6rem' }}>{d.name}</span>
              </div>
            );
          })}
        </div>

        {onEvolve && (
          <button
            className={`btn collection-evo-btn collection-evo-btn--${evoLevel + 1} btn-large`}
            style={{ marginTop: 10 }}
            onClick={onEvolve}
          >
            {evoLevel === 1 ? '⚡' : '🌟'}{' '}
            {language === 'en'
              ? (evoLevel === 1 ? 'Evolve!' : 'Max Evolve!')
              : (evoLevel === 1 ? '¡Evolucionar!' : '¡Evolución Máx!')}
          </button>
        )}
      </div>
    </div>
  );
}

function ShadowCard({ creature, language }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="collection-card collection-card--shadow">
      <div className="collection-card-evo-badge" style={{ opacity: 0 }}>?</div>
      <div className="collection-shadow-img-wrap">
        {imgError ? (
          <span className="collection-card-emoji" style={{ filter: 'brightness(0)' }}>{creature.emoji}</span>
        ) : (
          <img
            src={creature.image}
            alt="???"
            className="collection-card-img collection-card-img--shadow"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <div className="collection-card-name collection-shadow-name">???</div>
      <div className="collection-card-table">
        {language === 'en' ? `×${creature.table} Table` : `Tabla ×${creature.table}`}
      </div>
    </div>
  );
}

function CaptureBallIcon() {
  return (
    <div className="capture-ball-icon">
      <div className="cbi-top" />
      <div className="cbi-band">
        <div className="cbi-button" />
      </div>
      <div className="cbi-bottom" />
    </div>
  );
}
