addEventListener('message', function(evt) {
    let total = 0;
    let num = evt.data;
    for(let i = 0; i< num; i++) {
        total += i;
    }
    postMessage(total);
});