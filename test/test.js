/* global
    describe it beforeAll afterAll beforeEach afterEach expect
*/
const puppeteer = require('puppeteer');
const pti = require('puppeteer-to-istanbul');
const path = require('path');

let browser = null, page = null;
beforeAll(async() => {

    browser = await puppeteer.launch({
        headless: true,

        // --no-sandbox is required to run puppeteer in Travis.
        // https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-on-travis-ci
        args: ['--no-sandbox'],
    });
    page = await browser.newPage();
    page.addScriptTag({ path: '../umd/Thead.js' });
    page.addScriptTag({ path: '../umd/TheadPool.js' });
    page.addScriptTag({ path: '../umd/TheadQueue.js' });

    await page.coverage.startJSCoverage();
    await page.goto(`file:${ path.join(__dirname, './test-setup.html') }`);

    page.on('error', e => { throw new Error(e); });
    page.on('pageerror', e => { throw new Error(e); });
    page.on('console', e => {

        if (e.type() === 'error') {

            throw new Error(e.text());

        }

    });

});

describe.skip('Thread', () => {

});

describe.skip('ThreadPool', () => {

});

describe.skip('ThreadQueue', () => {

});

afterAll(async() => {

    const coverage = await page.coverage.stopJSCoverage();
    const urdfLoaderCoverage = coverage.filter(o => /URDFLoader\.js$/.test(o.url));
    pti.write(urdfLoaderCoverage);

    browser.close();

});
