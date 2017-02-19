import { Games } from '/collections/games.js';
import { Players } from '/collections/players.js';
import { Config } from '/imports/lib/config.js';
import { Constants } from '/imports/lib/constants.js';
import { ClientStream } from '/imports/lib/streams.js';
import { callMeteorMethodAtFrequence } from '/imports/lib/utils.js';

var listenersAddedByGameIds = {};
var lastKeepAliveUpdateByPlayerIds = {};

// Games.find({status: {$nin: [Constants.GAME_STATUS_TIMEOUT]}}).observeChanges({
// 	changed: (gameId, fields) => {
// 		if (fields.hasOwnProperty('status')) {
// 			let game = Games.findOne(gameId);
//
// 			if (game.status === Constants.GAME_STATUS_STARTED) {
// 				if (!listenersAddedByGameIds[gameId]) {
// 					ClientStream.on('moveOppositePlayer-' + gameId, function(isUserHost) {
// 						var game = Games.findOne(gameId);
//
// 						if (game) {
// 							let selector = {gameId: gameId};
//
// 							if (isUserHost) {
// 								selector.userId = game.createdBy;
// 							} else {
// 								selector.userId = {$ne: game.createdBy};
// 							}
//
// 							let player = Players.findOne(selector);
//
// 							if (player) {
// 								if (!lastKeepAliveUpdateByPlayerIds[player._id]) {
// 									lastKeepAliveUpdateByPlayerIds[player._id] = 0;
// 								}
// 								lastKeepAliveUpdateByPlayerIds[player._id] = callMeteorMethodAtFrequence(
// 									lastKeepAliveUpdateByPlayerIds[player._id],
// 									Config.keepAliveInterval,
// 									'keepPlayerAlive',
// 									[player._id]
// 								);
// 							}
// 						}
// 					});
// 					listenersAddedByGameIds[gameId] = true;
// 				}
// 			} else {
// 				ClientStream.removeAllListeners('moveOppositePlayer-' + gameId);
// 			}
// 		}
// 	}
// });

// Meteor.setInterval(function() {
// 	Meteor.call('removeTimeoutPlayersAndGames');
// }, Config.keepAliveTimeOutInterval);
