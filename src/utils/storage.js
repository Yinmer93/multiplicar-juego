const KEYS = {
  progress: 'mmg_progress',
  collection: 'mmg_collection',
  coins: 'mmg_coins',
  weights: 'mmg_weights',
  profile: 'mmg_profile',
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// progress: { [table]: { correct: number, total: number } }
export function getProgress() {
  return load(KEYS.progress, {});
}
export function saveProgress(progress) {
  save(KEYS.progress, progress);
}

// collection: array of creature ids already captured
export function getCollection() {
  return load(KEYS.collection, []);
}
export function saveCollection(collection) {
  save(KEYS.collection, collection);
}

// coins: number
export function getCoins() {
  return load(KEYS.coins, 0);
}
export function saveCoins(coins) {
  save(KEYS.coins, coins);
}

// weights: { [questionKey like "3x7"]: number (>=1) }
export function getWeights() {
  return load(KEYS.weights, {});
}
export function saveWeights(weights) {
  save(KEYS.weights, weights);
}

// profile: { name, face, hat, color }
export const DEFAULT_PROFILE = { name: '', face: '🧒', hat: '', color: '#6a11cb' };
export function getProfile() {
  return load(KEYS.profile, DEFAULT_PROFILE);
}
export function saveProfile(profile) {
  save(KEYS.profile, profile);
}
