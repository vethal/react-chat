// chat.js
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

	return {
		onGetRooms: (callback) => {
			User.getRooms(userId)
			.then(callback)
			.catch(() => callback(Dictionary.FETCHING_ROOMS_FAILURE));
		},
		onGetMessages: (room, callback) => {
			getMessages(user, room)
			.then(callback)
			.catch(() => callback(Dictionary.FETCHING_MESSAGES_FAILURE));
		},
		onGetUpdate: (room, callback) => {
			User.getUpdate(userId, room)
			.then(callback)
			.catch(() => callback(Dictionary.FETCHING_UPDATE_FAILURE));
		},
		onCreateRoom: (name, callback) => {
			Room.createRoom(name, userId)
			.then(() => callback())
			.catch(() => callback(Dictionary.ROOM_CREATE_FAILURE));
		},
		onAddParticipants: (data, callback) => {
			addParticipants(user, data)
			.then(() => callback())
			.catch(() => callback(Dictionary.ADD_PARTICIPANTS_FAILURE));
		},
		onExitRoom: (room, callback) => {
			exitRoom(user, room)
			.then(() => callback())
			.catch(() => callback(Dictionary.EXIT_ROOM_FAILURE));
		},
		onText: (data, callback) => {
			sendText(user, data)
			.then(() => callback())
			.catch(() => callback(Dictionary.SEND_TEXT_FAILURE));
		},
		onEvent: (data, callback) => {
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

// add participant implementation
var addParticipants = async (function (user, data) {
	const Isemail = require('isemail');
	let userId = user['_id'];
	// split and clean email ids
	let users = data.participants.split(',')
	.map((email) => email.trim().toLowerCase());
	// validate all email ids
	if(!users.every((email) => Isemail.validate(email))) {
		throw new Error(Dictionary.INVALID_INPUT);
	}
	// check whether user has access to room
	if (!await (Room.checkAccess(userId, data.room))) {
		throw new Error(Dictionary.ACCESS_DENIED);
	}
	// add non-existing users
	let userIds = await (User.upsertUsers(users));
	// add all participants to room
	await (Room.addParticipants(userIds, data.room));
	// add room to all participants 
	let time = new Date();
	let requests = userIds.map((userId) => User.addRoom(userId, data.room, time));
	await (Promise.all(requests));
	// join all sockets to room
	userIds.forEach((userId) => {
		socketList[userId] && socketList[userId].join(data.room);
	});
	// send update request
	socketList[userId].to(data.room).emit('update', {
		room: data.room
	});
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
	socketList[userId].to(room).emit('update', { room });
});

// send text implementation
var sendText = async (function (user, data) {
	let userId = user['_id'];
	let {room, text} = data;
	let time = new Date();
	// remove participant from room
	let count = await (Room.addText(userId, room, text, time));
	// remove room from user db
	await (User.updateRoom(userId, room, count, time));
	// send text to room
	let message = {
		from: {
			name: user.name,
			email: user.email,
			lastSean: time
		}, text, time
	};
	socketList[userId].to(data.room).emit('text', { message, room });
	return message;
});
