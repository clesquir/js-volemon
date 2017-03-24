import {Meteor} from 'meteor/meteor';
import {EloScores} from '/collections/eloscores.js';
import {Games} from '/collections/games.js';
import {Players} from '/collections/players.js';
import {Profiles} from '/collections/profiles.js';
import {Constants} from '/imports/lib/constants.js';

Meteor.publish('userData', function() {
	return Meteor.users.find({_id: this.userId});
});

Meteor.publish('profileData', function() {
	return Profiles.find({userId: this.userId});
});

Meteor.publish('recentProfileGames', function(limit) {
	const players = Players.find({userId: this.userId});
	let gamesIds = [];

	//Fetch Games related to that players and Players related to those games and NEQ to this user
	players.forEach((player) => {
		gamesIds.push(player.gameId);
	});

	//Fetch game ids for these limited games
	const games = Games.find(
		{
			_id: {$in: gamesIds},
			status: Constants.GAME_STATUS_FINISHED
		},
		{
			sort: [['startedAt', 'desc']],
			limit: limit,
			fields: {startedAt: 1, createdBy: 1, hostPoints: 1, clientPoints: 1}
		}
	);

	gamesIds = [];
	games.forEach((game) => {
		gamesIds.push(game._id);
	});

	return [
		games,
		Players.find({userId: {$ne:this.userId}, gameId: {$in: gamesIds}}, {fields: {gameId: 1, name: 1}})
	];
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
		Profiles.find()
	];
});
