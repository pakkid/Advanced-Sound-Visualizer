const audio = document.getElementById('audio');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
const settingsButton = document.getElementById('settings-button');
const settings = document.getElementById('settings');
const audioUpload = document.getElementById('audio-upload');
const sensitivitySlider = document.getElementById('sensitivity');
const squareRangeSlider = document.getElementById('square-range');
const waveRangeSlider = document.getElementById('wave-range');
const ringRangeSlider = document.getElementById('ring-range');
const blobRangeSlider = document.getElementById('blob-range');
const closeSettingsButton = document.getElementById('close-settings');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioSource = audioContext.createMediaElementSource(audio);
const analyser = audioContext.createAnalyser();
audioSource.connect(analyser);
analyser.connect(audioContext.destination);
analyser.fftSize = 256;

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

let sensitivity = 5;
let squareRange = 5;
let waveRange = 5;
let ringRange = 5;
let blobRange = 5;

function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate average volume
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
    }
    const averageVolume = sum / bufferLength;

    // Draw sawtooth waves
    const sawtoothHeight = averageVolume * waveRange * 0.1;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    for (let y = 0; y < canvas.height; y += 100) {
        ctx.beginPath();
        ctx.moveTo(0, y + 50);
        for (let x = 0; x < canvas.width; x += 50) {
            ctx.lineTo(x + 25, y + 50 - sawtoothHeight);
            ctx.lineTo(x + 50, y + 50);
        }
        ctx.stroke();
    }

    // Draw rotating squares in the corners
    const squareSize = 50 + averageVolume * squareRange * 0.1;
    const rotation = averageVolume * sensitivity * 0.01;
    const color = `rgb(${averageVolume}, 0, 0)`;

    ctx.save();
    ctx.translate(35, 35);
    ctx.rotate(rotation);
    ctx.fillStyle = color;
    ctx.fillRect(-squareSize / 2, -squareSize / 2, squareSize, squareSize);
    ctx.restore();

    ctx.save();
    ctx.translate(canvas.width - 35, 35);
    ctx.rotate(rotation);
    ctx.fillStyle = color;
    ctx.fillRect(-squareSize / 2, -squareSize / 2, squareSize, squareSize);
    ctx.restore();

    ctx.save();
    ctx.translate(35, canvas.height - 35);
    ctx.rotate(rotation);
    ctx.fillStyle = color;
    ctx.fillRect(-squareSize / 2, -squareSize / 2, squareSize, squareSize);
    ctx.restore();

    ctx.save();
    ctx.translate(canvas.width - 35, canvas.height - 35);
    ctx.rotate(rotation);
    ctx.fillStyle = color;
    ctx.fillRect(-squareSize / 2, -squareSize / 2, squareSize, squareSize);
    ctx.restore();

    // Draw outer ring as waveform visualizer
    const ringRadius = 200;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < bufferLength; i++) {
        const angle = (i / bufferLength) * Math.PI * 2;
        const radius = ringRadius + dataArray[i] * ringRange * 0.1;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.stroke();

    // Draw inner blob
    const lowFrequencyVolume = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
    const blobRadius = 50 + lowFrequencyVolume * blobRange * 0.1;
    const blobColor = `rgb(${255 - lowFrequencyVolume}, ${lowFrequencyVolume}, 0)`;
    ctx.fillStyle = blobColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, blobRadius, 0, Math.PI * 2);
    ctx.fill();
}

audio.addEventListener('play', () => {
    audioContext.resume().then(() => {
        draw();
    });
});

settingsButton.addEventListener('click', () => {
    settings.classList.add('show');
});

closeSettingsButton.addEventListener('click', () => {
    settings.classList.remove('show');
});

audioUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        audio.src = url;
        audio.play();
    }
});

sensitivitySlider.addEventListener('input', (event) => {
    sensitivity = event.target.value;
});

squareRangeSlider.addEventListener('input', (event) => {
    squareRange = event.target.value;
});

waveRangeSlider.addEventListener('input', (event) => {
    waveRange = event.target.value;
});

ringRangeSlider.addEventListener('input', (event) => {
    ringRange = event.target.value;
});

blobRangeSlider.addEventListener('input', (event) => {
    blobRange = event.target.value;
});