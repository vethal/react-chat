// app/models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

// remove when async/await supports natively
const async = require('asyncawait/async');
const await = require('asyncawait/await');

const Dictionary = require('../dictionary');
const Room = require('./room');

// define the schema for user model
var Schema = mongoose.Schema;
var userSchema = Schema({
	name: String,
	email: String,
	password: String,
	joined: Boolean,
	lastSean: Date,
	rooms: [{
		room: { type: Schema.Types.ObjectId, ref: 'Room' },
		read: Number, // number of messages read
		time: Date // time user added to the room
	}]
}, {
	collection: 'User'
});
userSchema.index({'email': 1}, {'unique': true});

// generating a hash
userSchema.methods.generateHash = function (password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function (password) {
	return bcrypt.compareSync(password, this.password);
};

// get all rooms
userSchema.statics.getRooms = (userId) => {
	return getRooms(userId);
}

// get updated room
userSchema.statics.getUpdate = (userId, room) => {
	return getUpdate(userId, room);
}
	
// add a participating room
userSchema.statics.addRoom = (userId, room, time) => {
	return addRoom(userId, room, time);
}

// remove participating room
userSchema.statics.removeRoom = (userId, room) => {
	return removeRoom(userId, room);
}

// update index and last sean time
userSchema.statics.updateRoom = (userId, room, index, time) => {
	return updateRoom(userId, room, index, time);
}

// upsert users if don't exist and return an array of ids
userSchema.statics.upsertUsers = (users) => {
	return upsertUsers(users);
}

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);

// get rooms implementation
var getRooms = async (function (userId) {
	let model = mongoose.model('User', userSchema);
	let record = await (model.findOne({ '_id': userId })
		.select('rooms.read rooms.time')
		.populate({
			path: 'rooms.room',
			model: 'Room',
			select: '_id name participants',
			populate: {
				path: 'participants',
				model: 'User',
				select: 'name email lastSean'
			}
		})
		.exec());
	let result = record.toJSON().rooms.map((data) => {
		let room = {};
		Object.assign(room, data, data.room, { id: data.room['_id'] });
		room.participants.forEach((data) => delete data['_id']);
		delete room.room;
		delete room['_id'];
		return room;
	});
	return result;
});

// get rooms implementation
var getUpdate = async (function (userId, room) {
	let model = mongoose.model('User', userSchema);
	let record = await (model.findOne({ '_id': userId },
		{ rooms: { $elemMatch: { room: room }}})
		.select('rooms.read rooms.time rooms.room')
		.populate({
			path: 'rooms.room',
			model: 'Room',
			select: '_id name participants',
			populate: {
				path: 'participants',
				model: 'User',
				select: 'name email lastSean'
			}
		})
		.exec());
	let result = record.toJSON().rooms[0];
	Object.assign(result, result.room, { id: result.room['_id'] });
	result.participants.forEach((data) => delete data['_id']);
	delete result.room;
	delete result['_id'];
	return result;
});

// add room implementation
var addRoom = async (function (userId, roomId, time) {
	let room = await (Room.findById(roomId));
	if (room) {
		let model = mongoose.model('User', userSchema);
		return await (model.update({
			'_id': userId,
			'rooms.room': { $ne: roomId }
		}, { $push: {
			rooms: {
				room: roomId,
				read: room.messages.length,
				time
			}
		}}));
	}
	throw new Error(Dictionary.ROOM_NOT_FOUND);
});

// remove room implementation
var removeRoom = async (function (userId, room) {
	let model = mongoose.model('User', userSchema);
	return await (model.update({ '_id': userId }, { $pull: {
		rooms: { room }
	}}));
});

// update room implementation
var updateRoom = async (function (userId, room, index, time) {
	let model = mongoose.model('User', userSchema);
	return await (model.update({
		'_id': userId,
		'rooms.room': room
	}, {
		$set: {
			lastSean: time,
			'rooms.$.read': index
		}
	}));
});

// upsert user implementation
var upsertUsers = async (function (users) {
	let model = mongoose.model('User', userSchema);
	let requests = users.map((user) => model.update({ email: user }, { $setOnInsert: {
		email: user,
		joined: false,
		lastSean: new Date()
	}}, { upsert: true }));
	await (Promise.all(requests));
	var records = await (model.find({ email: { $in: users }}));
	return records.map((record) => record['_id']);
});
