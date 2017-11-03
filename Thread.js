// Thread class for running a function in a webworker without
// serving a script from a server
class Thread {
    get running() { return !!this._process }

    get ready() { return this._ready }

    constructor(func, context = {}, srcs = []) {
        if (!(func instanceof Function)) throw new Error(func, ' is not a function')

        // load the scripts from the network if they're
        // not cached already
        const scripts = new Array(srcs.length)
        const promises = []
        srcs.forEach((s, i) => {
            const script = Thread._getScript(s)
            if (script) {
                scripts[i] = script
            } else {
                const prom = Thread._getScriptPromise(s)
                prom.then(text => scripts[i] = text)
                promises.push(prom)
            }
        })

        Promise
            .all(promises)
            .then(() => this._initWorker(func, context, scripts))
    }

    /* Public API */
    // Runs the function on a webworker with the given args
    // 'intermediateFunc' is a function that will get run
    // when results re posted back to the main thread while
    // the function is running
    // Returns a promise
    run(args, intermediateFunc, transferList) {
        if (!this.ready) {
            // queue up the first run if we're not quite ready yet
            this._lateRun = () => {
                this._worker.postMessage({ args, transferList }, transferList)
                delete this._lateRun
            }
        } else {
            this.cancel()
            this._worker.postMessage({ args, transferList }, transferList)
        }

        return new Promise((resolve, reject) => { this._process = { resolve, reject, intermediateFunc } })
    }

    // Cancels the currently running process
    cancel() {
        if (this.ready && this.running && this._process) {
            this._process.reject({
                type: 'cancel',
                msg: null
            })

            this._process = null

            this._worker.terminate()
            this._constructWorker()
        }
        delete this._lateRun
    }

    // disposes the current thread so it can
    // no longer be used
    dispose() {
        this._worker.terminate()
        this._ready = false
    }

    /* Private Functions */
    // initialize the worker and cache the script
    // to use in the worker
    _initWorker(func, context, scripts) {
        this._cachedScript = `
        // context definition
        ${
            Object
                .keys(context)
                .map(key => {
                    // manually stringify functions
                    const data = context[key]
                    const str = data instanceof Function ? data.toString() : JSON.stringify(data)

                    return `const ${key} = ${str}`
                })
                .join('\n')
        }

        // scripts
        ${scripts.join('\n')}

        // process function
        const threadFunction = ${func}

        // callbacks
        const __postMessage = postMessage
        postMessage = msg => {
            __postMessage({
                type: 'intermediate',
                data: msg
            })
        }

        onmessage = e => {
            const res = threadFunction(e.data.args)
            const doComplete = data => {
                __postMessage({
                    type: 'complete',
                    data: data
                },
                e.data.transferList)
            }

            if (res instanceof Promise) res.then(data => doComplete(data))
            else doComplete(res)
        }
        `

        this._constructWorker()
    }

    // consruct the worker
    _constructWorker() {
        // create the blob
        const blob = new Blob([this._cachedScript], { type: 'plain/text' })
        const url = URL.createObjectURL(blob)
        
        // create the worker
        this._worker = new Worker(url)
        this._worker.onmessage = msg => {
            if (msg.data.type === 'complete') {
                // set the process to null before resolving
                // in case you want to run in the resolve function
                const pr = this._process
                this._process = null
                pr.resolve(msg.data.data)
            } else if(this._process.intermediateFunc) {
                this._process.intermediateFunc(msg.data.data)
            }
        }
        this._worker.onerror = e => {
            this._process.reject({ type: 'error', msg: e.message })
            this._process = null
        }

        // dispose of the blob on the next frame because
        // we need to make sure the worker has loaded it
        requestAnimationFrame(() => URL.revokeObjectURL(url))

        this._ready = true
        if (this._lateRun) this._lateRun()
    }
}

// Thrad script cache
Thread._cachedScripts = {}
Thread._scriptPromises = {}

Thread._getScript = src => src in Thread._cachedScripts ? Thread._cachedScripts[src] : null
Thread._getScriptPromise = src => {
    if (src in Thread._scriptPromises) return Thread._scriptPromises[src]

    return Thread._scriptPromises[src] = new Promise((res, rej) => {
        fetch(src)
            .then(data => data.text())
            .then(text => {
                Thread._cachedScripts[src] = text
                res(text)
            })
            .catch(e => {
                console.error(`Could not load script from '${src}'`)
                console.error(e)
            })
    })
}