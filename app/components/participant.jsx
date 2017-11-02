import React from 'react';
import gravatar from 'gravatar';
import relativeDate  from 'relative-date';

export default class Participant extends React.Component {
	render() {
		let {participant} = this.props;
		let {name, email} = participant;
		let image = gravatar.url(email);
		let lastSean = relativeDate(participant.lastSean);

		return (
			<div class="participant">
				<img class="avatar" src={image} />
				<div>
					<div class="name">{name}</div>
					<div class="email">{email}</div>
				</div>
			</div>
		);
	}
}
