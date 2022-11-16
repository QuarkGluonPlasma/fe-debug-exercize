const CDP = require('chrome-remote-interface');
const http = require('http');
const path = require('path');
const removeRecursive = require('rimraf').sync;
const Page = require('./Page');
const childProcess = require('child_process');
const Downloader = require('./Downloader');

const CHROME_PROFILE_PATH = path.resolve(__dirname, '..', '.dev_profile');
let browserId = 0;

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
            const chromiumRevision = require('../package.json').puppeteer.chromium_revision;
            this._chromeExecutable = Downloader.executablePath(chromiumRevision);
        }

        if (Array.isArray(options.args))
            this._chromeArguments.push(...options.args);

        this._chromeProcess = null;
        this._tabSymbol = Symbol('Browser.TabSymbol');
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

    async closePage(page) {
        if (!this._chromeProcess || this._chromeProcess.killed) {
            throw new Error('ERROR: this chrome instance is not running');
        }

        const tab = page[this._tabSymbol];
        if (!tab) {
            throw new Error('ERROR: page does not belong to this chrome instance');
        }

        await CDP.Close({id: tab.id, port: this._remoteDebuggingPort});
    }

    async version() {
        await this._ensureChromeIsRunning();
        const version = await CDP.Version({port: this._remoteDebuggingPort});
        return version.Browser;
    }

    async launch() {
        await this._ensureChromeIsRunning();
    }

    async _ensureChromeIsRunning() {
        if (this._chromeProcess)
            return;
        this._chromeProcess = childProcess.spawn(this._chromeExecutable, this._chromeArguments, {});

        process.on('exit', () => this._chromeProcess.kill());
        this._chromeProcess.on('exit', () => removeRecursive(this._userDataDir));

        await waitForChromeResponsive(this._remoteDebuggingPort);
    }

    close() {
        if (!this._chromeProcess)
            return;
        this._chromeProcess.kill();
    }
}

module.exports = Browser;

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
