import {Meteor} from 'meteor/meteor';
import {EloScores} from '/imports/api/games/eloscores.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {Constants} from '/imports/lib/constants.js';

Meteor.publish('userData', function() {
	return Meteor.users.find({_id: this.userId});
});

Meteor.publish('ranks', function() {
	return [
		Meteor.users.find({}, {fields: {'profile.name': 1}}),
		Profiles.find()
	];
});

Meteor.publish('ranks-chart', function(minDate) {
	return [
		EloScores.find({timestamp: {$gt: minDate}})
	];
});

Meteor.publish('games', function() {
	return [
		Games.find(
			{
				isPrivate: 0,
				status: {$in: [Constants.GAME_STATUS_REGISTRATION, Constants.GAME_STATUS_STARTED]}
			},
			{
				sort: [['createdAt', 'asc']],
				fields: {status: 1, creatorName: 1}
			}
		)
	];
});

Meteor.publish('game', function(id) {
	return [
		Games.find({_id: id}),
		Players.find({gameId: id}),
		Profiles.find(),
		EloScores.find({gameId: id})
	];
});
