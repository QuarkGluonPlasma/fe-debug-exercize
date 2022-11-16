const os = require('os');
const https = require('https');
const fs = require('fs');
const path = require('path');
const extract = require('extract-zip');
const util = require('util');

const CHROMIUM_PATH = path.join(__dirname, '..', '.local-chromium');

const downloadURLs = {
    linux: 'https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/%d/chrome-linux.zip',
    darwin: 'https://storage.googleapis.com/chromium-browser-snapshots/Mac/%d/chrome-mac.zip',
    win32: 'https://storage.googleapis.com/chromium-browser-snapshots/Win/%d/chrome-win32.zip',
    win64: 'https://storage.googleapis.com/chromium-browser-snapshots/Win_x64/%d/chrome-win32.zip',
};

async function downloadChromium(revision, progressCallback) {
    let url = null;

    const platform = os.platform();
    if (platform === 'darwin')
        url = downloadURLs.darwin;
    else if (platform === 'linux')
        url = downloadURLs.linux;
    else if (platform === 'win32')
        url = os.arch() === 'x64' ? downloadURLs.win64 : downloadURLs.win32;

    console.assert(url, `Unsupported platform: ${platform}`);

    url = util.format(url, revision);

    const zipPath = path.join(CHROMIUM_PATH, `download-${revision}.zip`);
    const folderPath = path.join(CHROMIUM_PATH, revision);

    if (fs.existsSync(folderPath)) {
        return;
    }

    try {
        if (!fs.existsSync(CHROMIUM_PATH)) {
            fs.mkdirSync(CHROMIUM_PATH);
        }

        await downloadFile(url, zipPath, progressCallback);
        await extractZip(zipPath, folderPath);
    } catch(e) {}
}

function downloadFile(url, destinationPath, progressCallback) {
    let resolve , reject;
    const promise = new Promise((x, y) => { resolve = x; reject = y; });

    const request = https.get(url, response => {
        if (response.statusCode !== 200) {
            const error = new Error(`Download failed: server returned code ${response.statusCode}. URL: ${url}`);
            response.resume();

            reject(error);
            return;
        }
        const file = fs.createWriteStream(destinationPath);
        file.on('finish', () => resolve ());
        file.on('error', error => reject(error));
        response.pipe(file);
        const totalBytes = parseInt(response.headers['content-length'], 10);
        if (progressCallback)
            response.on('data', onData.bind(null, totalBytes));
    });
    request.on('error', error => reject(error));
    return promise;

    function onData(totalBytes, chunk) {
        progressCallback(totalBytes, chunk.length);
    }
}

function extractZip(zipPath, folderPath) {
    return new Promise(resolve  => extract(zipPath, {dir: folderPath}, resolve ));
}

function executablePath(revision) {
    const platform = os.platform();
    if (platform === 'darwin')
        return path.join(CHROMIUM_PATH, revision, 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium');
    if (platform === 'linux')
        return path.join(CHROMIUM_PATH, revision, 'chrome-linux', 'chrome');
    if (platform === 'win32')
        return path.join(CHROMIUM_PATH, revision, 'chrome-win32', 'chrome.exe');
    throw new Error(`Unsupported platform: ${platform}`);
}

module.exports = {
    executablePath,
    downloadChromium
}