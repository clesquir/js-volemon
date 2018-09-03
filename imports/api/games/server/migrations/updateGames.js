import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {PLAYER_DEFAULT_SHAPE} from '/imports/api/games/shapeConstants.js';
import {Meteor} from 'meteor/meteor';

Meteor.startup(function() {
	const gamesWithoutPlayersId = Games.find({'players.id': {$exists: false}});

	gamesWithoutPlayersId.forEach(function(game) {
		const players = Players.find({gameId: game._id}, {sort: [['joinedAt', 'asc']]});

		const gamePlayers = [];
		players.forEach(function(player) {
			gamePlayers.push({id: player.userId, name: player.name});
		});

		Games.update({_id: game._id}, {$set: {players: gamePlayers}});
	});

	const gamesWithoutShapes = Games.find({'players.$.shape': {$exists: false}});

	gamesWithoutShapes.forEach(function(game) {
		const players = Players.find({gameId: game._id}, {sort: [['joinedAt', 'asc']]});

		const gamePlayers = game.players;
		players.forEach(function(player) {
			for (let gamePlayer of gamePlayers) {
				if (gamePlayer.id === player.userId) {
					gamePlayer.shape = player.shape || PLAYER_DEFAULT_SHAPE;

					if (player.selectedShape) {
						gamePlayer.selectedShape = player.selectedShape;
					} else {
						gamePlayer.selectedShape = PLAYER_DEFAULT_SHAPE;
					}
				}
			}
		});

		Games.update({_id: game._id}, {$set: {players: gamePlayers}});
	});

	Players.update({shape: {$exists: true}}, {$unset: {shape: ''}}, {multi: true});
	Players.update({selectedShape: {$exists: true}}, {$unset: {selectedShape: ''}}, {multi: true});
});
