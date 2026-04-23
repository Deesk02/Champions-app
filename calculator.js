// ==========================================
// CUSTOM DAMAGE CALCULATOR ENGINE
// ==========================================

const complexMoveStatEffects = { 
    'shell smash': {attack: 2, spAtk: 2, speed: 2, defense: -1, spDef: -1}, 
    'superpower': {attack: -1, defense: -1}, 
    'close combat': {defense: -1, spDef: -1},
    'v-create': {defense: -1, spDef: -1, speed: -1}, 
    'make it rain': {spAtk: -1},
    'overheat': {spAtk: -2}, 
    'draco meteor': {spAtk: -2}, 
    'leaf storm': {spAtk: -2}, 
    'fleur cannon': {spAtk: -2},
    'growth': {attack: 1, spAtk: 1}, 
    'work up': {attack: 1, spAtk: 1},
    'dragon dance': {attack: 1, speed: 1},
    'bulk up': {attack: 1, defense: 1},
    'calm mind': {spAtk: 1, spDef: 1},
    'quiver dance': {spAtk: 1, spDef: 1, speed: 1},
    'geomancy': {spAtk: 2, spDef: 2, speed: 2}
};

const typeChart = { 
    normal: {rock: 0.5, ghost: 0, steel: 0.5}, fire: {fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2}, 
    water: {fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5}, grass: {fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5}, 
    electric: {water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5}, ice: {fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5}, 
    fighting: {normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5}, poison: {grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2}, 
    ground: {fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2}, flying: {grass: 2, electric: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5}, 
    psychic: {fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5}, bug: {fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5}, 
    rock: {fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5}, ghost: {normal: 0, psychic: 2, ghost: 2, dark: 0.5}, 
    dragon: {dragon: 2, steel: 0.5, fairy: 0}, dark: {fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5}, 
    steel: {fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2}, fairy: {fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5} 
};

window.getDynamicMoveBoosts = function(moveData) {
    if (!moveData) return null;
    const lowerName = moveData.name.toLowerCase();
    if (complexMoveStatEffects[lowerName]) return complexMoveStatEffects[lowerName];
    
    const desc = moveData.description ? moveData.description.toLowerCase() : '';
    if (!desc.includes("user") && !desc.includes("its own") && !desc.includes("its stats")) return null;
    if (desc.match(/\d+%/)) return null; 
    
    let boosts = {}; let found = false; let magnitude = 0;
    if (desc.includes('maximizes')) magnitude = 6;
    else if (desc.includes('drastically raises')) magnitude = 3;
    else if (desc.includes('sharply raises')) magnitude = 2;
    else if (desc.includes('harshly lowers')) magnitude = -2;
    else if (desc.includes('raises') || desc.includes('boosts')) magnitude = 1;
    else if (desc.includes('lowers') || desc.includes('decreases')) magnitude = -1;

    if (magnitude === 0) return null;

    if (desc.includes('attack') && !desc.includes('sp. atk') && !desc.includes('special attack')) { boosts.attack = magnitude; found = true; }
    if (desc.includes('defense') && !desc.includes('sp. def') && !desc.includes('special defense')) { boosts.defense = magnitude; found = true; }
    if (desc.includes('sp. atk') || desc.includes('special attack')) { boosts.spAtk = magnitude; found = true; }
    if (desc.includes('sp. def') || desc.includes('special defense')) { boosts.spDef = magnitude; found = true; }
    if (desc.includes('speed')) { boosts.speed = magnitude; found = true; }
    if (desc.includes('all stats')) { boosts.attack = magnitude; boosts.defense = magnitude; boosts.spAtk = magnitude; boosts.spDef = magnitude; boosts.speed = magnitude; found = true; }
    
    return found ? boosts : null;
};

window.getTypeEffectiveness = function(moveType, defenderTypes) {
    let effectiveness = 1;
    defenderTypes.forEach(t => { if(typeChart[moveType] && typeChart[moveType][t] !== undefined) effectiveness *= typeChart[moveType][t]; });
    return effectiveness;
};

window.getStageMultiplier = function(stage) {
    if (stage === 0) return 1;
    if (stage > 0) return (2 + stage) / 2;
    return 2 / (2 + Math.abs(stage));
};

window.calculateDamage = function() {
    const resultsContainer = document.getElementById('calc-damage-results');
    if (!resultsContainer) return;
    if (!calcState.attacker || !calcState.defender) { 
        resultsContainer.innerHTML = '<div style="color:#888; text-align:center; padding:20px; background:#222; border-radius:8px; border: 1px dashed #444;">Select both Pokémon to see damage rolls.</div>'; 
        return; 
    }
    
    let html = '';
    calcState.attackerMoves.forEach((moveName, idx) => {
        if (moveName === 'None') { html += `<div class="calc-move-card" onclick="openCalcMoveModal(${idx})"><div style="color: #666; font-style: italic; text-align: center; width: 100%;">+ Tap to select move</div></div>`; return; }
        
        const moveData = offlineMoves.find(m => m.name === moveName);
        let boostBtnHtml = '';
        if (window.getDynamicMoveBoosts(moveData)) { boostBtnHtml = `<button onclick="applyMoveBoosts('${moveName.replace(/'/g, "\\'")}', event)" style="background:#FF9800; color:#fff; border:none; border-radius:4px; padding:3px 8px; font-size:9px; font-weight:bold; cursor:pointer; margin-left:8px; text-transform:uppercase;">Apply</button>`; }
        
        if (!moveData || moveData.damage_class === 'status' || moveData.power === '-') {
            html += `
            <div class="calc-move-card" onclick="openCalcMoveModal(${idx})">
                <div style="flex: 1;"><div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; text-transform: capitalize;">${moveName.replace(/-/g, ' ')} <span class="type-chip type-${moveData ? moveData.type : 'normal'}" style="font-size:9px; padding:2px 4px; margin-left: 5px;">${moveData ? moveData.type : 'normal'}</span>${boostBtnHtml}</div>
                <div style="font-size: 11px; color: #888;">(Status / No Damage)</div></div>
            </div>`; return;
        }
        
        let power = parseInt(moveData.power) || 0; let moveType = moveData.type;
        let atkStatName = moveData.damage_class === 'physical' ? 'attack' : 'spAtk'; 
        let defStatName = moveData.damage_class === 'physical' ? 'defense' : 'spDef'; 
        let useDefenderAttack = false;
        const lowerName = moveName.toLowerCase(); let boostedTag = '';

        if (lowerName === 'stored power' || lowerName === 'power trip') {
            let totalPositiveStages = 0; for (let s in calcState.stages.attacker) { if (calcState.stages.attacker[s] > 0) totalPositiveStages += calcState.stages.attacker[s]; }
            power = 20 + (20 * totalPositiveStages); if (power > 20) boostedTag = `<span style="color:#FF9800; font-size:10px; margin-left:4px;">(Boosted)</span>`;
        }
        if (lowerName === 'punishment') {
            let totalPositiveStages = 0; for (let s in calcState.stages.defender) { if (calcState.stages.defender[s] > 0) totalPositiveStages += calcState.stages.defender[s]; }
            power = Math.min(200, 60 + (20 * totalPositiveStages)); if (power > 60) boostedTag = `<span style="color:#FF9800; font-size:10px; margin-left:4px;">(Boosted)</span>`;
        }
        if (lowerName === 'body press') { atkStatName = 'defense'; } 
        if (lowerName === 'foul play') { useDefenderAttack = true; } 
        if (['psyshock', 'psystrike', 'secret sword'].includes(lowerName)) { defStatName = 'defense'; }

        let rawAtk = useDefenderAttack ? getCalcStat('defender', 'attack') : getCalcStat('attacker', atkStatName); 
        let rawDef = getCalcStat('defender', defStatName);
        let atkStage = useDefenderAttack ? calcState.stages.defender['attack'] : calcState.stages.attacker[atkStatName]; 
        let defStage = calcState.stages.defender[defStatName];
        
        let attackStat = Math.floor(rawAtk * window.getStageMultiplier(atkStage)); 
        let defenseStat = Math.floor(rawDef * window.getStageMultiplier(defStage));

        // ==========================================
        // 1. RAW STAT MODIFIERS (ITEMS & ABILITIES)
        // ==========================================
        const attackerItem = calcState.items.attacker;
        const defenderItem = calcState.items.defender;
        const attackerAbility = calcState.abilities.attacker;
        const defenderAbility = calcState.abilities.defender;
        const attackerName = calcState.attacker.name; 

        if (attackerItem === 'choice-band' && moveData.damage_class === 'physical') attackStat = Math.floor(attackStat * 1.5);
        if (attackerItem === 'choice-specs' && moveData.damage_class === 'special') attackStat = Math.floor(attackStat * 1.5);
        if (attackerItem === 'thick-club' && (attackerName.includes('cubone') || attackerName.includes('marowak')) && moveData.damage_class === 'physical') attackStat = Math.floor(attackStat * 2);
        if (attackerItem === 'light-ball' && attackerName.includes('pikachu')) attackStat = Math.floor(attackStat * 2);

        if ((attackerAbility === 'huge-power' || attackerAbility === 'pure-power') && moveData.damage_class === 'physical') attackStat = Math.floor(attackStat * 2);

        if (defenderItem === 'assault-vest' && defStatName === 'spDef') defenseStat = Math.floor(defenseStat * 1.5);
        if (defenderItem === 'eviolite') defenseStat = Math.floor(defenseStat * 1.5); 
        if (defenderAbility === 'fur-coat' && moveData.damage_class === 'physical') defenseStat = Math.floor(defenseStat * 2);

        let damageBase = Math.floor(Math.floor((Math.floor(2 * 50 / 5) + 2) * power * attackStat / defenseStat) / 50) + 2;
        let stab = calcState.attacker.types.includes(moveType) ? 1.5 : 1; 
        if (attackerAbility === 'adaptability' && calcState.attacker.types.includes(moveType)) stab = 2.0;
        
        // ==========================================
        // 2. IMMUNITIES & EFFECTIVENESS
        // ==========================================
        let effectiveness = window.getTypeEffectiveness(moveType, calcState.defender.types);

        if (defenderAbility === 'levitate' && moveType === 'ground') effectiveness = 0;
        if ((defenderAbility === 'water-absorb' || defenderAbility === 'dry-skin' || defenderAbility === 'storm-drain') && moveType === 'water') effectiveness = 0;
        if ((defenderAbility === 'volt-absorb' || defenderAbility === 'motor-drive' || defenderAbility === 'lightning-rod') && moveType === 'electric') effectiveness = 0;
        if (defenderAbility === 'flash-fire' && moveType === 'fire') effectiveness = 0;
        if (defenderAbility === 'sap-sipper' && moveType === 'grass') effectiveness = 0;
        if (defenderAbility === 'earth-eater' && moveType === 'ground') effectiveness = 0;

        if (moveData.flags) {
            if (defenderAbility === 'soundproof' && moveData.flags.sound) effectiveness = 0;
            if (defenderAbility === 'bulletproof' && moveData.flags.bullet) effectiveness = 0;
        }

        // ==========================================
        // 3. FINAL DAMAGE MULTIPLIERS
        // ==========================================
        let itemMultiplier = 1.0;
        if (attackerItem === 'life-orb') itemMultiplier = 1.3;
        if (attackerItem === 'expert-belt' && effectiveness > 1) itemMultiplier = 1.2;
        if (attackerItem === 'muscle-band' && moveData.damage_class === 'physical') itemMultiplier = 1.1;
        if (attackerItem === 'wise-glasses' && moveData.damage_class === 'special') itemMultiplier = 1.1;

        const typeBoosters = { 
            'charcoal': 'fire', 'mystic-water': 'water', 'magnet': 'electric', 'miracle-seed': 'grass', 
            'never-melt-ice': 'ice', 'black-belt': 'fighting', 'poison-barb': 'poison', 'soft-sand': 'ground', 
            'sharp-beak': 'flying', 'twisted-spoon': 'psychic', 'silver-powder': 'bug', 'hard-stone': 'rock', 
            'spell-tag': 'ghost', 'dragon-fang': 'dragon', 'black-glasses': 'dark', 'metal-coat': 'steel', 
            'silk-scarf': 'normal', 'pixie-plate': 'fairy', 'flame-plate': 'fire', 'splash-plate': 'water'
        };
        if (typeBoosters[attackerItem] === moveType) itemMultiplier = 1.2;

        let abilityMultiplier = 1.0;
        if (attackerAbility === 'tinted-lens' && effectiveness < 1 && effectiveness > 0) abilityMultiplier *= 2.0;
        if (attackerAbility === 'reckless' && moveData.recoil) abilityMultiplier *= 1.2;
        
        if (moveData.flags) {
            if (attackerAbility === 'tough-claws' && moveData.flags.contact) abilityMultiplier *= 1.3;
            if (attackerAbility === 'iron-fist' && moveData.flags.punch) abilityMultiplier *= 1.2;
            if (attackerAbility === 'strong-jaw' && moveData.flags.bite) abilityMultiplier *= 1.5;
            if (attackerAbility === 'mega-launcher' && moveData.flags.pulse) abilityMultiplier *= 1.5;
            if (attackerAbility === 'punk-rock' && moveData.flags.sound) abilityMultiplier *= 1.3;
            if (attackerAbility === 'sharpness' && moveData.flags.slicing) abilityMultiplier *= 1.5;
            
            if (defenderAbility === 'punk-rock' && moveData.flags.sound) abilityMultiplier *= 0.5;
            if (defenderAbility === 'fluffy' && moveData.flags.contact) abilityMultiplier *= 0.5;
        }

        let minDamage = Math.floor(damageBase * stab * effectiveness * itemMultiplier * abilityMultiplier * 0.85); 
        let maxDamage = Math.floor(damageBase * stab * effectiveness * itemMultiplier * abilityMultiplier * 1.00);
        let defenderHp = getCalcStat('defender', 'hp');
        let minPct = ((minDamage / defenderHp) * 100).toFixed(1); let maxPct = ((maxDamage / defenderHp) * 100).toFixed(1);
        
        let effColor = '#fff'; let koText = '';
        if (effectiveness > 1) effColor = '#4CAF50'; if (effectiveness < 1) effColor = '#f44336'; if (effectiveness === 0) effColor = '#888';
        if (minDamage >= defenderHp) koText = `<div style="font-size: 9px; color: #FF9800; text-transform: uppercase; margin-top: 2px;">Gua. OHKO</div>`; else if (maxDamage >= defenderHp) koText = `<div style="font-size: 9px; color: #FF9800; text-transform: uppercase; margin-top: 2px;">Pos. OHKO</div>`;

        html += `
        <div class="calc-move-card" onclick="openCalcMoveModal(${idx})">
            <div style="flex: 1;"><div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; text-transform: capitalize;">${moveName.replace(/-/g, ' ')} <span class="type-chip type-${moveType}" style="font-size:9px; padding:2px 4px; margin-left: 5px;">${moveType}</span>${boostBtnHtml}</div>
            <div style="font-size: 11px; color: #aaa;">Pwr: ${power} ${boostedTag} | Acc: ${moveData.accuracy}</div></div>
            <div style="text-align: right;"><div style="font-size: 18px; font-weight: bold; color: ${effColor};">${minPct}% - ${maxPct}%</div><div style="font-size: 11px; color: #888;">(${minDamage} - ${maxDamage} HP)</div>${koText}</div>
        </div>`;
    });
    resultsContainer.innerHTML = html;
};
