import { downloadChromium } from './lib/Downloader.mjs';
import fs from 'node:fs';
import ProgressBar from 'progress';
import path from 'node:path';

const pkgJsonPath = path.join(import.meta.dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
const revision = pkg.puppeteer.chromium_revision;

downloadChromium(revision, onProgress)
    .catch(error => {
        console.error('Download failed: ' + error.message);
    });

let progressBar = null;
function onProgress(bytesTotal, delta) {
    if (!progressBar) {
        progressBar = new ProgressBar(`Downloading Chromium - ${toMegabytes(bytesTotal)} [:bar] :percent :etas `, {
            complete: '\u2588',
            incomplete: '\u2591',
            width: 20,
            total: bytesTotal,
        });
    }
    progressBar.tick(delta);
}

function toMegabytes(bytes) {
    const mb = bytes / 1024 / 1024;
    return (Math.round(mb * 10) / 10) + ' Mb';
}
