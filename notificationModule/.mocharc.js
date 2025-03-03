module.exports = {
    extension: ['js'],
    reporter: "spec",
    spec: ['src/**/*.spec.js', 'src/**/*.test.js', 'tests/**/*.test.js', 'specs/**/*.spec.js'],
    watchFiles: ['**/*.js'],
    watchIgnore: ['node_modules']
}