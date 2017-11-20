// This webpack config is built to convert a particular file
// specified in the PACKAGE environment variable into a UMD
// library file from the es6 import syntax:

// cross-env PACKAGE=ThreadQueue webpack

// will build ThreadQueue.js into a single file without bundling
// the Thread.js and ThreadPool.js dependencies. These means that
// all the files need to be built with separate processes

const libraryName = process.env.PACKAGE
const fileName = `${process.env.PACKAGE}.js`

module.exports = {
    entry: `./${fileName}`,

    // Target the same file destination but in the UMD directory
    // with a target format of UMD
    output: {
        filename:       `./umd/${fileName}`,
        library:        libraryName,
        libraryTarget:  'umd'
    },

    // Babel-loader is used to convert es6 imports into the module.exports
    // syntax and the "add-module-exports" babel plugin is used to ensure that
    // the expected class is exported as the package instead of it being placed
    // into the "default" field.
    module: {
        rules: [{
            test: /\.js$/,
            use: ['babel-loader']
        }]
    },

    // Skip any file that is not the one we're packaging so webpack
    // does _not_ bundle all the dependencies into a single file
    externals: [function(context, request, callback) {
        if(request.indexOf(fileName) !== -1) callback()
        else callback(null, 'commonjs ' + request)
    }]
}