/**
 * Updates the weight for a question key.
 * Correct answers halve the weight (min 1).
 * Wrong answers increase the weight by 2.
 */
export function updateWeight(weights, questionKey, wasCorrect) {
  const current = weights[questionKey] ?? 1;
  const next = wasCorrect
    ? Math.max(1, Math.floor(current / 2))
    : current + 2;
  return { ...weights, [questionKey]: next };
}
