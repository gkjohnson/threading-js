/* global
    describe it beforeAll afterAll expect
*/
const puppeteer = require('puppeteer');
// const pti = require('puppeteer-to-istanbul');
const path = require('path');

let browser = null, page = null;
beforeAll(async() => {

    // TODO: Figure out how to get coverage of the modules in the tests.
    // May have to run static server to load the modules.
    browser = await puppeteer.launch({
        headless: true,

        // --no-sandbox is required to run puppeteer in Travis.
        // https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-on-travis-ci
        args: ['--no-sandbox'],
    });
    page = await browser.newPage();
    console.log(path.join(__dirname, '../umd/Thead.js'));
    await page.addScriptTag({ path: path.join(__dirname, '../umd/Thread.js') });
    await page.addScriptTag({ path: path.join(__dirname, '../umd/ThreadPool.js') });
    await page.addScriptTag({ path: path.join(__dirname, '../umd/ThreadQueue.js') });
    await page.evaluate(() => {

        window.Thread = window.Thread.default;
        window.ThreadPool = window.ThreadPool.default;
        window.ThreadQueue = window.ThreadQueue.default;

    });

    await page.coverage.startJSCoverage();

    page.on('error', e => { throw new Error(e); });
    page.on('pageerror', e => { throw new Error(e); });
    page.on('console', e => {

        if (e.type() === 'error') {

            throw new Error(e.text());

        }

    });

});

describe('Thread', () => {

    it('should be able to transfer data to the thread', async() => {

        const res =
            await page.evaluate(async() => {

                /* eslint-disable */
                const thread =
                    new window.Thread(() => ({
                        stringVal,
                        numberVal,
                        arrayVal,
                        funcVal: funcVal.toString(),
                        funcRes: funcVal(1, 2)
                    }), {
                        stringVal: 'test',
                        numberVal: 100,
                        arrayVal: [1, 2, 3],
                        funcVal: (a, b) => a + b,
                    });
                /* eslint-enable */

                const res = await thread.run();

                thread.dispose();

                return res;

            });

        expect(res.stringVal).toEqual('test');
        expect(res.numberVal).toEqual(100);
        expect(res.arrayVal).toEqual([1, 2, 3]);
        expect(res.funcVal).toEqual('(a, b) => a + b');
        expect(res.funcRes).toEqual(3);

    });

    it('ArrayBuffers should be transferred back after a thread completes', async() => {

        const res =
            await page.evaluate(async() => {

                const ab = new Uint8Array(new ArrayBuffer(3));
                ab[0] = 1;
                ab[1] = 2;
                ab[2] = 3;

                const thread = new window.Thread(ab => ({ data: [ab[0], ab[1], ab[2]], ab }));
                await new Promise(resolve => {

                    function waiting() {

                        if (thread.ready) resolve();
                        else requestAnimationFrame(waiting);

                    }
                    waiting();

                });

                const length1 = ab.length;

                const pr = thread.run(ab, null, [ab.buffer]);
                const length2 = ab.length;

                const result = await pr;

                const length3 = result.ab.length;

                thread.dispose();

                return { length1, length2, length3, result: result.data };

            });

        expect(res.length1).toEqual(3);
        expect(res.length2).toEqual(0);
        expect(res.length3).toEqual(3);
        expect(res.result).toEqual([1, 2, 3]);

    });

    it('should call the `intermediateFunc` when postMessage is called', async() => {

        const res =
            await page.evaluate(async() => {

                let result = null;
                const thread = new window.Thread(() => postMessage(100));
                await thread.run(null, data => result = data);

                thread.dispose();

                return result;

            });

        expect(res).toEqual(100);

    });

    it('`running` should reflect the thread state', async() => {

        const res =
            await page.evaluate(async() => {

                const thread = new window.Thread(() => {});
                await new Promise(resolve => {

                    function waiting() {

                        if (thread.ready) resolve();
                        else requestAnimationFrame(waiting);

                    }
                    waiting();

                });

                const state1 = thread.running;
                const pr = thread.run();
                const state2 = thread.running;
                await pr;
                const state3 = thread.running;

                thread.dispose();

                return { state1, state2, state3 };

            });

        expect(res.state1).toEqual(false);
        expect(res.state2).toEqual(true);
        expect(res.state3).toEqual(false);

    });

    it('should cancel a run if run is called again', async() => {

        const res =
            await page.evaluate(async() => {

                const thread = new window.Thread(data => data);

                let canceled = false;
                let result = null;
                thread.run(1).catch(e => canceled = e.type === 'cancel' && e.msg === null);
                result = await thread.run(2);

                thread.dispose();

                return { result, canceled };

            });

        expect(res.result).toEqual(2);
        expect(res.canceled).toEqual(true);

    });

    it('should be able to cancel immediately', async() => {

        const res =
            await page.evaluate(async() => {

                const thread = new window.Thread(() => {});

                const ready1 = thread.ready;
                let canceled = false;
                const pr = thread.run().catch(e => canceled = e.type === 'cancel' && e.msg === null);

                const running1 = thread.running;
                thread.dispose();

                const ready2 = thread.ready;
                const running2 = thread.running;

                await pr;

                return { ready1, ready2, running1, running2, canceled };

            });

        expect(res.ready1).toEqual(false);
        expect(res.running1).toEqual(true);
        expect(res.ready2).toEqual(false);
        expect(res.running2).toEqual(false);
        expect(res.canceled).toEqual(true);

    });

});

describe('ThreadPool', () => {

    it('should be able to run concurrent jobs', async() => {

        const res =
            await page.evaluate(async() => {

                const pool = new window.ThreadPool(5, data => data);
                const res =
                    await Promise.all(
                        new Array(5)
                            .fill()
                            .map((d, i) => pool.run(i))
                    );

                pool.dispose();

                return res;

            });

        expect(res).toEqual([0, 1, 2, 3, 4]);

    });

    it('should be able to run concurrent jobs up to `capacity`', async() => {

        const res =
            await page.evaluate(async() => {

                const pool = new window.ThreadPool(5, data => data);
                const activeCount = [];
                const readyState = [];
                const returnedPromise = [];
                const capacity = pool.capacity;

                activeCount.push(pool.activeThreads);
                readyState.push(pool.ready);

                Promise.all(
                    new Array(5)
                        .fill()
                        .map(() => {
                            const pr = pool.run(0);
                            returnedPromise.push(pr instanceof Promise);
                            activeCount.push(pool.activeThreads);
                            readyState.push(pool.ready);

                            return pr;
                        })
                ).catch(() => {});

                returnedPromise.push(pool.run(0) instanceof Promise);
                activeCount.push(pool.activeThreads);
                readyState.push(pool.ready);

                pool.dispose();

                return { activeCount, readyState, returnedPromise, capacity };

            });

        expect(res.capacity).toEqual(5);
        expect(res.activeCount).toEqual([0, 1, 2, 3, 4, 5, 5]);
        expect(res.readyState).toEqual([true, true, true, true, true, false, false]);
        expect(res.returnedPromise).toEqual([true, true, true, true, true, false]);

    });

});

describe('ThreadQueue', () => {

    it('should be able to queue jobs beyoned the capacity', async() => {

        const res =
            await page.evaluate(async() => {

                const queue = new window.ThreadQueue(1, data => data);
                const res =
                    await Promise.all(
                        new Array(100)
                            .fill()
                            .map((d, i) => queue.run(i))
                    );

                queue.dispose();

                return res;

            });

        expect(res).toEqual(new Array(100).fill().map((d, i) => i));

    });

});

afterAll(async() => {

    // const coverage = await page.coverage.stopJSCoverage();
    // const threadCoverage = coverage.filter(o => /Thread\.js$/.test(o.url));
    // pti.write(threadCoverage);

    browser.close();

});
