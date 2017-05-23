import {Meteor} from 'meteor/meteor';
import {EloScores} from '/imports/api/games/eloscores.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {GAME_STATUS_REGISTRATION, GAME_STATUS_STARTED} from '/imports/api/games/statusConstants.js';

Meteor.publish('games', function() {
	return [
		Games.find(
			{
				isPrivate: 0,
				status: {$in: [GAME_STATUS_REGISTRATION, GAME_STATUS_STARTED]}
			},
			{
				sort: [['createdAt', 'asc']],
				fields: {hostName: 1, clientName: 1, createdAt: 1, status: 1}
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
