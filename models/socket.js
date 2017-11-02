// socket.js
const Configuration = require('../config/configuration');
const Dictionary = require('./dictionary');

function Socket(server) {
	var cookieParser = require('cookie-parser');
	var mongoose = require('mongoose');
	var passport = require('passport');
	var session = require('express-session');
	var MongoStore = require("connect-mongo")(session);
	var passportSocketIo = require("passport.socketio");
	var io = require('socket.io')(server);

	mongoose.connect(Configuration.DB_HOST, { useMongoClient: true }); // connect to database
	require('../config/passport')(passport); // pass passport for configuration

	io.use(passportSocketIo.authorize({
		cookieParser: cookieParser,
		secret: Configuration.SERVER.SESSION_SECRET,
		store: new MongoStore({mongooseConnection: mongoose.connection}),
		passport: passport,
		success: (data, accept) => accept(),
		fail: (data, message, error, accept) => accept(new Error(Dictionary.SOCKET_AUTH_ERROR))
	}));

	io.on('connection', (socket) => {
		const chat = require('./chat')(socket);
		socket.on('get-rooms', chat.onGetRooms);
		socket.on('get-messages', chat.onGetMessages);
		socket.on('get-update', chat.onGetUpdate);
		socket.on('create-room', chat.onCreateRoom);
		socket.on('add-participants', chat.onAddParticipants);
		socket.on('exit-room', chat.onExitRoom);
		socket.on('send-text', chat.onText);
		socket.on('update-read', chat.onUpdateRead);
		socket.on('disconnect', chat.onDisconnect);
	});
}

module.exports = Socket;


