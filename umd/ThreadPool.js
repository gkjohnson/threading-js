(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("./Thread.js"));
	else if(typeof define === 'function' && define.amd)
		define(["./Thread.js"], factory);
	else if(typeof exports === 'object')
		exports["ThreadPool"] = factory(require("./Thread.js"));
	else
		root["ThreadPool"] = factory(root["Thread"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Thread_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Thread_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__Thread_js__);


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

            currThread
                .run(...arguments)
                .then(d => {

                    this._activeThreads--;
                    res(d);

                })
                .catch(e => {

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

        this._threads.push(new __WEBPACK_IMPORTED_MODULE_0__Thread_js___default.a(...this._threadArgs));

    }

    _createThreadsUpTo(count) {

        count = Math.min(count, this.capacity);
        if (count > this._threads.length) this._createThread();

    }

}

/* harmony default export */ __webpack_exports__["default"] = (ThreadPool);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ })
/******/ ]);
});