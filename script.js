// --- 게임 데이터 ---
let cookies = 0;
let clickPower = 1; // 기본 클릭 파워 (CPC)
let cpsMultiplier = 1; // CPS 승수 (일꾼에 의해 증가)

let gachaCost = 100; // 도구 뽑기 비용
let workerGachaCost = 200; // 일꾼 뽑기 비용

let factory = {
    count: 0,
    cost: 10,
    baseCps: 1 // 공장의 기본 CPS
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
// 일꾼은 CPS 승수(Multiplier)를 증가시킵니다.
const workers = [
    { name: "신입 인턴", bonus: 0.10, chance: 50, rarity: "Common" }, // 10% CPS 증가
    { name: "숙련된 제빵사", bonus: 0.25, chance: 35, rarity: "Uncommon" }, // 25% CPS 증가
    { name: "자동화 전문가", bonus: 0.50, chance: 12, rarity: "Rare" }, // 50% CPS 증가
    { name: "공장장", bonus: 1.50, chance: 3, rarity: "Legendary" } // 150% CPS 증가
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

const workerGachaCostDisplay = document.getElementById('worker-gacha-cost'); // NEW
const drawWorkerButton = document.getElementById('draw-worker'); // NEW
const workerListDisplay = document.getElementById('worker-list'); // NEW

// --- 함수: 게임 상태 업데이트 ---
function updateDisplay() {
    cookiesDisplay.textContent = Math.floor(cookies);
    
    // CPS (초당 생산량) 계산: (공장 수 * 기본 생산량) * CPS 승수
    const totalCPS = factory.count * factory.baseCps * cpsMultiplier;
    cpsDisplay.textContent = totalCPS.toFixed(2); // 소수점 둘째 자리까지 표시

    cpcDisplay.textContent = clickPower.toFixed(2); 
    
    // 공장 업데이트
    factoryCountDisplay.textContent = factory.count;
    factoryCostDisplay.textContent = factory.cost;

    // 뽑기 버튼 업데이트
    gachaCostDisplay.textContent = gachaCost;
    drawToolButton.disabled = cookies < gachaCost;
    
    workerGachaCostDisplay.textContent = workerGachaCost;
    drawWorkerButton.disabled = cookies < workerGachaCost;
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

    // 4. 능력치 및 보유 목록 업데이트
    let listItem = document.createElement('li');
    let color = 'black';
    
    if (type === 'tool') {
        // CPC 증가 로직
        clickPower *= (1 + drawnItem.bonus); 
        ownedTools.push(drawnItem);
        
        listItem.textContent = `${drawnItem.name} (클릭 파워 +${(drawnItem.bonus * 100).toFixed(0)}%, 등급: ${drawnItem.rarity})`;
        listItem.style.color = getItemColor(drawnItem.rarity);
        toolListDisplay.appendChild(listItem);
    
    } else if (type === 'worker') {
        // CPS 증가 로직
        cpsMultiplier *= (1 + drawnItem.bonus); 
        ownedWorkers.push(drawnItem);
        
        listItem.textContent = `${drawnItem.name} (CPS 승수 +${(drawnItem.bonus * 100).toFixed(0)}%, 등급: ${drawnItem.rarity})`;
        listItem.style.color = getItemColor(drawnItem.rarity);
        workerListDisplay.appendChild(listItem);
    }
}

// 헬퍼 함수: 희귀도에 따른 색상 지정
function getItemColor(rarity) {
    if (rarity === 'Uncommon') return 'green';
    if (rarity === 'Rare') return 'blue';
    if (rarity === 'Legendary') return 'purple';
    return 'black';
}

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

// 4. 일꾼 뽑기 이벤트 (NEW: CPS 증가)
drawWorkerButton.addEventListener('click', () => {
    if (cookies >= workerGachaCost) {
        cookies -= workerGachaCost;
        draw(workers, 'worker'); // 일꾼 정보와 타입을 전달
        workerGachaCost = Math.floor(workerGachaCost * 1.35); // 일꾼 뽑기 비용은 도구보다 더 가파르게 증가
        updateDisplay();
    }
});


// --- 함수: 방치형 루프 (자동 생산) ---
function productionLoop() {
    // totalCPS 변수를 다시 계산하여 사용
    const totalProduction = factory.count * factory.baseCps * cpsMultiplier;
    cookies += totalProduction;
    updateDisplay();
}

// 1초(1000ms)마다 productionLoop 함수 실행
setInterval(productionLoop, 1000);

// 초기 게임 상태 표시
updateDisplay();