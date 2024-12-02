document.addEventListener('DOMContentLoaded', function() {
    const audioUpload = document.getElementById('audio-upload');
    const canvas = document.getElementById('visualizer');
    const settingsButton = document.getElementById('settings-button');
    const settings = document.getElementById('settings');
    const closeSettingsButton = document.getElementById('close-settings');
    let audioContext, source, analyser, dataArray, bufferLength, canvasContext, audioBuffer;
    let isPlaying = false;
    let hue = 0;

    let sensitivity = 5;
    let squareRange = 5;
    let waveRange = 5;
    let ringRange = 5;
    let blobRange = 5;

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        canvasContext = canvas.getContext('2d');
        canvasContext.scale(dpr, dpr);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    if (audioUpload && canvas) {
        audioUpload.addEventListener('change', function(event) {
            const file = event.target.files[0];
            const reader = new FileReader();

            reader.onload = function(fileEvent) {
                if (audioContext) {
                    audioContext.close();
                }
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                canvasContext = canvas.getContext('2d');

                audioContext.decodeAudioData(fileEvent.target.result, function(buffer) {
                    audioBuffer = buffer;
                    setupAudioNodes();
                    draw();
                });
            };

            reader.readAsArrayBuffer(file);
        });

        // Load default audio
        fetch('assets/default.mp3')
            .then(response => response.arrayBuffer())
            .then(data => {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                canvasContext = canvas.getContext('2d');
                audioContext.decodeAudioData(data, function(buffer) {
                    audioBuffer = buffer;
                    setupAudioNodes();
                    draw();
                });
            })
            .catch(error => console.error('Error loading default audio:', error));
    } else {
        console.error('Required elements not found');
    }

    function setupAudioNodes() {
        source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        analyser = audioContext.createAnalyser();
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        analyser.fftSize = 2048;
        bufferLength = analyser.fftSize;
        dataArray = new Uint8Array(bufferLength);
    }

    function draw() {
        requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);

        canvasContext.clearRect(0, 0, canvas.width, canvas.height);

        // Draw outer ring as waveform visualizer
        const ringRadius = 200;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        canvasContext.lineWidth = 4; // Thicker lines
        canvasContext.beginPath();
        for (let i = 0; i < bufferLength; i++) {
            const angle = (i / bufferLength) * Math.PI * 2;
            const radius = ringRadius + (dataArray[i] - 128) * ringRange * 0.1;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            if (i === 0) {
                canvasContext.moveTo(x, y);
            } else {
                canvasContext.lineTo(x, y);
            }
        }
        canvasContext.closePath();
        canvasContext.strokeStyle = 'white';
        canvasContext.stroke();

        // Draw inner blob
        const lowFrequencyVolume = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
        const blobRadius = 50 + lowFrequencyVolume * blobRange * 0.1;
        const blobColor = `rgb(${255 - lowFrequencyVolume}, ${lowFrequencyVolume}, 0)`;
        canvasContext.fillStyle = blobColor;
        canvasContext.beginPath();
        canvasContext.arc(centerX, centerY, blobRadius, 0, Math.PI * 2);
        canvasContext.fill();
    }

    settingsButton.addEventListener('click', () => {
        settings.classList.add('show');
    });

    closeSettingsButton.addEventListener('click', () => {
        settings.classList.remove('show');
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
});