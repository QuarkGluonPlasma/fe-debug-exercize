const Browser = require('./lib/Browser');

const browser = new Browser({
    remoteDebuggingPort: 9229,
    headless: false
});

function delay(time) {
    return new Promise((resolve => setTimeout(resolve, time)))
}

(async function() {
    await browser.launch();

    const page = await browser.newPage();
    await page.navigate('https://www.baidu.com');

    await delay(1000);
    await page.evaluate(function() { 
        document.body.style.backgroundColor = 'pink';
    });

    const res = await page.evaluate(function() {
        const li = document.querySelectorAll('#hotsearch-content-wrapper>li');
        return [...li].map(item => item.innerText);
    });

    console.log(res);
})()
