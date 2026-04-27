import { useState, useEffect } from 'react';
import LandingScreen from './screens/LandingScreen';
import HomeScreen from './screens/HomeScreen';
import { setSoundsEnabled, playMusic } from './utils/sounds';
import MapScreen from './screens/MapScreen';
import LessonScreen from './screens/LessonScreen';
import BattleScreen from './screens/BattleScreen';
import RewardScreen from './screens/RewardScreen';
import CollectionScreen from './screens/CollectionScreen';
import ProgressScreen from './screens/ProgressScreen';
import ProfileScreen from './screens/ProfileScreen';
import creatures from './data/creatures';
import {
  getProgress, saveProgress,
  getCollection, saveCollection,
  getCoins, saveCoins,
  getWeights, saveWeights,
  getProfile, saveProfile, DEFAULT_PROFILE,
} from './utils/storage';
import './App.css';

const UNLOCK_THRESHOLD = 0.8;

function resolveDefaultTable(progress, collection) {
  let lastUnlocked = creatures[0].table;
  for (let i = 0; i < creatures.length; i++) {
    if (i === 0) { lastUnlocked = creatures[i].table; continue; }
    const prev = creatures[i - 1];
    const prevStats = progress[prev.table] ?? { correct: 0, total: 0 };
    const prevAcc = prevStats.total > 0 ? prevStats.correct / prevStats.total : 0;
    const prevCaptured = collection.includes(prev.id);
    if (prevAcc >= UNLOCK_THRESHOLD || prevCaptured) lastUnlocked = creatures[i].table;
    else break;
  }
  return lastUnlocked;
}

function App() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  const [screen, setScreen] = useState(isStandalone ? 'home' : 'landing');
  const [language, setLanguage] = useState('en');
  const [progress, setProgress] = useState(() => getProgress());
  const [collection, setCollection] = useState(() => getCollection());
  const [coins, setCoins] = useState(() => getCoins());
  const [weights, setWeights] = useState(() => getWeights());
  const [currentTable, setCurrentTable] = useState(() => resolveDefaultTable(getProgress(), getCollection()));
  const [battleTable, setBattleTable] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [profile, setProfile] = useState(() => getProfile());

  function handleSaveProfile(newProfile) {
    setProfile(newProfile);
    saveProfile(newProfile);
  }

  function toggleSound() {
    setSoundOn((prev) => {
      setSoundsEnabled(!prev);
      return !prev;
    });
  }

  // Switch music tracks based on current screen
  useEffect(() => {
    if (!soundOn) return;
    const overworldScreens = ['home', 'map', 'lesson', 'collection', 'progress', 'profile'];
    const battleScreens = ['battle', 'reward'];
    if (overworldScreens.includes(screen)) playMusic('overworld');
    else if (battleScreens.includes(screen)) playMusic('battle');
  }, [screen, soundOn]);

  function navigate(target) {
    if (target === 'battle') setBattleTable(currentTable);
    setScreen(target);
  }

  function handleSelectTable(table) {
    setCurrentTable(table);
    setScreen('lesson');
  }

  function toggleLanguage() {
    setLanguage((l) => (l === 'en' ? 'es' : 'en'));
  }

  function handleWeightsUpdate(newWeights) {
    setWeights(newWeights);
    saveWeights(newWeights);
  }

  function handleBattleEnd(result, earned) {
    setBattleResult(result);
    setCoinsEarned(earned);
    if (result === 'win') {
      const newCoins = coins + earned;
      setCoins(newCoins);
      saveCoins(newCoins);
    }
    setScreen('reward');
  }

  function handleCapture(creatureId) {
    if (!collection.includes(creatureId)) {
      const newCollection = [...collection, creatureId];
      setCollection(newCollection);
      saveCollection(newCollection);
    }
  }

  function handleAdvanceToNextTable(capturedTable) {
    const idx = creatures.findIndex((c) => c.table === capturedTable);
    if (idx !== -1 && idx < creatures.length - 1) {
      const nextTable = creatures[idx + 1].table;
      setCurrentTable(nextTable);
      setScreen('lesson');
    } else {
      setScreen('collection');
    }
  }

  function handleProgressUpdate(table, correct, total) {
    const prev = progress[table] ?? { correct: 0, total: 0 };
    const updated = {
      ...progress,
      [table]: {
        correct: prev.correct + correct,
        total: prev.total + total,
      },
    };
    setProgress(updated);
    saveProgress(updated);
  }

  const commonProps = { language, onToggleLanguage: toggleLanguage };

  return (
    <div className="app-container">
      {screen === 'landing' && (
        <LandingScreen onEnter={() => setScreen('home')} />
      )}
      {screen === 'home' && (
        <HomeScreen
          {...commonProps}
          coins={coins}
          currentTable={currentTable}
          soundOn={soundOn}
          onToggleSound={toggleSound}
          profile={profile}
          navigate={navigate}
        />
      )}
      {screen === 'map' && (
        <MapScreen
          {...commonProps}
          progress={progress}
          collection={collection}
          currentTable={currentTable}
          coins={coins}
          onSelectTable={handleSelectTable}
          navigate={navigate}
        />
      )}
      {screen === 'lesson' && (
        <LessonScreen
          {...commonProps}
          currentTable={currentTable}
          navigate={navigate}
        />
      )}
      {screen === 'battle' && (
        <BattleScreen
          {...commonProps}
          currentTable={currentTable}
          weights={weights}
          profile={profile}
          onBattleEnd={handleBattleEnd}
          onWeightsUpdate={handleWeightsUpdate}
          onProgressUpdate={handleProgressUpdate}
        />
      )}
      {screen === 'reward' && (
        <RewardScreen
          {...commonProps}
          battleResult={battleResult}
          currentTable={battleTable ?? currentTable}
          coinsEarned={coinsEarned}
          collection={collection}
          onCapture={handleCapture}
          onNextTable={handleAdvanceToNextTable}
          navigate={navigate}
        />
      )}
      {screen === 'collection' && (
        <CollectionScreen
          {...commonProps}
          collection={collection}
          navigate={navigate}
        />
      )}
      {screen === 'progress' && (
        <ProgressScreen
          {...commonProps}
          progress={progress}
          navigate={navigate}
        />
      )}
      {screen === 'profile' && (
        <ProfileScreen
          {...commonProps}
          profile={profile}
          onSave={handleSaveProfile}
          navigate={navigate}
        />
      )}
    </div>
  );
}

export default App;
