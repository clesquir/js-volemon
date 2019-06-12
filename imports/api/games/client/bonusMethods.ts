import {Meteor} from 'meteor/meteor';
import {Games} from "../games";
import {GAME_STATUS_STARTED} from "../statusConstants";

Meteor.methods({
	createBonus: function(gameId: string, data: Object) {
	},

	clearBonus: function(gameId: string, data: Object) {
	},

	addActiveBonusToGame: function(gameId: string, activatedAt: number, initialBonusClass: string, activationData: Object) {
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

	removeActiveBonusFromGame: function(gameId: string, bonusIdentifier: string) {
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
