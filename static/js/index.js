(() => {
    'use strict';

    const mainElement = document.getElementById('main');

    mainElement.querySelector('#open-file input[type="file"]').addEventListener('input', showFileAbspathDialog);
    mainElement.querySelector('#file-abspath-dialog .close-btn').addEventListener('click', closeFileAbspathDialog);
    mainElement.querySelector('#file-abspath-dialog form').addEventListener('submit', fileAbspathFormSubmitEvent);

    function showFileAbspathDialog() {
        document.getElementById('overlay').classList.remove('hidden');
        document.getElementById('file-abspath-dialog').classList.remove('hidden');
    }

    function closeFileAbspathDialog() {
        document.getElementById('overlay').classList.add('hidden');
        document.getElementById('file-abspath-dialog').classList.add('hidden');
    }

    function fileAbspathFormSubmitEvent(e) {
        e.preventDefault();
        const form = e.target;

        let fatherDirPath = form.querySelector('input[name="file-abspath"]').value;
        fatherDirPath = fatherDirPath.replace(/\\/g, '/');
        if (!fatherDirPath.endsWith('/')) {
            fatherDirPath = fatherDirPath + '/';
        }
        const matchResult = /^\/storage\/emulated\/[0-9]+\//.exec(fatherDirPath);
        if (matchResult !== null) {
            fatherDirPath = fatherDirPath.slice(matchResult[0].length);
        }

        const url = form.getAttribute('action');
        const files = mainElement.querySelector('#open-file input[type="file"]').files;
        const data = {'playlist': []};
        for (let i = 0; i < files.length; i++) {
            data['playlist'].push(fatherDirPath + files[i].name);
        }

        ajaxPostJson(url, data, (responseData) => {
            if (responseData.status === 1) {
                location.href = form.getAttribute('data-player-route');
            } else {
                closeFileAbspathDialog();
                alert(responseData.message);
            }
        })
    }
})();