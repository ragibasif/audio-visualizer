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
const image = document.getElementById("image");
const title = document.getElementById("title");
const artist = document.getElementById("artist");

// array of songs
// TODO: move to a separate json file
const songs = [
  {
    songFile: "BobDylanLikeARollingStone.mp3",
    songName: "Like A Rolling Stone",
    artistName: "Bob Dylan",
    imageFile: "bobdylan.jpeg",
  },
  {
    songFile: "DavidBowieLifeOnMars.mp3",
    songName: "Life On Mars",
    artistName: "David Bowie",
    imageFile: "davidbowie.jpg",
  },
  {
    songFile: "EltonJohnYourSong.mp3",
    songName: "Your Song",
    artistName: "Elton John",
    imageFile: "eltonjohn.jpg",
  },
  {
    songFile: "MichaelJacksonTheWayYouMakeMeFeel.mp3",
    songName: "The Way You Make Me Feel",
    artistName: "Michael Jackson",
    imageFile: "michaeljackson.jpeg",
  },
  {
    songFile: "QueenDontStopMeNow.mp3",
    songName: "Don't Stop Me Now",
    artistName: "Queen",
    imageFile: "queen.jpeg",
  },
];

// toggle play/pause
let isPlaying = false;

function playSong() {
  isPlaying = true;
  playBtn.classList.replace("fa-play", "fa-pause");
  song.play();
  canvas.style.display === "block";
}

function pauseSong() {
  isPlaying = false;
  playBtn.classList.replace("fa-pause", "fa-play");
  song.pause();
  canvas.style.display === "none";
}

const playOrPause = () => (isPlaying ? pauseSong() : playSong());

const canvasToggler = document.getElementById("visualizer");
const toggleVisualizer = () => {
  if (canvas.style.display === "block") {
    canvas.style.display = "none";
  } else {
    canvas.style.display = "block";
  }
};
playBtn.addEventListener("click", () => {
  playOrPause();
  toggleVisualizer();
});

// update song
function loadSong(currSong) {
  title.textContent = currSong.songName;
  artist.textContent = currSong.artistName;
  song.src = `music/${currSong.songFile}`;
  image.src = `img/${currSong.imageFile}`;
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

source.connect(analyzer); // Changed from analyser to analyzer
analyzer.connect(audioContext.destination);

analyzer.fftSize = 256;
const bufferLength = analyzer.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

function getRandomInt(max) {
  return Math.floor(Math.random() * max) + 3;
}

let randomN = getRandomInt(250);

function createOrResumeAudioContext() {
  audioContext.resume();
}
function handleUserGesture() {
  createOrResumeAudioContext();
}

document.getElementById("play").addEventListener("click", handleUserGesture);

function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);

  analyzer.getByteFrequencyData(dataArray); // Changed from analyser to analyzer

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(canvas.width, canvas.height) / 2;

  const sliceAngle = (6 * Math.PI) / bufferLength;

  ctx.fillStyle = "(0,0,0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < bufferLength; i++) {
    const barHeight = dataArray[i] / 2;

    const x = centerX + Math.cos(sliceAngle * i) * (radius - barHeight);
    const y = centerY + Math.sin(sliceAngle * i) * (radius - barHeight);
    const xEnd = centerX + Math.cos(sliceAngle * i) * radius;
    const yEnd = centerY + Math.sin(sliceAngle * i) * radius;

    const gradient = ctx.createLinearGradient(x, y, xEnd, yEnd);
    gradient.addColorStop(0, `rgb(${randomN}, 0, 0)`);
    gradient.addColorStop(0.1, `rgb(${randomN}, 50, 0)`);
    gradient.addColorStop(0.2, `rgb(${randomN}, 0, 50)`);
    gradient.addColorStop(0.3, `rgb(${randomN}, 50, 50)`);
    gradient.addColorStop(0.4, `rgb(50, 0, ${randomN})`);
    gradient.addColorStop(0.5, `rgb(0, ${randomN}, 0)`);
    gradient.addColorStop(0.6, `rgb(50, ${randomN}, 0)`);
    gradient.addColorStop(0.7, `rgb(0, ${randomN}, 50)`);
    gradient.addColorStop(0.8, `rgb(50, ${randomN}, 50)`);
    gradient.addColorStop(0.9, `rgb(0, 50, ${randomN})`);
    gradient.addColorStop(1, `rgb(0, 0, ${randomN})`);
    ctx.strokeStyle = gradient;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(xEnd, yEnd);
    ctx.stroke();
  }
}

drawVisualizer();
