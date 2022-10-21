const path = require('path');

module.exports = {
    mode: 'production',
    devtool: 'hidden-source-map',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
    }
}
//# sourceMappingURL=域名/dist/index.js.map
