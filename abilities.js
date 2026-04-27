// ==========================================
// CHAMPIONS ABILITIES DICTIONARY (A - F)
// ==========================================

window.AbilityDex = {
    // --- A ---
    'adaptability': { stabMult: 2.0 }, // Increases STAB from 1.5x to 2.0x
    'aerilate': { changeTypeFrom: 'normal', changeTypeTo: 'flying', bpMult: 1.2 },
    'analytic': { bpMult: 1.3 }, // Assuming the attacker moves last
    'aquatic': { waterStabMult: 1.5 }, // Custom placeholder if needed
    'arena-trap': { traps: true },
    'as-one-glastrier': { atkBoostOnKo: 1 },
    'as-one-spectrier': { spAtkBoostOnKo: 1 },
    'aurora-break': { ignoresWeather: true },
    
    // --- B ---
    'battery': { allySpAtkMult: 1.3 },
    'battle-bond': { boostsStatsOnKo: true },
    'beast-boost': { boostsHighestStatOnKo: true },
    'berserk': { spAtkBoostOnLowHp: 1 },
    'blaze': { pinchType: 'fire', pinchMult: 1.5 },
    'bulletproof': { immuneToFlags: ['bullet', 'bomb', 'ball'] },

    // --- C ---
    'chlorophyll': { doubleSpeedInWeather: 'sun' },
    'clear-body': { immuneToStatDrops: true },
    'cloud-nine': { ignoresWeather: true },
    'color-change': { changesTypeOnHit: true },
    'comatose': { immuneToStatus: true },
    'competitive': { spAtkBoostOnDrop: 2 },
    'compound-eyes': { accuracyMult: 1.3 },
    'contrary': { invertStatChanges: true },
    'corrosion': { canPoisonSteelPoison: true },
    'cotton-down': { dropsSpeedOnHit: 1 },
    'cursed-body': { disableChance: 30 },

    // --- D ---
    'damp': { immuneToExplosion: true },
    'dauntless-shield': { defenseBoostOnEntry: 1 },
    'dazzling': { immuneToPriority: true },
    'defeatist': { halfStatsOnLowHp: true },
    'defiant': { atkBoostOnDrop: 2 },
    'delta-stream': { setsWeather: 'strong-winds' },
    'desolate-land': { setsWeather: 'harsh-sun', immuneToType: 'water' },
    'disguise': { blocksFirstHit: true },
    'download': { boostsAtkOrSpAtkOnEntry: true },
    'dragon-s-maw': { typeOffenseMult: 'dragon', bpMult: 1.5 },
    'drizzle': { setsWeather: 'rain' },
    'drought': { setsWeather: 'sun' },
    'dry-skin': { immuneToType: 'water', healFromType: 'water', weakToType: 'fire', fireMult: 1.25 },

    // --- E ---
    'earth-eater': { immuneToType: 'ground', healFromType: 'ground' },
    'effect-spore': { contactStatusChance: true },
    'electric-surge': { setsTerrain: 'electric' },
    'engine': { doubleSpeedInWeather: 'rain' }, // Assuming custom/swift-swim equivalent
    'evasion': { evasionMult: 1.2 }, // Placeholder for custom evasion rules
    'earth-eater': { immuneToType: 'ground', healFromType: 'ground' }, // Gen 9

    // --- F ---
    'fairy-aura': { auraType: 'fairy', auraMult: 1.33 },
    'filter': { superEffectiveReductionMult: 0.75 },
    'flame-body': { contactBurnChance: 30 },
    'flare-boost': { spAtkMultWhenBurned: 1.5 },
    'flash-fire': { immuneToType: 'fire', boostsType: 'fire', bpMult: 1.5 },
    'fluffy': { contactReductionMult: 0.5, fireWeaknessMult: 2.0 },
    'force-of-nature': { nullifiesFlyingWeaknesses: true },
    'forecast': { changesFormInWeather: true },
    'fur-coat': { physicalDefenseMult: 2.0 },

    // --- G ---
    'galvanize': { changeTypeFrom: 'normal', changeTypeTo: 'electric', bpMult: 1.2 },
    'gluttony': { pinchBerryThreshold: 0.5 },
    'good-as-gold': { immuneToStatusMoves: true },
    'gooey': { dropsSpeedOnHit: 1, contactRequired: true },
    'gorilla-tactics': { attackMult: 1.5, choiceLock: true },
    'grass-pelt': { terrainDefenseMult: 'grassy', defMult: 1.5 },
    'grassy-surge': { setsTerrain: 'grassy' },
    'guts': { attackMultWhenStatused: 1.5, ignoresBurnDrop: true },

    // --- H ---
    'hadron-engine': { setsTerrain: 'electric', terrainSpAtkMult: 'electric', spAtkMult: 1.33 },
    'heatproof': { fireReductionMult: 0.5, burnDamageReductionMult: 0.5 },
    'heavy-metal': { weightMult: 2.0 },
    'huge-power': { attackStatMult: 2.0 },
    'hustle': { physicalAttackMult: 1.5, physicalAccuracyMult: 0.8 },
    'hydration': { curesStatusInWeather: 'rain' },

    // --- I ---
    'ice-body': { healsInWeather: 'snow', immuneToHailDamage: true },
    'ice-scales': { specialDamageReductionMult: 0.5 },
    'illuminate': { ignoresAccuracyDrops: true }, // Updated Gen 9 mechanic
    'illusion': { disguisesAsLastPartyMember: true },
    'immunity': { immuneToStatus: 'poison' },
    'infiltrator': { ignoresScreens: true, ignoresSubstitute: true },
    'innards-out': { damagesAttackerOnFaint: true },
    'inner-focus': { immuneToFlinch: true, immuneToIntimidate: true },
    'insomnia': { immuneToStatus: 'sleep' },
    'intimidate': { dropsOpponentAtkOnEntry: 1 },
    'intrepid-sword': { attackBoostOnEntry: 1 },
    'iron-barbs': { contactDamageFraction: 0.125 }, // 1/8th of max HP
    'iron-fist': { punchingMoveMult: 1.2 },

    // --- J ---
    'justified': { attackBoostOnDarkHit: 1 },

    // --- K ---
    'keen-eye': { ignoresAccuracyDrops: true, ignoresEvasionBoosts: true },

    // --- L ---
    'leaf-guard': { preventsStatusInWeather: 'sun' },
    'levitate': { immuneToType: 'ground', immuneToSpikes: true },
    'libero': { changesTypeToMove: true },
    'light-metal': { weightMult: 0.5 },
    'lightning-rod': { drawsElectricMoves: true, immuneToType: 'electric', spAtkBoostOnElectricHit: 1 },
    'limber': { immuneToStatus: 'paralysis' },
    'liquid-ooze': { damagesLeechers: true },
    'liquid-voice': { soundMovesBecomeType: 'water' },
    'long-reach': { makesMovesNonContact: true },

    // --- M ---
    'magic-bounce': { reflectsStatusMoves: true },
    'magic-guard': { immuneToIndirectDamage: true },
    'magician': { stealsItemOnHit: true },
    'magma-armor': { immuneToStatus: 'freeze' },
    'magnet-pull': { trapsType: 'steel' },
    'marvel-scale': { defenseMultWhenStatused: 1.5 },
    'mega-launcher': { pulseAuraMoveMult: 1.5 },
    'merciless': { critsPoisonedTargets: true },
    'mirror-armor': { reflectsStatDrops: true },
    'misty-surge': { setsTerrain: 'misty' },
    'mold-breaker': { ignoresDefensiveAbilities: true },
    'motor-drive': { immuneToType: 'electric', speedBoostOnElectricHit: 1 },
    'moxie': { attackBoostOnKo: 1 },
    'multiscale': { fullHpDamageReductionMult: 0.5 },
    'multitype': { changesTypeWithPlates: true },
    'mummy': { contactChangesAttackerAbilityTo: 'mummy' },
    'mycelium-might': { statusMovesGoLast: true, ignoresDefensiveAbilitiesOnStatusMoves: true },
    // --- N ---
    'natural-cure': { curesStatusOnSwitch: true },
    'neuroforce': { superEffectiveMult: 1.25 },
    'neutralizing-gas': { nullifiesOtherAbilities: true },
    'no-guard': { bypassesAccuracyChecks: true },
    'normalize': { changeTypeFrom: 'all', changeTypeTo: 'normal', bpMult: 1.2 },

    // --- O ---
    'oblivious': { immuneToTaunt: true, immuneToIntimidate: true },
    'orichalcum-pulse': { setsWeather: 'sun', attackMultInWeather: 'sun', atkMult: 1.33 },
    'overcoat': { immuneToWeatherDamage: true, immuneToPowderMoves: true },
    'overgrow': { pinchType: 'grass', pinchMult: 1.5 },

    // --- P ---
    'parental-bond': { hitsTwice: true, secondHitMult: 0.25 },
    'pastel-veil': { immuneToStatus: 'poison', curesAllyPoison: true },
    'pixilate': { changeTypeFrom: 'normal', changeTypeTo: 'fairy', bpMult: 1.2 },
    'poison-heal': { healsWhenStatused: 'poison' },
    'poison-point': { contactPoisonChance: 30 },
    'poison-touch': { contactPoisonInflictChance: 30 },
    'prankster': { statusMovePriorityBoost: 1, failsAgainstDark: true },
    'pressure': { doublesStruggleDamage: false, halvesOpponentPP: true }, // PP mostly, but kept for logic hooks
    'primordial-sea': { setsWeather: 'heavy-rain', immuneToType: 'fire' },
    'prism-armor': { superEffectiveReductionMult: 0.75 },
    'propeller-tail': { ignoresRedirection: true },
    'protean': { changesTypeToMove: true },
    'protosynthesis': { boostsHighestStatInWeather: 'sun' },
    'psychic-surge': { setsTerrain: 'psychic' },
    'punk-rock': { soundMoveMult: 1.3, soundDamageReductionMult: 0.5 },
    'purifying-salt': { immuneToStatus: true, ghostReductionMult: 0.5 },

    // --- Q ---
    'quark-drive': { boostsHighestStatInTerrain: 'electric' },
    'queenly-majesty': { immuneToPriority: true },
    'quick-feet': { speedMultWhenStatused: 1.5 },

    // --- R ---
    'rain-dish': { healsInWeather: 'rain' },
    'reckless': { recoilMoveMult: 1.2 },
    'refrigerate': { changeTypeFrom: 'normal', changeTypeTo: 'ice', bpMult: 1.2 },
    'regenerator': { healsOnSwitch: 0.33 },
    'ripen': { doublesBerryEffects: true },
    'rock-head': { immuneToRecoil: true },
    'rough-skin': { contactDamageFraction: 0.125 },

    // --- S ---
    'sand-force': { weatherTypeBoosts: ['rock', 'ground', 'steel'], weatherBpMult: 1.3, weather: 'sand' },
    'sand-rush': { doubleSpeedInWeather: 'sand', immuneToHailDamage: true }, // Immune to sand damage implicitly
    'sand-stream': { setsWeather: 'sand' },
    'sand-veil': { evasionMultInWeather: 1.25, weather: 'sand' },
    'sap-sipper': { immuneToType: 'grass', attackBoostOnGrassHit: 1 },
    'scrappy': { ignoresGhostImmunity: true, immuneToIntimidate: true },
    'serene-grace': { doublesSecondaryEffectChances: true },
    'shadow-shield': { fullHpDamageReductionMult: 0.5 },
    'sharpness': { slicingMoveMult: 1.5 },
    'sheer-force': { removesSecondaryEffects: true, bpMult: 1.3 },
    'shell-armor': { immuneToCriticalHits: true },
    'shield-dust': { immuneToSecondaryEffects: true },
    'simple': { doublesStatChanges: true },
    'skill-link': { multiHitAlwaysMax: true },
    'slush-rush': { doubleSpeedInWeather: 'snow' },
    'sniper': { criticalHitMult: 1.5 }, // Makes crits 2.25x instead of 1.5x
    'snow-warning': { setsWeather: 'snow' },
    'solar-power': { spAtkMultInWeather: 1.5, damagesInWeather: true, weather: 'sun' },
    'solid-rock': { superEffectiveReductionMult: 0.75 },
    'soul-heart': { spAtkBoostOnAnyKo: 1 },
    'soundproof': { immuneToSoundMoves: true },
    'speed-boost': { boostsSpeedAtEndOfTurn: 1 },
    'stakeout': { doubleDamageOnSwitchIn: true },
    'stamina': { defenseBoostOnHit: 1 },
    'stance-change': { changesFormOnMoveType: true },
    'static': { contactParalysisChance: 30 },
    'steely-spirit': { allySteelMoveMult: 1.5 },
    'storm-drain': { drawsWaterMoves: true, immuneToType: 'water', spAtkBoostOnWaterHit: 1 },
    'strong-jaw': { bitingMoveMult: 1.5 },
    'sturdy': { survivesAtOneHp: true, immuneToOhkoMoves: true },
    'super-luck': { criticalHitStageBoost: 1 },
    'supreme-overlord': { bpBoostPerFaintedAlly: 0.1 }, // Up to 1.5x
    'surge-surfer': { doubleSpeedInTerrain: 'electric' },
    'swarm': { pinchType: 'bug', pinchMult: 1.5 },
    'swift-swim': { doubleSpeedInWeather: 'rain' },
    'sword-of-ruin': { dropsOpponentDefMult: 0.75 },
    'synchronize': { passesStatus: true },

    // --- T ---
    'tablet-of-ruin': { dropsOpponentAtkMult: 0.75 },
    'tangled-feet': { evasionMultWhenConfused: 2.0 },
    'tangling-hair': { dropsSpeedOnContact: 1 },
    'technician': { lowBpMultThreshold: 60, bpMult: 1.5 },
    'telepathy': { immuneToAllyAttacks: true },
    'teravolt': { ignoresDefensiveAbilities: true },
    'thermal-exchange': { attackBoostOnFireHit: 1, immuneToStatus: 'burn' },
    'thick-fat': { fireReductionMult: 0.5, iceReductionMult: 0.5 },
    'tinted-lens': { resistedHitMult: 2.0 },
    'torrent': { pinchType: 'water', pinchMult: 1.5 },
    'tough-claws': { contactMoveMult: 1.3 },
    'toxic-debris': { setsToxicSpikesOnPhysicalHit: true },
    'trace': { copiesOpponentAbility: true },
    'transistor': { typeOffenseMult: 'electric', bpMult: 1.3 }, // Nerfed to 1.3 in Gen 9
    'triage': { healingMovePriorityBoost: 3 },
    'turboblaze': { ignoresDefensiveAbilities: true },

    // --- U ---
    'unaware': { ignoresOpponentStatChanges: true },
    'unburden': { doubleSpeedOnItemLoss: true },
    'unnerve': { preventsOpponentBerryUse: true },
    'unseen-fist': { contactMovesBypassProtect: true },

    // --- V ---
    'vessel-of-ruin': { dropsOpponentSpAtkMult: 0.75 },
    'volt-absorb': { immuneToType: 'electric', healFromType: 'electric' },

    // --- W ---
    'wandering-spirit': { swapsAbilityOnContact: true },
    'water-absorb': { immuneToType: 'water', healFromType: 'water' },
    'water-bubble': { typeOffenseMult: 'water', bpMult: 2.0, fireReductionMult: 0.5, immuneToStatus: 'burn' },
    'water-compaction': { defenseBoostOnWaterHit: 2 },
    'water-veil': { immuneToStatus: 'burn' },
    'weak-armor': { dropsDefOnPhysicalHit: 1, boostsSpeedOnPhysicalHit: 2 },
    'well-baked-body': { immuneToType: 'fire', defenseBoostOnFireHit: 2 },
    'white-smoke': { immuneToStatDrops: true },
    'wind-power': { becomesChargedOnWindHit: true },
    'wind-rider': { immuneToWindMoves: true, attackBoostOnWindHit: 1 },
    'wonder-guard': { immuneToNonSuperEffective: true },

    // --- X, Y, Z ---
    'zero-to-hero': { changesFormOnSwitch: true },
};
