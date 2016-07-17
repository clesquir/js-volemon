import { EloScores } from '/collections/eloscores.js';
import { Games } from '/collections/games.js';
import { Players } from '/collections/players.js';
import { Profiles } from '/collections/profiles.js';
import { Constants } from '/lib/constants.js';

Meteor.publish('userData', function() {
	return Meteor.users.find({_id: this.userId});
});

Meteor.publish('profileData', function() {
	return Profiles.find({userId: this.userId});
});

Meteor.publish('recentProfileGames', function(limit) {
	var players = Players.find({userId: this.userId}),
		gamesIds = [];

	//Fetch Games related to that players and Players related to those games and NEQ to this user
	players.forEach((player) => {
		gamesIds.push(player.gameId);
	});

	return [
		Games.find({_id: {$in: gamesIds}, status: Constants.GAME_STATUS_FINISHED}, {sort: [['startedAt', 'desc']], limit: limit}),
		Players.find({userId: {$ne:this.userId}, gameId: {$in: gamesIds}})
	];
});

Meteor.publish('ranks', function() {
	return [
		Meteor.users.find(),
		Profiles.find(),
		EloScores.find()
	];
});

Meteor.publish('games', function() {
	return [
		Games.find({isPrivate: 0, status: {$in: [Constants.GAME_STATUS_REGISTRATION, Constants.GAME_STATUS_STARTED]}}),
		Meteor.users.find({}, {fields: {'profile.name': 1}})
	];
});

Meteor.publish('game', function(id) {
	return [
		Games.find({_id: id}),
		Players.find({gameId: id}),
		Profiles.find()
	];
});
