import { useState } from 'react';
import LanguageToggle from '../components/LanguageToggle';
import PlayerAvatar from '../components/PlayerAvatar';
import GuideModal, { GuideButton } from '../components/GuideModal';
import useGuide from '../hooks/useGuide';
import './ProfileScreen.css';

const FACES = [
  // Neutral kids / people (various skin tones)
  '🧒🏻','👦🏻','👧🏻',
  '🧒🏼','👦🏼','👧🏼',
  '🧒🏽','👦🏽','👧🏽',
  '🧒🏾','👦🏾','👧🏾',
  '🧒🏿','👦🏿','👧🏿',
  // Bonus fun faces
  '🧑‍🎤','🧑‍🚀','🧙','🧝','🦸','🦹',
  '🐱','🐶','🐸','🐼','🦊','🐯',
];

const HATS = [
  { label: 'None', value: '' },
  { label: '👑', value: '👑' },
  { label: '🎩', value: '🎩' },
  { label: '🎓', value: '🎓' },
  { label: '🧢', value: '🧢' },
  { label: '⛑️', value: '⛑️' },
  { label: '🪖', value: '🪖' },
  { label: '🎪', value: '🎪' },
  { label: '🌟', value: '🌟' },
  { label: '🔥', value: '🔥' },
  { label: '⚡', value: '⚡' },
];

const COLORS = [
  { label: 'Royal Purple', value: '#6a11cb' },
  { label: 'Ocean Blue',   value: '#2575fc' },
  { label: 'Forest Green', value: '#00b894' },
  { label: 'Sunset Orange',value: '#e17055' },
  { label: 'Hot Pink',     value: '#e84393' },
  { label: 'Golden',       value: '#fdcb6e' },
  { label: 'Crimson',      value: '#d63031' },
  { label: 'Teal',         value: '#00cec9' },
  { label: 'Midnight',     value: '#2d3436' },
  { label: 'Lavender',     value: '#a29bfe' },
];

const PROFILE_GUIDE = {
  en: {
    title: '👤 Your Profile',
    sections: [
      { icon: '✏️', heading: 'Set Your Name', text: 'Type your player name (up to 15 characters). This name will appear on the home screen and in the game.' },
      { icon: '😊', heading: 'Pick a Face', text: 'Choose your character\'s face from kids, people, heroes, or even animals! This emoji will be shown in battles.' },
      { icon: '🎩', heading: 'Add an Accessory', text: 'Top off your avatar with a hat, crown, or aura. Pick "None" to keep it clean.' },
      { icon: '🎨', heading: 'Choose a Color', text: 'Pick a background color for your avatar bubble. It will glow behind your face in every battle!' },
      { icon: '💾', heading: 'Save Your Profile', text: 'Hit "Save Profile" when you\'re happy. Your avatar and name are stored and will appear across the whole game.' },
    ],
  },
  es: {
    title: '👤 Tu Perfil',
    sections: [
      { icon: '✏️', heading: 'Pon tu Nombre', text: 'Escribe tu nombre de jugador (hasta 15 caracteres). Aparecerá en la pantalla principal y en el juego.' },
      { icon: '😊', heading: 'Elige una Cara', text: '¡Elige la cara de tu personaje entre niños, personas, héroes o animales! Este emoji se mostrará en las batallas.' },
      { icon: '🎩', heading: 'Agrega un Accesorio', text: 'Ponle un sombrero, corona o aura a tu avatar. Elige "Ninguno" para mantenerlo simple.' },
      { icon: '🎨', heading: 'Elige un Color', text: '¡Elige un color de fondo para tu burbuja de avatar. ¡Brillará detrás de tu cara en cada batalla!' },
      { icon: '💾', heading: 'Guarda tu Perfil', text: 'Pulsa "Guardar Perfil" cuando estés satisfecho. Tu avatar y nombre se guardan y aparecerán en todo el juego.' },
    ],
  },
};

export default function ProfileScreen({
  language, onToggleLanguage, profile, onSave, navigate,
}) {
  const [name, setName]   = useState(profile.name   ?? '');
  const [face, setFace]   = useState(profile.face   ?? '🧒');
  const [hat,  setHat]    = useState(profile.hat    ?? '');
  const [color, setColor] = useState(profile.color  ?? '#6a11cb');

  const [saved, setSaved] = useState(false);
  const [guideOpen, openGuide, closeGuide, isPulse] = useGuide('profile');
  const guide = PROFILE_GUIDE[language];

  function handleSave() {
    onSave({ name: name.trim().slice(0, 15), face, hat, color });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const draftProfile = { name, face, hat, color };

  return (
    <div className="screen profile-screen">
      <LanguageToggle language={language} onToggle={onToggleLanguage} />

      <button className="btn btn-ghost back-btn" onClick={() => navigate('home')}>
        ← {language === 'en' ? 'Back' : 'Atrás'}
      </button>

      <h2 className="profile-title">
        {language === 'en' ? '👤 Your Profile' : '👤 Tu Perfil'}
      </h2>

      {/* ---- Live Preview ---- */}
      <div className="profile-preview-card">
        <PlayerAvatar profile={draftProfile} size="xl" />
        <div className="profile-preview-name">
          {name.trim() || (language === 'en' ? 'Your Name' : 'Tu Nombre')}
        </div>
      </div>

      {/* ---- Name Input ---- */}
      <section className="profile-section">
        <h3 className="profile-section-title">
          ✏️ {language === 'en' ? 'Player Name' : 'Nombre del Jugador'}
        </h3>
        <input
          className="profile-name-input"
          type="text"
          maxLength={15}
          value={name}
          placeholder={language === 'en' ? 'Enter your name…' : 'Escribe tu nombre…'}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="profile-char-count">{name.length}/15</div>
      </section>

      {/* ---- Face Picker ---- */}
      <section className="profile-section">
        <h3 className="profile-section-title">
          😊 {language === 'en' ? 'Choose a Face' : 'Elige una Cara'}
        </h3>
        <div className="profile-face-grid">
          {FACES.map((f) => (
            <button
              key={f}
              className={`profile-pick-btn${face === f ? ' selected' : ''}`}
              onClick={() => setFace(f)}
              aria-label={f}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* ---- Hat Picker ---- */}
      <section className="profile-section">
        <h3 className="profile-section-title">
          🎩 {language === 'en' ? 'Accessory' : 'Accesorio'}
        </h3>
        <div className="profile-hat-row">
          {HATS.map((h) => (
            <button
              key={h.value}
              className={`profile-pick-btn${hat === h.value ? ' selected' : ''}`}
              onClick={() => setHat(h.value)}
              aria-label={h.label}
            >
              {h.value || '∅'}
            </button>
          ))}
        </div>
      </section>

      {/* ---- Color Picker ---- */}
      <section className="profile-section">
        <h3 className="profile-section-title">
          🎨 {language === 'en' ? 'Aura Color' : 'Color de Aura'}
        </h3>
        <div className="profile-color-row">
          {COLORS.map((c) => (
            <button
              key={c.value}
              className={`profile-color-btn${color === c.value ? ' selected' : ''}`}
              style={{ background: c.value }}
              onClick={() => setColor(c.value)}
              aria-label={c.label}
              title={c.label}
            />
          ))}
        </div>
      </section>

      {/* ---- Save ---- */}
      <button
        className={`btn btn-primary btn-large profile-save-btn${saved ? ' saved' : ''}`}
        onClick={handleSave}
        disabled={!name.trim()}
      >
        {saved
          ? (language === 'en' ? '✅ Saved!' : '✅ ¡Guardado!')
          : (language === 'en' ? '💾 Save Profile' : '💾 Guardar Perfil')}
      </button>

      {!name.trim() && (
        <p className="profile-name-hint">
          {language === 'en' ? '⬆️ Enter a name to save' : '⬆️ Escribe un nombre para guardar'}
        </p>
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
