// music player
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
const playlistElement = document.getElementById("playlist");

// array of songs

let isPlaying = false;
let songs = [];

let songIndex = 0;

fetch("songs.json")
  .then((response) => response.json())
  .then((data) => {
    data.forEach((track) => {
      songs.push(track);
    });
  })
  .catch((error) => console.error("Error fetching the JSON data:", error));

// toggle play/pause

function playSong() {
  playBtn.classList.replace("fa-play", "fa-pause");
  song.src = `${songs[songIndex].src}`;
  song.play();
  isPlaying = true;
}

function pauseSong() {
  playBtn.classList.replace("fa-pause", "fa-play");
  song.src = `${songs[songIndex].src}`;
  song.pause();
  isPlaying = false;
}

const playOrPause = () => (isPlaying ? pauseSong() : playSong());

// const canvasToggler = document.getElementById("visualizer");
playBtn.addEventListener("click", () => {
  playOrPause();
});

// update song
function loadSong(index) {
  if (index >= 0 && index < songs.length) {
    const track = songs[index];
    song.src = track.src;
    updatePlaylistUI();
  } else {
    console.error("Invalid track index:", index);
  }
}

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

function selectSong(index) {
  songIndex = index;
  loadSong(songIndex);
  playSong();
}

function updatePlaylistUI() {
  playlistElement.innerText = "";
  songs.forEach((track, index) => {
    const li = document.createElement("li");
    li.textContent = track.name;
    li.onclick = () => selectSong(track.id);
    if (track.id === songIndex) {
      li.classList.add("active");
    }
    playlistElement.appendChild(li);
  });
}

loadSong(songIndex);
updatePlaylistUI();
window.onload = (event) => {
  updatePlaylistUI();
};

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

// playlist ui

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
