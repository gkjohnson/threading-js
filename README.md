# threading-js

[![npm version](https://badge.fury.io/js/threading-js.svg)](https://www.npmjs.com/package/threading-js)

Small wrapper for browser [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) that simplfies running tasks and allows running without having to serve a worker script to the client.

## Use
Simple example showing how to use a Thread to interleave two arrays together using a SharedArrayBuffer. Using basic arrays increases the run time due to copying the data. ArrayBuffer ownership can be transferred using the `transferList` parameter in `run` and `postMessage`.

The function being passed to the thread must be completely self-contained and only reference data in the passed 'context' object or loaded scripts. All data passed into the context object will be stringified to be copied.

#### With ES6 Imports

Example [here](./example/index.html)

```js
import Thread from '.../node_modules/threading-js/Thread.js'

// Operation functions
const interleave = (a, b, res) => {
  let i = 0
  while(true) {
    if (i >= a.length || i >= b.length) break

    res[2 * i + 0] = a[i]
    res[2 * i + 1] = b[i]
    i++
  }
  return res
}

const threadFunc = args => {
  const arr1 = args.arr1
  const arr2 = args.arr2
  const res = args.res

  postMessage('starting')
  const data = interleave(arr1, arr2, res)
  postMessage('done')
  
  return data
}

// Create thread
const thread = new Thread(threadFunc, { interleave })

// Create data
const ARRAY_LENGTH = 10000000
const arr1 = new Float32Array(new SharedArrayBuffer(ARRAY_LENGTH * 4))
const arr2 = new Float32Array(new SharedArrayBuffer(ARRAY_LENGTH * 4))
const sharedres = new Float32Array(new SharedArrayBuffer(ARRAY_LENGTH * 4 * 2))
for(let i = 0; i < ARRAY_LENGTH; i++) {
  arr1[i] = Math.random()
  arr2[i] = Math.random()
}

// Run the tests
console.time('main thread run')
interleave(arr1, arr2, sharedres)
console.timeEnd('main thread run')

console.time('initial thread run')
thread
    .run({ arr1, arr2, res: sharedres }, log => console.log(log))
    .then(res => {
        console.timeEnd('initial thread run')

        console.time('subsequent thread run')
        return thread.run({ arr1, arr2, res: sharedres }, log => console.log(log))
    })
    .then(res => {
        console.timeEnd('subsequent thread run')
    })

// main thread run: 30.962158203125ms
// starting
// done
// initial thread run: 111.95703125ms
// starting
// done
// subsequent thread run: 35.179931640625ms
```

#### With UMD

Example [here](./example/index.umd.html)

```html
<script type="text/javascript" src="../umd/Thread.js"></script>
<script type="text/javascript" src="../umd/ThreadPool.js"></script>
<script type="text/javascript" src="../umd/ThreadQueue.js"></script>

<script>
  const Thread = window.Thread.default
  const thread = new Thread(...)
  
  // ...use the thread...
</script>
```

# API

## Thread

### constructor(threadFunc, context, srcs)
The constructor takes a function to run, a dictionary of context data and functions for use in the thread function, and an array of remote source URLs to load libraries in from.

`threadFunc` is the function to run in the worker. The value returned by this function will be passed back as the result of the run. `postMessage` can be used in this, as well, to post intermediate results back to the main thread.

`context` is a shallow dictionary of data or functions to be injected into the web worker scope.

`srcs` is an array of script URLs to load from.

### running
Whether or not the thread is running

### ready
Whether or not the thread is ready

### run(args, intermediateFunc, transferList)
Runs the thread function with the args value as an argument to the function.

`intermediateFunc` is a callback to recieve intermediate postMessage results from the function. Use the intermediate postMessage function to transfer items as there's no way to return a list of items to transfer from thread function.

`transferList` the equivelant of the `postMessage` transfer list argument. Note that items in the transfer list are automatically retured once the run is completed.

Returns a promise.

### cancel()
Cancels the current run and prepares for a new one.

### dipose()
Disposes of the Thread data so it can't be used anymore.

## ThreadPool
A thread pool for easily running many of the same type of task in parallel.

### constructor(capacity, func, context, srcs, options)
Like the thread constructor, but takes a capacity as the first argument.

**options.initializeImmediately = true**: Creates all the threads immediately instead of lazily creating them so no intialization overhead is incurred.

### ready
Whether the pool has inactive threads.

### activeThreads
The number of currently inactive threads.

### capacity
The total possible number of threads the pool can support.

### run(...)
Get and use an available thread to run the requested task. Behaves like `Thread.run`, but returns `null` if there are not threads available in the pool.

### dispose()
Dispose of all threads and data.

## ThreadQueue
A helper class for creating a job queue and running through the tasks using as many threads to work as the capacity allows.

### constructor(...)
Same as the `ThreadPool` constructor.

### run(...)
Same as `Thread.run`.

### dispose()
Same as `ThreadPool.dispose`
