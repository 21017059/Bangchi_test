// --- 게임 데이터 ---
let cookies = 0;
let clickPower = 1; 
let cpsMultiplier = 1; 
let gachaCost = 100; 
let workerGachaCost = 200; 

let factory = { count: 0, cost: 10, baseCps: 1 };
let autoClick = {
    level: 0, baseInterval: 3000, intervalDecrease: 200, 
    currentInterval: 0, cost: 3000, costMultiplier: 1.5, timer: null
};

// --- 아이템 데이터 구조 ---
// Item = { id: string, name: string, count: number, level: number, awakening: number }
let ownedTools = []; 
let ownedWorkers = [];

// --- 상수 (NEW) ---
const BASE_MAX_LEVEL = 50; // 기본 최대 강화 레벨
const AWAKENING_COST_COUNT = 5; // 각성 시 필요한 아이템 개수
const AWAKENING_MAX = 5; // 최대 각성 단계
const AWAKENING_LEVEL_BONUS = 50; // 각성당 증가하는 최대 레벨

// --- 기본 아이템 정보 ---
const itemPresets = {
    tools: [
        { id: "SPOON", name: "낡은 스푼", bonus: 0.05, chance: 40, rarity: "I. Common", baseUpgradeCost: 50, upgradeMultiplier: 1.2, baseBonusPerLevel: 0.01 },
        { id: "TIN", name: "주석틀", bonus: 0.10, chance: 30, rarity: "II. Uncommon", baseUpgradeCost: 150, upgradeMultiplier: 1.25, baseBonusPerLevel: 0.02 },
        { id: "MIXER", name: "철제 믹서", bonus: 0.20, chance: 15, rarity: "III. Rare", baseUpgradeCost: 500, upgradeMultiplier: 1.3, baseBonusPerLevel: 0.04 },
        { id: "SIEVE", name: "금도금 체", bonus: 0.40, chance: 8, rarity: "IV. Epic", baseUpgradeCost: 2000, upgradeMultiplier: 1.35, baseBonusPerLevel: 0.08 },
        { id: "DOUGH", name: "자동 반죽기", bonus: 0.80, chance: 4, rarity: "V. Legendary", baseUpgradeCost: 8000, upgradeMultiplier: 1.4, baseBonusPerLevel: 0.15 },
        { id: "OVEN", name: "초고속 오븐", bonus: 1.50, chance: 2, rarity: "VI. Mythic", baseUpgradeCost: 30000, upgradeMultiplier: 1.45, baseBonusPerLevel: 0.30 },
        { id: "SPATULA", name: "차원문 스패츌러", bonus: 3.00, chance: 0.8, rarity: "VII. Ancient", baseUpgradeCost: 100000, upgradeMultiplier: 1.5, baseBonusPerLevel: 0.60 },
        { id: "INFINITE", name: "무한 동력기", bonus: 5.00, chance: 0.2, rarity: "VIII. Divine", baseUpgradeCost: 500000, upgradeMultiplier: 1.6, baseBonusPerLevel: 1.00 }
    ],
    workers: [
        { id: "INTERN", name: "신입 인턴", bonus: 0.10, chance: 40, rarity: "I. Common", baseUpgradeCost: 50, upgradeMultiplier: 1.2, baseBonusPerLevel: 0.01 },
        { id: "BAKER", name: "숙련된 제빵사", bonus: 0.20, chance: 30, rarity: "II. Uncommon", baseUpgradeCost: 150, upgradeMultiplier: 1.25, baseBonusPerLevel: 0.02 },
        { id: "MANAGER", name: "생산 관리자", bonus: 0.40, chance: 15, rarity: "III. Rare", baseUpgradeCost: 500, upgradeMultiplier: 1.3, baseBonusPerLevel: 0.04 },
        { id: "ANALYST", name: "데이터 분석가", bonus: 0.80, chance: 8, rarity: "IV. Epic", baseUpgradeCost: 2000, upgradeMultiplier: 1.35, baseBonusPerLevel: 0.08 },
        { id: "EXPERT", name: "자동화 전문가", bonus: 1.50, chance: 4, rarity: "V. Legendary", baseUpgradeCost: 8000, upgradeMultiplier: 1.4, baseBonusPerLevel: 0.15 },
        { id: "CLONE", name: "클론 노동자", bonus: 3.00, chance: 2, rarity: "VI. Mythic", baseUpgradeCost: 30000, upgradeMultiplier: 1.45, baseBonusPerLevel: 0.30 },
        { id: "TRAVELER", name: "시간 여행자", bonus: 6.00, chance: 0.8, rarity: "VII. Ancient", baseUpgradeCost: 100000, upgradeMultiplier: 1.5, baseBonusPerLevel: 0.60 },
        { id: "GOD", name: "쿠키 신", bonus: 10.00, chance: 0.2, rarity: "VIII. Divine", baseUpgradeCost: 500000, upgradeMultiplier: 1.6, baseBonusPerLevel: 1.00 }
    ]
};

// --- DOM 요소 ---
const cookiesDisplay = document.getElementById('cookies');
const cpsDisplay = document.getElementById('cookies-per-second');
const cpcDisplay = document.getElementById('click-per-click'); 
const factoryCountDisplay = document.getElementById('factory-count');
const factoryCostDisplay = document.getElementById('factory-cost');
const buyFactoryButton = document.getElementById('buy-factory');
const gachaCostDisplay = document.getElementById('gacha-cost');
const drawToolButton = document.getElementById('draw-tool');
const toolListContainer = document.getElementById('tool-list-container'); 
const workerGachaCostDisplay = document.getElementById('worker-gacha-cost'); 
const drawWorkerButton = document.getElementById('draw-worker'); 
const workerListContainer = document.getElementById('worker-list-container'); 
const autoClickLevelDisplay = document.getElementById('auto-click-level');
const autoClickIntervalDisplay = document.getElementById('auto-click-interval-display');
const autoClickCostDisplay = document.getElementById('auto-click-cost');
const upgradeAutoClickButton = document.getElementById('upgrade-auto-click');

// --- 헬퍼 함수: 희귀도에 따른 색상 지정 ---
function getItemColor(rarity) {
    if (rarity === 'I. Common') return 'gray';
    if (rarity === 'II. Uncommon') return 'green';
    if (rarity === 'III. Rare') return 'blue';
    if (rarity === 'IV. Epic') return 'purple';
    if (rarity === 'V. Legendary') return 'orange';
    if (rarity === 'VI. Mythic') return 'red';
    if (rarity === 'VII. Ancient') return 'cyan';
    if (rarity === 'VIII. Divine') return 'gold';
    return 'black';
}

// --- 함수: CPC/CPS 능력치 재계산 ---
function recalculateStats() {
    let newClickPower = 1;
    let newCpsMultiplier = 1;

    // 1. 도구 (CPC) 재계산
    ownedTools.forEach(item => {
        const preset = itemPresets.tools.find(p => p.id === item.id);
        if (!preset) return;
        
        // (기본 보너스 + 레벨당 보너스 * 레벨) * 개수
        const totalBonus = (preset.bonus + preset.baseBonusPerLevel * item.level) * item.count;
        // 각성 레벨에 따른 추가 능력치 부여 (NEW: 각성당 5% 추가 보너스)
        const awakeningMultiplier = 1 + (item.awakening * 0.05); 
        newClickPower *= (1 + totalBonus) * awakeningMultiplier;
    });
    clickPower = newClickPower;

    // 2. 일꾼 (CPS) 재계산
    ownedWorkers.forEach(item => {
        const preset = itemPresets.workers.find(p => p.id === item.id);
        if (!preset) return;
        
        const totalBonus = (preset.bonus + preset.baseBonusPerLevel * item.level) * item.count;
        // 각성 레벨에 따른 추가 능력치 부여 (NEW)
        const awakeningMultiplier = 1 + (item.awakening * 0.05);
        newCpsMultiplier *= (1 + totalBonus) * awakeningMultiplier;
    });
    cpsMultiplier = newCpsMultiplier;
}

// --- 함수: 아이템 목록 다시 그리기 및 강화/각성 버튼 생성 ---
function redrawItems() {
    toolListContainer.innerHTML = '';
    workerListContainer.innerHTML = '';

    // 공통 그리기 로직
    const drawItem = (item, type) => {
        const presets = type === 'tool' ? itemPresets.tools : itemPresets.workers;
        const list = type === 'tool' ? ownedTools : ownedWorkers;
        const preset = presets.find(p => p.id === item.id);
        if (!preset) return;

        // --- 레벨 및 각성 관련 NEW 로직 ---
        const maxLevel = BASE_MAX_LEVEL + (item.awakening * AWAKENING_LEVEL_BONUS);
        const nextCost = Math.floor(preset.baseUpgradeCost * Math.pow(preset.upgradeMultiplier, item.level));
        const totalBonus = (preset.bonus + preset.baseBonusPerLevel * item.level) * item.count;

        // 각성 버튼 조건
        const canAwaken = item.count >= AWAKENING_COST_COUNT && item.awakening < AWAKENING_MAX;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'upgrade-item';
        itemDiv.style.color = getItemColor(preset.rarity);

        // 아이템 정보
        let htmlContent = `
            <p><strong>${item.name}</strong> x${item.count} [Lv.${item.level}/${maxLevel} / 🌟${item.awakening}]</p>
            <p>총 보너스: +${(totalBonus * 100).toFixed(1)}% ${type === 'tool' ? 'CPC' : 'CPS'}</p>
        `;

        // 강화 버튼
        if (item.level < maxLevel) {
            htmlContent += `
                <p>강화 비용: ${nextCost} 쿠키</p>
                <button onclick="upgradeItem('${item.id}', '${type}')" ${cookies < nextCost ? 'disabled' : ''}>강화</button>
            `;
        } else {
            htmlContent += `<p style="font-weight: bold;">강화 최대치 도달 (Lv.${maxLevel})</p>`;
        }

        // 각성 버튼
        if (canAwaken) {
            htmlContent += `
                <button style="background-color: darkred; color: white;" onclick="awakenItem('${item.id}', '${type}')">
                    🌟 각성 (${AWAKENING_COST_COUNT}개 소모)
                </button>
            `;
        } else if (item.awakening === AWAKENING_MAX) {
            htmlContent += `<p style="font-weight: bold; color: gold;">최대 각성 (🌟${AWAKENING_MAX})</p>`;
        }
        
        itemDiv.innerHTML = htmlContent;
        (type === 'tool' ? toolListContainer : workerListContainer).appendChild(itemDiv);
    };

    // 1. 도구 목록 그리기
    ownedTools.forEach(item => drawItem(item, 'tool'));

    // 2. 일꾼 목록 그리기
    ownedWorkers.forEach(item => drawItem(item, 'worker'));
}

// --- 함수: 아이템 강화 (전역 함수로 등록) ---
window.upgradeItem = function(itemId, type) {
    const list = type === 'tool' ? ownedTools : ownedWorkers;
    const presets = type === 'tool' ? itemPresets.tools : itemPresets.workers;
    
    const item = list.find(i => i.id === itemId);
    const preset = presets.find(p => p.id === itemId);

    if (!item || !preset) return;

    const maxLevel = BASE_MAX_LEVEL + (item.awakening * AWAKENING_LEVEL_BONUS);
    if (item.level >= maxLevel) return; // 최대 레벨 초과 방지

    const nextCost = Math.floor(preset.baseUpgradeCost * Math.pow(preset.upgradeMultiplier, item.level));
    
    if (cookies >= nextCost) {
        cookies -= nextCost;
        item.level += 1;
        recalculateStats();
        updateDisplay();
        console.log(`${item.name}을(를) ${item.level} 레벨로 강화!`);
    }
};

// --- 함수: 아이템 각성 (NEW: 전역 함수로 등록) ---
window.awakenItem = function(itemId, type) {
    const list = type === 'tool' ? ownedTools : ownedWorkers;
    const item = list.find(i => i.id === itemId);
    
    if (!item || item.count < AWAKENING_COST_COUNT || item.awakening >= AWAKENING_MAX) return;

    item.count -= AWAKENING_COST_COUNT; // 5개 소모
    item.awakening += 1; // 각성 레벨 증가
    
    // 각성 시 강화 레벨 초기화는 필요 없음 (최대 레벨만 증가)

    recalculateStats();
    updateDisplay();
    console.log(`${item.name}이(가) 🌟${item.awakening} 각성 완료!`);
};


// --- 함수: 게임 상태 업데이트 ---
function updateDisplay() {
    cookiesDisplay.textContent = Math.floor(cookies);
    
    const totalCPS = factory.count * factory.baseCps * cpsMultiplier;
    cpsDisplay.textContent = totalCPS.toFixed(2); 
    cpcDisplay.textContent = clickPower.toFixed(2); 
    
    factoryCountDisplay.textContent = factory.count;
    factoryCostDisplay.textContent = factory.cost;

    gachaCostDisplay.textContent = gachaCost;
    drawToolButton.disabled = cookies < gachaCost;
    workerGachaCostDisplay.textContent = workerGachaCost;
    drawWorkerButton.disabled = cookies < workerGachaCost;
    
    autoClickLevelDisplay.textContent = autoClick.level;
    autoClickCostDisplay.textContent = autoClick.cost;
    upgradeAutoClickButton.disabled = cookies < autoClick.cost;

    if (autoClick.level === 0) {
        autoClickIntervalDisplay.textContent = '없음 (3.0초에서 시작)';
        upgradeAutoClickButton.textContent = '오토 클릭 구매 (3000 쿠키)';
    } else {
        const intervalInSeconds = autoClick.currentInterval / 1000;
        autoClickIntervalDisplay.textContent = `${intervalInSeconds.toFixed(1)}초`;
        upgradeAutoClickButton.textContent = `업그레이드 (${autoClick.cost} 쿠키)`;
    }
    
    // 쿠키 개수가 바뀔 때마다 아이템 목록의 버튼 활성화/비활성화 상태를 업데이트
    redrawItems();
}


// --- 함수: 오토 클릭 타이머 시작/업데이트 ---
function startAutoClicker() {
    if (autoClick.timer) {
        clearInterval(autoClick.timer);
    }
    autoClick.currentInterval = autoClick.baseInterval - (autoClick.level * autoClick.intervalDecrease);
    if (autoClick.currentInterval < 100) { autoClick.currentInterval = 100; }

    autoClick.timer = setInterval(() => {
        cookies += clickPower;
        updateDisplay();
    }, autoClick.currentInterval);
}


// --- 함수: 공통 뽑기 로직 ---
function draw(gachaItems, type) {
    const rand = Math.random() * 100;
    let cumulativeChance = 0;
    let drawnPreset = null;

    for (const preset of gachaItems) {
        cumulativeChance += preset.chance;
        if (rand < cumulativeChance) {
            drawnPreset = preset;
            break;
        }
    }

    if (!drawnPreset) return;

    const list = type === 'tool' ? ownedTools : ownedWorkers;
    
    const existingItem = list.find(item => item.id === drawnPreset.id);

    if (existingItem) {
        existingItem.count += 1;
    } else {
        // NEW: 각성 레벨 필드 추가
        list.push({ id: drawnPreset.id, name: drawnPreset.name, count: 1, level: 0, awakening: 0 }); 
    }
    
    recalculateStats();
    redrawItems();
}


// --- 함수: 게임 상태 저장 ---
function saveGame() {
    const gameData = {
        cookies, clickPower, cpsMultiplier, gachaCost, workerGachaCost, factory, autoClick, ownedTools, ownedWorkers
    };
    localStorage.setItem('idleGameSave', JSON.stringify(gameData));
    console.log("게임 저장 완료:", new Date().toLocaleTimeString());
}

// --- 함수: 게임 상태 불러오기 ---
function loadGame() {
    const savedData = localStorage.getItem('idleGameSave');
    
    if (savedData) {
        const gameData = JSON.parse(savedData);
        
        cookies = gameData.cookies || 0;
        gachaCost = gameData.gachaCost || 100;
        workerGachaCost = gameData.workerGachaCost || 200;

        Object.assign(factory, gameData.factory);
        Object.assign(autoClick, gameData.autoClick);
        
        // 각성 필드가 없는 구형 세이브 파일 호환 처리
        ownedTools = gameData.ownedTools ? gameData.ownedTools.map(item => ({...item, awakening: item.awakening || 0})) : [];
        ownedWorkers = gameData.ownedWorkers ? gameData.ownedWorkers.map(item => ({...item, awakening: item.awakening || 0})) : [];

        recalculateStats(); 
        redrawItems();

        if (autoClick.level > 0) {
             startAutoClicker();
        }

        console.log("게임 불러오기 완료");
        return true; 
    }
    return false; 
}


// --- 이벤트 리스너 ---

document.getElementById('cookie-button').addEventListener('click', () => {
    cookies += clickPower;
    updateDisplay();
});

buyFactoryButton.addEventListener('click', () => {
    if (cookies >= factory.cost) {
        cookies -= factory.cost;
        factory.count += 1;
        factory.cost = Math.floor(factory.cost * 1.15); 
        updateDisplay();
    }
});

drawToolButton.addEventListener('click', () => {
    if (cookies >= gachaCost) {
        cookies -= gachaCost;
        draw(itemPresets.tools, 'tool');
        gachaCost = Math.floor(gachaCost * 1.25); 
        updateDisplay();
    }
});

drawWorkerButton.addEventListener('click', () => {
    if (cookies >= workerGachaCost) {
        cookies -= workerGachaCost;
        draw(itemPresets.workers, 'worker'); 
        workerGachaCost = Math.floor(workerGachaCost * 1.35); 
        updateDisplay();
    }
});

upgradeAutoClickButton.addEventListener('click', () => {
    if (cookies >= autoClick.cost) {
        cookies -= autoClick.cost;
        
        autoClick.level += 1;
        autoClick.cost = Math.floor(autoClick.cost * autoClick.costMultiplier);

        startAutoClicker();
        updateDisplay();
    }
});


// --- 함수: 방치형 루프 (자동 생산) ---
function productionLoop() {
    const totalProduction = factory.count * factory.baseCps * cpsMultiplier;
    cookies += totalProduction;
    updateDisplay();
}


// --- 게임 초기화 ---

setInterval(productionLoop, 1000);
setInterval(saveGame, 10000); 

if (!loadGame()) {
    recalculateStats(); 
    updateDisplay();
}
