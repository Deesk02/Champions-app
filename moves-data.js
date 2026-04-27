// ==========================================
// CHAMPIONS MOVES DICTIONARY (A - C)
// ==========================================

window.MoveDex = {
    // --- A ---
    'absorb': { bp: 20, type: 'grass', category: 'special', drainFraction: 0.5 },
    'accelerock': { bp: 40, type: 'rock', category: 'physical', contact: true, priority: 1 },
    'acrobatics': { bp: 55, type: 'flying', category: 'physical', contact: true, doubleBpNoItem: true },
    'aerial-ace': { bp: 60, type: 'flying', category: 'physical', contact: true, bypassesAccuracy: true, flags: { slicing: true } },
    'air-slash': { bp: 75, type: 'flying', category: 'special', secondary: { flinchChance: 30 }, flags: { slicing: true } },
    'apple-acid': { bp: 80, type: 'grass', category: 'special', secondary: { dropsSpDef: 100 } },
    'aqua-cutter': { bp: 70, type: 'water', category: 'physical', critRatioBoost: 1, flags: { slicing: true } },
    'aqua-jet': { bp: 40, type: 'water', category: 'physical', contact: true, priority: 1 },
    'aqua-step': { bp: 80, type: 'water', category: 'physical', contact: true, selfBoosts: { speed: 1 } },
    'armor-cannon': { bp: 120, type: 'fire', category: 'special', selfDrops: { defense: 1, spDef: 1 } },
    'astral-barrage': { bp: 120, type: 'ghost', category: 'special', target: 'allAdjacentFoes' },
    'aura-sphere': { bp: 80, type: 'fighting', category: 'special', bypassesAccuracy: true, flags: { pulse: true } },
    'aurora-veil': { type: 'ice', category: 'status', requiresWeather: 'snow', setsSideCondition: 'aurora-veil' },
    'avalanche': { bp: 60, type: 'ice', category: 'physical', contact: true, priority: -4, doubleBpIfDamaged: true },

    // --- B ---
    'baneful-bunker': { type: 'poison', category: 'status', priority: 4, protects: true, contactPoison: true },
    'behemoth-bash': { bp: 100, type: 'steel', category: 'physical', contact: true, doubleBpAgainstDynamax: true },
    'behemoth-blade': { bp: 100, type: 'steel', category: 'physical', contact: true, doubleBpAgainstDynamax: true },
    'belly-drum': { type: 'normal', category: 'status', hpCostFraction: 0.5, selfBoosts: { attack: 12 } }, // +12 forces max
    'bitter-blade': { bp: 90, type: 'fire', category: 'physical', contact: true, drainFraction: 0.5, flags: { slicing: true } },
    'blizzard': { bp: 110, type: 'ice', category: 'special', secondary: { freezeChance: 10 }, bypassesAccuracyInWeather: 'snow' },
    'body-press': { bp: 80, type: 'fighting', category: 'physical', contact: true, usesDefenseStat: true },
    'body-slam': { bp: 85, type: 'normal', category: 'physical', contact: true, secondary: { paralysisChance: 30 } },
    'boomburst': { bp: 140, type: 'normal', category: 'special', target: 'allAdjacent', flags: { sound: true } },
    'brave-bird': { bp: 120, type: 'flying', category: 'physical', contact: true, recoilFraction: 0.33 },
    'brick-break': { bp: 75, type: 'fighting', category: 'physical', contact: true, breaksScreens: true },
    'bug-buzz': { bp: 90, type: 'bug', category: 'special', secondary: { dropsSpDefChance: 10 }, flags: { sound: true } },
    'bulk-up': { type: 'fighting', category: 'status', selfBoosts: { attack: 1, defense: 1 } },
    'bulldoze': { bp: 60, type: 'ground', category: 'physical', target: 'allAdjacent', secondary: { dropsSpeedChance: 100 } },
    'bullet-punch': { bp: 40, type: 'steel', category: 'physical', contact: true, priority: 1, flags: { punch: true } },
    'bullet-seed': { bp: 25, type: 'grass', category: 'physical', multiHit: [2, 5], flags: { bullet: true } },

    // --- C ---
    'calm-mind': { type: 'psychic', category: 'status', selfBoosts: { spAtk: 1, spDef: 1 } },
    'ceaseless-edge': { bp: 65, type: 'dark', category: 'physical', contact: true, setsHazard: 'spikes', flags: { slicing: true } },
    'charge-beam': { bp: 50, type: 'electric', category: 'special', secondary: { boostsSpAtkChance: 70 } },
    'chloroblast': { bp: 150, type: 'grass', category: 'special', recoilFraction: 0.5 },
    'circle-throw': { bp: 60, type: 'fighting', category: 'physical', contact: true, priority: -6, forcesSwitch: true },
    'clear-smog': { bp: 50, type: 'poison', category: 'special', resetsTargetStats: true },
    'close-combat': { bp: 120, type: 'fighting', category: 'physical', contact: true, selfDrops: { defense: 1, spDef: 1 } },
    'coil': { type: 'poison', category: 'status', selfBoosts: { attack: 1, defense: 1, accuracy: 1 } },
    'collision-course': { bp: 100, type: 'fighting', category: 'physical', contact: true, superEffectiveMultiplierBoost: 1.33 },
    'cotton-guard': { type: 'grass', category: 'status', selfBoosts: { defense: 3 } },
    'crabhammer': { bp: 100, type: 'water', category: 'physical', contact: true, critRatioBoost: 1 },
    'cross-chop': { bp: 100, type: 'fighting', category: 'physical', contact: true, critRatioBoost: 1 },
    'cross-poison': { bp: 70, type: 'poison', category: 'physical', contact: true, critRatioBoost: 1, secondary: { poisonChance: 10 }, flags: { slicing: true } },
    'crunch': { bp: 80, type: 'dark', category: 'physical', contact: true, secondary: { dropsDefenseChance: 20 }, flags: { bite: true } },
    'curse': { type: 'ghost', category: 'status', customCurseLogic: true },
    // --- D ---
    'dark-pulse': { bp: 80, type: 'dark', category: 'special', secondary: { flinchChance: 20 }, flags: { pulse: true } },
    'dazzling-gleam': { bp: 80, type: 'fairy', category: 'special', target: 'allAdjacentFoes' },
    'defog': { type: 'flying', category: 'status', clearsHazards: true, clearsTerrain: true, bypassesProtect: true },
    'destiny-bond': { type: 'ghost', category: 'status', setsCondition: 'destiny-bond' },
    'discharge': { bp: 80, type: 'electric', category: 'special', target: 'allAdjacent', secondary: { paralysisChance: 30 } },
    'double-edge': { bp: 120, type: 'normal', category: 'physical', contact: true, recoilFraction: 0.33 },
    'draco-meteor': { bp: 130, type: 'dragon', category: 'special', selfDrops: { spAtk: 2 } },
    'dragon-claw': { bp: 80, type: 'dragon', category: 'physical', contact: true },
    'dragon-dance': { type: 'dragon', category: 'status', selfBoosts: { attack: 1, speed: 1 } },
    'dragon-darts': { bp: 50, type: 'dragon', category: 'physical', multiHit: 2 },
    'dragon-pulse': { bp: 85, type: 'dragon', category: 'special', flags: { pulse: true } },
    'drain-punch': { bp: 75, type: 'fighting', category: 'physical', contact: true, drainFraction: 0.5, flags: { punch: true } },
    'dynamax-cannon': { bp: 100, type: 'dragon', category: 'special', doubleBpAgainstDynamax: true },

    // --- E ---
    'earth-power': { bp: 90, type: 'ground', category: 'special', secondary: { dropsSpDefChance: 10 } },
    'earthquake': { bp: 100, type: 'ground', category: 'physical', target: 'allAdjacent', doubleBpAgainstDig: true },
    'energy-ball': { bp: 90, type: 'grass', category: 'special', secondary: { dropsSpDefChance: 10 }, flags: { bullet: true } },
    'eruption': { bp: 150, type: 'fire', category: 'special', target: 'allAdjacentFoes', damageScalesWithHp: true },
    'expanding-force': { bp: 80, type: 'psychic', category: 'special', terrainBoost: 'psychic', hitsAllFoesInTerrain: true },
    'extreme-speed': { bp: 80, type: 'normal', category: 'physical', contact: true, priority: 2 },

    // --- F ---
    'facade': { bp: 70, type: 'normal', category: 'physical', contact: true, doubleBpIfStatused: true, ignoresBurnDrop: true },
    'fake-out': { bp: 40, type: 'normal', category: 'physical', contact: true, priority: 3, secondary: { flinchChance: 100 }, firstTurnOnly: true },
    'fire-blast': { bp: 110, type: 'fire', category: 'special', secondary: { burnChance: 10 } },
    'fire-punch': { bp: 75, type: 'fire', category: 'physical', contact: true, secondary: { burnChance: 10 }, flags: { punch: true } },
    'flamethrower': { bp: 90, type: 'fire', category: 'special', secondary: { burnChance: 10 } },
    'flare-blitz': { bp: 120, type: 'fire', category: 'physical', contact: true, recoilFraction: 0.33, secondary: { burnChance: 10 }, thawsUser: true },
    'flash-cannon': { bp: 80, type: 'steel', category: 'special', secondary: { dropsSpDefChance: 10 } },
    'flip-turn': { bp: 60, type: 'water', category: 'physical', contact: true, forcesSwitch: true },
    'focus-blast': { bp: 120, type: 'fighting', category: 'special', secondary: { dropsSpDefChance: 10 }, flags: { bullet: true } },
    'foul-play': { bp: 95, type: 'dark', category: 'physical', contact: true, usesTargetAttack: true },
    'freeze-dry': { bp: 70, type: 'ice', category: 'special', superEffectiveAgainst: ['water'], secondary: { freezeChance: 10 } },

    // --- G ---
    'giga-drain': { bp: 75, type: 'grass', category: 'special', drainFraction: 0.5 },
    'glare': { type: 'normal', category: 'status', secondary: { paralysisChance: 100 }, bypassesGhostImmunity: true },
    'grass-knot': { bp: 1, type: 'grass', category: 'special', contact: true, damageScalesWithWeight: true },
    'grassy-glide': { bp: 55, type: 'grass', category: 'physical', contact: true, terrainPriorityBoost: 'grassy' },
    'gunk-shot': { bp: 120, type: 'poison', category: 'physical', secondary: { poisonChance: 30 } },
    'gyro-ball': { bp: 1, type: 'steel', category: 'physical', contact: true, damageScalesWithSpeedRatio: true },

    // --- H ---
    'heal-bell': { type: 'normal', category: 'status', curesPartyStatus: true, flags: { sound: true } },
    'healing-wish': { type: 'psychic', category: 'status', sacrificesUser: true, fullyHealsReplacement: true },
    'heat-wave': { bp: 95, type: 'fire', category: 'special', target: 'allAdjacentFoes', secondary: { burnChance: 10 } },
    'heavy-slam': { bp: 1, type: 'steel', category: 'physical', contact: true, damageScalesWithWeightRatio: true },
    'high-jump-kick': { bp: 130, type: 'fighting', category: 'physical', contact: true, crashDamageFraction: 0.5 },
    'hurricane': { bp: 110, type: 'flying', category: 'special', secondary: { confusionChance: 30 }, bypassesAccuracyInWeather: 'rain' },
    'hydro-pump': { bp: 110, type: 'water', category: 'special' },
    'hyper-voice': { bp: 90, type: 'normal', category: 'special', target: 'allAdjacentFoes', flags: { sound: true } },
    // --- I ---
    'ice-beam': { bp: 90, type: 'ice', category: 'special', secondary: { freezeChance: 10 } },
    'ice-punch': { bp: 75, type: 'ice', category: 'physical', contact: true, secondary: { freezeChance: 10 }, flags: { punch: true } },
    'ice-shard': { bp: 40, type: 'ice', category: 'physical', priority: 1 },
    'ice-spinner': { bp: 80, type: 'ice', category: 'physical', contact: true, clearsTerrain: true },
    'icicle-crash': { bp: 85, type: 'ice', category: 'physical', secondary: { flinchChance: 30 } },
    'iron-defense': { type: 'steel', category: 'status', selfBoosts: { defense: 2 } },
    'iron-head': { bp: 80, type: 'steel', category: 'physical', contact: true, secondary: { flinchChance: 30 } },
    'ivy-cudgel': { bp: 90, type: 'grass', category: 'physical', critRatioBoost: 1, typeChangesWithMask: true },

    // --- J ---
    'jump-kick': { bp: 100, type: 'fighting', category: 'physical', contact: true, crashDamageFraction: 0.5 },

    // --- K ---
    'knock-off': { bp: 65, type: 'dark', category: 'physical', contact: true, removesItem: true, itemRemovalBoost: 1.5 },
    'kings-shield': { type: 'steel', category: 'status', priority: 4, protects: true, dropsAttackerAtkOnContact: 1 },

    // --- L ---
    'leaf-blade': { bp: 90, type: 'grass', category: 'physical', contact: true, critRatioBoost: 1, flags: { slicing: true } },
    'leaf-storm': { bp: 130, type: 'grass', category: 'special', selfDrops: { spAtk: 2 } },
    'leech-seed': { type: 'grass', category: 'status', setsCondition: 'leech-seed', bypassesGrassTypes: true },
    'light-screen': { type: 'psychic', category: 'status', setsSideCondition: 'light-screen' },
    'liquidation': { bp: 85, type: 'water', category: 'physical', contact: true, secondary: { dropsDefenseChance: 20 } },
    'lunge': { bp: 80, type: 'bug', category: 'physical', contact: true, secondary: { dropsAttackChance: 100 } },

    // --- M ---
    'mach-punch': { bp: 40, type: 'fighting', category: 'physical', contact: true, priority: 1, flags: { punch: true } },
    'make-it-rain': { bp: 120, type: 'steel', category: 'special', target: 'allAdjacentFoes', selfDrops: { spAtk: 1 } },
    'meteor-mash': { bp: 90, type: 'steel', category: 'physical', contact: true, secondary: { boostsAttackChance: 20 }, flags: { punch: true } },
    'moonblast': { bp: 95, type: 'fairy', category: 'special', secondary: { dropsSpAtkChance: 30 } },
    'moonlight': { type: 'fairy', category: 'status', healsHp: true, weatherDependentHealing: true },
    'morning-sun': { type: 'normal', category: 'status', healsHp: true, weatherDependentHealing: true },
    'mystical-fire': { bp: 75, type: 'fire', category: 'special', secondary: { dropsSpAtkChance: 100 } },

    // --- N ---
    'nasty-plot': { type: 'dark', category: 'status', selfBoosts: { spAtk: 2 } },
    'night-shade': { bp: 1, type: 'ghost', category: 'special', fixedDamageLevel: true },
    'nuzzle': { bp: 20, type: 'electric', category: 'physical', contact: true, secondary: { paralysisChance: 100 } },

    // --- O ---
    'outrage': { bp: 120, type: 'dragon', category: 'physical', contact: true, locksMoveTurns: [2, 3], confusesUserOnEnd: true },
    'overdrive': { bp: 80, type: 'electric', category: 'special', target: 'allAdjacentFoes', flags: { sound: true } },
    'overheat': { bp: 130, type: 'fire', category: 'special', selfDrops: { spAtk: 2 } },

    // --- P ---
    'pain-split': { type: 'normal', category: 'status', averagesHp: true },
    'parting-shot': { type: 'dark', category: 'status', secondary: { dropsAttackChance: 100, dropsSpAtkChance: 100 }, forcesSwitch: true, flags: { sound: true } },
    'play-rough': { bp: 90, type: 'fairy', category: 'physical', contact: true, secondary: { dropsAttackChance: 10 } },
    'poison-jab': { bp: 80, type: 'poison', category: 'physical', contact: true, secondary: { poisonChance: 30 } },
    'poltergeist': { bp: 110, type: 'ghost', category: 'physical', failsIfTargetHasNoItem: true },
    'pounce': { bp: 50, type: 'bug', category: 'physical', contact: true, secondary: { dropsSpeedChance: 100 } },
    'power-gem': { bp: 80, type: 'rock', category: 'special' },
    'power-trip': { bp: 20, type: 'dark', category: 'physical', contact: true, damageScalesWithPositiveStats: true },
    'power-whip': { bp: 120, type: 'grass', category: 'physical', contact: true },
    'protect': { type: 'normal', category: 'status', priority: 4, protects: true, successiveUseFails: true },
    'psychic': { bp: 90, type: 'psychic', category: 'special', secondary: { dropsSpDefChance: 10 } },
    'psychic-fangs': { bp: 85, type: 'psychic', category: 'physical', contact: true, breaksScreens: true, flags: { bite: true } },
    'psyshock': { bp: 80, type: 'psychic', category: 'special', usesDefenseStat: true },
    'psystrike': { bp: 100, type: 'psychic', category: 'special', usesDefenseStat: true },
    'pyro-ball': { bp: 120, type: 'fire', category: 'physical', secondary: { burnChance: 10 }, flags: { ball: true } },
    // --- Q ---
    'quick-attack': { bp: 40, type: 'normal', category: 'physical', contact: true, priority: 1 },
    'quiver-dance': { type: 'bug', category: 'status', selfBoosts: { spAtk: 1, spDef: 1, speed: 1 } },

    // --- R ---
    'rapid-spin': { bp: 50, type: 'normal', category: 'physical', contact: true, clearsHazards: true, selfBoosts: { speed: 1 } },
    'recover': { type: 'normal', category: 'status', healsHp: true, healFraction: 0.5 },
    'rest': { type: 'psychic', category: 'status', healsHp: true, healFraction: 1.0, selfStatus: 'sleep' },
    'return': { bp: 102, type: 'normal', category: 'physical', contact: true }, // Max happiness BP
    'roar': { type: 'normal', category: 'status', priority: -6, forcesSwitch: true, bypassesProtect: true },
    'roost': { type: 'flying', category: 'status', healsHp: true, healFraction: 0.5, losesFlyingTypeThisTurn: true },

    // --- S ---
    'sacred-fire': { bp: 100, type: 'fire', category: 'physical', secondary: { burnChance: 50 }, thawsUser: true },
    'scald': { bp: 80, type: 'water', category: 'special', secondary: { burnChance: 30 }, thawsUser: true },
    'shadow-ball': { bp: 80, type: 'ghost', category: 'special', secondary: { dropsSpDefChance: 20 }, flags: { bullet: true } },
    'shadow-sneak': { bp: 40, type: 'ghost', category: 'physical', contact: true, priority: 1 },
    'shell-smash': { type: 'normal', category: 'status', selfBoosts: { attack: 2, spAtk: 2, speed: 2 }, selfDrops: { defense: 1, spDef: 1 } },
    'shift-gear': { type: 'steel', category: 'status', selfBoosts: { attack: 1, speed: 2 } },
    'spikes': { type: 'ground', category: 'status', setsHazard: 'spikes' },
    'spiky-shield': { type: 'grass', category: 'status', priority: 4, protects: true, damagesAttackerOnContact: 0.125 },
    'stealth-rock': { type: 'rock', category: 'status', setsHazard: 'stealth-rock' },
    'sticky-web': { type: 'bug', category: 'status', setsHazard: 'sticky-web' },
    'stone-edge': { bp: 100, type: 'rock', category: 'physical', critRatioBoost: 1 },
    'sucker-punch': { bp: 70, type: 'dark', category: 'physical', contact: true, priority: 1, failsIfTargetNotAttacking: true },
    'surging-strikes': { bp: 25, type: 'water', category: 'physical', contact: true, multiHit: 3, alwaysCrit: true, flags: { punching: true } },
    'swords-dance': { type: 'normal', category: 'status', selfBoosts: { attack: 2 } },
    'synthesis': { type: 'grass', category: 'status', healsHp: true, weatherDependentHealing: true },

    // --- T ---
    'tailwind': { type: 'flying', category: 'status', setsSideCondition: 'tailwind' },
    'taunt': { type: 'dark', category: 'status', preventsStatusMoves: true },
    'teleport': { type: 'psychic', category: 'status', priority: -6, forcesSwitch: true },
    'tera-blast': { bp: 80, type: 'normal', category: 'special', adaptsToTeraType: true }, 
    'thunder': { bp: 110, type: 'electric', category: 'special', secondary: { paralysisChance: 30 }, bypassesAccuracyInWeather: 'rain' },
    'thunderbolt': { bp: 90, type: 'electric', category: 'special', secondary: { paralysisChance: 10 } },
    'thunder-wave': { type: 'electric', category: 'status', secondary: { paralysisChance: 100 } },
    'toxic': { type: 'poison', category: 'status', secondary: { badPoisonChance: 100 }, bypassesAccuracyForPoisonTypes: true },
    'toxic-spikes': { type: 'poison', category: 'status', setsHazard: 'toxic-spikes' },
    'trick': { type: 'psychic', category: 'status', swapsItems: true },
    'trick-room': { type: 'psychic', category: 'status', priority: -7, setsCondition: 'trick-room' },
    'triple-axel': { bp: 20, type: 'ice', category: 'physical', contact: true, multiHit: 3, scalingBpMultiHit: true },

    // --- U ---
    'u-turn': { bp: 70, type: 'bug', category: 'physical', contact: true, forcesSwitch: true },

    // --- V ---
    'v-create': { bp: 180, type: 'fire', category: 'physical', contact: true, selfDrops: { defense: 1, spDef: 1, speed: 1 } },
    'volt-switch': { bp: 70, type: 'electric', category: 'special', forcesSwitch: true },

    // --- W ---
    'water-spout': { bp: 150, type: 'water', category: 'special', target: 'allAdjacentFoes', damageScalesWithHp: true },
    'waterfall': { bp: 80, type: 'water', category: 'physical', contact: true, secondary: { flinchChance: 20 } },
    'weather-ball': { bp: 50, type: 'normal', category: 'special', doubleBpInWeather: true, changesTypeInWeather: true, flags: { bullet: true } },
    'will-o-wisp': { type: 'fire', category: 'status', secondary: { burnChance: 100 } },
    'wish': { type: 'normal', category: 'status', delayedHealing: true, healFraction: 0.5 },
    'wood-hammer': { bp: 120, type: 'grass', category: 'physical', contact: true, recoilFraction: 0.33 },

    // --- X ---
    'x-scissor': { bp: 80, type: 'bug', category: 'physical', contact: true, flags: { slicing: true } },

    // --- Y ---
    'yawn': { type: 'normal', category: 'status', setsCondition: 'drowsy' },

    // --- Z ---
    'zen-headbutt': { bp: 80, type: 'psychic', category: 'physical', contact: true, secondary: { flinchChance: 20 } },
    'zing-zap': { bp: 80, type: 'electric', category: 'physical', contact: true, secondary: { flinchChance: 30 } },
    // --- GIMMICK HOOKS (MAX & Z-MOVES) ---
    // These include flags your simulator will look for when the Dynamax/Z-Move state is active.
    'max-flare': { bp: 130, type: 'fire', category: 'special', isMax: true, setsWeather: 'sun', bypassesProtect: true },
    'max-geyser': { bp: 130, type: 'water', category: 'special', isMax: true, setsWeather: 'rain', bypassesProtect: true },
    'max-airstream': { bp: 130, type: 'flying', category: 'physical', isMax: true, selfBoosts: { speed: 1 }, target: 'allAdjacent', bypassesProtect: true },
    'max-guard': { type: 'normal', category: 'status', isMax: true, priority: 4, protects: true, protectsAgainstMax: true },
    'inferno-overdrive': { bp: 175, type: 'fire', category: 'special', isZ: true, bypassesProtect: true }, // Base power dynamically calculates in the engine later
    'tectonic-rage': { bp: 175, type: 'ground', category: 'physical', isZ: true, bypassesProtect: true },
    'extreme-evoboost': { type: 'normal', category: 'status', isZ: true, selfBoosts: { attack: 2, defense: 2, spAtk: 2, spDef: 2, speed: 2 } },

    // --- TECHNICIAN & MULTI-HIT STAPLES ---
    'frost-breath': { bp: 60, type: 'ice', category: 'special', alwaysCrit: true }, // 60 BP + Crit makes it a Technician nuke
    'vacuum-wave': { bp: 40, type: 'fighting', category: 'special', priority: 1, flags: { punch: true } },
    'dual-wingbeat': { bp: 40, type: 'flying', category: 'physical', contact: true, multiHit: 2 },
    'gear-grind': { bp: 50, type: 'steel', category: 'physical', contact: true, multiHit: 2 },
    'rock-blast': { bp: 25, type: 'rock', category: 'physical', multiHit: [2, 5], flags: { bullet: true } },
    'pin-missile': { bp: 25, type: 'bug', category: 'physical', multiHit: [2, 5] },
    'water-shuriken': { bp: 15, type: 'water', category: 'special', priority: 1, multiHit: [2, 5] },
    'fell-stinger': { bp: 50, type: 'bug', category: 'physical', contact: true, selfBoostsOnKo: { attack: 3 } },
    'thief': { bp: 60, type: 'dark', category: 'physical', contact: true, stealsItem: true },
    'astonish': { bp: 30, type: 'ghost', category: 'physical', contact: true, secondary: { flinchChance: 30 } },

    // --- EXPANDED STATUS & UTILITY ---
    'memento': { type: 'dark', category: 'status', sacrificesUser: true, secondary: { dropsAttackChance: 100, dropsSpAtkChance: 100 } },
    'grudge': { type: 'ghost', category: 'status', depletesAttackerPPOnKo: true },
    'magic-coat': { type: 'psychic', category: 'status', priority: 4, reflectsStatusMoves: true },
    'toxic-thread': { type: 'poison', category: 'status', secondary: { dropsSpeedChance: 100, poisonChance: 100 } },
    'sticky-web': { type: 'bug', category: 'status', setsHazard: 'sticky-web' },
    'topsyturvy': { type: 'dark', category: 'status', invertsTargetStatStages: true },
    'court-change': { type: 'normal', category: 'status', swapsSideConditions: true },
    'block': { type: 'normal', category: 'status', preventsTargetSwitch: true },
    'mean-look': { type: 'normal', category: 'status', preventsTargetSwitch: true },
    'perish-song': { type: 'normal', category: 'status', setsCondition: 'perish-song' },
};
// ==========================================
// BACKFILL CHUNK 1: A - C
// Paste this at the bottom of moves-data.js
// ==========================================

Object.assign(window.MoveDex, {
    // --- A (Backfill) ---
    'acid': { bp: 40, type: 'poison', category: 'special', target: 'allAdjacentFoes', secondary: { dropsSpDefChance: 10 } },
    'acid-armor': { type: 'poison', category: 'status', selfBoosts: { defense: 2 } },
    'acid-spray': { bp: 40, type: 'poison', category: 'special', secondary: { dropsSpDefChance: 100 }, flags: { bullet: true } },
    'aeroblast': { bp: 100, type: 'flying', category: 'special', critRatioBoost: 1 },
    'agility': { type: 'psychic', category: 'status', selfBoosts: { speed: 2 } },
    'air-cutter': { bp: 60, type: 'flying', category: 'special', target: 'allAdjacentFoes', critRatioBoost: 1, flags: { slicing: true } },
    'amnesia': { type: 'psychic', category: 'status', selfBoosts: { spDef: 2 } },
    'anchor-shot': { bp: 80, type: 'steel', category: 'physical', contact: true, preventsTargetSwitch: true },
    'ancient-power': { bp: 60, type: 'rock', category: 'special', secondary: { boostsAllStatsChance: 10 } },
    'aqua-ring': { type: 'water', category: 'status', setsCondition: 'aqua-ring' },
    'aqua-tail': { bp: 90, type: 'water', category: 'physical', contact: true },
    'arm-thrust': { bp: 15, type: 'fighting', category: 'physical', contact: true, multiHit: [2, 5] },
    'aromatherapy': { type: 'grass', category: 'status', curesPartyStatus: true },
    'assurance': { bp: 60, type: 'dark', category: 'physical', contact: true, doubleBpIfDamagedThisTurn: true },
    'attack-order': { bp: 90, type: 'bug', category: 'physical', critRatioBoost: 1 },
    'attract': { type: 'normal', category: 'status', setsCondition: 'attract' },
    'aurora-beam': { bp: 65, type: 'ice', category: 'special', secondary: { dropsAttackChance: 10 } },
    'autotomize': { type: 'steel', category: 'status', selfBoosts: { speed: 2 }, reducesWeight: true },

    // --- B (Backfill) ---
    'baby-doll-eyes': { type: 'fairy', category: 'status', priority: 1, secondary: { dropsAttackChance: 100 } },
    'bide': { bp: 1, type: 'normal', category: 'physical', contact: true, priority: 1, fixedDamageLevel: true }, 
    'bind': { bp: 15, type: 'normal', category: 'physical', contact: true, traps: true },
    'bite': { bp: 60, type: 'dark', category: 'physical', contact: true, secondary: { flinchChance: 30 }, flags: { bite: true } },
    'blast-burn': { bp: 150, type: 'fire', category: 'special', recharges: true },
    'blaze-kick': { bp: 85, type: 'fire', category: 'physical', contact: true, critRatioBoost: 1, secondary: { burnChance: 10 } },
    'blue-flare': { bp: 130, type: 'fire', category: 'special', secondary: { burnChance: 20 } },
    'bolt-strike': { bp: 130, type: 'electric', category: 'physical', contact: true, secondary: { paralysisChance: 20 } },
    'bone-club': { bp: 65, type: 'ground', category: 'physical', secondary: { flinchChance: 10 } },
    'bonemerang': { bp: 50, type: 'ground', category: 'physical', multiHit: 2 },
    'bone-rush': { bp: 25, type: 'ground', category: 'physical', multiHit: [2, 5] },
    'bounce': { bp: 85, type: 'flying', category: 'physical', contact: true, twoTurnMove: true, secondary: { paralysisChance: 30 } },
    'branch-poke': { bp: 40, type: 'grass', category: 'physical', contact: true },
    'brine': { bp: 65, type: 'water', category: 'special', doubleBpIfTargetHpHalf: true },
    'bubble': { bp: 40, type: 'water', category: 'special', target: 'allAdjacentFoes', secondary: { dropsSpeedChance: 10 } },
    'bubble-beam': { bp: 65, type: 'water', category: 'special', secondary: { dropsSpeedChance: 10 } },
    'bug-bite': { bp: 60, type: 'bug', category: 'physical', contact: true, eatsTargetBerry: true },
    'burn-up': { bp: 130, type: 'fire', category: 'special', losesFireTypeThisTurn: true },

    // --- C (Backfill) ---
    'charge': { type: 'electric', category: 'status', selfBoosts: { spDef: 1 }, boostsNextElectricMove: true },
    'charm': { type: 'fairy', category: 'status', secondary: { dropsAttackChance: 100 } },
    'chatter': { bp: 65, type: 'flying', category: 'special', secondary: { confusionChance: 100 }, flags: { sound: true } },
    'chip-away': { bp: 70, type: 'normal', category: 'physical', contact: true, ignoresTargetStatChanges: true },
    'clamp': { bp: 35, type: 'water', category: 'physical', contact: true, traps: true },
    'clanging-scales': { bp: 110, type: 'dragon', category: 'special', target: 'allAdjacentFoes', selfDrops: { defense: 1 }, flags: { sound: true } },
    'clangorous-soul': { type: 'dragon', category: 'status', hpCostFraction: 0.33, selfBoosts: { attack: 1, defense: 1, spAtk: 1, spDef: 1, speed: 1 }, flags: { sound: true } },
    'comet-punch': { bp: 18, type: 'normal', category: 'physical', contact: true, multiHit: [2, 5], flags: { punch: true } },
    'confide': { type: 'normal', category: 'status', secondary: { dropsSpAtkChance: 100 }, bypassesSubstitute: true, flags: { sound: true } },
    'confuse-ray': { type: 'ghost', category: 'status', setsCondition: 'confusion' },
    'confusion': { bp: 50, type: 'psychic', category: 'special', secondary: { confusionChance: 10 } },
    'constrict': { bp: 10, type: 'normal', category: 'physical', contact: true, secondary: { dropsSpeedChance: 10 } },
    'copycat': { type: 'normal', category: 'status', copiesLastMove: true },
    'cosmic-power': { type: 'psychic', category: 'status', selfBoosts: { defense: 1, spDef: 1 } },
    'cotton-spore': { type: 'grass', category: 'status', target: 'allAdjacentFoes', secondary: { dropsSpeedChance: 100 } },
    'counter': { bp: 1, type: 'fighting', category: 'physical', contact: true, priority: -5, dealsDoublePhysicalDamageTaken: true },
    'covet': { bp: 60, type: 'normal', category: 'physical', contact: true, stealsItem: true },
    'crush-claw': { bp: 75, type: 'normal', category: 'physical', contact: true, secondary: { dropsDefenseChance: 50 } },
    'crush-grip': { bp: 120, type: 'normal', category: 'physical', contact: true, damageScalesWithTargetHp: true },
    'cut': { bp: 50, type: 'normal', category: 'physical', contact: true, flags: { slicing: true } }
});
// ==========================================
// BACKFILL CHUNK 2: D - H
// Paste this at the bottom of moves-data.js
// ==========================================

Object.assign(window.MoveDex, {
    // --- D (Backfill) ---
    'dark-void': { type: 'dark', category: 'status', target: 'allAdjacentFoes', secondary: { sleepChance: 100 } },
    'defend-order': { type: 'bug', category: 'status', selfBoosts: { defense: 1, spDef: 1 } },
    'defense-curl': { type: 'normal', category: 'status', selfBoosts: { defense: 1 } },
    'dig': { bp: 80, type: 'ground', category: 'physical', contact: true, twoTurnMove: true },
    'dive': { bp: 80, type: 'water', category: 'physical', contact: true, twoTurnMove: true },
    'double-hit': { bp: 35, type: 'normal', category: 'physical', contact: true, multiHit: 2 },
    'double-kick': { bp: 30, type: 'fighting', category: 'physical', contact: true, multiHit: 2 },
    'dragon-breath': { bp: 60, type: 'dragon', category: 'special', secondary: { paralysisChance: 30 } },
    'dragon-rush': { bp: 100, type: 'dragon', category: 'physical', contact: true, secondary: { flinchChance: 20 } },
    'dragon-tail': { bp: 60, type: 'dragon', category: 'physical', contact: true, priority: -6, forcesSwitch: true },
    'draining-kiss': { bp: 50, type: 'fairy', category: 'special', contact: true, drainFraction: 0.75 },
    'dream-eater': { bp: 100, type: 'psychic', category: 'special', drainFraction: 0.5, failsIfNotAsleep: true },
    'drill-peck': { bp: 80, type: 'flying', category: 'physical', contact: true },
    'drill-run': { bp: 80, type: 'ground', category: 'physical', contact: true, critRatioBoost: 1 },
    'dynamic-punch': { bp: 100, type: 'fighting', category: 'physical', contact: true, secondary: { confusionChance: 100 }, flags: { punch: true } },

    // --- E (Backfill) ---
    'echoed-voice': { bp: 40, type: 'normal', category: 'special', damageDoublesOnSuccessiveUse: true, flags: { sound: true } },
    'eerie-impulse': { type: 'electric', category: 'status', targetDrops: { spAtk: 2 } },
    'electro-ball': { bp: 1, type: 'electric', category: 'special', damageScalesWithSpeedRatio: true },
    'electroweb': { bp: 55, type: 'electric', category: 'special', target: 'allAdjacentFoes', secondary: { dropsSpeedChance: 100 } },
    'encore': { type: 'normal', category: 'status', setsCondition: 'encore' },
    'endeavor': { bp: 1, type: 'normal', category: 'physical', contact: true, setsDamageToTargetHp: true },
    'endure': { type: 'normal', category: 'status', priority: 4, survivesAtOneHp: true },
    'entrainment': { type: 'normal', category: 'status', changesTargetAbilityToUser: true },
    'extrasensory': { bp: 80, type: 'psychic', category: 'special', secondary: { flinchChance: 10 } },

    // --- F (Backfill) ---
    'fairy-wind': { bp: 40, type: 'fairy', category: 'special' },
    'fake-tears': { type: 'dark', category: 'status', targetDrops: { spDef: 2 } },
    'false-swipe': { bp: 40, type: 'normal', category: 'physical', contact: true, leavesAtOneHp: true },
    'feint': { bp: 30, type: 'normal', category: 'physical', priority: 2, bypassesProtect: true },
    'fiery-dance': { bp: 80, type: 'fire', category: 'special', secondary: { boostsSpAtkChance: 50 } },
    'final-gambit': { bp: 1, type: 'fighting', category: 'special', sacrificesUser: true, damageEqualsUserHp: true },
    'fire-fang': { bp: 65, type: 'fire', category: 'physical', contact: true, secondary: { burnChance: 10, flinchChance: 10 }, flags: { bite: true } },
    'fissure': { bp: 1, type: 'ground', category: 'physical', ohkoMove: true },
    'flail': { bp: 1, type: 'normal', category: 'physical', contact: true, damageScalesWithLowHp: true },
    'flame-charge': { bp: 50, type: 'fire', category: 'physical', contact: true, selfBoosts: { speed: 1 } },
    'fling': { bp: 1, type: 'dark', category: 'physical', damageScalesWithItem: true },
    'focus-energy': { type: 'normal', category: 'status', selfBoosts: { critRatio: 2 } },
    'focus-punch': { bp: 150, type: 'fighting', category: 'physical', contact: true, priority: -3, failsIfDamaged: true, flags: { punch: true } },
    'flying-press': { bp: 100, type: 'fighting', category: 'physical', contact: true, dualTypeMove: 'flying' },
    'frustration': { bp: 102, type: 'normal', category: 'physical', contact: true }, // Min happiness BP
    'fury-cutter': { bp: 40, type: 'bug', category: 'physical', contact: true, damageDoublesOnSuccessiveUse: true, flags: { slicing: true } },
    'fury-swipes': { bp: 18, type: 'normal', category: 'physical', contact: true, multiHit: [2, 5] },

    // --- G (Backfill) ---
    'gastro-acid': { type: 'poison', category: 'status', nullifiesTargetAbility: true },
    'giga-impact': { bp: 150, type: 'normal', category: 'physical', contact: true, recharges: true },
    'glaciate': { bp: 65, type: 'ice', category: 'special', target: 'allAdjacentFoes', secondary: { dropsSpeedChance: 100 } },
    'grassy-terrain': { type: 'grass', category: 'status', setsTerrain: 'grassy' },
    'growl': { type: 'normal', category: 'status', target: 'allAdjacentFoes', secondary: { dropsAttackChance: 100 }, flags: { sound: true } },
    'growth': { type: 'normal', category: 'status', selfBoosts: { attack: 1, spAtk: 1 }, doublesInSun: true },
    'guillotine': { bp: 1, type: 'normal', category: 'physical', contact: true, ohkoMove: true },
    'gust': { bp: 40, type: 'flying', category: 'special' },

    // --- H (Backfill) ---
    'hail': { type: 'ice', category: 'status', setsWeather: 'hail' },
    'hammer-arm': { bp: 100, type: 'fighting', category: 'physical', contact: true, selfDrops: { speed: 1 }, flags: { punch: true } },
    'haze': { type: 'ice', category: 'status', resetsAllStats: true },
    'headbutt': { bp: 70, type: 'normal', category: 'physical', contact: true, secondary: { flinchChance: 30 } },
    'head-smash': { bp: 150, type: 'rock', category: 'physical', contact: true, recoilFraction: 0.5 },
    'heal-order': { type: 'bug', category: 'status', healsHp: true, healFraction: 0.5 },
    'heart-swap': { type: 'psychic', category: 'status', swapsStatStages: true },
    'heat-crash': { bp: 1, type: 'fire', category: 'physical', contact: true, damageScalesWithWeightRatio: true },
    'hex': { bp: 65, type: 'ghost', category: 'special', doubleBpIfStatused: true },
    'hidden-power': { bp: 60, type: 'normal', category: 'special', typeDeterminedByIVs: true },
    'high-horsepower': { bp: 95, type: 'ground', category: 'physical', contact: true },
    'hone-claws': { type: 'dark', category: 'status', selfBoosts: { attack: 1, accuracy: 1 } },
    'horn-leech': { bp: 75, type: 'grass', category: 'physical', contact: true, drainFraction: 0.5 },
    'howl': { type: 'normal', category: 'status', selfBoosts: { attack: 1 }, flags: { sound: true } },
    'hydro-cannon': { bp: 150, type: 'water', category: 'special', recharges: true },
    'hyper-beam': { bp: 150, type: 'normal', category: 'special', recharges: true },
    'hypnosis': { type: 'psychic', category: 'status', secondary: { sleepChance: 100 } }
});
// ==========================================
// BACKFILL CHUNK 3: I - P
// Paste this at the bottom of moves-data.js
// ==========================================

Object.assign(window.MoveDex, {
    // --- I (Backfill) ---
    'ice-fang': { bp: 65, type: 'ice', category: 'physical', contact: true, secondary: { freezeChance: 10, flinchChance: 10 }, flags: { bite: true } },
    'icicle-spear': { bp: 25, type: 'ice', category: 'physical', multiHit: [2, 5] },
    'icy-wind': { bp: 55, type: 'ice', category: 'special', target: 'allAdjacentFoes', secondary: { dropsSpeedChance: 100 } },
    'imprison': { type: 'psychic', category: 'status', preventsTargetUsingKnownMoves: true },
    'inferno': { bp: 100, type: 'fire', category: 'special', secondary: { burnChance: 100 } },
    'infestation': { bp: 20, type: 'bug', category: 'special', contact: true, traps: true },
    'ingrain': { type: 'grass', category: 'status', healsHpFraction: 0.0625, preventsSwitching: true, groundsUser: true },
    'instruct': { type: 'psychic', category: 'status', forcesTargetToRepeatMove: true },
    'iron-tail': { bp: 100, type: 'steel', category: 'physical', contact: true, secondary: { dropsDefenseChance: 30 } },

    // --- J (Backfill) ---
    'jaw-lock': { bp: 80, type: 'dark', category: 'physical', contact: true, trapsBoth: true, flags: { bite: true } },
    'judgment': { bp: 100, type: 'normal', category: 'special', changesTypeWithPlates: true },

    // --- K (Backfill) ---
    'karate-chop': { bp: 50, type: 'fighting', category: 'physical', contact: true, critRatioBoost: 1 },
    'kinesis': { type: 'psychic', category: 'status', secondary: { dropsAccuracyChance: 100 } },

    // --- L (Backfill) ---
    'leaf-tornado': { bp: 65, type: 'grass', category: 'special', secondary: { dropsAccuracyChance: 50 } },
    'leech-life': { bp: 80, type: 'bug', category: 'physical', contact: true, drainFraction: 0.5 },
    'leer': { type: 'normal', category: 'status', target: 'allAdjacentFoes', targetDrops: { defense: 1 } },
    'lick': { bp: 30, type: 'ghost', category: 'physical', contact: true, secondary: { paralysisChance: 30 } },
    'lock-on': { type: 'normal', category: 'status', nextMoveNeverMisses: true },
    'low-kick': { bp: 1, type: 'fighting', category: 'physical', contact: true, damageScalesWithWeight: true },
    'low-sweep': { bp: 65, type: 'fighting', category: 'physical', contact: true, secondary: { dropsSpeedChance: 100 } },
    'lunar-dance': { type: 'psychic', category: 'status', sacrificesUser: true, fullyHealsReplacement: true },

    // --- M (Backfill) ---
    'magic-powder': { type: 'psychic', category: 'status', changesTargetTypeTo: 'psychic' },
    'magical-leaf': { bp: 60, type: 'grass', category: 'special', bypassesAccuracy: true },
    'magma-storm': { bp: 100, type: 'fire', category: 'special', traps: true },
    'magnet-rise': { type: 'electric', category: 'status', immuneToGroundForTurns: 5 },
    'magnitude': { bp: 1, type: 'ground', category: 'physical', target: 'allAdjacent', randomPowerMagnitude: true },
    'me-first': { type: 'normal', category: 'status', copiesTargetMoveAtPower: 1.5, failsIfNotFirst: true },
    'mega-drain': { bp: 40, type: 'grass', category: 'special', drainFraction: 0.5 },
    'megahorn': { bp: 120, type: 'bug', category: 'physical', contact: true },
    'metal-burst': { bp: 1, type: 'steel', category: 'physical', deals1_5xDamageTaken: true },
    'metal-sound': { type: 'steel', category: 'status', targetDrops: { spDef: 2 }, flags: { sound: true } },
    'meteor-beam': { bp: 120, type: 'rock', category: 'special', twoTurnMove: true, selfBoostsOnTurnOne: { spAtk: 1 } },
    'milk-drink': { type: 'normal', category: 'status', healsHp: true, healFraction: 0.5 },
    'mirror-coat': { bp: 1, type: 'psychic', category: 'special', priority: -5, dealsDoubleSpecialDamageTaken: true },
    'mirror-move': { type: 'flying', category: 'status', copiesLastMoveTargetUsed: true },
    'mist': { type: 'ice', category: 'status', preventsStatDropsForTurns: 5 },
    'muddy-water': { bp: 90, type: 'water', category: 'special', target: 'allAdjacentFoes', secondary: { dropsAccuracyChance: 30 } },
    'mud-slap': { bp: 20, type: 'ground', category: 'special', secondary: { dropsAccuracyChance: 100 } },
    'multi-attack': { bp: 120, type: 'normal', category: 'physical', changesTypeWithMemories: true },

    // --- N (Backfill) ---
    'nature-power': { type: 'normal', category: 'status', turnsIntoMoveBasedOnTerrain: true },
    'night-slash': { bp: 70, type: 'dark', category: 'physical', contact: true, critRatioBoost: 1, flags: { slicing: true } },
    'nightmare': { type: 'ghost', category: 'status', damagesSleepingTargetFraction: 0.25 },

    // --- O (Backfill) ---
    'oblivion-wing': { bp: 80, type: 'flying', category: 'special', drainFraction: 0.75 },
    'origin-pulse': { bp: 110, type: 'water', category: 'special', target: 'allAdjacentFoes' },

    // --- P (Backfill) ---
    'payback': { bp: 50, type: 'dark', category: 'physical', contact: true, doubleBpIfMovingLast: true },
    'petal-dance': { bp: 120, type: 'grass', category: 'special', contact: true, locksMoveTurns: [2, 3], confusesUserOnEnd: true },
    'phantom-force': { bp: 90, type: 'ghost', category: 'physical', contact: true, twoTurnMove: true, bypassesProtect: true },
    'pluck': { bp: 60, type: 'flying', category: 'physical', contact: true, eatsTargetBerry: true },
    'poison-fang': { bp: 50, type: 'poison', category: 'physical', contact: true, secondary: { badPoisonChance: 50 }, flags: { bite: true } },
    'pollen-puff': { bp: 90, type: 'bug', category: 'special', healsAllyFraction: 0.5, flags: { bullet: true } },
    'powder-snow': { bp: 40, type: 'ice', category: 'special', target: 'allAdjacentFoes', secondary: { freezeChance: 10 } },
    'power-up-punch': { bp: 40, type: 'fighting', category: 'physical', contact: true, secondary: { boostsAttackChance: 100 }, flags: { punch: true } },
    'precipice-blades': { bp: 120, type: 'ground', category: 'physical', target: 'allAdjacentFoes' },
    'psycho-cut': { bp: 70, type: 'psychic', category: 'physical', critRatioBoost: 1, flags: { slicing: true } },
    'psycho-shift': { type: 'psychic', category: 'status', transfersStatusToTarget: true },
    'pursuit': { bp: 40, type: 'dark', category: 'physical', contact: true, doubleBpIfTargetSwitching: true, hitsBeforeSwitch: true }
});
// ==========================================
// BACKFILL CHUNK 4: Q - Z
// Paste this at the bottom of moves-data.js
// ==========================================

Object.assign(window.MoveDex, {
    // --- R (Backfill) ---
    'rage': { bp: 20, type: 'normal', category: 'physical', contact: true, selfBoostsOnHit: { attack: 1 } },
    'razor-leaf': { bp: 55, type: 'grass', category: 'physical', target: 'allAdjacentFoes', critRatioBoost: 1, flags: { slicing: true } },
    'razor-shell': { bp: 75, type: 'water', category: 'physical', contact: true, secondary: { dropsDefenseChance: 50 }, flags: { slicing: true } },
    'reflect': { type: 'psychic', category: 'status', setsSideCondition: 'reflect' },
    'reflect-type': { type: 'normal', category: 'status', copiesTargetType: true },
    'refresh': { type: 'normal', category: 'status', curesStatus: ['burn', 'paralysis', 'poison'] },
    'relic-song': { bp: 75, type: 'normal', category: 'special', target: 'allAdjacentFoes', secondary: { sleepChance: 10 }, flags: { sound: true } },
    'retaliate': { bp: 70, type: 'normal', category: 'physical', contact: true, doubleBpIfAllyFainted: true },
    'reversal': { bp: 1, type: 'fighting', category: 'physical', contact: true, damageScalesWithLowHp: true },
    'rock-slide': { bp: 75, type: 'rock', category: 'physical', target: 'allAdjacentFoes', secondary: { flinchChance: 30 } },
    'rock-smash': { bp: 40, type: 'fighting', category: 'physical', contact: true, secondary: { dropsDefenseChance: 50 } },
    'rock-tomb': { bp: 60, type: 'rock', category: 'physical', secondary: { dropsSpeedChance: 100 } },
    'rollout': { bp: 30, type: 'rock', category: 'physical', contact: true, damageDoublesOnSuccessiveUse: true },
    'round': { bp: 60, type: 'normal', category: 'special', doubleBpIfOtherUsedRound: true, flags: { sound: true } },

    // --- S (Backfill) ---
    'sacred-sword': { bp: 90, type: 'fighting', category: 'physical', contact: true, ignoresTargetStatChanges: true, flags: { slicing: true } },
    'safeguard': { type: 'normal', category: 'status', setsSideCondition: 'safeguard' },
    'sand-tomb': { bp: 35, type: 'ground', category: 'physical', traps: true },
    'scary-face': { type: 'normal', category: 'status', targetDrops: { speed: 2 } },
    'screech': { type: 'normal', category: 'status', targetDrops: { defense: 2 }, flags: { sound: true } },
    'secret-power': { bp: 70, type: 'normal', category: 'physical', secondaryEffectDependsOnTerrain: true },
    'seed-bomb': { bp: 80, type: 'grass', category: 'physical', flags: { bullet: true } },
    'seismic-toss': { bp: 1, type: 'fighting', category: 'physical', contact: true, fixedDamageLevel: true },
    'shadow-claw': { bp: 70, type: 'ghost', category: 'physical', contact: true, critRatioBoost: 1, flags: { slicing: true } },
    'shadow-punch': { bp: 60, type: 'ghost', category: 'physical', contact: true, bypassesAccuracy: true, flags: { punch: true } },
    'sheer-cold': { bp: 1, type: 'ice', category: 'special', ohkoMove: true },
    'shock-wave': { bp: 60, type: 'electric', category: 'special', bypassesAccuracy: true },
    'signal-beam': { bp: 75, type: 'bug', category: 'special', secondary: { confusionChance: 10 } },
    'sing': { type: 'normal', category: 'status', secondary: { sleepChance: 100 }, flags: { sound: true } },
    'skill-swap': { type: 'psychic', category: 'status', swapsAbilities: true },
    'sky-attack': { bp: 140, type: 'flying', category: 'physical', twoTurnMove: true, critRatioBoost: 1, secondary: { flinchChance: 30 } },
    'sky-drop': { bp: 60, type: 'flying', category: 'physical', contact: true, twoTurnMove: true, preventsTargetMovesOnTurnOne: true },
    'slack-off': { type: 'normal', category: 'status', healsHp: true, healFraction: 0.5 },
    'slash': { bp: 70, type: 'normal', category: 'physical', contact: true, critRatioBoost: 1, flags: { slicing: true } },
    'sleep-powder': { type: 'grass', category: 'status', secondary: { sleepChance: 100 }, powderMove: true },
    'sleep-talk': { type: 'normal', category: 'status', callsRandomMoveWhileAsleep: true },
    'sludge-bomb': { bp: 90, type: 'poison', category: 'special', secondary: { poisonChance: 30 }, flags: { bullet: true } },
    'sludge-wave': { bp: 95, type: 'poison', category: 'special', target: 'allAdjacent', secondary: { poisonChance: 10 } },
    'smack-down': { bp: 50, type: 'rock', category: 'physical', groundsTarget: true },
    'snarl': { bp: 55, type: 'dark', category: 'special', target: 'allAdjacentFoes', secondary: { dropsSpAtkChance: 100 }, flags: { sound: true } },
    'snatch': { type: 'dark', category: 'status', stealsBeneficialStatusMoves: true },
    'soft-boiled': { type: 'normal', category: 'status', healsHp: true, healFraction: 0.5 },
    'solar-beam': { bp: 120, type: 'grass', category: 'special', twoTurnMove: true, skipsChargeInSun: true, halvesDamageInOtherWeather: true },
    'solar-blade': { bp: 125, type: 'grass', category: 'physical', contact: true, twoTurnMove: true, skipsChargeInSun: true, halvesDamageInOtherWeather: true, flags: { slicing: true } },
    'spark': { bp: 65, type: 'electric', category: 'physical', contact: true, secondary: { paralysisChance: 30 } },
    'spider-web': { type: 'bug', category: 'status', preventsTargetSwitch: true },
    'spore': { type: 'grass', category: 'status', secondary: { sleepChance: 100 }, powderMove: true },
    'stored-power': { bp: 20, type: 'psychic', category: 'special', damageScalesWithPositiveStats: true },
    'storm-throw': { bp: 60, type: 'fighting', category: 'physical', contact: true, alwaysCrit: true },
    'strength': { bp: 80, type: 'normal', category: 'physical', contact: true },
    'struggle': { bp: 50, type: 'normal', category: 'physical', contact: true, bypassesAccuracy: true, recoilFraction: 0.25, typeTypeless: true },
    'substitute': { type: 'normal', category: 'status', hpCostFraction: 0.25, createsSubstitute: true },
    'super-fang': { bp: 1, type: 'normal', category: 'physical', contact: true, halvesTargetCurrentHp: true },
    'superpower': { bp: 120, type: 'fighting', category: 'physical', contact: true, selfDrops: { attack: 1, defense: 1 } },
    'surf': { bp: 90, type: 'water', category: 'special', target: 'allAdjacent', doubleBpAgainstDive: true },
    'swagger': { type: 'normal', category: 'status', targetBoosts: { attack: 2 }, setsCondition: 'confusion' },
    'sweet-kiss': { type: 'fairy', category: 'status', setsCondition: 'confusion' },
    'swift': { bp: 60, type: 'normal', category: 'special', target: 'allAdjacentFoes', bypassesAccuracy: true },
    'synchronoise': { bp: 120, type: 'psychic', category: 'special', target: 'allAdjacent', failsIfTargetDifferentType: true },

    // --- T (Backfill) ---
    'tackle': { bp: 40, type: 'normal', category: 'physical', contact: true },
    'tail-glow': { type: 'bug', category: 'status', selfBoosts: { spAtk: 3 } },
    'take-down': { bp: 90, type: 'normal', category: 'physical', contact: true, recoilFraction: 0.25 },
    'telekinesis': { type: 'psychic', category: 'status', floatsTarget: true, makesMovesNeverMissTarget: true },
    'thrash': { bp: 120, type: 'normal', category: 'physical', contact: true, locksMoveTurns: [2, 3], confusesUserOnEnd: true },
    'throat-chop': { bp: 80, type: 'dark', category: 'physical', contact: true, preventsSoundMovesForTurns: 2 },
    'tickle': { type: 'normal', category: 'status', targetDrops: { attack: 1, defense: 1 } },
    'transform': { type: 'normal', category: 'status', transformsIntoTarget: true },
    'tri-attack': { bp: 80, type: 'normal', category: 'special', secondary: { burnParalyzeFreezeChance: 20 } },
    'twister': { bp: 40, type: 'dragon', category: 'special', target: 'allAdjacentFoes', doubleBpAgainstFlyBounce: true, secondary: { flinchChance: 20 } },

    // --- U, V, W, X, Y, Z (Backfill) ---
    'uproar': { bp: 90, type: 'normal', category: 'special', locksMoveTurns: 3, preventsSleep: true, flags: { sound: true } },
    'venoshock': { bp: 65, type: 'poison', category: 'special', doubleBpIfTargetPoisoned: true },
    'vital-throw': { bp: 70, type: 'fighting', category: 'physical', contact: true, priority: -1, bypassesAccuracy: true },
    'water-pulse': { bp: 60, type: 'water', category: 'special', secondary: { confusionChance: 20 }, flags: { pulse: true } },
    'whirlpool': { bp: 35, type: 'water', category: 'special', traps: true },
    'whirlwind': { type: 'normal', category: 'status', priority: -6, forcesSwitch: true, bypassesProtect: true },
    'wide-guard': { type: 'rock', category: 'status', priority: 3, protectsSideAgainstSpreadMoves: true },
    'wild-charge': { bp: 90, type: 'electric', category: 'physical', contact: true, recoilFraction: 0.25 },
    'wrap': { bp: 15, type: 'normal', category: 'physical', contact: true, traps: true },
    'wring-out': { bp: 120, type: 'normal', category: 'special', contact: true, damageScalesWithTargetHp: true },
    'zap-cannon': { bp: 120, type: 'electric', category: 'special', secondary: { paralysisChance: 100 } },
});
// --- TERRAIN EXPANSION PATCH ---
Object.assign(window.MoveDex, {
    'terrain-pulse': { bp: 50, type: 'normal', category: 'special', flags: { pulse: true } },
    'rising-voltage': { bp: 70, type: 'electric', category: 'special' },
    'misty-explosion': { bp: 100, type: 'fairy', category: 'special', target: 'allAdjacent', sacrificesUser: true }
});
