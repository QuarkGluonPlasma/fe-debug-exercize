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

    await delay(2000);
    const version = await browser.version();
    await page.setContent(`<h1 style="font-size:50px">hello, ${version}</h1>`);

    await delay(2000);
    await page.close();

    await delay(1000);
    await browser.close();
})()
