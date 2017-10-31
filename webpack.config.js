const path = require('path');
const BabelPolyfill = require("babel-polyfill");
const WriteFilePlugin = require('write-file-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const debug = process.env.NODE_ENV !== 'production';
module.exports = {
	entry: ['babel-polyfill', './public/javascripts/chat.jsx'],
	devtool: debug ? 'inline-sourcemap' : null,
	module: {
		loaders: [
			{ test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
			{ test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ }
		]
	},
	output: {
		path: path.join(__dirname, 'public/javascripts/'),
		filename: 'chat.min.js'
	},
	plugins: debug ? [
		// Debug plugins
		new HtmlWebpackPlugin({
			template: './views/index.html',
			filename: 'index.html',
			inject: 'body'
		}),
		new WriteFilePlugin()
	] : [
		// Release plugins
		new UglifyJSPlugin(),
		new WriteFilePlugin()
	]
};
