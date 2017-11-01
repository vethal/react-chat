import React from 'react';
import {connect} from "react-redux"
import relativeDate  from 'relative-date';

import Constants from '../constants';

@connect((store) => ({}),
(dispatch) => {
	return {
		selectRoom: (room) => selectRoom(room, dispatch)
	};
})
export default class Room extends React.Component {
	handleSelect() {
		this.props.selectRoom(this.props.room);
	}

	render() {
		let {room, focus} = this.props;
		let last = "";
		let time = "";
		let unread = null;

		if (room.messages.length) {
			last = room.messages[0].text;
			time = relativeDate(room.messages[0].time);
			let count = room.messages.length - room.read;
			unread = count ? <div class="unread">{count}</div> : null;
		}

		return (
			<div class="room" focus={focus}>
				<img class="avatar" src="images/room.png"/>
				<div onClick={this.handleSelect.bind(this)}>
					<div>
						<div class="name">{room.name}</div>
						<div class="time">{time}</div>
					</div>
					<div>
						<div class="last">{last}</div>
						{unread}
					</div>
				</div>
			</div>
		);
	}
}

function selectRoom(payload, dispatch) {
	const {EVENT} = Constants.SERVER;
	dispatch({
		type: EVENT.SELECT_ROOM,
		payload
	});
}
