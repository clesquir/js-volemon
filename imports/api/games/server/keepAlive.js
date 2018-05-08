import {Meteor} from 'meteor/meteor';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {callAtFrequence, getUTCTimeStamp} from '/imports/lib/utils.js';

const lastKeepAliveUpdateByPlayerIds = {};
const KEEP_ALIVE_INTERVAL = 2500;
const KEEP_ALIVE_TIMEOUT_INTERVAL = 10000;
const VACANT_GAME_STREAMS_REMOVAL_INTERVAL = 300000;

export const startKeepAlive = function(gameId, stream) {
	let game = Games.findOne(gameId);

	stream.on('sendBundledData-' + gameId, Meteor.bindEnvironment((bundledData) => {
		const moveClientPlayer = bundledData.moveClientPlayer;
		if (moveClientPlayer) {
			let movedPlayer = null;
			if (moveClientPlayer.key === 'player1') {
				movedPlayer = game.players[0];
			} else if (moveClientPlayer.key === 'player2') {
				movedPlayer = game.players[1];
			} else if (moveClientPlayer.key === 'player3') {
				movedPlayer = game.players[3];
			} else if (moveClientPlayer.key === 'player4') {
				movedPlayer = game.players[4];
			}

			if (movedPlayer) {
				if (!lastKeepAliveUpdateByPlayerIds[movedPlayer.id]) {
					lastKeepAliveUpdateByPlayerIds[movedPlayer.id] = 0;
				}

				lastKeepAliveUpdateByPlayerIds[movedPlayer.id] = callAtFrequence(
					lastKeepAliveUpdateByPlayerIds[movedPlayer.id],
					KEEP_ALIVE_INTERVAL,
					() => {
						Players.update({userId: movedPlayer.id}, {$set: {lastKeepAlive: getUTCTimeStamp()}});
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
