/**
 * Generates a pool of weighted questions for a given multiplication table.
 * Returns an array of { a, b, answer, key } objects.
 * Questions with higher weights appear more times in the pool.
 *
 * @param {number} table - the multiplier (2–10)
 * @param {object} weights - { [key]: weight }
 * @param {number} poolSize - total items in the weighted pool
 */
export function generateQuestionPool(table, weights, poolSize = 30) {
  const base = [];

  // Build all 10 questions for this table (table × 1 … table × 10)
  for (let i = 1; i <= 10; i++) {
    const key = `${table}x${i}`;
    const weight = weights[key] ?? 1;
    base.push({ a: table, b: i, answer: table * i, key, weight });
  }

  // Expand into weighted pool
  const pool = [];
  base.forEach((q) => {
    const count = Math.max(1, Math.round(q.weight));
    for (let j = 0; j < count; j++) {
      pool.push(q);
    }
  });

  // Shuffle the pool
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Return a slice of the requested size (cycling if needed)
  const result = [];
  for (let i = 0; i < poolSize; i++) {
    result.push(pool[i % pool.length]);
  }
  return result;
}

/**
 * Picks the next question from a pool, avoiding repeating the last key.
 */
export function pickQuestion(pool, lastKey) {
  const filtered = pool.filter((q) => q.key !== lastKey);
  const source = filtered.length > 0 ? filtered : pool;
  return source[Math.floor(Math.random() * source.length)];
}
