// ===== 設定 =====
const hourlySalary = 272.95;
const workSeconds = 9 * 60 * 60;

// ===== 畫面元件 =====
let started = false;
let startTime = null;
let endTime = null;
let bonusTimePoint = null;

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
const bonusText = document.getElementById("bonusText");

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

startBtn.onclick = function(){

    let value = startInput.value;
    let coinTimer = null;

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
    coinTimer = setInterval(createCoin, 900);
    }

    startText.innerHTML = formatTime(startTime);

    endText.innerHTML = formatTime(endTime);

    bonusText.innerHTML = formatTime(bonusTimePoint);

    document.querySelector(".setup").style.display = "none";

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

    money.innerHTML = "NT$" + salary.toFixed(2);

    let progress = worked / workSeconds * 100;

    topSand.style.height = (100 - progress) + "%";
    bottomSand.style.height = progress + "%";

    percent.innerHTML = progress.toFixed(1) + "%";

    let remain = (endTime - now) / 1000;

    leftTime.innerHTML = formatCountdown(remain);

}

function createCoin() {

    const coin = document.createElement("div");
    coin.className = "coin";
    coin.innerHTML = "$";

    coins.appendChild(coin);

    setTimeout(() => {
        coin.remove();
    }, 2000);
}

setInterval(update,100);