import React from 'react';
import {connect} from "react-redux"

import Constants from '../constants';
import Rooms from './rooms.jsx'
import Messages from './messages.jsx'
import Participants from './participants.jsx'

@connect((store) => {
	return {
		server: store.server
	};
})
export default class Layout extends React.Component {
	render() {
		const {STATE} = Constants.SERVER;
		let {state} = this.props.server;

		if (state !== STATE.CONNECTED) {
			// load authenticattion layout
			return (
				<div class="layout">
				</div>
			);
		} else {
			// load chat layout
			return (
				<div class="layout">
					<Rooms />
					<Messages />
					<Participants />
				</div>
			);
		}
	}
}
