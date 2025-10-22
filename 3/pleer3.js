class AudioPlayer {
    constructor(containerId, playerId, albumData) {
        this.container = document.getElementById(containerId);
        this.playerId = playerId;
        this.albumData = albumData;
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.elements = {};
        
        this.init();
    }

    init() {
        this.createPlayer();
        this.createPlaylist();
        this.loadTrack(this.currentTrackIndex);
        this.setupEventListeners();
    }

    createPlayer() {
        this.container.innerHTML = `
            <div class="player-container">
                <div class="player-title">${this.albumData.title} - ${this.playerId}</div>
                <div class="album-cover">
                    <img src="https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/cb/f6/34/cbf6347b-65ad-53f1-4a5e-e9eb2f64133d/cover.png/600x600bf-60.jpg" alt="Обложка альбома">
                </div>
                <div class="progress-container">
                    <div class="progress-bar" id="progressBar-${this.playerId}">
                        <div class="progress" id="progress-${this.playerId}"></div>
                    </div>
                    <div class="time-info">
                        <span id="currentTime-${this.playerId}">0:00</span>
                        <span id="duration-${this.playerId}">0:00</span>
                    </div>
                </div>
                
                <div class="controls">
                    <button class="control-btn" id="prevBtn-${this.playerId}">⏮</button>
                    <button class="control-btn play-btn" id="playBtn-${this.playerId}">▶</button>
                    <button class="control-btn" id="nextBtn-${this.playerId}">⏭</button>
                </div>
                
                <div class="volume-container">
                    <input type="range" class="volume-slider" id="volumeSlider-${this.playerId}" min="0" max="1" step="0.1" value="0.7">
                    <span class="volume-value" id="volumeValue-${this.playerId}">70%</span>
                </div>
                
                <div class="playlist">
                    <h4>Треки плейлиста</h4>
                    <ul id="playlist-${this.playerId}"></ul>
                </div>
                
                <audio id="audioPlayer-${this.playerId}"></audio>
            </div>
        `;

        this.elements = {
            audioPlayer: document.getElementById(`audioPlayer-${this.playerId}`),
            playBtn: document.getElementById(`playBtn-${this.playerId}`),
            prevBtn: document.getElementById(`prevBtn-${this.playerId}`),
            nextBtn: document.getElementById(`nextBtn-${this.playerId}`),
            progressBar: document.getElementById(`progressBar-${this.playerId}`),
            progress: document.getElementById(`progress-${this.playerId}`),
            currentTimeEl: document.getElementById(`currentTime-${this.playerId}`),
            durationEl: document.getElementById(`duration-${this.playerId}`),
            volumeSlider: document.getElementById(`volumeSlider-${this.playerId}`),
            volumeValue: document.getElementById(`volumeValue-${this.playerId}`),
            playlistEl: document.getElementById(`playlist-${this.playerId}`),
            albumCover: this.container.querySelector('.album-cover')
        };
    }

    createPlaylist() {
        this.elements.playlistEl.innerHTML = '';
        
        this.albumData.tracks.forEach((track, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${index + 1}. ${track.title}</span>
                <span class="track-duration">${track.duration}</span>
            `;
            
            li.addEventListener('click', () => {
                this.loadTrack(index);
                this.playTrack();
            });
            
            this.elements.playlistEl.appendChild(li);
        });
        
        this.updateActiveTrack(this.currentTrackIndex);
    }

    loadTrack(index) {
        if (index < 0 || index >= this.albumData.tracks.length) return;
        
        this.currentTrackIndex = index;
        const track = this.albumData.tracks[index];
        
        this.elements.audioPlayer.src = track.src;
        this.updateActiveTrack(index);
        
        this.elements.progress.style.width = '0%';
        this.elements.currentTimeEl.textContent = '0:00';
        this.elements.durationEl.textContent = track.duration;
        
        if (this.isPlaying) {
            this.elements.audioPlayer.play().catch(e => {
                console.log(`Ошибка автовоспроизведения в ${this.playerId}:`, e);
            });
        }
    }

    updateActiveTrack(index) {
        const tracks = this.elements.playlistEl.querySelectorAll('li');
        tracks.forEach(track => track.classList.remove('active'));
        if (tracks[index]) {
            tracks[index].classList.add('active');
        }
    }

    playTrack() {
        this.elements.audioPlayer.play().then(() => {
            this.isPlaying = true;
            this.elements.playBtn.textContent = '⏸';
            this.elements.albumCover.classList.add('playing');
        }).catch(e => {
            console.log(`Ошибка воспроизведения в ${this.playerId}:`, e);
        });
    }

    pauseTrack() {
        this.elements.audioPlayer.pause();
        this.isPlaying = false;
        this.elements.playBtn.textContent = '▶';
        this.elements.albumCover.classList.remove('playing');
    }

    nextTrack() {
        const nextIndex = (this.currentTrackIndex + 1) % this.albumData.tracks.length;
        this.loadTrack(nextIndex);
        if (this.isPlaying) this.playTrack();
    }

    prevTrack() {
        const prevIndex = (this.currentTrackIndex - 1 + this.albumData.tracks.length) % this.albumData.tracks.length;
        this.loadTrack(prevIndex);
        if (this.isPlaying) this.playTrack();
    }

    updateProgress() {
        const currentTime = this.elements.audioPlayer.currentTime;
        const duration = this.elements.audioPlayer.duration;
        
        if (duration) {
            const progressPercent = (currentTime / duration) * 100;
            this.elements.progress.style.width = `${progressPercent}%`;
            this.elements.currentTimeEl.textContent = this.formatTime(currentTime);
            this.elements.durationEl.textContent = this.formatTime(duration);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    setProgress(e) {
        const width = this.elements.progressBar.clientWidth;
        const clickX = e.offsetX;
        const duration = this.elements.audioPlayer.duration;
        
        if (duration) {
            this.elements.audioPlayer.currentTime = (clickX / width) * duration;
        }
    }

    updateVolumeDisplay() {
        const volume = Math.round(this.elements.volumeSlider.value * 100);
        this.elements.volumeValue.textContent = volume + '%';
    }

    setupEventListeners() {
        this.elements.playBtn.addEventListener('click', () => {
            if (this.isPlaying) {
                this.pauseTrack();
            } else {
                this.playTrack();
            }
        });

        this.elements.nextBtn.addEventListener('click', () => this.nextTrack());
        this.elements.prevBtn.addEventListener('click', () => this.prevTrack());

        this.elements.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
        this.elements.audioPlayer.addEventListener('ended', () => this.nextTrack());
        this.elements.audioPlayer.addEventListener('loadedmetadata', () => {
            this.elements.durationEl.textContent = this.formatTime(this.elements.audioPlayer.duration);
        });

        this.elements.progressBar.addEventListener('click', (e) => this.setProgress(e));

        this.elements.volumeSlider.addEventListener('input', () => {
            this.elements.audioPlayer.volume = this.elements.volumeSlider.value;
            this.updateVolumeDisplay();
        });

        this.elements.audioPlayer.volume = this.elements.volumeSlider.value;
        this.updateVolumeDisplay();
    }
}

// Данные для двух разных плееров
const albumData1 = {
    title: "Кошки Бильярд",
    artist: "Жанулька",
    tracks: [
        {
            title: "забита голова",
            src: "audio/забита голова.mp3",
            duration: "2:16"
        },
        {
            title: "три в ряд", 
            src: "audio/три в ряд.mp3",
            duration: "1:53"
        },
        {
            title: "с нами дома",
            src: "audio/с нами дома.mp3",
            duration: "2:04"
        }
    ]
};

const albumData2 = {
    title: "Кошки Бильярд 2",
    artist: "Жанулька",
    tracks: [
        {
            title: "болеть тобой",
            src: "audio/болетьтобой.mp3", 
            duration: "2:03"
        },
        {
            title: "не выкупаю",
            src: "audio/не выкупаю.mp3",
            duration: "1:56"
        },
        {
            title: "забита голова",
            src: "audio/забита голова.mp3",
            duration: "2:16"
        }
    ]
};

// Создание двух независимых плееров
window.addEventListener('load', () => {
    new AudioPlayer('player1', 'player1', albumData1);
    new AudioPlayer('player2', 'player2', albumData2);
});