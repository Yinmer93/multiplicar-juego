import { t } from '../data/translations';
import creatures from '../data/creatures';
import LanguageToggle from '../components/LanguageToggle';
import './ProgressScreen.css';

const UNLOCK_THRESHOLD = 0.8; // 80%

export default function ProgressScreen({
  language, onToggleLanguage, progress, navigate,
}) {
  return (
    <div className="screen progress-screen">
      <LanguageToggle language={language} onToggle={onToggleLanguage} />

      <button className="btn btn-ghost back-btn" onClick={() => navigate('home')}>
        ← {t(language, 'back')}
      </button>

      <h2 className="progress-title">{t(language, 'progressTitle')}</h2>

      <div className="progress-list">
        {creatures.map((creature, idx) => {
          const stats = progress[creature.table] ?? { correct: 0, total: 0 };
          const accuracy = stats.total > 0 ? stats.correct / stats.total : 0;
          const pct = Math.round(accuracy * 100);

          // Table 2 is always unlocked; others unlock at 80% of previous
          const prevTable = creatures[idx - 1];
          const prevStats = prevTable
            ? progress[prevTable.table] ?? { correct: 0, total: 0 }
            : null;
          const prevAccuracy = prevStats && prevStats.total > 0
            ? prevStats.correct / prevStats.total
            : idx === 0 ? 1 : 0;
          const isUnlocked = idx === 0 || prevAccuracy >= UNLOCK_THRESHOLD;

          const barColor = pct >= 80 ? '#4caf50' : pct >= 50 ? '#ff9800' : '#2196f3';

          return (
            <div key={creature.id} className={`progress-row ${!isUnlocked ? 'locked' : ''}`}>
              <div className="progress-row-header">
                <span className="progress-row-name">
                  {isUnlocked ? creature.emoji : '🔒'} {creature.name}
                </span>
                <span className="progress-row-table">×{creature.table}</span>
                <span className="progress-row-status">
                  {isUnlocked
                    ? t(language, 'unlocked')
                    : t(language, 'locked')}
                </span>
              </div>

              {isUnlocked && (
                <>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${pct}%`, background: barColor }}
                    />
                    <div className="progress-threshold-marker" />
                  </div>
                  <div className="progress-row-stats">
                    <span>{t(language, 'accuracy')}: {pct}%</span>
                    <span>
                      {t(language, 'questionsAnswered', {
                        correct: stats.correct,
                        total: stats.total,
                      })}
                    </span>
                  </div>
                </>
              )}

              {!isUnlocked && (
                <div className="progress-unlock-hint">
                  {t(language, 'unlockAt')} (×{prevTable?.table})
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
