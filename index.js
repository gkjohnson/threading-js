class Thread {
    get running() { return !!this._process }

    get ready() { return this._ready }

    constructor(func, ...args) {
        if (!(func instanceof Function)) throw new Error(func, ' is not a function')

        const scripts = new Array(args.length)
        const promises = []
        args.forEach((s, i) => {
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
    run(args, intermediateFunc) {
        if (!this.ready) return
        this.cancel()
        this._worker.postMessage(args)

        return new Promise((resolve, reject) => { this._process = { resolve, reject, intermediateFunc } })
    }

    cancel() {
        if (this.running && this._process) {
            this._process.reject({
                type: 'cancel',
                msg: null
            })

            this._process = null

            this._worker.terminate()
            this._constructWorker()
        }
    }

    dispose() {
        this._worker.terminate()
        this._ready = false
    }

    /* Private Functions */
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

    _constructWorker() {
        const blob = new Blob([this._cachedScript], { type: 'plain/text' })
        const url = URL.createObjectURL(blob)
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
        requestAnimationFrame(() => URL.revokeObjectURL(url))

        this._ready = true
    }
}