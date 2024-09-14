function ajaxGetJson(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.addEventListener('readystatechange', (e) => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const responseData = JSON.parse(xhr.responseText);
            callback && callback(responseData);
        }
    });
    xhr.send();
}

function ajaxPostJson(url, data, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('post', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.addEventListener('readystatechange', (e) => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const responseData = JSON.parse(xhr.responseText);
            callback && callback(responseData);
        }
    });
    xhr.send(JSON.stringify(data));
}