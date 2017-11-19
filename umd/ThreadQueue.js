(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return webpackJsonp([0],{

/***/ 2:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ThreadPool_js__ = __webpack_require__(1);


// Class to enqueue jobs and run across multiple threads
class ThreadQueue extends __WEBPACK_IMPORTED_MODULE_0__ThreadPool_js__["default"] {
    get ready() {
        return true;
    }

    /* Public API */
    run() {
        this._queue = this._queue || [];

        // create the job to enqueue
        const job = { args: [...arguments], promise: null };
        const pr = new Promise((resolve, reject) => job.promise = { resolve, reject });

        this._queue.push(job);
        this._tryRunQueue();
        return pr;
    }

    dispose() {
        super.dispose();
        this._queue = [];
    }

    /* Private Functions */
    // Try to run the jobs on the queue
    _tryRunQueue() {
        // run jobs on the queue on the threadpool is
        // saturated
        while (super.ready && this._queue.length) {
            const job = this._queue.shift();
            super.run(...job.args).then(d => {
                job.promise.resolve(d);
                this._tryRunQueue();
            }).catch(e => {
                job.promise.reject(e);
                this._tryRunQueue();
            });
        }
    }
}

/* harmony default export */ __webpack_exports__["default"] = (ThreadQueue);

/***/ })

},[2]);
});