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

// --- 오토 클릭 데이터 (NEW) ---
let autoClick = {
    level: 0,
    baseInterval: 3000, // 3초 (밀리초 단위)
    intervalDecrease: 200, // 0.2초 감소 (밀리초 단위)
    currentInterval: 0, // 현재 클릭 간격 (레벨 0일 때 0)
    cost: 3000,
    costMultiplier: 1.5, // 업그레이드 시 비용 증가율
    timer: null // setInterval을 저장할 변수
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

// 공장 DOM
const factoryCountDisplay = document.getElementById('factory-count');
const factoryCostDisplay = document.getElementById('factory-cost');
const buyFactoryButton = document.getElementById('buy-factory');

// 도구 뽑기 DOM
const gachaCostDisplay = document.getElementById('gacha-cost');
const drawToolButton = document.getElementById('draw-tool');
const toolListDisplay = document.getElementById('tool-list');

// 일꾼 뽑기 DOM
const workerGachaCostDisplay = document.getElementById('worker-gacha-cost'); 
const drawWorkerButton = document.getElementById('draw-worker'); 
const workerListDisplay = document.getElementById('worker-list');

// 오토 클릭 DOM (NEW)
const autoClickLevelDisplay = document.getElementById('auto-click-level');
const autoClickIntervalDisplay = document.getElementById('auto-click-interval-display');
const autoClickCostDisplay = document.getElementById('auto-click-cost');
const upgradeAutoClickButton = document.getElementById('upgrade-auto-click');


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
    
    // 오토 클릭 업데이트 (NEW)
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

// 헬퍼 함수: 희귀도에 따른 색상 지정
function getItemColor(rarity) {
    if (rarity === 'Uncommon') return 'green';
    if (rarity === 'Rare') return 'blue';
    if (rarity === 'Legendary') return 'purple';
    return 'black';
}

// --- 함수: 공통 뽑기 로직 ---
function draw(gachaItems, type) { /* ... 기존 draw 함수 내용 생략 ... */
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

    let listItem = document.createElement('li');
    
    if (type === 'tool') {
        clickPower *= (1 + drawnItem.bonus); 
        ownedTools.push(drawnItem);
        listItem.textContent = `${drawnItem.name} (클릭 파워 +${(drawnItem.bonus * 100).toFixed(0)}%, 등급: ${drawnItem.rarity})`;
        toolListDisplay.appendChild(listItem);
    } else if (type === 'worker') {
        cpsMultiplier *= (1 + drawnItem.bonus); 
        ownedWorkers.push(drawnItem);
        listItem.textContent = `${drawnItem.name} (CPS 승수 +${(drawnItem.bonus * 100).toFixed(0)}%, 등급: ${drawnItem.rarity})`;
        workerListDisplay.appendChild(listItem);
    }
    listItem.style.color = getItemColor(drawnItem.rarity);
}

// --- 함수: 오토 클릭 타이머 시작/업데이트 (NEW) ---
function startAutoClicker() {
    // 1. 기존 타이머 제거
    if (autoClick.timer) {
        clearInterval(autoClick.timer);
    }

    // 2. 새로운 간격 계산
    // 현재 간격 = 기본 간격 - (레벨 * 감소량)
    // 1레벨: 3000 - 200 = 2800ms
    // 2레벨: 3000 - 400 = 2600ms
    autoClick.currentInterval = autoClick.baseInterval - (autoClick.level * autoClick.intervalDecrease);

    // 3. 타이머 시작
    // autoClick.currentInterval 밀리초마다 자동 클릭 실행
    autoClick.timer = setInterval(() => {
        // 클릭 파워만큼 쿠키 획득 (수동 클릭과 동일)
        cookies += clickPower;
        updateDisplay();
    }, autoClick.currentInterval);
}


// --- 함수: 오토 클릭 업그레이드 (NEW) ---
upgradeAutoClickButton.addEventListener('click', () => {
    if (cookies >= autoClick.cost) {
        cookies -= autoClick.cost;
        
        autoClick.level += 1; // 레벨 증가
        
        // 비용 증가
        autoClick.cost = Math.floor(autoClick.cost * autoClick.costMultiplier);

        // 오토 클릭 타이머 재시작 (업그레이드된 간격 적용)
        startAutoClicker();

        updateDisplay();
    }
});


// --- 이벤트 리스너 ---

// 1. 쿠키 클릭
document.getElementById('cookie-button').addEventListener('click', () => {
    cookies += clickPower;
    updateDisplay();
});

// 2. 공장 구매
buyFactoryButton.addEventListener('click', () => {
    if (cookies >= factory.cost) {
        cookies -= factory.cost;
        factory.count += 1;
        factory.cost = Math.floor(factory.cost * 1.15); 
        updateDisplay();
    }
});

// 3. 도구 뽑기 이벤트 (CPC 증가)
drawToolButton.addEventListener('click', () => {
    if (cookies >= gachaCost) {
        cookies -= gachaCost;
        draw(tools, 'tool');
        gachaCost = Math.floor(gachaCost * 1.25); 
        updateDisplay();
    }
});

// 4. 일꾼 뽑기 이벤트 (CPS 증가)
drawWorkerButton.addEventListener('click', () => {
    if (cookies >= workerGachaCost) {
        cookies -= workerGachaCost;
        draw(workers, 'worker'); 
        workerGachaCost = Math.floor(workerGachaCost * 1.35); 
        updateDisplay();
    }
});


// --- 함수: 방치형 루프 (자동 생산) ---
function productionLoop() {
    const totalProduction = factory.count * factory.baseCps * cpsMultiplier;
    cookies += totalProduction;
    updateDisplay();
}

// 1초(1000ms)마다 productionLoop 함수 실행
setInterval(productionLoop, 1000);

// 초기 게임 상태 표시
updateDisplay();
// 오토클릭이 레벨 0이라도 초기화 메시지를 표시하기 위해 updateDisplay 호출
