/**
 * Each creature has 3 evolution stages:
 *   Evo 1 (base)  — captured by beating the battle (≤3 strikes)
 *   Evo 2 (gold)  — beat the table again with PERFECT accuracy (0 strikes)
 *   Evo 3 (max)   — beat the table again perfectly + 8-second timer per question
 *
 * Images: creature_X.png / creature_X_evo2.png / creature_X_evo3.png
 */

const creatures = [
  {
    id: 2, table: 2,
    // Evo 1
    name: 'Gembit',   emoji: '🦊', image: '/creatures/creature_2.png',
    // Evo 2
    name2: 'Gembolt', image2: '/creatures/creature_2_evo2.png',
    // Evo 3
    name3: 'Gemstorm', image3: '/creatures/creature_2_evo3.png',
    maxHp: 60, hp: 60, attack: 8,
  },
  {
    id: 3, table: 3,
    name: 'Triflare',  emoji: '🦎', image: '/creatures/creature_3.png',
    name2: 'Triblaze', image2: '/creatures/creature_3_evo2.png',
    name3: 'Triferno', image3: '/creatures/creature_3_evo3.png',
    maxHp: 70, hp: 70, attack: 10,
  },
  {
    id: 4, table: 4,
    name: 'Crystox',    emoji: '🪨', image: '/creatures/creature_4.png',
    name2: 'Crystalith', image2: '/creatures/creature_4_evo2.png',
    name3: 'Crystodon', image3: '/creatures/creature_4_evo3.png',
    maxHp: 80, hp: 80, attack: 12,
  },
  {
    id: 5, table: 5,
    name: 'Pentafin',  emoji: '🐟', image: '/creatures/creature_5.png',
    name2: 'Pentawing', image2: '/creatures/creature_5_evo2.png',
    name3: 'Pentanaut', image3: '/creatures/creature_5_evo3.png',
    maxHp: 90, hp: 90, attack: 14,
  },
  {
    id: 6, table: 6,
    name: 'Hexabuzz',  emoji: '🐝', image: '/creatures/creature_6.png',
    name2: 'Hexaswarm', image2: '/creatures/creature_6_evo2.png',
    name3: 'Hexaqueen', image3: '/creatures/creature_6_evo3.png',
    maxHp: 100, hp: 100, attack: 16,
  },
  {
    id: 7, table: 7,
    name: 'Starlynx',  emoji: '🐱', image: '/creatures/creature_7.png',
    name2: 'Starveil', image2: '/creatures/creature_7_evo2.png',
    name3: 'Starblaze', image3: '/creatures/creature_7_evo3.png',
    maxHp: 110, hp: 110, attack: 18,
  },
  {
    id: 8, table: 8,
    name: 'Octavion',  emoji: '🐙', image: '/creatures/creature_8.png',
    name2: 'Octacrash', image2: '/creatures/creature_8_evo2.png',
    name3: 'Octaquake', image3: '/creatures/creature_8_evo3.png',
    maxHp: 120, hp: 120, attack: 20,
  },
  {
    id: 9, table: 9,
    name: 'Ninvara',   emoji: '🦅', image: '/creatures/creature_9.png',
    name2: 'Ninestar', image2: '/creatures/creature_9_evo2.png',
    name3: 'Ninegale', image3: '/creatures/creature_9_evo3.png',
    maxHp: 130, hp: 130, attack: 22,
  },
  {
    id: 10, table: 10,
    name: 'Decimus',  emoji: '🐉', image: '/creatures/creature_10.png',
    name2: 'Decimax', image2: '/creatures/creature_10_evo2.png',
    name3: 'Decimega', image3: '/creatures/creature_10_evo3.png',
    maxHp: 150, hp: 150, attack: 25,
  },
];

/** Returns the active name/image for a given evolution level (1, 2, or 3). */
export function getEvoDisplay(creature, evoLevel) {
  if (evoLevel >= 3) return { name: creature.name3, image: creature.image3 };
  if (evoLevel >= 2) return { name: creature.name2, image: creature.image2 };
  return { name: creature.name, image: creature.image };
}

export default creatures;
