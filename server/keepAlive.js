import { Games } from '/collections/games.js';
import { Players } from '/collections/players.js';
import { Config } from '/lib/config.js';
import { callMeteorMethodAtFrequence } from '/lib/utils.js';

const lastKeepAliveUpdateByPlayerIds = {};

startKeepAlive = function(gameId) {
	let game = Games.findOne(gameId);
	let players = Players.find({gameId: gameId});
	let hostPlayer = null;
	let clientPlayer = null;
	players.forEach(function(player) {
		if (game.createdBy == player.userId) {
			hostPlayer = player;
		} else {
			clientPlayer = player;
		}
	});

	ServerStream.on('sendBundledData-' + gameId, function(bundledData) {
		if (bundledData.moveOppositePlayer) {
			let movedPlayer = null;
			if (bundledData.moveOppositePlayer.isUserHost) {
				movedPlayer = hostPlayer;
			} else {
				movedPlayer = clientPlayer;
			}

			if (movedPlayer) {
				if (!lastKeepAliveUpdateByPlayerIds[movedPlayer._id]) {
					lastKeepAliveUpdateByPlayerIds[movedPlayer._id] = 0;
				}
				Meteor.wrapAsync(() => {
					lastKeepAliveUpdateByPlayerIds[movedPlayer._id] = callMeteorMethodAtFrequence(
						lastKeepAliveUpdateByPlayerIds[movedPlayer._id],
						Config.keepAliveInterval,
						'keepPlayerAlive',
						[movedPlayer._id]
					);
				});
			}
		}
	});
};

Meteor.setInterval(function() {
	Meteor.call('removeTimeoutPlayersAndGames');
}, Config.keepAliveTimeOutInterval);
