// Thread class for running a function in a webworker without
// serving a script from a server
class Thread {

    static funcToString(f) {

        // class functions can't be evaluated once stringified because
        // the `function` keyword is needed in front of it, so correct
        // that here. Example:
        // "funcName() {}" => "function() {}"
        return f.toString().replace(/^[^(\s]+\(/, 'function(');

    }

    get running() {

        return !!this._process;

    }

    get ready() {

        return !!this._ready;

    }

    constructor(func, context = {}, srcs = []) {

        if (!(func instanceof Function)) throw new Error(func, ' is not a function');

        // load the scripts from the network if they're
        // not cached already
        const scripts = new Array(srcs.length);
        const promises = [];
        srcs.forEach((s, i) => {

            const script = Thread._getScript(s);
            if (script) {

                scripts[i] = script;

            } else {

                const prom = Thread._getScriptPromise(s);
                prom.then(text => scripts[i] = text);
                promises.push(prom);

            }

        });

        this._disposed = false;

        Promise
            .all(promises)
            .then(() => this._initWorker(func, context, scripts));

    }

    /* Public API */
    // Runs the function on a webworker with the given args
    // 'intermediateFunc' is a function that will get run
    // when results re posted back to the main thread while
    // the function is running
    // Returns a promise
    run(args, intermediateFunc, transferList) {

        this.cancel();
        if (!this.ready) {

            // queue up the first run if we're not quite ready yet
            this._lateRun = () => {

                this._worker.postMessage({ args, transferList }, transferList);
                delete this._lateRun;

            };

        } else {

            this._worker.postMessage({ args, transferList }, transferList);

        }

        return new Promise((resolve, reject) => {

            this._process = { resolve, reject, intermediateFunc };

        });

    }

    // Cancels the currently running process
    cancel() {

        if (this._process) {

            this._process.reject({
                type: 'cancel',
                msg: null,
            });

            this._process = null;

            if (this.ready && this.running) {

                this._worker.terminate();
                this._constructWorker();

            }

        }
        delete this._lateRun;

    }

    // disposes the current thread so it can
    // no longer be used
    dispose() {

        this.cancel();
        if (this._worker) this._worker.terminate();
        this._ready = false;
        this._disposed = true;

    }

    /* Private Functions */
    // initialize the worker and cache the script
    // to use in the worker
    _initWorker(func, context, scripts) {

        if (this._disposed) return;

        this._cachedScript = `
        // context definition
        ${
    Object
        .keys(context)
        .map(key => {

            // manually stringify functions
            const data = context[key];
            const isFunc = data instanceof Function;
            let str = null;
            if (isFunc) str = Thread.funcToString(data);
            else str = JSON.stringify(data);

            return `const ${ key } = ${ str };`;

        })
        .join('\n')
}

        // scripts
        ${ scripts.join('\n') }

        // self calling function so the thread function
        // doesn't have access to our scope
        ;(function(threadFunc) {

            // override the "postMessage" function
            const __postMessage = postMessage
            postMessage = msg => {
                __postMessage({
                    type: 'intermediate',
                    data: msg
                });
            };

            // set the on message function to start a
            // thread run
            onmessage = e => {

                const res = threadFunc(e.data.args);
                const doComplete = data => {
                    __postMessage({
                        type: 'complete',
                        data: data
                    },
                    e.data.transferList)
                };

                if (res instanceof Promise) res.then(data => doComplete(data));
                else doComplete(res);
            };
        })(${ Thread.funcToString(func) })
        `;

        this._constructWorker();

    }

    // consruct the worker
    _constructWorker() {

        // create the blob
        const blob = new Blob([this._cachedScript], { type: 'plain/text' });
        const url = URL.createObjectURL(blob);

        // create the worker
        this._worker = new Worker(url);
        this._worker.onmessage = msg => {

            if (msg.data.type === 'complete') {

                // set the process to null before resolving
                // in case you want to run in the resolve function
                const pr = this._process;
                this._process = null;
                pr.resolve(msg.data.data);

            } else if (this._process.intermediateFunc) {

                this._process.intermediateFunc(msg.data.data);

            }

        };
        this._worker.onerror = e => {

            this._process.reject({ type: 'error', msg: e.message });
            this._process = null;

        };

        // dispose of the blob on the next frame because
        // we need to make sure the worker has loaded it
        requestAnimationFrame(() => URL.revokeObjectURL(url));

        this._ready = true;
        if (this._lateRun) this._lateRun();

    }

}

// Thrad script cache
Thread._cachedScripts = {};
Thread._scriptPromises = {};

Thread._getScript = src => src in Thread._cachedScripts ? Thread._cachedScripts[src] : null;
Thread._getScriptPromise = src => {

    if (src in Thread._scriptPromises) return Thread._scriptPromises[src];

    return Thread._scriptPromises[src] = new Promise((res, rej) => {

        fetch(src, { credentials: 'same-origin' })
            .then(data => data.text())
            .then(text => {

                Thread._cachedScripts[src] = text;
                res(text);

            })
            .catch(e => {

                console.error(`Could not load script from '${ src }'`);
                console.error(e);

            });

    });

};

export default Thread;
