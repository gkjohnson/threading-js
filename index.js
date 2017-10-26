class Thread {
    get status() { return this._status }

    get running() { return this.status === 'running' }

    get ready() { return this.status === 'ready' || this.running }

    constructor(func, ...args) {
        this._status = 'invalid'
        if (!(func instanceof Function)) throw new Error(func, ' is not a function')
        this._status = 'constructing'

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
            .then(() => this.initWorker(func, scripts))
    }

    initWorker(func, scripts) {
        this._cachedScript = `
        ${scripts.join('\n')}
        const threadFunction = ${func}

        onmessage = e => postMessage(threadFunction(e.data))
        `

        this.constructWorker()
    }

    constructWorker() {
        const blob = new Blob([this._cachedScript], { type: 'plain/text' })
        const url = URL.createObjectURL(blob)
        this._worker = new Worker(url)
        this._worker.onmessage = msg => {
            this._promise.resolve(msg.data)
            this._promise = null
        }
        this._worker.onerror = e => {
            this._promise.reject({ type: 'error', msg: e.message })
            this._promise = null
        }
        requestAnimationFrame(() => URL.revokeObjectURL(url))

        this._status = 'ready'
    }

    run(args) {
        if (!this.ready) return
        this.cancel()
        this._worker.postMessage(args)

        return new Promise((resolve, reject) => { this._promise = { resolve, reject } })
    }

    cancel() {
        if (this.running && this._promise) {
            this._promise.reject({
                type: 'cancel',
                msg: null
            })

            this._promise = null

            this._worker.terminate()
            this.constructWorker()
        }
    }
}