// ==========================================
// 1. GLOBAL VARIABLES & INITIALIZATION
// ==========================================
let offlineDatabase = []; 
let offlineAbilities = []; 
let offlineMoves = []; 
let offlineItems = []; 
let offlineEvolutions = []; 
let offlineOverrides = {}; 

let regulations = []; 
let activeRegulationId = null; 

let currentTeam = [null, null, null, null, null, null]; 
let savedTeams = []; 
let metaThreats = {}; // NEW: Stores grouped meta builds
let activeSlotIndex = null; 

let currentDisplayedPokemon = []; 
let currentRenderCount = 0; 
const CHUNK_SIZE = 40; 
let currentSortMode = 'id'; 
let currentSortAsc = true; 

const viewPokemon = document.getElementById('view-pokemon'); 
const viewAbilities = document.getElementById('view-abilities'); 
const viewMoves = document.getElementById('view-moves'); 
const viewItems = document.getElementById('view-items'); 
const viewTeambuilder = document.getElementById('view-teambuilder'); 
const viewCalculator = document.getElementById('view-calculator'); 
const viewDetails = document.getElementById('view-details'); 

const resultsDiv = document.getElementById('search-results'); 
const abilityResultsDiv = document.getElementById('ability-results'); 
const movesResultsDiv = document.getElementById('moves-results'); 
const itemsResultsDiv = document.getElementById('items-results'); 
const statusText = document.getElementById('status'); 
const syncAllBtn = document.getElementById('sync-all-btn'); 
const progressContainer = document.getElementById('sync-progress-container'); 
const progressBar = document.getElementById('sync-progress-bar'); 

const tagInput = document.getElementById('tag-input'); 
const activeTagsContainer = document.getElementById('active-tags'); 
const abilitySearch = document.getElementById('ability-search'); 
const movesSearch = document.getElementById('moves-search'); 
const itemsSearch = document.getElementById('items-search'); 

const detailHeader = document.getElementById('detail-header'); 
const detailName = document.getElementById('detail-name'); 
const detailId = document.getElementById('detail-id'); 
const detailTypes = document.getElementById('detail-types'); 
const detailSprite = document.getElementById('detail-sprite'); 
const detailStats = document.getElementById('detail-stats'); 
const detailAbilities = document.getElementById('detail-abilities'); 
const detailEvoList = document.getElementById('detail-evo-list'); 
const detailEvoContainer = document.getElementById('detail-evo-container'); 
const detailFormsList = document.getElementById('detail-forms-list'); 
const detailFormsContainer = document.getElementById('detail-forms-container'); 
const detailMovesList = document.getElementById('detail-moves-list'); 
const detailTabInfo = document.getElementById('detail-tab-info'); 
const detailTabMoves = document.getElementById('detail-tab-moves'); 
const detailNavInfo = document.getElementById('detail-nav-info'); 
const detailNavMoves = document.getElementById('detail-nav-moves'); 

let activeTags = []; 

const naturesList = { 
    adamant: {plus: 'attack', minus: 'spAtk', desc: '(+Atk, -Sp.A)'}, 
    bold: {plus: 'defense', minus: 'attack', desc: '(+Def, -Atk)'}, 
    brave: {plus: 'attack', minus: 'speed', desc: '(+Atk, -Spe)'}, 
    calm: {plus: 'spDef', minus: 'attack', desc: '(+Sp.D, -Atk)'}, 
    careful: {plus: 'spDef', minus: 'spAtk', desc: '(+Sp.D, -Sp.A)'}, 
    gentle: {plus: 'spDef', minus: 'defense', desc: '(+Sp.D, -Def)'}, 
    hasty: {plus: 'speed', minus: 'defense', desc: '(+Spe, -Def)'}, 
    impish: {plus: 'defense', minus: 'spAtk', desc: '(+Def, -Sp.A)'}, 
    jolly: {plus: 'speed', minus: 'spAtk', desc: '(+Spe, -Sp.A)'}, 
    lax: {plus: 'defense', minus: 'spDef', desc: '(+Def, -Sp.D)'}, 
    lonely: {plus: 'attack', minus: 'defense', desc: '(+Atk, -Def)'}, 
    mild: {plus: 'spAtk', minus: 'defense', desc: '(+Sp.A, -Def)'}, 
    modest: {plus: 'spAtk', minus: 'attack', desc: '(+Sp.A, -Atk)'}, 
    naive: {plus: 'speed', minus: 'spDef', desc: '(+Spe, -Sp.D)'}, 
    naughty: {plus: 'attack', minus: 'spDef', desc: '(+Atk, -Sp.D)'}, 
    quiet: {plus: 'spAtk', minus: 'speed', desc: '(+Sp.A, -Spe)'}, 
    rash: {plus: 'spAtk', minus: 'spDef', desc: '(+Sp.A, -Sp.D)'}, 
    relaxed: {plus: 'defense', minus: 'speed', desc: '(+Def, -Spe)'}, 
    sassy: {plus: 'spDef', minus: 'speed', desc: '(+Sp.D, -Spe)'}, 
    serious: {plus: 'none', minus: 'none', desc: '(Neutral)'}, 
    timid: {plus: 'speed', minus: 'attack', desc: '(+Spe, -Atk)'} 
};

function toId(str) {
    if (!str) return '';
    return String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
}

window.onload = async () => { 
    // 1. DEV MODE KILL SWITCH (Destroys the stubborn cache)
    if ('serviceWorker' in navigator) {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            try {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (let reg of registrations) await reg.unregister();
            } catch (err) {}
        } else {
            try { await navigator.serviceWorker.register('./sw.js'); } 
            catch (err) { console.log('SW Failed'); }
        }
    }

    // 2. BULLETPROOF DB LOADER
    try {
        await initDB(); 
        await loadLocalData(); 
    } catch (err) { console.error("DB Error", err); }
    
    // 3. BULLETPROOF LOCAL STORAGE (Prevents the silent JSON crash)
    try {
        const savedRegs = localStorage.getItem('championsRegulations'); 
        if (savedRegs) {
            const parsed = JSON.parse(savedRegs);
            regulations = Array.isArray(parsed) ? parsed : [];
        }
    } catch (err) { regulations = []; }
        try {
        const savedThreatsData = localStorage.getItem('championsMetaThreats'); 
        if (savedThreatsData) {
            metaThreats = JSON.parse(savedThreatsData);
        }
    } catch (err) { metaThreats = {}; }

    try {
        const savedTeamsData = localStorage.getItem('championsSavedTeams'); 
        if (savedTeamsData) {
            const parsed = JSON.parse(savedTeamsData);
            savedTeams = Array.isArray(parsed) ? parsed : [];
        }
    } catch (err) { savedTeams = []; }
    
    // 4. GUARANTEED UI ATTACHMENT
    try { populateTopFilters(); } catch(e){}
    try { setupDrawer(); } catch(e){}
    try { setupFAB(); } catch(e){}
    try { renderTeamGrid(); } catch(e){}
};
// ==========================================
// 2. NAVIGATION & DRAWER
// ==========================================
function setupDrawer() { 
    const menuToggle = document.getElementById('menu-toggle') || document.getElementById('hamburger-btn'); 
    const navDrawer = document.getElementById('nav-drawer'); 
    const drawerOverlay = document.getElementById('drawer-overlay'); 
    
    function toggleDrawer() { 
        navDrawer.classList.toggle('open'); 
        drawerOverlay.classList.toggle('visible'); 
    } 
    
    if (menuToggle) menuToggle.addEventListener('click', toggleDrawer); 
    if (drawerOverlay) drawerOverlay.addEventListener('click', toggleDrawer); 
    
    const tabs = [ 
        { btn: 'tab-pokemon-btn', view: viewPokemon, title: 'Pokédex' }, 
        { btn: 'tab-abilities-btn', view: viewAbilities, title: 'Abilities' }, 
        { btn: 'tab-moves-btn', view: viewMoves, title: 'Moves' }, 
        { btn: 'tab-items-btn', view: viewItems, title: 'Items' }, 
        { btn: 'tab-teambuilder-btn', view: viewTeambuilder, title: 'Team Builder' }, 
        { btn: 'tab-calculator-btn', view: viewCalculator, title: 'Damage Calc' } 
    ]; 
    
    tabs.forEach(tab => { 
        const btnEl = document.getElementById(tab.btn);
        if (btnEl) {
            btnEl.addEventListener('click', () => { 
                window.switchView(tab.btn);
                const titleEl = document.getElementById('header-title');
                if (titleEl) titleEl.innerText = tab.title; 
                toggleDrawer(); 
            }); 
        }
    }); 
}

window.switchView = function(activeBtnId) { 
    closeDetailedView(); 
    
    [viewPokemon, viewAbilities, viewMoves, viewItems, viewTeambuilder, viewCalculator].forEach(v => {
        if (v) v.classList.remove('active');
    }); 
    document.querySelectorAll('.drawer-btn').forEach(b => b.classList.remove('active')); 
    
    const activeBtn = document.getElementById(activeBtnId);
    if (activeBtn) activeBtn.classList.add('active'); 
    
    if (activeBtnId === 'tab-pokemon-btn' && viewPokemon) viewPokemon.classList.add('active'); 
    if (activeBtnId === 'tab-abilities-btn' && viewAbilities) viewAbilities.classList.add('active'); 
    if (activeBtnId === 'tab-moves-btn' && viewMoves) viewMoves.classList.add('active'); 
    if (activeBtnId === 'tab-items-btn' && viewItems) viewItems.classList.add('active'); 
    if (activeBtnId === 'tab-teambuilder-btn' && viewTeambuilder) viewTeambuilder.classList.add('active'); 
    if (activeBtnId === 'tab-calculator-btn' && viewCalculator) {
        viewCalculator.classList.add('active');
        renderCalcUI();
    }
    
    const fab = document.getElementById('fab-container');
    if (fab) fab.style.display = (activeBtnId === 'tab-pokemon-btn') ? 'flex' : 'none';
}

// ==========================================
// 3. INDEXEDDB STORAGE MANAGER
// ==========================================
let db; 
function initDB() { 
    return new Promise((resolve, reject) => { 
        const request = indexedDB.open("ChampionsToolBoxDB", 3); 
        request.onupgradeneeded = (event) => { 
            db = event.target.result; 
            if(!db.objectStoreNames.contains('pokemon')) db.createObjectStore('pokemon', { keyPath: 'id' }); 
            if(!db.objectStoreNames.contains('abilities')) db.createObjectStore('abilities', { keyPath: 'id' }); 
            if(!db.objectStoreNames.contains('moves')) db.createObjectStore('moves', { keyPath: 'id' }); 
            if(!db.objectStoreNames.contains('items')) db.createObjectStore('items', { keyPath: 'id' }); 
            if(!db.objectStoreNames.contains('evolutions')) db.createObjectStore('evolutions', { autoIncrement: true }); 
            if(!db.objectStoreNames.contains('overrides')) db.createObjectStore('overrides', { keyPath: 'id' }); 
        }; 
        request.onsuccess = (event) => { db = event.target.result; resolve(db); }; 
        request.onerror = (event) => { reject("DB Error"); }; 
    }); 
}

function saveToDB(storeName, dataArray) { 
    return new Promise((resolve, reject) => { 
        const transaction = db.transaction([storeName], "readwrite"); 
        const store = transaction.objectStore(storeName); 
        store.clear(); 
        dataArray.forEach(item => store.put(item)); 
        transaction.oncomplete = () => resolve(); 
        transaction.onerror = () => reject(); 
    }); 
}

function loadFromDB(storeName) { 
    return new Promise((resolve, reject) => { 
        const transaction = db.transaction([storeName], "readonly"); 
        const store = transaction.objectStore(storeName); 
        const request = store.getAll(); 
        request.onsuccess = () => resolve(request.result); 
        request.onerror = () => reject(); 
    }); 
}

async function loadLocalData() { 
    try { 
        offlineDatabase = await loadFromDB('pokemon'); 
        offlineAbilities = await loadFromDB('abilities'); 
        offlineMoves = await loadFromDB('moves'); 
        offlineItems = await loadFromDB('items'); 
        offlineEvolutions = await loadFromDB('evolutions'); 
        const overridesList = await loadFromDB('overrides'); 
        
        overridesList.forEach(o => offlineOverrides[o.id] = o); 
        
        if (offlineDatabase.length > 0) { 
            statusText.innerText = `Ready. (${offlineDatabase.length} loaded)`; 
            enableSearch(); 
            liveFilterPokemon(''); 
            displayAbilities(offlineAbilities); 
            if(typeof renderMovesTab === 'function') renderMovesTab(); else displayMoves(offlineMoves);
            displayItems(offlineItems); 
        } else { 
            statusText.innerText = "Database empty. Internet required to sync."; 
        } 
    } catch(e) { statusText.innerText = "Error loading local data."; } 
}

// ==========================================
// 4. PURE SHOWDOWN API FETCHERS
// ==========================================
const delay = ms => new Promise(res => setTimeout(res, ms)); 

async function fetchWithRetry(url, retries = 5) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, { cache: "no-store" });
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return await response.json();
        } catch (err) {
            console.warn(`Fetch JSON failed (${i+1}/${retries}): ${url}`);
            if (i === retries - 1) throw err;
            await new Promise(res => setTimeout(res, 2000)); 
        }
    }
}

async function fetchJSWithRetry(url, retries = 5) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, { cache: "no-store" });
            if (!response.ok) throw new Error(`HTTP Error`);
            const text = await response.text();
            
            const startIndex = text.indexOf('{');
            const endIndex = text.lastIndexOf('}');
            const dataString = text.substring(startIndex, endIndex + 1);
            
            return new Function("return " + dataString)();
        } catch (err) {
            console.warn(`Fetch JS failed (${i+1}/${retries}): ${url}`);
            if (i === retries - 1) throw err;
            await new Promise(res => setTimeout(res, 2000)); 
        }
    }
}

async function fetchShowdownAbilities() {
    statusText.innerText = "Downloading Abilities (Showdown JS)...";
    let myAbilities = [];
    const rawAbilities = await fetchJSWithRetry('https://play.pokemonshowdown.com/data/abilities.js');
    if (rawAbilities) {
        for (let key in rawAbilities) {
            const a = rawAbilities[key];
            if (a.num <= 0) continue;
            myAbilities.push({
                id: a.num,
                name: a.name ? a.name.toLowerCase().replace(/ /g, '-') : key,
                description: a.desc || a.shortDesc || "No description available."
            });
        }
        await saveToDB('abilities', myAbilities);
        offlineAbilities = myAbilities;
    }
}

async function fetchShowdownItems() {
    statusText.innerText = "Downloading Items (Showdown JS)...";
    let myItems = [];
    const rawItems = await fetchJSWithRetry('https://play.pokemonshowdown.com/data/items.js');
    if (rawItems) {
        for (let key in rawItems) {
            const it = rawItems[key];
            if (it.num <= 0) continue;
            if (it.isNonstandard === "Past" || it.isNonstandard === "Unobtainable") continue; 
            
            myItems.push({
                id: it.num,
                spriteId: key, 
                name: it.name ? it.name.toLowerCase().replace(/ /g, '-') : key,
                description: it.desc || it.shortDesc || "No description available."
            });
        }
        await saveToDB('items', myItems);
        offlineItems = myItems;
    }
}

if (syncAllBtn) {
    syncAllBtn.addEventListener('click', async () => { 
        syncAllBtn.disabled = true; 
        progressContainer.style.display = 'block'; 
        
        try { 
            statusText.innerText = "Downloading Pokedex (Showdown JSON)...";
            progressBar.style.width = '10%';
            const rawDex = await fetchWithRetry('https://play.pokemonshowdown.com/data/pokedex.json');

            statusText.innerText = "Downloading Moves (Showdown JSON)...";
            progressBar.style.width = '25%';
            const rawMoves = await fetchWithRetry('https://play.pokemonshowdown.com/data/moves.json');

            statusText.innerText = "Downloading Learnsets (Showdown JSON)...";
            progressBar.style.width = '40%';
            const rawLearnsets = await fetchWithRetry('https://play.pokemonshowdown.com/data/learnsets.json');

            statusText.innerText = "Processing Showdown Data...";
            progressBar.style.width = '50%';

            let myMoves = [];
            for (let key in rawMoves) {
                const m = rawMoves[key];
                myMoves.push({
                    id: m.num || Math.floor(Math.random() * 100000), 
                    name: m.name ? m.name.toLowerCase().replace(/ /g, '-') : 'unknown',
                    type: m.type ? m.type.toLowerCase() : 'normal',
                    damage_class: m.category ? m.category.toLowerCase() : 'status',
                    power: m.basePower || '-',
                    accuracy: m.accuracy === true ? '-' : m.accuracy,
                    pp: m.pp || '-',
                    description: m.desc || m.shortDesc || "No description.",
                    
                    // === ADVANCED CALC MECHANICS ===
                    flags: m.flags || {},         // Detects contact, punch, sound, etc.
                    priority: m.priority || 0,
                    multihit: m.multihit || null,
                    drain: m.drain || null,
                    recoil: m.recoil || null
                });
            }
            await saveToDB('moves', myMoves);
            offlineMoves = myMoves;

            let myEvolutions = [];
            let processedEvos = new Set();
            let myDatabase = [];
            let formCounter = 1;
            
             for (let key in rawDex) {
                let p = rawDex[key];
                if (!p) continue; 
                if (p.isNonstandard === "Custom" || p.isNonstandard === "CAP") continue;
                
                let baseId = p.num;
                if (!baseId && p.baseSpecies) {
                    const baseMatch = rawDex[toId(p.baseSpecies)];
                    if (baseMatch) baseId = baseMatch.num;
                }
                if (!baseId || baseId <= 0) continue; 
                
                if (!processedEvos.has(key)) {
                    let base = p;
                    while (base.prevo) {
                        if (!rawDex[base.prevo]) break;
                        base = rawDex[base.prevo];
                    }
                    
                    let chain = [];
                    function traverseEvo(node, detailText) {
                        if(!node || !node.name) return;
                        const safeNodeId = toId(node.name);
                        processedEvos.add(safeNodeId);
                        chain.push({ name: node.name.toLowerCase().replace(/ /g, '-'), detail: detailText });
                        if (node.evos) {
                            node.evos.forEach(evoKey => {
                                let evoNode = rawDex[evoKey];
                                if(evoNode) {
                                    let cond = evoNode.evoLevel ? `Lv. ${evoNode.evoLevel}` : (evoNode.evoItem || evoNode.evoCondition || 'Unknown');
                                    traverseEvo(evoNode, cond);
                                }
                            });
                        }
                    }
                    traverseEvo(base, 'Base Form');
                    if (chain.length > 1) myEvolutions.push(chain);
                }
                
                let formType = 'base';
                const lowerName = p.name ? p.name.toLowerCase().replace(/ /g, '-') : 'unknown';
                
                if (lowerName.includes('-mega') || lowerName.includes('-primal')) formType = 'mega';
                else if (lowerName.includes('-gmax')) formType = 'gmax';
                else if (lowerName.includes('-alola') || lowerName.includes('-galar') || lowerName.includes('-hisui') || lowerName.includes('-paldea')) formType = 'regional';
                else if (p.baseSpecies && p.baseSpecies !== p.name) formType = 'alt';

                let abs = [];
                if (p.abilities) {
                    if (p.abilities['0']) abs.push({ name: p.abilities['0'].toLowerCase().replace(/ /g, '-'), isHidden: false });
                    if (p.abilities['1']) abs.push({ name: p.abilities['1'].toLowerCase().replace(/ /g, '-'), isHidden: false });
                    if (p.abilities['H']) abs.push({ name: p.abilities['H'].toLowerCase().replace(/ /g, '-'), isHidden: true });
                }
                
                let moves = [];
                let learnsetKey = key;
                if (!rawLearnsets[learnsetKey] && p.baseSpecies) {
                    learnsetKey = toId(p.baseSpecies);
                }
                if (rawLearnsets[learnsetKey] && rawLearnsets[learnsetKey].learnset) {
                    moves = Object.keys(rawLearnsets[learnsetKey].learnset).map(m => m.replace(/ /g, '-'));
                }

                 let uniqueId = baseId; 
                if (p.baseSpecies && p.baseSpecies !== p.name) {
                    uniqueId = 100000 + formCounter;
                    formCounter++;
                }

                // Calculate proper sprite IDs for Megas, Alolans, G-Max, etc.
                let properSpriteId = key;
                if (p.baseSpecies && p.baseSpecies !== p.name) {
                    let base = p.baseSpecies.toLowerCase().replace(/[^a-z0-9]/g, '');
                    // Grab just the form part (e.g., "-Mega-X" or "-Alola") and strip it
                    let formeStr = p.name.substring(p.baseSpecies.length).toLowerCase().replace(/[^a-z0-9]/g, '');
                    properSpriteId = base + '-' + formeStr;
                }

                myDatabase.push({
                    id: uniqueId, 
                    baseId: baseId,
                    spriteId: properSpriteId, // Use the new string!
                    formType: formType,

                    name: lowerName,
                    speciesName: p.baseSpecies ? p.baseSpecies.toLowerCase().replace(/ /g, '-') : lowerName,
                    types: p.types ? p.types.map(t => t.toLowerCase()) : ['normal'],
                    hp: p.baseStats ? p.baseStats.hp : 0,
                    attack: p.baseStats ? p.baseStats.atk : 0,
                    defense: p.baseStats ? p.baseStats.def : 0,
                    spAtk: p.baseStats ? p.baseStats.spa : 0,
                    spDef: p.baseStats ? p.baseStats.spd : 0,
                    speed: p.baseStats ? p.baseStats.spe : 0,
                    abilities: abs,
                    moves: moves
                });
            }

            
            await saveToDB('evolutions', myEvolutions);
            offlineEvolutions = myEvolutions;
            await saveToDB('pokemon', myDatabase);
            offlineDatabase = myDatabase;

            progressBar.style.width = '70%';
            await fetchShowdownAbilities();
            
            progressBar.style.width = '85%';
            await fetchShowdownItems();

            progressBar.style.width = '100%';
            statusText.innerText = "All Databases Synced Successfully!";
            
            populateTopFilters(); 
            enableSearch(); 
            liveFilterPokemon(''); 
            displayAbilities(offlineAbilities); 
            if(typeof renderMovesTab === 'function') renderMovesTab(); else displayMoves(offlineMoves);
            displayItems(offlineItems);
            
        } catch (error) { 
            console.error("Sync Process Failed:", error);
            statusText.innerText = "Sync failed!"; 
            alert("Sync Error: " + error.message);
        } 
        
        syncAllBtn.disabled = false; 
        setTimeout(() => { 
            progressContainer.style.display = 'none'; 
            progressBar.style.width = '0%'; 
        }, 3000); 
    });
}

function enableSearch() { 
    if (tagInput) tagInput.disabled = false; 
    if (abilitySearch) abilitySearch.disabled = false; 
    if (movesSearch) movesSearch.disabled = false; 
    if (itemsSearch) itemsSearch.disabled = false; 
    if (tagInput) tagInput.placeholder = "Quick search... (Press Enter to lock tag)"; 
}

// ==========================================
// 4b. OFFLINE SPRITE CACHING ENGINE
// ==========================================
const cacheSpritesBtn = document.getElementById('cache-sprites-btn');
if (cacheSpritesBtn) {
    cacheSpritesBtn.addEventListener('click', async () => {
        if (!window.caches) {
            alert("Offline caching is not supported in this browser.");
            return;
        }

        if (offlineDatabase.length === 0) {
            alert("Please Sync the Database first before downloading sprites!");
            return;
        }

        cacheSpritesBtn.disabled = true;
        progressContainer.style.display = 'block';
        
        try {
            const cache = await caches.open('champions-sprite-cache-v1');
            let urlsToCache = [];

            offlineDatabase.forEach(p => {
                const spriteName = p.spriteId || p.name.replace(/[^a-z0-9]/g, '');
                urlsToCache.push(`https://play.pokemonshowdown.com/sprites/gen5/${spriteName}.png`);
            });

            offlineItems.forEach(it => {
                urlsToCache.push(`https://play.pokemonshowdown.com/sprites/itemicons/${it.spriteId}.png`);
            });

            urlsToCache = [...new Set(urlsToCache)];

            let completed = 0;
            const BATCH_SIZE = 10; 

            for (let i = 0; i < urlsToCache.length; i += BATCH_SIZE) {
                const batchUrls = urlsToCache.slice(i, i + BATCH_SIZE);
                
                await Promise.all(batchUrls.map(async url => {
                    try {
                        const existing = await cache.match(url);
                        if (!existing) {
                            const response = await fetch(url);
                            if (response.ok) await cache.put(url, response.clone());
                        }
                    } catch(e) { } 
                    completed++;
                }));

                progressBar.style.width = `${(completed / urlsToCache.length) * 100}%`;
                statusText.innerText = `Downloading Sprites: ${completed} / ${urlsToCache.length}`;
                
                await new Promise(res => setTimeout(res, 100)); 
            }

            statusText.innerText = "All Sprites Downloaded & Cached for Offline Use!";
        } catch (err) {
            alert("Sprite caching failed: " + err.message);
            statusText.innerText = "Caching error.";
        }

        cacheSpritesBtn.disabled = false;
        setTimeout(() => { 
            progressContainer.style.display = 'none'; 
            progressBar.style.width = '0%'; 
        }, 3000);
    });
}

// ==========================================
// 5. SEARCH, TAGS & TOP FILTERS
// ==========================================
if (tagInput) {
    tagInput.addEventListener('keypress', (e) => { 
        if (e.key === 'Enter' && tagInput.value.trim() !== '') { 
            addTag(tagInput.value.trim().toLowerCase()); 
            tagInput.value = ''; 
        } 
    });

    tagInput.addEventListener('input', (e) => { 
        liveFilterPokemon(e.target.value.toLowerCase().trim()); 
    });
}

['toggle-mega', 'toggle-gmax', 'toggle-regional', 'toggle-alt'].forEach(id => { 
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => liveFilterPokemon(tagInput ? tagInput.value.toLowerCase().trim() : '')); 
});

function addTag(text) { 
    if (!activeTags.includes(text)) { 
        activeTags.push(text); 
        renderTags(); 
        liveFilterPokemon(''); 
    } 
}

function removeTag(text) { 
    activeTags = activeTags.filter(t => t !== text); 
    renderTags(); 
    liveFilterPokemon(tagInput ? tagInput.value.toLowerCase().trim() : ''); 
}

function renderTags() { 
    if (!activeTagsContainer) return;
    activeTagsContainer.innerHTML = ''; 
    activeTags.forEach(tag => { 
        const tagEl = document.createElement('div'); 
        tagEl.className = 'type-chip'; 
        tagEl.style.backgroundColor = '#f44336'; 
        tagEl.style.display = 'flex'; 
        tagEl.style.alignItems = 'center'; 
        tagEl.style.gap = '5px'; 
        tagEl.style.cursor = 'pointer'; 
        tagEl.innerHTML = `${tag} <span>&times;</span>`; 
        tagEl.onclick = () => removeTag(tag); 
        activeTagsContainer.appendChild(tagEl); 
    }); 
}

let activeTypeFilter = ''; 
function selectTopFilter(type, value) { 
    if (type === 'type') { 
        activeTypeFilter = value; 
        document.getElementById('btn-filter-type').innerHTML = value ? `${value.toUpperCase()} <span>▼</span>` : `All Types <span>▼</span>`; 
        closeModal('type-modal-overlay'); 
    } else if (type === 'regulation') { 
        activeRegulationId = value; 
        if (value) { 
            const reg = regulations.find(r => r.id === value); 
            let displayName = reg.name.replace(/\[.*?\]\s*/g, '').replace(/BSS Reg\s*/g, '').replace(/Regulation\s*/g, '').trim() || reg.name;
            document.getElementById('btn-filter-regulation').innerHTML = `Reg ${displayName} <span>▼</span>`; 
        } else { 
            document.getElementById('btn-filter-regulation').innerHTML = `Any Regulation <span>▼</span>`; 
        } 
        closeModal('regulation-modal-overlay'); 
        displayItems(offlineItems);
        if(typeof renderMovesTab === 'function') renderMovesTab();
        if(typeof renderAbilitiesTab === 'function') renderAbilitiesTab();

    } 
    liveFilterPokemon(tagInput ? tagInput.value.toLowerCase().trim() : ''); 
}

window.openTopFilterModal = function(id) { 
    document.getElementById(id + '-overlay').style.display = 'block'; 
    setTimeout(() => document.getElementById(id).classList.add('open'), 10); 
};

function closeModal(id) { 
    document.getElementById(id.replace('-overlay', '')).classList.remove('open'); 
    setTimeout(() => document.getElementById(id).style.display = 'none', 300); 
}

document.querySelectorAll('.modal-overlay').forEach(overlay => { 
    overlay.addEventListener('click', (e) => { 
        if(e.target === overlay) {
            const modals = overlay.querySelectorAll('.bottom-modal');
            modals.forEach(m => m.classList.remove('open'));
            setTimeout(() => overlay.style.display = 'none', 300);
        }
    }); 
});

function populateTopFilters() {
    const typeListEl = document.getElementById('filter-type-list');
    if (typeListEl) { 
        const types = ["normal", "fighting", "flying", "poison", "ground", "rock", "bug", "ghost", "steel", "fire", "water", "grass", "electric", "psychic", "ice", "dragon", "dark", "fairy"]; 
        let typeHtml = `<button class="filter-modal-btn" style="background: #555; color: #fff; width: 100%; margin-bottom: 10px;" onclick="selectTopFilter('type', '')">ALL TYPES</button>`; 
        types.forEach(t => { 
            typeHtml += `<button class="filter-modal-btn type-${t}" onclick="selectTopFilter('type', '${t}')" style="flex: 1 1 30%;">${t}</button>`; 
        }); 
        typeListEl.innerHTML = typeHtml; 
    }
    
    const regListEl = document.getElementById('regulation-list-container');
    if (regListEl) {
        let regHtml = `<button class="filter-modal-btn" style="background: #555; color: #fff;" onclick="selectTopFilter('regulation', '')">ANY REGULATION</button>`;
        regulations.forEach(r => {
            const isActive = activeRegulationId === r.id;
            let displayName = r.name.replace(/\[.*?\]\s*/g, '').replace(/BSS Reg\s*/g, '').replace(/Regulation\s*/g, '').trim();
            if (displayName === '') displayName = r.name;
            regHtml += `<button class="filter-modal-btn" style="background: ${isActive ? '#4CAF50' : '#444'}; color: #fff;" onclick="selectTopFilter('regulation', '${r.id}')">Reg ${displayName}</button>`;
        });
        
        regHtml += `<hr style="border-color: #444; width: 100%; margin: 10px 0;">`;
        regHtml += `<button class="filter-modal-btn" style="background: #2196F3; color: #fff;" onclick="closeModal('regulation-modal-overlay'); openRegulationManager();">⚙ MANAGE REGULATIONS</button>`;
        
        regListEl.innerHTML = regHtml;
        if (activeRegulationId) {
            const activeReg = regulations.find(r => r.id === activeRegulationId);
            if (activeReg) {
                let displayName = activeReg.name.replace(/\[.*?\]\s*/g, '').replace(/BSS Reg\s*/g, '').replace(/Regulation\s*/g, '').trim() || activeReg.name;
                document.getElementById('btn-filter-regulation').innerHTML = `Reg ${displayName} <span>▼</span>`;
            }
        }
    }
}

function setupFAB() {
    const fabToggle = document.getElementById('fab-toggle');
    const fabMenu = document.getElementById('fab-menu');
    
    if (!fabToggle || !fabMenu) return; // SAFETY CHECK!

    fabToggle.addEventListener('click', () => {

        fabToggle.classList.toggle('active');
        fabMenu.classList.toggle('active');
    });

    document.getElementById('fab-btn-sort').addEventListener('click', () => { fabToggle.click(); openTopFilterModal('sort-modal'); });
    document.getElementById('fab-btn-move').addEventListener('click', () => { fabToggle.click(); openTopFilterModal('move-modal'); });
    document.getElementById('fab-btn-ability').addEventListener('click', () => { fabToggle.click(); openTopFilterModal('ability-modal'); });
    document.getElementById('fab-btn-search').addEventListener('click', () => { fabToggle.click(); openTopFilterModal('tag-modal'); });

    ['sort', 'move', 'ability', 'tag'].forEach(id => {
        const closeBtn = document.getElementById(`close-${id}-modal`);
        if (closeBtn) closeBtn.addEventListener('click', () => closeModal(`${id}-modal-overlay`));
    });

    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.id === 'sort-asc' || e.target.id === 'sort-desc') {
                document.getElementById('sort-asc').classList.remove('active');
                document.getElementById('sort-desc').classList.remove('active');
                e.target.classList.add('active');
                currentSortAsc = e.target.id === 'sort-asc';
            } else {
                document.querySelectorAll('.sort-btn:not(#sort-asc):not(#sort-desc)').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentSortMode = e.target.getAttribute('data-sort');
                
                const stats = ['total', 'hp', 'attack', 'defense', 'spAtk', 'spDef', 'speed'];
                document.getElementById('sort-asc').classList.remove('active');
                document.getElementById('sort-desc').classList.remove('active');
                if (stats.includes(currentSortMode)) {
                    document.getElementById('sort-desc').classList.add('active');
                    currentSortAsc = false;
                } else {
                    document.getElementById('sort-asc').classList.add('active');
                    currentSortAsc = true;
                }
            }

            liveFilterPokemon(tagInput ? tagInput.value.toLowerCase().trim() : '');
            closeModal('sort-modal-overlay');
        });
    });

    setupSuggestionBox('move-filter-input', 'move-filter-suggestions', offlineMoves, (name) => { addTag(name); closeModal('move-modal-overlay'); });
    setupSuggestionBox('ability-filter-input', 'ability-filter-suggestions', offlineAbilities, (name) => { addTag(name); closeModal('ability-modal-overlay'); });
    
    const tagFilterInput = document.getElementById('tag-filter-input');
    if (tagFilterInput) {
        tagFilterInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase().trim();
            const box = document.getElementById('tag-filter-suggestions');
            box.innerHTML = '';
            if (val.length < 2) { box.style.display = 'none'; return; }
            
            let matches = [];
            offlineDatabase.filter(p => p.name.includes(val)).slice(0, 5).forEach(p => matches.push({name: p.name, type: 'Pokémon'}));
            offlineAbilities.filter(a => a.name.includes(val)).slice(0, 5).forEach(a => matches.push({name: a.name, type: 'Ability'}));
            offlineMoves.filter(m => m.name.includes(val)).slice(0, 5).forEach(m => matches.push({name: m.name, type: 'Move'}));
            
            if (matches.length > 0) {
                box.style.display = 'block';
                matches.forEach(match => {
                    const div = document.createElement('div');
                    div.style.padding = '10px'; div.style.borderBottom = '1px solid #444'; div.style.cursor = 'pointer';
                    div.innerHTML = `<span style="text-transform:capitalize;">${match.name.replace(/-/g, ' ')}</span> <span style="font-size:10px; color:#aaa; float:right;">${match.type}</span>`;
                    div.onclick = () => { addTag(match.name); document.getElementById('tag-filter-input').value = ''; box.style.display = 'none'; closeModal('tag-modal-overlay'); };
                    box.appendChild(div);
                });
            } else { box.style.display = 'none'; }
        });
    }
}

function setupSuggestionBox(inputId, boxId, sourceArray, onSelect) {
    const input = document.getElementById(inputId);
    const box = document.getElementById(boxId);
    if (!input || !box) return;
    input.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase().trim();
        box.innerHTML = '';
        if (val.length < 2) { box.style.display = 'none'; return; }
        const matches = sourceArray.filter(item => item.name.replace(/-/g, ' ').toLowerCase().includes(val)).slice(0, 10);
        if (matches.length > 0) {
            box.style.display = 'block';
            matches.forEach(match => {
                const div = document.createElement('div');
                div.style.padding = '10px'; div.style.borderBottom = '1px solid #444'; div.style.cursor = 'pointer'; div.style.textTransform = 'capitalize';
                div.innerText = match.name.replace(/-/g, ' ');
                div.onclick = () => { input.value = ''; box.style.display = 'none'; onSelect(match.name); };
                box.appendChild(div);
            });
        } else { box.style.display = 'none'; }
    });
}

function liveFilterPokemon(liveText) { 
    const toggleMega = document.getElementById('toggle-mega');
    const toggleGmax = document.getElementById('toggle-gmax');
    const toggleRegional = document.getElementById('toggle-regional');
    const toggleAlt = document.getElementById('toggle-alt');

    const showMega = toggleMega ? toggleMega.checked : true; 
    const showGmax = toggleGmax ? toggleGmax.checked : true; 
    const showRegional = toggleRegional ? toggleRegional.checked : true; 
    const showAlt = toggleAlt ? toggleAlt.checked : true; 

    let activeReg = null;
    if (activeRegulationId) {
        activeReg = regulations.find(r => r.id === activeRegulationId);
    }

    currentDisplayedPokemon = offlineDatabase.filter(p => { 
        if (activeReg && activeReg.pokemon && activeReg.pokemon.length > 0) {
            if (!activeReg.pokemon.includes(p.name)) return false;
        }

        if (!showMega && p.formType === 'mega') return false; 
        if (!showGmax && p.formType === 'gmax') return false; 
        if (!showRegional && p.formType === 'regional') return false; 
        if (!showAlt && p.formType === 'alt') return false; 
        
        if (activeTypeFilter && !p.types.includes(activeTypeFilter)) return false;
        
        const safeLiveId = toId(liveText);
        const hasLiveAbility = p.abilities.some(a => toId(a.name).includes(safeLiveId));
        const hasLiveMove = getEffectiveMoves(p).some(m => toId(m).includes(safeLiveId));
        const textMatch = p.name.includes(liveText) || String(p.baseId).includes(liveText) || hasLiveAbility || hasLiveMove; 
        
        let tagMatch = true; 
        const effectiveMoves = getEffectiveMoves(p);
        
        activeTags.forEach(tag => { 
            const safeTagId = toId(tag); 
            const hasAbility = p.abilities.some(a => toId(a.name).includes(safeTagId)); 
            const hasType = p.types.includes(tag); 
            const hasMove = effectiveMoves.some(m => toId(m).includes(safeTagId)); 
            if (!hasAbility && !hasType && !hasMove) tagMatch = false; 
        }); 
        
        return textMatch && tagMatch; 
    }); 

    currentDisplayedPokemon.sort((a, b) => {
        let valA = a[currentSortMode];
        let valB = b[currentSortMode];
        
        if (currentSortMode === 'id') { valA = a.baseId || a.id; valB = b.baseId || b.id; }
        if (currentSortMode === 'name') { valA = a.name; valB = b.name; }
        if (currentSortMode === 'total') { valA = a.hp + a.attack + a.defense + a.spAtk + a.spDef + a.speed; valB = b.hp + b.attack + b.defense + b.spAtk + b.spDef + b.speed; }

        if (typeof valA === 'string') {
            return currentSortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
            return currentSortAsc ? valA - valB : valB - valA;
        }
    });

    startInfiniteScroll(); 
}

// ==========================================
// 6. INFINITE SCROLLER, LISTS & REVERSE LOOKUP
// ==========================================
const scrollObserver = new IntersectionObserver((entries) => { 
    if (entries[0].isIntersecting) loadMoreCards(); 
}, { rootMargin: "200px" }); 

function startInfiniteScroll() { 
    if (!resultsDiv) return;
    resultsDiv.innerHTML = ''; 
    currentRenderCount = 0; 
    
    if (currentDisplayedPokemon.length === 0) { 
        resultsDiv.innerHTML = '<p style="text-align:center; color:#888;">No match.</p>'; 
        return; 
    } 
    
    loadMoreCards(); 
}

function loadMoreCards() {
    if (!resultsDiv || currentRenderCount >= currentDisplayedPokemon.length) return;
    
    const start = currentRenderCount; 
    const end = Math.min(start + CHUNK_SIZE, currentDisplayedPokemon.length); 
    const chunk = currentDisplayedPokemon.slice(start, end);
    
    let htmlString = '';
    
    chunk.forEach(p => {
        const idString = `#${String(p.baseId || p.id).padStart(3, '0')}`; 
        const mainType = p.types[0]; 
        const typeChips = p.types.map(t => `<span class="type-chip type-${t}">${t}</span>`).join('');
        let statBadgeHtml = ''; 
        
        if (currentSortMode === 'total') { 
            const total = p.hp + p.attack + p.defense + p.spAtk + p.spDef + p.speed; 
            statBadgeHtml = `<span class="stat-badge">Total: ${total}</span>`; 
        } else if (['hp', 'attack', 'defense', 'spAtk', 'spDef', 'speed'].includes(currentSortMode)) { 
            const statNames = { hp: 'HP', attack: 'Atk', defense: 'Def', spAtk: 'Sp.A', spDef: 'Sp.D', speed: 'Spe' }; 
            statBadgeHtml = `<span class="stat-badge">${statNames[currentSortMode]}: ${p[currentSortMode]}</span>`; 
        }
        
        const spriteName = p.spriteId || p.name.replace(/[^a-z0-9]/g, '');
        
        htmlString += `
        <div class="poke-card type-${mainType}" onclick="handlePokemonClick(${p.id})">
            <div class="card-info">
                <div class="card-header">
                    <div class="card-name-group">
                        <span class="card-id">${idString}</span>
                        <h3 class="card-name">${p.name.replace(/-/g, ' ')}</h3>
                    </div>
                    ${statBadgeHtml}
                </div>
                <div class="card-types">${typeChips}</div>
            </div>
            <div class="card-sprite-container">
                <img src="https://play.pokemonshowdown.com/sprites/gen5/${spriteName}.png" class="card-sprite" loading="lazy" onerror="this.onerror=null; this.src='https://play.pokemonshowdown.com/sprites/gen5/substitute.png';">
            </div>
        </div>`;
    });
    
    resultsDiv.insertAdjacentHTML('beforeend', htmlString); 
    currentRenderCount = end; 
    manageSentinel();
}

function displayItems(arr) { 
    if (!itemsResultsDiv) return;
    let filtered = arr;
    if (activeRegulationId) { 
        const activeReg = regulations.find(r => r.id === activeRegulationId); 
        if (activeReg && activeReg.items && activeReg.items.length > 0) {
            filtered = arr.filter(it => activeReg.items.includes(it.name)); 
        }
    }
    if (filtered.length === 0) { 
        itemsResultsDiv.innerHTML = '<p style="text-align:center; color:#888;">No items found (or none legal in current Regulation).</p>'; 
        return; 
    } 
    let htmlString = ''; 
    filtered.forEach(it => { 
        htmlString += `
        <div style="border: 1px solid #444; border-radius: 5px; padding: 10px; margin-bottom: 10px; background-color: #2a2a2a; display: flex; align-items: center; gap: 15px;">
            <img src="https://play.pokemonshowdown.com/sprites/itemicons/${it.spriteId}.png" style="width: 40px; height: 40px; background: #333; border-radius: 5px; padding: 2px;" loading="lazy" onerror="this.style.display='none'">
            <div>
                <h4 style="margin: 0; text-transform: capitalize; color:#fff;">${it.name.replace(/-/g, ' ')}</h4>
                <p style="margin: 5px 0 0 0; font-size: 14px; color:#ccc;">${it.description}</p>
            </div>
        </div>`; 
    }); 
    itemsResultsDiv.innerHTML = htmlString; 
}

function manageSentinel() { 
    const oldSentinel = document.getElementById('scroll-sentinel'); 
    if (oldSentinel) scrollObserver.unobserve(oldSentinel); 
    if (oldSentinel) oldSentinel.remove(); 
    
    if (currentRenderCount < currentDisplayedPokemon.length && resultsDiv) { 
        resultsDiv.insertAdjacentHTML('beforeend', '<div id="scroll-sentinel" style="height:10px;"></div>'); 
        scrollObserver.observe(document.getElementById('scroll-sentinel')); 
    } 
}

function displayAbilities(arr) { 
    if (!abilityResultsDiv) return;
    if (arr.length === 0) { 
        abilityResultsDiv.innerHTML = '<p style="text-align:center; color:#888;">No abilities found.</p>'; 
        return; 
    } 
    let htmlString = ''; 
    arr.forEach(a => { 
        htmlString += `
        <div onclick="openReverseLookup('ability', '${a.name.replace(/'/g, "\\'")}')" style="border: 1px solid #444; border-radius: 5px; padding: 10px; margin-bottom: 10px; background-color: #2a2a2a; cursor: pointer;">
            <h4 style="margin: 0; text-transform: capitalize; color:#fff; display: flex; justify-content: space-between;">
                ${a.name.replace(/-/g, ' ')}
                <span style="font-size:10px; color:#888; background:#333; padding:2px 6px; border-radius:4px;">Who has this?</span>
            </h4>
            <p style="margin: 5px 0 0 0; font-size: 14px; color:#ccc;">${a.description}</p>
        </div>`; 
    }); 
    abilityResultsDiv.innerHTML = htmlString; 
}

function displayMoves(arr) { 
    if (!movesResultsDiv) return;
    if (arr.length === 0) { 
        movesResultsDiv.innerHTML = '<p style="text-align:center; color:#888;">No moves found.</p>'; 
        return; 
    } 
    let htmlString = ''; 
    arr.forEach(m => { 
        htmlString += `
        <div onclick="openReverseLookup('move', '${m.name.replace(/'/g, "\\'")}')" style="border: 1px solid #444; border-radius: 5px; padding: 10px; margin-bottom: 10px; background-color: #2a2a2a; cursor: pointer;">
            <h4 style="margin: 0 0 5px 0; text-transform: capitalize; color:#fff; display: flex; justify-content: space-between;">
                <span>${m.name.replace(/-/g, ' ')} <span style="font-weight: normal; font-size: 14px; color: #888;">(${m.type} / ${m.damage_class})</span></span>
                <span style="font-size:10px; color:#888; background:#333; padding:2px 6px; border-radius:4px;">Who learns this?</span>
            </h4>
            <div style="background-color: #333; padding: 5px; border-radius: 5px; margin: 5px 0; font-size: 14px; color:#ddd;">
                <strong>Power:</strong> ${m.power} | <strong>Acc:</strong> ${m.accuracy} | <strong>PP:</strong> ${m.pp}
            </div>
            <p style="margin: 5px 0 0 0; font-size: 14px; color:#ccc;">${m.description}</p>
        </div>`; 
    }); 
    movesResultsDiv.innerHTML = htmlString; 
}

let moveSortMode = 'name'; 

window.toggleMoveSort = function() {
    moveSortMode = moveSortMode === 'name' ? 'power' : 'name';
    const btn = document.getElementById('moves-sort-btn');
    if (btn) btn.innerText = moveSortMode === 'name' ? 'Sort: A-Z ⇅' : 'Sort: Power ⇅';
    renderMovesTab();
};

function getRegulationAllowedData() {
    if (!activeRegulationId) return null;
    const activeReg = regulations.find(r => r.id === activeRegulationId);
    if (!activeReg || !activeReg.pokemon || activeReg.pokemon.length === 0) return null;

    let allowedMoves = new Set();
    let allowedAbilities = new Set();
    
    offlineDatabase.forEach(p => {
        if (activeReg.pokemon.includes(p.name)) {
            getEffectiveMoves(p).forEach(m => allowedMoves.add(toId(m)));
            p.abilities.forEach(a => allowedAbilities.add(toId(a.name)));
        }
    });
    return { moves: allowedMoves, abilities: allowedAbilities };
}

window.renderMovesTab = function() {
    const searchEl = document.getElementById('moves-search');
    const term = searchEl ? searchEl.value.toLowerCase().trim() : '';
    const catBox = document.getElementById('moves-filter-category');
    const cat = catBox ? catBox.value : 'all';
    const allowed = getRegulationAllowedData();
    
    let filtered = offlineMoves.filter(m => {
        if (allowed && !allowed.moves.has(toId(m.name))) return false;
        if (cat !== 'all' && m.damage_class !== cat) return false;
        if (term && !m.name.replace(/-/g, ' ').toLowerCase().includes(term) && !m.type.toLowerCase().includes(term)) return false;
        return true;
    });

    filtered.sort((a, b) => {
        if (moveSortMode === 'power') {
            let pA = parseInt(a.power) || 0;
            let pB = parseInt(b.power) || 0;
            if (pA !== pB) return pB - pA; // High to Low
        }
        return a.name.localeCompare(b.name);
    });

    displayMoves(filtered);
}

window.renderAbilitiesTab = function() {
    const searchEl = document.getElementById('ability-search');
    const term = searchEl ? searchEl.value.toLowerCase().trim() : '';
    const allowed = getRegulationAllowedData();
    
    let filtered = offlineAbilities.filter(a => {
        if (allowed && !allowed.abilities.has(toId(a.name))) return false;
        if (term && !a.name.replace(/-/g, ' ').toLowerCase().includes(term) && !a.description.toLowerCase().includes(term)) return false;
        return true;
    });

    displayAbilities(filtered);
}

if (movesSearch) movesSearch.addEventListener('input', renderMovesTab);
if (abilitySearch) abilitySearch.addEventListener('input', renderAbilitiesTab);
if (itemsSearch) {
    itemsSearch.addEventListener('input', (e) => { 
        const term = e.target.value.toLowerCase(); 
        displayItems(offlineItems.filter(it => it.name.replace(/-/g, ' ').toLowerCase().includes(term) || it.description.toLowerCase().includes(term))); 
    });
}

// REVERSE LOOKUP LOGIC
window.openReverseLookup = function(type, targetName) {
    try {
        const grid = document.getElementById('lookup-grid');
        const displayTarget = targetName.replace(/-/g, ' ');
        document.getElementById('lookup-title').innerText = type === 'ability' ? `Has ${displayTarget}?` : `Learns ${displayTarget}?`;
        grid.innerHTML = '';

        let baseList = offlineDatabase;
        if (activeRegulationId) {
            const activeReg = regulations.find(r => r.id === activeRegulationId);
            if (activeReg && activeReg.pokemon && activeReg.pokemon.length > 0) {
                baseList = baseList.filter(p => activeReg.pokemon.includes(p.name));
            }
        }

        let matches = [];
        if (type === 'ability') {
            matches = baseList.filter(p => p.abilities.some(a => a.name === targetName));
        } else if (type === 'move') {
            matches = baseList.filter(p => {
                const effMoves = getEffectiveMoves(p);
                return effMoves.some(m => toId(m) === toId(targetName));
            });
        }

        if (matches.length === 0) {
            grid.innerHTML = '<p style="color:#888; text-align:center; width:100%; grid-column: 1 / -1; margin-top:20px;">No Pokémon found in current Regulation.</p>';
        } else {
                matches.sort((a,b) => (a.baseId || a.id) - (b.baseId || b.id)).forEach(p => {
                    const spriteName = p.spriteId || p.name.replace(/[^a-z0-9]/g, '');
                    grid.innerHTML += `
                    <div class="master-card" onclick="closeLookupModal(); openDetailedView(${p.id});">
                        <img src="https://play.pokemonshowdown.com/sprites/gen5/${spriteName}.png" loading="lazy" onerror="this.onerror=null; this.src='https://play.pokemonshowdown.com/sprites/gen5/substitute.png';">
                        <div class="master-card-name">${p.name.replace(/-/g, ' ')}</div>
                    </div>`;
                });

        }

        document.getElementById('lookup-modal-overlay').style.display = 'block';
        setTimeout(() => document.getElementById('lookup-modal').classList.add('open'), 10);
    } catch (err) {
        alert("Reverse Lookup Error: " + err.message);
    }
}

window.closeLookupModal = function() {
    document.getElementById('lookup-modal').classList.remove('open');
    setTimeout(() => document.getElementById('lookup-modal-overlay').style.display = 'none', 300);
}

// ==========================================
// 7. DETAILED POKEMON VIEW & INFO MODALS
// ==========================================
window.openDetailedView = function(pokemonId) {
    try {
        const p = offlineDatabase.find(x => String(x.id) === String(pokemonId)); 
        if (!p) return;
        window.currentDetailedPokemon = p; 

        detailTabInfo.style.display = 'block'; 
        detailTabMoves.style.display = 'none'; 
        detailNavInfo.classList.add('active'); 
        detailNavMoves.classList.remove('active');

        const mainType = (p.types && p.types.length > 0) ? p.types[0] : 'normal'; 
        detailHeader.className = '';          detailHeader.style.backgroundColor = '#1e1e1e';         detailHeader.style.borderBottom = '1px solid #333';
        detailName.innerText = (p.name || 'Unknown').replace(/-/g, ' '); 
        detailId.innerText = `#${String(p.baseId || p.id || 0).padStart(3, '0')}`; 
        
        const spriteName = p.spriteId || p.name.replace(/[^a-z0-9]/g, '');
        detailSprite.src = `https://play.pokemonshowdown.com/sprites/gen5/${spriteName}.png`; 
        detailSprite.onerror = function() { this.src = 'https://play.pokemonshowdown.com/sprites/gen5/substitute.png'; };
        
        detailTypes.innerHTML = (p.types || []).map(t => `<span class="type-chip type-${t}">${t}</span>`).join('');

        const maxStat = 255; 
        const statsList = [ 
            { label: 'HP', val: p.hp || 0 }, 
            { label: 'Attack', val: p.attack || 0 }, 
            { label: 'Defense', val: p.defense || 0 }, 
            { label: 'Sp. Atk', val: p.spAtk || 0 }, 
            { label: 'Sp. Def', val: p.spDef || 0 }, 
            { label: 'Speed', val: p.speed || 0 } 
        ];
        
        let statsHtml = ''; 
        let totalStats = 0; 
        
        statsList.forEach(s => { 
            totalStats += s.val; 
            let barColor = '#f44336'; 
            if (s.val >= 60) barColor = '#ff9800'; 
            if (s.val >= 90) barColor = '#4caf50'; 
            if (s.val >= 120) barColor = '#00bcd4'; 
            
            const pct = (s.val / maxStat) * 100; 
            statsHtml += `
                <div class="stat-row">
                    <div class="stat-label">${s.label}</div>
                    <div class="stat-val">${s.val}</div>
                    <div class="stat-bar-bg">
                        <div class="stat-bar-fill" style="width: 0%; background: ${barColor};" data-target="${pct}%"></div>
                    </div>
                </div>`; 
        }); 
        
        statsHtml += `<div style="text-align: center; margin-top: 15px; font-weight: bold; color: #888;">TOTAL: ${totalStats}</div>`; 
        detailStats.innerHTML = statsHtml;

        let abilityHtml = ''; 
        (p.abilities || []).forEach(ab => { 
            if (!ab || !ab.name) return;
            const fullAb = offlineAbilities.find(x => x.name.toLowerCase() === ab.name.replace(/-/g, ' ')); 
            const desc = fullAb ? fullAb.description : "Description not loaded."; 
            let hiddenTag = ab.isHidden ? '<span style="font-size:10px; background:#9c27b0; padding:2px 6px; border-radius:4px; margin-left:5px;">HIDDEN</span>' : '';
            
            abilityHtml += `
                <div style="margin-bottom: 10px; background: #333; padding: 10px; border-radius: 8px; cursor: pointer;" onclick="openInfoModal('ability', '${ab.name.replace(/'/g, "\\'")}')">
                    <div style="font-weight: bold; text-transform: capitalize; margin-bottom: 5px;">
                        ${ab.name.replace(/-/g, ' ')} ${hiddenTag}
                    </div>
                    <div style="font-size: 13px; color: #bbb;">${desc}</div>
                </div>`; 
        }); 
        
        if(abilityHtml === '') abilityHtml = '<p style="color:#888; font-size:12px;">No abilities found.</p>';
        detailAbilities.innerHTML = abilityHtml;

        const baseSpecies = offlineDatabase.find(x => String(x.id) === String(p.baseId));
        let foundEvoHtml = '';
        
        if (baseSpecies && Array.isArray(offlineEvolutions)) {
            const chain = offlineEvolutions.find(c => Array.isArray(c) && c.some(node => node && toId(node.name) === toId(baseSpecies.speciesName)));
            if (chain && chain.length > 1) {
                const chainHtml = chain.map((node) => {
                    const nameToFind = typeof node === 'string' ? node : node.name;
                    const detailText = typeof node === 'string' ? '' : node.detail;
                    const evoPkmn = offlineDatabase.find(x => toId(x.speciesName) === toId(nameToFind) && x.id < 10000); 
                    if (!evoPkmn) return '';
                    const isCurrentBase = evoPkmn.baseId === p.baseId ? 'current' : '';
                    const evoSpriteName = evoPkmn.spriteId || evoPkmn.name.replace(/[^a-z0-9]/g, '');
                    return `
                        <div class="evo-card ${isCurrentBase}" onclick="openDetailedView(${evoPkmn.id})">
                            <img class="evo-sprite" src="https://play.pokemonshowdown.com/sprites/gen5/${evoSpriteName}.png" onerror="this.onerror=null; this.src='https://play.pokemonshowdown.com/sprites/gen5/substitute.png';">
                            <div class="evo-name">${evoPkmn.name.replace(/-/g, ' ')}</div>
                            <div style="font-size:9px; color:#aaa; margin-top:3px; text-transform:capitalize; text-align:center;">${detailText}</div>
                        </div>`;

                }).join('');
                if (chainHtml) foundEvoHtml = chainHtml;
            }
        }
        
        if (foundEvoHtml) { 
            detailEvoContainer.style.display = 'block'; 
            detailEvoList.innerHTML = foundEvoHtml; 
        } else { 
            detailEvoContainer.style.display = 'none'; 
        }

        const altForms = offlineDatabase.filter(x => String(x.baseId) === String(p.baseId));
        if (altForms.length > 1) {
            detailFormsContainer.style.display = 'block';
            detailFormsList.innerHTML = altForms.map(form => {
                let label = "Base"; 
                if (form.formType === 'mega') label = 'Mega'; 
                else if (form.formType === 'gmax') label = 'G-Max'; 
                else if (form.formType === 'regional') label = 'Regional'; 
                else if (form.id !== p.baseId) label = 'Alt Form';
                
                const isCurrent = form.id === p.id ? 'current' : '';
                const formSpriteName = form.spriteId || form.name.replace(/[^a-z0-9]/g, '');
                return `
                    <div class="evo-card ${isCurrent}" onclick="openDetailedView(${form.id})">
                        <img class="evo-sprite" src="https://play.pokemonshowdown.com/sprites/gen5/${formSpriteName}.png" onerror="this.onerror=null; this.src='https://play.pokemonshowdown.com/sprites/gen5/substitute.png';">
                        <div class="evo-name">${label}</div>
                    </div>`;

            }).join('');
        } else { 
            detailFormsContainer.style.display = 'none'; 
        }

        if(typeof renderPokemonMoves === 'function') {
            renderPokemonMoves(p); 
        }

        viewDetails.style.display = 'block';
        setTimeout(() => { document.querySelectorAll('.stat-bar-fill').forEach(bar => { bar.style.width = bar.getAttribute('data-target'); }); }, 50);
        
    } catch (err) { alert("Failed to load details. Error: " + err.message); }
};

window.renderPokemonMoves = function(p) {
    try {
        const versionSelect = document.getElementById('detail-version-select');
        const version = versionSelect ? versionSelect.value : 'edited';
        
        let moveList = [];
        if (version === 'original') {
            moveList = [...(p.moves || [])].sort((a, b) => String(a).localeCompare(String(b)));
        } else {
            moveList = getEffectiveMoves(p);
        }
        
        let movesHtml = '';
        
        moveList.forEach(moveName => {
            if(!moveName) return;
            const moveData = offlineMoves.find(m => m && m.name && toId(m.name) === toId(moveName));
            
            if(moveData) {
                let dmgClassColor = 'dmg-status'; 
                if(moveData.damage_class === 'physical') dmgClassColor = 'dmg-physical'; 
                if(moveData.damage_class === 'special') dmgClassColor = 'dmg-special';
                
                let customTag = '';
                if (version === 'edited' && offlineOverrides[p.id] && offlineOverrides[p.id].added && offlineOverrides[p.id].added.includes(moveName)) {
                    customTag = `<span style="font-size: 9px; background: #4CAF50; color: #fff; padding: 2px 5px; border-radius: 4px; margin-left: 8px; vertical-align: middle;">NEW</span>`;
                }

                movesHtml += `
                    <div class="detail-move-row" style="cursor:pointer;" onclick="openInfoModal('move', '${moveData.name.replace(/'/g, "\\'")}')">
                        <div class="detail-move-header">
                            <div class="detail-move-name" style="flex: 2; display: flex; align-items: center;">${moveData.name.replace(/-/g, ' ')} ${customTag}</div>
                            <div class="detail-move-stat">${moveData.power}</div>
                            <div class="detail-move-stat">${moveData.accuracy}</div>
                            <div class="detail-move-stat" style="text-align: right;">${moveData.pp}</div>
                        </div>
                        <div class="detail-move-tags">
                            <span class="type-chip type-${moveData.type}" style="margin: 0;">${moveData.type}</span>
                            <span class="dmg-class ${dmgClassColor}">${moveData.damage_class}</span>
                        </div>
                    </div>`;
            }
        });
        
        if (moveList.length === 0) { movesHtml = `<p style="text-align:center; color:#888; margin-top:30px;">No moves found. Click "Edit Base Learnset" to add some.</p>`; }
        detailMovesList.innerHTML = movesHtml;
    } catch (err) { detailMovesList.innerHTML = `<p style="text-align:center; color:#f44336;">Error loading moves: ${err.message}</p>`; }
}

window.openInfoModal = function(type, itemName) {
    try {
        const titleEl = document.getElementById('info-modal-title');
        const subEl = document.getElementById('info-modal-subtitle');
        const statsEl = document.getElementById('info-modal-stats');
        const descEl = document.getElementById('info-modal-desc');
        const lookupBtn = document.getElementById('info-modal-lookup-btn');

        if (type === 'move') {
            const m = offlineMoves.find(x => x.name === itemName);
            if (!m) return;
            titleEl.innerText = m.name.replace(/-/g, ' ');
            let dmgColor = m.damage_class === 'physical' ? 'physical' : (m.damage_class === 'special' ? 'special' : 'status');
            subEl.innerHTML = `<span class="type-chip type-${m.type}" style="margin:0 5px 0 0;">${m.type}</span> <span class="dmg-class dmg-${dmgColor}" style="margin:0;">${m.damage_class}</span>`;
            
            statsEl.innerHTML = `
                <div style="background: #333; padding: 8px; border-radius: 5px; flex: 1; text-align: center;"><div style="font-size: 10px; color: #888;">POWER</div><div style="font-weight: bold; color: #fff; font-size: 18px;">${m.power}</div></div>
                <div style="background: #333; padding: 8px; border-radius: 5px; flex: 1; text-align: center;"><div style="font-size: 10px; color: #888;">ACCURACY</div><div style="font-weight: bold; color: #fff; font-size: 18px;">${m.accuracy}</div></div>
                <div style="background: #333; padding: 8px; border-radius: 5px; flex: 1; text-align: center;"><div style="font-size: 10px; color: #888;">PP</div><div style="font-weight: bold; color: #fff; font-size: 18px;">${m.pp}</div></div>
            `;
            statsEl.style.display = 'flex';
            descEl.innerText = m.description;
            
            lookupBtn.innerText = "See who learns this move";
            lookupBtn.onclick = () => { closeInfoModal(); openReverseLookup('move', m.name); };
            
        } else if (type === 'ability') {
            const a = offlineAbilities.find(x => x.name === itemName);
            if (!a) return;
            titleEl.innerText = a.name.replace(/-/g, ' ');
            subEl.innerHTML = `<span style="font-size:12px; color:#aaa; background:#333; padding:2px 6px; border-radius:4px;">Ability</span>`;
            statsEl.style.display = 'none';
            descEl.innerText = a.description;
            
            lookupBtn.innerText = "See who has this ability";
            lookupBtn.onclick = () => { closeInfoModal(); openReverseLookup('ability', a.name); };
        }

        document.getElementById('info-modal-overlay').style.display = 'block';
        setTimeout(() => document.getElementById('info-modal').classList.add('open'), 10);
    } catch (err) { console.error("Info Modal Error:", err); }
}

window.closeInfoModal = function() {
    document.getElementById('info-modal').classList.remove('open');
    setTimeout(() => document.getElementById('info-modal-overlay').style.display = 'none', 300);
}

window.closeDetailedView = function() { viewDetails.style.display = 'none'; };

if (detailNavInfo) { 
    detailNavInfo.addEventListener('click', () => { 
        detailTabInfo.style.display = 'block'; detailTabMoves.style.display = 'none'; 
        detailNavInfo.classList.add('active'); detailNavMoves.classList.remove('active'); 
        window.scrollTo({ top: 0 }); 
    }); 
}

if (detailNavMoves) { 
    detailNavMoves.addEventListener('click', () => { 
        detailTabInfo.style.display = 'none'; detailTabMoves.style.display = 'block'; 
        detailNavInfo.classList.remove('active'); detailNavMoves.classList.add('active'); 
        window.scrollTo({ top: 0 }); 
    }); 
}
// ==========================================
// 8. TEAM BUILDER LOGIC
// ==========================================
window.handlePokemonClick = function(pokemonId) { 
    try {
        if (activeSlotIndex !== null) selectPokemonForTeam(pokemonId); 
        else openDetailedView(pokemonId); 
    } catch (err) { alert("Click error: " + err.message); }
};

window.clearTeam = function() { 
    currentTeam = [null,null,null,null,null,null]; 
    document.getElementById('team-name-input').value = ''; 
    renderTeamGrid(); 
};

document.querySelectorAll('.team-slot').forEach((slot, index) => { 
    slot.addEventListener('click', () => { 
        if (currentTeam[index] === null) { 
            activeSlotIndex = index; 
            window.switchView('tab-pokemon-btn'); 
            if (tagInput) tagInput.placeholder = `Select for Slot ${index + 1}...`; 
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
            if (tagInput) tagInput.focus(); 
        } else { 
            openTeamEditModal(index); 
        }
    }); 
});

window.selectPokemonForTeam = function(pokemonId) { 
    const selectedPkmn = offlineDatabase.find(p => p.id === pokemonId); 
    if (selectedPkmn) { 
        currentTeam[activeSlotIndex] = { 
            data: selectedPkmn, 
            ability: selectedPkmn.abilities.length > 0 ? selectedPkmn.abilities[0].name : 'None', 
            item: 'None', 
            moves: ['None', 'None', 'None', 'None'],
            nature: 'serious',
            sp: { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 }
        }; 
        activeSlotIndex = null; 
        if (tagInput) {
            tagInput.placeholder = "Quick search... (Press Enter to lock tag)"; 
            tagInput.value = ''; 
        }
        liveFilterPokemon(''); 
        renderTeamGrid(); 
        window.switchView('tab-teambuilder-btn'); 
    } 
};

function renderTeamGrid() {
    currentTeam.forEach((member, index) => {
        const slotEl = document.getElementById(`slot-${index + 1}`); 
        if(!slotEl) return;
        if (member) {
            const mainType = member.data.types[0]; 
            const spriteName = member.data.spriteId || member.data.name.replace(/[^a-z0-9]/g, '');
            slotEl.style.borderStyle = 'solid'; slotEl.style.borderColor = '#888'; slotEl.style.backgroundColor = '#333';
            slotEl.innerHTML = `
                <img src="https://play.pokemonshowdown.com/sprites/gen5/${spriteName}.png" style="width: 80px; height: 80px;" loading="lazy" onerror="this.onerror=null; this.src='https://play.pokemonshowdown.com/sprites/gen5/substitute.png';">
                <span style="color: #fff; text-transform: capitalize; font-size: 14px;">${member.data.name.replace(/-/g, ' ')}</span>
                <span class="type-chip type-${mainType}" style="margin-top: 5px; font-size: 9px;">${mainType}</span>`;

        } else { 
            slotEl.style.borderStyle = 'dashed'; slotEl.style.borderColor = '#555'; slotEl.style.backgroundColor = '#2a2a2a'; 
            slotEl.innerHTML = `<span class="slot-icon">⊕</span><span>Add Member</span>`; 
        }
    });
}

let editingSlotIndex = null; 
let editingMoveIndex = null;
const teamEditOverlay = document.getElementById('team-edit-overlay'); 
const teamEditModal = document.getElementById('team-edit-modal'); 
const editSprite = document.getElementById('edit-sprite'); 
const editName = document.getElementById('edit-name'); 
const editAbilitySelect = document.getElementById('edit-ability'); 
const editItemSpan = document.getElementById('edit-item'); 
const editMoveBtns = [ document.getElementById('edit-move-1'), document.getElementById('edit-move-2'), document.getElementById('edit-move-3'), document.getElementById('edit-move-4') ];

window.openTeamEditModal = function(index) {
    editingSlotIndex = index; 
    const member = currentTeam[index];
    if (!member.nature) member.nature = 'serious';
    if (!member.sp) member.sp = { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 };
    
    const spriteName = member.data.spriteId || member.data.name.replace(/[^a-z0-9]/g, '');
    editSprite.src = `https://play.pokemonshowdown.com/sprites/gen5/${spriteName}.png`; 
    editSprite.onerror = function() { this.src = 'https://play.pokemonshowdown.com/sprites/gen5/substitute.png'; };
    
    editName.innerText = member.data.name.replace(/-/g, ' ');
    editAbilitySelect.innerHTML = member.data.abilities.map(a => `<option value="${a.name}" ${a.name === member.ability ? 'selected' : ''}>${a.name.replace(/-/g, ' ')} ${a.isHidden ? '(Hidden)' : ''}</option>`).join('');
    editItemSpan.innerText = member.item.replace(/-/g, ' ');
    
    const natureSelect = document.getElementById('edit-nature');
    if (natureSelect.options.length === 0) {
        for (const n in naturesList) {
            const opt = document.createElement('option'); 
            opt.value = n; 
            opt.innerText = `${n.charAt(0).toUpperCase() + n.slice(1)} ${naturesList[n].desc}`; 
            natureSelect.appendChild(opt); 
        }
    }
    natureSelect.value = member.nature;
    
    editMoveBtns.forEach((btn, i) => { 
        if (btn) {
            btn.innerText = member.moves[i].replace(/-/g, ' '); 
            if (member.moves[i] === 'None') { btn.style.color = '#888'; btn.style.borderColor = '#444'; } 
            else { btn.style.color = '#fff'; btn.style.borderColor = '#555'; } 
        }
    });
    
    renderTeamSpUI(); 
    if (teamEditOverlay) teamEditOverlay.style.display = 'block'; 
    if (teamEditModal) setTimeout(() => teamEditModal.classList.add('open'), 10);
};

window.saveTeamNature = function() {
    if (editingSlotIndex !== null) {
        currentTeam[editingSlotIndex].nature = document.getElementById('edit-nature').value;
        renderTeamSpUI(); 
    }
}

window.renderTeamSpUI = function() {
    if (editingSlotIndex === null) return;
    const member = currentTeam[editingSlotIndex];

    let totalSp = 0;
    for(let s in member.sp) totalSp += member.sp[s];
    document.getElementById('edit-sp-left').innerText = 66 - totalSp;

    const natData = naturesList[member.nature] || naturesList['serious'];
    document.getElementById('edit-nature-label').innerHTML = `NATURE <span style="color:#FF9800; font-size:10px;">${natData.desc}</span>`;

    const statLabels = {hp: 'HP', attack: 'Atk', defense: 'Def', spAtk: 'Sp.A', spDef: 'Sp.D', speed: 'Spe'};
    let html = '';
    
    for (let stat in statLabels) {
        const val = member.sp[stat];
        let finalStat = 0;
        const base = member.data[stat];
        if (stat === 'hp') { finalStat = base + 75 + val; } 
        else {
            finalStat = base + 20 + val;
            if (natData.plus === stat) finalStat = Math.floor(finalStat * 1.1);
            if (natData.minus === stat) finalStat = Math.floor(finalStat * 0.9);
        }

        html += `
        <div style="display: flex; justify-content: space-between; align-items: center; background: #333; padding: 6px 8px; border-radius: 5px;">
            <span style="color: #aaa; font-size: 13px; font-weight: bold; width: 35px;">${statLabels[stat]}</span>
            <div style="display: flex; align-items: center; gap: 4px;">
                <button onclick="adjustTeamSp('${stat}', -10)" style="background: #444; color: #f44336; border: 1px solid #555; padding: 4px 6px; border-radius: 4px; font-size: 11px; cursor: pointer;">-10</button>
                <button onclick="adjustTeamSp('${stat}', -5)" style="background: #444; color: #e57373; border: 1px solid #555; padding: 4px 6px; border-radius: 4px; font-size: 11px; cursor: pointer;">-5</button>
                <button onclick="adjustTeamSp('${stat}', -1)" style="background: #444; color: #ffcdd2; border: 1px solid #555; padding: 4px 6px; border-radius: 4px; font-size: 11px; cursor: pointer;">-1</button>
                <span style="color: #fff; font-size: 14px; font-weight: bold; width: 24px; text-align: center;">${val}</span>
                <button onclick="adjustTeamSp('${stat}', 1)" style="background: #444; color: #c8e6c9; border: 1px solid #555; padding: 4px 6px; border-radius: 4px; font-size: 11px; cursor: pointer;">+1</button>
                <button onclick="adjustTeamSp('${stat}', 5)" style="background: #444; color: #81c784; border: 1px solid #555; padding: 4px 6px; border-radius: 4px; font-size: 11px; cursor: pointer;">+5</button>
                <button onclick="adjustTeamSp('${stat}', 10)" style="background: #444; color: #4CAF50; border: 1px solid #555; padding: 4px 6px; border-radius: 4px; font-size: 11px; cursor: pointer;">+10</button>
            </div>
            <span style="color: #bbb; font-size: 13px; width: 35px; text-align: right;">(${finalStat})</span>
        </div>`;
    }
    document.getElementById('edit-sp-container').innerHTML = html;
}

window.adjustTeamSp = function(stat, amount) {
    if (editingSlotIndex === null) return;
    const member = currentTeam[editingSlotIndex];
    let val = member.sp[stat] + amount;
    if (val < 0) val = 0; if (val > 32) val = 32; 
    let totalOtherSp = 0;
    for (let s in member.sp) { if (s !== stat) totalOtherSp += member.sp[s]; }
    if (totalOtherSp + val > 66) val = 66 - totalOtherSp; 
    member.sp[stat] = val;
    renderTeamSpUI();
}

window.showAbilityInfo = function() { 
    const abName = editAbilitySelect.value; 
    const abData = offlineAbilities.find(a => a.name === abName); 
    if (abData) { alert(abData.name.toUpperCase() + '\n\n' + abData.description.replace(/`/g, "'").replace(/\\/g, "")); } 
}

window.showItemInfo = function() { 
    if (editingSlotIndex === null) return; 
    const itemName = currentTeam[editingSlotIndex].item; 
    if (itemName === 'None') { alert("No item selected."); return; } 
    const itemData = offlineItems.find(i => toId(i.name) === toId(itemName)); 
    if (itemData) { alert(itemData.name.toUpperCase() + '\n\n' + itemData.description.replace(/`/g, "'").replace(/\\/g, "")); } 
}

window.closeTeamEditModal = function() { 
    if (editingSlotIndex !== null && currentTeam[editingSlotIndex]) { currentTeam[editingSlotIndex].ability = editAbilitySelect.value; } 
    if (teamEditModal) teamEditModal.classList.remove('open'); 
    if (teamEditOverlay) setTimeout(() => teamEditOverlay.style.display = 'none', 300); 
};

window.removeTeamMember = function() { 
    if (editingSlotIndex !== null) { currentTeam[editingSlotIndex] = null; closeTeamEditModal(); renderTeamGrid(); } 
}

// Item/Move Selection Modals for Teambuilder
window.openItemSelectModal = function() { 
    document.getElementById('item-select-modal-overlay').style.display = 'block'; 
    setTimeout(() => document.getElementById('item-select-modal').classList.add('open'), 10); 
    renderItemSelectList(''); document.getElementById('item-select-search').value = ''; 
}
window.closeItemSelectModal = function() { document.getElementById('item-select-modal').classList.remove('open'); setTimeout(() => document.getElementById('item-select-modal-overlay').style.display = 'none', 300); }

const itemSelectSearch = document.getElementById('item-select-search');
if (itemSelectSearch) {
    itemSelectSearch.addEventListener('input', (e) => { renderItemSelectList(e.target.value.toLowerCase().trim()); });
}

function renderItemSelectList(searchTerm) {
    let filtered = offlineItems; 
    if (activeRegulationId) { 
        const activeReg = regulations.find(r => r.id === activeRegulationId); 
        if (activeReg && activeReg.items && activeReg.items.length > 0) { filtered = filtered.filter(it => activeReg.items.includes(it.name)); }
    }
    if (searchTerm) { filtered = filtered.filter(it => it.name.replace(/-/g, ' ').toLowerCase().includes(searchTerm)); }
    
    let html = `<div onclick="selectItemForTeam('None')" style="padding: 15px; border-bottom: 1px solid #444; cursor: pointer; color: #f44336; font-weight: bold; text-align: center;">Clear Item (None)</div>`;
     filtered.forEach(it => { 
        const safeDesc = it.description.replace(/`/g, "'").replace(/\\/g, ""); 
        html += `
        <div style="display: flex; align-items: center; gap: 15px; padding: 10px; border-bottom: 1px solid #444;">
            <div onclick="selectItemForTeam('${it.name}')" style="display: flex; align-items: center; gap: 15px; flex-grow: 1; cursor: pointer;">
                <img src="https://play.pokemonshowdown.com/sprites/itemicons/${it.spriteId}.png" style="width: 30px; height: 30px;" loading="lazy" onerror="this.style.display='none'">
                <div style="font-weight: bold; text-transform: capitalize; color: #fff;">${it.name.replace(/-/g, ' ')}</div>
            </div>
            <button onclick="alert(\`${safeDesc}\`)" style="background: #444; border: 1px solid #555; color: #fff; width: 35px; height: 35px; border-radius: 50%; font-weight: bold; cursor: pointer;">ⓘ</button>
        </div>`; 
    }); 

    document.getElementById('item-select-list').innerHTML = html;
}

window.selectItemForTeam = function(itemName) { 
    if (editingSlotIndex !== null) { currentTeam[editingSlotIndex].item = itemName.replace(/-/g, ' '); document.getElementById('edit-item').innerText = currentTeam[editingSlotIndex].item; closeItemSelectModal(); } 
}

window.openMoveSelectModal = function(moveIndex) { 
    editingMoveIndex = moveIndex; 
    document.getElementById('move-select-modal-overlay').style.display = 'block'; 
    setTimeout(() => document.getElementById('move-select-modal').classList.add('open'), 10); 
    renderMoveSelectList(''); document.getElementById('move-select-search').value = ''; 
}
window.closeMoveSelectModal = function() { document.getElementById('move-select-modal').classList.remove('open'); setTimeout(() => document.getElementById('move-select-modal-overlay').style.display = 'none', 300); }

const moveSelectSearch = document.getElementById('move-select-search');
if (moveSelectSearch) {
    moveSelectSearch.addEventListener('input', (e) => { renderMoveSelectList(e.target.value.toLowerCase().trim()); });
}

function renderMoveSelectList(searchTerm) {
    if (editingSlotIndex === null) return; 
    const member = currentTeam[editingSlotIndex]; 
    const effectiveMoves = getEffectiveMoves(member.data);
    
    let validMoves = effectiveMoves.map(name => offlineMoves.find(om => toId(om.name) === toId(name))).filter(Boolean); 
    if (searchTerm) { validMoves = validMoves.filter(m => m.name.replace(/-/g, ' ').toLowerCase().includes(searchTerm) || m.type.toLowerCase().includes(searchTerm)); }
    validMoves.sort((a, b) => a.name.localeCompare(b.name));
    
    let html = `<div onclick="selectMoveForTeam('None')" style="padding: 15px; border-bottom: 1px solid #444; cursor: pointer; color: #f44336; font-weight: bold; text-align: center;">Clear Move (None)</div>`;
    validMoves.forEach(m => { 
        let dmgClassColor = 'dmg-status'; if(m.damage_class === 'physical') dmgClassColor = 'dmg-physical'; if(m.damage_class === 'special') dmgClassColor = 'dmg-special'; 
        const safeDesc = m.description.replace(/`/g, "'").replace(/\\/g, ""); 
        html += `
        <div class="detail-move-row" style="margin: 5px 10px; display: flex; align-items: center; gap: 10px;">
            <div style="flex-grow: 1;" onclick="selectMoveForTeam('${m.name}')">
                <div class="detail-move-header">
                    <div class="detail-move-name">${m.name.replace(/-/g, ' ')}</div>
                    <div class="detail-move-stat">${m.power}</div>
                    <div class="detail-move-stat">${m.accuracy}</div>
                    <div class="detail-move-stat" style="text-align: right;">${m.pp}</div>
                </div>
                <div class="detail-move-tags"><span class="type-chip type-${m.type}" style="margin: 0;">${m.type}</span><span class="dmg-class ${dmgClassColor}">${m.damage_class}</span></div>
            </div>
            <button onclick="alert(\`${safeDesc}\`)" style="background: #444; border: 1px solid #555; color: #fff; width: 40px; height: 40px; border-radius: 50%; font-weight: bold; cursor: pointer; flex-shrink: 0;">ⓘ</button>
        </div>`; 
    }); 
    document.getElementById('move-select-list').innerHTML = html;
}

window.selectMoveForTeam = function(moveName) { 
    if (editingSlotIndex !== null && editingMoveIndex !== null) { 
        currentTeam[editingSlotIndex].moves[editingMoveIndex] = moveName; 
        const btn = editMoveBtns[editingMoveIndex]; 
        if (btn) {
            btn.innerText = moveName.replace(/-/g, ' '); 
            btn.style.color = moveName === 'None' ? '#888' : '#fff'; 
            btn.style.borderColor = moveName === 'None' ? '#444' : '#555'; 
        }
        closeMoveSelectModal(); 
    } 
}

window.saveCurrentTeam = function() {
    if (currentTeam.every(m => m === null)) { alert("Cannot save an empty team!"); return; }
    const teamName = document.getElementById('team-name-input').value.trim() || `Team ${savedTeams.length + 1}`;
    savedTeams.push({ name: teamName, team: JSON.parse(JSON.stringify(currentTeam)) });
    localStorage.setItem('championsSavedTeams', JSON.stringify(savedTeams));
    alert(`"${teamName}" saved successfully!`);
}
// ==========================================
// UNIFIED BUILDS MANAGER (TEAMS & META)
// ==========================================
let currentManagerTab = 'teams';

window.triggerManagerSearch = function() {
    const term = document.getElementById('manager-search-input').value.toLowerCase().trim();
    if (currentManagerTab === 'teams') renderManagerTeams(term);
    if (currentManagerTab === 'meta') renderManagerMeta(term);
};

window.openTeamManagerModal = function() { 
    document.getElementById('team-manager-overlay').style.display = 'block'; 
    setTimeout(() => document.getElementById('team-manager-modal').classList.add('open'), 10); 
    
    const searchInput = document.getElementById('manager-search-input');
    if (searchInput) searchInput.value = ''; // Reset search bar on open
    
    switchManagerTab(currentManagerTab); 
};

window.closeTeamManagerModal = function() { 
    document.getElementById('team-manager-modal').classList.remove('open'); 
    setTimeout(() => document.getElementById('team-manager-overlay').style.display = 'none', 300); 
};

window.switchManagerTab = function(tab) {
    currentManagerTab = tab;
    ['teams', 'meta'].forEach(t => {
        document.getElementById(`manager-tab-${t}`).classList.remove('active');
        document.getElementById(`manager-tab-${t}`).style.background = 'none';
        document.getElementById(`manager-list-${t}`).style.display = 'none';
    });
    
    document.getElementById(`manager-tab-${tab}`).classList.add('active');
    document.getElementById(`manager-tab-${tab}`).style.background = '#333';
    document.getElementById(`manager-list-${tab}`).style.display = 'block';
    
    const term = document.getElementById('manager-search-input') ? document.getElementById('manager-search-input').value.toLowerCase().trim() : '';
    if (tab === 'teams') renderManagerTeams(term);
    if (tab === 'meta') renderManagerMeta(term);
};

window.renderManagerTeams = function(searchTerm = '') {
    let html = '';
    
    // Create a shadow array that remembers the original index for safe deletion
    let filteredTeams = savedTeams.map((team, idx) => ({ ...team, originalIndex: idx }));
    
    if (searchTerm) {
        filteredTeams = filteredTeams.filter(t => {
            const matchName = t.name.toLowerCase().includes(searchTerm);
            const matchPkmn = t.team.some(m => m && m.data.name.replace(/-/g, ' ').toLowerCase().includes(searchTerm));
            return matchName || matchPkmn;
        });
    }

    if (filteredTeams.length === 0) { 
        html = `<p style="text-align:center; color:#888; margin-top: 30px;">${searchTerm ? 'No matches found.' : 'No teams saved yet.'}</p>`; 
    } else {
        filteredTeams.forEach((teamObj) => {
            const originalIdx = teamObj.originalIndex;
            let spritesHtml = teamObj.team.map(m => {
                if (m) { const spriteName = m.data.spriteId || m.data.name.replace(/[^a-z0-9]/g, ''); return `<img src="https://play.pokemonshowdown.com/sprites/gen5/${spriteName}.png" style="width:35px;height:35px; margin:-5px; filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.8));" onerror="this.src='https://play.pokemonshowdown.com/sprites/gen5/substitute.png'">`; } 
                else { return `<span style="width:25px; height:35px; display:inline-block;"></span>`; }
            }).join('');
            html += `
            <div style="background: #2a2a2a; border: 1px solid #555; border-radius: 8px; padding: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div style="flex-grow: 1; cursor: pointer; padding-right: 10px;" onclick="loadSavedTeam(${originalIdx})">
                    <div style="font-weight: bold; color: #fff; margin-bottom: 8px; font-size: 16px;">${teamObj.name}</div>
                    <div style="display:flex;">${spritesHtml}</div>
                </div>
                <button onclick="deleteSavedTeam(${originalIdx})" style="background: #f44336; color: #fff; border: none; padding: 10px 15px; border-radius: 8px; font-weight: bold; cursor: pointer;">Delete</button>
            </div>`;
        });
    }
    document.getElementById('manager-list-teams').innerHTML = html;
};

window.renderManagerMeta = function(searchTerm = '') {
    let html = '';
    const keys = Object.keys(metaThreats);
    let totalRendered = 0;

    if (keys.length === 0) {
        html = '<p style="text-align:center; color:#888; margin-top:30px;">No Meta Threats saved yet.</p>';
    } else {
        keys.forEach(key => {
            const group = metaThreats[key];
            
            // Map valid builds and attach their original index for safe deletion/loading
            let validBuilds = group.builds.map((b, i) => ({build: b, idx: i})).filter(x => x.build !== null);
            
            if (searchTerm) {
                const speciesMatch = group.speciesName.replace(/-/g, ' ').toLowerCase().includes(searchTerm);
                validBuilds = validBuilds.filter(item => {
                    return speciesMatch || 
                           item.build.buildName.toLowerCase().includes(searchTerm) || 
                           item.build.item.replace(/-/g, ' ').toLowerCase().includes(searchTerm);
                });
            }

            if (validBuilds.length > 0) {
                totalRendered++;
                html += `<div style="background: #111; padding: 8px 10px; margin-top: 10px; font-weight: bold; border-radius: 5px; text-transform: capitalize; color: #9c27b0;">${group.speciesName.replace(/-/g, ' ')}</div>`;
                validBuilds.forEach(item => {
                    const spriteName = item.build.data.spriteId || item.build.data.name.replace(/[^a-z0-9]/g, '');
                    html += `
                    <div style="background: #2a2a2a; border: 1px solid #555; border-radius: 8px; padding: 10px; margin-bottom: 10px; margin-top: 5px; display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex-grow: 1; cursor: pointer; display: flex; align-items: center; gap: 10px;" onclick="loadMetaThreatToTeambuilder('${key}', ${item.idx})">
                            <img src="https://play.pokemonshowdown.com/sprites/gen5/${spriteName}.png" style="width: 40px; height: 40px;" onerror="this.onerror=null; this.src='https://play.pokemonshowdown.com/sprites/gen5/substitute.png';">
                            <div>
                                <div style="font-weight: bold; color: #fff; font-size: 16px;">${item.build.buildName}</div>
                                <div style="font-size: 12px; color: #aaa; text-transform: capitalize;">${item.build.nature} | ${item.build.item.replace(/-/g, ' ')}</div>
                            </div>
                        </div>
                        <button onclick="deleteMetaThreat('${key}', ${item.idx})" style="background: #f44336; color: #fff; border: none; padding: 10px 15px; border-radius: 8px; font-weight: bold; cursor: pointer;">Delete</button>
                    </div>`;
                });
            }
        });
        
        if (totalRendered === 0 && searchTerm) {
            html = '<p style="text-align:center; color:#888; margin-top:30px;">No matches found.</p>';
        }
    }
    document.getElementById('manager-list-meta').innerHTML = html;
};

// ==========================================
// 9. REGULATIONS MANAGER
// ==========================================
window.openRegulationManager = function() { document.getElementById('regulation-manager-overlay').style.display = 'block'; setTimeout(() => document.getElementById('regulation-manager-modal').classList.add('open'), 10); renderRegulationList(); };
window.closeRegulationManagerModal = function() { document.getElementById('regulation-manager-modal').classList.remove('open'); setTimeout(() => document.getElementById('regulation-manager-overlay').style.display = 'none', 300); };

function renderRegulationList() {
    let html = '';
    regulations.forEach((reg, index) => {
        const pCount = reg.pokemon ? reg.pokemon.length : 0;
        const iCount = reg.items ? reg.items.length : 0;
        const isActive = activeRegulationId === reg.id;
        html += `
        <div style="background: #2a2a2a; border: 1px solid ${isActive ? '#4CAF50' : '#444'}; border-radius: 8px; padding: 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
            <div style="flex-grow: 1; cursor: pointer;" onclick="selectTopFilter('regulation', '${isActive ? '' : reg.id}')">
                <div style="font-weight: bold; font-size: 16px; color: ${isActive ? '#4CAF50' : '#fff'}; margin-bottom: 5px;">${reg.name}</div>
                <div style="font-size: 12px; color: #888;">${pCount} Pokémon | ${iCount} Items</div>
            </div>
            <div style="display: flex; gap: 10px;">
                <button onclick="editRegulation(${index})" style="background: #2196F3; color: white; border: none; padding: 8px 12px; border-radius: 5px; font-weight: bold; cursor: pointer;">✎</button>
                <button onclick="deleteRegulation(${index})" style="background: #f44336; color: white; border: none; padding: 8px 12px; border-radius: 5px; font-weight: bold; cursor: pointer;">✖</button>
            </div>
        </div>`;
    });
    if (regulations.length === 0) html = '<p style="text-align:center; color:#888;">No custom regulations yet.</p>';
    document.getElementById('reg-manager-list').innerHTML = html;
}

let editingRegulationIndex = null;
let tempRegData = { name: '', pokemon: [], items: [] };
let currentRegTab = 'pokemon';

window.createNewRegulation = function() {
    editingRegulationIndex = null;
    tempRegData = { name: `Regulation ${regulations.length + 1}`, pokemon: [], items: [] };
    document.getElementById('reg-edit-name').value = tempRegData.name;
    document.getElementById('reg-manager-main').style.display = 'none';
    document.getElementById('reg-editor-main').style.display = 'flex';
    switchRegTab('pokemon');
}

window.editRegulation = function(index) {
    editingRegulationIndex = index;
    tempRegData = JSON.parse(JSON.stringify(regulations[index]));
    if(!tempRegData.items) tempRegData.items = [];
    document.getElementById('reg-edit-name').value = tempRegData.name;
    document.getElementById('reg-manager-main').style.display = 'none';
    document.getElementById('reg-editor-main').style.display = 'flex';
    switchRegTab('pokemon');
}

window.closeRegulationEditor = function() {
    document.getElementById('reg-editor-main').style.display = 'none';
    document.getElementById('reg-manager-main').style.display = 'flex';
}

window.saveRegulation = function() {
    tempRegData.name = document.getElementById('reg-edit-name').value.trim() || 'Unnamed Regulation';
    if (!tempRegData.id) tempRegData.id = 'reg_' + Date.now();
    if (editingRegulationIndex !== null) regulations[editingRegulationIndex] = tempRegData;
    else regulations.push(tempRegData);
    localStorage.setItem('championsRegulations', JSON.stringify(regulations));
    populateTopFilters();
    closeRegulationEditor();
    renderRegulationList();
}

window.deleteRegulation = function(index) {
    if(confirm("Delete this regulation?")) {
        if(activeRegulationId === regulations[index].id) selectTopFilter('regulation', '');
        regulations.splice(index, 1);
        localStorage.setItem('championsRegulations', JSON.stringify(regulations));
        populateTopFilters();
        renderRegulationList();
    }
}

const regTabPkmn = document.getElementById('reg-tab-pkmn');
if (regTabPkmn) regTabPkmn.addEventListener('click', () => switchRegTab('pokemon'));
const regTabItems = document.getElementById('reg-tab-items');
if (regTabItems) regTabItems.addEventListener('click', () => switchRegTab('items'));

function switchRegTab(tab) {
    currentRegTab = tab;
    document.getElementById('reg-tab-pkmn').classList.remove('active');
    document.getElementById('reg-tab-items').classList.remove('active');
    document.getElementById(`reg-tab-${tab === 'pokemon' ? 'pkmn' : 'items'}`).classList.add('active');
    renderRegChips();
}

function renderRegChips() {
    const list = currentRegTab === 'pokemon' ? tempRegData.pokemon : tempRegData.items;
    let html = '';
    list.sort().forEach(item => {
        html += `<div class="reg-chip">${item.replace(/-/g, ' ')} <button class="reg-chip-remove" onclick="removeRegItem('${item.replace(/'/g, "\\'")}')">&times;</button></div>`;
    });
    if (list.length === 0) html = `<p style="color:#888; text-align:center; width:100%; font-size:14px;">No ${currentRegTab} allowed yet.</p>`;
    document.getElementById('reg-edit-chips').innerHTML = html;
}

window.removeRegItem = function(item) {
    if (currentRegTab === 'pokemon') tempRegData.pokemon = tempRegData.pokemon.filter(p => p !== item);
    else tempRegData.items = tempRegData.items.filter(i => i !== item);
    renderRegChips();
}

window.openMasterListModal = function() {
    document.getElementById('master-list-modal-overlay').style.display = 'block';
    setTimeout(() => document.getElementById('master-list-modal').classList.add('open'), 10);
    document.getElementById('master-list-title').innerText = `Select ${currentRegTab === 'pokemon' ? 'Pokémon' : 'Items'}`;
    document.getElementById('master-list-search').value = '';
    renderMasterListGrid('');
}
window.closeMasterListModal = function() {
    document.getElementById('master-list-modal').classList.remove('open');
    setTimeout(() => document.getElementById('master-list-modal-overlay').style.display = 'none', 300);
    renderRegChips();
}

const masterListSearch = document.getElementById('master-list-search');
if (masterListSearch) {
    masterListSearch.addEventListener('input', (e) => { renderMasterListGrid(e.target.value.toLowerCase().trim()); });
}

function renderMasterListGrid(searchTerm) {
    const grid = document.getElementById('master-list-grid');
    let html = '';
    
    if (currentRegTab === 'pokemon') {
        let list = offlineDatabase;
        if (searchTerm) list = list.filter(p => p.name.replace(/-/g, ' ').includes(searchTerm) || String(p.id).includes(searchTerm));
        list.slice(0, 100).forEach(p => {
            const isSelected = tempRegData.pokemon.includes(p.name);
            const spriteName = p.spriteId || p.name.replace(/[^a-z0-9]/g, '');
            
            html += `
            <div class="master-card ${isSelected ? 'selected' : ''}" onclick="toggleMasterItem('${p.name.replace(/'/g, "\\'")}')">
                <div class="master-card-id">#${String(p.baseId || p.id).padStart(3, '0')}</div>
                <img src="https://play.pokemonshowdown.com/sprites/gen5/${spriteName}.png" loading="lazy" onerror="this.onerror=null; this.src='https://play.pokemonshowdown.com/sprites/gen5/substitute.png';">
                <div class="master-card-name">${p.name.replace(/-/g, ' ')}</div>
            </div>`;
        });
    } else {
        let list = offlineItems;
        if (searchTerm) list = list.filter(it => it.name.replace(/-/g, ' ').includes(searchTerm));
        list.slice(0, 100).forEach(it => {
            const isSelected = tempRegData.items.includes(it.name);
            html += `
            <div class="master-card ${isSelected ? 'selected' : ''}" onclick="toggleMasterItem('${it.name.replace(/'/g, "\\'")}')">
                <img src="https://play.pokemonshowdown.com/sprites/itemicons/${it.spriteId}.png" loading="lazy" onerror="this.style.display='none'">
                <div class="master-card-name">${it.name.replace(/-/g, ' ')}</div>
            </div>`;
        });
    }
    grid.innerHTML = html;
}


window.toggleMasterItem = function(name) {
    const list = currentRegTab === 'pokemon' ? tempRegData.pokemon : tempRegData.items;
    if (list.includes(name)) { list.splice(list.indexOf(name), 1); } 
    else { list.push(name); }
    renderMasterListGrid(document.getElementById('master-list-search').value.toLowerCase().trim());
}

// ==========================================
// 10. LEARNSET OVERRIDES & CSV
// ==========================================
function getEffectiveMoves(pokemon) {
    if (!pokemon) return [];
    const overrides = offlineOverrides[pokemon.id];
    
    // THE FAST PATH: If this Pokemon hasn't been edited, skip the heavy math!
    if (!overrides || (!overrides.added && !overrides.removed)) {
        return pokemon.moves || [];
    }
    
    let baseMoves = [...(pokemon.moves || [])];
    if (overrides.added) baseMoves = [...baseMoves, ...overrides.added];
    if (overrides.removed) baseMoves = baseMoves.filter(m => !overrides.removed.includes(m));
    return [...new Set(baseMoves)].sort((a,b) => String(a).localeCompare(String(b)));
}


let learnsetTargetId = null;
let learnsetTempAdded = [];
let learnsetTempRemoved = [];

window.openLearnsetModal = function() {
    if (!window.currentDetailedPokemon) return;
    const p = window.currentDetailedPokemon;
    learnsetTargetId = p.id;
    
    learnsetTempAdded = [];
    learnsetTempRemoved = [];
    if (offlineOverrides[p.id]) {
        if (offlineOverrides[p.id].added) learnsetTempAdded = [...offlineOverrides[p.id].added];
        if (offlineOverrides[p.id].removed) learnsetTempRemoved = [...offlineOverrides[p.id].removed];
    }
    
    document.getElementById('learnset-target-name').innerText = p.name.toUpperCase();
    document.getElementById('learnset-modal-overlay').style.display = 'block';
    setTimeout(() => document.getElementById('learnset-modal').classList.add('open'), 10);
    renderLearnsetUI();
}

window.closeLearnsetModal = function() {
    document.getElementById('learnset-modal').classList.remove('open');
    setTimeout(() => document.getElementById('learnset-modal-overlay').style.display = 'none', 300);
}

function renderLearnsetUI() {
    const p = offlineDatabase.find(x => x.id === learnsetTargetId);
    if (!p) return;
    
    let effective = [...(p.moves || [])];
    effective = [...effective, ...learnsetTempAdded];
    effective = effective.filter(m => !learnsetTempRemoved.includes(m));
    effective = [...new Set(effective)].sort();
    
    let html = '';
    effective.forEach(m => {
        let isAdded = learnsetTempAdded.includes(m);
        let colorStyle = isAdded ? 'color: #4CAF50;' : 'color: #fff;';
        let tagHtml = isAdded ? '<span style="font-size:10px; background:#4CAF50; padding:2px 5px; border-radius:4px; margin-left:10px; color:#fff;">Added</span>' : '';
        
        html += `
        <div class="override-move-row">
            <span style="${colorStyle}">${m.replace(/-/g, ' ')}${tagHtml}</span>
            <button class="override-move-remove" onclick="removeMoveFromLearnset('${m}')">&times;</button>
        </div>`;
    });
    
    learnsetTempRemoved.forEach(m => {
        html += `
        <div class="override-move-row" style="background: rgba(244, 67, 54, 0.1);">
            <span style="color: #f44336; text-decoration: line-through;">${m.replace(/-/g, ' ')}</span>
            <button style="background: #2196F3; color: white; border: none; padding: 5px 10px; border-radius: 4px; font-weight: bold; cursor: pointer;" onclick="restoreMoveToLearnset('${m}')">Restore</button>
        </div>`;
    });
    
    document.getElementById('learnset-current-moves').innerHTML = html;
}

window.removeMoveFromLearnset = function(moveName) {
    if (learnsetTempAdded.includes(moveName)) { learnsetTempAdded = learnsetTempAdded.filter(m => m !== moveName); } 
    else { if (!learnsetTempRemoved.includes(moveName)) learnsetTempRemoved.push(moveName); }
    renderLearnsetUI();
}

window.restoreMoveToLearnset = function(moveName) {
    learnsetTempRemoved = learnsetTempRemoved.filter(m => m !== moveName);
    renderLearnsetUI();
}

const learnsetSearchInput = document.getElementById('learnset-search');
const learnsetSuggestions = document.getElementById('learnset-suggestions');

if (learnsetSearchInput) {
    learnsetSearchInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase().trim();
        learnsetSuggestions.innerHTML = '';
        if (val.length < 2) { learnsetSuggestions.style.display = 'none'; return; }
        
        const p = offlineDatabase.find(x => x.id === learnsetTargetId);
        let effective = [...(p.moves || []), ...learnsetTempAdded].filter(m => !learnsetTempRemoved.includes(m));
        
        const matches = offlineMoves.filter(m => m.name.replace(/-/g, ' ').toLowerCase().includes(val) && !effective.includes(m.name)).slice(0, 10);
        
        if (matches.length > 0) {
            learnsetSuggestions.style.display = 'block';
            matches.forEach(m => {
                const div = document.createElement('div');
                div.style.padding = '10px'; div.style.borderBottom = '1px solid #444'; div.style.cursor = 'pointer'; div.style.textTransform = 'capitalize';
                div.innerText = m.name.replace(/-/g, ' ');
                div.onclick = () => {
                    if (learnsetTempRemoved.includes(m.name)) { learnsetTempRemoved = learnsetTempRemoved.filter(x => x !== m.name); } 
                    else { learnsetTempAdded.push(m.name); }
                    learnsetSearchInput.value = ''; learnsetSuggestions.style.display = 'none'; renderLearnsetUI();
                };
                learnsetSuggestions.appendChild(div);
            });
        } else { learnsetSuggestions.style.display = 'none'; }
    });
}

window.saveLearnsetOverrides = async function() {
    const overrideObj = { id: learnsetTargetId, added: learnsetTempAdded, removed: learnsetTempRemoved };
    offlineOverrides[learnsetTargetId] = overrideObj;
    
    const transaction = db.transaction(['overrides'], "readwrite");
    const store = transaction.objectStore('overrides');
    store.put(overrideObj);
    
    transaction.oncomplete = () => { closeLearnsetModal(); if(window.currentDetailedPokemon && window.currentDetailedPokemon.id === learnsetTargetId) { renderPokemonMoves(window.currentDetailedPokemon); } };
}

// CSV IMPORT
let parsedCSVData = null;

window.triggerCSVImport = function() { document.getElementById('import-csv-file').click(); }

window.importCSVOverrides = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        parsedCSVData = text.split('\n').map(row => row.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
        if (parsedCSVData && parsedCSVData.length > 0) {
            openCSVMapModal(parsedCSVData[0]);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

window.openCSVMapModal = function(headers) {
    let optionsHtml = '<option value="-1">-- Ignore / None --</option>';
    headers.forEach((h, idx) => { optionsHtml += `<option value="${idx}">${h || `Column ${idx+1}`}</option>`; });
    
    document.getElementById('csv-col-name').innerHTML = optionsHtml;
    document.getElementById('csv-col-added').innerHTML = optionsHtml;
    document.getElementById('csv-col-removed').innerHTML = optionsHtml;
    document.getElementById('csv-col-start').innerHTML = optionsHtml;
    
    document.getElementById('csv-map-modal-overlay').style.display = 'block';
    setTimeout(() => document.getElementById('csv-map-modal').classList.add('open'), 10);
}

window.closeCSVMapModal = function() {
    document.getElementById('csv-map-modal').classList.remove('open');
    setTimeout(() => document.getElementById('csv-map-modal-overlay').style.display = 'none', 300);
}

window.toggleCSVMode = function() {
    const mode = document.getElementById('csv-import-mode').value;
    if (mode === 'delta') {
        document.getElementById('csv-mode-delta').style.display = 'block';
        document.getElementById('csv-mode-full').style.display = 'none';
    } else {
        document.getElementById('csv-mode-delta').style.display = 'none';
        document.getElementById('csv-mode-full').style.display = 'block';
    }
}

window.executeCSVImport = async function() {
    const mode = document.getElementById('csv-import-mode').value;
    const nameIdx = parseInt(document.getElementById('csv-col-name').value);
    
    if (nameIdx === -1) { alert("You must map the Pokémon Name column!"); return; }
    
    let processedCount = 0;
    const transaction = db.transaction(['overrides'], "readwrite");
    const store = transaction.objectStore('overrides');

    for (let i = 1; i < parsedCSVData.length; i++) {
        const row = parsedCSVData[i];
        if (!row || row.length <= nameIdx) continue;
        
        const rawName = row[nameIdx];
        if (!rawName) continue;
        const targetId = toId(rawName);
        const pkmn = offlineDatabase.find(p => p.name === targetId || toId(p.speciesName) === targetId);
        
        if (!pkmn) continue;

        let added = [];
        let removed = [];
        
        if (mode === 'delta') {
            const addIdx = parseInt(document.getElementById('csv-col-added').value);
            const remIdx = parseInt(document.getElementById('csv-col-removed').value);
            
            if (addIdx > -1 && row[addIdx]) {
                const addList = row[addIdx].split(/[,|/]/).map(m => toId(m));
                addList.forEach(m => {
                    const found = offlineMoves.find(om => toId(om.name) === m);
                    if(found) added.push(found.name);
                });
            }
            if (remIdx > -1 && row[remIdx]) {
                const remList = row[remIdx].split(/[,|/]/).map(m => toId(m));
                remList.forEach(m => {
                    const found = offlineMoves.find(om => toId(om.name) === m);
                    if(found) removed.push(found.name);
                });
            }
        } else {
            const startIdx = parseInt(document.getElementById('csv-col-start').value);
            if (startIdx > -1) {
                let fullMoveset = [];
                for (let j = startIdx; j < row.length; j++) {
                    if (row[j]) {
                        const mStr = toId(row[j]);
                        const found = offlineMoves.find(om => toId(om.name) === mStr);
                        if(found) fullMoveset.push(found.name);
                    }
                }
                const originalBase = pkmn.moves || [];
                added = fullMoveset.filter(m => !originalBase.includes(m));
                removed = originalBase.filter(m => !fullMoveset.includes(m));
            }
        }

        if (added.length > 0 || removed.length > 0) {
            const overrideObj = { id: pkmn.id, added: added, removed: removed };
            offlineOverrides[pkmn.id] = overrideObj;
            store.put(overrideObj);
            processedCount++;
        }
    }

    transaction.oncomplete = () => {
        closeCSVMapModal();
        alert(`Import complete! Updated movesets for ${processedCount} Pokémon.`);
        if (window.currentDetailedPokemon) { renderPokemonMoves(window.currentDetailedPokemon); }
    };
}

// ==========================================
// 11. CALCULATOR MATH & LOGIC
// ==========================================
let calcState = {
    attacker: null, defender: null,
    attackerMoves: ['None', 'None', 'None', 'None'], defenderMoves: ['None', 'None', 'None', 'None'], 
    sp: { attacker: {hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0}, defender: {hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0} },
    stages: { attacker: {attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0}, defender: {attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0} },
    natures: { attacker: 'serious', defender: 'serious' },
    abilities: { attacker: 'None', defender: 'None' },
    items: { attacker: 'None', defender: 'None' }
};

window.sendToCalculator = function() {
    try {
        if (window.currentDetailedPokemon) {
            calcState.attacker = window.currentDetailedPokemon;
            calcState.sp.attacker = {hp:0, attack:0, defense:0, spAtk:0, spDef:0, speed:0};
            calcState.stages.attacker = {attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0};
            calcState.attackerMoves = ['None', 'None', 'None', 'None'];
            window.switchView('tab-calculator-btn');
            closeDetailedView();
            renderCalcUI();
        }
    } catch (err) { alert("Calc send error: " + err.message); }
}

window.swapCalcCombatants = function() {
    try {
        const tempPkmn = calcState.attacker; calcState.attacker = calcState.defender; calcState.defender = tempPkmn;
        const tempSp = calcState.sp.attacker; calcState.sp.attacker = calcState.sp.defender; calcState.sp.defender = tempSp;
        const tempStages = calcState.stages.attacker; calcState.stages.attacker = calcState.stages.defender; calcState.stages.defender = tempStages;
        const tempNat = calcState.natures.attacker; calcState.natures.attacker = calcState.natures.defender; calcState.natures.defender = tempNat;
        const tempMoves = calcState.attackerMoves; calcState.attackerMoves = calcState.defenderMoves; calcState.defenderMoves = tempMoves;
        const tempAbilities = calcState.abilities.attacker; calcState.abilities.attacker = calcState.abilities.defender; calcState.abilities.defender = tempAbilities;
        const tempItems = calcState.items.attacker; calcState.items.attacker = calcState.items.defender; calcState.items.defender = tempItems;
        renderCalcUI();
    } catch (err) { alert("Swap error: " + err.message); }
}

function getCalcStat(role, statName) {
    const pkmn = calcState[role]; 
    if (!pkmn) return 0;
    const base = pkmn[statName]; 
    const sp = calcState.sp[role][statName];
    if (statName === 'hp') return base + 75 + sp;
    
    let val = base + 20 + sp;
    const nature = naturesList[calcState.natures[role]];
    if (nature.plus === statName) val = Math.floor(val * 1.1);
    if (nature.minus === statName) val = Math.floor(val * 0.9);
    return val;
}

window.applyMoveBoosts = function(moveName, event) {
    try {
        event.stopPropagation(); 
        const moveData = offlineMoves.find(m => m.name === moveName);
        const boosts = getDynamicMoveBoosts(moveData);
        if (!boosts) return;
        
        const attackerAbility = calcState.abilities.attacker;

        for (let stat in boosts) {
            let change = boosts[stat];
            
            // --- ABILITY INTERCEPTIONS ---
            if (attackerAbility === 'contrary') {
                change = change * -1; // Reverse it!
            } else if (attackerAbility === 'simple') {
                change = change * 2; // Double it!
            }
            
            let current = calcState.stages.attacker[stat];
            current += change;
            
            // Cap at +6 or -6
            if (current > 6) current = 6; 
            if (current < -6) current = -6;
            
            calcState.stages.attacker[stat] = current;
        }
        renderCalcUI();
    } catch (err) { alert("Apply boost error: " + err.message); }
}


window.renderCalcUI = function() {
    ['attacker', 'defender'].forEach(role => {
        const btn = document.getElementById(`calc-${role}-btn`);
        const statsContainer = document.getElementById(`calc-${role}-stats`);
        const natureSelect = document.getElementById(`calc-${role}-nature`);
        
        // =====================================
        // ABILITY & ITEM UI LOGIC
        // =====================================
        const abilitySelect = document.getElementById(`calc-${role}-ability`);
        const itemBtn = document.getElementById(`calc-${role}-item-btn`);

        if (calcState[role] && abilitySelect) {
            abilitySelect.innerHTML = calcState[role].abilities.map(a => `<option value="${a.name}" ${calcState.abilities[role] === a.name ? 'selected' : ''}>${a.name.replace(/-/g, ' ')}</option>`).join('');
            abilitySelect.onchange = (e) => { calcState.abilities[role] = e.target.value; calculateDamage(); };
        } else if (abilitySelect) {
            abilitySelect.innerHTML = `<option value="None">No Ability</option>`;
        }

        if (itemBtn) {
            let displayItem = calcState.items[role] === 'None' ? 'No Item' : calcState.items[role].replace(/-/g, ' ');
            itemBtn.innerText = `Item: ${displayItem}`;
        }
        // =====================================
        
        if (natureSelect && natureSelect.options.length === 0) {
            for (const nat in naturesList) {
                const opt = document.createElement('option'); opt.value = nat; 
                opt.innerText = nat.charAt(0).toUpperCase() + nat.slice(1);
                natureSelect.appendChild(opt);
            }
        }
        
        if (natureSelect) natureSelect.value = calcState.natures[role];
        
        const oldLabel = document.getElementById(`nat-label-${role}`);
        if (oldLabel) oldLabel.remove();
        
        if (natureSelect) {
            const activeNatDesc = naturesList[calcState.natures[role]].desc;
            natureSelect.insertAdjacentHTML('afterend', `<div id="nat-label-${role}" style="text-align:center; font-size:11px; color:#FF9800; margin-top:-5px; margin-bottom:10px; font-weight:bold;">${activeNatDesc}</div>`);

            natureSelect.onchange = function() {
                calcState.natures.attacker = document.getElementById('calc-attacker-nature').value || 'serious';
                calcState.natures.defender = document.getElementById('calc-defender-nature').value || 'serious';
                renderCalcUI(); 
            };
        }

        if (calcState[role] && btn) {
            const spriteName = calcState[role].spriteId || calcState[role].name.replace(/[^a-z0-9]/g, '');
            btn.innerHTML = `<img src="https://play.pokemonshowdown.com/sprites/gen5/${spriteName}.png" style="width:40px; height:40px; margin-bottom:5px;" onerror="this.onerror=null; this.src='https://play.pokemonshowdown.com/sprites/gen5/substitute.png';"> <div style="text-transform:capitalize; line-height: 1.1;">${calcState[role].name.replace(/-/g, ' ')}</div>`;
            
            let statsHtml = '';
            const statLabels = {hp: 'HP', attack: 'Atk', defense: 'Def', spAtk: 'Sp.A', spDef: 'Sp.D', speed: 'Spe'};
            let totalSp = 0; for (let s in calcState.sp[role]) totalSp += calcState.sp[role][s];
            statsHtml += `<div style="text-align: center; color: #aaa; font-size: 10px; margin-bottom: 5px; font-weight: bold;">SP LEFT: <span style="color:#4CAF50;">${66 - totalSp}</span></div>`;

            for (let statName in statLabels) {
                const rawVal = getCalcStat(role, statName);
                const currentSp = calcState.sp[role][statName];
                let stageStr = ''; let finalValHtml = `<span class="calc-stat-final">${rawVal}</span>`;

                if (statName !== 'hp') {
                    const currentStage = calcState.stages[role][statName];
                    if (currentStage > 0) {
                        stageStr = ` <span style="color:#FF9800; font-size:10px;">[+${currentStage}]</span>`;
                        const boostedVal = Math.floor(rawVal * getStageMultiplier(currentStage));
                        finalValHtml = `<span class="calc-stat-final" style="color:#888; font-size:12px; margin-right:5px;">${rawVal} ➔</span><span class="calc-stat-final" style="color:#FF9800;">${boostedVal}</span>`;
                    } else if (currentStage < 0) {
                        stageStr = ` <span style="color:#2196F3; font-size:10px;">[${currentStage}]</span>`;
                        const boostedVal = Math.floor(rawVal * getStageMultiplier(currentStage));
                        finalValHtml = `<span class="calc-stat-final" style="color:#888; font-size:12px; margin-right:5px;">${rawVal} ➔</span><span class="calc-stat-final" style="color:#2196F3;">${boostedVal}</span>`;
                    }
                }

                statsHtml += `<div class="calc-stat-row" onclick="openStatEditModal('${role}', '${statName}')"><span class="calc-stat-label">${statLabels[statName]}${stageStr}</span><span class="calc-stat-sp">${currentSp > 0 ? '+' + currentSp : 0}</span><div style="text-align: right;">${finalValHtml}</div></div>`;
            }
            if (statsContainer) statsContainer.innerHTML = statsHtml;
        } else if (btn && statsContainer) {
            btn.innerHTML = `<span style="font-size: 24px;">⊕</span> Select`;
            statsContainer.innerHTML = `<div style="text-align:center; color:#666; padding: 20px 0; font-size: 12px; border: 1px dashed #444; border-radius: 8px;">Select Pokémon</div>`;
        }
    });
    calculateDamage(); 
}

let currentEditingRole = null; let currentEditingStat = null; let calcEditingMoveIndex = 0;
window.openStatEditModal = function(role, statName) {
    currentEditingRole = role; currentEditingStat = statName;
    const statDisplayNames = {hp: 'HP', attack: 'Attack', defense: 'Defense', spAtk: 'Sp. Attack', spDef: 'Sp. Defense', speed: 'Speed'};
    document.getElementById('stat-edit-title').innerText = `${role}: ${statDisplayNames[statName]}`;
    document.getElementById('stat-edit-stage-container').style.display = statName === 'hp' ? 'none' : 'block';
    syncStatEditUI('init');
    document.getElementById('stat-edit-modal-overlay').style.display = 'block'; setTimeout(() => document.getElementById('stat-edit-modal').classList.add('open'), 10);
}
window.closeStatEditModal = function() { document.getElementById('stat-edit-modal').classList.remove('open'); setTimeout(() => document.getElementById('stat-edit-modal-overlay').style.display = 'none', 300); }

window.adjustStatEdit = function(amount) { let currentVal = parseInt(document.getElementById('stat-edit-input').value) || 0; document.getElementById('stat-edit-input').value = currentVal + amount; syncStatEditUI('input'); }
window.adjustStatStage = function(amount) {
    let currentStage = calcState.stages[currentEditingRole][currentEditingStat];
    currentStage += amount;
    if (currentStage < -6) currentStage = -6; if (currentStage > 6) currentStage = 6;
    calcState.stages[currentEditingRole][currentEditingStat] = currentStage;
    const display = document.getElementById('stat-edit-stage-display');
    display.innerText = currentStage > 0 ? `+${currentStage}` : currentStage;
    display.style.color = currentStage > 0 ? '#FF9800' : (currentStage < 0 ? '#2196F3' : '#fff');
    renderCalcUI();
}

window.syncStatEditUI = function(source) {
    const inputEl = document.getElementById('stat-edit-input'); const sliderEl = document.getElementById('stat-edit-slider'); const leftEl = document.getElementById('stat-edit-left'); const stageDisplay = document.getElementById('stat-edit-stage-display');
    let val = 0;
    if (source === 'init') {
        val = calcState.sp[currentEditingRole][currentEditingStat];
        if (currentEditingStat !== 'hp') {
            let stage = calcState.stages[currentEditingRole][currentEditingStat];
            stageDisplay.innerText = stage > 0 ? `+${stage}` : stage;
            stageDisplay.style.color = stage > 0 ? '#FF9800' : (stage < 0 ? '#2196F3' : '#fff');
        }
    } else if (source === 'input') val = parseInt(inputEl.value) || 0;
    else if (source === 'slider') val = parseInt(sliderEl.value) || 0;
    
    if (val < 0) val = 0; if (val > 32) val = 32;
    let totalOtherSp = 0; for (let s in calcState.sp[currentEditingRole]) { if (s !== currentEditingStat) totalOtherSp += calcState.sp[currentEditingRole][s]; }
    if (totalOtherSp + val > 66) val = 66 - totalOtherSp;
    
    calcState.sp[currentEditingRole][currentEditingStat] = val;
    inputEl.value = val; sliderEl.value = val; leftEl.innerText = 66 - (totalOtherSp + val);
    renderCalcUI(); 
}

// ==========================================
// 13. GLOBAL MODAL & HISTORY MANAGER
// ==========================================
const modalObserver = new MutationObserver(() => {
    let anyOpen = false;
    document.querySelectorAll('.modal-overlay, #view-details').forEach(el => {
        if (window.getComputedStyle(el).display !== 'none') anyOpen = true;
    });
    document.body.style.overflow = anyOpen ? 'hidden' : ''; 
});

document.querySelectorAll('.modal-overlay, #view-details').forEach(el => {
    modalObserver.observe(el, { attributes: true, attributeFilter: ['style'] });
});

history.pushState({ page: 'main' }, '', '');
window.addEventListener('popstate', (e) => {
    let closedSomething = false;
    
    const viewDetailsEl = document.getElementById('view-details');
    if(viewDetailsEl && viewDetailsEl.style.display === 'block') {
        viewDetailsEl.style.display = 'none';
        closedSomething = true;
    }

    document.querySelectorAll('.bottom-modal.open').forEach(m => {
        m.classList.remove('open'); closedSomething = true;
    });
    
    setTimeout(() => {
        document.querySelectorAll('.modal-overlay').forEach(o => {
            if(window.getComputedStyle(o).display === 'block') { 
                o.style.display = 'none'; 
                closedSomething = true; 
            }
        });
    }, 10);
    
    if (closedSomething) {
        history.pushState({ page: 'main' }, '', ''); 
    }
});
// ==========================================
// 13. GLOBAL MODAL & HISTORY MANAGER
// ==========================================

// ... (Your MutationObserver code remains exactly the same) ...

try {
    history.pushState({ page: 'main' }, '', '');
} catch (e) {
    console.warn("History API blocked on local mobile file.");
}

window.addEventListener('popstate', (e) => {
    let closedSomething = false;
    
    const viewDetailsEl = document.getElementById('view-details');
    if(viewDetailsEl && viewDetailsEl.style.display === 'block') {
        viewDetailsEl.style.display = 'none';
        closedSomething = true;
    }

    document.querySelectorAll('.bottom-modal.open').forEach(m => {
        m.classList.remove('open'); closedSomething = true;
    });
    
    setTimeout(() => {
        document.querySelectorAll('.modal-overlay').forEach(o => {
            if(window.getComputedStyle(o).display === 'block') { 
                o.style.display = 'none'; 
                closedSomething = true; 
            }
        });
    }, 10);
    
    if (closedSomething) {
        try {
            history.pushState({ page: 'main' }, '', ''); 
        } catch (err) {}
    }
});
// ==========================================
// CALCULATOR POKEMON SELECTION MODAL
// ==========================================
let activeCalcRole = null;

window.openCalcSelectModal = function(role) {
    if (!offlineDatabase || offlineDatabase.length === 0) {
        alert("Wait! The database is empty. Go to the side menu and click 'Sync Database' first!");
        return;
    }
    activeCalcRole = role;
    
    document.getElementById('calc-select-modal-overlay-v2').style.display = 'block';
    
    const modalEl = document.getElementById('calc-select-modal-v2');
    if (modalEl) {
        modalEl.style.display = 'flex';
        modalEl.style.transform = 'translateY(0)'; 
    }
    
    // Reset search and filter when opened
    const searchBox = document.getElementById('calc-select-search-v2');
    if (searchBox) searchBox.value = '';
    const typeFilter = document.getElementById('calc-select-type-filter');
    if (typeFilter) typeFilter.value = 'all';
    
    window.renderCalcSelectList('', 'all');
};

// NEW TRIGGER HELPER
window.triggerCalcSelectFilter = function() {
    const searchEl = document.getElementById('calc-select-search-v2');
    const typeEl = document.getElementById('calc-select-type-filter-v2'); // Updated ID!
    
    const searchTerm = searchEl ? searchEl.value.toLowerCase().trim() : '';
    const typeVal = typeEl ? typeEl.value : 'all';
    
    window.renderCalcSelectList(searchTerm, typeVal);
};

window.renderCalcSelectList = function(searchTerm, typeFilter = 'all') {
    const listContainer = document.getElementById('calc-select-list-v2');
    if (!listContainer) return;
    
    let validPkmn = offlineDatabase || [];
    
    // 1. Filter by Text
    if (searchTerm) {
        validPkmn = validPkmn.filter(p => p && p.name && p.name.replace(/-/g, ' ').toLowerCase().includes(searchTerm));
    }

    // 2. Filter by Type (Bulletproof Data Check)
    if (typeFilter && typeFilter !== 'all') {
        const tf = typeFilter.toLowerCase().trim();
        validPkmn = validPkmn.filter(p => {
            if (!p || !p.types) return false;
            
            // If the database stored it as an Array: ["Grass", "Poison"]
            if (Array.isArray(p.types)) {
                return p.types.some(t => t.toLowerCase().trim() === tf);
            }
            
            // If the database stored it as a String: "Grass, Poison"
            if (typeof p.types === 'string') {
                return p.types.toLowerCase().includes(tf);
            }
            
            return false;
        });
    }
    
    let html = '';
    validPkmn.forEach(p => {
        if (!p || !p.name) return; 
        const safeNameDisplay = p.name.replace(/-/g, ' ');
        const safeNameFunction = p.name.replace(/'/g, "\\'");
        const spriteName = p.spriteId || p.name.replace(/[^a-z0-9]/g, '');
        
        let typeChips = '';
        if (Array.isArray(p.types)) {
            typeChips = p.types.map(t => `<span class="type-chip type-${t.toLowerCase()}" style="font-size: 10px; padding: 2px 6px; margin-right: 4px;">${t}</span>`).join('');
        } else if (typeof p.types === 'string') {
            // Just in case it's a string, we still want it to look pretty!
            typeChips = `<span class="type-chip type-${p.types.split(',')[0].toLowerCase().trim()}" style="font-size: 10px; padding: 2px 6px; margin-right: 4px;">${p.types}</span>`;
        }
        
        html += `
        <div style="display: flex; align-items: center; gap: 15px; padding: 10px; border-bottom: 1px solid #444; cursor: pointer;" onclick="window.selectCalcPokemon('${safeNameFunction}')">
            <img src="https://play.pokemonshowdown.com/sprites/gen5/${spriteName}.png" style="width: 40px; height: 40px;" loading="lazy" onerror="this.onerror=null; this.src='https://play.pokemonshowdown.com/sprites/gen5/substitute.png';">
            <div style="flex-grow: 1;">
                <div style="font-weight: bold; text-transform: capitalize; color: #fff; font-size: 16px; margin-bottom: 4px;">${safeNameDisplay}</div>
                <div>${typeChips}</div>
            </div>
        </div>`;
    });
    
    listContainer.innerHTML = html !== '' ? html : `<div style="padding:20px; text-align:center; color: #aaa;">No Pokémon found for that type.</div>`;
};

// V2 Search Listener
const calcSelectSearchEl = document.getElementById('calc-select-search-v2');
if (calcSelectSearchEl) {
    calcSelectSearchEl.addEventListener('input', window.triggerCalcSelectFilter);
}

window.closeCalcSelectModal = function() {
    const modalEl = document.getElementById('calc-select-modal');
    if (modalEl) {
        modalEl.classList.remove('open');
        modalEl.style.transform = ''; 
    }
    document.getElementById('calc-select-modal-overlay').style.display = 'none';
};

window.selectCalcPokemon = function(pokemonName) {
    const p = offlineDatabase.find(x => x && x.name === pokemonName);
    if (p) {
        calcState[activeCalcRole] = p; 
        calcState.sp[activeCalcRole] = {hp:0, attack:0, defense:0, spAtk:0, spDef:0, speed:0}; 
        calcState.stages[activeCalcRole] = {attack:0, defense:0, spAtk:0, spDef:0, speed:0};
        
        calcState.abilities[activeCalcRole] = p.abilities && p.abilities.length > 0 ? p.abilities[0].name : 'None';
        calcState.items[activeCalcRole] = 'None';

        if (activeCalcRole === 'attacker') calcState.attackerMoves = ['None', 'None', 'None', 'None']; else calcState.defenderMoves = ['None', 'None', 'None', 'None'];
        
        if (typeof renderCalcUI === 'function') renderCalcUI(); 
        window.closeCalcSelectModal();
    }
};

window.renderCalcSelectList = function(searchTerm) {
    let validPkmn = offlineDatabase || [];
    
    if (searchTerm) {
        validPkmn = validPkmn.filter(p => p && p.name && p.name.replace(/-/g, ' ').toLowerCase().includes(searchTerm));
    }
    
    let html = '';
    validPkmn.forEach(p => {
        // BULLETPROOF SHIELD: Skip any corrupted database entries silently!
        if (!p || !p.name) return; 
        
        const safeNameDisplay = p.name.replace(/-/g, ' ');
        const safeNameFunction = p.name.replace(/'/g, "\\'");
        const spriteName = p.spriteId || p.name.replace(/[^a-z0-9]/g, '');
        
        html += `
        <div style="display: flex; align-items: center; gap: 15px; padding: 10px; border-bottom: 1px solid #444; cursor: pointer;" onclick="window.selectCalcPokemon('${safeNameFunction}')">
            <img src="https://play.pokemonshowdown.com/sprites/gen5/${spriteName}.png" style="width: 40px; height: 40px;" loading="lazy" onerror="this.onerror=null; this.src='https://play.pokemonshowdown.com/sprites/gen5/substitute.png';">
            <div style="font-weight: bold; text-transform: capitalize; color: #fff; font-size: 16px;">${safeNameDisplay}</div>
        </div>`;
    });
    
    const listContainer = document.getElementById('calc-select-list');
    if (listContainer) listContainer.innerHTML = html;
};

// Search listener to actually make the search bar work!
if (calcSelectSearchEl) {
    calcSelectSearchEl.addEventListener('input', (e) => { 
        window.renderCalcSelectList(e.target.value.toLowerCase().trim()); 
    });
}


window.selectCalcPokemon = function(pokemonName) {
    const p = offlineDatabase.find(x => x.name === pokemonName);
    if (p) {
        calcState[activeCalcRole] = p; 
        calcState.sp[activeCalcRole] = {hp:0, attack:0, defense:0, spAtk:0, spDef:0, speed:0}; 
        calcState.stages[activeCalcRole] = {attack:0, defense:0, spAtk:0, spDef:0, speed:0};
        
        // Add safe defaults for items and abilities
        calcState.abilities[activeCalcRole] = p.abilities.length > 0 ? p.abilities[0].name : 'None';
        calcState.items[activeCalcRole] = 'None';

        if (activeCalcRole === 'attacker') calcState.attackerMoves = ['None', 'None', 'None', 'None']; else calcState.defenderMoves = ['None', 'None', 'None', 'None'];
        renderCalcUI(); 
        window.closeCalcSelectModal();
    }
};

// ==========================================
// CALCULATOR TEAM IMPORT MODAL (UPGRADED)
// ==========================================
let calcImportRole = null;
let currentCalcImportTab = 'active';

window.openCalcTeamImportModal = function(role) {
    calcImportRole = role;
    document.getElementById('calc-team-import-modal-overlay').style.display = 'block';
    switchCalcImportTab(currentCalcImportTab);
};

window.closeCalcTeamImportModal = function() {
    document.getElementById('calc-team-import-modal-overlay').style.display = 'none';
};

window.switchCalcImportTab = function(tab) {
    currentCalcImportTab = tab;
    ['active', 'saved', 'meta'].forEach(t => {
        document.getElementById(`calc-import-tab-${t}`).classList.remove('active');
        document.getElementById(`calc-import-tab-${t}`).style.background = 'none';
        document.getElementById(`calc-import-list-${t}`).style.display = 'none';
    });
    
    document.getElementById(`calc-import-tab-${tab}`).classList.add('active');
    document.getElementById(`calc-import-tab-${tab}`).style.background = '#333';
    document.getElementById(`calc-import-list-${tab}`).style.display = 'block';
    
    if (tab === 'active') renderCalcImportActive();
    if (tab === 'saved') renderCalcImportSaved();
    if (tab === 'meta') renderCalcImportMeta();
};

function generateImportRowHTML(member, onClickAction, customSubtitle = null) {
    const spriteName = member.data.spriteId || member.data.name.replace(/[^a-z0-9]/g, '');
    const subtitle = customSubtitle || `${member.nature.charAt(0).toUpperCase() + member.nature.slice(1)} | ${member.item.replace(/-/g, ' ')}`;
    return `
    <div style="display: flex; align-items: center; gap: 15px; padding: 10px; border-bottom: 1px solid #444; cursor: pointer; background: #2a2a2a; margin-bottom: 5px; border-radius: 8px;" onclick="${onClickAction}">
        <img src="https://play.pokemonshowdown.com/sprites/gen5/${spriteName}.png" style="width: 40px; height: 40px;" onerror="this.onerror=null; this.src='https://play.pokemonshowdown.com/sprites/gen5/substitute.png';">
        <div style="flex-grow: 1;">
            <div style="font-weight: bold; text-transform: capitalize; color: #fff; font-size: 16px;">${member.data.name.replace(/-/g, ' ')}</div>
            <div style="font-size: 12px; color: #aaa; text-transform: capitalize;">${subtitle}</div>
        </div>
        <div style="color: #4CAF50; font-size: 20px; font-weight: bold;">+</div>
    </div>`;
}

window.renderCalcImportActive = function() {
    let html = '';
    if (currentTeam.length === 0 || currentTeam.every(m => m === null)) {
        html = '<p style="text-align:center; color:#888; margin-top:20px;">Active team is empty.</p>';
    } else {
        currentTeam.forEach((member, idx) => {
            if (member) html += generateImportRowHTML(member, `importToCalcFromSource('active', ${idx})`);
        });
    }
    document.getElementById('calc-import-list-active').innerHTML = html;
};

window.renderCalcImportSaved = function() {
    let html = '';
    if (savedTeams.length === 0) {
        html = '<p style="text-align:center; color:#888; margin-top:20px;">No saved teams yet.</p>';
    } else {
        savedTeams.forEach((teamObj, tIdx) => {
            html += `<div style="background: #111; padding: 8px 10px; margin-top: 10px; font-weight: bold; border-radius: 5px; color: #2196F3;">${teamObj.name}</div>`;
            teamObj.team.forEach((member, mIdx) => {
                if (member) html += generateImportRowHTML(member, `importToCalcFromSource('saved', ${tIdx}, ${mIdx})`);
            });
        });
    }
    document.getElementById('calc-import-list-saved').innerHTML = html;
};

window.renderCalcImportMeta = function() {
    let html = '';
    const keys = Object.keys(metaThreats);
    if (keys.length === 0) {
        html = '<p style="text-align:center; color:#888; margin-top:20px;">No Meta Threats saved yet.</p>';
    } else {
        keys.forEach(key => {
            const group = metaThreats[key];
            const validBuilds = group.builds.map((b, i) => ({build: b, idx: i})).filter(x => x.build !== null);
            
            if (validBuilds.length > 0) {
                html += `<div style="background: #111; padding: 8px 10px; margin-top: 10px; font-weight: bold; border-radius: 5px; text-transform: capitalize; color: #9c27b0;">${group.speciesName.replace(/-/g, ' ')}</div>`;
                validBuilds.forEach(item => {
                    html += generateImportRowHTML(item.build, `importToCalcFromSource('meta', '${key}', ${item.idx})`, item.build.buildName);
                });
            }
        });
    }
    document.getElementById('calc-import-list-meta').innerHTML = html;
};

window.importToCalcFromSource = function(sourceType, param1, param2) {
    let member = null;
    if (sourceType === 'active') member = currentTeam[param1];
    if (sourceType === 'saved') member = savedTeams[param1].team[param2];
    if (sourceType === 'meta') member = metaThreats[param1].builds[param2];

    if (member) {
        calcState[calcImportRole] = member.data; 
        
        // Use JSON clone to ensure we don't accidentally mutate the saved threat's SP when tinkering in the calc!
        calcState.sp[calcImportRole] = member.sp ? JSON.parse(JSON.stringify(member.sp)) : {hp:0, attack:0, defense:0, spAtk:0, spDef:0, speed:0}; 
        calcState.natures[calcImportRole] = member.nature || 'serious'; 
        calcState.stages[calcImportRole] = {attack:0, defense:0, spAtk:0, spDef:0, speed:0};
        
        let safeAbility = member.ability ? member.ability.replace(/ /g, '-').toLowerCase() : 'None';
        let safeItem = member.item ? member.item.replace(/ /g, '-').toLowerCase() : 'None';
        
        calcState.abilities[calcImportRole] = safeAbility;
        calcState.items[calcImportRole] = safeItem;

        if (calcImportRole === 'attacker') calcState.attackerMoves = [...member.moves]; 
        else calcState.defenderMoves = [...member.moves];
        
        renderCalcUI(); 
        closeCalcTeamImportModal();
    }
};

// ==========================================
// CALCULATOR ITEM SELECTION MODAL
// ==========================================
let calcEditingItemRole = null;

window.openCalcItemModal = function(role) {
    if (!calcState[role]) return; 
    calcEditingItemRole = role; 
    document.getElementById('calc-item-modal-overlay').style.display = 'block'; 
    document.getElementById('calc-item-search').value = ''; 
    window.renderCalcItemList('');
};

window.closeCalcItemModal = function() { 
    document.getElementById('calc-item-modal-overlay').style.display = 'none'; 
};

window.selectCalcItem = function(itemName) { 
    calcState.items[calcEditingItemRole] = itemName; 
    if (typeof renderCalcUI === 'function') renderCalcUI(); 
    window.closeCalcItemModal(); 
};

window.renderCalcItemList = function(searchTerm) {
    let validItems = offlineItems || [];
    if (searchTerm) {
        validItems = validItems.filter(i => i.name.replace(/-/g, ' ').toLowerCase().includes(searchTerm));
    }
    
    let html = `<div onclick="window.selectCalcItem('None')" style="padding: 15px; border-bottom: 1px solid #444; cursor: pointer; color: #f44336; font-weight: bold; text-align: center;">Clear Item (None)</div>`;
    
    validItems.forEach(i => {
        html += `
        <div style="display: flex; align-items: center; gap: 15px; padding: 10px; border-bottom: 1px solid #444; cursor: pointer;" onclick="window.selectCalcItem('${i.name}')">
            <img src="https://play.pokemonshowdown.com/sprites/itemicons/${i.spriteId || 'unknown'}.png" style="width: 30px; height: 30px;" loading="lazy" onerror="this.style.display='none'">
            <div style="font-weight: bold; text-transform: capitalize; color: #fff;">${i.name.replace(/-/g, ' ')}</div>
        </div>`;
    });
    const listContainer = document.getElementById('calc-item-list');
    if (listContainer) listContainer.innerHTML = html;
};

// Search listeners for Item Modal
const calcItemSearch = document.getElementById('calc-item-search');
if (calcItemSearch) {
    calcItemSearch.addEventListener('input', (e) => { window.renderCalcItemList(e.target.value.toLowerCase().trim()); });
}

// ==========================================
// CALCULATOR MOVE MODAL
// ==========================================

window.openCalcMoveModal = function(idx) {
    if (!calcState.attacker) return; 
    calcEditingMoveIndex = idx; 
    document.getElementById('calc-move-modal-overlay').style.display = 'block'; 
    document.getElementById('calc-move-search').value = ''; 
    window.renderCalcMoveList('');
};

window.closeCalcMoveModal = function() { 
    document.getElementById('calc-move-modal-overlay').style.display = 'none'; 
};

window.selectCalcMove = function(moveName) { 
    calcState.attackerMoves[calcEditingMoveIndex] = moveName; 
    if (typeof renderCalcUI === 'function') renderCalcUI(); 
    window.closeCalcMoveModal(); 
};

window.renderCalcMoveList = function(searchTerm) {
    let validMoves = [];
    const showAll = document.getElementById('calc-move-toggle') ? document.getElementById('calc-move-toggle').checked : false;
    
    // Filter logic! If toggle is checked or no Pokemon selected, show all. Otherwise, filter by learnset.
    if (showAll || !calcState.attacker || !calcState.attacker.moves) {
        validMoves = offlineMoves || [];
    } else {
        validMoves = (offlineMoves || []).filter(m => calcState.attacker.moves.includes(m.name) || calcState.attacker.moves.includes(m.name.replace(/-/g, ' ')));
    }

    if (searchTerm) {
        validMoves = validMoves.filter(m => m.name.replace(/-/g, ' ').toLowerCase().includes(searchTerm) || m.type.toLowerCase().includes(searchTerm));
    } else {
        validMoves.sort((a, b) => a.name.localeCompare(b.name));
    }

    let html = `<div onclick="window.selectCalcMove('None')" style="padding: 15px; border-bottom: 1px solid #444; cursor: pointer; color: #f44336; font-weight: bold; text-align: center;">Clear Move (None)</div>`;
    
    validMoves.forEach(m => {
        let dmgClassColor = 'dmg-status'; 
        if(m.damage_class === 'physical') dmgClassColor = 'dmg-physical'; 
        if(m.damage_class === 'special') dmgClassColor = 'dmg-special';
        
        html += `
        <div class="detail-move-row" style="margin: 5px 10px; display: flex; align-items: center; gap: 10px; cursor: pointer;" onclick="window.selectCalcMove('${m.name.replace(/'/g, "\\'")}')">
            <div style="flex-grow: 1;">
                <div class="detail-move-header">
                    <div class="detail-move-name">${m.name.replace(/-/g, ' ')}</div>
                    <div class="detail-move-stat">${m.power}</div>
                    <div class="detail-move-stat">${m.accuracy}</div>
                    <div class="detail-move-stat" style="text-align: right;">${m.pp}</div>
                </div>
                <div class="detail-move-tags">
                    <span class="type-chip type-${m.type}" style="margin: 0;">${m.type}</span>
                    <span class="dmg-class ${dmgClassColor}">${m.damage_class}</span>
                </div>
            </div>
        </div>`;
    });
    
    const listContainer = document.getElementById('calc-move-list');
    if (listContainer) listContainer.innerHTML = html;
};

// ==========================================
// CALCULATOR POKEMON SELECTION MODAL (V2)
// ==========================================

window.openCalcSelectModal = function(role) {
    if (!offlineDatabase || offlineDatabase.length === 0) {
        alert("Wait! The database is empty. Go to the side menu and click 'Sync Database' first!");
        return;
    }
    activeCalcRole = role;
    
    document.getElementById('calc-select-modal-overlay-v2').style.display = 'block';
    
    const modalEl = document.getElementById('calc-select-modal-v2');
    if (modalEl) {
        modalEl.style.display = 'flex';
        modalEl.style.transform = 'translateY(0)'; 
    }
    
    // Reset search and filter when opened (using V2 IDs!)
    const searchBox = document.getElementById('calc-select-search-v2');
    if (searchBox) searchBox.value = '';
    
    const typeFilter = document.getElementById('calc-select-type-filter-v2');
    if (typeFilter) typeFilter.value = 'all';
    
    window.renderCalcSelectList('', 'all');
};

// NEW TRIGGER HELPER
window.closeCalcSelectModal = function() {
    document.getElementById('calc-select-modal-overlay-v2').style.display = 'none';
};

window.selectCalcPokemon = function(pokemonName) {
    const p = offlineDatabase.find(x => x && x.name === pokemonName);
    if (p) {
        calcState[activeCalcRole] = p; 
        calcState.sp[activeCalcRole] = {hp:0, attack:0, defense:0, spAtk:0, spDef:0, speed:0}; 
        calcState.stages[activeCalcRole] = {attack:0, defense:0, spAtk:0, spDef:0, speed:0};
        
        calcState.abilities[activeCalcRole] = p.abilities && p.abilities.length > 0 ? p.abilities[0].name : 'None';
        calcState.items[activeCalcRole] = 'None';

        if (activeCalcRole === 'attacker') calcState.attackerMoves = ['None', 'None', 'None', 'None']; else calcState.defenderMoves = ['None', 'None', 'None', 'None'];
        
        if (typeof renderCalcUI === 'function') renderCalcUI(); 
        window.closeCalcSelectModal();
    }
};

window.renderCalcSelectList = function(searchTerm) {
    const listContainer = document.getElementById('calc-select-list-v2');
    if (!listContainer) return;
    
    let validPkmn = offlineDatabase || [];
    
    // DIAGNOSTIC TRAP
    if (validPkmn.length > 0 && (!validPkmn[0] || !validPkmn[0].name)) {
        listContainer.innerHTML = `<div style="padding: 20px; color: #FF9800;">Data Mismatch: ${JSON.stringify(validPkmn[0]).substring(0, 100)}</div>`;
        return;
    }

    if (searchTerm) {
        validPkmn = validPkmn.filter(p => p && p.name && p.name.replace(/-/g, ' ').toLowerCase().includes(searchTerm));
    }
    
    let html = '';
    validPkmn.forEach(p => {
        if (!p || !p.name) return; 
        const safeNameDisplay = p.name.replace(/-/g, ' ');
        const safeNameFunction = p.name.replace(/'/g, "\\'");
        const spriteName = p.spriteId || p.name.replace(/[^a-z0-9]/g, '');
        
        html += `
        <div style="display: flex; align-items: center; gap: 15px; padding: 10px; border-bottom: 1px solid #444; cursor: pointer;" onclick="window.selectCalcPokemon('${safeNameFunction}')">
            <img src="https://play.pokemonshowdown.com/sprites/gen5/${spriteName}.png" style="width: 40px; height: 40px;" loading="lazy" onerror="this.onerror=null; this.src='https://play.pokemonshowdown.com/sprites/gen5/substitute.png';">
            <div style="font-weight: bold; text-transform: capitalize; color: #fff; font-size: 16px;">${safeNameDisplay}</div>
        </div>`;
    });
    
    listContainer.innerHTML = html !== '' ? html : `<div style="padding:20px; text-align:center;">No Pokémon found.</div>`;
};


if (calcSelectSearchEl) {
    calcSelectSearchEl.addEventListener('input', (e) => { 
        window.renderCalcSelectList(e.target.value.toLowerCase().trim()); 
    });
}

// Search listeners for Move Modal
const calcMoveSearch = document.getElementById('calc-move-search');
if (calcMoveSearch) {
    calcMoveSearch.addEventListener('input', (e) => { window.renderCalcMoveList(e.target.value.toLowerCase().trim()); });
}
// ==========================================
// 14. META THREAT ENGINE
// ==========================================

window.openMetaThreatSaveModal = function() {
    document.getElementById('meta-threat-save-overlay').style.display = 'block';
    setTimeout(() => document.getElementById('meta-threat-save-modal').classList.add('open'), 10);
    document.getElementById('meta-threat-name-input').value = '';
};

window.closeMetaThreatSaveModal = function() {
    document.getElementById('meta-threat-save-modal').classList.remove('open');
    setTimeout(() => document.getElementById('meta-threat-save-overlay').style.display = 'none', 300);
};

window.executeSaveMetaThreat = function() {
    if (editingSlotIndex === null) return;
    
    // Grab the current unsaved state from the modal UI directly, 
    // ensuring we save exactly what the user is looking at.
    const member = currentTeam[editingSlotIndex];
    if (!member) return;

    // Apply the active dropdowns from the edit modal to the object
    member.ability = document.getElementById('edit-ability').value;
    member.nature = document.getElementById('edit-nature').value;

    const buildName = document.getElementById('meta-threat-name-input').value.trim() || "Standard Build";
    
    // Group by baseId so Megas, Alolans, and base forms all sit in the same folder
    const groupKey = member.data.baseId || member.data.id;

    if (!metaThreats[groupKey]) {
        // Initialize an empty 6-slot array just like a Teambuilder team!
        metaThreats[groupKey] = {
            speciesName: member.data.speciesName || member.data.name,
            builds: [null, null, null, null, null, null]
        };
    }

    // Find the first empty slot in this Pokémon's group
    const emptyIndex = metaThreats[groupKey].builds.findIndex(b => b === null);
    
    if (emptyIndex === -1) {
        alert("You already have 6 builds saved for this Pokémon! You must delete one before adding another.");
        return;
    }

    // Create a deep clone so future edits to the teambuilder don't mutate the saved threat
    const buildToSave = JSON.parse(JSON.stringify(member));
    buildToSave.buildName = buildName; // Attach the custom tag

    // Save to memory and LocalStorage
    metaThreats[groupKey].builds[emptyIndex] = buildToSave;
    localStorage.setItem('championsMetaThreats', JSON.stringify(metaThreats));
    
    alert(`"${buildName}" saved successfully under ${metaThreats[groupKey].speciesName.replace(/-/g, ' ').toUpperCase()}!`);
    closeMetaThreatSaveModal();
};
