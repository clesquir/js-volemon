import {Meteor} from 'meteor/meteor';
import {TimeSync} from 'meteor/mizzao:timesync';
import { Games } from '/collections/games.js';
import { Constants } from '/imports/lib/constants.js';
import { getUTCTimeStamp } from '/imports/lib/utils.js';

Meteor.methods({
	addGamePoints: function(gameId, columnName) {
		const game = Games.findOne(gameId);
		const data = {};

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

			data['activeBonuses'] = [];
			data['lastPointAt'] = getUTCTimeStamp() + TimeSync.serverOffset();

			if (data[columnName] >= Constants.MAXIMUM_POINTS) {
				data['status'] = Constants.GAME_STATUS_FINISHED;
			}

			Games.update({_id: game._id}, {$set: data});
		}
	},

	addActiveBonusToGame: function(gameId, bonusIdentifier, bonusClass, activatedAt, targetPlayerKey) {
		const game = Games.findOne(gameId);
		const data = {};

		if (game && game.status == Constants.GAME_STATUS_STARTED) {
			data['activeBonuses'] = [].concat(game.activeBonuses).concat([{
				bonusIdentifier: bonusIdentifier,
				bonusClass: bonusClass,
				activatedAt: activatedAt,
				targetPlayerKey: targetPlayerKey
			}]);

			Games.update({_id: game._id}, {$set: data});
		}
	},

	removeActiveBonusFromGame: function(gameId, bonusIdentifier) {
		const game = Games.findOne(gameId);
		const data = {
			activeBonuses: []
		};

		if (game) {
			//Remove the bonus/targetPlayerKey from the list
			for (let activeBonus of game.activeBonuses) {
				if (activeBonus.bonusIdentifier != bonusIdentifier) {
					data.activeBonuses.push(activeBonus);
				}
			}

			Games.update({_id: game._id}, {$set: data});
		}
	}
});
