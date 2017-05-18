import {Meteor} from 'meteor/meteor';
import {Games} from '/imports/api/games/games.js';
import {Constants} from '/imports/lib/constants.js';

Meteor.methods({
	addActiveBonusToGame: function(gameId, bonusIdentifier, activatedBonusClass, activatedAt, targetPlayerKey, bonusClass, activatorPlayerKey) {
		const game = Games.findOne(gameId);
		const data = {};

		if (game && game.status === Constants.GAME_STATUS_STARTED) {
			data['activeBonuses'] = [].concat(game.activeBonuses).concat([{
				bonusIdentifier: bonusIdentifier,
				activatedBonusClass: activatedBonusClass,
				activatedAt: activatedAt,
				targetPlayerKey: targetPlayerKey,
				bonusClass: bonusClass,
				activatorPlayerKey: activatorPlayerKey
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
				if (activeBonus.bonusIdentifier !== bonusIdentifier) {
					data.activeBonuses.push(activeBonus);
				}
			}

			Games.update({_id: game._id}, {$set: data});
		}
	}
});
