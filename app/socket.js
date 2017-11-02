import io from 'socket.io-client';

import Constants from './constants';
import store from './store'

const {EVENT} = Constants.SERVER;
var socket = io(Constants.HOST);

socket.on('connect', (socket) => {
	store.dispatch({
		type: EVENT.CONNECTION_SUCCESS
	});
});

socket.on('connect_error', (error) => {
	store.dispatch({
		type: EVENT.CONNECTION_FAILURE,
		payload: error
	});
});

socket.on('connect_timeout', (timeout) => {
	store.dispatch({
		type: EVENT.CONNECTION_FAILURE,
		payload: timeout
	});
});

socket.on('error', (error) => {
	store.dispatch({
		type: EVENT.AUTHENTICATION_FAILURE,
		payload: error
	});
});

socket.on('disconnect', (reason) => {
	store.dispatch({
		type: EVENT.CONNECTION_LOST,
		payload: reason
	});
});

socket.on('reconnecting', (attempt) => {
	store.dispatch({
		type: EVENT.CONNECTION_PENDING,
		payload: attempt
	});
});

socket.on('init', (data) => {
	store.dispatch({
		type: EVENT.DATA_INIT,
		payload: data
	});
});

socket.on('text', (data) => {
	data.message.time = new Date(data.message.time);
	data.message.from.lastSean = new Date(data.message.from.lastSean);
	store.dispatch({
		type: EVENT.DATA_TEXT,
		payload: data
	});
});

socket.on('update', (data) => {
	store.dispatch({
		type: EVENT.ROOM_UPDATE_REQUEST,
		payload: data
	});
});

/*
	get all rooms
*/
socket.getRooms = (callback) => {
	socket.emit('get-rooms', (rooms) => {
		// ToDo: error check
		rooms.forEach((room) => {
			room.time = new Date(room.time);
			room.participants.forEach((participant) => {
				participant.lastSean = new Date(participant.lastSean);
			});
			room.participants.sort((left, right) => (!left.name || right.name < left.name));
		});
		rooms.sort((left, right) => {
			return right.time.getTime() - left.time.getTime();
		});
		callback(null, rooms);
	});
}

/*
	get all messages in a room
	room - Room to get messages from
*/
socket.getMessages = (room, callback) => {
	socket.emit('get-messages', room, (messages) => {
		// ToDo: error check
		messages.forEach((message) => {
			message.time = new Date(message.time);
			message.from.lastSean = new Date(message.from.lastSean);
		});
		messages.sort((left, right) => {
			return right.time.getTime() - left.time.getTime();
		});
		callback(null, messages);
	});
}

/*
	get updated room
*/
socket.getUpdate = (room, callback) => {
	socket.emit('get-update', room, (update) => {
		// ToDo: error check
		update.time = new Date(update.time);
		update.participants.forEach((participant) => {
			participant.lastSean = new Date(participant.lastSean);
		});
		update.participants.sort((left, right) => (!left.name || right.name < left.name));
		callback(null, update);
	});
}

/*
	create a room
	room - An email or a room name
*/
socket.createRoom = (name, callback) => {
	socket.emit('create-room', name, (room) => {
		// ToDo: error check
		room.time = new Date(room.time);
		room.participants.forEach((participant) => {
			participant.lastSean = new Date(participant.lastSean);
		});
		room.participants.sort((left, right) => (!left.name || right.name < left.name));
		callback(null, room);
	});
}

/*
	add participants to a room
	participants - Array of participants
	room - A room
*/
socket.addParticipants = (participants, room, callback) => {
	socket.emit('add-participants', participants, room, (room) => {
		// ToDo: error check
		room.time = new Date(room.time);
		room.participants.forEach((participant) => {
			participant.lastSean = new Date(participant.lastSean);
		});
		room.participants.sort((left, right) => (!left.name || right.name < left.name));
		callback(null, room);
	});
}

/*
	exit room
	room - A room
*/
socket.exitRoom = (room, callback) => {
	socket.emit('exit-room', room, (room) => {
		callback(null, room);
	});
}

/*
	send text to participants in a room
	text - Text need to send
	room - Either an email or a room
*/
socket.sendText = (text, room, callback) => {
	socket.emit('send-text', text, room, (message) => {
		message.message.time = new Date(message.message.time);
		message.message.from.lastSean = new Date(message.message.from.lastSean);
		callback(null, message);
	});
}

/*
	update read message count
	read - number of messages read
	room - A room
*/
socket.updateRead = (read, room, callback) => {
	socket.emit('update-read', read, room, (result) => {
		callback(null, result);
	});
}

export default socket;
