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
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	var parentJsonpFunction = window["webpackJsonp"];
/******/ 	window["webpackJsonp"] = function webpackJsonpCallback(chunkIds, moreModules, executeModules) {
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [], result;
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(chunkIds, moreModules, executeModules);
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/ 		if(executeModules) {
/******/ 			for(i=0; i < executeModules.length; i++) {
/******/ 				result = __webpack_require__(__webpack_require__.s = executeModules[i]);
/******/ 			}
/******/ 		}
/******/ 		return result;
/******/ 	};
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// objects to store loaded and loading chunks
/******/ 	var installedChunks = {
/******/ 		2: 0
/******/ 	};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/ 	// This file contains only the entry chunk.
/******/ 	// The chunk loading function for additional chunks
/******/ 	__webpack_require__.e = function requireEnsure(chunkId) {
/******/ 		var installedChunkData = installedChunks[chunkId];
/******/ 		if(installedChunkData === 0) {
/******/ 			return new Promise(function(resolve) { resolve(); });
/******/ 		}
/******/
/******/ 		// a Promise means "currently loading".
/******/ 		if(installedChunkData) {
/******/ 			return installedChunkData[2];
/******/ 		}
/******/
/******/ 		// setup Promise in chunk cache
/******/ 		var promise = new Promise(function(resolve, reject) {
/******/ 			installedChunkData = installedChunks[chunkId] = [resolve, reject];
/******/ 		});
/******/ 		installedChunkData[2] = promise;
/******/
/******/ 		// start chunk loading
/******/ 		var head = document.getElementsByTagName('head')[0];
/******/ 		var script = document.createElement('script');
/******/ 		script.type = 'text/javascript';
/******/ 		script.charset = 'utf-8';
/******/ 		script.async = true;
/******/ 		script.timeout = 120000;
/******/
/******/ 		if (__webpack_require__.nc) {
/******/ 			script.setAttribute("nonce", __webpack_require__.nc);
/******/ 		}
/******/ 		script.src = __webpack_require__.p + "" + chunkId + ".js";
/******/ 		var timeout = setTimeout(onScriptComplete, 120000);
/******/ 		script.onerror = script.onload = onScriptComplete;
/******/ 		function onScriptComplete() {
/******/ 			// avoid mem leaks in IE.
/******/ 			script.onerror = script.onload = null;
/******/ 			clearTimeout(timeout);
/******/ 			var chunk = installedChunks[chunkId];
/******/ 			if(chunk !== 0) {
/******/ 				if(chunk) {
/******/ 					chunk[1](new Error('Loading chunk ' + chunkId + ' failed.'));
/******/ 				}
/******/ 				installedChunks[chunkId] = undefined;
/******/ 			}
/******/ 		};
/******/ 		head.appendChild(script);
/******/
/******/ 		return promise;
/******/ 	};
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// on error function for async loading
/******/ 	__webpack_require__.oe = function(err) { console.error(err); throw err; };
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
// Thread class for running a function in a webworker without
// serving a script from a server
class Thread {
    get running() {
        return !!this._process;
    }

    get ready() {
        return this._ready;
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

        Promise.all(promises).then(() => this._initWorker(func, context, scripts));
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
                this._worker.postMessage({ args, transferList }, transferList);
                delete this._lateRun;
            };
        } else {
            this.cancel();
            this._worker.postMessage({ args, transferList }, transferList);
        }

        return new Promise((resolve, reject) => {
            this._process = { resolve, reject, intermediateFunc };
        });
    }

    // Cancels the currently running process
    cancel() {
        if (this.ready && this.running && this._process) {
            this._process.reject({
                type: 'cancel',
                msg: null
            });

            this._process = null;

            this._worker.terminate();
            this._constructWorker();
        }
        delete this._lateRun;
    }

    // disposes the current thread so it can
    // no longer be used
    dispose() {
        this._worker.terminate();
        this._ready = false;
    }

    /* Private Functions */
    // initialize the worker and cache the script
    // to use in the worker
    _initWorker(func, context, scripts) {
        this._cachedScript = `
        // context definition
        ${Object.keys(context).map(key => {
            // manually stringify functions
            const data = context[key];
            const str = data instanceof Function ? data.toString() : JSON.stringify(data);

            return `const ${key} = ${str}`;
        }).join('\n')}

        // scripts
        ${scripts.join('\n')}

        // self calling function so the thread function
        // doesn't have access to our scope
        (function(threadFunc) {
            
            // override the "postMessage" function
            const __postMessage = postMessage
            postMessage = msg => {
                __postMessage({
                    type: 'intermediate',
                    data: msg
                })
            }

            // set the on message function to start a
            // thread run
            onmessage = e => {
                const res = threadFunc(e.data.args)
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
        })(${func})
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
        fetch(src, { credentials: 'same-origin' }).then(data => data.text()).then(text => {
            Thread._cachedScripts[src] = text;
            res(text);
        }).catch(e => {
            console.error(`Could not load script from '${src}'`);
            console.error(e);
        });
    });
};

/* harmony default export */ __webpack_exports__["default"] = (Thread);

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Thread_js__ = __webpack_require__(0);


// Thread Pool for creating multiple threads with the same
// function and running them in parallel
class ThreadPool {

    // whether the pool has available threads
    get ready() {
        return this._activeThreads < this._capacity;
    }

    get activeThreads() {
        return this._activeThreads;
    }
    get capacity() {
        return this._capacity;
    }

    constructor(capacity, func, context = {}, srcs = [], options = {}) {
        this._capacity = capacity;
        this._activeThreads = 0;
        this._threads = [];

        this._threadArgs = [func, context, srcs];

        if (options.initializeImmediately) this._createThreadsUpTo(this.capacity);
    }

    /* Public API */
    run() {
        // Increment the number of running threads up to
        // capacity.
        this._activeThreads = Math.min(this._activeThreads + 1, this._capacity);
        this._createThreadsUpTo(this._activeThreads);

        // Find a thread to run. If we can't find a thread that is
        // ready and able to run, we return null
        const currThread = this._threads.filter(t => !t.running)[0];
        if (!currThread) return null;

        return new Promise((res, rej) => {
            currThread.run(...arguments).then(d => {
                this._activeThreads--;
                res(d);
            }).catch(e => {
                this._activeThreads--;
                rej(e);
            });
        });
    }

    dispose() {
        this._capacity = 0;
        this._activeThreads = 0;
        this._threads.forEach(t => t.dispose());
        this._threads = [];
    }

    /* Private Functions */
    _createThread() {
        this._threads.push(new __WEBPACK_IMPORTED_MODULE_0__Thread_js__["default"](...this._threadArgs));
    }

    _createThreadsUpTo(count) {
        count = Math.min(count, this.capacity);
        if (count > this._threads.length) this._createThread();
    }
}

/* harmony default export */ __webpack_exports__["default"] = (ThreadPool);

/***/ })
/******/ ]);
});