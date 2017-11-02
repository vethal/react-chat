import React from 'react';
import {connect} from "react-redux"
import gravatar from 'gravatar';

import Constants from '../constants';
import Room from './room.jsx'

@connect((store) => {
	return {
		user: store.server.user,
		rooms: store.server.rooms,
		current: store.server.current
	};
},
(dispatch) => {
	return {
		createRoom: (roomName) => createRoom(roomName, dispatch)
	};
})
export default class Rooms extends React.Component {
	roomNameRef(element) {
		this.roomName = element;
	}

	handelKeyUp(event) {
		if (event.keyCode === 13) {
			this.handleAddRoom();
		}
	}

	handleAddRoom() {
		this.props.createRoom(this.roomName.value);
		this.roomName.value = "";
	}

	render() {
		let {name, email} = this.props.user;
		let {rooms} = this.props;
		let {current} = this.props;
		let image = gravatar.url(email);
		let children = [];

		if (rooms) {
			children = rooms.map((room, index) => {
				return <Room key={index} room={room} focus={String(room === current)}/>
			});
		}

		return (
			<div class="rooms">
				<div class="user">
					<img class="avatar" src={image}/>
					<div>
						<div class="name">{name}</div>
						<div class="email">{email}</div>
					</div>
					<a href="/logout">
						<i class="fa fa-sign-out" title="Sign Out" aria-hidden="true"></i>
					</a>
				</div>
				<div class="createRoom">
					<input ref={this.roomNameRef.bind(this)} onKeyUp={this.handelKeyUp.bind(this)} class="roomName" placeholder="Room name"/>
					<input onClick={this.handleAddRoom.bind(this)} class="create fa fa-plus" value="&#xf067;" type="button" aria-hidden="true"/>
				</div>
				<div class="roomList">
					{children}
				</div>
			</div>
		);
	}
}

function createRoom(payload, dispatch) {
	const {EVENT} = Constants.SERVER;
	dispatch({
		type: EVENT.CREATE_ROOM,
		payload
	});
}
