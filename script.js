// --- 게임 데이터 ---
let cookies = 0;
let clickPower = 1; // 기본 클릭 파워 (CPC)
let cpsMultiplier = 1; // CPS 승수 (일꾼에 의해 증가)

let gachaCost = 100; 
let workerGachaCost = 200; 

let factory = {
    count: 0,
    cost: 10,
    baseCps: 1 
};

let autoClick = {
    level: 0,
    baseInterval: 3000, // 3초 (밀리초 단위)
    intervalDecrease: 200, // 0.2초 감소 (밀리초 단위)
    currentInterval: 0,
    cost: 3000,
    costMultiplier: 1.5,
    timer: null
};

// --- 도구 정보 (CPC 증가) ---
const tools = [
    { name: "낡은 스푼", bonus: 0.05, chance: 50, rarity: "Common" },
    { name: "주석틀", bonus: 0.15, chance: 35, rarity: "Uncommon" },
    { name: "자동 휘젓기 기계", bonus: 0.35, chance: 12, rarity: "Rare" },
    { name: "시간 왜곡 오븐", bonus: 1.00, chance: 3, rarity: "Legendary" }
];
let ownedTools = [];

// --- 일꾼 정보 (CPS 증가) ---
const workers = [
    { name: "신입 인턴", bonus: 0.10, chance: 50, rarity: "Common" },
    { name: "숙련된 제빵사", bonus: 0.25, chance: 35, rarity: "Uncommon" },
    { name: "자동화 전문가", bonus: 0.50, chance: 12, rarity: "Rare" },
    { name: "공장장", bonus: 1.50, chance: 3, rarity: "Legendary" }
];
let ownedWorkers = [];

// --- DOM 요소 ---
const cookiesDisplay = document.getElementById('cookies');
const cpsDisplay = document.getElementById('cookies-per-second');
const cpcDisplay = document.getElementById('click-per-click'); 
const factoryCountDisplay = document.getElementById('factory-count');
const factoryCostDisplay = document.getElementById('factory-cost');
const buyFactoryButton = document.getElementById('buy-factory');
const gachaCostDisplay = document.getElementById('gacha-cost');
const drawToolButton = document.getElementById('draw-tool');
const toolListDisplay = document.getElementById('tool-list');
const workerGachaCostDisplay = document.getElementById('worker-gacha-cost'); 
const drawWorkerButton = document.getElementById('draw-worker'); 
const workerListDisplay = document.getElementById('worker-list');
const autoClickLevelDisplay = document.getElementById('auto-click-level');
const autoClickIntervalDisplay = document.getElementById('auto-click-interval-display');
const autoClickCostDisplay = document.getElementById('auto-click-cost');
const upgradeAutoClickButton = document.getElementById('upgrade-auto-click');


// --- 헬퍼 함수: 희귀도에 따른 색상 지정 ---
function getItemColor(rarity) {
    if (rarity === 'Uncommon') return 'green';
    if (rarity === 'Rare') return 'blue';
    if (rarity === 'Legendary') return 'purple';
    return 'black';
}

// --- 함수: 게임 상태 업데이트 ---
function updateDisplay() {
    cookiesDisplay.textContent = Math.floor(cookies);
    
    // CPS 및 CPC 표시
    const totalCPS = factory.count * factory.baseCps * cpsMultiplier;
    cpsDisplay.textContent = totalCPS.toFixed(2); 
    cpcDisplay.textContent = clickPower.toFixed(2); 
    
    // 공장 업데이트
    factoryCountDisplay.textContent = factory.count;
    factoryCostDisplay.textContent = factory.cost;

    // 뽑기 버튼 업데이트
    gachaCostDisplay.textContent = gachaCost;
    drawToolButton.disabled = cookies < gachaCost;
    workerGachaCostDisplay.textContent = workerGachaCost;
    drawWorkerButton.disabled = cookies < workerGachaCost;
    
    // 오토 클릭 업데이트
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
}

// --- 함수: 오토 클릭 타이머 시작/업데이트 ---
function startAutoClicker() {
    if (autoClick.timer) {
        clearInterval(autoClick.timer);
    }

    autoClick.currentInterval = autoClick.baseInterval - (autoClick.level * autoClick.intervalDecrease);
    
    // 쿨타임이 100ms 미만으로 내려가지 않도록 최소값 설정 (게임 밸런스 및 성능 보호)
    if (autoClick.currentInterval < 100) {
        autoClick.currentInterval = 100; 
    }

    autoClick.timer = setInterval(() => {
        cookies += clickPower;
        updateDisplay();
    }, autoClick.currentInterval);
}

// --- 함수: 아이템 목록 다시 그리기 (저장/불러오기 시 사용) ---
function redrawItems() {
    toolListDisplay.innerHTML = '';
    ownedTools.forEach(tool => {
        const listItem = document.createElement('li');
        listItem.textContent = `${tool.name} (클릭 파워 +${(tool.bonus * 100).toFixed(0)}%, 등급: ${tool.rarity})`;
        listItem.style.color = getItemColor(tool.rarity);
        toolListDisplay.appendChild(listItem);
    });

    workerListDisplay.innerHTML = '';
    ownedWorkers.forEach(worker => {
        const listItem = document.createElement('li');
        listItem.textContent = `${worker.name} (CPS 승수 +${(worker.bonus * 100).toFixed(0)}%, 등급: ${worker.rarity})`;
        listItem.style.color = getItemColor(worker.rarity);
        workerListDisplay.appendChild(listItem);
    });
}


// --- 함수: 공통 뽑기 로직 ---
function draw(gachaItems, type) {
    const rand = Math.random() * 100;
    let cumulativeChance = 0;
    let drawnItem = null;

    for (const item of gachaItems) {
        cumulativeChance += item.chance;
        if (rand < cumulativeChance) {
            drawnItem = item;
            break;
        }
    }

    if (!drawnItem) return;

    if (type === 'tool') {
        clickPower *= (1 + drawnItem.bonus); 
        ownedTools.push(drawnItem);
        redrawItems();
    } else if (type === 'worker') {
        cpsMultiplier *= (1 + drawnItem.bonus); 
        ownedWorkers.push(drawnItem);
        redrawItems();
    }
}


// --- 함수: 게임 상태 저장 ---
function saveGame() {
    const gameData = {
        cookies,
        clickPower,
        cpsMultiplier,
        gachaCost,
        workerGachaCost,
        factory,
        autoClick,
        ownedTools,
        ownedWorkers // 배열 데이터 저장 추가
    };
    
    localStorage.setItem('idleGameSave', JSON.stringify(gameData));
    console.log("게임 저장 완료:", new Date().toLocaleTimeString());
}

// --- 함수: 게임 상태 불러오기 ---
function loadGame() {
    const savedData = localStorage.getItem('idleGameSave');
    
    if (savedData) {
        const gameData = JSON.parse(savedData);
        
        // 기본 변수 적용
        cookies = gameData.cookies || 0;
        clickPower = gameData.clickPower || 1;
        cpsMultiplier = gameData.cpsMultiplier || 1;
        gachaCost = gameData.gachaCost || 100;
        workerGachaCost = gameData.workerGachaCost || 200;

        // 객체 데이터 덮어쓰기
        Object.assign(factory, gameData.factory);
        Object.assign(autoClick, gameData.autoClick);
        
        // 배열 데이터 불러오기 (초기 데이터 없으면 빈 배열)
        ownedTools = gameData.ownedTools || [];
        ownedWorkers = gameData.ownedWorkers || [];

        // 화면에 아이템 목록 다시 그리기
        redrawItems();

        // 오토 클릭 재시작
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
        draw(tools, 'tool');
        gachaCost = Math.floor(gachaCost * 1.25); 
        updateDisplay();
    }
});

drawWorkerButton.addEventListener('click', () => {
    if (cookies >= workerGachaCost) {
        cookies -= workerGachaCost;
        draw(workers, 'worker'); 
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

// 1초(1000ms)마다 CPS 생산 루프 실행
setInterval(productionLoop, 1000);

// 10초(10000ms)마다 자동 저장 기능 실행
setInterval(saveGame, 10000); 

// 저장된 데이터를 불러오기 시도, 없으면 초기화
if (!loadGame()) {
    updateDisplay();
}
