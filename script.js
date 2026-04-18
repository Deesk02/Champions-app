// ==========================================
// 1. HTML ELEMENTS & APP STATE
// ==========================================

// Main Interface Elements
const toggleBtn = document.getElementById('menu-toggle');
const navDrawer = document.getElementById('nav-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const headerTitle = document.getElementById('header-title');
const settingsBtn = document.getElementById('settings-btn');
const settingsMenu = document.getElementById('settings-menu');

// Form Filters
const toggleMega = document.getElementById('toggle-mega');
const toggleGmax = document.getElementById('toggle-gmax');
const toggleRegional = document.getElementById('toggle-regional');
const toggleAlt = document.getElementById('toggle-alt');

// Sync & Search Elements
const syncAllBtn = document.getElementById('sync-all-btn'); 
const statusText = document.getElementById('status');
const progressContainer = document.getElementById('sync-progress-container');
const progressBar = document.getElementById('sync-progress-bar');
const resultsDiv = document.getElementById('search-results');
const tagInput = document.getElementById('tag-input');
const activeTagsContainer = document.getElementById('active-tags');

// View Containers
const tabBtns = document.querySelectorAll('.drawer-btn');
const views = [ 
    document.getElementById('view-pokemon'), 
    document.getElementById('view-abilities'), 
    document.getElementById('view-moves'), 
    document.getElementById('view-items'), 
    document.getElementById('view-teambuilder'),
    document.getElementById('view-calculator')
];

// Detailed View Elements (Globally defined to prevent undefined errors)
const viewDetails = document.getElementById('view-details');
const detailHeader = document.getElementById('detail-header'); 
const detailName = document.getElementById('detail-name'); 
const detailId = document.getElementById('detail-id'); 
const detailTypes = document.getElementById('detail-types'); 
const detailSprite = document.getElementById('detail-sprite');
const detailStats = document.getElementById('detail-stats'); 
const detailAbilities = document.getElementById('detail-abilities');
const detailTabInfo = document.getElementById('detail-tab-info'); 
const detailTabMoves = document.getElementById('detail-tab-moves'); 
const detailMovesList = document.getElementById('detail-moves-list');
const detailNavInfo = document.getElementById('detail-nav-info'); 
const detailNavMoves = document.getElementById('detail-nav-moves');
const detailFormsContainer = document.getElementById('detail-forms-container'); 
const detailFormsList = document.getElementById('detail-forms-list');
const detailEvoContainer = document.getElementById('detail-evo-container'); 
const detailEvoList = document.getElementById('detail-evo-list');

// Sub-view Elements
const abilitySearch = document.getElementById('ability-search'); 
const abilityResultsDiv = document.getElementById('ability-results');
const movesSearch = document.getElementById('moves-search'); 
const movesResultsDiv = document.getElementById('moves-results');
const itemsSearch = document.getElementById('items-search'); 
const itemsResultsDiv = document.getElementById('items-results');

// Offline Databases
let offlineDatabase = []; 
let offlineAbilities = []; 
let offlineMoves = []; 
let offlineItems = []; 
let offlineEvolutions = []; 
let offlineOverrides = {}; 

// Search & Rendering State
let activeTags = []; 
let masterSearchList = [];
let currentDisplayedPokemon = []; 
let currentRenderCount = 0; 
const CHUNK_SIZE = 50;            

// Team Builder State
let currentTeam = [null, null, null, null, null, null]; 
let activeSlotIndex = null; 
let savedTeams = JSON.parse(localStorage.getItem('championsSavedTeams')) || [];

// Regulations State
let regulations = JSON.parse(localStorage.getItem('championsRegulations')) || [];
let activeRegulationId = localStorage.getItem('championsActiveReg') || '';

// App UI State
let currentSortMode = 'id'; 
let isDescending = false; 
window.currentDetailedPokemon = null; 
let currentTopType = ''; 


// ==========================================
// 2. UI NAVIGATION & DRAWER LOGIC
// ==========================================

function closeDrawer() { 
    navDrawer.classList.remove('open'); 
    drawerOverlay.classList.remove('visible'); 
}

toggleBtn.addEventListener('click', () => { 
    navDrawer.classList.toggle('open'); 
    drawerOverlay.classList.toggle('visible'); 
});

drawerOverlay.addEventListener('click', closeDrawer);

settingsBtn.addEventListener('click', () => { 
    settingsMenu.style.display = settingsMenu.style.display === 'none' ? 'flex' : 'none'; 
});

[toggleMega, toggleGmax, toggleRegional, toggleAlt].forEach(checkbox => {
    checkbox.addEventListener('change', () => { 
        liveFilterPokemon(tagInput.value.toLowerCase().trim()); 
    });
});

function switchView(tabId) {
    views.forEach(v => { 
        if(v) v.classList.remove('active'); 
    }); 
    
    tabBtns.forEach(b => b.classList.remove('active'));
    
    if(tabId !== 'tab-pokemon-btn') resultsDiv.innerHTML = ''; 
    if(tabId !== 'tab-abilities-btn') abilityResultsDiv.innerHTML = ''; 
    if(tabId !== 'tab-moves-btn') movesResultsDiv.innerHTML = ''; 
    if(tabId !== 'tab-items-btn') itemsResultsDiv.innerHTML = '';
    
    const activeBtn = document.getElementById(tabId); 
    if(activeBtn) { 
        activeBtn.classList.add('active'); 
        headerTitle.innerText = activeBtn.innerText.replace(/[◓✦⚔🎒⊕🧮]/g, '').trim(); 
    }

    if(tabId === 'tab-pokemon-btn') { 
        document.getElementById('view-pokemon').classList.add('active'); 
        liveFilterPokemon(tagInput.value.toLowerCase().trim()); 
        document.getElementById('fab-container').style.display = 'flex'; 
    } else { 
        document.getElementById('fab-container').style.display = 'none'; 
    }

    if(tabId === 'tab-abilities-btn') { 
        document.getElementById('view-abilities').classList.add('active'); 
        displayAbilities(offlineAbilities); 
    }
    
    if(tabId === 'tab-moves-btn') { 
        document.getElementById('view-moves').classList.add('active'); 
        displayMoves(offlineMoves); 
    }
    
    if(tabId === 'tab-items-btn') { 
        document.getElementById('view-items').classList.add('active'); 
        displayItems(offlineItems); 
    }
    
    if(tabId === 'tab-teambuilder-btn') { 
        document.getElementById('view-teambuilder').classList.add('active'); 
        renderTeamGrid(); 
    }
    
    if(tabId === 'tab-calculator-btn') { 
        document.getElementById('view-calculator').classList.add('active'); 
        if(typeof renderCalcUI === 'function') renderCalcUI(); 
    }
    
    closeDrawer();
}

tabBtns.forEach(btn => btn.addEventListener('click', (e) => switchView(e.currentTarget.id)));


// ==========================================
// 3. INDEXED-DB ENGINE & LOADERS
// ==========================================

const DB_NAME = 'ChampionsDB'; 
const DB_VERSION = 5; 

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => { 
            const db = event.target.result; 
            if(!db.objectStoreNames.contains('pokemon')) db.createObjectStore('pokemon'); 
            if(!db.objectStoreNames.contains('abilities')) db.createObjectStore('abilities'); 
            if(!db.objectStoreNames.contains('moves')) db.createObjectStore('moves'); 
            if(!db.objectStoreNames.contains('items')) db.createObjectStore('items'); 
            if(!db.objectStoreNames.contains('evolutions')) db.createObjectStore('evolutions'); 
            if(!db.objectStoreNames.contains('overrides')) db.createObjectStore('overrides');
            if(db.objectStoreNames.contains('dexes')) db.deleteObjectStore('dexes'); 
        };
        request.onsuccess = () => resolve(request.result); 
        request.onerror = () => reject(request.error);
    });
}

async function saveToDB(storeName, data, key = 'master_key') { 
    const db = await initDB(); 
    return new Promise((resolve, reject) => { 
        const tx = db.transaction(storeName, 'readwrite'); 
        const store = tx.objectStore(storeName); 
        store.put(data, key); 
        tx.oncomplete = () => resolve(); 
        tx.onerror = () => reject(tx.error); 
    }); 
}

async function loadFromDB(storeName, key = 'master_key') { 
    const db = await initDB(); 
    return new Promise((resolve, reject) => { 
        const tx = db.transaction(storeName, 'readonly'); 
        const store = tx.objectStore(storeName); 
        const request = store.get(key); 
        request.onsuccess = () => resolve(request.result); 
        request.onerror = () => reject(request.error); 
    }); 
}

async function loadOfflineData() { 
    const savedData = await loadFromDB('pokemon'); 
    if (savedData && savedData.length > 0) { 
        offlineDatabase = savedData; 
        statusText.innerText = `Ready (${offlineDatabase.length} PKMN)`; 
        tagInput.disabled = false; 
        populateTopFilters(); 
        buildMasterList(); 
    } else { 
        statusText.innerText = "Offline. Please Sync."; 
    } 
}

async function loadOfflineAbilities() { 
    const saved = await loadFromDB('abilities'); 
    if (saved && saved.length > 0) { 
        offlineAbilities = saved; 
        abilitySearch.disabled = false; 
        buildMasterList(); 
    } 
}

async function loadOfflineMoves() { 
    const saved = await loadFromDB('moves'); 
    if (saved && saved.length > 0) { 
        offlineMoves = saved; 
        movesSearch.disabled = false; 
        buildMasterList(); 
    } 
}

async function loadOfflineItems() { 
    const saved = await loadFromDB('items'); 
    if (saved && saved.length > 0) { 
        offlineItems = saved; 
        itemsSearch.disabled = false; 
    } 
}

async function loadOfflineEvolutions() { 
    const saved = await loadFromDB('evolutions'); 
    if (saved) { 
        offlineEvolutions = saved; 
    } 
} 

async function loadOfflineOverrides() { 
    const saved = await loadFromDB('overrides'); 
    if (saved) { 
        offlineOverrides = saved; 
    } else { 
        offlineOverrides = {}; 
    } 
} 


// ==========================================
// 4. API FETCHERS
// ==========================================

const BATCH_SIZE = 25; 
const delay = ms => new Promise(res => setTimeout(res, ms)); 

async function fetchFromPokeAPI() {
    let myDatabase = []; 
    try {
        const countCheck = await fetch('https://pokeapi.co/api/v2/pokemon'); 
        const countData = await countCheck.json();
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${countData.count}`); 
        const data = await response.json();
        
        for (let i = 0; i < data.results.length; i += BATCH_SIZE) {
            statusText.innerText = `PKMN: ${Math.min(i + BATCH_SIZE, data.results.length)} / ${data.results.length}`; 
            progressBar.style.width = `${(Math.min(i + BATCH_SIZE, data.results.length) / data.results.length) * 100}%`;
            
            const batch = data.results.slice(i, i + BATCH_SIZE);
            const batchResults = await Promise.all(batch.map(async (item) => {
                try {
                    const pokeResponse = await fetch(item.url); 
                    const p = await pokeResponse.json();
                    
                    let baseId = p.id; 
                    if (p.species && p.species.url) { 
                        const urlParts = p.species.url.split('/'); 
                        baseId = parseInt(urlParts[urlParts.length - 2]); 
                    }
                    
                    let formType = 'base'; 
                    if (p.name.includes('-mega')) formType = 'mega'; 
                    else if (p.name.includes('-gmax')) formType = 'gmax'; 
                    else if (p.name.includes('-alola') || p.name.includes('-galar') || p.name.includes('-hisui') || p.name.includes('-paldea')) formType = 'regional'; 
                    else if (p.id > 10000) formType = 'alt'; 
                    
                    return { 
                        id: p.id, 
                        baseId: baseId, 
                        formType: formType, 
                        name: p.name, 
                        speciesName: p.species ? p.species.name : p.name, 
                        types: p.types.map(t => t.type.name), 
                        hp: p.stats[0].base_stat, 
                        attack: p.stats[1].base_stat, 
                        defense: p.stats[2].base_stat, 
                        spAtk: p.stats[3].base_stat, 
                        spDef: p.stats[4].base_stat, 
                        speed: p.stats[5].base_stat, 
                        abilities: p.abilities.map(a => ({ name: a.ability.name, isHidden: a.is_hidden })), 
                        moves: p.moves.map(m => m.move.name) 
                    };
                } catch(e) { 
                    console.warn('Failed to fetch PKMN:', item.name, e); 
                    return null; 
                }
            }));
            
            myDatabase.push(...batchResults.filter(Boolean));
            await delay(50); 
        }
        await saveToDB('pokemon', myDatabase); 
        await loadOfflineData();
    } catch (err) { 
        console.error("PKMN Fetch Error:", err); 
        throw err; 
    }
}

async function fetchEvolutionsFromPokeAPI() { 
    let myEvolutions = []; 
    try {
        const res = await fetch('https://pokeapi.co/api/v2/evolution-chain?limit=1000'); 
        const data = await res.json();
        
        function getEvoDetails(details) {
            if(!details || details.length === 0) return 'Base';
            let methods = details.map(d => {
                if (d.trigger?.name === 'level-up') { 
                    if (d.min_level) return `Lv. ${d.min_level}`; 
                    if (d.min_happiness) return `Friendship`; 
                    if (d.known_move) return `Knows ${d.known_move.name.replace(/-/g, ' ')}`; 
                    if (d.item) return `Holding ${d.item.name.replace(/-/g, ' ')}`; 
                    return `Level Up`; 
                } 
                return d.trigger?.name?.replace(/-/g, ' ') || 'Unknown';
            });
            return [...new Set(methods)].join(' OR ');
        }
        
        for (let i = 0; i < data.results.length; i += BATCH_SIZE) {
            statusText.innerText = `Evolutions: ${Math.min(i + BATCH_SIZE, data.results.length)} / ${data.results.length}`; 
            progressBar.style.width = `${(Math.min(i + BATCH_SIZE, data.results.length) / data.results.length) * 100}%`;
            
            const batch = data.results.slice(i, i + BATCH_SIZE);
            const batchResults = await Promise.all(batch.map(async (item) => {
                try { 
                    const evRes = await fetch(item.url); 
                    const evData = await evRes.json(); 
                    let chainNames = []; 
                    
                    function traverse(node, evoStr) { 
                        if(node?.species?.name) chainNames.push({ name: node.species.name, detail: evoStr }); 
                        if(node?.evolves_to) node.evolves_to.forEach(child => traverse(child, getEvoDetails(child.evolution_details))); 
                    } 
                    traverse(evData.chain, 'Base Form'); 
                    return chainNames; 
                } catch(e) { 
                    return null; 
                }
            }));
            
            myEvolutions.push(...batchResults.filter(Boolean));
            await delay(50);
        }
        await saveToDB('evolutions', myEvolutions); 
        await loadOfflineEvolutions();
    } catch (err) { 
        console.error("Evo Fetch Error:", err); 
        throw err; 
    }
}

async function fetchAbilitiesFromPokeAPI() { 
    let myAbilities = []; 
    try {
        const countCheck = await fetch('https://pokeapi.co/api/v2/ability'); 
        const countData = await countCheck.json(); 
        const response = await fetch(`https://pokeapi.co/api/v2/ability?limit=${countData.count}`); 
        const data = await response.json(); 
        
        for (let i = 0; i < data.results.length; i += BATCH_SIZE) { 
            statusText.innerText = `Abilities: ${Math.min(i + BATCH_SIZE, data.results.length)} / ${data.results.length}`; 
            progressBar.style.width = `${(Math.min(i + BATCH_SIZE, data.results.length) / data.results.length) * 100}%`; 
            
            const batch = data.results.slice(i, i + BATCH_SIZE); 
            const batchResults = await Promise.all(batch.map(async (item) => { 
                try { 
                    const abRes = await fetch(item.url); 
                    const abData = await abRes.json(); 
                    let engDesc = "No description."; 
                    const effectEntry = (abData.effect_entries || []).find(e => e.language.name === 'en'); 
                    
                    if (effectEntry) {
                        engDesc = effectEntry.short_effect || effectEntry.effect; 
                    } else { 
                        const flavor = (abData.flavor_text_entries || []).find(e => e.language.name === 'en'); 
                        if (flavor) engDesc = (flavor.flavor_text || flavor.text || "").replace(/\n|\f/g, ' '); 
                    } 
                    
                    return { id: abData.id, name: abData.name.replace(/-/g, ' '), description: engDesc }; 
                } catch(e) { return null; } 
            })); 
            
            myAbilities.push(...batchResults.filter(Boolean)); 
            await delay(50);
        } 
        await saveToDB('abilities', myAbilities); 
        await loadOfflineAbilities(); 
    } catch (err) { 
        console.error("Ability Fetch Error:", err); 
        throw err; 
    }
}

async function fetchMovesFromPokeAPI() { 
    let myMoves = []; 
    try {
        const countCheck = await fetch('https://pokeapi.co/api/v2/move'); 
        const countData = await countCheck.json(); 
        const response = await fetch(`https://pokeapi.co/api/v2/move?limit=${countData.count}`); 
        const data = await response.json(); 
        
        for (let i = 0; i < data.results.length; i += BATCH_SIZE) { 
            statusText.innerText = `Moves: ${Math.min(i + BATCH_SIZE, data.results.length)} / ${data.results.length}`; 
            progressBar.style.width = `${(Math.min(i + BATCH_SIZE, data.results.length) / data.results.length) * 100}%`; 
            
            const batch = data.results.slice(i, i + BATCH_SIZE); 
            const batchResults = await Promise.all(batch.map(async (item) => { 
                try { 
                    const mvRes = await fetch(item.url); 
                    const mvData = await mvRes.json(); 
                    let engDesc = "No description."; 
                    const effectEntry = (mvData.effect_entries || []).find(e => e.language.name === 'en'); 
                    
                    if (effectEntry) { 
                        engDesc = effectEntry.short_effect || effectEntry.effect; 
                        if (engDesc) engDesc = engDesc.replace(/\$effect_chance/g, mvData.effect_chance || ''); 
                    } else { 
                        const flavor = (mvData.flavor_text_entries || []).find(e => e.language.name === 'en'); 
                        if (flavor) engDesc = (flavor.flavor_text || flavor.text || "").replace(/\n|\f/g, ' '); 
                    } 
                    
                    return { 
                        id: mvData.id, 
                        name: mvData.name.replace(/-/g, ' '), 
                        type: mvData.type?.name || 'normal', 
                        damage_class: mvData.damage_class ? mvData.damage_class.name : 'status', 
                        power: mvData.power || '-', 
                        accuracy: mvData.accuracy || '-', 
                        pp: mvData.pp || '-', 
                        description: engDesc 
                    }; 
                } catch(e) { return null; } 
            })); 
            
            myMoves.push(...batchResults.filter(Boolean)); 
            await delay(50);
        } 
        await saveToDB('moves', myMoves); 
        await loadOfflineMoves(); 
    } catch (err) { 
        console.error("Move Fetch Error:", err); 
        throw err; 
    }
}

async function fetchItemsFromPokeAPI() { 
    let myItems = []; 
    try {
        const countCheck = await fetch('https://pokeapi.co/api/v2/item'); 
        const countData = await countCheck.json(); 
        const response = await fetch(`https://pokeapi.co/api/v2/item?limit=${countData.count}`); 
        const data = await response.json(); 
        
        for (let i = 0; i < data.results.length; i += BATCH_SIZE) { 
            statusText.innerText = `Items: ${Math.min(i + BATCH_SIZE, data.results.length)} / ${data.results.length}`; 
            progressBar.style.width = `${(Math.min(i + BATCH_SIZE, data.results.length) / data.results.length) * 100}%`; 
            
            const batch = data.results.slice(i, i + BATCH_SIZE); 
            const batchResults = await Promise.all(batch.map(async (item) => { 
                try { 
                    const itRes = await fetch(item.url); 
                    const itData = await itRes.json(); 
                    let engDesc = "No description."; 
                    const effectEntry = (itData.effect_entries || []).find(e => e.language.name === 'en'); 
                    
                    if (effectEntry) {
                        engDesc = effectEntry.short_effect || effectEntry.effect; 
                    } else { 
                        const flavor = (itData.flavor_text_entries || []).find(e => e.language.name === 'en'); 
                        if (flavor) engDesc = (flavor.text || flavor.flavor_text || "").replace(/\n|\f/g, ' '); 
                    } 
                    
                    return { id: itData.id, name: itData.name.replace(/-/g, ' '), cost: itData.cost || 0, description: engDesc }; 
                } catch(e) { return null; } 
            })); 
            
            myItems.push(...batchResults.filter(Boolean)); 
            await delay(50);
        } 
        await saveToDB('items', myItems); 
        await loadOfflineItems(); 
    } catch (err) { 
        console.error("Item Fetch Error:", err); 
        throw err; 
    }
}

async function syncAllData() { 
    if(!syncAllBtn) return; 
    syncAllBtn.disabled = true; 
    if(progressContainer) progressContainer.style.display = 'block'; 
    try { 
        statusText.innerText = "Starting sync...";
        await fetchFromPokeAPI(); 
        await fetchAbilitiesFromPokeAPI(); 
        await fetchMovesFromPokeAPI(); 
        await fetchItemsFromPokeAPI(); 
        await fetchEvolutionsFromPokeAPI(); 
        statusText.innerText = "All data fully synced!"; 
    } catch (error) { 
        console.error("Sync Process Failed:", error);
        statusText.innerText = "Sync failed. Check the console."; 
    } 
    
    syncAllBtn.disabled = false; 
    setTimeout(() => { 
        if(progressContainer) progressContainer.style.display = 'none'; 
        if(progressBar) progressBar.style.width = '0%'; 
    }, 2000); 
}
// ==========================================
// 5. SEARCH, TAGS, & TOP FILTERS
// ==========================================

function populateTopFilters() {
    const typeListEl = document.getElementById('filter-type-list');
    if (typeListEl) { 
        const types = ["normal", "fighting", "flying", "poison", "ground", "rock", "bug", "ghost", "steel", "fire", "water", "grass", "electric", "psychic", "ice", "dragon", "dark", "fairy"]; 
        let typeHtml = `<button class="filter-modal-btn" style="background: #555; color: #fff;" onclick="selectTopFilter('type', '')">ALL TYPES</button>`; 
        
        types.forEach(t => { 
            typeHtml += `<button class="filter-modal-btn type-${t}" style="background: rgba(255,255,255,0.1);" onclick="selectTopFilter('type', '${t}')">${t}</button>`; 
        }); 
        
        typeListEl.innerHTML = typeHtml; 
    }
    
    const regListEl = document.getElementById('regulation-list-container');
    if (regListEl) {
        let regHtml = `<button class="filter-modal-btn" style="background: #555; color: #fff;" onclick="selectTopFilter('regulation', '')">ANY REGULATION</button>`;
        
        regulations.forEach(r => {
            const isActive = activeRegulationId === r.id;
            regHtml += `<button class="filter-modal-btn" style="background: ${isActive ? '#4CAF50' : '#444'}; color: #fff;" onclick="selectTopFilter('regulation', '${r.id}')">${r.name}</button>`;
        });
        
        regListEl.innerHTML = regHtml;
        
        if (activeRegulationId) {
            const activeReg = regulations.find(r => r.id === activeRegulationId);
            if (activeReg) document.getElementById('btn-filter-regulation').innerHTML = `${activeReg.name} <span>▼</span>`;
        }
    }
}

window.selectTopFilter = function(filterType, val) {
    if (filterType === 'type') { 
        currentTopType = val; 
        document.getElementById('btn-filter-type').innerHTML = val ? `${val} <span>▼</span>` : `All Types <span>▼</span>`; 
        document.getElementById('btn-filter-type').classList.toggle('active', val !== ''); 
    }
    
    if (filterType === 'regulation') { 
        activeRegulationId = val; 
        localStorage.setItem('championsActiveReg', val);
        const activeReg = regulations.find(r => r.id === val);
        document.getElementById('btn-filter-regulation').innerHTML = activeReg ? `${activeReg.name} <span>▼</span>` : `Any Regulation <span>▼</span>`; 
        document.getElementById('btn-filter-regulation').classList.toggle('active', val !== '');
        populateTopFilters(); 
    }
    
    closeTopFilterModals(); 
    liveFilterPokemon(tagInput.value.toLowerCase().trim());
};

window.openTopFilterModal = function(modalId) { 
    const overlay = document.getElementById(`${modalId}-overlay`); 
    const modal = document.getElementById(modalId); 
    overlay.style.display = 'block'; 
    setTimeout(() => modal.classList.add('open'), 10); 
};

window.closeTopFilterModals = function() { 
    ['type-modal', 'regulation-modal'].forEach(modalId => { 
        const modal = document.getElementById(modalId); 
        const overlay = document.getElementById(`${modalId}-overlay`); 
        if (modal) modal.classList.remove('open'); 
        if (overlay) setTimeout(() => overlay.style.display = 'none', 300); 
    }); 
};

['type-modal-overlay', 'regulation-modal-overlay'].forEach(id => { 
    const el = document.getElementById(id); 
    if (el) {
        el.addEventListener('click', (e) => { 
            if(e.target === el) closeTopFilterModals(); 
        }); 
    }
});

function buildMasterList() { 
    masterSearchList = []; 
    const types = ["normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"].map(t => ({text: t, tag: t, label: 'Type'})); 
    
    masterSearchList.push(...types); 
    
    if(offlineDatabase && offlineDatabase.length > 0) {
        masterSearchList.push(...offlineDatabase.map(p => ({text: p.name.replace(/-/g, ' '), tag: p.name, label: 'Pokémon'}))); 
    }
    
    if(offlineAbilities && offlineAbilities.length > 0) {
        masterSearchList.push(...offlineAbilities.map(a => ({text: a.name, tag: `ability:${a.name.replace(/ /g, '-')}`, label: 'Ability'}))); 
    }
    
    if(offlineMoves && offlineMoves.length > 0) {
        masterSearchList.push(...offlineMoves.map(m => ({text: m.name, tag: `move:${m.name.replace(/ /g, '-')}`, label: 'Move'}))); 
    }
}

tagInput.addEventListener('input', (e) => { 
    const val = e.target.value.toLowerCase().trim(); 
    liveFilterPokemon(val); 
});

tagInput.addEventListener('keypress', (e) => { 
    if (e.key === 'Enter') { 
        e.preventDefault(); 
        addTag(); 
    } 
});

function addTag(exactValue = null) { 
    const val = exactValue || tagInput.value.toLowerCase().trim(); 
    if (val !== '' && !activeTags.includes(val)) { 
        activeTags.push(val); 
        tagInput.value = ''; 
        renderTags(); 
        liveFilterPokemon(''); 
    } 
}

function renderTags() { 
    activeTagsContainer.innerHTML = ''; 
    activeTags.forEach(tag => { 
        let displayTag = tag; 
        let bgColor = "#f44336"; 
        
        if (tag.startsWith('move:')) { 
            displayTag = '⚔ ' + tag.replace('move:', '').replace(/-/g, ' '); 
            bgColor = "#9c27b0"; 
        } else if (tag.startsWith('ability:')) { 
            displayTag = '✦ ' + tag.replace('ability:', '').replace(/-/g, ' '); 
            bgColor = "#ff9800"; 
        } 
        
        activeTagsContainer.innerHTML += `
        <span style="background-color: ${bgColor}; color: white; padding: 5px 12px; border-radius: 20px; display: flex; align-items: center; gap: 8px; font-size: 14px; text-transform: capitalize;">
            ${displayTag}
            <button onclick="removeTag('${tag}')" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer; padding: 0;">&times;</button>
        </span>`; 
    }); 
}

window.removeTag = function(tagToRemove) { 
    activeTags = activeTags.filter(t => t !== tagToRemove); 
    renderTags(); 
    liveFilterPokemon(tagInput.value.toLowerCase().trim()); 
};

function liveFilterPokemon(currentInput = '') {
    let baseList = offlineDatabase;
    const showMega = toggleMega.checked; 
    const showGmax = toggleGmax.checked; 
    const showRegional = toggleRegional.checked; 
    const showAlt = toggleAlt.checked;
    
    baseList = baseList.filter(p => { 
        if (p.formType === 'mega' && !showMega) return false; 
        if (p.formType === 'gmax' && !showGmax) return false; 
        if (p.formType === 'regional' && !showRegional) return false; 
        if (p.formType === 'alt' && !showAlt) return false; 
        return true; 
    });
    
    if (activeRegulationId) {
        const activeReg = regulations.find(r => r.id === activeRegulationId);
        if (activeReg && activeReg.pokemon && activeReg.pokemon.length > 0) {
            baseList = baseList.filter(p => activeReg.pokemon.includes(p.name));
        }
    }

    if (activeTags.length > 0) { 
        baseList = baseList.filter(pokemon => { 
            return activeTags.every(tag => { 
                if (tag.startsWith('move:')) { 
                    const searchMove = tag.replace('move:', ''); 
                    const effectiveMoves = getEffectiveMoves(pokemon); 
                    return effectiveMoves.includes(searchMove); 
                } 
                if (tag.startsWith('ability:')) { 
                    const searchAbility = tag.replace('ability:', ''); 
                    return pokemon.abilities.some(a => a.name === searchAbility); 
                } 
                return pokemon.name.toLowerCase().includes(tag) || pokemon.types.some(t => t.toLowerCase() === tag) || pokemon.abilities.some(a => a.name.toLowerCase().includes(tag)); 
            }); 
        }); 
    }
    
    let liveFiltered = baseList;
    if (currentInput) { 
        liveFiltered = baseList.filter(pokemon => { 
            return pokemon.name.toLowerCase().includes(currentInput) || pokemon.types.some(t => t.toLowerCase().includes(currentInput)) || pokemon.abilities.some(a => a.name.toLowerCase().includes(currentInput)); 
        }); 
    }

    if (currentTopType) {
        liveFiltered = liveFiltered.filter(p => p.types.includes(currentTopType));
    }

    liveFiltered.sort((a, b) => {
        if (currentInput && currentSortMode === 'id') { 
            const aName = a.name.toLowerCase(); 
            const bName = b.name.toLowerCase(); 
            if (aName.startsWith(currentInput) && !bName.startsWith(currentInput)) return -1; 
            if (!aName.startsWith(currentInput) && bName.startsWith(currentInput)) return 1; 
        }
        
        let valA, valB;
        if (currentSortMode === 'id') { 
            if (a.baseId !== b.baseId) return isDescending ? b.baseId - a.baseId : a.baseId - b.baseId; 
            return a.id - b.id; 
        } 
        else if (currentSortMode === 'name') { 
            return isDescending ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name); 
        } 
        else if (currentSortMode === 'total') { 
            valA = a.hp + a.attack + a.defense + a.spAtk + a.spDef + a.speed; 
            valB = b.hp + b.attack + b.defense + b.spAtk + b.spDef + b.speed; 
        } else { 
            valA = a[currentSortMode]; 
            valB = b[currentSortMode]; 
        }
        return isDescending ? valB - valA : valA - valB;
    });

    currentDisplayedPokemon = liveFiltered; 
    startInfiniteScroll(); 
}


// ==========================================
// 6. INFINITE SCROLLER & LIST RENDERING
// ==========================================

const scrollObserver = new IntersectionObserver((entries) => { 
    if (entries[0].isIntersecting) loadMoreCards(); 
}, { rootMargin: "200px" }); 

function startInfiniteScroll() { 
    resultsDiv.innerHTML = ''; 
    currentRenderCount = 0; 
    
    if (currentDisplayedPokemon.length === 0) { 
        resultsDiv.innerHTML = '<p style="text-align:center;">No match.</p>'; 
        return; 
    } 
    
    loadMoreCards(); 
}

function loadMoreCards() {
    if (currentRenderCount >= currentDisplayedPokemon.length) return;
    
    const start = currentRenderCount; 
    const end = Math.min(start + CHUNK_SIZE, currentDisplayedPokemon.length); 
    const chunk = currentDisplayedPokemon.slice(start, end);
    
    let htmlString = '';
    
    chunk.forEach(p => {
        const idString = `#${String(p.baseId).padStart(3, '0')}`; 
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
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png" class="card-sprite" loading="lazy">
            </div>
        </div>`;
    });
    
    resultsDiv.insertAdjacentHTML('beforeend', htmlString); 
    currentRenderCount = end; 
    manageSentinel();
}

function manageSentinel() { 
    const oldSentinel = document.getElementById('scroll-sentinel'); 
    if (oldSentinel) scrollObserver.unobserve(oldSentinel); 
    if (oldSentinel) oldSentinel.remove(); 
    
    if (currentRenderCount < currentDisplayedPokemon.length) { 
        resultsDiv.insertAdjacentHTML('beforeend', '<div id="scroll-sentinel" style="height:10px;"></div>'); 
        scrollObserver.observe(document.getElementById('scroll-sentinel')); 
    } 
}

function displayAbilities(arr) { 
    if (arr.length === 0) { 
        abilityResultsDiv.innerHTML = '<p>No abilities found.</p>'; 
        return; 
    } 
    let htmlString = ''; 
    arr.forEach(a => { 
        htmlString += `
        <div style="border: 1px solid #444; border-radius: 5px; padding: 10px; margin-bottom: 10px; background-color: #2a2a2a;">
            <h4 style="margin: 0; text-transform: capitalize; color:#fff;">${a.name}</h4>
            <p style="margin: 5px 0 0 0; font-size: 14px; color:#ccc;">${a.description}</p>
        </div>`; 
    }); 
    abilityResultsDiv.innerHTML = htmlString; 
}

function displayMoves(arr) { 
    if (arr.length === 0) { 
        movesResultsDiv.innerHTML = '<p>No moves found.</p>'; 
        return; 
    } 
    let htmlString = ''; 
    arr.forEach(m => { 
        htmlString += `
        <div style="border: 1px solid #444; border-radius: 5px; padding: 10px; margin-bottom: 10px; background-color: #2a2a2a;">
            <h4 style="margin: 0 0 5px 0; text-transform: capitalize; color:#fff;">
                ${m.name} <span style="font-weight: normal; font-size: 14px; color: #888;">(${m.type} / ${m.damage_class})</span>
            </h4>
            <div style="background-color: #333; padding: 5px; border-radius: 5px; margin: 5px 0; font-size: 14px; color:#ddd;">
                <strong>Power:</strong> ${m.power} | <strong>Acc:</strong> ${m.accuracy} | <strong>PP:</strong> ${m.pp}
            </div>
            <p style="margin: 5px 0 0 0; font-size: 14px; color:#ccc;">${m.description}</p>
        </div>`; 
    }); 
    movesResultsDiv.innerHTML = htmlString; 
}

function displayItems(arr) { 
    let filtered = arr;
    
    if (activeRegulationId) { 
        const activeReg = regulations.find(r => r.id === activeRegulationId); 
        if (activeReg && activeReg.items && activeReg.items.length > 0) {
            filtered = arr.filter(it => activeReg.items.includes(it.name)); 
        }
    }
    
    if (filtered.length === 0) { 
        itemsResultsDiv.innerHTML = '<p>No items found (or none legal in current Regulation).</p>'; 
        return; 
    } 
    
    let htmlString = ''; 
    filtered.forEach(it => { 
        htmlString += `
        <div style="border: 1px solid #444; border-radius: 5px; padding: 10px; margin-bottom: 10px; background-color: #2a2a2a; display: flex; align-items: center; gap: 15px;">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${it.name.replace(/ /g, '-')}.png" style="width: 40px; height: 40px; background: #333; border-radius: 5px; padding: 2px;" loading="lazy" onerror="this.style.display='none'">
            <div>
                <h4 style="margin: 0; text-transform: capitalize; color:#fff;">${it.name}</h4>
                <p style="margin: 5px 0 0 0; font-size: 14px; color:#ccc;">${it.description}</p>
            </div>
        </div>`; 
    }); 
    itemsResultsDiv.innerHTML = htmlString; 
}

abilitySearch.addEventListener('input', (e) => { 
    const term = e.target.value.toLowerCase(); 
    displayAbilities(offlineAbilities.filter(a => a.name.toLowerCase().includes(term) || a.description.toLowerCase().includes(term))); 
});

movesSearch.addEventListener('input', (e) => { 
    const term = e.target.value.toLowerCase(); 
    displayMoves(offlineMoves.filter(m => m.name.toLowerCase().includes(term) || m.type.toLowerCase().includes(term) || m.description.toLowerCase().includes(term) || m.damage_class.toLowerCase().includes(term))); 
});

itemsSearch.addEventListener('input', (e) => { 
    const term = e.target.value.toLowerCase(); 
    displayItems(offlineItems.filter(it => it.name.toLowerCase().includes(term) || it.description.toLowerCase().includes(term))); 
});


// ==========================================
// 7. DETAILED POKEMON VIEW
// ==========================================

window.openDetailedView = function(pokemonId) {
    try {
        const p = offlineDatabase.find(x => String(x.id) === String(pokemonId)); 
        
        if (!p) {
            console.warn("Pokemon not found:", pokemonId);
            return;
        }
        
        window.currentDetailedPokemon = p; 

        detailTabInfo.style.display = 'block'; 
        detailTabMoves.style.display = 'none'; 
        detailNavInfo.classList.add('active'); 
        detailNavMoves.classList.remove('active');

        const mainType = (p.types && p.types.length > 0) ? p.types[0] : 'normal'; 
        detailHeader.className = `type-${mainType}`; 
        detailName.innerText = (p.name || 'Unknown').replace(/-/g, ' '); 
        detailId.innerText = `#${String(p.baseId || p.id || 0).padStart(3, '0')}`; 
        detailSprite.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`; 
        
        detailTypes.innerHTML = (p.types || []).map(t => {
            return `<span class="type-chip type-${t}">${t}</span>`;
        }).join('');

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
                <div style="margin-bottom: 10px; background: #333; padding: 10px; border-radius: 8px;">
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
            const chain = offlineEvolutions.find(c => Array.isArray(c) && c.some(node => node && node.name === baseSpecies.speciesName));
            if (chain && chain.length > 1) {
                const chainHtml = chain.map((node) => {
                    const nameToFind = typeof node === 'string' ? node : node.name;
                    const detailText = typeof node === 'string' ? '' : node.detail;
                    const evoPkmn = offlineDatabase.find(x => x.speciesName === nameToFind && x.id < 10000); 
                    
                    if (!evoPkmn) return '';
                    
                    const isCurrentBase = evoPkmn.baseId === p.baseId ? 'current' : '';
                    return `
                        <div class="evo-card ${isCurrentBase}" onclick="openDetailedView(${evoPkmn.id})">
                            <img class="evo-sprite" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evoPkmn.id}.png">
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
                return `
                    <div class="evo-card ${isCurrent}" onclick="openDetailedView(${form.id})">
                        <img class="evo-sprite" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${form.id}.png">
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
        
        setTimeout(() => { 
            document.querySelectorAll('.stat-bar-fill').forEach(bar => { 
                bar.style.width = bar.getAttribute('data-target'); 
            }); 
        }, 50);
        
    } catch (err) {
        console.error("Detailed View Error:", err);
        alert("Failed to load details. Error: " + err.message);
    }
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
            const moveData = offlineMoves.find(m => m && m.name && m.name.toLowerCase() === String(moveName).replace(/-/g, ' '));
            
            if(moveData) {
                let dmgClassColor = 'dmg-status'; 
                if(moveData.damage_class === 'physical') dmgClassColor = 'dmg-physical'; 
                if(moveData.damage_class === 'special') dmgClassColor = 'dmg-special';
                
                let customTag = '';
                if (version === 'edited' && offlineOverrides[p.id] && offlineOverrides[p.id].added && offlineOverrides[p.id].added.includes(moveName)) {
                    customTag = `<span style="font-size: 9px; background: #4CAF50; color: #fff; padding: 2px 5px; border-radius: 4px; margin-left: 8px; vertical-align: middle;">NEW</span>`;
                }

                movesHtml += `
                    <div class="detail-move-row">
                        <div class="detail-move-header">
                            <div class="detail-move-name" style="flex: 2; display: flex; align-items: center;">${moveData.name} ${customTag}</div>
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
        
        if (moveList.length === 0) { 
            movesHtml = `<p style="text-align:center; color:#888; margin-top:30px;">No moves found. Click "Edit Base Learnset" to add some.</p>`; 
        }
        
        detailMovesList.innerHTML = movesHtml;
    } catch (err) {
        console.error("Render Moves Error:", err);
        detailMovesList.innerHTML = `<p style="text-align:center; color:#f44336;">Error loading moves: ${err.message}</p>`;
    }
}

window.closeDetailedView = function() { 
    viewDetails.style.display = 'none'; 
};

if (detailNavInfo) { 
    detailNavInfo.addEventListener('click', () => { 
        detailTabInfo.style.display = 'block'; 
        detailTabMoves.style.display = 'none'; 
        detailNavInfo.classList.add('active'); 
        detailNavMoves.classList.remove('active'); 
        window.scrollTo({ top: 0 }); 
    }); 
}

if (detailNavMoves) { 
    detailNavMoves.addEventListener('click', () => { 
        detailTabInfo.style.display = 'none'; 
        detailTabMoves.style.display = 'block'; 
        detailNavInfo.classList.remove('active'); 
        detailNavMoves.classList.add('active'); 
        window.scrollTo({ top: 0 }); 
    }); 
}
// ==========================================
// 8. TEAM BUILDER LOGIC
// ==========================================

window.handlePokemonClick = function(pokemonId) { 
    try {
        if (activeSlotIndex !== null) { 
            selectPokemonForTeam(pokemonId); 
        } else { 
            openDetailedView(pokemonId); 
        } 
    } catch (err) {
        alert("Click execution error: " + err.message);
    }
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
            switchView('tab-pokemon-btn'); 
            tagInput.placeholder = `Select for Slot ${index + 1}...`; 
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
            tagInput.focus(); 
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
            moves: ['None', 'None', 'None', 'None'] 
        }; 
        activeSlotIndex = null; 
        tagInput.placeholder = "Quick search... (Press Enter to lock tag)"; 
        tagInput.value = ''; 
        liveFilterPokemon(''); 
        renderTeamGrid(); 
        switchView('tab-teambuilder-btn'); 
    } 
};

function renderTeamGrid() {
    currentTeam.forEach((member, index) => {
        const slotEl = document.getElementById(`slot-${index + 1}`); 
        if(!slotEl) return;
        
        if (member) {
            const mainType = member.data.types[0]; 
            slotEl.style.borderStyle = 'solid'; 
            slotEl.style.borderColor = '#888'; 
            slotEl.style.backgroundColor = '#333';
            slotEl.innerHTML = `
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${member.data.id}.png" style="width: 80px; height: 80px;" loading="lazy">
                <span style="color: #fff; text-transform: capitalize; font-size: 14px;">${member.data.name.replace(/-/g, ' ')}</span>
                <span class="type-chip type-${mainType}" style="margin-top: 5px; font-size: 9px;">${mainType}</span>`;
        } else { 
            slotEl.style.borderStyle = 'dashed'; 
            slotEl.style.borderColor = '#555'; 
            slotEl.style.backgroundColor = '#2a2a2a'; 
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
const editMoveBtns = [
    document.getElementById('edit-move-1'), 
    document.getElementById('edit-move-2'), 
    document.getElementById('edit-move-3'), 
    document.getElementById('edit-move-4')
];

window.openTeamEditModal = function(index) {
    editingSlotIndex = index; 
    const member = currentTeam[index];
    
    editSprite.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${member.data.id}.png`; 
    editName.innerText = member.data.name.replace(/-/g, ' ');
    
    editAbilitySelect.innerHTML = member.data.abilities.map(a => {
        return `<option value="${a.name}" ${a.name === member.ability ? 'selected' : ''}>${a.name.replace(/-/g, ' ')} ${a.isHidden ? '(Hidden)' : ''}</option>`;
    }).join('');
    
    editItemSpan.innerText = member.item;
    
    editMoveBtns.forEach((btn, i) => { 
        btn.innerText = member.moves[i].replace(/-/g, ' '); 
        if (member.moves[i] === 'None') { 
            btn.style.color = '#888'; 
            btn.style.borderColor = '#444'; 
        } else { 
            btn.style.color = '#fff'; 
            btn.style.borderColor = '#555'; 
        } 
    });
    
    teamEditOverlay.style.display = 'block'; 
    setTimeout(() => teamEditModal.classList.add('open'), 10);
};

window.showAbilityInfo = function() { 
    const abName = editAbilitySelect.value; 
    const abData = offlineAbilities.find(a => a.name === abName); 
    if (abData) { 
        const safeDesc = abData.description.replace(/`/g, "'").replace(/\\/g, ""); 
        alert(abData.name.toUpperCase() + '\n\n' + safeDesc); 
    } 
}

window.showItemInfo = function() { 
    if (editingSlotIndex === null) return; 
    const itemName = currentTeam[editingSlotIndex].item; 
    if (itemName === 'None') { 
        alert("No item selected."); 
        return; 
    } 
    const searchName = itemName.replace(/ /g, '-').toLowerCase(); 
    const itemData = offlineItems.find(i => i.name.toLowerCase().replace(/ /g, '-') === searchName); 
    if (itemData) { 
        const safeDesc = itemData.description.replace(/`/g, "'").replace(/\\/g, ""); 
        alert(itemData.name.toUpperCase() + '\n\n' + safeDesc); 
    } 
}

window.closeTeamEditModal = function() { 
    if (editingSlotIndex !== null && currentTeam[editingSlotIndex]) { 
        currentTeam[editingSlotIndex].ability = editAbilitySelect.value; 
    } 
    teamEditModal.classList.remove('open'); 
    setTimeout(() => teamEditOverlay.style.display = 'none', 300); 
};

window.removeTeamMember = function() { 
    if (editingSlotIndex !== null) { 
        currentTeam[editingSlotIndex] = null; 
        closeTeamEditModal(); 
        renderTeamGrid(); 
    } 
}

if (teamEditOverlay) {
    teamEditOverlay.addEventListener('click', (e) => { 
        if (e.target === teamEditOverlay) closeTeamEditModal(); 
    });
}

// Item Selection Modal
const itemSelectOverlay = document.getElementById('item-select-modal-overlay'); 
const itemSelectModal = document.getElementById('item-select-modal'); 
const itemSelectList = document.getElementById('item-select-list'); 
const itemSelectSearch = document.getElementById('item-select-search');

window.openItemSelectModal = function() { 
    itemSelectOverlay.style.display = 'block'; 
    setTimeout(() => itemSelectModal.classList.add('open'), 10); 
    renderItemSelectList(''); 
    itemSelectSearch.value = ''; 
    itemSelectSearch.focus(); 
}

window.closeItemSelectModal = function() { 
    itemSelectModal.classList.remove('open'); 
    setTimeout(() => itemSelectOverlay.style.display = 'none', 300); 
}

if (itemSelectOverlay) {
    itemSelectOverlay.addEventListener('click', (e) => { 
        if(e.target === itemSelectOverlay) closeItemSelectModal(); 
    });
}

itemSelectSearch.addEventListener('input', (e) => { 
    renderItemSelectList(e.target.value.toLowerCase().trim()); 
});

function renderItemSelectList(searchTerm) {
    let filtered = offlineItems; 
    
    if (activeRegulationId) { 
        const activeReg = regulations.find(r => r.id === activeRegulationId); 
        if (activeReg && activeReg.items && activeReg.items.length > 0) {
            filtered = filtered.filter(it => activeReg.items.includes(it.name)); 
        }
    }
    
    if (searchTerm) {
        filtered = filtered.filter(it => it.name.toLowerCase().includes(searchTerm));
    }
    
    let html = `<div onclick="selectItemForTeam('None')" style="padding: 15px; border-bottom: 1px solid #444; cursor: pointer; color: #f44336; font-weight: bold; text-align: center;">Clear Item (None)</div>`;
    
    filtered.forEach(it => { 
        const safeDesc = it.description.replace(/`/g, "'").replace(/\\/g, ""); 
        html += `
        <div style="display: flex; align-items: center; gap: 15px; padding: 10px; border-bottom: 1px solid #444;">
            <div onclick="selectItemForTeam('${it.name}')" style="display: flex; align-items: center; gap: 15px; flex-grow: 1; cursor: pointer;">
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${it.name.replace(/ /g, '-')}.png" style="width: 30px; height: 30px;" loading="lazy" onerror="this.style.display='none'">
                <div>
                    <div style="font-weight: bold; text-transform: capitalize; color: #fff;">${it.name.replace(/-/g, ' ')}</div>
                </div>
            </div>
            <button onclick="alert(\`${safeDesc}\`)" style="background: #444; border: 1px solid #555; color: #fff; width: 35px; height: 35px; border-radius: 50%; font-weight: bold; cursor: pointer; flex-shrink: 0;">ⓘ</button>
        </div>`; 
    }); 
    itemSelectList.innerHTML = html;
}

window.selectItemForTeam = function(itemName) { 
    if (editingSlotIndex !== null) { 
        currentTeam[editingSlotIndex].item = itemName.replace(/-/g, ' '); 
        document.getElementById('edit-item').innerText = currentTeam[editingSlotIndex].item; 
        closeItemSelectModal(); 
    } 
}

// Move Selection Modal
const moveSelectOverlay = document.getElementById('move-select-modal-overlay'); 
const moveSelectModal = document.getElementById('move-select-modal'); 
const moveSelectList = document.getElementById('move-select-list'); 
const moveSelectSearch = document.getElementById('move-select-search');

window.openMoveSelectModal = function(moveIndex) { 
    editingMoveIndex = moveIndex; 
    moveSelectOverlay.style.display = 'block'; 
    setTimeout(() => moveSelectModal.classList.add('open'), 10); 
    renderMoveSelectList(''); 
    moveSelectSearch.value = ''; 
    moveSelectSearch.focus(); 
}

window.closeMoveSelectModal = function() { 
    moveSelectModal.classList.remove('open'); 
    setTimeout(() => moveSelectOverlay.style.display = 'none', 300); 
}

if (moveSelectOverlay) {
    moveSelectOverlay.addEventListener('click', (e) => { 
        if(e.target === moveSelectOverlay) closeMoveSelectModal(); 
    });
}

moveSelectSearch.addEventListener('input', (e) => { 
    renderMoveSelectList(e.target.value.toLowerCase().trim()); 
});

function renderMoveSelectList(searchTerm) {
    if (editingSlotIndex === null) return; 
    const member = currentTeam[editingSlotIndex]; 
    const effectiveMoves = getEffectiveMoves(member.data);
    
    let validMoves = effectiveMoves.map(name => offlineMoves.find(om => om.name.toLowerCase() === name.replace(/-/g, ' '))).filter(Boolean); 
    
    if (searchTerm) {
        validMoves = validMoves.filter(m => m.name.toLowerCase().includes(searchTerm) || m.type.toLowerCase().includes(searchTerm)); 
    }
    
    validMoves.sort((a, b) => a.name.localeCompare(b.name));
    
    let html = `<div onclick="selectMoveForTeam('None')" style="padding: 15px; border-bottom: 1px solid #444; cursor: pointer; color: #f44336; font-weight: bold; text-align: center;">Clear Move (None)</div>`;
    
    validMoves.forEach(m => { 
        let dmgClassColor = 'dmg-status'; 
        if(m.damage_class === 'physical') dmgClassColor = 'dmg-physical'; 
        if(m.damage_class === 'special') dmgClassColor = 'dmg-special'; 
        
        const safeDesc = m.description.replace(/`/g, "'").replace(/\\/g, ""); 
        
        html += `
        <div class="detail-move-row" style="margin: 5px 10px; display: flex; align-items: center; gap: 10px;">
            <div style="flex-grow: 1;" onclick="selectMoveForTeam('${m.name}')">
                <div class="detail-move-header">
                    <div class="detail-move-name">${m.name}</div>
                    <div class="detail-move-stat">${m.power}</div>
                    <div class="detail-move-stat">${m.accuracy}</div>
                    <div class="detail-move-stat" style="text-align: right;">${m.pp}</div>
                </div>
                <div class="detail-move-tags">
                    <span class="type-chip type-${m.type}" style="margin: 0;">${m.type}</span>
                    <span class="dmg-class ${dmgClassColor}">${m.damage_class}</span>
                </div>
            </div>
            <button onclick="alert(\`${safeDesc}\`)" style="background: #444; border: 1px solid #555; color: #fff; width: 40px; height: 40px; border-radius: 50%; font-weight: bold; cursor: pointer; flex-shrink: 0;">ⓘ</button>
        </div>`; 
    }); 
    
    moveSelectList.innerHTML = html;
}

window.selectMoveForTeam = function(moveName) { 
    if (editingSlotIndex !== null && editingMoveIndex !== null) { 
        currentTeam[editingSlotIndex].moves[editingMoveIndex] = moveName; 
        const btn = editMoveBtns[editingMoveIndex]; 
        btn.innerText = moveName.replace(/-/g, ' '); 
        if (moveName === 'None') { 
            btn.style.color = '#888'; 
            btn.style.borderColor = '#444'; 
        } else { 
            btn.style.color = '#fff'; 
            btn.style.borderColor = '#555'; 
        } 
        closeMoveSelectModal(); 
    } 
}

window.saveCurrentTeam = function() {
    const isEmpty = currentTeam.every(m => m === null);
    if (isEmpty) { 
        alert("Cannot save an empty team!"); 
        return; 
    }
    const teamName = document.getElementById('team-name-input').value.trim() || `Team ${savedTeams.length + 1}`;
    const teamCopy = JSON.parse(JSON.stringify(currentTeam));
    savedTeams.push({ name: teamName, team: teamCopy });
    localStorage.setItem('championsSavedTeams', JSON.stringify(savedTeams));
    alert(`"${teamName}" saved successfully!`);
}

window.openTeamManagerModal = function() { 
    document.getElementById('team-manager-overlay').style.display = 'block'; 
    setTimeout(() => document.getElementById('team-manager-modal').classList.add('open'), 10); 
    renderTeamManagerList(); 
}

window.closeTeamManagerModal = function() { 
    document.getElementById('team-manager-modal').classList.remove('open'); 
    setTimeout(() => document.getElementById('team-manager-overlay').style.display = 'none', 300); 
}

function renderTeamManagerList() {
    let html = '';
    if (savedTeams.length === 0) { 
        html = '<p style="text-align:center; color:#888; margin-top: 30px;">No teams saved yet.</p>'; 
    } else {
        savedTeams.forEach((teamObj, idx) => {
            let spritesHtml = teamObj.team.map(m => {
                return m ? `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${m.data.id}.png" style="width:35px;height:35px; margin:-5px; filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.8));">` : `<span style="width:25px; height:35px; display:inline-block;"></span>`
            }).join('');
            
            html += `
            <div style="background: #2a2a2a; border: 1px solid #555; border-radius: 8px; padding: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div style="flex-grow: 1; cursor: pointer; padding-right: 10px;" onclick="loadSavedTeam(${idx})">
                    <div style="font-weight: bold; color: #fff; margin-bottom: 8px; font-size: 16px;">${teamObj.name}</div>
                    <div style="display:flex;">${spritesHtml}</div>
                </div>
                <button onclick="deleteSavedTeam(${idx})" style="background: #f44336; color: #fff; border: none; padding: 10px 15px; border-radius: 8px; font-weight: bold; cursor: pointer;">Delete</button>
            </div>`;
        });
    }
    document.getElementById('team-manager-list').innerHTML = html;
}

window.loadSavedTeam = function(idx) { 
    currentTeam = JSON.parse(JSON.stringify(savedTeams[idx].team)); 
    document.getElementById('team-name-input').value = savedTeams[idx].name; 
    renderTeamGrid(); 
    closeTeamManagerModal(); 
}

window.deleteSavedTeam = function(idx) { 
    if(confirm("Are you sure you want to delete this team?")) { 
        savedTeams.splice(idx, 1); 
        localStorage.setItem('championsSavedTeams', JSON.stringify(savedTeams)); 
        renderTeamManagerList(); 
    } 
}


// ==========================================
// 9. REGULATION MANAGER & MASTER LIST
// ==========================================

let editingReg = { id: '', name: '', pokemon: [], items: [] };
let regTabActive = 'pokemon'; 

window.openRegulationManager = function() {
    closeTopFilterModals();
    document.getElementById('regulation-manager-overlay').style.display = 'block';
    setTimeout(() => document.getElementById('regulation-manager-modal').classList.add('open'), 10);
    document.getElementById('reg-manager-main').style.display = 'block';
    document.getElementById('reg-editor-main').style.display = 'none';
    renderRegulationList();
}

window.closeRegulationManagerModal = function() {
    document.getElementById('regulation-manager-modal').classList.remove('open');
    setTimeout(() => document.getElementById('regulation-manager-overlay').style.display = 'none', 300);
}

function renderRegulationList() {
    let html = '';
    regulations.forEach(r => {
        html += `
        <div style="background: #2a2a2a; border: 1px solid #555; border-radius: 8px; padding: 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
            <div style="flex-grow: 1;">
                <div style="font-weight: bold; color: #fff; font-size: 18px;">${r.name}</div>
                <div style="font-size: 12px; color: #888; margin-top: 5px;">${r.pokemon.length} PKMN | ${r.items.length} Items</div>
            </div>
            <div style="display: flex; gap: 10px;">
                <button onclick="editRegulation('${r.id}')" style="background: #2196F3; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer;">Edit</button>
                <button onclick="deleteRegulation('${r.id}')" style="background: #f44336; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer;">Delete</button>
            </div>
        </div>`;
    });
    if(regulations.length === 0) html = '<p style="text-align:center; color:#888;">No custom regulations yet.</p>';
    document.getElementById('reg-manager-list').innerHTML = html;
}

window.createNewRegulation = function() { 
    editingReg = { id: Date.now().toString(), name: '', pokemon: [], items: [] }; 
    showRegulationEditor(); 
}

window.editRegulation = function(id) { 
    const r = regulations.find(x => x.id === id); 
    if(r) { 
        editingReg = JSON.parse(JSON.stringify(r)); 
        showRegulationEditor(); 
    } 
}

window.deleteRegulation = function(id) { 
    if(confirm("Delete this Regulation?")) { 
        regulations = regulations.filter(r => r.id !== id); 
        localStorage.setItem('championsRegulations', JSON.stringify(regulations)); 
        if(activeRegulationId === id) selectTopFilter('regulation', ''); 
        renderRegulationList(); 
        populateTopFilters(); 
    } 
}

function showRegulationEditor() {
    document.getElementById('reg-manager-main').style.display = 'none';
    document.getElementById('reg-editor-main').style.display = 'flex';
    document.getElementById('reg-edit-name').value = editingReg.name;
    document.getElementById('reg-manager-close-btn').style.display = 'none';
    renderRegChips();
}

window.closeRegulationEditor = function() {
    document.getElementById('reg-editor-main').style.display = 'none';
    document.getElementById('reg-manager-main').style.display = 'block';
    document.getElementById('reg-manager-close-btn').style.display = 'block';
}

window.saveRegulation = function() {
    editingReg.name = document.getElementById('reg-edit-name').value.trim() || 'Unnamed Regulation';
    const existingIndex = regulations.findIndex(r => r.id === editingReg.id);
    if(existingIndex >= 0) regulations[existingIndex] = editingReg; 
    else regulations.push(editingReg);
    
    localStorage.setItem('championsRegulations', JSON.stringify(regulations));
    populateTopFilters();
    closeRegulationEditor();
    renderRegulationList();
}

document.getElementById('reg-tab-pkmn').addEventListener('click', (e) => { 
    e.target.classList.add('active'); 
    document.getElementById('reg-tab-items').classList.remove('active'); 
    regTabActive = 'pokemon'; 
    renderRegChips(); 
});

document.getElementById('reg-tab-items').addEventListener('click', (e) => { 
    e.target.classList.add('active'); 
    document.getElementById('reg-tab-pkmn').classList.remove('active'); 
    regTabActive = 'items'; 
    renderRegChips(); 
});

function renderRegChips() {
    const container = document.getElementById('reg-edit-chips');
    const list = regTabActive === 'pokemon' ? editingReg.pokemon : editingReg.items;
    container.innerHTML = list.length === 0 ? `<p style="color:#888; font-size:12px; padding:10px; margin:0;">Everything is currently allowed (List is empty).</p>` : '';
    
    list.forEach(item => {
        container.innerHTML += `<div class="reg-chip">${item.replace(/-/g, ' ')} <button class="reg-chip-remove" onclick="removeRegItem('${item}')">&times;</button></div>`;
    });
}

window.removeRegItem = function(item) {
    if(regTabActive === 'pokemon') editingReg.pokemon = editingReg.pokemon.filter(x => x !== item);
    else editingReg.items = editingReg.items.filter(x => x !== item);
    renderRegChips();
}

// Master List Multi-Select Logic
let masterListFiltered = [];
let masterRenderCount = 0;
const MASTER_CHUNK_SIZE = 60;
const masterListObserver = new IntersectionObserver((entries) => { 
    if (entries[0].isIntersecting) loadMoreMasterCards(); 
}, { rootMargin: "200px" });

window.openMasterListModal = function() {
    document.getElementById('master-list-modal-overlay').style.display = 'block';
    setTimeout(() => document.getElementById('master-list-modal').classList.add('open'), 10);
    document.getElementById('master-list-search').value = '';
    
    if (regTabActive === 'pokemon') {
        document.getElementById('master-list-title').innerText = "Select Pokémon";
        masterListFiltered = offlineDatabase.sort((a,b) => a.baseId - b.baseId);
    } else {
        document.getElementById('master-list-title').innerText = "Select Items";
        masterListFiltered = offlineItems.sort((a,b) => a.name.localeCompare(b.name));
    }
    
    document.getElementById('master-list-grid').innerHTML = '';
    masterRenderCount = 0;
    loadMoreMasterCards();
}

window.closeMasterListModal = function() {
    document.getElementById('master-list-modal').classList.remove('open');
    setTimeout(() => document.getElementById('master-list-modal-overlay').style.display = 'none', 300);
    renderRegChips(); 
}

document.getElementById('master-list-search').addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase().trim();
    if (regTabActive === 'pokemon') {
        masterListFiltered = offlineDatabase.filter(p => p.name.toLowerCase().includes(val) || String(p.baseId) === val).sort((a,b) => a.baseId - b.baseId);
    } else {
        masterListFiltered = offlineItems.filter(i => i.name.toLowerCase().includes(val)).sort((a,b) => a.name.localeCompare(b.name));
    }
    document.getElementById('master-list-grid').innerHTML = '';
    masterRenderCount = 0;
    loadMoreMasterCards();
});

function loadMoreMasterCards() {
    if (masterRenderCount >= masterListFiltered.length) return;
    const start = masterRenderCount;
    const end = Math.min(start + MASTER_CHUNK_SIZE, masterListFiltered.length);
    const chunk = masterListFiltered.slice(start, end);
    
    let html = '';
    chunk.forEach(item => {
        if (regTabActive === 'pokemon') {
            const isSelected = editingReg.pokemon.includes(item.name);
            html += `
            <div class="master-card ${isSelected ? 'selected' : ''}" onclick="toggleMasterSelection('${item.name}', this)">
                <div class="master-card-id">#${String(item.baseId).padStart(3, '0')}</div>
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png" loading="lazy">
                <div class="master-card-name">${item.name.replace(/-/g, ' ')}</div>
            </div>`;
        } else {
            const isSelected = editingReg.items.includes(item.name);
            html += `
            <div class="master-card ${isSelected ? 'selected' : ''}" onclick="toggleMasterSelection('${item.name}', this)">
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.name.replace(/ /g, '-')}.png" loading="lazy" style="width:40px;height:40px;margin-top:10px;">
                <div class="master-card-name" style="margin-top:15px;">${item.name.replace(/-/g, ' ')}</div>
            </div>`;
        }
    });
    
    document.getElementById('master-list-grid').insertAdjacentHTML('beforeend', html);
    masterRenderCount = end;
    manageMasterSentinel();
}

function manageMasterSentinel() {
    const old = document.getElementById('master-scroll-sentinel');
    if (old) masterListObserver.unobserve(old);
    if (old) old.remove();
    
    if (masterRenderCount < masterListFiltered.length) {
        document.getElementById('master-list-grid').insertAdjacentHTML('beforeend', '<div id="master-scroll-sentinel" style="height:10px; grid-column: 1 / -1;"></div>');
        masterListObserver.observe(document.getElementById('master-scroll-sentinel'));
    }
}

window.toggleMasterSelection = function(name, element) {
    const list = regTabActive === 'pokemon' ? editingReg.pokemon : editingReg.items;
    const index = list.indexOf(name);
    
    if (index > -1) { 
        list.splice(index, 1); 
        element.classList.remove('selected'); 
    } else { 
        list.push(name); 
        element.classList.add('selected'); 
    }
}
// ==========================================
// 10. LEARNSET OVERRIDE & CSV IMPORT
// ==========================================

let editingLearnsetTarget = null;

window.getEffectiveMoves = function(pokemon) {
    if (!pokemon || !pokemon.moves) {
        return [];
    }
    
    let moves = [...pokemon.moves]; 
    
    if (offlineOverrides && offlineOverrides[pokemon.id]) {
        const added = offlineOverrides[pokemon.id].added || [];
        const removed = offlineOverrides[pokemon.id].removed || [];
        
        moves = moves.filter(m => !removed.includes(m));
        
        added.forEach(m => { 
            if(!moves.includes(m)) {
                moves.push(m); 
            }
        });
    }
    
    return [...new Set(moves)].sort((a, b) => String(a).localeCompare(String(b)));
}

window.openLearnsetModal = function() {
    if (!window.currentDetailedPokemon) return;
    
    editingLearnsetTarget = window.currentDetailedPokemon.id;
    document.getElementById('learnset-target-name').innerText = window.currentDetailedPokemon.name.toUpperCase();
    
    if (!offlineOverrides[editingLearnsetTarget]) {
        offlineOverrides[editingLearnsetTarget] = { added: [], removed: [] };
    }
    
    document.getElementById('learnset-modal-overlay').style.display = 'block';
    setTimeout(() => document.getElementById('learnset-modal').classList.add('open'), 10);
    renderLearnsetCurrentMoves();
}

window.closeLearnsetModal = function() {
    document.getElementById('learnset-modal').classList.remove('open');
    setTimeout(() => document.getElementById('learnset-modal-overlay').style.display = 'none', 300);
}

window.saveLearnsetOverrides = async function() {
    await saveToDB('overrides', offlineOverrides);
    closeLearnsetModal();
    if(typeof renderPokemonMoves === 'function') {
        renderPokemonMoves(window.currentDetailedPokemon); 
    }
}

document.getElementById('learnset-search').addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase().trim();
    const suggBox = document.getElementById('learnset-suggestions');
    suggBox.innerHTML = '';
    
    if (val.length === 0) { 
        suggBox.style.display = 'none'; 
        return; 
    }
    
    const effectiveNow = getEffectiveMoves(window.currentDetailedPokemon);
    const matches = offlineMoves.filter(m => m.name.toLowerCase().includes(val) && !effectiveNow.includes(m.name)).slice(0, 10);
    
    if (matches.length > 0) {
        suggBox.style.display = 'block';
        matches.forEach(m => {
            const div = document.createElement('div');
            div.style.cssText = 'padding: 12px; border-bottom: 1px solid #555; cursor: pointer; color: #fff; text-transform: capitalize;';
            div.innerText = m.name;
            div.onclick = () => { 
                if(!offlineOverrides[editingLearnsetTarget].added) {
                    offlineOverrides[editingLearnsetTarget].added = [];
                }
                offlineOverrides[editingLearnsetTarget].added.push(m.name);
                offlineOverrides[editingLearnsetTarget].removed = (offlineOverrides[editingLearnsetTarget].removed || []).filter(x => x !== m.name);
                
                document.getElementById('learnset-search').value = ''; 
                suggBox.style.display = 'none'; 
                renderLearnsetCurrentMoves(); 
            };
            suggBox.appendChild(div);
        });
    } else { 
        suggBox.style.display = 'none'; 
    }
});

function renderLearnsetCurrentMoves() {
    const container = document.getElementById('learnset-current-moves');
    const p = offlineDatabase.find(x => x.id === editingLearnsetTarget);
    const effectiveMoves = getEffectiveMoves(p);
    
    container.innerHTML = '';
    
    effectiveMoves.forEach(m => {
        const isCustomAdded = offlineOverrides[editingLearnsetTarget].added && offlineOverrides[editingLearnsetTarget].added.includes(m);
        container.innerHTML += `
        <div class="override-move-row">
            <div>${m.replace(/-/g, ' ')} ${isCustomAdded ? '<span style="color:#4CAF50; font-size:10px; margin-left:5px;">(CUSTOM)</span>' : ''}</div>
            <button class="override-move-remove" onclick="removeMoveFromLearnset('${m}')">X</button>
        </div>`;
    });
}

window.removeMoveFromLearnset = function(moveName) {
    const p = offlineDatabase.find(x => x.id === editingLearnsetTarget);
    const isBaseMove = p.moves.includes(moveName);
    
    if (isBaseMove) {
        if(!offlineOverrides[editingLearnsetTarget].removed) {
            offlineOverrides[editingLearnsetTarget].removed = [];
        }
        offlineOverrides[editingLearnsetTarget].removed.push(moveName);
    } else {
        offlineOverrides[editingLearnsetTarget].added = offlineOverrides[editingLearnsetTarget].added.filter(m => m !== moveName);
    }
    renderLearnsetCurrentMoves();
}

// CSV & MHT Parser Variables
let pendingCSVData = [];

function parseCSV(str) {
    const arr = []; let quote = false; let row = 0, col = 0;
    for (let c = 0; c < str.length; c++) {
        let cc = str[c], nc = str[c+1];
        arr[row] = arr[row] || []; arr[row][col] = arr[row][col] || '';
        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
        if (cc == '"') { quote = !quote; continue; }
        if (cc == ',' && !quote) { ++col; continue; }
        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
        if (cc == '\r' && !quote) { ++row; col = 0; continue; }
        arr[row][col] += cc;
    }
    return arr;
}

window.triggerCSVImport = function() { 
    document.getElementById('import-csv-file').click(); 
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

window.importCSVOverrides = function(event) {
    const file = event.target.files[0]; 
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        let text = e.target.result; 
        pendingCSVData = [];
        
        if (file.name.toLowerCase().endsWith('.mht') || file.name.toLowerCase().endsWith('.mhtml')) {
            let htmlPart = text.replace(/=(?:\r\n?|\n)/g, '');
            htmlPart = htmlPart.replace(/=([A-Fa-f0-9]{2})/g, (m, hex) => { 
                try { return decodeURIComponent('%' + hex); } catch(err) { return String.fromCharCode(parseInt(hex, 16)); } 
            });
            const doc = new DOMParser().parseFromString(htmlPart, 'text/html');
            const allTables = Array.from(doc.querySelectorAll('table'));
            
            if (allTables.length > 0) {
                const biggestTable = allTables.reduce((a, b) => a.querySelectorAll('tr').length > b.querySelectorAll('tr').length ? a : b);
                biggestTable.querySelectorAll('tr').forEach(row => {
                    let cols = row.querySelectorAll('td, th'); 
                    let rowData = []; let textCount = 0;
                    cols.forEach(col => { 
                        let cellText = (col.innerText || col.textContent || "").trim(); 
                        if (cellText.length > 0) textCount++; 
                        rowData.push(cellText); 
                    });
                    if (textCount >= 1) pendingCSVData.push(rowData);
                });
            }
            if (pendingCSVData.length < 2) { 
                alert("Could not extract the table from this MHT file."); return; 
            }
        } else { 
            pendingCSVData = parseCSV(text); 
        }

        if (pendingCSVData.length < 2) { 
            alert("File appears to be empty."); return; 
        }

        let headerIndex = 0;
        for (let i = 0; i < Math.min(10, pendingCSVData.length); i++) {
            if (pendingCSVData[i].filter(cell => cell.trim() !== '').length >= 3) { 
                headerIndex = i; 
                break; 
            }
        }

        pendingCSVData = pendingCSVData.slice(headerIndex); 
        const headers = pendingCSVData[0];
        
        const nameSelect = document.getElementById('csv-col-name'); 
        const addedSelect = document.getElementById('csv-col-added'); 
        const removedSelect = document.getElementById('csv-col-removed'); 
        const startSelect = document.getElementById('csv-col-start');
        
        let optionsHtml = '<option value="-1">-- Skip / Not in Sheet --</option>';
        headers.forEach((header, index) => { 
            optionsHtml += `<option value="${index}">Col ${index + 1}: ${header ? header.replace(/"/g, '').trim() : ''}</option>`; 
        });
        
        nameSelect.innerHTML = optionsHtml; 
        addedSelect.innerHTML = optionsHtml; 
        removedSelect.innerHTML = optionsHtml; 
        startSelect.innerHTML = optionsHtml;
        
        headers.forEach((h, i) => {
            if (!h) return; 
            const lower = h.toLowerCase();
            if (lower.includes('pokemon') || lower.includes('name')) nameSelect.value = i;
            if (lower.includes('add') || lower.includes('buff') || lower.includes('learn')) addedSelect.value = i;
            if (lower.includes('remove') || lower.includes('lose') || lower.includes('nerf')) removedSelect.value = i;
            if (lower.includes('move 1') || lower.includes('acid spray') || i === 4) startSelect.value = i; 
        });

        document.getElementById('csv-map-modal-overlay').style.display = 'block';
        setTimeout(() => document.getElementById('csv-map-modal').classList.add('open'), 10);
        document.getElementById('import-csv-file').value = '';
    };
    reader.readAsText(file);
}

window.closeCSVMapModal = function() {
    document.getElementById('csv-map-modal').classList.remove('open');
    setTimeout(() => document.getElementById('csv-map-modal-overlay').style.display = 'none', 300);
    pendingCSVData = [];
}

window.executeCSVImport = async function() {
    const mode = document.getElementById('csv-import-mode').value;
    const nameIdx = parseInt(document.getElementById('csv-col-name').value);
    
    if (nameIdx === -1) { 
        alert("You must select a column for the Pokémon Name!"); return; 
    }

    let importCount = 0; 
    if (!offlineOverrides) offlineOverrides = {};
    
    for (let i = 1; i < pendingCSVData.length; i++) {
        const row = pendingCSVData[i];
        if (!row || row.length <= nameIdx || !row[nameIdx]) continue;
        
        const pkmnName = row[nameIdx].toLowerCase().trim().replace(/ /g, '-').replace(/'/g, '');
        const targetPkmn = offlineDatabase.find(p => p.name === pkmnName || p.name.startsWith(pkmnName + '-'));
        
        if (targetPkmn) {
            if (!offlineOverrides[targetPkmn.id]) offlineOverrides[targetPkmn.id] = { added: [], removed: [] };
            let rowModified = false;

            if (mode === 'delta') {
                const addedIdx = parseInt(document.getElementById('csv-col-added').value);
                const removedIdx = parseInt(document.getElementById('csv-col-removed').value);
                
                if (addedIdx !== -1 && row[addedIdx]) {
                    const addedMoves = row[addedIdx].split(',').map(m => m.toLowerCase().trim().replace(/ /g, '-').replace(/'/g, '')).filter(Boolean);
                    addedMoves.forEach(m => {
                        if (!offlineOverrides[targetPkmn.id].added.includes(m)) offlineOverrides[targetPkmn.id].added.push(m);
                        offlineOverrides[targetPkmn.id].removed = offlineOverrides[targetPkmn.id].removed.filter(x => x !== m);
                        rowModified = true;
                    });
                }
                
                if (removedIdx !== -1 && row[removedIdx]) {
                    const removedMoves = row[removedIdx].split(',').map(m => m.toLowerCase().trim().replace(/ /g, '-').replace(/'/g, '')).filter(Boolean);
                    removedMoves.forEach(m => {
                        if (!offlineOverrides[targetPkmn.id].removed.includes(m)) offlineOverrides[targetPkmn.id].removed.push(m);
                        offlineOverrides[targetPkmn.id].added = offlineOverrides[targetPkmn.id].added.filter(x => x !== m);
                        rowModified = true;
                    });
                }
            } else if (mode === 'full') {
                const startIdx = parseInt(document.getElementById('csv-col-start').value);
                if (startIdx === -1) { 
                    alert("You must select the Start of Moves column!"); return; 
                }

                let incomingMoves = [];
                for(let j = startIdx; j < row.length; j++) {
                    if(row[j] && row[j].trim() !== '') {
                        incomingMoves.push(row[j].toLowerCase().trim().replace(/ /g, '-').replace(/'/g, ''));
                    }
                }

                const baseMoves = targetPkmn.moves.map(m => m.name || m);
                const newAdded = incomingMoves.filter(m => !baseMoves.includes(m));
                const newRemoved = baseMoves.filter(m => !incomingMoves.includes(m));

                if (newAdded.length > 0 || newRemoved.length > 0) {
                    offlineOverrides[targetPkmn.id].added = newAdded;
                    offlineOverrides[targetPkmn.id].removed = newRemoved;
                    rowModified = true;
                }
            }
            if (rowModified) importCount++;
        }
    }
    
    await saveToDB('overrides', offlineOverrides);
    alert(`Successfully calculated and imported moveset overrides for ${importCount} Pokémon!`);
    closeCSVMapModal();
    
    if (window.currentDetailedPokemon) {
        if(typeof renderPokemonMoves === 'function') renderPokemonMoves(window.currentDetailedPokemon);
        if(typeof renderLearnsetCurrentMoves === 'function') renderLearnsetCurrentMoves();
    }
}


// ==========================================
// 11. CALCULATOR MATH & LOGIC
// ==========================================

let calcState = {
    attacker: null, 
    defender: null,
    attackerMoves: ['None', 'None', 'None', 'None'],
    sp: { 
        attacker: {hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0}, 
        defender: {hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0} 
    },
    natures: { attacker: 'serious', defender: 'serious' }
};

let currentEditingRole = null;
let currentEditingStat = null;
let calcEditingMoveIndex = 0;

const naturesList = { 
    adamant: {plus: 'attack', minus: 'spAtk'}, bold: {plus: 'defense', minus: 'attack'}, 
    brave: {plus: 'attack', minus: 'speed'}, calm: {plus: 'spDef', minus: 'attack'}, 
    careful: {plus: 'spDef', minus: 'spAtk'}, gentle: {plus: 'spDef', minus: 'defense'}, 
    hasty: {plus: 'speed', minus: 'defense'}, impish: {plus: 'defense', minus: 'spAtk'}, 
    jolly: {plus: 'speed', minus: 'spAtk'}, lax: {plus: 'defense', minus: 'spDef'}, 
    lonely: {plus: 'attack', minus: 'defense'}, mild: {plus: 'spAtk', minus: 'defense'}, 
    modest: {plus: 'spAtk', minus: 'attack'}, naive: {plus: 'speed', minus: 'spDef'}, 
    naughty: {plus: 'attack', minus: 'spDef'}, quiet: {plus: 'spAtk', minus: 'speed'}, 
    rash: {plus: 'spAtk', minus: 'spDef'}, relaxed: {plus: 'defense', minus: 'speed'}, 
    sassy: {plus: 'spDef', minus: 'speed'}, serious: {plus: 'none', minus: 'none'}, 
    timid: {plus: 'speed', minus: 'attack'} 
};

const typeChart = { 
    normal: {rock: 0.5, ghost: 0, steel: 0.5}, 
    fire: {fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2}, 
    water: {fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5}, 
    grass: {fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5}, 
    electric: {water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5}, 
    ice: {fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5}, 
    fighting: {normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5}, 
    poison: {grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2}, 
    ground: {fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2}, 
    flying: {grass: 2, electric: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5}, 
    psychic: {fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5}, 
    bug: {fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5}, 
    rock: {fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5}, 
    ghost: {normal: 0, psychic: 2, ghost: 2, dark: 0.5}, 
    dragon: {dragon: 2, steel: 0.5, fairy: 0}, 
    dark: {fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5}, 
    steel: {fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2}, 
    fairy: {fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5} 
};

window.sendToCalculator = function() {
    if (window.currentDetailedPokemon) {
        calcState.attacker = window.currentDetailedPokemon;
        calcState.sp.attacker = {hp:0, attack:0, defense:0, spAtk:0, spDef:0, speed:0};
        calcState.attackerMoves = ['None', 'None', 'None', 'None'];
        switchView('tab-calculator-btn');
        closeDetailedView();
        renderCalcUI();
    }
}

window.swapCalcCombatants = function() {
    const tempPkmn = calcState.attacker; 
    calcState.attacker = calcState.defender; 
    calcState.defender = tempPkmn;
    
    const tempSp = calcState.sp.attacker; 
    calcState.sp.attacker = calcState.sp.defender; 
    calcState.sp.defender = tempSp;
    
    const tempNat = calcState.natures.attacker; 
    calcState.natures.attacker = calcState.natures.defender; 
    calcState.natures.defender = tempNat;
    
    calcState.attackerMoves = ['None', 'None', 'None', 'None']; 
    renderCalcUI();
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

function getTypeEffectiveness(moveType, defenderTypes) {
    let effectiveness = 1;
    defenderTypes.forEach(t => { 
        if(typeChart[moveType] && typeChart[moveType][t] !== undefined) {
            effectiveness *= typeChart[moveType][t]; 
        }
    });
    return effectiveness;
}

window.renderCalcUI = function() {
    ['attacker', 'defender'].forEach(role => {
        const btn = document.getElementById(`calc-${role}-btn`);
        const statsContainer = document.getElementById(`calc-${role}-stats`);
        const natureSelect = document.getElementById(`calc-${role}-nature`);
        
        if (natureSelect.options.length === 0) {
            for (const nat in naturesList) {
                const opt = document.createElement('option'); 
                opt.value = nat; 
                opt.innerText = nat.charAt(0).toUpperCase() + nat.slice(1);
                if (nat === 'serious') opt.selected = true; 
                natureSelect.appendChild(opt);
            }
        }

        if (calcState[role]) {
            btn.innerHTML = `
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${calcState[role].id}.png" style="width:40px; height:40px; margin-bottom:5px;"> 
                <div style="text-transform:capitalize; line-height: 1.1;">${calcState[role].name.replace(/-/g, ' ')}</div>`;
            
            let statsHtml = '';
            const statLabels = {hp: 'HP', attack: 'Atk', defense: 'Def', spAtk: 'Sp.A', spDef: 'Sp.D', speed: 'Spe'};
            
            let totalSp = 0; 
            for (let s in calcState.sp[role]) totalSp += calcState.sp[role][s];

            statsHtml += `<div style="text-align: center; color: #aaa; font-size: 10px; margin-bottom: 5px; font-weight: bold;">SP LEFT: <span style="color:#4CAF50;">${66 - totalSp}</span></div>`;

            for (let statName in statLabels) {
                const val = getCalcStat(role, statName);
                const currentSp = calcState.sp[role][statName];
                statsHtml += `
                    <div class="calc-stat-row" onclick="openStatEditModal('${role}', '${statName}')">
                        <span class="calc-stat-label">${statLabels[statName]}</span>
                        <span class="calc-stat-sp">${currentSp > 0 ? '+' + currentSp : 0}</span>
                        <span class="calc-stat-final">${val}</span>
                    </div>`;
            }
            statsContainer.innerHTML = statsHtml;
        } else {
            btn.innerHTML = `<span style="font-size: 24px;">⊕</span> Select`;
            statsContainer.innerHTML = `<div style="text-align:center; color:#666; padding: 20px 0; font-size: 12px; border: 1px dashed #444; border-radius: 8px;">Select Pokémon to view stats</div>`;
        }
    });
    
    updateCalc();
}

window.openStatEditModal = function(role, statName) {
    currentEditingRole = role; 
    currentEditingStat = statName;
    
    const statDisplayNames = {hp: 'HP', attack: 'Attack', defense: 'Defense', spAtk: 'Sp. Attack', spDef: 'Sp. Defense', speed: 'Speed'};
    document.getElementById('stat-edit-title').innerText = `${role}: ${statDisplayNames[statName]}`;
    
    syncStatEditUI('init');
    
    document.getElementById('stat-edit-modal-overlay').style.display = 'block'; 
    setTimeout(() => document.getElementById('stat-edit-modal').classList.add('open'), 10);
}

window.closeStatEditModal = function() { 
    document.getElementById('stat-edit-modal').classList.remove('open'); 
    setTimeout(() => document.getElementById('stat-edit-modal-overlay').style.display = 'none', 300); 
}

window.adjustStatEdit = function(amount) { 
    let currentVal = parseInt(document.getElementById('stat-edit-input').value) || 0; 
    document.getElementById('stat-edit-input').value = currentVal + amount; 
    syncStatEditUI('input'); 
}

window.syncStatEditUI = function(source) {
    const inputEl = document.getElementById('stat-edit-input'); 
    const sliderEl = document.getElementById('stat-edit-slider'); 
    const leftEl = document.getElementById('stat-edit-left');
    
    let val = 0;
    if (source === 'init') val = calcState.sp[currentEditingRole][currentEditingStat];
    else if (source === 'input') val = parseInt(inputEl.value) || 0;
    else if (source === 'slider') val = parseInt(sliderEl.value) || 0;
    
    if (val < 0) val = 0; 
    if (val > 32) val = 32;

    let totalOtherSp = 0;
    for (let s in calcState.sp[currentEditingRole]) { 
        if (s !== currentEditingStat) totalOtherSp += calcState.sp[currentEditingRole][s]; 
    }
    
    if (totalOtherSp + val > 66) val = 66 - totalOtherSp;

    calcState.sp[currentEditingRole][currentEditingStat] = val;
    inputEl.value = val; 
    sliderEl.value = val; 
    leftEl.innerText = 66 - (totalOtherSp + val);
    
    renderCalcUI(); 
}

window.updateCalc = function() {
    calcState.natures.attacker = document.getElementById('calc-attacker-nature').value || 'serious';
    calcState.natures.defender = document.getElementById('calc-defender-nature').value || 'serious';
    calculateDamage();
}

function calculateDamage() {
    const resultsContainer = document.getElementById('calc-damage-results');
    
    if (!calcState.attacker || !calcState.defender) {
        resultsContainer.innerHTML = '<div style="color:#888; text-align:center; padding:20px; background:#222; border-radius:8px; border: 1px dashed #444;">Select both Pokémon to see damage rolls.</div>';
        return;
    }
    
    let html = '';
    
    calcState.attackerMoves.forEach((moveName, idx) => {
        if (moveName === 'None') {
            html += `<div class="calc-move-card" onclick="openCalcMoveModal(${idx})"><div style="color: #666; font-style: italic; text-align: center; width: 100%;">+ Tap to select move</div></div>`;
            return;
        }
        
        const moveData = offlineMoves.find(m => m.name === moveName);
        if (!moveData || moveData.damage_class === 'status' || moveData.power === '-') {
            html += `
                <div class="calc-move-card" onclick="openCalcMoveModal(${idx})">
                    <div style="flex: 1;">
                        <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; text-transform: capitalize;">${moveName}</div>
                        <div style="font-size: 11px; color: #888;">(Status / No Damage)</div>
                    </div>
                </div>`;
            return;
        }
        
        const power = parseInt(moveData.power) || 0;
        let attackStat = getCalcStat('attacker', moveData.damage_class === 'physical' ? 'attack' : 'spAtk');
        let defenseStat = getCalcStat('defender', moveData.damage_class === 'physical' ? 'defense' : 'spDef');
        let damageBase = Math.floor(Math.floor((Math.floor(2 * 50 / 5) + 2) * power * attackStat / defenseStat) / 50) + 2;
        
        let stab = calcState.attacker.types.includes(moveData.type) ? 1.5 : 1;
        let effectiveness = getTypeEffectiveness(moveData.type, calcState.defender.types);
        
        let minDamage = Math.floor(damageBase * stab * effectiveness * 0.85);
        let maxDamage = Math.floor(damageBase * stab * effectiveness * 1.00);
        let defenderHp = getCalcStat('defender', 'hp');
        
        let minPct = ((minDamage / defenderHp) * 100).toFixed(1);
        let maxPct = ((maxDamage / defenderHp) * 100).toFixed(1);
        
        let effColor = '#fff'; 
        let koText = '';
        
        if (effectiveness > 1) effColor = '#4CAF50';
        if (effectiveness < 1) effColor = '#f44336';
        if (effectiveness === 0) effColor = '#888';
        
        if (minDamage >= defenderHp) koText = `<div style="font-size: 9px; color: #FF9800; text-transform: uppercase; margin-top: 2px;">Gua. OHKO</div>`;
        else if (maxDamage >= defenderHp) koText = `<div style="font-size: 9px; color: #FF9800; text-transform: uppercase; margin-top: 2px;">Pos. OHKO</div>`;

        html += `
        <div class="calc-move-card" onclick="openCalcMoveModal(${idx})">
            <div style="flex: 1;">
                <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; text-transform: capitalize;">${moveName} <span class="type-chip type-${moveData.type}" style="font-size:9px; padding:2px 4px; margin-left: 5px;">${moveData.type}</span></div>
                <div style="font-size: 11px; color: #aaa;">Pwr: ${power} | Acc: ${moveData.accuracy}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 18px; font-weight: bold; color: ${effColor};">${minPct}% - ${maxPct}%</div>
                <div style="font-size: 11px; color: #888;">(${minDamage} - ${maxDamage} HP)</div>
                ${koText}
            </div>
        </div>`;
    });
    
    resultsContainer.innerHTML = html;
}

// Calc Pokemon Select Modals
let activeCalcRole = ''; 
let calcListFiltered = []; 
let calcRenderCount = 0;

const calcObserver = new IntersectionObserver((entries) => { 
    if (entries[0].isIntersecting) loadMoreCalcCards(); 
}, { rootMargin: "200px" });

window.openCalcSelectModal = function(role) {
    activeCalcRole = role;
    document.getElementById('calc-select-modal-overlay').style.display = 'block'; 
    setTimeout(() => document.getElementById('calc-select-modal').classList.add('open'), 10);
    
    document.getElementById('calc-select-search').value = '';
    calcListFiltered = offlineDatabase.sort((a,b) => a.baseId - b.baseId);
    document.getElementById('calc-select-grid').innerHTML = ''; 
    calcRenderCount = 0; 
    loadMoreCalcCards();
}

window.closeCalcSelectModal = function() { 
    document.getElementById('calc-select-modal').classList.remove('open'); 
    setTimeout(() => document.getElementById('calc-select-modal-overlay').style.display = 'none', 300); 
}

document.getElementById('calc-select-search').addEventListener('input', (e) => { 
    const val = e.target.value.toLowerCase().trim(); 
    calcListFiltered = offlineDatabase.filter(p => p.name.toLowerCase().includes(val) || String(p.baseId) === val).sort((a,b) => a.baseId - b.baseId); 
    document.getElementById('calc-select-grid').innerHTML = ''; 
    calcRenderCount = 0; 
    loadMoreCalcCards(); 
});

function loadMoreCalcCards() {
    if (calcRenderCount >= calcListFiltered.length) return;
    
    const start = calcRenderCount; 
    const end = Math.min(start + 60, calcListFiltered.length);
    const chunk = calcListFiltered.slice(start, end); 
    
    let html = '';
    chunk.forEach(item => { 
        html += `
        <div class="master-card" onclick="selectCalcPokemon(${item.id})">
            <div class="master-card-id">#${String(item.baseId).padStart(3, '0')}</div>
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png" loading="lazy">
            <div class="master-card-name">${item.name.replace(/-/g, ' ')}</div>
        </div>`; 
    });
    
    document.getElementById('calc-select-grid').insertAdjacentHTML('beforeend', html); 
    calcRenderCount = end; 
    manageCalcSentinel();
}

function manageCalcSentinel() { 
    const old = document.getElementById('calc-scroll-sentinel'); 
    if (old) calcObserver.unobserve(old); 
    if (old) old.remove(); 
    
    if (calcRenderCount < calcListFiltered.length) { 
        document.getElementById('calc-select-grid').insertAdjacentHTML('beforeend', '<div id="calc-scroll-sentinel" style="height:10px; grid-column: 1 / -1;"></div>'); 
        calcObserver.observe(document.getElementById('calc-scroll-sentinel')); 
    } 
}

window.selectCalcPokemon = function(id) {
    const p = offlineDatabase.find(x => x.id === id);
    if (p) {
        calcState[activeCalcRole] = p;
        calcState.sp[activeCalcRole] = {hp:0, attack:0, defense:0, spAtk:0, spDef:0, speed:0};
        
        if (activeCalcRole === 'attacker') {
            calcState.attackerMoves = ['None', 'None', 'None', 'None'];
        }
        
        renderCalcUI(); 
        closeCalcSelectModal();
    }
}

// Calc Team Import
let calcImportRole = '';

window.openCalcTeamImportModal = function(role) {
    calcImportRole = role;
    const grid = document.getElementById('calc-team-import-grid');
    grid.innerHTML = ''; 
    let hasMembers = false;
    
    currentTeam.forEach((member, idx) => {
        if (member) {
            hasMembers = true;
            grid.innerHTML += `
            <div class="master-card" onclick="importToCalcFromTeam(${idx})">
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${member.data.id}.png">
                <div class="master-card-name">${member.data.name.replace(/-/g, ' ')}</div>
            </div>`;
        }
    });
    
    if (!hasMembers) {
        grid.innerHTML = '<p style="color:#888; grid-column:1/-1; text-align:center; margin-top:20px;">Your Team Builder is currently empty!</p>';
    }
    
    document.getElementById('calc-team-import-overlay').style.display = 'block'; 
    setTimeout(() => document.getElementById('calc-team-import-modal').classList.add('open'), 10);
}

window.closeCalcTeamImportModal = function() { 
    document.getElementById('calc-team-import-modal').classList.remove('open'); 
    setTimeout(() => document.getElementById('calc-team-import-overlay').style.display = 'none', 300); 
}

window.importToCalcFromTeam = function(slotIdx) {
    const member = currentTeam[slotIdx];
    if (member) {
        calcState[calcImportRole] = member.data;
        calcState.sp[calcImportRole] = {hp:0, attack:0, defense:0, spAtk:0, spDef:0, speed:0}; 
        
        if (calcImportRole === 'attacker') {
            calcState.attackerMoves = [...member.moves];
        }
        
        renderCalcUI(); 
        closeCalcTeamImportModal();
    }
}

// Calc Specific Move Selection
window.openCalcMoveModal = function(idx) {
    if (!calcState.attacker) return;
    
    calcEditingMoveIndex = idx;
    document.getElementById('calc-move-modal-overlay').style.display = 'block'; 
    setTimeout(() => document.getElementById('calc-move-modal').classList.add('open'), 10);
    
    document.getElementById('calc-move-search').value = ''; 
    renderCalcMoveList('');
}

window.closeCalcMoveModal = function() { 
    document.getElementById('calc-move-modal').classList.remove('open'); 
    setTimeout(() => document.getElementById('calc-move-modal-overlay').style.display = 'none', 300); 
}

document.getElementById('calc-move-search').addEventListener('input', (e) => { 
    renderCalcMoveList(e.target.value.toLowerCase().trim()); 
});

function renderCalcMoveList(searchTerm) {
    const effectiveMoves = getEffectiveMoves(calcState.attacker);
    
    let validMoves = effectiveMoves.map(name => offlineMoves.find(om => om.name.toLowerCase() === name.replace(/-/g, ' '))).filter(Boolean);
    
    if (searchTerm) {
        validMoves = validMoves.filter(m => m.name.toLowerCase().includes(searchTerm) || m.type.toLowerCase().includes(searchTerm));
    }
    
    validMoves.sort((a, b) => a.name.localeCompare(b.name));

    let html = `<div onclick="selectCalcMove('None')" style="padding: 15px; border-bottom: 1px solid #444; cursor: pointer; color: #f44336; font-weight: bold; text-align: center;">Clear Move (None)</div>`;
    
    validMoves.forEach(m => {
        let dmgClassColor = 'dmg-status'; 
        if(m.damage_class === 'physical') dmgClassColor = 'dmg-physical'; 
        if(m.damage_class === 'special') dmgClassColor = 'dmg-special';
        
        html += `
        <div class="detail-move-row" style="margin: 5px 10px; display: flex; align-items: center; gap: 10px; cursor: pointer;" onclick="selectCalcMove('${m.name}')">
            <div style="flex-grow: 1;">
                <div class="detail-move-header">
                    <div class="detail-move-name">${m.name}</div>
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
    
    document.getElementById('calc-move-list').innerHTML = html;
}

window.selectCalcMove = function(moveName) { 
    calcState.attackerMoves[calcEditingMoveIndex] = moveName; 
    renderCalcUI(); 
    closeCalcMoveModal(); 
}
// ==========================================
// 12. FAB & FILTER MODALS
// ==========================================

const fabToggle = document.getElementById('fab-toggle'); 
const fabMenu = document.getElementById('fab-menu'); 
const fabBtnSearch = document.getElementById('fab-btn-search'); 
const fabBtnSort = document.getElementById('fab-btn-sort'); 
const fabBtnMove = document.getElementById('fab-btn-move'); 
const fabBtnAbility = document.getElementById('fab-btn-ability');

if (fabToggle) { 
    fabToggle.addEventListener('click', () => { 
        fabToggle.classList.toggle('active'); 
        fabMenu.classList.toggle('active'); 
    }); 
}

// Sort Modal Logic
const sortModalOverlay = document.getElementById('sort-modal-overlay'); 
const sortModal = document.getElementById('sort-modal'); 
const closeSortModalBtn = document.getElementById('close-sort-modal'); 
const sortButtons = document.querySelectorAll('.sort-btn'); 
const btnAsc = document.getElementById('sort-asc'); 
const btnDesc = document.getElementById('sort-desc');

if (fabBtnSort) { 
    fabBtnSort.addEventListener('click', () => { 
        fabToggle.classList.remove('active'); 
        fabMenu.classList.remove('active'); 
        sortModalOverlay.style.display = 'block'; 
        setTimeout(() => sortModal.classList.add('open'), 10); 
    }); 
}

function closeSortModal() { 
    sortModal.classList.remove('open'); 
    setTimeout(() => sortModalOverlay.style.display = 'none', 300); 
}

if (closeSortModalBtn) closeSortModalBtn.addEventListener('click', closeSortModal);
if (sortModalOverlay) sortModalOverlay.addEventListener('click', (e) => { 
    if (e.target === sortModalOverlay) closeSortModal(); 
});

sortButtons.forEach(btn => { 
    btn.addEventListener('click', (e) => { 
        sortButtons.forEach(b => b.classList.remove('active')); 
        e.target.classList.add('active'); 
        currentSortMode = e.target.getAttribute('data-sort'); 
        
        if(['id', 'name'].includes(currentSortMode)) { 
            isDescending = false; 
            btnAsc.classList.add('active'); 
            btnDesc.classList.remove('active'); 
        } else { 
            isDescending = true; 
            btnDesc.classList.add('active'); 
            btnAsc.classList.remove('active'); 
        } 
        closeSortModal(); 
        liveFilterPokemon(tagInput.value.toLowerCase().trim()); 
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }); 
});

if (btnAsc && btnDesc) { 
    btnAsc.addEventListener('click', () => { 
        isDescending = false; 
        btnAsc.classList.add('active'); 
        btnDesc.classList.remove('active'); 
        closeSortModal(); 
        liveFilterPokemon(tagInput.value.toLowerCase().trim()); 
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }); 
    
    btnDesc.addEventListener('click', () => { 
        isDescending = true; 
        btnDesc.classList.add('active'); 
        btnAsc.classList.remove('active'); 
        closeSortModal(); 
        liveFilterPokemon(tagInput.value.toLowerCase().trim()); 
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }); 
}

// Move Filter Modal Logic
const moveModalOverlay = document.getElementById('move-modal-overlay'); 
const moveModal = document.getElementById('move-modal'); 
const closeMoveModalBtn = document.getElementById('close-move-modal'); 
const moveFilterInput = document.getElementById('move-filter-input'); 
const moveFilterSuggestions = document.getElementById('move-filter-suggestions');

if (fabBtnMove) { 
    fabBtnMove.addEventListener('click', () => { 
        fabToggle.classList.remove('active'); 
        fabMenu.classList.remove('active'); 
        moveModalOverlay.style.display = 'block'; 
        setTimeout(() => moveModal.classList.add('open'), 10); 
        moveFilterInput.focus(); 
    }); 
}

function closeMoveModal() { 
    moveModal.classList.remove('open'); 
    setTimeout(() => moveModalOverlay.style.display = 'none', 300); 
    moveFilterInput.value = ''; 
    moveFilterSuggestions.style.display = 'none'; 
}

if (closeMoveModalBtn) closeMoveModalBtn.addEventListener('click', closeMoveModal);
if (moveModalOverlay) moveModalOverlay.addEventListener('click', (e) => { 
    if (e.target === moveModalOverlay) closeMoveModal(); 
});

moveFilterInput.addEventListener('input', (e) => { 
    const val = e.target.value.toLowerCase().trim(); 
    moveFilterSuggestions.innerHTML = ''; 
    
    if (val.length === 0) { 
        moveFilterSuggestions.style.display = 'none'; 
        return; 
    } 
    
    const matches = offlineMoves.filter(m => m.name.toLowerCase().includes(val)).slice(0, 20); 
    
    if (matches.length > 0) { 
        moveFilterSuggestions.style.display = 'block'; 
        matches.forEach(match => { 
            const div = document.createElement('div'); 
            div.style.cssText = 'padding: 12px 10px; border-bottom: 1px solid #555; cursor: pointer; text-transform: capitalize; color: #fff;'; 
            div.innerText = match.name; 
            div.onclick = () => { 
                addTag(`move:${match.name.replace(/ /g, '-')}`); 
                closeMoveModal(); 
            }; 
            moveFilterSuggestions.appendChild(div); 
        }); 
    } else { 
        moveFilterSuggestions.style.display = 'none'; 
    } 
});

// Ability Filter Modal Logic
const abilityModalOverlay = document.getElementById('ability-modal-overlay'); 
const abilityModal = document.getElementById('ability-modal'); 
const closeAbilityModalBtn = document.getElementById('close-ability-modal'); 
const abilityFilterInput = document.getElementById('ability-filter-input'); 
const abilityFilterSuggestions = document.getElementById('ability-filter-suggestions');

if (fabBtnAbility) { 
    fabBtnAbility.addEventListener('click', () => { 
        fabToggle.classList.remove('active'); 
        fabMenu.classList.remove('active'); 
        abilityModalOverlay.style.display = 'block'; 
        setTimeout(() => abilityModal.classList.add('open'), 10); 
        abilityFilterInput.focus(); 
    }); 
}

function closeAbilityModal() { 
    abilityModal.classList.remove('open'); 
    setTimeout(() => abilityModalOverlay.style.display = 'none', 300); 
    abilityFilterInput.value = ''; 
    abilityFilterSuggestions.style.display = 'none'; 
}

if (closeAbilityModalBtn) closeAbilityModalBtn.addEventListener('click', closeAbilityModal);
if (abilityModalOverlay) abilityModalOverlay.addEventListener('click', (e) => { 
    if (e.target === abilityModalOverlay) closeAbilityModal(); 
});

abilityFilterInput.addEventListener('input', (e) => { 
    const val = e.target.value.toLowerCase().trim(); 
    abilityFilterSuggestions.innerHTML = ''; 
    
    if (val.length === 0) { 
        abilityFilterSuggestions.style.display = 'none'; 
        return; 
    } 
    
    const matches = offlineAbilities.filter(a => a.name.toLowerCase().includes(val)).slice(0, 20); 
    
    if (matches.length > 0) { 
        abilityFilterSuggestions.style.display = 'block'; 
        matches.forEach(match => { 
            const div = document.createElement('div'); 
            div.style.cssText = 'padding: 12px 10px; border-bottom: 1px solid #555; cursor: pointer; text-transform: capitalize; color: #fff;'; 
            div.innerText = match.name; 
            div.onclick = () => { 
                addTag(`ability:${match.name.replace(/ /g, '-')}`); 
                closeAbilityModal(); 
            }; 
            abilityFilterSuggestions.appendChild(div); 
        }); 
    } else { 
        abilityFilterSuggestions.style.display = 'none'; 
    } 
});

// Master Dictionary Search Modal Logic
const tagModalOverlay = document.getElementById('tag-modal-overlay'); 
const tagModal = document.getElementById('tag-modal'); 
const closeTagModalBtn = document.getElementById('close-tag-modal'); 
const tagFilterInput = document.getElementById('tag-filter-input'); 
const tagFilterSuggestions = document.getElementById('tag-filter-suggestions');

if (fabBtnSearch) { 
    fabBtnSearch.addEventListener('click', () => { 
        fabToggle.classList.remove('active'); 
        fabMenu.classList.remove('active'); 
        tagModalOverlay.style.display = 'block'; 
        setTimeout(() => tagModal.classList.add('open'), 10); 
        tagFilterInput.focus(); 
    }); 
}

function closeTagModal() { 
    tagModal.classList.remove('open'); 
    setTimeout(() => tagModalOverlay.style.display = 'none', 300); 
    tagFilterInput.value = ''; 
    tagFilterSuggestions.style.display = 'none'; 
}

if (closeTagModalBtn) closeTagModalBtn.addEventListener('click', closeTagModal);
if (tagModalOverlay) tagModalOverlay.addEventListener('click', (e) => { 
    if (e.target === tagModalOverlay) closeTagModal(); 
});

tagFilterInput.addEventListener('input', (e) => { 
    const val = e.target.value.toLowerCase().trim(); 
    tagFilterSuggestions.innerHTML = ''; 
    
    if (val.length === 0) { 
        tagFilterSuggestions.style.display = 'none'; 
        return; 
    } 
    
    const matches = masterSearchList.filter(item => item.text.toLowerCase().includes(val)).slice(0, 30); 
    
    if (matches.length > 0) { 
        tagFilterSuggestions.style.display = 'block'; 
        matches.forEach(match => { 
            const div = document.createElement('div'); 
            div.style.cssText = 'padding: 12px 10px; border-bottom: 1px solid #555; cursor: pointer; display: flex; justify-content: space-between; align-items: center; color: #fff;'; 
            div.innerHTML = `<span style="text-transform: capitalize;">${match.text}</span> <span style="font-size: 12px; color: #aaa; background: #222; padding: 2px 6px; border-radius: 4px;">${match.label}</span>`; 
            div.onclick = () => { 
                addTag(match.tag); 
                closeTagModal(); 
            }; 
            tagFilterSuggestions.appendChild(div); 
        }); 
    } else { 
        tagFilterSuggestions.style.display = 'none'; 
    } 
});

// ==========================================
// 13. INITIALIZATION
// ==========================================

async function initializeApp() {
    if (syncAllBtn) {
        syncAllBtn.addEventListener('click', syncAllData);
    }
    await loadOfflineData(); 
    await loadOfflineAbilities(); 
    await loadOfflineMoves(); 
    await loadOfflineItems();
    await loadOfflineEvolutions(); 
    await loadOfflineOverrides();
}

initializeApp();
