import { useState } from 'react';
import { t } from '../data/translations';
import creatures from '../data/creatures';
import LanguageToggle from '../components/LanguageToggle';
import GuideModal, { GuideButton } from '../components/GuideModal';
import useGuide from '../hooks/useGuide';
import './CollectionScreen.css';

const COLLECTION_GUIDE = {
  en: {
    title: '🏆 Your Creature Collection',
    sections: [
      { icon: '👾', heading: 'How to Catch Creatures', text: 'Win a battle to earn the chance to catch the creature. Hit the "🪴 Catch!" button on the reward screen before it fades.' },
      { icon: '👈', heading: 'Tap a Card', text: 'Tap any creature card to see its full-size image, name, HP, and attack stats.' },
      { icon: '🔓', heading: 'Unlock the Road', text: 'Capturing a creature masters that multiplication table and opens the path to the next zone on the Adventure Road.' },
      { icon: '🌟', heading: 'Complete Your Dex', text: 'There are 9 creatures to capture — one for each table from ×2 to ×10. Can you catch them all?' },
    ],
  },
  es: {
    title: '🏆 Tu Colección de Criaturas',
    sections: [
      { icon: '👾', heading: 'Cómo Atrapar Criaturas', text: 'Gana una batalla para tener la oportunidad de atrapar la criatura. Toca el botón "🪴 ¡Atrapar!" en la pantalla de recompensa.' },
      { icon: '👈', heading: 'Toca una Tarjeta', text: 'Toca cualquier tarjeta de criatura para ver su imagen completa, nombre, HP y ataque.' },
      { icon: '🔓', heading: 'Desbloquea el Camino', text: 'Capturar una criatura domina esa tabla y abre el camino hacia la siguiente zona.' },
      { icon: '🌟', heading: 'Completa tu Colección', text: 'Hay 9 criaturas para capturar — una por cada tabla de ×2 a ×10. ¿¡Puedes atraparlas todas?' },
    ],
  },
};

export default function CollectionScreen({
  language, onToggleLanguage, collection, navigate,
}) {
  const [selected, setSelected] = useState(null);
  const [guideOpen, openGuide, closeGuide, isPulse] = useGuide('collection');
  const guide = COLLECTION_GUIDE[language];

  return (
    <div className="screen collection-screen">
      <LanguageToggle language={language} onToggle={onToggleLanguage} />

      <button className="btn btn-ghost back-btn" onClick={() => navigate('home')}>
        ← {t(language, 'back')}
      </button>

      <h2 className="collection-title">{t(language, 'collectionTitle')}</h2>

      {collection.length === 0 ? (
        <p className="collection-empty">{t(language, 'collectionEmpty')}</p>
      ) : (
        <div className="collection-grid">
          {creatures
            .filter((c) => collection.includes(c.id))
            .map((creature) => (
              <CreatureCard
                key={creature.id}
                creature={creature}
                language={language}
                onClick={() => setSelected(creature)}
              />
            ))}
        </div>
      )}

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
          language={language}
          onClose={() => setSelected(null)}
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

function CreatureCard({ creature, language, onClick }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="collection-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}>
      {imgError ? (
        <span className="collection-card-emoji">{creature.emoji}</span>
      ) : (
        <img
          src={creature.image}
          alt={creature.name}
          className="collection-card-img"
          onError={() => setImgError(true)}
          style={{ mixBlendMode: 'multiply' }}
        />
      )}
      <div className="collection-card-name">{creature.name}</div>
      <div className="collection-card-table">
        {t(language, 'tableLabel', { table: creature.table })}
      </div>
      <div className="collection-card-hint">👆 {language === 'en' ? 'tap' : 'toca'}</div>
    </div>
  );
}

function CreatureModal({ creature, language, onClose }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="creature-modal-overlay" onClick={onClose}>
      <div className="creature-modal" onClick={(e) => e.stopPropagation()}>
        <button className="creature-modal-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="creature-modal-ball">
          <CaptureBallIcon />
        </div>

        <div className="creature-modal-img-wrap">
          {imgError ? (
            <span style={{ fontSize: '8rem' }}>{creature.emoji}</span>
          ) : (
            <img
              src={creature.image}
              alt={creature.name}
              className="creature-modal-img"
              onError={() => setImgError(true)}
            />
          )}
        </div>

        <h3 className="creature-modal-name">{creature.name}</h3>
        <div className="creature-modal-table">
          {t(language, 'tableLabel', { table: creature.table })}
        </div>
        <div className="creature-modal-stats">
          <span>❤️ {creature.maxHp} HP</span>
          <span>⚡ {creature.attack} ATK</span>
          <span>{creature.emoji}</span>
        </div>
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
