// Global State
let boxHealth = 100;
let candlesBlown = 0;
const totalCandles = 5;

// Audio Elements
const alarm = document.getElementById('alarm');
const flame = document.getElementById('flame');
const siren = document.getElementById('sirenSound');
const boom = document.getElementById('boomSound');
const crack = document.getElementById('crackSound');
const finalMusic = document.getElementById('finalMusic');
const overlay = document.getElementById('effect-overlay');

// --- ATTEMPT AUDIO ON LOAD ---
window.addEventListener('load', () => {
    alarm.volume = 1;
    alarm.play();
    alarm.play().catch(e => console.log("Browser blocked autoplay."));
});

// --- PAGE 1 -> 2: FLAME EFFECT ---
function overrideAlarm() {
    alarm.pause();
    if (flame.paused) {
        flame.play();
    }


    overlay.classList.remove('hidden');
    overlay.classList.add('flame-effect');


    setTimeout(() => {
        overlay.classList.remove('flame-effect');
        overlay.classList.add('hidden');

        document.getElementById('page1').classList.add('hidden');
        document.getElementById('page2').classList.remove('hidden');

        flame.pause();
        siren.currentTime = 0;
        siren.play();
    }, 1500);
}

// --- PAGE 2 -> 3: BOOM SHATTER EFFECT ---
function pressDangerButton() {
    siren.pause();
    boom.volume = 1;

    document.body.classList.add('shake-screen');
    overlay.classList.remove('hidden');
    overlay.classList.add('shatter-effect');

    boom.play();

    setTimeout(() => {
        document.body.classList.remove('shake-screen');
        overlay.classList.add('hidden');
        overlay.classList.remove('shatter-effect');

        document.body.style.backgroundColor = '#000';
        document.getElementById('page2').classList.add('hidden');
        document.getElementById('page3').classList.remove('hidden');
    }, 500);
}

// --- STAGE 3 (Tap Box) ---
function tapBox() {
    const box = document.getElementById('box');
    const progress = document.getElementById('tapProgress');
    boxHealth -= 9;
    crack.currentTime = 0;
    crack.pause();
    box.classList.add('shake-hard');
    setTimeout(() => box.classList.remove('shake-hard'), 200);
    if (boxHealth <= 40) box.classList.add('box-breaking');
    if (boxHealth <= 15) box.innerHTML = '💥';
    progress.innerText = `Health: ${boxHealth > 0 ? boxHealth : 0}%`;
    if (boxHealth <= 0) {
        crack.play();
        box.style.display = 'none';
        progress.innerText = "Broken!";
        setTimeout(goToCakeStage, 1000);

        document.body.classList.add('shake-screen');
        overlay.classList.remove('hidden');
        overlay.classList.add('shatter-effect');

        setTimeout(() => {
            document.body.classList.remove('shake-screen');
            overlay.classList.add('hidden');
            overlay.classList.remove('shatter-effect');
            document.body.style.backgroundColor = '#000';
        }, 1000);
    }
}

// --- STAGE 3 to 4 (Go to Cake) ---
function goToCakeStage() {
    document.getElementById('page3').classList.add('hidden');
    document.getElementById('page4').classList.remove('hidden');
    initMicrophone();
}

// --- STAGE 4 (Mic Logic) - SENSITIVITY ---
async function initMicrophone() {
    const micStatus = document.getElementById('micStatus');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStatus.innerText = "Mic Active! Blow hard at your phone 🌬️";

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 2048;

        const bufferLength = analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);

        function checkBlow() {
            analyser.getByteTimeDomainData(dataArray);

            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                let val = (dataArray[i] - 128) / 128;
                sum += val * val;
            }
            let rms = Math.sqrt(sum / bufferLength);

            if (rms > 0.5) {
                blowOutCandle();
            }

            if (candlesBlown < totalCandles) requestAnimationFrame(checkBlow);
        }

        checkBlow();

    } catch (err) {
        micStatus.innerHTML = "<span style='color:red'>Mic access denied. Please refresh and allow mic permission.</span>";
    }
}

function blowOutCandle() {
    const flames = document.querySelectorAll('.candle-base .flame');
    const unlitFlames = Array.from(flames).filter(f => !f.classList.contains('out'));

    if (unlitFlames.length === 0) return;

    const randomIndex = Math.floor(Math.random() * unlitFlames.length);
    const flame = unlitFlames[randomIndex];

    flame.classList.add('out');
    candlesBlown++;

    if (candlesBlown === totalCandles) {
        document.getElementById('micStatus').innerText = "Happy Birthday! 🎉";
        setTimeout(goToFinale, 2000);
    }
}



// --- STAGE 5 (Finale) ---
function goToFinale() {
    finalMusic.volume = 1;
    finalMusic.play();
    document.getElementById('page4').classList.add('hidden');
    document.getElementById('page5').classList.remove('hidden');
    document.body.style.overflow = "auto";
    startConfetti();
}

// Confetti
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
const particles = [];
function startConfetti() {
    for (let i = 0; i < 200; i++) particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height - canvas.height,
        color: ['#ff6b81', '#ffd700', '#48dbfb'].sort(() => 0.5 - Math.random())[0],
        size: Math.random() * 10 + 5, speed: Math.random() * 5 + 2, angle: Math.random() * 6
    });
    animateConfetti();
}
function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
        p.y += p.speed; p.x += Math.sin(p.angle); ctx.fillStyle = p.color; ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        if (p.y > canvas.height) particles[i].y = -10;
    });
    requestAnimationFrame(animateConfetti);
}