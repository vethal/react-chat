const path = require('path');
const BabelPolyfill = require("babel-polyfill");
const WriteFilePlugin = require('write-file-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: ['babel-polyfill', './app/chat.jsx'],
	devtool: 'inline-sourcemap',
	module: {
		loaders: [
			{ test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
			{ test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ }
		]
	},
	output: {
		path: path.join(__dirname, 'public/'),
		filename: 'javascripts/chat.min.js'
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './views/index.html',
			filename: 'index.html',
			inject: 'body'
		}),
		new WriteFilePlugin()
	]
};
