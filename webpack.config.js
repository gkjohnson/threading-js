const path = require('path')
module.exports = {
    // TODO: this is outputting files for ThreadPool and ThreadQueue
    // that include all the dependencies baked into them. How can we
    // keep them split? We just want to convert es6 import > umd

    entry: {
        Thread:         './Thread.js', 
        ThreadPool:     './ThreadPool.js', 
        ThreadQueue:    './ThreadQueue.js'
    },

    output: {
        path:           path.resolve(__dirname, 'umd'),
        filename:       '[name].js',
        libraryTarget:  'umd'
    }
}