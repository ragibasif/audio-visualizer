// music player
// TODO: add volume button for the song
const song = document.getElementById("song");
const scrollBarContainer = document.getElementById("scroll-bar-container");
const scrollBar = document.getElementById("scroll-bar");
const currentTimeOfSong = document.getElementById("time");
const durationTimeOfSong = document.getElementById("duration");
const previousBtn = document.getElementById("previous");
const playBtn = document.getElementById("play");
const nextBtn = document.getElementById("next");
const muteBtn = document.getElementById("mute");
const image = document.getElementById("image");
const title = document.getElementById("title");
const artist = document.getElementById("artist");

// array of songs
// TODO: move to a separate json file
const songs = [
  {
    songFile: "aggressive-break.mp3",
    songName: "Aggressive Break",
  },
  {
    songFile: "breeze-groove.mp3",
    songName: "Breeze Groove",
  },
  {
    songFile: "electro-summer.mp3",
    songName: "Electro Summer",
  },
  {
    songFile: "garage-days.mp3",
    songName: "Garage Days",
  },
  {
    songFile: "happy-rock.mp3",
    songName: "Happy Rock",
  },
  {
    songFile: "powerful-metal.mp3",
    songName: "Powerful Metal",
  },
  {
    songFile: "sport-rock.mp3",
    songName: "Sport Rock",
  },
  {
    songFile: "sunrise-groove.mp3",
    songName: "Sunrise Groove",
  },
  {
    songFile: "upbeat-happy.mp3",
    songName: "Upbeat Happy",
  },
];

// toggle play/pause
let isPlaying = false;

function playSong() {
  isPlaying = true;
  playBtn.classList.replace("fa-play", "fa-pause");
  song.play();
}

function pauseSong() {
  isPlaying = false;
  playBtn.classList.replace("fa-pause", "fa-play");
  song.pause();
}

const playOrPause = () => (isPlaying ? pauseSong() : playSong());

const canvasToggler = document.getElementById("visualizer");
playBtn.addEventListener("click", () => {
  playOrPause();
});

// update song
function loadSong(currSong) {
  title.textContent = currSong.songName;
  song.src = `music/${currSong.songFile}`;
}

let songIndex = 0;
function previousSong() {
  if (songIndex > 0) {
    songIndex--;
  } else {
    songIndex = songs.length - 1;
  }
  loadSong(songs[songIndex]);
  playSong();
}
function nextSong() {
  if (songIndex < songs.length - 1) {
    songIndex++;
  } else {
    songIndex = 0;
  }
  loadSong(songs[songIndex]);
  playSong();
}

// scroll bar/time
function updateScrollBar(event) {
  if (isPlaying) {
    const { duration, currentTime } = event.srcElement;
    const progressPercent = (currentTime / duration) * 100;
    scrollBar.style.width = `${progressPercent}%`;
    const durationMinutes = Math.floor(duration / 60);
    let durationSeconds = Math.floor(duration % 60);
    if (durationSeconds < 10) {
      durationSeconds = `0${durationSeconds}`;
    }
    if (durationSeconds) {
      durationTimeOfSong.textContent = `${durationMinutes}:${durationSeconds}`;
    }
    const currentMinutes = Math.floor(currentTime / 60);
    let currentSeconds = Math.floor(currentTime % 60);
    if (currentSeconds < 10) {
      currentSeconds = `0${currentSeconds}`;
    }
    currentTimeOfSong.textContent = `${currentMinutes}:${currentSeconds}`;
  }
}

function changeProgress(event) {
  const width = this.clientWidth;
  const clickX = event.offsetX;
  const { duration } = song;
  song.currentTime = (clickX / width) * duration;
  if (!isPlaying) {
    scrollBar.style.width = `${(song.currentTime / duration) * 100}%`;
    const durationMinutes = Math.floor(duration / 60);
    let durationSeconds = Math.floor(duration % 60);
    if (durationSeconds < 10) {
      durationSeconds = `0${durationSeconds}`;
    }
    if (durationSeconds) {
      durationTimeOfSong.textContent = `${durationMinutes}:${durationSeconds}`;
    }
    const currentMinutes = Math.floor(song.currentTime / 60);
    let currentSeconds = Math.floor(song.currentTime % 60);
    if (currentSeconds < 10) {
      currentSeconds = `0${currentSeconds}`;
    }
    currentTimeOfSong.textContent = `${currentMinutes}:${currentSeconds}`;
  }
}

previousBtn.addEventListener("click", previousSong);
nextBtn.addEventListener("click", nextSong);
song.addEventListener("timeupdate", updateScrollBar);
song.addEventListener("ended", nextSong);
scrollBarContainer.addEventListener("click", changeProgress);

// audio visualizer

const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let analyzer = audioContext.createAnalyser(); // Changed from analyser to analyzer
let source = audioContext.createMediaElementSource(song);

source.connect(analyzer);
analyzer.connect(audioContext.destination);

analyzer.fftSize = 256; // bar size: higher number = thinner bars
const bufferLength = analyzer.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

function createOrResumeAudioContext() {
  audioContext.resume();
}
function handleUserGesture() {
  createOrResumeAudioContext();
}

document.getElementById("play").addEventListener("click", handleUserGesture);

function setupVisualizer() {
  canvas.width = window.innerWidth * 0.9;
  canvas.height = window.innerHeight * 0.5;
}

// Initialize visualizer
setupVisualizer();

// adjust canvas width on window resize
window.addEventListener("resize", function () {
  setupVisualizer();
});

function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);

  analyzer.getByteFrequencyData(dataArray);

  const barWidth = canvas.width / bufferLength;
  const barHeightMultiplier = canvas.height / 256; // Adjusts the height of the bars based on canvas height

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < bufferLength; i++) {
    const barHeight = dataArray[i] * barHeightMultiplier;
    const x = i * barWidth;
    const y = canvas.height - barHeight;

    // Calculate gradient color stops dynamically based on the audio data
    const colorStopPosition = dataArray[i] / 255; // Normalize to [0, 1]
    const gradient = ctx.createLinearGradient(
      x,
      y,
      x + barWidth,
      y + barHeight
    );
    gradient.addColorStop(0, `rgb(110, 33, 194)`); // Blue at the start
    gradient.addColorStop(colorStopPosition, `rgb(255, 107, 100)`); // Yellow at the peak
    gradient.addColorStop(1, `rgb(252, 10, 110)`); // Red at the end

    ctx.fillStyle = gradient;

    // mirror
    ctx.fillRect(canvas.width / 2 - x, y, barWidth, barHeight);
    ctx.fillRect(canvas.width / 2 + x, y, barWidth, barHeight);
  }
}

drawVisualizer();
