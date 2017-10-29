// Thread Pool for creating multiple threads with the same
// function and running them in parallel
class ThreadPool {

    // whether the pool has available threads
    get ready() { return this._activeThreads < this._capacity }

    get activeThreads() { return this._activeThreads }
    get capacity() { return this._capacity }
    
    constructor(capacity, func, context = {}, srcs = []) {
        this._capacity = capacity
        this._activeThreads = 0
        this._threads = []

        this._threadArgs = [func, context, srcs]
    }

    run() {
        // Increment the number of running threads up to
        // capacity.
        this._activeThreads = Math.min(this._activeThreads + 1, this._capacity)
        if (this._activeThreads > this._threads.length) this._threads.push(new Thread(...this._threadArgs))

        // Find a thread to run. If we can't find a thread that is
        // ready and able to run, we return null

        // TODO: Make sure the thread will queue up a run even if it's not
        // ready yet so we don't have this weird async issue
        const currThread = this._threads.filter(t => !t.running)[0]
        console.log(this._threads.filter(t => !t.running))
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

// Class to enqueue jobs and run across multiple threads
class ThreadQueue extends ThreadPool {
    get ready() { return true }

    run() {
        this._queue = this._queue || []

        // create the job to enqueue
        const job = { args: [...arguments], promise: null }
        const pr = new Promise((resolve, reject) => job.promise = { resolve, reject })

        this._queue.push(job)
        this.tryRunQueue()
    }

    // Try to run the jobs on the queue
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