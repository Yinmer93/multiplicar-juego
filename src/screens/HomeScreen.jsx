import { t } from '../data/translations';
import LanguageToggle from '../components/LanguageToggle';
import PlayerAvatar from '../components/PlayerAvatar';
import GuideModal, { GuideButton } from '../components/GuideModal';
import useGuide from '../hooks/useGuide';
import './HomeScreen.css';

const HOME_GUIDE = {
  en: {
    title: '🌟 How to Play',
    sections: [
      { icon: '🗺️', heading: 'Adventure Road', text: 'Travel the Adventure Road and unlock new multiplication tables one by one. Each zone has creatures to battle and capture!' },
      { icon: '📚', heading: 'Lessons First', text: 'Tap a table node on the map to enter the lesson. Study the facts, drill with flashcards, then pass the quiz (8/10) to unlock the battle.' },
      { icon: '⚔️', heading: 'Battle to Capture', text: 'Win the battle against a creature to earn the chance to catch it. The better you answer, the more damage you deal!' },
      { icon: '🔒', heading: 'Unlock the Next Zone', text: 'Capture a creature (or score 80%+ accuracy across battles) to master that table and open the path to the next one.' },
      { icon: '🪙', heading: 'Earn Coins', text: 'Correct answers earn coins. Spend them... soon! For now, collect them to show off your score.' },
    ],
  },
  es: {
    title: '🌟 Cómo Jugar',
    sections: [
      { icon: '🗺️', heading: 'Camino de Aventura', text: '¡Viaja por el Camino de Aventura y desbloquea tablas de multiplicar una por una. Cada zona tiene criaturas para batallar y capturar!' },
      { icon: '📚', heading: 'Primero las Lecciones', text: 'Toca un nodo en el mapa para entrar a la lección. Estudia los hechos, practica con tarjetas y pasa el quiz (8/10) para desbloquear la batalla.' },
      { icon: '⚔️', heading: 'Batalla para Capturar', text: '¡Gana la batalla para tener la oportunidad de atrapar la criatura. Cuanto mejor respondas, más daño harás!' },
      { icon: '🔒', heading: 'Desbloquea la Siguiente Zona', text: 'Captura una criatura (o logra 80%+ de precisión en batallas) para dominar esa tabla y abrir el camino a la siguiente.' },
      { icon: '🪙', heading: 'Gana Monedas', text: 'Las respuestas correctas ganan monedas. ¡Colecciónalas para mostrar tu puntaje!' },
    ],
  },
};

export default function HomeScreen({
  language, onToggleLanguage, coins, currentTable, soundOn, onToggleSound, profile, navigate,
}) {
  const [guideOpen, openGuide, closeGuide, isPulse] = useGuide('home');
  const guide = HOME_GUIDE[language];
  const hasProfile = profile?.name?.trim();

  return (
    <div className="screen home-screen">
      <LanguageToggle language={language} onToggle={onToggleLanguage} />

      <button
        className="sound-toggle"
        onClick={onToggleSound}
        title={soundOn ? 'Mute sounds' : 'Enable sounds'}
      >
        {soundOn ? '🔊' : '🔇'}
      </button>

      <div className="home-hero">
        {hasProfile ? (
          <div className="home-profile-hero" onClick={() => navigate('profile')} title="Edit profile">
            <PlayerAvatar profile={profile} size="lg" />
            <div className="home-profile-greeting">
              {language === 'en' ? `Hi, ${profile.name}!` : `¡Hola, ${profile.name}!`}
            </div>
          </div>
        ) : (
          <div className="home-mascot">🌟</div>
        )}
        <h1 className="home-title">{t(language, 'appTitle')}</h1>
        <div className="home-coins">
          🪙 {coins} {t(language, 'coins')}
        </div>
        <div className="home-table-info">
          {t(language, 'table')} ×{currentTable}
        </div>
      </div>

      <div className="home-buttons">
        <button
          className="btn btn-primary btn-large"
          onClick={() => navigate('map')}
        >
          🗺️ {language === 'en' ? 'Adventure Road' : 'Camino de Aventura'}
        </button>
        <button
          className="btn btn-secondary btn-large"
          onClick={() => navigate('collection')}
        >
          📚 {t(language, 'myCreatures')}
        </button>
        <button
          className="btn btn-outline btn-large"
          onClick={() => navigate('progress')}
        >
          📊 {t(language, 'progress')}
        </button>
        <button
          className="btn btn-outline btn-large"
          onClick={() => navigate('profile')}
        >
          👤 {language === 'en' ? 'My Profile' : 'Mi Perfil'}
        </button>
      </div>

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
