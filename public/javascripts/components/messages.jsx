import React from 'react';
import {connect} from "react-redux"

import Constants from '../constants';
import Message from './message.jsx'

@connect((store) => {
	return {
		user: store.server.user,
		current: store.server.current
	};
},
(dispatch) => {
	return {
		sendText: (text, room) =>
			sendText({text, room}, dispatch)
	};
})
export default class Messages extends React.Component {
	componentDidMount() {
		if (this.messageList) {
			this.messageList.scrollTop = this.messageList.scrollHeight;
		}
	}

	componentDidUpdate() {
		if (this.messageList) {
			this.messageList.scrollTop = this.messageList.scrollHeight;
		}
	}

	messageListRef(element) {
		this.messageList = element;
	}

	composeRef(element) {
		this.message = element;
	}

	handleAddMessages() {
		var {current} = this.props;
		this.props.sendText(this.message.value, current.id);
		this.message.value = "";
	}

	render() {
		var {email} = this.props.user;
		var {current} = this.props;
		let background = null;
		let children = [];

		if (current) {
			children = current.messages.map((message, index) => {
				return <Message key={index} message={message} own={String(message.from.email === email)}/>
			}).reverse();
			var body = (<div class="messages">
				<div ref={this.messageListRef.bind(this)} class="messageList">
					{children}
				</div>
				<div class="compose">
					<div>
						<textarea ref={this.composeRef.bind(this)} class="input"></textarea>
						<input onClick={this.handleAddMessages.bind(this)} class="send fa fa-paper-plane" value="&#xf1d8;" type="button" aria-hidden="true"/>
					</div>
				</div>
			</div>);
		} else {
			var body = (<div class="messages">
				<div class="background">React Chat</div>;
			</div>);
		}

		return body;
	}
}

function sendText(payload, dispatch) {
	const {EVENT} = Constants.SERVER;
	dispatch({
		type: EVENT.SEND_MESSAGE,
		payload
	});
}
