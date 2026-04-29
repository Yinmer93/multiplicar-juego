import { useState, useEffect, useRef, useCallback } from 'react';
import { t } from '../data/translations';
import creatures from '../data/creatures';
import { getEvoDisplay } from '../data/creatures';
import HPBar from '../components/HPBar';
import TimerBar from '../components/TimerBar';
import QuestionInput from '../components/QuestionInput';
import LanguageToggle from '../components/LanguageToggle';
import PlayerAvatar from '../components/PlayerAvatar';
import GuideModal, { GuideButton } from '../components/GuideModal';
import useGuide from '../hooks/useGuide';
import { generateQuestionPool, pickQuestion } from '../utils/questionGenerator';
import { updateWeight } from '../utils/spacedRepetition';
import { playSound } from '../utils/sounds';
import './BattleScreen.css';

const TOTAL_QUESTIONS = 5;
const TIMER_SECONDS = 15;
const EVO3_TIMER_SECONDS = 8;  // speed challenge timer for Evo 3
const MAX_STRIKES = 3;         // normal battle: 3 wrong/timeout = instant lose
const COINS_PER_CORRECT = 10;

export default function BattleScreen({
  language, onToggleLanguage, currentTable, weights, profile,
  evolutionMode,          // null | 2 | 3
  onBattleEnd, onWeightsUpdate, onProgressUpdate,
}) {
  const creature = creatures.find((c) => c.table === currentTable);
  const pool = useRef(generateQuestionPool(currentTable, weights));
  const [guideOpen, openGuide, closeGuide, isPulse] = useGuide('battle');
  // In evo3 mode the timer is tighter
  const timerSeconds = evolutionMode === 3 ? EVO3_TIMER_SECONDS : TIMER_SECONDS;
  // Evo battles require 0 strikes (any mistake = instant loss)
  const isEvoBattle = evolutionMode === 2 || evolutionMode === 3;
  // Display the correct creature art for the evo level being challenged
  const evoDisplay = evolutionMode ? getEvoDisplay(creature, evolutionMode) : { name: creature.name, image: creature.image };

  const BATTLE_GUIDE = {
    en: {
      title: '⚔️ How Battles Work',
      sections: [
        { icon: '❓', heading: 'Answer Questions', text: `You'll face ${TOTAL_QUESTIONS} multiplication questions from the ×${currentTable} table. Type the correct answer and press the check button.` },
        { icon: '⏱️', heading: `${TIMER_SECONDS}-Second Timer`, text: 'You have 15 seconds per question. Run out of time and the creature attacks — just like a wrong answer!' },
        { icon: '⚡', heading: 'Correct = You Attack', text: 'A correct answer deals damage to the creature. Answer all questions right to knock it out quickly!' },
        { icon: '💥', heading: '3 Strikes = You Lose', text: `A wrong answer or timeout costs you one ❤️. Lose all ${MAX_STRIKES} hearts and the battle ends — you can't catch the creature!` },
        { icon: '🏆', heading: 'Win = Catch Chance', text: 'Survive all questions with at least one heart left and you\'ll get the chance to catch the creature. Catching it masters the table and unlocks the next zone!' },
        { icon: '🎯', heading: 'Accuracy Matters', text: 'Get 80%+ correct answers across your battles to fully master the table — even without catching. Your accuracy ring on the map shows your progress.' },
      ],
    },
    es: {
      title: '⚔️ Cómo Funcionan las Batallas',
      sections: [
        { icon: '❓', heading: 'Responde Preguntas', text: `Tendrás ${TOTAL_QUESTIONS} preguntas de multiplicación de la tabla ×${currentTable}. Escribe la respuesta correcta y presiona el botón de verificación.` },
        { icon: '⏱️', heading: `Temporizador de ${TIMER_SECONDS} Segundos`, text: 'Tienes 15 segundos por pregunta. ¡Si se acaba el tiempo, la criatura ataca, igual que una respuesta incorrecta!' },
        { icon: '⚡', heading: 'Correcto = Tú Atacas', text: '¡Una respuesta correcta hace daño a la criatura. Responde todo bien para vencerla rápidamente!' },
        { icon: '💥', heading: '3 Golpes = Pierdes', text: `Una respuesta incorrecta o tiempo agotado te cuesta un ❤️. ¡Pierde los ${MAX_STRIKES} corazones y la batalla termina!` },
        { icon: '🏆', heading: 'Ganar = Oportunidad de Captura', text: '¡Sobrevive todas las preguntas con al menos un corazón y tendrás la oportunidad de atrapar la criatura!' },
        { icon: '🎯', heading: 'La Precisión Importa', text: 'Obtén 80%+ de respuestas correctas en tus batallas para dominar completamente la tabla. Tu anillo de precisión en el mapa muestra tu progreso.' },
      ],
    },
  };
  const battleGuide = BATTLE_GUIDE[language];

  const [enemyHp, setEnemyHp] = useState(creature.maxHp);
  const [strikes, setStrikes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const [questionCount, setQuestionCount] = useState(0);
  const [currentQ, setCurrentQ] = useState(() => pickQuestion(pool.current, null));
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | 'timeout'
  const [inputDisabled, setInputDisabled] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  // Refs for closure-safe access inside setTimeout callbacks
  const correctCountRef = useRef(0);
  const totalCountRef = useRef(0);
  const strikesRef = useRef(0);
  const questionCountRef = useRef(0);
  const coinsEarnedRef = useRef(0);
  const lastKeyRef = useRef(null);
  const timerRef = useRef(null);
  const [playerHurt, setPlayerHurt] = useState(false);
  const [enemyHit, setEnemyHit] = useState(false);

  function flashPlayerHurt() {
    setPlayerHurt(true);
    setTimeout(() => setPlayerHurt(false), 520);
  }

  function flashEnemyHit() {
    setEnemyHit(true);
    setTimeout(() => setEnemyHit(false), 520);
  }

  const handleTimeout = useCallback(() => {
    setFeedback('timeout');
    setInputDisabled(true);
    playSound('hurt');
    flashPlayerHurt();
    totalCountRef.current += 1;
    const newWeights = updateWeight(weights, currentQ.key, false);
    onWeightsUpdate(newWeights);
    strikesRef.current += 1;
    setStrikes(strikesRef.current);
    // In evo battles ANY mistake = instant loss
    if (isEvoBattle || strikesRef.current >= MAX_STRIKES) {
      setTimeout(() => {
        onProgressUpdate(currentTable, correctCountRef.current, totalCountRef.current);
        onBattleEnd('lose', 0);
      }, 1400);
    } else {
      setTimeout(() => advanceQuestion(), 1200);
    }
  }, [currentQ, weights, isEvoBattle]);

  // Countdown timer
  useEffect(() => {
    if (inputDisabled) return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, inputDisabled, handleTimeout]);

  // advanceQuestion uses refs to avoid stale-closure bugs inside setTimeout
  function advanceQuestion() {
    questionCountRef.current += 1;
    if (questionCountRef.current >= TOTAL_QUESTIONS) {
      onProgressUpdate(currentTable, correctCountRef.current, totalCountRef.current);
      onBattleEnd('win', coinsEarnedRef.current);
      return;
    }
    setQuestionCount(questionCountRef.current);
    lastKeyRef.current = currentQ.key;
    setCurrentQ(pickQuestion(pool.current, lastKeyRef.current));
    setFeedback(null);
    setInputDisabled(false);
    setTimeLeft(timerSeconds);
  }

  function handleAnswer(value) {
    clearTimeout(timerRef.current);
    setInputDisabled(true);

    const correct = value === currentQ.answer;
    const newWeights = updateWeight(weights, currentQ.key, correct);
    onWeightsUpdate(newWeights);

    totalCountRef.current += 1;
    if (correct) {
      correctCountRef.current += 1;
      setFeedback('correct');
      playSound('correct');
      playSound('hit');
      flashEnemyHit();
      // Scale damage so 5 correct answers always KO the enemy
      const dmg = Math.ceil(creature.maxHp / TOTAL_QUESTIONS);
      setEnemyHp((hp) => Math.max(0, hp - dmg));
      coinsEarnedRef.current += COINS_PER_CORRECT;
      setCoinsEarned(coinsEarnedRef.current);
      setTimeout(() => advanceQuestion(), 1200);
    } else {
      setFeedback('wrong');
      playSound('wrong');
      playSound('hurt');
      flashPlayerHurt();
      strikesRef.current += 1;
      setStrikes(strikesRef.current);
      // In evo battles ANY mistake = instant loss
      if (isEvoBattle || strikesRef.current >= MAX_STRIKES) {
        setTimeout(() => {
          onProgressUpdate(currentTable, correctCountRef.current, totalCountRef.current);
          onBattleEnd('lose', 0);
        }, 1400);
      } else {
        setTimeout(() => advanceQuestion(), 1200);
      }
    }
  }

  function getFeedbackText() {
    if (feedback === 'correct') return t(language, 'feedbackCorrect');
    if (feedback === 'wrong')   return t(language, 'feedbackWrong');
    if (feedback === 'timeout') return t(language, 'feedbackTimeout');
    return null;
  }

  return (
    <div className={`screen battle-screen${playerHurt ? ' player-hurt' : ''}${isEvoBattle ? ` battle-screen--evo${evolutionMode}` : ''}`}>
      <LanguageToggle language={language} onToggle={onToggleLanguage} />

      <h2 className="battle-title">
        {isEvoBattle
          ? (evolutionMode === 3
              ? (language === 'en' ? `⚡ Speed Trial: ×${currentTable}` : `⚡ Prueba de Velocidad: ×${currentTable}`)
              : (language === 'en' ? `✨ Evolution Battle: ×${currentTable}` : `✨ Batalla de Evolución: ×${currentTable}`))
          : t(language, 'battleTitle')}
      </h2>

      {isEvoBattle && (
        <div className="battle-evo-badge">
          {evolutionMode === 3
            ? (language === 'en' ? '🌟 No mistakes + 8s per question!' : '🌟 ¡Sin errores + 8s por pregunta!')
            : (language === 'en' ? '✨ No mistakes allowed!' : '✨ ¡Sin errores permitidos!')}
        </div>
      )}

      <div className="battle-status">
        <div className="battle-side player-side">
          <div className="battle-strikes">
            <span className="battle-strikes-label">{t(language, 'playerName')}</span>
            <div className="battle-hearts">
              {isEvoBattle ? (
                // Evo battles show a single shield — any hit breaks it
                <span className={`battle-heart${strikes > 0 ? ' battle-heart--lost' : ''}`}>
                  {strikes > 0 ? '💔' : '🛡️'}
                </span>
              ) : (
                Array.from({ length: MAX_STRIKES }).map((_, i) => (
                  <span key={i} className={`battle-heart${i < strikes ? ' battle-heart--lost' : ''}`}>
                    {i < strikes ? '🖤' : '❤️'}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="battle-vs">{t(language, 'vs')}</div>
        <div className="battle-side enemy-side">
          <HPBar current={enemyHp} max={creature.maxHp} label={evoDisplay.name} />
        </div>
      </div>

      <div className="battle-arena">
        <div className={`battle-player${playerHurt ? ' battle-player--hurt' : ''}`}>
          <PlayerAvatar profile={profile} size="md" showName={false} />
        </div>
        <div className="battle-enemy">
          <CreatureImage creature={creature} evoImage={evoDisplay.image} shake={feedback === 'correct'} hit={enemyHit} />
        </div>
      </div>

      <TimerBar timeLeft={timeLeft} maxTime={timerSeconds} urgent={evolutionMode === 3} />

      <div className="battle-question">
        {t(language, 'questionPrompt', { a: currentQ.a, b: currentQ.b })}
      </div>

      <QuestionInput
        onSubmit={handleAnswer}
        disabled={inputDisabled}
        label={t(language, 'submitAnswer')}
      />

      {feedback && (
        <div className={`battle-feedback battle-feedback--${feedback}`}>
          {getFeedbackText()}
          {feedback === 'wrong' && (
            <div className="battle-answer-reveal">= {currentQ.answer}</div>
          )}
          {feedback === 'timeout' && (
            <div className="battle-answer-reveal">= {currentQ.answer}</div>
          )}
        </div>
      )}

      <div className="battle-progress">
        {t(language, 'coins')}: 🪙 {coinsEarned} &nbsp;|&nbsp; Q {questionCount + 1}/{TOTAL_QUESTIONS}
      </div>

      <GuideButton onClick={openGuide} className={isPulse ? 'guide-btn--pulse' : ''} />
      {guideOpen && (
        <GuideModal
          title={battleGuide.title}
          sections={battleGuide.sections}
          language={language}
          onClose={closeGuide}
        />
      )}
    </div>
  );
}

function CreatureImage({ creature, evoImage, shake, hit }) {
  const [imgError, setImgError] = useState(false);
  const src = evoImage || creature.image;
  const cls = [
    'battle-creature-img',
    shake ? 'shake' : '',
    hit   ? 'hit-flash' : '',
  ].filter(Boolean).join(' ');
  if (imgError) {
    return <span className={cls} style={{ fontSize: '5rem' }}>{creature.emoji}</span>;
  }
  return (
    <div className={`creature-hit-wrapper${hit ? ' hit-flash' : ''}`}>
      <img
        src={src}
        alt={creature.name}
        className={`battle-creature-img ${shake ? 'shake' : ''}`}
        onError={() => setImgError(true)}
        style={{ mixBlendMode: 'multiply' }}
      />
    </div>
  );
}
