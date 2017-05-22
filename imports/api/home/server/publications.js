import {Meteor} from 'meteor/meteor';
import {EloScores} from '/imports/api/games/eloscores.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {GAME_STATUS_FINISHED} from '/imports/api/games/statusConstants.js';

Meteor.publish('profileData', function(userId) {
	return Profiles.find({userId: userId});
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
			status: GAME_STATUS_FINISHED
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
		Players.find({userId: {$ne: this.userId}, gameId: {$in: gamesIds}}, {fields: {gameId: 1, name: 1}}),
		EloScores.find({userId: this.userId, gameId: {$in: gamesIds}})
	];
});
