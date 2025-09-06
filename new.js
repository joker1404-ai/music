let trackList = [];
let trackIndex = 0;
let isPlaying = false;
let currTrack = new Audio();

let trackArt = document.querySelector(".track-art");
let trackName = document.querySelector(".track-name");
let trackArtist = document.querySelector(".track-artist");
let playPauseBtn = document.querySelector(".playpause-track i");
let seekSlider = document.querySelector(".seek_slider");
let volumeSlider = document.querySelector(".volume_slider");
let currentTimeEl = document.querySelector(".current-time");
let totalDurationEl = document.querySelector(".total-duration");
let trackIndexEl = document.getElementById("trackIndex");
let trackTotalEl = document.getElementById("trackTotal");

// === FOLDER INPUT ===
document.getElementById("musicFolder").addEventListener("change", function (event) {
  trackList = [];
  for (let file of event.target.files) {
    if (file.type.startsWith("audio/")) {
      trackList.push({
        name: file.name,
        artist: "Unknown",
        file: file, // keep file for cover art
        path: URL.createObjectURL(file)
      });
    }
  }

  if (trackList.length > 0) {
    trackTotalEl.textContent = trackList.length;
    trackIndex = 0;
    loadTrack(trackIndex);
    playTrack();
  }
});

// === LOAD TRACK ===
function loadTrack(index) {
  currTrack.src = trackList[index].path;
  currTrack.load();

  trackName.textContent = trackList[index].name;
  trackArtist.textContent = trackList[index].artist;
  trackArt.style.backgroundImage = "url('https://via.placeholder.com/150?text=♪')";
  trackIndexEl.textContent = index + 1;

  // Try reading embedded cover art
  window.jsmediatags.read(trackList[index].file, {
    onSuccess: function(tag) {
      let picture = tag.tags.picture;
      if (picture) {
        let base64String = "";
        for (let i = 0; i < picture.data.length; i++) {
          base64String += String.fromCharCode(picture.data[i]);
        }
        let imageUri = `data:${picture.format};base64,${window.btoa(base64String)}`;
        trackArt.style.backgroundImage = `url(${imageUri})`;
      }
    },
    onError: function(error) {
      console.log("No cover art:", error);
    }
  });

  seekSlider.value = 0;
  currentTimeEl.textContent = "00:00";
  totalDurationEl.textContent = "00:00";
}

// === PLAY/PAUSE ===
function playpauseTrack() {
  if (!isPlaying) playTrack();
  else pauseTrack();
}

function playTrack() {
  currTrack.play().then(() => {
    isPlaying = true;
    playPauseBtn.classList.remove("fa-play-circle");
    playPauseBtn.classList.add("fa-pause-circle");
  }).catch(err => console.log("Play blocked:", err));
}

function pauseTrack() {
  currTrack.pause();
  isPlaying = false;
  playPauseBtn.classList.remove("fa-pause-circle");
  playPauseBtn.classList.add("fa-play-circle");
}

// === NEXT / PREV ===
function nextTrack() {
  trackIndex = (trackIndex + 1) % trackList.length;
  loadTrack(trackIndex);
  playTrack();
}

function prevTrack() {
  trackIndex = (trackIndex - 1 + trackList.length) % trackList.length;
  loadTrack(trackIndex);
  playTrack();
}

// === SEEK & VOLUME ===
function seekTo() {
  let seekto = currTrack.duration * (seekSlider.value / 100);
  currTrack.currentTime = seekto;
}

function setVolume() {
  currTrack.volume = volumeSlider.value / 100;
}

// === UPDATE TIME ===
currTrack.addEventListener("timeupdate", () => {
  if (!isNaN(currTrack.duration)) {
    let progress = (currTrack.currentTime / currTrack.duration) * 100;
    seekSlider.value = progress;

    let currentMinutes = Math.floor(currTrack.currentTime / 60);
    let currentSeconds = Math.floor(currTrack.currentTime % 60);
    let durationMinutes = Math.floor(currTrack.duration / 60);
    let durationSeconds = Math.floor(currTrack.duration % 60);

    if (currentSeconds < 10) currentSeconds = "0" + currentSeconds;
    if (durationSeconds < 10) durationSeconds = "0" + durationSeconds;

    currentTimeEl.textContent = currentMinutes + ":" + currentSeconds;
    totalDurationEl.textContent = durationMinutes + ":" + durationSeconds;
  }
});

// === AUTO NEXT ===
currTrack.addEventListener("ended", nextTrack);
