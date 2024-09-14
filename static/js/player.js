(() => {
    'use strict';

    const mainElement = document.getElementById('main');
    let playlist;

    mainElement.querySelector('.progress-bar .background').addEventListener('click', locatePlayProgress);
    mainElement.querySelector('.progress-bar .color').addEventListener('click', locatePlayProgress);
    document.getElementById('play-btn').addEventListener('click', playButtonClickEvent);
    document.getElementById('fast-backward-btn').addEventListener('click', fastBackwardButtonClickEvent);
    document.getElementById('fast-forward-btn').addEventListener('click', fastForwardButtonClickEvent);
    document.getElementById('play-mode').addEventListener('click', playModeButtonClickEvent);
    loadCurrentPlaylist()

    function loadCurrentPlaylist() {
        const url = mainElement.getAttribute('data-get-current-playlist-route');
        ajaxGetJson(url, (responseData) => {
            if (responseData.status === 0) {
                alert(responseData.message);
                return undefined;
            }

            playlist = responseData.data;
            if (playlist.length !== 0) {
                const audioElement = generateAudioElement(playlist[0]);
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
        mainElement.querySelector('.progress-bar .current-time').innerHTML = transformTime(e.target.duration);
        document.getElementById('icon-pause').classList.add('hidden');
        document.getElementById('icon-play').classList.remove('hidden');
        document.getElementById('play-btn').setAttribute('data-state', 'pause');
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

    function playModeButtonClickEvent(e) {
        const btn = document.getElementById('play-mode');
        const iconArr = btn.children;
        const currentPlayMode = btn.getAttribute('data-mode');
        for (let i = 0; i < iconArr.length; i++) {
            if (iconArr[i].getAttribute('data-mode') === currentPlayMode) {
                const newIndex = (i + 1) % iconArr.length;
                iconArr[i].classList.add('hidden');
                iconArr[newIndex].classList.remove('hidden');
                btn.setAttribute('title', iconArr[newIndex].getAttribute('data-title'));
                btn.setAttribute('data-mode', iconArr[newIndex].getAttribute('data-mode'));
                break;
            }
        }
    }
})();