const translations = {
  en: {
    // Home
    appTitle: 'Multiply Masters',
    startGame: 'Start Game',
    myCreatures: 'My Creatures',
    progress: 'Progress',
    coins: 'Coins',
    table: 'Table',

    // Lesson
    lessonTitle: 'Learn the ×{table} Table',
    lessonTip: 'Tip',
    lessonPractice: 'Practice Questions',
    lessonCorrect: '✓ Correct!',
    lessonWrong: '✗ Wrong — the answer was {answer}',
    startBattle: 'Start Battle!',
    back: 'Back',

    // Tips per table (keyed by table number)
    tip2: 'Multiplying by 2 is the same as doubling a number. 2×6 = 6+6 = 12',
    tip3: 'Add the digits of your answer — if they sum to 3, 6, or 9, it\'s in the ×3 table!',
    tip4: 'Multiplying by 4 is the same as doubling twice. 4×7 = 2×7×2 = 28',
    tip5: 'Every multiple of 5 ends in 0 or 5. Easy to spot!',
    tip6: 'Multiply by 3, then double the result. 6×8 = 3×8×2 = 48',
    tip7: 'The ×7 table takes practice. Try: 7, 14, 21, 28, 35, 42, 49, 56, 63, 70',
    tip8: 'Multiplying by 8 is doubling three times. 8×6 = 2×2×2×6 = 48',
    tip9: 'A ×9 trick: the digits always add up to 9! (9×7=63, 6+3=9)',
    tip10: 'Multiplying by 10 just adds a zero at the end. 10×8 = 80',

    // Battle
    battleTitle: 'Battle!',
    vs: 'VS',
    questionPrompt: 'What is {a} × {b}?',
    submitAnswer: 'Submit',
    playerName: 'You',
    timeLeft: 'Time',
    feedbackCorrect: '🎉 Great!',
    feedbackWrong: '😬 Try again!',
    feedbackTimeout: '⏰ Too slow!',

    // Reward
    youWin: '🏆 You Win!',
    youLose: '😔 You Lose!',
    captured: 'You captured {name}!',
    coinsEarned: '+{coins} coins',
    alreadyCaptured: 'Already in your collection!',
    tryAgain: 'Try Again',
    goHome: 'Go Home',
    catchCreature: 'Catch {name}!',

    // Collection
    collectionTitle: 'My Creatures',
    collectionEmpty: 'No creatures yet — win battles to catch them!',
    tableLabel: 'Table ×{table}',

    // Progress
    progressTitle: 'Progress',
    accuracy: 'Accuracy',
    locked: '🔒 Locked',
    unlocked: '✅ Unlocked',
    unlockAt: 'Reach 80% to unlock',
    questionsAnswered: '{correct}/{total} correct',
  },

  es: {
    // Home
    appTitle: 'Maestros de Multiplicar',
    startGame: 'Iniciar Juego',
    myCreatures: 'Mis Criaturas',
    progress: 'Progreso',
    coins: 'Monedas',
    table: 'Tabla',

    // Lesson
    lessonTitle: 'Aprende la tabla del ×{table}',
    lessonTip: 'Consejo',
    lessonPractice: 'Preguntas de Práctica',
    lessonCorrect: '✓ ¡Correcto!',
    lessonWrong: '✗ Incorrecto — la respuesta era {answer}',
    startBattle: '¡Iniciar Batalla!',
    back: 'Atrás',

    tip2: 'Multiplicar por 2 es como duplicar un número. 2×6 = 6+6 = 12',
    tip3: 'Suma los dígitos del resultado — si suman 3, 6 o 9, ¡pertenece a la tabla del 3!',
    tip4: 'Multiplicar por 4 es duplicar dos veces. 4×7 = 2×7×2 = 28',
    tip5: 'Todo múltiplo de 5 termina en 0 o 5. ¡Muy fácil de identificar!',
    tip6: 'Multiplica por 3, luego dobla el resultado. 6×8 = 3×8×2 = 48',
    tip7: 'La tabla del 7 requiere práctica. Intenta: 7, 14, 21, 28, 35, 42, 49, 56, 63, 70',
    tip8: 'Multiplicar por 8 es duplicar tres veces. 8×6 = 2×2×2×6 = 48',
    tip9: '¡Truco del 9: los dígitos siempre suman 9! (9×7=63, 6+3=9)',
    tip10: 'Multiplicar por 10 solo añade un cero al final. 10×8 = 80',

    // Battle
    battleTitle: '¡Batalla!',
    vs: 'VS',
    questionPrompt: '¿Cuánto es {a} × {b}?',
    submitAnswer: 'Enviar',
    playerName: 'Tú',
    timeLeft: 'Tiempo',
    feedbackCorrect: '🎉 ¡Excelente!',
    feedbackWrong: '😬 ¡Inténtalo de nuevo!',
    feedbackTimeout: '⏰ ¡Muy lento!',

    // Reward
    youWin: '🏆 ¡Ganaste!',
    youLose: '😔 ¡Perdiste!',
    captured: '¡Capturaste a {name}!',
    coinsEarned: '+{coins} monedas',
    alreadyCaptured: '¡Ya está en tu colección!',
    tryAgain: 'Intentar de Nuevo',
    goHome: 'Ir al Inicio',
    catchCreature: '¡Atrapar a {name}!',

    // Collection
    collectionTitle: 'Mis Criaturas',
    collectionEmpty: '¡Aún no tienes criaturas — gana batallas para atraparlas!',
    tableLabel: 'Tabla ×{table}',

    // Progress
    progressTitle: 'Progreso',
    accuracy: 'Precisión',
    locked: '🔒 Bloqueado',
    unlocked: '✅ Desbloqueado',
    unlockAt: 'Llega al 80% para desbloquear',
    questionsAnswered: '{correct}/{total} correctas',
  },
};

// Helper: interpolate {variable} placeholders
export function t(lang, key, vars = {}) {
  let str = translations[lang]?.[key] ?? translations['en']?.[key] ?? key;
  Object.entries(vars).forEach(([k, v]) => {
    str = str.replaceAll(`{${k}}`, v);
  });
  return str;
}

export default translations;
