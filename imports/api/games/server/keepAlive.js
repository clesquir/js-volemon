import {Meteor} from 'meteor/meteor';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {callAtFrequence, getUTCTimeStamp} from '/imports/lib/utils.js';

const lastKeepAliveUpdateByPlayerIds = {};
const KEEP_ALIVE_INTERVAL = 2500;
const KEEP_ALIVE_TIMEOUT_INTERVAL = 5000;
const VACANT_GAME_STREAMS_REMOVAL_INTERVAL = 300000;

export const startKeepAlive = function(gameId, stream) {
	let game = Games.findOne(gameId);
	let players = Players.find({gameId: gameId});
	let hostPlayer = null;
	let clientPlayer = null;
	players.forEach(function(player) {
		if (game.createdBy === player.userId) {
			hostPlayer = player;
		} else {
			clientPlayer = player;
		}
	});

	stream.on('sendBundledData-' + gameId, Meteor.bindEnvironment((bundledData) => {
		if (bundledData.moveOppositePlayer) {
			let movedPlayer = null;
			if (bundledData.moveOppositePlayer.isHost) {
				movedPlayer = hostPlayer;
			} else {
				movedPlayer = clientPlayer;
			}

			if (movedPlayer) {
				if (!lastKeepAliveUpdateByPlayerIds[movedPlayer._id]) {
					lastKeepAliveUpdateByPlayerIds[movedPlayer._id] = 0;
				}

				lastKeepAliveUpdateByPlayerIds[movedPlayer._id] = callAtFrequence(
					lastKeepAliveUpdateByPlayerIds[movedPlayer._id],
					KEEP_ALIVE_INTERVAL,
					() => {
						Players.update({_id: movedPlayer._id}, {$set: {lastKeepAlive: getUTCTimeStamp()}});
					}
				);
			}
		}
	}));
};

Meteor.setInterval(function() {
	Meteor.call('removeTimeoutPlayersAndGames', KEEP_ALIVE_TIMEOUT_INTERVAL);
}, KEEP_ALIVE_TIMEOUT_INTERVAL);

Meteor.setInterval(function() {
	Meteor.call('removeVacantGameStreams');
}, VACANT_GAME_STREAMS_REMOVAL_INTERVAL);
