import promisify from 'es6-promisify';
import Constants from '../constants';
import store from '../store';
import socket from '../socket';

const {STATE, EVENT} = Constants.SERVER;

export default function reducer(stateContext = {
	state: STATE.CONNECTING
}, action) {
	var context = {...stateContext};
	switch (context.state) {
		case STATE.UNCONNECTED:
			handleUnconnected(context, action);
			break;
		case STATE.CONNECTING:
			handleConnecting(context, action);
			break;
		case STATE.CONNECTED:
			handleConnected(context, action);
			break;
		case STATE.UNAUTHENTICATED:
			handleUnauthenticated(context, action);
			break;
		case STATE.CONNECTION_ERROR:
			handleConnectionError(context, action);
			break;
		case STATE.DISCONNECTED:
			handleDisconnected(context, action);
			break;
	}
	return context;
}

function handleUnconnected (context, action) {
	switch (action.type) {
		case EVENT.CONNECTION_REQUEST:
			socket.connect();
			context.state = STATE.CONNECTING;
			break;
		case EVENT.CONNECTION_PENDING:
			context.state = STATE.CONNECTING;
			break;
	}
}

function handleConnecting (context, action) {
	switch (action.type) {
		case EVENT.CONNECTION_SUCCESS:
			initializeRooms();
			context.state = STATE.CONNECTED;
			break;
		case EVENT.CONNECTION_FAILURE:
			context.state = STATE.CONNECTION_ERROR;
			break;
		case EVENT.AUTHENTICATION_FAILURE:
			context.state = STATE.UNAUTHENTICATED;
			break;
	}
}

function handleConnected (context, action) {
	switch (action.type) {
		case EVENT.ROOMS_INITIALIZED:
			context.rooms = action.payload;
			break;
		case EVENT.DATA_TEXT:
			addText(context, action);
			break;
		case EVENT.ROOM_UPDATE_REQUEST:
			roomUpdateRequest(action.payload.room);
			break;
		case EVENT.ROOM_UPDATED:
			updateRoom(context, action);
			break;
		case EVENT.CONNECTION_LOST:
			context.state = STATE.DISCONNECTED;
			break;
	}
}

function handleUnauthenticated (context, action) {
	switch (action.type) {
		case EVENT.CONNECTION_REQUEST:
			socket.connect();
			context.state = STATE.CONNECTING;
			break;
		case EVENT.CONNECTION_PENDING:
			context.state = STATE.CONNECTING;
			break;
	}
}

function handleConnectionError (context, action) {
	switch (action.type) {
		case EVENT.CONNECTION_REQUEST:
			socket.connect();
			context.state = STATE.CONNECTING;
			break;
		case EVENT.CONNECTION_PENDING:
			context.state = STATE.CONNECTING;
			break;
	}
}

function handleDisconnected (context, action) {
	switch (action.type) {
		case EVENT.CONNECTION_REQUEST:
			socket.connect();
			context.state = STATE.CONNECTING;
			break;
		case EVENT.CONNECTION_PENDING:
			context.state = STATE.CONNECTING;
			break;
	}
}

async function initializeRooms() {
	let rooms = await promisify(socket.getRooms)();
	await Promise.all(rooms.map(async (room) => {
		room.messages = await promisify(socket.getMessages)(room.id);
	}));
	sortRooms(rooms);
	store.dispatch({
		type: EVENT.ROOMS_INITIALIZED,
		payload: rooms
	});
}

async function roomUpdateRequest(room) {
	let update = await promisify(socket.updateRoom)(room);
	update.messages = await promisify(socket.getMessages)(room);
	store.dispatch({
		type: EVENT.ROOM_UPDATED,
		payload: {update}
	});
}

function updateRoom(context, payload) {
	let roomIndex = context.rooms.findIndex((room) => {
		return action.payload.id === room.id;
	});
	if (roomIndex == -1) {
		context.rooms.unshift(action.payload);
	} else {
		context.rooms[roomIndex] = action.payload;
	}
	sortRooms(context.rooms);
}

function sortRooms(rooms) {
	rooms.sort((left, right) => {
		let leftTime = left.messages.length ?
			Math.max(left.time.getTime(), left.messages[0].time.getTime()) :
			left.time.getTime();
		let rightTime = right.messages.length ?
			Math.max(right.time.getTime(), right.messages[0].time.getTime()) :
			right.time.getTime();
		return rightTime - leftTime;
	});
}

function addText(context, action) {
	let room = context.rooms.find((room) => {
		return action.payload.room === room.id;
	});
	room.messages.unshift(action.payload.message);
	room.messages.sort((left, right) => {
		return right.time.getTime() - left.time.getTime();
	});
	sortRooms(context.rooms);
}
