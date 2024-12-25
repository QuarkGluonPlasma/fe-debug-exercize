import childProcess from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import fse from 'fs-extra';
import { executablePath } from './Downloader.mjs';
import http from 'node:http';
import CDP from 'chrome-remote-interface';
import { Page } from './Page.mjs';

let browserId = 0;

const pkgJsonPath = path.join(import.meta.dirname, '..', '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
const revision = pkg.puppeteer.chromium_revision;

//用户数据目录
const CHROME_PROFILE_PATH = path.resolve(import.meta.dirname, '..', '..', '.dev_profile');

class Browser {

    constructor(options) {
        options = options || {};

        ++browserId;
        this._userDataDir = CHROME_PROFILE_PATH + browserId;

        this._remoteDebuggingPort = 9229;
        if (typeof options.remoteDebuggingPort === 'number') {
            this._remoteDebuggingPort = options.remoteDebuggingPort;
        }
        this._chromeArguments = [ 
            `--user-data-dir=${this._userDataDir}`,
            `--remote-debugging-port=${this._remoteDebuggingPort}`,
        ];

        if (options.headless) {
            this._chromeArguments.push(`--headless`);
        }

        if (typeof options.executablePath === 'string') {
            this._chromeExecutable = options.executablePath;
        } else {
            const chromiumRevision = revision;
            this._chromeExecutable = executablePath(chromiumRevision);
        }

        if (Array.isArray(options.args))
            this._chromeArguments.push(...options.args);

        this._chromeProcess = null;
    }

    async newPage() {
        await this._ensureChromeIsRunning();
    
        if (!this._chromeProcess || this._chromeProcess.killed) {
            throw new Error('ERROR: this chrome instance is not alive any more!');
        }
        const tab = await CDP.New({port: this._remoteDebuggingPort});
        
        const client = await CDP({tab: tab, port: this._remoteDebuggingPort});
        const page = await Page.create(this, client);
        page[this._tabSymbol] = tab;
        return page;
    }

    async launch() {
        await this._ensureChromeIsRunning();
    }

    async _ensureChromeIsRunning() {
        if (this._chromeProcess)
            return;
        this._chromeProcess = childProcess.spawn(this._chromeExecutable, this._chromeArguments, {});

        process.on('exit', () => this._chromeProcess.kill());
        this._chromeProcess.on('exit', () => fse.rmdirSync(this._userDataDir));

        await waitForChromeResponsive(this._remoteDebuggingPort);
    }

    async version() {
        await this._ensureChromeIsRunning();
        const version = await CDP.Version({port: this._remoteDebuggingPort});
        return version.Browser;
    }

    close() {
        if (!this._chromeProcess)
            return;
        this._chromeProcess.kill();
    }
}

function waitForChromeResponsive(remoteDebuggingPort) {
    var resolve;
    const promise = new Promise(x => resolve  = x);
    const options = {
        method: 'GET',
        host: 'localhost',
        port: remoteDebuggingPort,
        path: '/json/list'
    };
    sendRequest();
    return promise;

    function sendRequest() {
        const req = http.request(options, res => {
            resolve ()
        });
        req.on('error', e => setTimeout(sendRequest, 100));
        req.end();
    }
}

export {
    Browser
}
