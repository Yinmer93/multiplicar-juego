import { useState } from 'react';
import { t } from '../data/translations';
import creatures from '../data/creatures';
import LanguageToggle from '../components/LanguageToggle';
import GuideModal, { GuideButton } from '../components/GuideModal';
import useGuide from '../hooks/useGuide';
import './MapScreen.css';

const UNLOCK_THRESHOLD = 0.8;

// Node positions as % of a 100×130 viewBox (taller map)
const NODE_POSITIONS = [
  { table: 2,  x: 18, y: 8  },
  { table: 3,  x: 50, y: 8  },
  { table: 4,  x: 82, y: 8  },
  { table: 5,  x: 82, y: 30 },
  { table: 6,  x: 50, y: 30 },
  { table: 7,  x: 18, y: 30 },
  { table: 8,  x: 18, y: 56 },
  { table: 9,  x: 50, y: 56 },
  { table: 10, x: 50, y: 80 },
];

// [from, to, control point x, control point y] for quadratic bezier
const PATH_SEGMENTS = [
  [2,  3,  34, 2  ],
  [3,  4,  66, 2  ],
  [4,  5,  88, 19 ],
  [5,  6,  66, 40 ],
  [6,  7,  34, 40 ],
  [7,  8,  12, 43 ],
  [8,  9,  34, 66 ],
  [9,  10, 50, 68 ],
];

const ZONE_COLOR = {
  2:'#66bb6a', 3:'#66bb6a', 4:'#42a5f5',
  5:'#29b6f6', 6:'#26c6da', 7:'#7c4dff',
  8:'#ab47bc', 9:'#ef5350', 10:'#b71c1c',
};

const ZONE_NAMES = {
  en: { 2:'Verdant Plains', 3:'Verdant Plains', 4:'Crystal Caves',
        5:'Crystal Caves', 6:'Crystal Caves', 7:'Sky Realm',
        8:'Sky Realm',     9:'Volcano Peak',  10:'Dragon Peak' },
  es: { 2:'Llanuras Verdes', 3:'Llanuras Verdes', 4:'Cuevas de Cristal',
        5:'Cuevas de Cristal', 6:'Cuevas de Cristal', 7:'Reino del Cielo',
        8:'Reino del Cielo', 9:'Pico Volcánico', 10:'Pico del Dragón' },
};

const ZONE_CLUSTER_LABELS = [
  { en: '🌿 Verdant Plains', es: '🌿 Llanuras Verdes', cx: 50, cy: 19, color: '#a5d6a7' },
  { en: '💎 Crystal Caves',  es: '💎 Cuevas de Cristal', cx: 66, cy: 40, color: '#80deea' },
  { en: '☁️ Sky Realm',      es: '☁️ Reino del Cielo', cx: 18, cy: 43, color: '#ce93d8' },
  { en: '🔥 Dragon Peak',    es: '🔥 Pico del Dragón', cx: 50, cy: 68, color: '#ef9a9a' },
];

export default function MapScreen({
  language, onToggleLanguage, progress, collection,
  currentTable, coins, onSelectTable, navigate,
}) {
  const [tooltip, setTooltip] = useState(null);
  const [guideOpen, openGuide, closeGuide, isPulse] = useGuide('map');

  const MAP_GUIDE = {
    en: {
      title: '🗺️ Adventure Road Guide',
      sections: [
        { icon: '👆', heading: 'Tap a Node to Practice', text: 'Each circle on the road represents a multiplication table (×2 through ×10). Tap an unlocked node to start the lesson.' },
        { icon: '🔒', heading: 'Locked Nodes', text: 'A locked node (🔒) means you must master the previous table first. Capture the creature or score 80%+ accuracy in battles to unlock the next one.' },
        { icon: '✓', heading: 'Mastered Tables', text: 'A green ✓ badge means you\'ve mastered that table! The yellow progress ring shows your battle accuracy so far.' },
        { icon: '⚡', heading: 'Captured Badge', text: 'The ⚡ badge means you\'ve captured the creature but haven\'t fully mastered the table through battles yet. Capturing always unlocks the next node!' },
        { icon: '🎯', heading: 'Mastery Rule', text: 'Get 80% or more correct answers across all your battles for a table — OR capture the creature — to master it and advance the road.' },
      ],
    },
    es: {
      title: '🗺️ Guía del Camino',
      sections: [
        { icon: '👆', heading: 'Toca un Nodo para Practicar', text: 'Cada círculo en el camino representa una tabla de multiplicar (×2 al ×10). Toca un nodo desbloqueado para comenzar la lección.' },
        { icon: '🔒', heading: 'Nodos Bloqueados', text: 'Un nodo bloqueado (🔒) significa que debes dominar la tabla anterior primero. Captura la criatura o logra 80%+ de precisión en batallas para desbloquear el siguiente.' },
        { icon: '✓', heading: 'Tablas Dominadas', text: '¡Una insignia ✓ verde significa que dominaste esa tabla! El anillo amarillo muestra tu precisión en batallas hasta ahora.' },
        { icon: '⚡', heading: 'Insignia de Captura', text: 'La insignia ⚡ significa que capturaste la criatura pero aún no dominas la tabla en batallas. ¡Capturar siempre desbloquea el siguiente nodo!' },
        { icon: '🎯', heading: 'Regla de Dominio', text: 'Obtén 80% o más de respuestas correctas en todas tus batallas para una tabla, O captura la criatura, para dominarla y avanzar en el camino.' },
      ],
    },
  };

  const guide = MAP_GUIDE[language];

  function getNodeStatus(creature, idx) {
    const stats = progress[creature.table] ?? { correct: 0, total: 0 };
    const accuracy = stats.total > 0 ? stats.correct / stats.total : 0;
    const isCaptured = collection.includes(creature.id);
    const isCompleted = accuracy >= UNLOCK_THRESHOLD || isCaptured;
    const prev = idx > 0 ? creatures[idx - 1] : null;
    const prevStats = prev ? (progress[prev.table] ?? { correct: 0, total: 0 }) : null;
    const prevAcc = prevStats && prevStats.total > 0 ? prevStats.correct / prevStats.total : idx === 0 ? 1 : 0;
    const prevCaptured = prev ? collection.includes(prev.id) : false;
    const isUnlocked = idx === 0 || prevAcc >= UNLOCK_THRESHOLD || prevCaptured;
    return { isCompleted, isUnlocked, isCaptured, accuracy };
  }

  const nodeData = creatures.map((creature, idx) => ({
    creature,
    pos: NODE_POSITIONS.find(p => p.table === creature.table),
    ...getNodeStatus(creature, idx),
  }));

  // SVG dimensions (viewBox units)
  const VW = 100, VH = 92;

  return (
    <div className="screen map-screen">
      <LanguageToggle language={language} onToggle={onToggleLanguage} />

      <div className="map-header">
        <button className="btn btn-ghost map-back" onClick={() => navigate('home')}>
          ← {t(language, 'back')}
        </button>
        <span className="map-coins">🪙 {coins}</span>
      </div>

      <h2 className="map-title">
        {language === 'en' ? '🗺️ Adventure Road' : '🗺️ Camino de Aventura'}
      </h2>

      <div className="map-container">
        <svg
          className="map-svg"
          viewBox={`0 0 ${VW} ${VH}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Zone label floats */}
          {ZONE_CLUSTER_LABELS.map((z, i) => (
            <text
              key={i}
              x={z.cx}
              y={z.cy}
              textAnchor="middle"
              className="map-zone-label"
              fill={z.color}
            >
              {z[language]}
            </text>
          ))}

          {/* Bezier path segments */}
          {PATH_SEGMENTS.map(([from, to, cx, cy]) => {
            const f = NODE_POSITIONS.find(p => p.table === from);
            const t2 = NODE_POSITIONS.find(p => p.table === to);
            const fromData = nodeData.find(n => n.creature.table === from);
            const active = fromData?.isCompleted;
            const d = `M ${f.x} ${f.y} Q ${cx} ${cy} ${t2.x} ${t2.y}`;
            return (
              <g key={`${from}-${to}`}>
                {/* Shadow path */}
                <path d={d} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="3.5" strokeLinecap="round" />
                {/* Main path */}
                <path
                  d={d} fill="none"
                  stroke={active ? '#ffd700' : '#444'}
                  strokeWidth={active ? '2.2' : '1.2'}
                  strokeLinecap="round"
                  strokeDasharray={active ? '5,3' : '2.5,3.5'}
                  opacity={active ? 1 : 0.5}
                  className={active ? 'path-active' : ''}
                />
              </g>
            );
          })}

          {/* Progress rings + node circles in SVG */}
          {nodeData.map(({ creature, pos, isCompleted, isUnlocked, isCaptured, accuracy }) => {
            const isCurrent = creature.table === currentTable && isUnlocked;
            const r = 4.8;
            const circ = 2 * Math.PI * r;
            const dash = accuracy * circ;
            const zc = ZONE_COLOR[creature.table];
            return (
              <g
                key={creature.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className={`map-svg-node${isUnlocked ? ' unlocked' : ' locked'}${isCurrent ? ' current' : ''}${isCompleted ? ' completed' : ''}`}
                onClick={() => isUnlocked && onSelectTable(creature.table)}
                onMouseEnter={() => setTooltip(creature.table)}
                onMouseLeave={() => setTooltip(null)}
                style={{ cursor: isUnlocked ? 'pointer' : 'not-allowed' }}
              >
                {/* Glow ring for current */}
                {isCurrent && (
                  <circle r="7.5" fill="none" stroke="#ffd700" strokeWidth="1.5"
                    opacity="0.5" className="node-glow-ring" />
                )}
                {/* Background circle */}
                <circle r="5.5"
                  fill={isUnlocked ? (isCompleted ? 'rgba(76,175,80,0.25)' : 'rgba(0,0,0,0.6)') : 'rgba(0,0,0,0.45)'}
                  stroke={isCurrent ? '#ffd700' : isCompleted ? '#66bb6a' : isUnlocked ? zc : '#555'}
                  strokeWidth={isCurrent ? '1.4' : '1'}
                />
                {/* Accuracy progress ring */}
                {isUnlocked && accuracy > 0 && (
                  <circle r={r}
                    fill="none"
                    stroke={isCompleted ? '#66bb6a' : '#ffd700'}
                    strokeWidth="1"
                    strokeDasharray={`${dash} ${circ - dash}`}
                    strokeLinecap="round"
                    transform="rotate(-90)"
                    opacity="0.85"
                  />
                )}
                {/* Table label below */}
                <text y="8.5" textAnchor="middle" className="map-node-svg-label">×{creature.table}</text>
                {/* Check badge */}
                {isCompleted && (
                  <g transform="translate(4.2, -4.2)">
                    <circle r="2.2" fill="#4caf50" stroke="#fff" strokeWidth="0.5" />
                    <text y="0.8" textAnchor="middle" style={{ fontSize: '2.5px', fill: '#fff', fontWeight: 900 }}>✓</text>
                  </g>
                )}
                {/* Captured badge */}
                {isCaptured && !isCompleted && (
                  <text x="4" y="-3.5" style={{ fontSize: '3.5px' }}>⚡</text>
                )}
                {/* Lock */}
                {!isUnlocked && (
                  <text y="1.5" textAnchor="middle" style={{ fontSize: '4px' }}>🔒</text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Creature images overlaid on top of SVG nodes */}
        {nodeData.map(({ creature, pos, isUnlocked }) => {
          if (!isUnlocked) return null;
          // Convert SVG % coords to CSS % (they use the same 100-unit scale)
          return (
            <div
              key={`img-${creature.id}`}
              className="map-node-img-overlay"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onMouseEnter={() => setTooltip(creature.table)}
              onMouseLeave={() => setTooltip(null)}
              onClick={() => onSelectTable(creature.table)}
            >
              <NodeImage creature={creature} />

              {tooltip === creature.table && (
                <div className="map-tooltip">
                  <strong>{creature.name}</strong>
                  <span>{ZONE_NAMES[language][creature.table]}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="map-legend">
        <span>🟡 {language === 'en' ? 'Current' : 'Actual'}</span>
        <span>✓ {language === 'en' ? 'Cleared' : 'Completado'}</span>
        <span>🔒 {language === 'en' ? 'Locked' : 'Bloqueado'}</span>
        <span>⚡ {language === 'en' ? 'Caught' : 'Capturado'}</span>
      </div>

      <GuideButton onClick={openGuide} className={isPulse ? 'guide-btn--pulse' : ''} />

      {guideOpen && (
        <GuideModal
          title={guide.title}
          sections={guide.sections}
          language={language}
          onClose={closeGuide}
        />
      )}
    </div>
  );
}

function NodeImage({ creature }) {
  const [imgError, setImgError] = useState(false);
  if (imgError) return <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{creature.emoji}</span>;
  return (
    <img
      src={creature.image}
      alt={creature.name}
      width={28} height={28}
      style={{ objectFit: 'contain', mixBlendMode: 'multiply', display: 'block' }}
      onError={() => setImgError(true)}
    />
  );
}

