// app/models/room.js
const mongoose = require('mongoose');

// remove when async/await supports natively
const async = require('asyncawait/async');
const await = require('asyncawait/await');

// define the schema for room model
var Schema = mongoose.Schema;
var roomSchema = Schema({
	name: String,
	messages: [{
		from: Schema.Types.ObjectId,
		text: String,
		time: Date,
		status: Number // deleted, spam, etc
	}],
	participants: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, {
	collection: 'Room'
});

// get all messages
roomSchema.statics.getMessages = (room) => {
	return getMessages(room);
}

// create a room
roomSchema.statics.createRoom = (name, user) => {
	return createRoom(name, user);
}

// add a participating room
roomSchema.statics.addText = (from, room, text, time) => {
	return addText(from, room, text, time);
}

// check access whether participant has access in room
roomSchema.statics.checkAccess = (user, room) => {
	return checkAccess(user, room);
}

// add a participant
roomSchema.statics.addParticipants = (users, room) => {
	return addParticipants(users, room);
}

// remove a participant
roomSchema.statics.removeParticipant = (user, room) => {
	return removeParticipant(user, room);
}

module.exports = mongoose.model('Room', roomSchema);

// get all messages implementation
var getMessages = async (function (room) {
	let model = mongoose.model('Room', roomSchema);
	let record = await (model.findById(room)
		.select('messages.text messages.time messages.status')
		.populate({
			path: 'messages.from',
			model: 'User',
			select: 'name email lastSean'
		})
		.exec());
	let result = record.toJSON().messages;
	result.forEach((data) => {
		delete data.from['_id'];
	});
	return result;
});

// create room implementation
var createRoom = async (function (name, user) {
	let model = mongoose.model('Room', roomSchema);
	let room = await (model.create({
		name,
		participants: [user]
	}));
	let result = room.toJSON();
	result.id = result['_id'];
	delete result['_id'];
	return result;
});

// add text implementation
var addText = async (function (from, room, text, time) {
	let model = mongoose.model('Room', roomSchema);
	await (model.update({ _id: room }, { $push: {
		messages: { from, text, time }
	}}));
	let record = await (model.findById(room));
	return record.messages.length;
});

// check access implementation
var checkAccess = async (function (user, room) {
	let model = mongoose.model('Room', roomSchema);
	return await (model.findOne({
		_id: room,
		participants: user
	}));
});

// add participant implementation
var addParticipants = async (function (users, room) {
	let model = mongoose.model('Room', roomSchema);
	return await (model.update({ _id: room }, { $addToSet: {
		participants: { $each: users }
	}}));
});

// remove participant implementation
var removeParticipant = async (function (user, room) {
	let model = mongoose.model('Room', roomSchema);
	return await (model.update({ _id: room }, { $pull: {
		participants: user
	}}));
});
