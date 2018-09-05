import {Games} from '/imports/api/games/games.js';
import {PLAYER_DEFAULT_SHAPE} from '/imports/api/games/shapeConstants.js';
import {Meteor} from 'meteor/meteor';

Meteor.startup(function() {
	const gamesWithWrongSelectedShape = Games.find({'players.shape': {$ne: PLAYER_DEFAULT_SHAPE}, 'players.selectedShape': PLAYER_DEFAULT_SHAPE});

	gamesWithWrongSelectedShape.forEach(function(game) {
		const gamePlayers = game.players;
		for (let gamePlayer of gamePlayers) {
			if (gamePlayer.shape !== PLAYER_DEFAULT_SHAPE && gamePlayer.selectedShape === PLAYER_DEFAULT_SHAPE) {
				gamePlayer.selectedShape = gamePlayer.shape;
			}
		}

		Games.update({_id: game._id}, {$set: {players: gamePlayers}});
	});
});
