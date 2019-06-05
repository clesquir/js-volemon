import {Mongo} from 'meteor/mongo';

class GamesCollection extends Mongo.Collection {}

export const Games = new GamesCollection('games');

if (Meteor.isServer) {
	Games._ensureIndex({tournamentId: 1});
	Games._ensureIndex({status: 1});
	Games._ensureIndex({'players.id': 1, status: 1});
	Games._ensureIndex({'players.id': 1, status: 1, tournamentId: 1});
}

export const teammateNames = function(game, userId) {
	const teammates = [];
	if (game.players[0].id === userId) {
		if (game.players.length > 2) {
			teammates.push(game.players[2].name);
		}
	} else if (game.players[1].id === userId) {
		if (game.players.length > 2) {
			teammates.push(game.players[3].name);
		}
	} else if (game.players[2].id === userId) {
		teammates.push(game.players[0].name);
	} else if (game.players[3].id === userId) {
		teammates.push(game.players[1].name);
	}

	return teammates;
};

export const opponentNames = function(game, userId) {
	const opponents = [];
	if (game.players[0].id === userId) {
		opponents.push(game.players[1].name);
		if (game.players.length > 2) {
			opponents.push(game.players[3].name);
		}
	} else if (game.players[1].id === userId) {
		opponents.push(game.players[0].name);
		if (game.players.length > 2) {
			opponents.push(game.players[2].name);
		}
	} else if (game.players[2].id === userId) {
		opponents.push(game.players[1].name);
		opponents.push(game.players[3].name);
	} else if (game.players[3].id === userId) {
		opponents.push(game.players[0].name);
		opponents.push(game.players[2].name);
	}

	return opponents;
};
