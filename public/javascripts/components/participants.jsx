import React from 'react';
import {connect} from "react-redux"

import Constants from '../constants';
import Participant from './participant.jsx'

@connect((store) => {
	return {
		current: store.server.current
	};
},
(dispatch) => {
	return {
		addParticipants: (participants, room) =>
			addParticipants({participants, room}, dispatch),
		exitRoom: (room) => exitRoom(room, dispatch)
	};
})
export default class Participants extends React.Component {
	participantsRef(element) {
		this.participants = element;
	}

	handelKeyUp(event) {
		if (event.keyCode === 13) {
			this.handleAddParticipants();
		}
	}

	handleAddParticipants() {
		var {current} = this.props;
		this.props.addParticipants(this.participants.value, current.id);
		this.participants.value = "";
	}

	handleExitRoom() {
		var {current} = this.props;
		this.props.exitRoom(current.id);
	}

	render() {
		var {current} = this.props;
		let children = [];

		if (current) {
			children = current.participants.map((participant, index) => {
				return <Participant key={index} participant={participant}/>
			});
		}

		if (current) {
			return (
				<div class="participants">
					<div class="addParticipants">
						<input ref={this.participantsRef.bind(this)} onKeyUp={this.handelKeyUp.bind(this)} class="list" placeholder="Comma separated emails"/>
						<input onClick={this.handleAddParticipants.bind(this)} class="add fa fa-plus" value="&#xf067;" type="button" aria-hidden="true"/>
					</div>
					<div class="participantList">
						{children}
						<div class="space"></div>
						<div class="exitRoom">
							<span>Exit this room</span>
							<input onClick={this.handleExitRoom.bind(this)} class="exit fa fa-times-circle" value="&#xf057;" type="button" aria-hidden="true"/>
						</div>
					</div>
				</div>
			);
		} else {
			return (<div class="participants"></div>);
		}
	}
}

function addParticipants(payload, dispatch) {
	const {EVENT} = Constants.SERVER;
	dispatch({
		type: EVENT.ADD_PARTICIPANTS,
		payload
	});
}

function exitRoom(payload, dispatch) {
	const {EVENT} = Constants.SERVER;
	dispatch({
		type: EVENT.EXIT_ROOM,
		payload
	});
}
