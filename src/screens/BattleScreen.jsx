import { useState, useEffect, useRef, useCallback } from 'react';
import { t } from '../data/translations';
import creatures from '../data/creatures';
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
const PLAYER_MAX_HP = 100;
const COINS_PER_CORRECT = 10;

export default function BattleScreen({
  language, onToggleLanguage, currentTable, weights, profile,
  onBattleEnd, onWeightsUpdate, onProgressUpdate,
}) {
  const creature = creatures.find((c) => c.table === currentTable);
  const pool = useRef(generateQuestionPool(currentTable, weights));
  const [guideOpen, openGuide, closeGuide, isPulse] = useGuide('battle');

  const BATTLE_GUIDE = {
    en: {
      title: '⚔️ How Battles Work',
      sections: [
        { icon: '❓', heading: 'Answer Questions', text: `You'll face ${TOTAL_QUESTIONS} multiplication questions from the ×${currentTable} table. Type the correct answer and press the check button.` },
        { icon: '⏱️', heading: `${TIMER_SECONDS}-Second Timer`, text: 'You have 15 seconds per question. Run out of time and the creature attacks — just like a wrong answer!' },
        { icon: '⚡', heading: 'Correct = You Attack', text: 'A correct answer deals damage to the creature. Answer all questions right to knock it out quickly!' },
        { icon: '💥', heading: 'Wrong = You Take Damage', text: 'A wrong answer or timeout lets the creature hit you. Your HP drops — lose all HP and the battle ends early.' },
        { icon: '🏆', heading: 'Win = Catch Chance', text: 'Win the battle and you\'ll get the chance to catch the creature. Catching it masters the table and unlocks the next zone!' },
        { icon: '🎯', heading: 'Accuracy Matters', text: 'Get 80%+ correct answers across your battles to fully master the table — even without catching. Your accuracy ring on the map shows your progress.' },
      ],
    },
    es: {
      title: '⚔️ Cómo Funcionan las Batallas',
      sections: [
        { icon: '❓', heading: 'Responde Preguntas', text: `Tendrás ${TOTAL_QUESTIONS} preguntas de multiplicación de la tabla ×${currentTable}. Escribe la respuesta correcta y presiona el botón de verificación.` },
        { icon: '⏱️', heading: `Temporizador de ${TIMER_SECONDS} Segundos`, text: 'Tienes 15 segundos por pregunta. ¡Si se acaba el tiempo, la criatura ataca, igual que una respuesta incorrecta!' },
        { icon: '⚡', heading: 'Correcto = Tú Atacas', text: '¡Una respuesta correcta hace daño a la criatura. Responde todo bien para vencerla rápidamente!' },
        { icon: '💥', heading: 'Incorrecto = Recibes Daño', text: 'Una respuesta incorrecta o tiempo agotado deja que la criatura te golpee. Tu HP baja, y si llega a cero, la batalla termina.' },
        { icon: '🏆', heading: 'Ganar = Oportunidad de Captura', text: '¡Gana la batalla para tener la oportunidad de atrapar la criatura. Capturarla domina la tabla y desbloquea la siguiente zona!' },
        { icon: '🎯', heading: 'La Precisión Importa', text: 'Obtén 80%+ de respuestas correctas en tus batallas para dominar completamente la tabla. Tu anillo de precisión en el mapa muestra tu progreso.' },
      ],
    },
  };
  const battleGuide = BATTLE_GUIDE[language];

  const [enemyHp, setEnemyHp] = useState(creature.maxHp);
  const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [questionCount, setQuestionCount] = useState(0);
  const [currentQ, setCurrentQ] = useState(() => pickQuestion(pool.current, null));
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | 'timeout'
  const [inputDisabled, setInputDisabled] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const correctCountRef = useRef(0);
  const totalCountRef = useRef(0);
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
    const damage = creature.attack;
    setPlayerHp((hp) => {
      const next = Math.max(0, hp - damage);
      return next;
    });
    const newWeights = updateWeight(weights, currentQ.key, false);
    onWeightsUpdate(newWeights);
    setTimeout(() => advanceQuestion(), 1200);
  }, [creature.attack, currentQ, weights]);

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

  // Mid-battle instant-KO: if player HP hits 0 before all questions are done
  useEffect(() => {
    if (playerHp <= 0) {
      onProgressUpdate(currentTable, correctCountRef.current, totalCountRef.current);
      onBattleEnd('lose', 0);
    }
  }, [playerHp]);

  function advanceQuestion() {
    const nextCount = questionCount + 1;
    if (nextCount >= TOTAL_QUESTIONS) {
      // Battle over — evaluate winner by remaining HP
      const didWin = enemyHp > 0 && playerHp > 0
        ? enemyHp < playerHp  // whoever has less HP loses
        : enemyHp <= 0;
      onProgressUpdate(currentTable, correctCountRef.current, totalCountRef.current);
      onBattleEnd(didWin ? 'win' : 'lose', coinsEarned);
      return;
    }
    setQuestionCount(nextCount);
    lastKeyRef.current = currentQ.key;
    setCurrentQ(pickQuestion(pool.current, lastKeyRef.current));
    setFeedback(null);
    setInputDisabled(false);
    setTimeLeft(TIMER_SECONDS);
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
      const dmg = Math.ceil(PLAYER_MAX_HP / TOTAL_QUESTIONS);
      setEnemyHp((hp) => Math.max(0, hp - dmg));
      setCoinsEarned((c) => c + COINS_PER_CORRECT);
    } else {
      setFeedback('wrong');
      playSound('wrong');
      playSound('hurt');
      flashPlayerHurt();
      const dmg = creature.attack;
      setPlayerHp((hp) => Math.max(0, hp - dmg));
    }

    setTimeout(() => advanceQuestion(), 1200);
  }

  function getFeedbackText() {
    if (feedback === 'correct') return t(language, 'feedbackCorrect');
    if (feedback === 'wrong')   return t(language, 'feedbackWrong');
    if (feedback === 'timeout') return t(language, 'feedbackTimeout');
    return null;
  }

  return (
    <div className={`screen battle-screen${playerHurt ? ' player-hurt' : ''}`}>
      <LanguageToggle language={language} onToggle={onToggleLanguage} />

      <h2 className="battle-title">{t(language, 'battleTitle')}</h2>

      <div className="battle-status">
        <div className="battle-side player-side">
          <HPBar current={playerHp} max={PLAYER_MAX_HP} label={t(language, 'playerName')} />
        </div>
        <div className="battle-vs">{t(language, 'vs')}</div>
        <div className="battle-side enemy-side">
          <HPBar current={enemyHp} max={creature.maxHp} label={creature.name} />
        </div>
      </div>

      <div className="battle-arena">
        <div className={`battle-player${playerHurt ? ' battle-player--hurt' : ''}`}>
          <PlayerAvatar profile={profile} size="md" showName={false} />
        </div>
        <div className="battle-enemy">
          <CreatureImage creature={creature} shake={feedback === 'correct'} hit={enemyHit} />
        </div>
      </div>

      <TimerBar timeLeft={timeLeft} maxTime={TIMER_SECONDS} />

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

function CreatureImage({ creature, shake, hit }) {
  const [imgError, setImgError] = useState(false);
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
        src={creature.image}
        alt={creature.name}
        className={`battle-creature-img ${shake ? 'shake' : ''}`}
        onError={() => setImgError(true)}
        style={{ mixBlendMode: 'multiply' }}
      />
    </div>
  );
}
