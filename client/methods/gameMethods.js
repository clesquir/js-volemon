import { Games } from '/collections/games.js';
import { Players } from '/collections/players.js';
import { Constants } from '/lib/constants.js';

Meteor.methods({
	keepPlayerAlive: function(playerId) {
		var player = Players.findOne(playerId);

		if (player) {
			Players.update({_id: playerId}, {$set: {lastKeepAlive: getUTCTimeStamp()}});
		}
	},

	addGamePoints: function(gameId, columnName) {
		var game = Games.findOne(gameId),
			data = {};

		if (
			game && game.status == Constants.GAME_STATUS_STARTED &&
			[Constants.HOST_POINTS_COLUMN, Constants.CLIENT_POINTS_COLUMN].indexOf(columnName) !== -1
		) {
			data[columnName] = game[columnName] + 1;

			switch (columnName) {
				case Constants.HOST_POINTS_COLUMN:
					data['lastPointTaken'] = Constants.LAST_POINT_TAKEN_HOST;
					break;
				case Constants.CLIENT_POINTS_COLUMN:
					data['lastPointTaken'] = Constants.LAST_POINT_TAKEN_CLIENT;
					break;
			}

			data['lastPointAt'] = getUTCTimeStamp();

			if (data[columnName] >= Constants.MAXIMUM_POINTS) {
				data['status'] = Constants.GAME_STATUS_FINISHED;
			}

			Games.update({_id: game._id}, {$set: data});
		}
	}
});
