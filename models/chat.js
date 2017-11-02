// chat.js
const Isemail = require('isemail');

// remove when async/await supports natively
const async = require('asyncawait/async');
const await = require('asyncawait/await');

const Dictionary = require('./dictionary');
const User = require('./db/user');
const Room = require('./db/room');

var socketList = [];

function Chat(socket) {
	// add user to all his rooms
	let user = socket.request.user;
	let userId = user['_id'];
	socketList[userId] = socket;
	user.rooms.forEach((room) => socket.join(room.room));
	let {name, email} = user;
	socket.emit('init', {name, email});

	return {
		onGetRooms: (callback) => {
			// ToDo: input validation
			User.getRooms(userId)
			.then(callback)
			.catch(() => callback(Dictionary.FETCHING_ROOMS_FAILURE));
		},
		onGetMessages: (room, callback) => {
			// ToDo: input validation
			getMessages(user, room)
			.then(callback)
			.catch(() => callback(Dictionary.FETCHING_MESSAGES_FAILURE));
		},
		onGetUpdate: (room, callback) => {
			// ToDo: input validation
			getUpdate(user, room)
			.then(callback)
			.catch(() => callback(Dictionary.FETCHING_UPDATE_FAILURE));
		},
		onCreateRoom: (name, callback) => {
			// ToDo: input validation
			createRoom(user, name)
			.then(callback)
			.catch(() => callback(Dictionary.ROOM_CREATE_FAILURE));
		},
		onAddParticipants: (participants, room, callback) => {
			// ToDo: input validation
			addParticipants(user, participants, room)
			.then(callback)
			.catch(() => callback(Dictionary.ADD_PARTICIPANTS_FAILURE));
		},
		onExitRoom: (room, callback) => {
			// ToDo: input validation
			exitRoom(user, room)
			.then(() => callback())
			.catch(() => callback(Dictionary.EXIT_ROOM_FAILURE));
		},
		onText: (text, room, callback) => {
			// ToDo: input validation
			sendText(user, text, room)
			.then(callback)
			.catch(() => callback(Dictionary.SEND_TEXT_FAILURE));
		},
		onUpdateRead: (read, room, callback) => {
			// ToDo: input validation
			updateRead(user, read, room)
			.then(callback)
			.catch(() => callback(Dictionary.UPDATE_READ_FAILURE));
		},
		onDisconnect: (reason) => {
			delete socketList[userId];
		}
	}
}

module.exports = Chat;

// get messages implementation
var getMessages = async (function (user, room) {
	let userId = user['_id'];
	// check whether user has access to room
	if (!await (Room.checkAccess(userId, room))) {
		throw new Error(Dictionary.ACCESS_DENIED);
	}
	return await (Room.getMessages(room));
});

// get update implementation
var getUpdate = async (function (user, room) {
	let userId = user['_id'];
	// check whether user has access to room
	if (!await (Room.checkAccess(userId, room))) {
		throw new Error(Dictionary.ACCESS_DENIED);
	}
	return await (User.getUpdate(userId, room));
});

// create room implementation
var createRoom = async (function (user, name) {
	let userId = user['_id'];
	let email = name.trim().toLowerCase();
	// create room
	let time = new Date();
	let room = await (Room.createRoom(name, userId));
	// add room to user
	await (User.addRoom(userId, room.id, time));
	// get updated room
	let update = await (User.getUpdate(userId, room.id));
	update.messages = [];
	return update;
});


// add participant implementation
var addParticipants = async (function (user, participants, room) {
	//ToDo: check if type is group and force internal calls
	let userId = user['_id'];
	// split and clean email ids
	let users = participants.split(',')
	.map((email) => email.trim().toLowerCase());
	// validate all email ids
	if(!users.every((email) => Isemail.validate(email))) {
		throw new Error(Dictionary.INVALID_INPUT);
	}
	// check whether user has access to room
	if (!await (Room.checkAccess(userId, room))) {
		throw new Error(Dictionary.ACCESS_DENIED);
	}
	// add non-existing users
	let userIds = await (User.upsertUsers(users));
	// add all participants to room
	await (Room.addParticipants(userIds, room));
	// add room to all participants 
	let time = new Date();
	let requests = userIds.map((userId) => User.addRoom(userId, room, time));
	await (Promise.all(requests));
	// join all sockets to room
	userIds.forEach((userId) => {
		socketList[userId] && socketList[userId].join(room);
	});
	// send update request
	socketList[userId].to(room).emit('update', {room});
	// get updated room
	let update = await (User.getUpdate(userId, room));
	update.messages = [];
	return update;
});

// exit room implementation
var exitRoom = async (function (user, room) {
	let userId = user['_id'];
	// leave participant from room
	socketList[userId].leave(room);
	// remove participant from room
	await (Room.removeParticipant(userId, room));
	// remove room from user db
	await (User.removeRoom(userId, room));
	// send update request
	socketList[userId].to(room).emit('update', {room});
});

// send text implementation
var sendText = async (function (user, text, room) {
	let userId = user['_id'];
	let time = new Date();
	// add message to room
	let count = await (Room.addText(userId, room, text, time));
	// send text to room
	let message = {
		message: {
			from: {
				name: user.name,
				email: user.email,
				lastSean: time
			},
			text,
			time
		},
		room
	};
	socketList[userId].to(room).emit('text', message);
	return message;
});

// update read implementation
var updateRead = async (function (user, read, room) {
	let userId = user['_id'];
	let time = new Date();
	// update read count
	await (User.updateRoom(userId, room, read, time));
	return {read, room};
});
