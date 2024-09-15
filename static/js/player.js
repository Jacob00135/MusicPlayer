(() => {
    'use strict';

    const mainElement = document.getElementById('main');
    const playModeArray = ['sequential', 'list-loop', 'one-loop', 'random'];
    let sourcePlayList;
    let playlist;

    mainElement.querySelector('.progress-bar .background').addEventListener('click', locatePlayProgress);
    mainElement.querySelector('.progress-bar .color').addEventListener('click', locatePlayProgress);
    document.getElementById('play-btn').addEventListener('click', playButtonClickEvent);
    document.getElementById('fast-backward-btn').addEventListener('click', fastBackwardButtonClickEvent);
    document.getElementById('fast-forward-btn').addEventListener('click', fastForwardButtonClickEvent);
    document.getElementById('play-mode').addEventListener('click', playModeButtonClickEvent);
    document.getElementById('prev-song-btn').addEventListener('click', prevSongButtonClickEvent);
    document.getElementById('next-song-btn').addEventListener('click', nextSongButtonClickEvent);
    loadCurrentPlaylist();

    class Playlist {
        #getPrevSongFunction = null;
        #getNextSongFunction = null;

        constructor(array, playMode) {
            this.array = array;
            this.playMode = playMode;
            this.currentIndex = 0;
            this.randomIndexArray = generateRangeArray(0, this.array.length);

            this.#allocateFunction();
        }

        getCurrentSong() {
            return this.array[this.randomIndexArray[this.currentIndex]];
        }

        getPrevSong() {
            return this.#getPrevSongFunction();
        }

        getNextSong() {
            return this.#getNextSongFunction();
        }

        #allocateFunction() {
            if (this.playMode === 'sequential') {
                this.#getPrevSongFunction = this.#getSequentialModePrevSong;
                this.#getNextSongFunction = this.#getSequentialModeNextSong;
            } else if (this.playMode === 'list-loop') {
                this.#getPrevSongFunction = this.#getListloopModePrevSong;
                this.#getNextSongFunction = this.#getListloopModeNextSong;
            } else if (this.playMode === 'one-loop') {
                this.#getPrevSongFunction = this.#getOneLoopModePrevSong;
                this.#getNextSongFunction = this.#getOneLoopModeNextSong;
            } else if (this.playMode === 'random') {
                this.#shuffleRandomIndexArray();
                this.#getPrevSongFunction = this.#getRandomModePrevSong;
                this.#getNextSongFunction = this.#getRandomModeNextSong;
            }
        }

        #shuffleRandomIndexArray() {
            this.randomIndexArray = generateRangeArray(0, this.array.length);

            const maxIndex = this.randomIndexArray.length - 1;
            const shuffleCount = this.randomIndexArray.length * 10;
            for (let i = 0; i < shuffleCount; i++) {
                let j = getRandomInt(0, maxIndex);
                let k = getRandomInt(0, maxIndex);
                let tmp = this.randomIndexArray[j];
                this.randomIndexArray[j] = this.randomIndexArray[k];
                this.randomIndexArray[k] = tmp;
            }
        }

        #getSequentialModePrevSong() {
            if (this.currentIndex === 0) {
                return null;
            }

            this.currentIndex = this.currentIndex - 1;
            return this.array[this.randomIndexArray[this.currentIndex]];
        }

        #getSequentialModeNextSong() {
            if (this.currentIndex === this.array.length - 1) {
                return null;
            }

            this.currentIndex = this.currentIndex + 1;
            return this.array[this.randomIndexArray[this.currentIndex]];
        }

        #getListloopModePrevSong() {
            if (this.currentIndex === 0) {
                this.currentIndex = this.array.length - 1;
            } else {
                this.currentIndex = this.currentIndex - 1;
            }

            return this.array[this.randomIndexArray[this.currentIndex]];
        }

        #getListloopModeNextSong() {
            if (this.currentIndex === this.array.length - 1) {
                this.currentIndex = 0;
            } else {
                this.currentIndex = this.currentIndex + 1;
            }

            return this.array[this.randomIndexArray[this.currentIndex]];
        }

        #getOneLoopModePrevSong() {
            return this.#getListloopModePrevSong();
        }

        #getOneLoopModeNextSong() {
            return this.#getListloopModeNextSong();
        }

        #getRandomModePrevSong() {
            return this.#getSequentialModePrevSong();
        }

        #getRandomModeNextSong() {
            if (this.currentIndex === this.array.length - 1) {
                this.#shuffleRandomIndexArray();
                this.currentIndex = 0;
            } else {
                this.currentIndex = this.currentIndex + 1;
            }

            return this.array[this.randomIndexArray[this.currentIndex]];
        }
    }

    function loadCurrentPlaylist() {
        const url = mainElement.getAttribute('data-get-current-playlist-route');
        ajaxGetJson(url, (responseData) => {
            if (responseData.status === 0) {
                alert(responseData.message);
                return undefined;
            }

            if (responseData.data.length !== 0) {
                sourcePlayList = responseData.data;
                playlist = new Playlist(responseData.data, 'sequential');
                const audioElement = generateAudioElement(playlist.getCurrentSong());
                insertAudioElement(audioElement);
            }
        });
    }

    function generateAudioElement(filepath, filetype) {
        if (filetype === undefined) {
            filetype = 'audio/mpeg';
        }
        const prefix = mainElement.getAttribute('data-storage-route');
        const src = prefix + filepath;
        const fatherBox = document.createElement('div');
        fatherBox.innerHTML = `<audio>
            <source type="${filetype}" src="${src}"></source>
        </audio>`;

        return fatherBox.children[0];
    }

    function insertAudioElement(audioElement) {
        audioElement.addEventListener('timeupdate', audioTimeUpdateEvent);
        audioElement.addEventListener('ended', audioEndedEvent);

        const path = audioElement.querySelector('source').getAttribute('src')
        const filename = path.replace(/\\/g, '/').split('/').pop();
        mainElement.querySelector('.filename').textContent = filename;

        const timer = setInterval(() => {
            if (!Number.isNaN(audioElement.duration)) {
                mainElement.querySelector('.progress-bar .total-time').innerHTML = transformTime(audioElement.duration);
                clearInterval(timer);
            }
        }, 500);

        mainElement.insertBefore(audioElement, mainElement.children[0]);
    }

    function transformTime(seconds) {
        let hour = parseInt(seconds / 3600);
        let minute = parseInt(seconds % 3600 / 60);
        let second = parseInt(seconds % 60);

        if (second < 10) {
            second = '0' + second;
        }
        if (minute < 10) {
            minute = '0' + minute;
        }
        if (hour < 1) {
            return minute + ':' + second;
        } else if (hour < 10) {
            return '0' + hour + ':' + minute + ':' + second;
        } else {
            return hour + ':' + minute + ':' + second;
        }
    }

    function playButtonClickEvent(e) {
        const playBtn = document.getElementById('play-btn');
        const audioElement = mainElement.querySelector('audio');
        const playIcon = document.getElementById('icon-play');
        const pauseIcon = document.getElementById('icon-pause');
        if (playBtn.getAttribute('data-state') === 'pause') {
            audioElement.play();
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
            playBtn.setAttribute('data-state', 'play');
        } else if (playBtn.getAttribute('data-state') === 'play') {
            audioElement.pause();
            pauseIcon.classList.add('hidden');
            playIcon.classList.remove('hidden');
            playBtn.setAttribute('data-state', 'pause');
        }
    }

    function audioTimeUpdateEvent(e) {
        const audioElement = e.target;
        const rate = audioElement.currentTime / audioElement.duration;
        const percentRate = 100 * rate;

        mainElement.querySelector('.progress-bar .color').style.width = percentRate + '%';
        mainElement.querySelector('.progress-bar .dot').style.left = percentRate + '%';
        mainElement.querySelector('.progress-bar .current-time').innerHTML = transformTime(audioElement.currentTime);
        // mainElement.querySelector('.progress-bar .total-time').innerHTML = transformTime(audioElement.duration);
    }

    function audioEndedEvent(e) {
        const currentPlayMode = document.getElementById('play-mode').getAttribute('data-mode');
        if (currentPlayMode === 'one-loop') {
            mainElement.querySelector('audio').play();
            return undefined;
        }

        mainElement.querySelector('.progress-bar .current-time').innerHTML = transformTime(e.target.duration);
        document.getElementById('icon-pause').classList.add('hidden');
        document.getElementById('icon-play').classList.remove('hidden');
        document.getElementById('play-btn').setAttribute('data-state', 'pause');
        document.getElementById('next-song-btn').click();
    }

    function locatePlayProgress(e) {
        const audioElement = mainElement.querySelector('audio');
        const locateLength = e.pageX - (mainElement.offsetLeft + 20);
        const totalLength = mainElement.querySelector('.progress-bar .background').clientWidth;
        const rate = locateLength / totalLength;
        const percentRate = 100 * rate;

        audioElement.currentTime = audioElement.duration * rate;
        mainElement.querySelector('.progress-bar .color').style.width = percentRate + '%';
        mainElement.querySelector('.progress-bar .dot').style.left = percentRate + '%';
        mainElement.querySelector('.progress-bar .current-time').innerHTML = transformTime(audioElement.currentTime);

        const playBtn = document.getElementById('play-btn');
        if (playBtn.getAttribute('data-state') === 'pause') {
            playBtn.click();
        }
    }

    function fastBackwardButtonClickEvent(e) {
        const audioElement = mainElement.querySelector('audio');
        if (audioElement.currentTime >= 5) {
            audioElement.currentTime = audioElement.currentTime - 5;
        } else {
            audioElement.currentTime = 0;
        }

        const playBtn = document.getElementById('play-btn');
        if (playBtn.getAttribute('data-state') === 'pause') {
            playBtn.click();
        }
    }

    function fastForwardButtonClickEvent(e) {
        const audioElement = mainElement.querySelector('audio');
        if (audioElement.currentTime + 5 > audioElement.duration) {
            audioElement.currentTime = audioElement.duration;
        } else {
            audioElement.currentTime = audioElement.currentTime + 5;
        }

        const playBtn = document.getElementById('play-btn');
        if (playBtn.getAttribute('data-state') === 'pause') {
            playBtn.click();
        }
    }

    function switchSong(filepath) {
        mainElement.querySelector('audio').remove();
        const audioElement = generateAudioElement(filepath);
        insertAudioElement(audioElement);

        audioElement.play();
        document.getElementById('icon-play').classList.add('hidden');
        document.getElementById('icon-pause').classList.remove('hidden');
        document.getElementById('play-btn').setAttribute('data-state', 'play');
    }

    function playModeButtonClickEvent(e) {
        const btn = document.getElementById('play-mode');
        const oldPlayMode = btn.getAttribute('data-mode');
        let i = 0;
        while (i < playModeArray.length && (playModeArray[i] !== oldPlayMode)) {
            i = i + 1;
        }

        const newPlayMode = playModeArray[(i + 1) % playModeArray.length];
        btn.children[i].classList.add('hidden');
        btn.children[(i + 1) % playModeArray.length].classList.remove('hidden');
        btn.setAttribute('title', newPlayMode);
        btn.setAttribute('data-mode', newPlayMode);

        if (inArray(oldPlayMode, ['sequential', 'list-loop', 'one-loop']) && newPlayMode === 'random') {
            playlist = new Playlist(sourcePlayList, 'random');
            switchSong(playlist.getCurrentSong());
        } else if (oldPlayMode === 'random' && (newPlayMode === 'sequential' || newPlayMode === 'list-loop')) {
            const randomIndex = playlist.randomIndexArray[playlist.currentIndex];
            playlist = new Playlist(sourcePlayList, newPlayMode);
            playlist.currentIndex = randomIndex;
        } else {
            const currentIndex = playlist.currentIndex;
            playlist = new Playlist(sourcePlayList, newPlayMode);
            playlist.currentIndex = currentIndex;
        }
    }

    function prevSongButtonClickEvent(e) {
        const filepath = playlist.getPrevSong();
        if (filepath === null) {
            return undefined;
        }

        switchSong(filepath);
    }

    function nextSongButtonClickEvent(e) {
        const filepath = playlist.getNextSong();
        if (filepath === null) {
            return undefined;
        }

        switchSong(filepath);
    }
})();