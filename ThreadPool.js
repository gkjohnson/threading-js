class ThreadPool {

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

        // TODO
        // find a non runn thread
        // return null if you cant
        // subscribe to the promise to decrement the active thread count again
        // return new promise
    }

    dispose() {
        this._capacity = 0
        this._activeThreads = 0
        this._threads.forEach(t => t.dispose())
        this._threads = []
    }
}

class ThreadQueue : ThreadPool {
    
}