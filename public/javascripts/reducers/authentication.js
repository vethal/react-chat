import Constants from '../constants';

const {STATE, EVENT} = Constants.AUTH;

export default function reducer(stateContext = {
	state: STATE.UNAUTHENTICATED,
	error: ''
}, action) {
	var context = {...stateContext};
	switch (context.state) {
		case STATE.UNAUTHENTICATED:
			handleUnauthenticated(context, action);
			break;
		case STATE.AUTHENTICATING:
			handleAuthenticating(context, action);
			break;
		case STATE.AUTHENTICATED:
			handleAuthenticated(context, action);
			break;
		case STATE.AUTHENTICATION_ERROR:
			handleAuthenticationError(context, action);
			break;
		case STATE.SIGNUP:
			handleSignup(context, action);
			break;
		case STATE.SIGNINGUP:
			handleSigningup(context, action);
			break;
		case STATE.SIGNUP_ERROR:
			handleSignupError(context, action);
			break;
	}
	return context;
}

function handleUnauthenticated (context, action) {
	switch (action.type) {
		case EVENT.AUTHENTICATION_REQUEST:
			context.state = STATE.AUTHENTICATING;
			break;
		case EVENT.AUTHENTICATION_SUCCESS:
			context.state = STATE.AUTHENTICATED;
			break;
		case EVENT.AUTHENTICATION_FAILURE:
			context.state = STATE.AUTHENTICATION_ERROR;
			break;
		case EVENT.SIGNUP_CLICK:
			context.state = STATE.SIGNUP;
			break;
	}
}

function handleAuthenticating (context, action) {
	switch (action.type) {
		case EVENT.AUTHENTICATION_SUCCESS:
			context.state = STATE.AUTHENTICATED;
			break;
		case EVENT.AUTHENTICATION_FAILURE:
			context.state = STATE.AUTHENTICATION_ERROR;
			break;
	}
}

function handleAuthenticated (context, action) {
	switch (action.type) {
		case EVENT.AUTHENTICATION_LOGOUT:
			context.state = STATE.UNAUTHENTICATED;
			break;
	}
}

function handleAuthenticationError (context, action) {
	switch (action.type) {
		case EVENT.AUTHENTICATION_REQUEST:
			context.state = STATE.AUTHENTICATING;
			break;
		case EVENT.SIGNUP_CLICK:
			context.state = STATE.SIGNUP;
			break;
	}
}

function handleSignup (context, action) {
	switch (action.type) {
		case EVENT.SIGNUP_CANCEL:
			context.state = STATE.UNAUTHENTICATED;
			break;
		case EVENT.SIGNUP_REQUEST:
			context.state = STATE.SIGNINGUP;
			break;
	}
}

function handleSigningup (context, action) {
	switch (action.type) {
		case EVENT.SIGNUP_SUCCESS:
			context.state = STATE.AUTHENTICATED;
			break;
		case EVENT.SIGNUP_FAILURE:
			context.state = STATE.SIGNUP_ERROR;
			break;
	}
}

function handleSignupError (context, action) {
	switch (action.type) {
		case EVENT.SIGNUP_CANCEL:
			context.state = STATE.UNAUTHENTICATED;
			break;
		case EVENT.SIGNUP_REQUEST:
			context.state = STATE.SIGNINGUP;
			break;
	}
}
