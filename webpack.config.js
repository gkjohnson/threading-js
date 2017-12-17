// Build all three files independently
const packages = ['Thread', 'ThreadPool', 'ThreadQueue']

module.exports = 
    packages
        .map(pkgName => {
            // This packages library name and
            // the file name
            const libraryName = pkgName
            const fileName = `${pkgName}.js`

            // Push the other packages into the
            // externals object
            const externals = {}
            packages
                .filter(p => pkgName !== p)
                .forEach(pkgName => {
                    const file = `./${pkgName}.js`
                    externals[file] = {
                        commonjs2:  file,
                        commonjs:   file,
                        amd:        file,
                        root:       pkgName
                    }
                })

            return {
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
        })
