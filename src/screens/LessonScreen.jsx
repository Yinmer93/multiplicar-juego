import { useState, useEffect, useRef } from 'react';
import { t } from '../data/translations';
import creatures from '../data/creatures';
import LanguageToggle from '../components/LanguageToggle';
import GuideModal, { GuideButton } from '../components/GuideModal';
import useGuide from '../hooks/useGuide';
import { playSound } from '../utils/sounds';
import './LessonScreen.css';

const QUIZ_PASS = 8;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function LessonScreen({ language, onToggleLanguage, currentTable, navigate }) {
  const creature = creatures.find((c) => c.table === currentTable);
  const facts = Array.from({ length: 10 }, (_, i) => ({
    n: i + 1,
    answer: currentTable * (i + 1),
  }));

  // phase: 'learn' | 'drill' | 'drill-recap' | 'quiz' | 'quiz-done'
  const [phase, setPhase] = useState('learn');

  const [guideOpen, openGuide, closeGuide, isPulse] = useGuide('lesson');

  const LESSON_GUIDE = {
    en: {
      title: '📚 How Lessons Work',
      sections: [
        { icon: '1️⃣', heading: 'Phase 1 — Study the Facts', text: 'All 10 multiplication facts for this table appear one by one. Read them carefully before moving on.' },
        { icon: '2️⃣', heading: 'Phase 2 — Flashcard Drill', text: 'Flip each card and honestly mark whether you knew it ("Know it ✓") or need more practice ("Still learning 🔁"). This helps sort what you need to focus on.' },
        { icon: '3️⃣', heading: 'Phase 3 — Quiz', text: 'Type the correct answer for each fact. You must get 8 out of 10 correct on the first try to unlock the battle. If you fail, try the quiz again!' },
        { icon: '⚔️', heading: 'Battle Unlock', text: 'The "Start Battle" button only appears after you pass the quiz with 8/10. This ensures you\'re ready to fight!' },
        { icon: '💡', heading: 'Tip', text: 'Unknown facts appear first in the quiz — the ones you marked "Still learning" — so you practice them more.' },
      ],
    },
    es: {
      title: '📚 Cómo Funcionan las Lecciones',
      sections: [
        { icon: '1️⃣', heading: 'Fase 1 — Estudia los Hechos', text: 'Los 10 hechos de multiplicación aparecen uno a uno. Léelos con cuidado antes de continuar.' },
        { icon: '2️⃣', heading: 'Fase 2 — Tarjetas', text: 'Voltea cada tarjeta y marca honestamente si la sabías ("Ya lo sé ✓") o necesitas más práctica ("Practicar más 🔁"). Esto ayuda a enfocar lo que necesitas repasar.' },
        { icon: '3️⃣', heading: 'Fase 3 — Quiz', text: 'Escribe la respuesta correcta para cada hecho. Debes obtener 8 de 10 correctas al primer intento para desbloquear la batalla. ¡Si fallas, repite el quiz!' },
        { icon: '⚔️', heading: 'Desbloqueo de Batalla', text: 'El botón "Iniciar Batalla" solo aparece después de pasar el quiz con 8/10. ¡Esto asegura que estás listo para pelear!' },
        { icon: '💡', heading: 'Consejo', text: 'Los hechos desconocidos aparecen primero en el quiz — los que marcaste "Practicar más" — para que practiques más esos.' },
      ],
    },
  };

  const guide = LESSON_GUIDE[language];

  // ---- Learn phase
  const [visible, setVisible] = useState(0);

  // ---- Drill phase
  const [drillIdx, setDrillIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownSet, setKnownSet] = useState(new Set());

  // ---- Quiz phase
  const [quizFacts, setQuizFacts] = useState([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizInput, setQuizInput] = useState('');
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [attempted, setAttempted] = useState(false);
  const [firstTrySet, setFirstTrySet] = useState(new Set());
  const [quizScore, setQuizScore] = useState(0);

  const inputRef = useRef(null);

  // Stagger fact reveal in learn phase
  useEffect(() => {
    if (phase !== 'learn' || visible >= 10) return;
    const timer = setTimeout(() => setVisible((v) => v + 1), 120);
    return () => clearTimeout(timer);
  }, [phase, visible]);

  function startDrill() {
    setDrillIdx(0);
    setFlipped(false);
    setKnownSet(new Set());
    setPhase('drill');
  }

  function flipCard() {
    if (!flipped) setFlipped(true);
  }

  function markCard(knew) {
    const next = new Set(knownSet);
    if (knew) next.add(facts[drillIdx].n);
    setKnownSet(next);
    if (drillIdx + 1 >= facts.length) {
      setPhase('drill-recap');
    } else {
      setDrillIdx((i) => i + 1);
      setFlipped(false);
    }
  }

  function startQuiz() {
    const unknown = facts.filter((f) => !knownSet.has(f.n));
    const known   = facts.filter((f) =>  knownSet.has(f.n));
    setQuizFacts([...shuffle(unknown), ...shuffle(known)]);
    setQuizIdx(0);
    setQuizInput('');
    setQuizFeedback(null);
    setFirstTrySet(new Set());
    setAttempted(false);
    setQuizScore(0);
    setPhase('quiz');
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function handleQuizSubmit(e) {
    e?.preventDefault();
    if (quizFeedback === 'correct') return;
    const fact = quizFacts[quizIdx];
    const val = parseInt(quizInput, 10);
    if (val === fact.answer) {
      playSound('correct');
      let newSet = new Set(firstTrySet);
      if (!attempted) {
        newSet.add(quizIdx);
        setFirstTrySet(newSet);
        setQuizScore(newSet.size);
      }
      setQuizFeedback('correct');
      setAttempted(false);
      setTimeout(() => {
        setQuizFeedback(null);
        setQuizInput('');
        if (quizIdx + 1 >= quizFacts.length) {
          setPhase('quiz-done');
        } else {
          setQuizIdx((i) => i + 1);
          setTimeout(() => inputRef.current?.focus(), 50);
        }
      }, 700);
    } else {
      playSound('wrong');
      setAttempted(true);
      setQuizFeedback('wrong');
    }
  }

  // ========== PHASE: LEARN ==========
  if (phase === 'learn') {
    return (
      <div className="screen lesson-screen">
        <LanguageToggle language={language} onToggle={onToggleLanguage} />
        <button className="btn btn-ghost back-btn" onClick={() => navigate('map')}>
          ← {t(language, 'back')}
        </button>

        <div className="lesson-phase-header">
          <span className="lesson-phase-badge">1 / 3</span>
          <h2 className="lesson-title">{t(language, 'lessonTitle', { table: currentTable })}</h2>
        </div>

        {creature && (
          <div className="lesson-creature lesson-creature--bounce">
            <CreatureImage creature={creature} />
            <span className="lesson-creature-name">{creature.name}</span>
          </div>
        )}

        <div className="lesson-tip">
          <strong>💡 {t(language, 'lessonTip')}:</strong>
          <p>{t(language, `tip${currentTable}`)}</p>
        </div>

        <div className="lesson-facts-grid">
          {facts.map((f, i) => (
            <div key={f.n} className={`lesson-fact-card${i < visible ? ' visible' : ''}`}>
              <span className="lesson-fact-mult">{currentTable} × {f.n}</span>
              <span className="lesson-fact-eq"> = </span>
              <strong className="lesson-fact-ans">{f.answer}</strong>
            </div>
          ))}
        </div>

        <button
          className="btn btn-primary btn-large lesson-next-btn"
          disabled={visible < 10}
          onClick={startDrill}
        >
          {language === 'en' ? '🃏 Flashcard Drill →' : '🃏 Tarjetas →'}
        </button>

        <GuideButton onClick={openGuide} className={isPulse ? 'guide-btn--pulse' : ''} />
        {guideOpen && <GuideModal title={guide.title} sections={guide.sections} language={language} onClose={closeGuide} />}
      </div>
    );
  }

  // ========== PHASE: DRILL ==========
  if (phase === 'drill') {
    const currentFact = facts[drillIdx];
    return (
      <div className="screen lesson-screen lesson-screen--drill">
        <LanguageToggle language={language} onToggle={onToggleLanguage} />

        <div className="lesson-phase-header">
          <span className="lesson-phase-badge">2 / 3</span>
          <h2 className="lesson-title">
            {language === 'en' ? '🃏 Flashcard Drill' : '🃏 Práctica con Tarjetas'}
          </h2>
        </div>

        <div className="drill-progress">
          {facts.map((_, i) => (
            <div
              key={i}
              className={`drill-dot${i < drillIdx ? ' done' : i === drillIdx ? ' current' : ''}`}
            />
          ))}
        </div>
        <p className="drill-counter">{drillIdx + 1} / {facts.length}</p>

        <div
          className={`flip-card${flipped ? ' flipped' : ''}`}
          onClick={flipCard}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && flipCard()}
        >
          <div className="flip-card-inner">
            <div className="flip-card-front">
              <span className="flip-label">
                {language === 'en' ? 'What is...' : '¿Cuánto es...'}
              </span>
              <div className="flip-question">{currentTable} × {currentFact.n} = ?</div>
              <div className="flip-tap-hint">
                {language === 'en' ? '(tap to flip)' : '(toca para ver)'}
              </div>
            </div>
            <div className="flip-card-back">
              <span className="flip-label">
                {language === 'en' ? 'Answer' : 'Respuesta'}
              </span>
              <div className="flip-question">{currentTable} × {currentFact.n}</div>
              <div className="flip-answer">= {currentFact.answer}</div>
            </div>
          </div>
        </div>

        {flipped ? (
          <div className="drill-buttons">
            <button className="btn drill-btn-unsure" onClick={() => markCard(false)}>
              🔁 {language === 'en' ? 'Still learning' : 'Practicar más'}
            </button>
            <button className="btn drill-btn-know" onClick={() => markCard(true)}>
              ✓ {language === 'en' ? 'I know it!' : '¡Lo sé!'}
            </button>
          </div>
        ) : (
          <p className="drill-tap-hint-bottom">
            {language === 'en' ? 'Do you remember the answer?' : '¿Recuerdas la respuesta?'}
          </p>
        )}

        <GuideButton onClick={openGuide} className={isPulse ? 'guide-btn--pulse' : ''} />
        {guideOpen && <GuideModal title={guide.title} sections={guide.sections} language={language} onClose={closeGuide} />}
      </div>
    );
  }

  // ========== PHASE: DRILL RECAP ==========
  if (phase === 'drill-recap') {
    return (
      <div className="screen lesson-screen lesson-screen--recap">
        <LanguageToggle language={language} onToggle={onToggleLanguage} />

        <div className="lesson-phase-header">
          <span className="lesson-phase-badge">2 / 3</span>
          <h2 className="lesson-title">
            {language === 'en' ? '📊 Drill Complete!' : '📊 ¡Práctica Completada!'}
          </h2>
        </div>

        <div className="recap-score">
          <div className="recap-circle">
            <span className="recap-num">{knownSet.size}</span>
            <span className="recap-denom">/ 10</span>
          </div>
          <p className="recap-label">
            {language === 'en' ? 'facts you already know' : 'hechos que ya sabes'}
          </p>
        </div>

        <div className="recap-facts">
          {facts.map((f) => (
            <div key={f.n} className={`recap-fact ${knownSet.has(f.n) ? 'known' : 'unknown'}`}>
              <span>{currentTable} × {f.n} = {f.answer}</span>
              <span>{knownSet.has(f.n) ? '✓' : '🔁'}</span>
            </div>
          ))}
        </div>

        <button className="btn btn-primary btn-large lesson-next-btn" onClick={startQuiz}>
          {language === 'en' ? '✏️ Start Quiz →' : '✏️ Iniciar Quiz →'}
        </button>

        <GuideButton onClick={openGuide} className={isPulse ? 'guide-btn--pulse' : ''} />
        {guideOpen && <GuideModal title={guide.title} sections={guide.sections} language={language} onClose={closeGuide} />}
      </div>
    );
  }

  // ========== PHASE: QUIZ ==========
  if (phase === 'quiz') {
    const fact = quizFacts[quizIdx];
    const progressPct = (quizIdx / quizFacts.length) * 100;
    return (
      <div className="screen lesson-screen lesson-screen--quiz">
        <LanguageToggle language={language} onToggle={onToggleLanguage} />

        <div className="lesson-phase-header">
          <span className="lesson-phase-badge">3 / 3</span>
          <h2 className="lesson-title">
            {language === 'en' ? '✏️ Quiz Time!' : '✏️ ¡Hora del Quiz!'}
          </h2>
        </div>

        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="quiz-score-line">
          {language === 'en'
            ? `First-try correct: ${quizScore} / ${QUIZ_PASS} needed`
            : `Correctas al primer intento: ${quizScore} / ${QUIZ_PASS} necesarias`}
        </div>

        <div className="quiz-question-card">
          <div className="quiz-q-num">{quizIdx + 1} / {quizFacts.length}</div>
          <div className="quiz-q-text">{currentTable} × {fact.n} = ?</div>
        </div>

        <form className="quiz-input-row" onSubmit={handleQuizSubmit}>
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            value={quizInput}
            onChange={(e) => { setQuizInput(e.target.value); setQuizFeedback(null); }}
            className="quiz-input"
            placeholder="?"
            disabled={quizFeedback === 'correct'}
          />
          <button
            type="submit"
            className="btn btn-primary quiz-submit-btn"
            disabled={quizFeedback === 'correct'}
          >
            ✓
          </button>
        </form>

        {quizFeedback === 'correct' && (
          <div className="quiz-feedback quiz-feedback--correct">
            🎉 {language === 'en' ? 'Correct!' : '¡Correcto!'}
          </div>
        )}
        {quizFeedback === 'wrong' && (
          <div className="quiz-feedback quiz-feedback--wrong">
            <div>❌ {language === 'en' ? 'Not quite — try again!' : '¡Casi! Intenta de nuevo'}</div>
            <div className="quiz-hint">
              {language === 'en' ? 'Hint: ' : 'Pista: '}
              {currentTable} × {fact.n} = <strong>{fact.answer}</strong>
            </div>
          </div>
        )}

        <GuideButton onClick={openGuide} className={isPulse ? 'guide-btn--pulse' : ''} />
        {guideOpen && <GuideModal title={guide.title} sections={guide.sections} language={language} onClose={closeGuide} />}
      </div>
    );
  }

  // ========== PHASE: QUIZ DONE ==========
  if (phase === 'quiz-done') {
    const passed = quizScore >= QUIZ_PASS;
    return (
      <div className={`screen lesson-screen lesson-screen--quiz-done ${passed ? 'passed' : 'not-passed'}`}>
        <LanguageToggle language={language} onToggle={onToggleLanguage} />

        <div className="quiz-done-icon">{passed ? '🏆' : '💪'}</div>
        <h2 className="lesson-title quiz-done-title">
          {passed
            ? (language === 'en' ? "You're Ready!" : '¡Estás Listo!')
            : (language === 'en' ? 'Keep Practicing!' : '¡Sigue Practicando!')}
        </h2>

        <div className="quiz-done-score">
          <span className="quiz-done-num">{quizScore}</span>
          <span className="quiz-done-denom"> / 10</span>
        </div>

        <p className="quiz-done-message">
          {passed
            ? (language === 'en'
                ? 'Amazing! You know this table well. Time to battle!'
                : '¡Increíble! Conoces bien esta tabla. ¡A batallar!')
            : (language === 'en'
                ? `You got ${quizScore}/10. Try again to sharpen those facts!`
                : `Obtuviste ${quizScore}/10. ¡Practica más para mejorar!`)}
        </p>

        <div className="quiz-done-buttons">
          <button className="btn btn-secondary btn-large" onClick={startQuiz}>
            🔄 {language === 'en' ? 'Try Quiz Again' : 'Repetir Quiz'}
          </button>
          {passed && (
            <button
              className="btn btn-primary btn-large lesson-battle-btn"
              onClick={() => navigate('battle')}
            >
              ⚔️ {t(language, 'startBattle')}
            </button>
          )}
        </div>

        <GuideButton onClick={openGuide} className={isPulse ? 'guide-btn--pulse' : ''} />
        {guideOpen && <GuideModal title={guide.title} sections={guide.sections} language={language} onClose={closeGuide} />}
      </div>
    );
  }

  return null;
}

function CreatureImage({ creature }) {
  const [imgError, setImgError] = useState(false);
  if (imgError) {
    return <span className="creature-emoji-lg">{creature.emoji}</span>;
  }
  return (
    <img
      src={creature.image}
      alt={creature.name}
      className="lesson-creature-img"
      onError={() => setImgError(true)}
      style={{ mixBlendMode: 'multiply' }}
    />
  );
}

