import Constants from '../constants';
import socket from '../socket';

const {STATE, EVENT} = Constants.SOCKET;

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
