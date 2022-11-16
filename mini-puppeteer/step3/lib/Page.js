const helpers = require('./helpers');

class Page{

    static async create(browser, client) {
        await client.send('Page.enable', {});

        const page = new Page(browser, client);
        return page;
    }

    constructor(browser, client) {
        this._browser = browser;
        this._client = client;
    }

    async evaluate(fun, ...args) {
        var response = await helpers.evaluate(this._client, fun, args, false);

        return response.result.value;
    }

    async setContent(html) {
        var resourceTree = await this._client.send('Page.getResourceTree', {});
        await this._client.send('Page.setDocumentContent', {
            frameId: resourceTree.frameTree.frame.id,
            html: html
        });
    }

    async navigate(url) {
        var loadPromise = new Promise(resolve => this._client.once('Page.loadEventFired', resolve)).then(() => true);

        await this._client.send('Page.navigate', {url});
        return await loadPromise;
    }

    async close() {
        return this._browser.closePage(this);
    }
}

module.exports = Page;
