module.exports = {
    // TODO
    // https://webpack.js.org/configuration/
    entry: ['Thread.js', 'ThreadPools.js', 'ThreadQueue.js'],

    output: {
        path: path.resolve(__dirname, 'dist'),

        filename: '[name].umd.js',

        library: 'threading-js',

        libraryTarget: 'umd'
    }
}