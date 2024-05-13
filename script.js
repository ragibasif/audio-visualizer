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
}

function pauseSong() {
  isPlaying = false;
  playBtn.classList.replace("fa-pause", "fa-play");
  song.pause();
}

playBtn.addEventListener("click", () => (isPlaying ? pauseSong() : playSong()));

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

function changeProgress (event) {
  const width = this.clientWidth;
  const clickX = event.offsetX;
  const {duration} = song;
  song.currentTime = (clickX / width) * duration;
}

previousBtn.addEventListener("click", previousSong);
nextBtn.addEventListener("click", nextSong);
song.addEventListener("timeupdate", updateScrollBar);
song.addEventListener("ended", nextSong);
scrollBarContainer.addEventListener('click', changeProgress);
