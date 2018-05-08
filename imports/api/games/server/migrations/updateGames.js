import {ONE_VS_ONE_GAME_MODE} from '/imports/api/games/constants.js';
import {Games} from '/imports/api/games/games.js';
import {Meteor} from 'meteor/meteor';

Meteor.startup(function() {
	/**
	 * Migration for updating game
	 */
	Games.find({players: {$exists: false}}).forEach(
		function (game) {
			const players = [];

			if (game.hostId) {
				players.push({id: game.hostId, name: game.hostName});
			}
			if (game.clientId) {
				players.push({id: game.clientId, name: game.clientName});
			}

			Games.update({_id: game._id}, {$set: {players: players}});
		}
	);
	Games.update({gameMode: {$exists: false}}, {$set: {gameMode: ONE_VS_ONE_GAME_MODE}}, {multi: true});
	Games.update({hostId: {$exists: true}}, {$unset: {hostId: 1, hostName: 1, clientId: 1, clientName: 1}}, {multi: true});
});
