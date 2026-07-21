// ===== 設定 =====
const hourlySalary = 272.95;
const workSeconds = 9 * 60 * 60;

// ===== 加班設定 =====
const overtimeRate1 = 1.33;
const overtimeRate2 = 1.87;

const overtimeFirstStageSeconds = 2 * 60 * 60;

// ===== 畫面元件 =====
let started = false;
let startTime = null;
let endTime = null;
let bonusTimePoint = null;
let overtimeEligibleTime = null;
let coinTimer = null;

// ===== 執行狀態 =====
const startInput = document.getElementById("startTime");
const startBtn = document.getElementById("startBtn");

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
const overtimeProgressBar = document.getElementById("overtimeProgressBar");
const overtimeHours = document.getElementById("overtimeHours");

const hourglassArea = document.querySelector(".hourglass-area");


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

    overtimeEligibleTime = new Date(
        endTime.getTime() + 1.5 * 60 * 60 * 1000
    );

}

function update(){

    if(!started)
        return;

    let now = new Date();

    let worked = (now - startTime) / 1000;

    if(worked < 0)
        worked = 0;

    if(worked > workSeconds)
        worked = workSeconds;

    let salary = worked / 3600 * hourlySalary;

    let progress = worked / workSeconds * 100;

    topSand.style.height = (100 - progress) + "%";
    bottomSand.style.height = progress + "%";

    percent.innerHTML = progress.toFixed(1) + "%";

    let remain = (endTime - now) / 1000;

    leftTime.innerHTML = formatCountdown(remain);

    // ===== 加班計算 =====
    let overtimeSeconds = (now - overtimeEligibleTime) / 1000;

    if (overtimeSeconds > 0) {

        const overtimePay = calculateOvertimePay(overtimeSeconds);
        const totalPay = salary + overtimePay;

        overtimeStatus.innerHTML = "ACTIVE";
        overtimeHours.innerHTML = formatCountdown(overtimeSeconds);
        overtimeMoney.innerHTML = "NT$" + overtimePay.toFixed(2);

        hourglassArea.classList.add("overtime-active");

        // 正常薪資 + 加班費
        money.innerHTML = "NT$" + totalPay.toFixed(2);
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

setInterval(update,100);