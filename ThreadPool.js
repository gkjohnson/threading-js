class ThreadPool {

    get ready() { return this._activeThreads < this._capacity }
    get activeThreads() { return this._activeThreads }
    get capacity() { return this._capacity }
    
    constructor(capacity, func, context = {}, srcs = {}) {
        this._capacity = capacity
        this._activeThreads = 0
        this._threads = []

        this._threadArgs = [func, context, srcs]
    }

    run() {
        this._activeThreads = Math.max(this._activeThreads + 1, this._capacity)

        if (this._activeThreads > this._threads.length) this._threads.push(new Thread(...this._threadArgs))

        const currThread = this._threads.filter(t => t.ready && !t.running)[0]
        if (!currThread) return null
        
        return new Promise((res, rej) => {
            currThread
            .run(...arguments)
            .then(d => {
                this._activeThreads--
                res(d)
            })
            .catch(e => {
                this._activeThreads--
                rej(e)
            })
        })
    }

    dispose() {
        this._capacity = 0
        this._activeThreads = 0
        this._threads.forEach(t => t.dispose())
        this._threads = []
    }
}

class ThreadQueue : ThreadPool {
    get ready() { return true }

    run() {
        this._queue = this._queue || []
        const job = {
            args: [...arguments],
            promise: null
        }
        const pr = new Promise((resolve, reject) => job.promise = { resolve, reject })

        this._queue.push(job)
        this.tryRunQueue()
    }

    tryRunQueue() {
        while (this.ready && this._queue.length) {
            const job = this._queue.shift()
            super
                .run(...job.args)
                .then(d => {
                    job.promise.resolve(d)
                    this.tryRunQueue()
                })
                .catch(e => {
                    job.promise.reject(e)
                    this.tryRunQueue()
                })
        }
    }

    dispose() {
        super.dispose()
        this._queue = []
    }
}