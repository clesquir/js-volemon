import {Meteor} from 'meteor/meteor';
import {TimeSync} from 'meteor/mizzao:timesync';
import {Games} from '/imports/api/games/games.js';
import {
	HOST_POINTS_COLUMN,
	CLIENT_POINTS_COLUMN,
	HOST_SIDE,
	CLIENT_SIDE
} from '/imports/api/games/constants.js';
import {GAME_STATUS_STARTED, GAME_STATUS_FINISHED} from '/imports/api/games/statusConstants.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

Meteor.methods({
	addGamePoints: function(gameId, columnName) {
		const game = Games.findOne(gameId);
		const data = {};

		if (
			game && game.status === GAME_STATUS_STARTED &&
			[HOST_POINTS_COLUMN, CLIENT_POINTS_COLUMN].indexOf(columnName) !== -1
		) {
			data[columnName] = game[columnName] + 1;

			switch (columnName) {
				case HOST_POINTS_COLUMN:
					data['lastPointTaken'] = HOST_SIDE;
					break;
				case CLIENT_POINTS_COLUMN:
					data['lastPointTaken'] = CLIENT_SIDE;
					break;
			}

			data['activeBonuses'] = [];
			data['lastPointAt'] = getUTCTimeStamp() + TimeSync.serverOffset();

			if (data[columnName] >= game.maximumPoints) {
				data['status'] = GAME_STATUS_FINISHED;
			}

			Games.update({_id: game._id}, {$set: data});
		}
	}
});
