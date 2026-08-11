// ===== 設定 =====
const hourlySalary = 275;
const workSeconds = 9 * 60 * 60;
const lunchBonus = 55;
const dinnerBonus = 60;

// ===== 加班設定 =====
const overtimeRate1 = 1.33;
const overtimeRate2 = 1.67;

const overtimeFirstStageSeconds = 2 * 60 * 60;

// ===== 畫面元件 =====
let started = false;
let startTime = null;
let endTime = null;
let bonusTimePoint = null;
let overtimeEligibleTime = null;
let coinTimer = null;
let overtimeStartTime = null;
let dinnerBonusClaimed = false;

let overtimeEnded = false;
let overtimeEndTime = null;

let lunchEventAdded = false;
let dinnerEventAdded = false;
// ===== 執行狀態 =====
const startInput = document.getElementById("startTime");
const startBtn = document.getElementById("startBtn");
const endOvertimeBtn = document.getElementById("endOvertimeBtn");

const money = document.getElementById("money");
const topSand = document.getElementById("topSand");
const bottomSand = document.getElementById("bottomSand");
const coins = document.getElementById("coins");
const percent = document.getElementById("percent");

const startText = document.getElementById("startText");
const endText = document.getElementById("endText");
const leftTime = document.getElementById("leftTime");

// ===== 加班畫面元件 =====
const bonusText = document.getElementById("bonusText");

const overtimePanel = document.getElementById("overtimePanel");
const overtimeStatus = document.getElementById("overtimeStatus");
const overtimeMoney = document.getElementById("overtimeMoney");
const overtimeHours = document.getElementById("overtimeHours");

const settledPayPanel = document.getElementById("settledPayPanel");
const settledBaseSalary = document.getElementById("settledBaseSalary");
const settledMealAllowance = document.getElementById("settledMealAllowance");
const settledOvertimePay = document.getElementById("settledOvertimePay");
const settledTotalPay = document.getElementById("settledTotalPay");

const hourglassArea = document.querySelector(".hourglass-area");

// ===== Event Menu =====
const eventMenuBtn = document.getElementById("eventMenuBtn");
const eventMenu = document.getElementById("eventMenu");
const eventControl = document.getElementById("eventControl");
const eventList = document.getElementById("eventList");

function addEvent(eventType) {

    const eventItem = document.createElement("div");
    eventItem.className = "event-item";

    if (eventType === "happy") {

        eventItem.textContent = "😊";

    } else if (eventType === "bad") {

        eventItem.textContent = "😭";

    } else if (eventType === "toilet") {

        eventItem.textContent = "💩";

    } else if (eventType === "lunch") {

        eventItem.innerHTML = `
            <div class="event-lunch-box">
                <div class="bento-inner">

                    <div class="bento-rice">
                        <span class="plum"></span>
                    </div>

                    <div class="bento-egg"></div>
                    <div class="bento-meat"></div>
                    <div class="bento-veg"></div>

                </div>
            </div>
        `;

    } else if (eventType === "dinner") {

        eventItem.innerHTML = `
            <div class="event-dinner-burger">
                <div class="burger-top"></div>
                <div class="burger-lettuce"></div>
                <div class="burger-meat"></div>
                <div class="burger-bottom"></div>
            </div>
        `;

    } else {

        return;

    }

    eventList.appendChild(eventItem);
}

// ===== 格式轉換 =====
function formatTime(date){

    let h = String(date.getHours()).padStart(2,"0");
    let m = String(date.getMinutes()).padStart(2,"0");

    return `${h}:${m}`;
}

function formatCountdown(sec){

    if(sec < 0) sec = 0;

    let h = Math.floor(sec / 3600);
    let m = Math.floor((sec % 3600) / 60);
    let s = Math.floor(sec % 60);

    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function calculateOvertimePay(overtimeSeconds) {

    if (overtimeSeconds <= 0)
        return 0;

    const firstStageSeconds = Math.min(
        overtimeSeconds,
        overtimeFirstStageSeconds
    );

    const secondStageSeconds = Math.max(
        overtimeSeconds - overtimeFirstStageSeconds,
        0
    );

    const firstStagePay =
        firstStageSeconds / 3600 *
        hourlySalary *
        overtimeRate1;

    const secondStagePay =
        secondStageSeconds / 3600 *
        hourlySalary *
        overtimeRate2;

    return firstStagePay + secondStagePay;
}

startBtn.onclick = function(){

    let value = startInput.value;

    if(value=="")
        return;

    let hh = Number(value.split(":")[0]);
    let mm = Number(value.split(":")[1]);

    startTime = new Date();

    startTime.setHours(hh);
    startTime.setMinutes(mm);
    startTime.setSeconds(0);

    endTime = new Date(startTime.getTime() + workSeconds * 1000);

    bonusTimePoint = new Date(startTime.getTime() + 10.5 * 60 * 60 * 1000);

    started = true;

    if (coinTimer == null) {
        startCoinAnimation(900);
    }

    startText.innerHTML = formatTime(startTime);

    endText.innerHTML = formatTime(endTime);

    bonusText.innerHTML = formatTime(bonusTimePoint);

    document.querySelector(".setup").style.display = "none";
    eventControl.hidden = false;

    overtimeStartTime = new Date(endTime.getTime() + 0.5 * 60 * 60 * 1000);
    overtimeEligibleTime = new Date(endTime.getTime() + 1.5 * 60 * 60 * 1000);

}

eventMenuBtn.onclick = function () {

    eventMenu.hidden = !eventMenu.hidden;

};

const eventButtons = document.querySelectorAll(".event-btn");

eventButtons.forEach(function (button) {

    button.onclick = function () {

        const eventType = button.dataset.event;

        addEvent(eventType);

        eventMenu.hidden = true;

    };

});

function update(){

    if(!started)
        return;

    let now = new Date();
    
    // 加班結束後，加班時間固定
    const overtimeNow = overtimeEnded? overtimeEndTime: now;

    let worked = (now - startTime) / 1000;

    if(worked < 0)
        worked = 0;

    if(worked > workSeconds)
        worked = workSeconds;
    
    // ===== 扣除 12:00～13:00 午休 =====
    const salaryTime = new Date(Math.min(now.getTime(), endTime.getTime()));

    const lunchStart = new Date(startTime);
    lunchStart.setHours(12, 0, 0, 0);

    const lunchEnd = new Date(startTime);
    lunchEnd.setHours(13, 0, 0, 0);

    const lunchSeconds = Math.max(
        0,
        (
            Math.min(salaryTime.getTime(), lunchEnd.getTime()) -
            Math.max(startTime.getTime(), lunchStart.getTime())
        ) / 1000
    );

    const paidSeconds = Math.max(0, worked - lunchSeconds);

    let salary = paidSeconds / 3600 * hourlySalary;

    // ===== 13:30 便當 =====
    const lunchBonusTime = new Date(startTime);
    lunchBonusTime.setHours(13, 30, 0, 0);

    if (now >= lunchBonusTime) {

        salary += lunchBonus;

        if (!lunchEventAdded) {
            addEvent("lunch");
            lunchEventAdded = true;
        }

    }

    let progress = worked / workSeconds * 100;

    topSand.style.height = (100 - progress) + "%";
    bottomSand.style.height = progress + "%";

    percent.innerHTML = progress.toFixed(1) + "%";

    let remain = (endTime - now) / 1000;

    leftTime.innerHTML = formatCountdown(remain);

    // ===== 加班計算 =====
    let overtimeSeconds = (overtimeNow - overtimeStartTime) / 1000;

    if (overtimeNow >= overtimeEligibleTime) {

        // 加班以半小時為單位結算
        const settledOvertimeSeconds =
            Math.floor(overtimeSeconds / (30 * 60)) * (30 * 60);

        const overtimePay = calculateOvertimePay(
            overtimeEnded
                ? settledOvertimeSeconds
                : overtimeSeconds
        );

        // ===== 加班滿兩小時，增加晚餐補助 =====
        const hasDinnerBonus = overtimeSeconds >= 2 * 60 * 60;
        const dinnerBonusPay = hasDinnerBonus ? dinnerBonus : 0;
        const totalPay = salary + overtimePay + dinnerBonusPay;

        if (hasDinnerBonus && !dinnerBonusClaimed) {

            dinnerBonusClaimed = true;

            if (!dinnerEventAdded) {
                addEvent("dinner");
                dinnerEventAdded = true;
            }

        }

        overtimeStatus.innerHTML = "ACTIVE";
        overtimeHours.innerHTML = formatCountdown(overtimeSeconds);
        overtimeMoney.innerHTML = "NT$" + overtimePay.toFixed(2);

        hourglassArea.classList.add("overtime-active");

        // 正常薪資 + 加班費
        if (!overtimeEnded) {
            money.innerHTML = "NT$" + totalPay.toFixed(2);
        }

        if (hourglassArea.classList.contains("overtime-active") == false) {

            hourglassArea.classList.add("overtime-active");
            startCoinAnimation(250);

        }

    } else {

        overtimeStatus.innerHTML = "NOT STARTED";
        overtimeHours.innerHTML = "00:00:00";
        overtimeMoney.innerHTML = "NT$0.00";

        // 還沒加班，只顯示正常薪資
        money.innerHTML = "NT$" + salary.toFixed(2);

        hourglassArea.classList.remove("overtime-active");
        if (hourglassArea.classList.contains("overtime-active")) {

            hourglassArea.classList.remove("overtime-active");
            startCoinAnimation(900);

        }
    }
}

function startCoinAnimation(interval) {

    if (coinTimer != null) {
        clearInterval(coinTimer);
    }

    coinTimer = setInterval(createCoin, interval);

}

function createCoin() {

    const coin = document.createElement("div");
    coin.className = "coin";
    coin.innerHTML = "$";

    const randomX = Math.floor(Math.random() * 161) - 80;

    coin.style.setProperty("--coin-x", randomX + "px");

    coins.appendChild(coin);

    setTimeout(() => {
        coin.remove();
    }, 2000);
}
endOvertimeBtn.onclick = function () {

    if (overtimeEnded)
        return;

    overtimeEnded = true;
    overtimeEndTime = new Date();

    const overtimeSeconds =
        (overtimeEndTime - overtimeStartTime) / 1000;

    // 正式加班費以半小時為單位，未滿半小時不計
    const settledOvertimeSeconds =
        Math.floor(
            Math.max(0, overtimeSeconds) / (30 * 60)
        ) * (30 * 60);

    const officialOvertimePay =
        overtimeEndTime >= overtimeEligibleTime
            ? calculateOvertimePay(settledOvertimeSeconds)
            : 0;

    // 正常一天：工作 9 小時，扣 1 小時午休
    const baseSalary =
        hourlySalary * 8;

    // 13:30 後有午餐補助
    const lunchBonusTime = new Date(startTime);
    lunchBonusTime.setHours(13, 30, 0, 0);

    const officialLunchBonus =
        overtimeEndTime >= lunchBonusTime
            ? lunchBonus
            : 0;

    // 加班滿兩小時有晚餐補助
    const officialDinnerBonus =
        overtimeSeconds >= 2 * 60 * 60
            ? dinnerBonus
            : 0;

    const mealAllowance =
        officialLunchBonus + officialDinnerBonus;

    const officialTotalPay = baseSalary + mealAllowance + officialOvertimePay;

    settledBaseSalary.innerHTML = "NT$" + baseSalary.toFixed(2);
    settledMealAllowance.innerHTML ="NT$" + mealAllowance.toFixed(2);
    settledOvertimePay.innerHTML = "NT$" + officialOvertimePay.toFixed(2);
    settledTotalPay.innerHTML = "NT$" + officialTotalPay.toFixed(2);
    settledPayPanel.hidden = false;

};

setInterval(update,100);