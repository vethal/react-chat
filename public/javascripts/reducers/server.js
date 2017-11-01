import promisify from 'es6-promisify';
import update from 'react-addons-update';
import Constants from '../constants';
import store from '../store';
import socket from '../socket';

const {STATE, EVENT} = Constants.SERVER;

export default function reducer(stateContext = {
	state: STATE.CONNECTING,
	user: {},
	users: [],
	current: null
}, action) {
	var context = stateContext;
	switch (context.state) {
		case STATE.UNCONNECTED:
			context = handleUnconnected(context, action);
			break;
		case STATE.CONNECTING:
			context = handleConnecting(context, action);
			break;
		case STATE.CONNECTED:
			context = handleConnected(context, action);
			break;
		case STATE.UNAUTHENTICATED:
			context = handleUnauthenticated(context, action);
			break;
		case STATE.CONNECTION_ERROR:
			context = handleConnectionError(context, action);
			break;
		case STATE.DISCONNECTED:
			context = handleDisconnected(context, action);
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
	return context;
}

function handleConnecting (context, action) {
	switch (action.type) {
		case EVENT.CONNECTION_SUCCESS:
			initializeRooms(context, action);
			context.state = STATE.CONNECTED;
			break;
		case EVENT.CONNECTION_FAILURE:
			context.state = STATE.CONNECTION_ERROR;
			break;
		case EVENT.AUTHENTICATION_FAILURE:
			context.state = STATE.UNAUTHENTICATED;
			break;
	}
	return context;
}

function handleConnected (context, action) {
	switch (action.type) {
		case EVENT.DATA_INIT:
			context = initData(context, action);
			break;
		case EVENT.ROOMS_INITIALIZED:
			context = update(context, {rooms: {$set: action.payload}});
			break;
		case EVENT.ROOM_UPDATE_REQUEST:
			roomUpdateRequest(context, action);
			break;
		case EVENT.ROOM_UPDATED:
			context = updateRoom(context, action);
			break;
		case EVENT.CONNECTION_LOST:
			context.state = STATE.DISCONNECTED;
			break;
		case EVENT.CREATE_ROOM:
			createRoomRequest(context, action);
			break;
		case EVENT.ROOM_CREATED:
			context = createRoom(context, action);
			break;
		case EVENT.SELECT_ROOM:
			context = update(context, {current: {$set: action.payload}});
			updateReadRequest(context);
			break;
		case EVENT.ROOM_SELECTED:
			context = updateRead(context, action);
			break;
		case EVENT.ADD_PARTICIPANTS:
			addParticipantsRequest(context, action);
			break;
		case EVENT.PARTICIPANTS_ADDED:
			context = addParticipants(context, action);
			break;
		case EVENT.SEND_MESSAGE:
			sendTextRequest(context, action);
			break;
		case EVENT.MESSAGE_SENT:
			context = textSent(context, action);
			break;
		case EVENT.DATA_TEXT:
			context = addText(context, action);
			break;
		case EVENT.EXIT_ROOM:
			exitRoomRequest(context, action);
			break;
		case EVENT.ROOM_EXITED:
			context = exitRoom(context, action);
			break;
	}
	return context;
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
	return context;
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
	return context;
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
	return context;
}

function initData(context, action) {
	let {name, email} = action.payload;
	context = update(context, {user: {
		name: {$set: name},
		email: {$set: email}
	}});
	return context;
}

async function initializeRooms(context, action) {
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

async function roomUpdateRequest(context, action) {
	let {room} = action.payload;
	let updatedRoom = await promisify(socket.getUpdate)(room);
	updatedRoom.messages = await promisify(socket.getMessages)(room);
	store.dispatch({
		type: EVENT.ROOM_UPDATED,
		payload: updatedRoom
	});
}

function updateRoom(context, action) {
	let index = context.rooms.findIndex((room) => {
		return action.payload.id === room.id;
	});
	if (index == -1) {
		context = update(context, {rooms: {$unshift: [action.payload]}});
	} else {
		let rooms = {[index]: {$set: action.payload}};
		let current = {$set: action.payload};
		let change = (context.current === context.rooms[index]) ? {rooms, current} : {rooms}
		context = update(context, change);
	}
	sortRooms(context.rooms);
	return context;
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

async function createRoomRequest(context, action) {
	let room = await promisify(socket.createRoom)(action.payload);
	store.dispatch({
		type: EVENT.ROOM_CREATED,
		payload: room
	});
}

function createRoom(context, action) {
	context = update(context, {rooms: {$unshift: [action.payload]}});
	sortRooms(context.rooms);
	return context;
}

async function updateReadRequest(context) {
	let read = context.current.messages.length;
	let room = context.current.id;
	let result = await promisify(socket.updateRead)(read, room);
	store.dispatch({
		type: EVENT.ROOM_SELECTED,
		payload: result
	});
}

function updateRead(context, action) {
	let index = context.rooms.findIndex((room) => {
		return action.payload.room === room.id;
	});
	context = update(context, {
		rooms: {[index]: {read: {$set: action.payload.read}}}
	});
	context = update(context, {current: {$set: context.rooms[index]}});
	return context;
}

async function addParticipantsRequest(context, action) {
	let {participants, room} = action.payload;
	let updatedRoom = await promisify(socket.addParticipants)(participants, room);
	store.dispatch({
		type: EVENT.PARTICIPANTS_ADDED,
		payload: updatedRoom
	});
}

function addParticipants(context, action) {
	let index = context.rooms.findIndex((room) => {
		return action.payload.id === room.id;
	});
	context = update(context, {
		rooms: {[index]: {participants: {$set: action.payload.participants}}}
	});
	context = update(context, {current: {$set: context.rooms[index]}});
	return context;
}

async function sendTextRequest(context, action) {
	let {text, room} = action.payload;
	let message = await promisify(socket.sendText)(text, room);
	store.dispatch({
		type: EVENT.MESSAGE_SENT,
		payload: message
	});
}

function textSent(context, action) {
	let index = context.rooms.findIndex((room) => {
		return action.payload.room === room.id;
	});
	context = update(context, {
		rooms: {[index]: {messages: {$push: [action.payload.message]}}}
	});
	context.rooms[index].messages.sort((left, right) => {
		return right.time.getTime() - left.time.getTime();
	});
	context = update(context, {current: {$set: context.rooms[index]}});
	sortRooms(context.rooms);
	updateReadRequest(context);
	return context;
}

function addText(context, action) {
	let index = context.rooms.findIndex((room) => {
		return action.payload.room === room.id;
	});
	let focus = (context.current === context.rooms[index]);
	context = update(context, {
		rooms: {[index]: {messages: {$push: [action.payload.message]}}}
	});
	context.rooms[index].messages.sort((left, right) => {
		return right.time.getTime() - left.time.getTime();
	});
	if (focus) {
		context = update(context, {current: {$set: context.rooms[index]}});
		updateReadRequest(context);
	}
	sortRooms(context.rooms);
	return context;
}

async function exitRoomRequest(context, action) {
	let room = await promisify(socket.exitRoom)(action.payload);
	store.dispatch({
		type: EVENT.ROOM_EXITED,
		payload: room
	});
}

function exitRoom(context, action) {
	let index = context.rooms.findIndex((room) => {
		return action.payload === room.id;
	});
	context = update(context, {
		rooms: {$splice: [[index, 1]]},
		current: {$set: null}
	});
	return context;
}
