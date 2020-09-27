const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const isDev = process.env.NODE_ENV !== 'production';
const mode = isDev ? 'development' : 'production';
const devtool = isDev ? 'inline-source-map': false;

module.exports = {
    entry: './src/types.ts',
    mode,
    devtool,
    output: {
        globalObject: `(function(){ try{ return typeof self !== 'undefined';}catch(err){return false;}})() ? self : this`,
        path: path.resolve(__dirname, 'dist'),
        filename: 'aem-spa-page-model-manager.js',
        library: 'aemSpaPageModelManager',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            {
                test: /.ts$/,
                exclude: /(node_modules|dist)/,
                use: {
                    loader: 'ts-loader',
                },
                enforce: 'post'
            }
        ]
    },
    resolve: {
        extensions: ['.ts']
    },
    externals: [ nodeExternals() ],
    plugins: [
        new CleanWebpackPlugin()
    ]
};
