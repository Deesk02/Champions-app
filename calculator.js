// ==========================================
// CUSTOM DAMAGE CALCULATOR ENGINE
// ==========================================

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

// ==========================================
// UTILITY & UI FUNCTIONS
// ==========================================

window.getDynamicMoveBoosts = function(moveData) {
    if (!moveData) return null;
    const lowerName = moveData.name.toLowerCase().replace(/ /g, '-');
    
    // 1. Check our new offline MoveDex first!
    if (window.MoveDex && window.MoveDex[lowerName]) {
        const dexEntry = window.MoveDex[lowerName];
        if (dexEntry.selfBoosts || dexEntry.selfDrops) {
            let boosts = {};
            if (dexEntry.selfBoosts) Object.assign(boosts, dexEntry.selfBoosts);
            if (dexEntry.selfDrops) {
                for (let stat in dexEntry.selfDrops) {
                    boosts[stat] = -dexEntry.selfDrops[stat];
                }
            }
            return Object.keys(boosts).length > 0 ? boosts : null;
        }
    }
    
    // 2. Fallback: Parse the description for custom/unlisted moves
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

window.applyMoveBoosts = function(moveName, event) {
    try {
        event.stopPropagation(); 
        const moveData = offlineMoves.find(m => m.name === moveName);
        const boosts = getDynamicMoveBoosts(moveData);
        if (!boosts) return;
        
        const attackerAbility = calcState.abilities.attacker;

        for (let stat in boosts) {
            let change = boosts[stat];
            if (attackerAbility === 'contrary') change = change * -1;
            else if (attackerAbility === 'simple') change = change * 2;
            
            let current = calcState.stages.attacker[stat];
            current += change;
            if (current > 6) current = 6; 
            if (current < -6) current = -6;
            calcState.stages.attacker[stat] = current;
        }
        renderCalcUI();
    } catch (err) { alert("Apply boost error: " + err.message); }
};

window.getTypeEffectiveness = function(moveType, defenderTypes) {
    let effectiveness = 1;
    defenderTypes.forEach(t => { 
        let safeType = t.toLowerCase();
        if(typeChart[moveType] && typeChart[moveType][safeType] !== undefined) effectiveness *= typeChart[moveType][safeType]; 
    });
    return effectiveness;
};

window.getStageMultiplier = function(stage) {
    if (stage === 0) return 1;
    if (stage > 0) return (2 + stage) / 2;
    return 2 / (2 + Math.abs(stage));
};

window.updateCalcFieldState = function() {
    if (!calcState.field) calcState.field = { weather: 'none', terrain: 'none' };
    calcState.field.weather = document.getElementById('calc-weather-select').value;
    calcState.field.terrain = document.getElementById('calc-terrain-select').value;
    renderCalcUI(); 
};

window.resetCalcState = function() {
    calcState.stages.attacker = {attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0};
    calcState.stages.defender = {attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0};
    if (calcState.field) calcState.field = { weather: 'none', terrain: 'none' };
    
    const wSelect = document.getElementById('calc-weather-select');
    const tSelect = document.getElementById('calc-terrain-select');
    if(wSelect) wSelect.value = 'none';
    if(tSelect) tSelect.value = 'none';
    
    if (typeof renderCalcUI === 'function') renderCalcUI();
};

// ==========================================
// CORE DAMAGE ENGINE
// ==========================================
window.calcState = {
    attacker: null, defender: null,
    attackerMoves: [], defenderMoves: [],
    sp: { attacker: {hp:0, attack:0, defense:0, spAtk:0, spDef:0, speed:0}, defender: {hp:0, attack:0, defense:0, spAtk:0, spDef:0, speed:0} },
    natures: { attacker: 'serious', defender: 'serious' },
    stages: { attacker: {attack:0, defense:0, spAtk:0, spDef:0, speed:0}, defender: {attack:0, defense:0, spAtk:0, spDef:0, speed:0} },
    abilities: { attacker: 'None', defender: 'None' },
    items: { attacker: 'None', defender: 'None' },
    field: { weather: 'none', terrain: 'none' } 
};

window.calculateDamage = function() {
    const resultsContainer = document.getElementById('calc-damage-results');
    if (!resultsContainer) return;
    if (!calcState.attacker || !calcState.defender) { 
        resultsContainer.innerHTML = '<div style="color:#888; text-align:center; padding:20px; background:#222; border-radius:8px; border: 1px dashed #444;">Select both Pokémon to see damage rolls.</div>'; 
        return; 
    }
    
    if (!calcState.field) calcState.field = { weather: 'none', terrain: 'none' };
    
    let html = '';
    calcState.attackerMoves.forEach((moveName, idx) => {
        if (moveName === 'None') { html += `<div class="calc-move-card" onclick="openCalcMoveModal(${idx})"><div style="color: #666; font-style: italic; text-align: center; width: 100%;">+ Tap to select move</div></div>`; return; }
        
        let moveData = offlineMoves.find(m => m.name === moveName);
        
        if (!moveData && window.MoveDex && window.MoveDex[moveName.toLowerCase().replace(/ /g, '-')]) {
            moveData = window.MoveDex[moveName.toLowerCase().replace(/ /g, '-')];
            moveData.name = moveName; 
        }

        let boostBtnHtml = '';
        if (window.getDynamicMoveBoosts(moveData)) { boostBtnHtml = `<button onclick="applyMoveBoosts('${moveName.replace(/'/g, "\\'")}', event)" style="background:#FF9800; color:#fff; border:none; border-radius:4px; padding:3px 8px; font-size:9px; font-weight:bold; cursor:pointer; margin-left:8px; text-transform:uppercase;">Apply</button>`; }
        
        if (!moveData || moveData.damage_class === 'status' || moveData.category === 'status' || moveData.power === '-' || (!moveData.power && !moveData.bp)) {
            html += `
            <div class="calc-move-card" onclick="openCalcMoveModal(${idx})">
                <div style="flex: 1;"><div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; text-transform: capitalize;">${moveName.replace(/-/g, ' ')} <span class="type-chip type-${moveData ? moveData.type : 'normal'}" style="font-size:9px; padding:2px 4px; margin-left: 5px;">${moveData ? moveData.type : 'normal'}</span>${boostBtnHtml}</div>
                <div style="font-size: 11px; color: #888;">(Status / No Damage)</div></div>
            </div>`; return;
        }
        
        let power = parseInt(moveData.power) || parseInt(moveData.bp) || 0; 
        let moveType = moveData.type ? moveData.type.toLowerCase() : 'normal';
        let damageClass = moveData.damage_class || moveData.category || 'physical';
        
        let atkStatName = damageClass === 'physical' ? 'attack' : 'spAtk'; 
        let defStatName = damageClass === 'physical' ? 'defense' : 'spDef'; 
        let useDefenderAttack = false;
        const lowerName = moveName.toLowerCase().replace(/ /g, '-'); 
        let boostedTag = '';

        const attackerItem = calcState.items.attacker;
        const defenderItem = calcState.items.defender;
        const attackerAbility = calcState.abilities.attacker;
        const defenderAbility = calcState.abilities.defender;
        const attackerName = calcState.attacker.name.toLowerCase(); 
        const defTypesSafe = calcState.defender.types.map(t => t.toLowerCase());

        // --- NEW: TYPE-CHANGING ABILITIES (-ATE) ---
        if (moveType === 'normal') {
            if (attackerAbility === 'aerilate') { moveType = 'flying'; power = Math.floor(power * 1.2); }
            else if (attackerAbility === 'pixilate') { moveType = 'fairy'; power = Math.floor(power * 1.2); }
            else if (attackerAbility === 'refrigerate') { moveType = 'ice'; power = Math.floor(power * 1.2); }
            else if (attackerAbility === 'galvanize') { moveType = 'electric'; power = Math.floor(power * 1.2); }
        }

        // --- DYNAMIC FIELD MOVES (WEATHER & TERRAIN) ---
        const activeWeather = calcState.field.weather;
        const activeTerrain = calcState.field.terrain;
        const isAttackerGrounded = !calcState.attacker.types.map(t=>t.toLowerCase()).includes('flying') && attackerAbility !== 'levitate' && attackerItem !== 'air-balloon';
        const isDefenderGrounded = !defTypesSafe.includes('flying') && defenderAbility !== 'levitate' && defenderItem !== 'air-balloon';

        if (lowerName === 'weather-ball' && activeWeather !== 'none' && activeWeather !== 'strong-winds') {
            power = 100;
            if (activeWeather === 'sun' || activeWeather === 'harsh-sun') moveType = 'fire';
            if (activeWeather === 'rain' || activeWeather === 'heavy-rain') moveType = 'water';
            if (activeWeather === 'sand') moveType = 'rock';
            if (activeWeather === 'snow') moveType = 'ice';
            boostedTag = `<span style="color:#2196F3; font-size:10px; margin-left:4px;">(Weather)</span>`;
        }

        if (lowerName === 'terrain-pulse' && activeTerrain !== 'none' && isAttackerGrounded) {
            power = 100;
            if (activeTerrain === 'electric') moveType = 'electric';
            if (activeTerrain === 'grassy') moveType = 'grass';
            if (activeTerrain === 'psychic') moveType = 'psychic';
            if (activeTerrain === 'misty') moveType = 'fairy';
            boostedTag = `<span style="color:#9C27B0; font-size:10px; margin-left:4px;">(Terrain)</span>`;
        }

        if (lowerName === 'expanding-force' && activeTerrain === 'psychic' && isAttackerGrounded) {
            power = Math.floor(power * 1.5);
            boostedTag = `<span style="color:#9C27B0; font-size:10px; margin-left:4px;">(Terrain)</span>`;
        }
        
        if (lowerName === 'rising-voltage' && activeTerrain === 'electric' && isDefenderGrounded) {
            power = power * 2;
            boostedTag = `<span style="color:#9C27B0; font-size:10px; margin-left:4px;">(Terrain)</span>`;
        }

        if (lowerName === 'misty-explosion' && activeTerrain === 'misty' && isAttackerGrounded) {
            power = Math.floor(power * 1.5);
            boostedTag = `<span style="color:#9C27B0; font-size:10px; margin-left:4px;">(Terrain)</span>`;
        }

        if ((lowerName === 'solar-beam' || lowerName === 'solar-blade') && ['rain', 'heavy-rain', 'sand', 'snow'].includes(activeWeather)) {
            power = Math.floor(power * 0.5);
            boostedTag = `<span style="color:#f44336; font-size:10px; margin-left:4px;">(Halved)</span>`;
        }

        // --- SPECIAL MOVE LOGIC ---
        if (attackerAbility === 'technician' && power <= 60 && power > 0) {
            power = Math.floor(power * 1.5);
            boostedTag = `<span style="color:#FF9800; font-size:10px; margin-left:4px;">(Tech)</span>`;
        }
        if (lowerName === 'stored-power' || lowerName === 'power-trip') {
            let totalPositiveStages = 0; for (let s in calcState.stages.attacker) { if (calcState.stages.attacker[s] > 0) totalPositiveStages += calcState.stages.attacker[s]; }
            power = 20 + (20 * totalPositiveStages); if (power > 20) boostedTag = `<span style="color:#FF9800; font-size:10px; margin-left:4px;">(Boosted)</span>`;
        }
        if (lowerName === 'punishment') {
            let totalPositiveStages = 0; for (let s in calcState.stages.defender) { if (calcState.stages.defender[s] > 0) totalPositiveStages += calcState.stages.defender[s]; }
            power = Math.min(200, 60 + (20 * totalPositiveStages)); if (power > 60) boostedTag = `<span style="color:#FF9800; font-size:10px; margin-left:4px;">(Boosted)</span>`;
        }
        if (lowerName === 'body-press') { atkStatName = 'defense'; } 
        if (lowerName === 'foul-play') { useDefenderAttack = true; } 
        if (['psyshock', 'psystrike', 'secret-sword'].includes(lowerName)) { defStatName = 'defense'; }

        // --- STAT & UNAWARE CALCULATION ---
        let rawAtk = useDefenderAttack ? getCalcStat('defender', 'attack') : getCalcStat('attacker', atkStatName); 
        let rawDef = getCalcStat('defender', defStatName);
        
        let atkStage = useDefenderAttack ? calcState.stages.defender['attack'] : calcState.stages.attacker[atkStatName]; 
        let defStage = calcState.stages.defender[defStatName];
        
        if (defenderAbility === 'unaware' && atkStage > 0) atkStage = 0;
        if (attackerAbility === 'unaware' && defStage > 0) defStage = 0;

        let attackStat = Math.floor(rawAtk * window.getStageMultiplier(atkStage)); 
        let defenseStat = Math.floor(rawDef * window.getStageMultiplier(defStage));

        if (activeWeather === 'sand' && defTypesSafe.includes('rock') && defStatName === 'spDef') {
            defenseStat = Math.floor(defenseStat * 1.5);
        }
        if (activeWeather === 'snow' && defTypesSafe.includes('ice') && defStatName === 'defense') {
            defenseStat = Math.floor(defenseStat * 1.5);
        }

        // ==========================================
        // 1. RAW STAT MODIFIERS (ITEMS & ABILITIES)
        // ==========================================
        if (attackerItem === 'choice-band' && damageClass === 'physical') attackStat = Math.floor(attackStat * 1.5);
        if (attackerItem === 'choice-specs' && damageClass === 'special') attackStat = Math.floor(attackStat * 1.5);
        if (attackerItem === 'thick-club' && (attackerName.includes('cubone') || attackerName.includes('marowak')) && damageClass === 'physical') attackStat = Math.floor(attackStat * 2);
        if (attackerItem === 'light-ball' && attackerName.includes('pikachu')) attackStat = Math.floor(attackStat * 2);

        if ((attackerAbility === 'huge-power' || attackerAbility === 'pure-power') && damageClass === 'physical') attackStat = Math.floor(attackStat * 2);

        if (defenderItem === 'assault-vest' && defStatName === 'spDef') defenseStat = Math.floor(defenseStat * 1.5);
        if (defenderItem === 'eviolite') defenseStat = Math.floor(defenseStat * 1.5); 
        if (defenderAbility === 'fur-coat' && damageClass === 'physical') defenseStat = Math.floor(defenseStat * 2);

        let damageBase = Math.floor(Math.floor((Math.floor(2 * 50 / 5) + 2) * power * attackStat / defenseStat) / 50) + 2;
        let stab = calcState.attacker.types.map(t=>t.toLowerCase()).includes(moveType) ? 1.5 : 1; 
        if (attackerAbility === 'adaptability' && calcState.attacker.types.map(t=>t.toLowerCase()).includes(moveType)) stab = 2.0;
        
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
        let weatherMult = 1.0;
        if (activeWeather !== 'none') {
            if ((activeWeather === 'sun' || activeWeather === 'harsh-sun') && moveType === 'fire') weatherMult = 1.5;
            if ((activeWeather === 'sun' || activeWeather === 'harsh-sun') && moveType === 'water') weatherMult = 0.5;
            if ((activeWeather === 'rain' || activeWeather === 'heavy-rain') && moveType === 'water') weatherMult = 1.5;
            if ((activeWeather === 'rain' || activeWeather === 'heavy-rain') && moveType === 'fire') weatherMult = 0.5;
            
            if (activeWeather === 'harsh-sun' && moveType === 'water') weatherMult = 0;
            if (activeWeather === 'heavy-rain' && moveType === 'fire') weatherMult = 0;
        }

        let terrainMult = 1.0;
        if (activeTerrain !== 'none') {
            if (isAttackerGrounded) {
                if (activeTerrain === 'electric' && moveType === 'electric') terrainMult = 1.3;
                if (activeTerrain === 'grassy' && moveType === 'grass') terrainMult = 1.3;
                if (activeTerrain === 'psychic' && moveType === 'psychic') terrainMult = 1.3;
            }
            if (isDefenderGrounded) {
                if (activeTerrain === 'misty' && moveType === 'dragon') terrainMult = 0.5;
                if (activeTerrain === 'grassy' && ['earthquake', 'bulldoze', 'magnitude'].includes(lowerName)) terrainMult = 0.5;
            }
        }

        // --- ITEMS ---
        let itemMultiplier = 1.0;
        if (attackerItem === 'life-orb') itemMultiplier = 1.3;
        if (attackerItem === 'expert-belt' && effectiveness > 1) itemMultiplier = 1.2;
        if (attackerItem === 'muscle-band' && damageClass === 'physical') itemMultiplier = 1.1;
        if (attackerItem === 'wise-glasses' && damageClass === 'special') itemMultiplier = 1.1;

        const typeBoosters = { 
            'charcoal': 'fire', 'mystic-water': 'water', 'magnet': 'electric', 'miracle-seed': 'grass', 
            'never-melt-ice': 'ice', 'black-belt': 'fighting', 'poison-barb': 'poison', 'soft-sand': 'ground', 
            'sharp-beak': 'flying', 'twisted-spoon': 'psychic', 'silver-powder': 'bug', 'hard-stone': 'rock', 
            'spell-tag': 'ghost', 'dragon-fang': 'dragon', 'black-glasses': 'dark', 'metal-coat': 'steel', 
            'silk-scarf': 'normal', 'pixie-plate': 'fairy', 'flame-plate': 'fire', 'splash-plate': 'water', 'fairy-feather': 'fairy'
        };
        if (typeBoosters[attackerItem] === moveType) itemMultiplier = 1.2;

        if (window.ItemDex && window.ItemDex[attackerItem]) {
            const iData = window.ItemDex[attackerItem];
            if (iData.typeOffenseMult === moveType && iData.bpMult) itemMultiplier = Math.max(itemMultiplier, iData.bpMult);
        }

        // --- ABILITIES ---
        let abilityMultiplier = 1.0;
        if (attackerAbility === 'tinted-lens' && effectiveness < 1 && effectiveness > 0) abilityMultiplier *= 2.0;
        if (attackerAbility === 'reckless' && moveData.recoil) abilityMultiplier *= 1.2;
        if (attackerAbility === 'water-bubble' && moveType === 'water') abilityMultiplier *= 2.0;
        if (attackerAbility === 'transistor' && moveType === 'electric') abilityMultiplier *= 1.3; 
        if (attackerAbility === 'dragons-maw' && moveType === 'dragon') abilityMultiplier *= 1.5;
        
        if (moveData.flags) {
            if (attackerAbility === 'tough-claws' && moveData.flags.contact) abilityMultiplier *= 1.3;
            if (attackerAbility === 'iron-fist' && moveData.flags.punch) abilityMultiplier *= 1.2;
            if (attackerAbility === 'strong-jaw' && moveData.flags.bite) abilityMultiplier *= 1.5;
            if (attackerAbility === 'mega-launcher' && moveData.flags.pulse) abilityMultiplier *= 1.5;
            if (attackerAbility === 'punk-rock' && moveData.flags.sound) abilityMultiplier *= 1.3;
            if (attackerAbility === 'sharpness' && moveData.flags.slicing) abilityMultiplier *= 1.5;
            
            if (defenderAbility === 'punk-rock' && moveData.flags.sound) abilityMultiplier *= 0.5;
            if (defenderAbility === 'fluffy' && moveData.flags.contact && moveType !== 'fire') abilityMultiplier *= 0.5;
        }

        if (defenderAbility === 'thick-fat' && (moveType === 'fire' || moveType === 'ice')) abilityMultiplier *= 0.5;
        if (defenderAbility === 'water-bubble' && moveType === 'fire') abilityMultiplier *= 0.5;
        if (defenderAbility === 'purifying-salt' && moveType === 'ghost') abilityMultiplier *= 0.5;
        if (defenderAbility === 'fluffy' && moveType === 'fire') abilityMultiplier *= 2.0; 

        // CALCULATE ROLL
        let minDamage = Math.floor(damageBase * stab * effectiveness * weatherMult * terrainMult * itemMultiplier * abilityMultiplier * 0.85); 
        let maxDamage = Math.floor(damageBase * stab * effectiveness * weatherMult * terrainMult * itemMultiplier * abilityMultiplier * 1.00);
        let defenderHp = getCalcStat('defender', 'hp');
        let minPct = ((minDamage / defenderHp) * 100).toFixed(1); let maxPct = ((maxDamage / defenderHp) * 100).toFixed(1);
        
        let effColor = '#fff'; let koText = '';
        if (effectiveness > 1) effColor = '#4CAF50'; if (effectiveness < 1) effColor = '#f44336'; if (effectiveness === 0) effColor = '#888';
        if (minDamage >= defenderHp) koText = `<div style="font-size: 9px; color: #FF9800; text-transform: uppercase; margin-top: 2px;">Gua. OHKO</div>`; else if (maxDamage >= defenderHp) koText = `<div style="font-size: 9px; color: #FF9800; text-transform: uppercase; margin-top: 2px;">Pos. OHKO</div>`;

        html += `
        <div class="calc-move-card" onclick="openCalcMoveModal(${idx})">
            <div style="flex: 1;"><div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; text-transform: capitalize;">${moveName.replace(/-/g, ' ')} <span class="type-chip type-${moveType}" style="font-size:9px; padding:2px 4px; margin-left: 5px;">${moveType}</span>${boostBtnHtml}</div>
            <div style="font-size: 11px; color: #aaa;">Pwr: ${power} ${boostedTag} | Acc: ${moveData.accuracy || 100}</div></div>
            <div style="text-align: right;"><div style="font-size: 18px; font-weight: bold; color: ${effColor};">${minPct}% - ${maxPct}%</div><div style="font-size: 11px; color: #888;">(${minDamage} - ${maxDamage} HP)</div>${koText}</div>
        </div>`;
    });
    resultsContainer.innerHTML = html;
};
