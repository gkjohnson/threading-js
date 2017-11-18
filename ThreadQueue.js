import ThreadPool from 'ThreadPool.js'

// Class to enqueue jobs and run across multiple threads
class ThreadQueue extends ThreadPool {
    get ready() { return true }

    /* Public API */
    run() {
        this._queue = this._queue || []

        // create the job to enqueue
        const job = { args: [...arguments], promise: null }
        const pr = new Promise((resolve, reject) => job.promise = { resolve, reject })

        this._queue.push(job)
        this._tryRunQueue()
        return pr
    }

    dispose() {
        super.dispose()
        this._queue = []
    }

    /* Private Functions */
    // Try to run the jobs on the queue
    _tryRunQueue() {
        // run jobs on the queue on the threadpool is
        // saturated
        while (super.ready && this._queue.length) {
            const job = this._queue.shift()
            super
                .run(...job.args)
                .then(d => {
                    job.promise.resolve(d)
                    this._tryRunQueue()
                })
                .catch(e => {
                    job.promise.reject(e)
                    this._tryRunQueue()
                })
        }
    }
}

export default ThreadQueue