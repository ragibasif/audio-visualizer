window.onload = function() {
    const audio = document.getElementById("audio");
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const canvas = document.getElementById("visualizer");
    const ctx = canvas.getContext("2d");

    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.0;
        let x = 0;

        dataArray.forEach(function(data, index) {
            const barHeight = data * 1;

            const r = barHeight + (25 * (index / bufferLength)) * Math.random();
            const g = 250 * (index / bufferLength)* Math.random();
            const b = 50 + barHeight * Math.random();

            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        });
    }

    draw();
};
