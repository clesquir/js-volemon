import {EloScores} from '/imports/api/games/eloscores.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {GAME_STATUS_STARTED} from '/imports/api/games/statusConstants.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {Meteor} from 'meteor/meteor';

Meteor.publish('games', function() {
	return [
		Games.find(
			{
				isPrivate: 0,
				status: GAME_STATUS_STARTED
			},
			{
				sort: [['createdAt', 'asc']],
				fields: {tournamentId: 1, gameMode: 1, players: 1, createdAt: 1, status: 1}
			}
		),
		Tournaments.find()
	];
});

Meteor.publish('game', function(id) {
	return [
		Games.find({_id: id}),
		Players.find({gameId: id}),
		EloScores.find({gameId: id})
	];
});
