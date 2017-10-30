import io from 'socket.io-client';

import Constants from './constants';
import store from './store'

const {EVENT} = Constants.SOCKET;
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

socket.on('text', (data) => {
	store.dispatch({
		type: EVENT.DATA_TEXT,
		payload: data
	});
});

socket.on('event', (event) => {
	store.dispatch({
		type: EVENT.DATA_EVENT,
		payload: event
	});
});

/*
	get all rooms
*/
socket.getRooms = (callback) => {
	socket.emit('get-rooms', callback);
}

/*
	get all messages in a room
	room - Room to get messages from
*/
socket.getMessages = (room, callback) => {
	socket.emit('get-messages', room, callback);
}

/*
	create a room
	room - An email or a room name
*/
socket.createRoom = (name, callback) => {
	socket.emit('create-room', name, callback);
}

/*
	add participants to a room
	participants - Array of participants
	room - A room
*/
socket.addParticipants = (participants, room, callback) => {
	socket.emit('add-participants', { participants, room }, callback);
}

/*
	exit room
	room - A room
*/
socket.exitRoom = (room, callback) => {
	socket.emit('exit-room', room, callback);
}

/*
	send text to participants in a room
	text - Text need to send
	room - Either an email or a room
*/
socket.sendText = (text, room, callback) => {
	socket.emit('send-text', { text, room }, callback);
}

/*
	send events
	text - Event need to send
	room - Either an email or a room
*/
socket.sendEvent = (event, room, callback) => {
	socket.emit('send-event', { event, room }, callback);
}

export default socket;
