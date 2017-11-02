import React from 'react';
import relativeDate  from 'relative-date';

export default class Message extends React.Component {
	render() {
		let {message, own} = this.props;
		let {from, text} = message;
		let time = relativeDate(message.time);

		return (
			<div class="message" own={own}>
				<div>
					<div class="name">{from.name}</div>
					<div class="email">{from.email}</div>
					<div class="space"></div>
					<div class="time">{time}</div>
				</div>
				<div class="text">{text}</div>
			</div>
		);
	}
}
