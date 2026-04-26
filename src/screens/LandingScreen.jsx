import { useState, useEffect } from 'react';
import './LandingScreen.css';

export default function LandingScreen({ onEnter }) {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installDone, setInstallDone] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setInstallDone(true);
      setInstallPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    const result = await installPrompt.prompt();
    if (result.outcome === 'accepted') {
      setInstallDone(true);
      setInstallPrompt(null);
    }
  }

  return (
    <div className="landing-screen">
      <div className="landing-stars" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="landing-star" style={{ '--i': i }} />
        ))}
      </div>

      <div className="landing-content">
        <div className="landing-icon-wrap">
          <img src="/pwa-192x192.png" alt="Multiplicar Juego" className="landing-icon" />
        </div>

        <h1 className="landing-title">
          <span className="landing-title-mult">Multiplicar</span>
          <span className="landing-title-game">Juego ⚡</span>
        </h1>

        <p className="landing-tagline">
          ¡Aprende las tablas de multiplicar<br />con batallas de criaturas!
        </p>

        <div className="landing-creatures" aria-hidden="true">
          <span>🐲</span><span>⚔️</span><span>🐉</span>
        </div>

        <div className="landing-actions">
          {!installDone && installPrompt && (
            <button className="landing-btn landing-btn-install" onClick={handleInstall}>
              📲 Instala el juego ahora
            </button>
          )}

          {installDone && (
            <>
              <div className="landing-install-success">
                ✅ ¡Instalado! Busca el ícono en tu pantalla de inicio.
              </div>
              <button className="landing-btn landing-btn-play" onClick={onEnter}>
                🎮 ¡Jugar!
              </button>
            </>
          )}
        </div>

        {!installPrompt && !installDone && (
          <p className="landing-install-hint">
            💡 Para instalar: toca el menú del navegador y selecciona<br />
            <strong>"Añadir a pantalla de inicio"</strong>
          </p>
        )}
      </div>
    </div>
  );
}
