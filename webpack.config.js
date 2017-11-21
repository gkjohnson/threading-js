// This webpack config is built to convert a particular file
// specified in the PACKAGE environment variable into a UMD
// library file from the es6 import syntax:

// cross-env PACKAGE=ThreadQueue webpack

// will build ThreadQueue.js into a single file without bundling
// the Thread.js and ThreadPool.js dependencies. These means that
// all the files need to be built with separate processes

const libraryName = process.env.PACKAGE
const fileName = `${process.env.PACKAGE}.js`

// generate the list of external files and how to import them
// for each import convention
const packages = ['Thread', 'ThreadPool', 'ThreadQueue']
const externals = {}
packages.forEach(pkgName => {
    if (pkgName !== libraryName) {
        const file = `./${pkgName}.js`
        externals[file] = {
            commonjs2:  file,
            commonjs:   file,
            amd:        file,
            root:       pkgName
        }
    }
})

module.exports = {
    entry: `./${fileName}`,

    // Target the same file destination but in the UMD directory
    // with a target format of UMD
    output: {
        filename:       `./umd/${fileName}`,
        library:        libraryName,
        libraryTarget:  'umd'
    },

    externals
}