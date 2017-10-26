// Thread class for running a function in a webworker without
// serving a script from a server
class Thread {
    get running() { return !!this._process }

    get ready() { return this._ready }

    /* Lifecycle */
    constructor(func, srcs) {
        if (!(func instanceof Function)) throw new Error(func, ' is not a function')

        // load the scripts from the network
        const scripts = new Array(srcs.length)
        const promises = []
        srcs.forEach((s, i) => {
            const prom = fetch(s)
                .then(res => res.text())
                .then(text => scripts[i] = text)
            promises.push(prom)
        })

        Promise
            .all(promises)
            .then(() => this._initWorker(func, scripts))
    }

    /* Public API */
    // Runs the function on a webworker with the given args
    // 'intermediateFunc' is a function that will get run
    // when results re posted back to the main thread while
    // the function is running
    // Returns a promise
    run(args, intermediateFunc) {
        if (!this.ready) return
        this.cancel()
        this._worker.postMessage(args)

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
    _initWorker(func, scripts) {
        this._cachedScript = `
        ${scripts.join('\n')}
        const threadFunction = ${func}

        const __postMessage = postMessage
        postMessage = msg => {
            __postMessage({
                type: 'intermediate',
                data: msg
            })
        }

        onmessage = e => __postMessage({
            type: 'complete',
            data: threadFunction(e.data)
        })
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
                this._process.resolve(msg.data.data)
                this._process = null
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
    }
}