Meteor.methods({
	keepPlayerAlive: function(playerId) {
		var player = Players.findOne(playerId);

		if (player) {
			Players.update({_id: playerId}, {$set: {lastKeepAlive: new Date().getTime()}});
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

			if (data[columnName] >= Config.maximumPoints) {
				data['status'] = Constants.GAME_STATUS_FINISHED;
			}

			Games.update({_id: game._id}, {$set: data});
		}
	}
});
