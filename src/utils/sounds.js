import { Howl } from 'howler';

// SFX files
const soundFiles = {
  correct: '/sounds/correct.mp3',
  wrong:   '/sounds/wrong.mp3',
  hit:     '/sounds/hit.mp3',
  hurt:    '/sounds/hurt.mp3',
  win:     '/sounds/win.mp3',
  lose:    '/sounds/lose.mp3',
  capture: '/sounds/capture.mp3',
};

// Music files (looping background tracks)
const musicFiles = {
  overworld: '/sounds/overworld.mp3',
  battle:    '/sounds/battle.mp3',
};

const sounds = {};
const musicInstances = {};
let soundsEnabled = true;
let currentMusicName = null;
let currentMusicHowl = null;

// Lazy-load SFX
function getSound(name) {
  if (!sounds[name]) {
    sounds[name] = new Howl({
      src: [soundFiles[name]],
      volume: 0.6,
      onloaderror: () => {},
    });
  }
  return sounds[name];
}

// Lazy-load music
function getMusic(name) {
  if (!musicInstances[name]) {
    musicInstances[name] = new Howl({
      src: [musicFiles[name]],
      loop: true,
      volume: 0,
      onloaderror: () => {},
    });
  }
  return musicInstances[name];
}

export function playSound(name) {
  if (!soundsEnabled) return;
  try {
    getSound(name).play();
  } catch {
    // Ignore any playback errors
  }
}

export function playMusic(name) {
  if (!soundsEnabled) return;
  if (currentMusicName === name && currentMusicHowl && currentMusicHowl.playing()) return;
  try {
    // Fade out current track
    if (currentMusicHowl) {
      const old = currentMusicHowl;
      old.fade(old.volume(), 0, 600);
      setTimeout(() => old.stop(), 650);
    }
    currentMusicName = name;
    const music = getMusic(name);
    currentMusicHowl = music;
    music.volume(0);
    music.play();
    music.fade(0, 0.35, 800);
  } catch {
    // Ignore
  }
}

export function stopMusic() {
  if (currentMusicHowl) {
    const old = currentMusicHowl;
    old.fade(old.volume(), 0, 600);
    setTimeout(() => old.stop(), 650);
    currentMusicName = null;
    currentMusicHowl = null;
  }
}

export function setSoundsEnabled(enabled) {
  soundsEnabled = enabled;
  if (!enabled && currentMusicHowl) {
    currentMusicHowl.stop();
    currentMusicName = null;
    currentMusicHowl = null;
  }
}

export function isSoundsEnabled() {
  return soundsEnabled;
}
