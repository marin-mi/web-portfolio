let count = 0;

function isAhoNumber(number) {
    // 数字が3の倍数、もしくは数字に3が含まれる場合、trueを返す
    return number % 3 === 0 || number.toString().includes('3');
}

function incrementCounter() {
    count++;
    document.getElementById('counter').innerText = count;

    // アホの条件をチェックし、ナベアツさんの表情を変更
    if (isAhoNumber(count)) {
        document.getElementById('nabeatsuFace').src = "img/aho_face.jpg";
    } else {
        document.getElementById('nabeatsuFace').src = "img/normal_face.jpg";
    }
}
