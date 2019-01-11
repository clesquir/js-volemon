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
		updateKeepAlive(bundledData['moveClientPlayer-player1'] && game.players[0], gameId);
		updateKeepAlive(bundledData['moveClientPlayer-player2'] && game.players[1], gameId);
		updateKeepAlive(bundledData['moveClientPlayer-player3'] && game.players[2], gameId);
		updateKeepAlive(bundledData['moveClientPlayer-player4'] && game.players[3], gameId);
	}));
};

const updateKeepAlive = function(movedPlayer, gameId) {
	if (movedPlayer && movedPlayer.id !== 'CPU') {
		if (!lastKeepAliveUpdateByPlayerIds[movedPlayer.id]) {
			lastKeepAliveUpdateByPlayerIds[movedPlayer.id] = 0;
		}

		lastKeepAliveUpdateByPlayerIds[movedPlayer.id] = callAtFrequence(
			lastKeepAliveUpdateByPlayerIds[movedPlayer.id],
			KEEP_ALIVE_INTERVAL,
			() => {
				Players.update({gameId: gameId, userId: movedPlayer.id}, {$set: {lastKeepAlive: getUTCTimeStamp()}});
			}
		);
	}
};

Meteor.setInterval(function() {
	Meteor.call('removeTimeoutPlayersAndGames', KEEP_ALIVE_TIMEOUT_INTERVAL);
}, KEEP_ALIVE_TIMEOUT_INTERVAL);

Meteor.setInterval(function() {
	Meteor.call('removeVacantGameStreams');
}, VACANT_GAME_STREAMS_REMOVAL_INTERVAL);
