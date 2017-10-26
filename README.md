# javascript-thread-runner

Small wrapper for web workers that allows for running functions created in the browser without having a client to serve the worker script.

## Use
Simple example showing how to use a Thread to interleave two arrays together. Logs show that the thread takes only a couple blocking milliseconds to initialize, while the main thread takes seconds.

The thread overall takes longer to produce the results but does not block the main thread. Data transfer to and from the thread heavily impacts the run time.

```js
const interleave = (a, b) => {
  const res = []
  while(a.length || b.length) {
    a.length && res.push(a.shift())
    b.length && res.push(b.shift())
  }
  return res
}

const threadFunc = args => {
  const arr1 = args.arr1
  const arr2 = args.arr2
  
  postMessage('starting')
  const res = interleave(arr1, arr2)
  postMessage('done')
  
  return res
}

const thread = new Thread(threadFunc, { interleave })

const arr1 = []
const arr2 = []
for(let i = 0; i < 100000; i++) {
  arr1.push(Math.random())
  arr2.push(Math.random())
}

// Make sure the worker has loaded
requestAnimationFrame(() => {
  console.time('thread run')
  console.time('thread results')
  thread.run({ arr1, arr2 }, log => console.log(log)).then(res => {
    console.timeEnd('thread results')
    console.log(res)

    console.time('main thread')
    interleave(arr1, arr2)
    console.timeEnd('main thread')
  })
  console.timeEnd('thread run')
})

// thread run: 5.38720703125ms
// starting
// done
// thread results: 14559.43798828125ms
// [...]
// main thread: 4188.56884765625ms
```
## API

### Thread(func, context, srcs)
The constructor takes a function to run, a dictionary of context data and functions for use in the thread function, and an array of remote source URLs to load libraries in from.

### running
Whether or not the thread is running

### ready
Whether or not the thread is ready

### run(args, intermediateFunc)
Runs the thread function with the args value as an argument to the function.

`intermediateFunc` is a callback to recieve intermediate postMessage results from the function

Returns a promise

### cancel()
Cancels the current run and prepares for a new one

### dipose()
Disposes of the Thread data so it can't be used anymore
