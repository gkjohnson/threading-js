# javascript-thread

Small wrapper for web workers that allows for running functions created in the browser without having a client to serve the worker script.

## Use
Simple example showing how to use a Thread to interleave two arrays together using a SharedArrayBuffer. Using basic arrays increases the run time due to copying the data.

```js
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
## API

### Thread

#### constructor(func, context, srcs)
The constructor takes a function to run, a dictionary of context data and functions for use in the thread function, and an array of remote source URLs to load libraries in from.

#### running
Whether or not the thread is running

#### ready
Whether or not the thread is ready

#### run(args, intermediateFunc, transferList)
Runs the thread function with the args value as an argument to the function.

`intermediateFunc` is a callback to recieve intermediate postMessage results from the function.

`transferList` maps to the web-worker transfer list.

Returns a promise.

#### cancel()
Cancels the current run and prepares for a new one.

#### dipose()
Disposes of the Thread data so it can't be used anymore.

### ThreadPool
A thrad pool for easily running many of the same type of task in parallel.

#### constructor(capacity, func, context, srcs)
Like the thread constructor, but takes a capacity as the first argument.

#### ready
Whether the pool has inactive threads.

#### activeThreads
The number of currently inactive threads.

#### capacity
The total possible number of threads the pool can support.

#### run(...)
Get and use an available thread to run the requested task. Behaves like `Thread.run`, but returns `null` if there are not threads available in the pool.

#### dispose()
Dispose of all threads and data.

### ThreadQueue
A helper class for creating a job queue and running through the tasks using as many threads to work as the capacity allows.

#### constructor(...)
Same as the `ThreadPool` constructor.

#### run(...)
Same as `Thread.run`.

#### dispose()
Same as `ThreadPool.dispose`