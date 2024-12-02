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

    // Draw sawtooth waves
    const sawtoothHeight = averageVolume * waveRange * 0.1;
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(0, 50);
    for (let i = 0; i < canvas.width; i += 50) {
        ctx.lineTo(i + 25, 50 - sawtoothHeight);
        ctx.lineTo(i + 50, 50);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 150);
    for (let i = 0; i < canvas.width; i += 50) {
        ctx.lineTo(i + 25, 150 - sawtoothHeight);
        ctx.lineTo(i + 50, 150);
    }
    ctx.stroke();

    // Draw outer ring
    const ringRadius = 200 + averageVolume * ringRange * 0.1;
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw inner blob
    const lowFrequencyVolume = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
    const blobRadius = 50 + lowFrequencyVolume * blobRange * 0.1;
    const blobColor = `rgb(${255 - lowFrequencyVolume}, ${lowFrequencyVolume}, 0)`;
    ctx.fillStyle = blobColor;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, blobRadius, 0, Math.PI * 2);
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