function generateRangeArray(min, max) {
    const array = [];
    for (let i = min; i < max; i++) {
        array.push(i);
    }
    return array;
}

function inArray(value, array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === value) {
            return true;
        }
    }
    return false;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    if (min > max) {
        return NaN;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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