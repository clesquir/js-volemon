import {Meteor} from 'meteor/meteor';
import {Games} from '/imports/api/games/games.js';
import {GAME_STATUS_STARTED} from '/imports/api/games/statusConstants.js';

Meteor.methods({
	createBonus: function(gameId, data) {
	},

	addActiveBonusToGame: function(gameId, activatedAt, initialBonusClass, activationData) {
		const game = Games.findOne(gameId);
		const data = {};

		if (game && game.status === GAME_STATUS_STARTED) {
			data['activeBonuses'] = [].concat(game.activeBonuses).concat(
				[
					Object.assign(
						{
							activatedAt: activatedAt,
							initialBonusClass: initialBonusClass
						},
						activationData
					)
				]
			);

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
