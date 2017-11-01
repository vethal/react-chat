const path = require('path');
const BabelPolyfill = require("babel-polyfill");
const WriteFilePlugin = require('write-file-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
	entry: ['babel-polyfill', './public/javascripts/chat.jsx'],
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
	plugins: [
		new UglifyJSPlugin(),
		new WriteFilePlugin()
	]
};
