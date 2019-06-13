import BonusCaught from '../events/BonusCaught';
import BonusCleared from '../events/BonusCleared';
import BonusCreated from '../events/BonusCreated';
import BonusRemoved from '../events/BonusRemoved';
import {Games} from '../games';
import {GAME_STATUS_STARTED} from '../statusConstants';
import {Meteor} from 'meteor/meteor';
import {EventPublisher} from "../../../lib/EventPublisher";
import {BonusStreamData} from "../bonus/data/BonusStreamData";

Meteor.methods({
	createBonus: function(gameId: string, data: BonusStreamData) {
		EventPublisher.publish(
			new BonusCreated(
				gameId,
				data
			)
		);
	},

	clearBonus: function(gameId: string, data: BonusStreamData) {
		EventPublisher.publish(
			new BonusCleared(
				gameId,
				data
			)
		);
	},

	addActiveBonusToGame: function(gameId: string, activatedAt: number, initialBonusClass: string, activationData: Object) {
		const game = Games.findOne(gameId);
		const data = {};

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		if (game.status !== GAME_STATUS_STARTED) {
			throw new Meteor.Error('not-allowed', 'Only active games can have active bonus added to');
		}

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

		EventPublisher.publish(
			new BonusCaught(
				game._id,
				initialBonusClass,
				activationData
			)
		);
	},

	removeActiveBonusFromGame: function(gameId: string, bonusIdentifier: string) {
		const game = Games.findOne(gameId);
		const data = {
			activeBonuses: []
		};

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		//Remove the bonus/targetPlayerKey from the list
		let removedActivatedBonusClass;
		let removedBonusTargetPlayerKey;
		let removedBonusClass;
		let removedActivatorPlayerKey;
		for (let activeBonus of game.activeBonuses) {
			if (activeBonus.bonusIdentifier !== bonusIdentifier) {
				data.activeBonuses.push(activeBonus);
			} else {
				removedActivatedBonusClass = activeBonus.activatedBonusClass;
				removedBonusTargetPlayerKey = activeBonus.targetPlayerKey;
				removedBonusClass = activeBonus.bonusClass;
				removedActivatorPlayerKey = activeBonus.activatorPlayerKey;
			}
		}

		Games.update({_id: game._id}, {$set: data});

		EventPublisher.publish(
			new BonusRemoved(
				game._id,
				removedActivatedBonusClass,
				removedBonusTargetPlayerKey,
				removedBonusClass,
				removedActivatorPlayerKey
			)
		);
	}
});
