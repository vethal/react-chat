import { combineReducers, applyMiddleware, createStore } from 'redux';
import logger from 'redux-logger';
import promise from 'redux-promise-middleware';

import server from './reducers/server';

let reducers = combineReducers({
	server
});
let middleware = applyMiddleware(promise(), logger);

export default createStore(reducers, middleware);
