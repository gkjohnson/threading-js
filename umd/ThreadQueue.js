(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("./ThreadPool.js"));
	else if(typeof define === 'function' && define.amd)
		define(["./ThreadPool.js"], factory);
	else if(typeof exports === 'object')
		exports["ThreadQueue"] = factory(require("./ThreadPool.js"));
	else
		root["ThreadQueue"] = factory(root["ThreadPool"]);
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
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ThreadPool_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ThreadPool_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__ThreadPool_js__);


// Class to enqueue jobs and run across multiple threads
class ThreadQueue extends __WEBPACK_IMPORTED_MODULE_0__ThreadPool_js___default.a {

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
            super
                .run(...job.args)
                .then(d => {

                    job.promise.resolve(d);
                    this._tryRunQueue();

                })
                .catch(e => {

                    job.promise.reject(e);
                    this._tryRunQueue();

                });

        }

    }

}

/* harmony default export */ __webpack_exports__["default"] = (ThreadQueue);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ })
/******/ ]);
});