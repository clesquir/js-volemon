import {Meteor} from 'meteor/meteor';
import {Games} from '/imports/api/games/games.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import BonusCreated from '/imports/api/games/events/BonusCreated.js';
import BonusRemoved from '/imports/api/games/events/BonusRemoved.js';
import {GAME_STATUS_STARTED} from '/imports/api/games/statusConstants.js';
import {EventPublisher} from '/imports/lib/EventPublisher.js';

Meteor.methods({
	createBonus: function(gameId, data) {
		EventPublisher.publish(
			new BonusCreated(
				gameId,
				data
			)
		);
	},

	addActiveBonusToGame: function(gameId, activatedAt, initialBonusClass, activationData) {
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

	removeActiveBonusFromGame: function(gameId, bonusIdentifier) {
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

		EventPublisher.publish(new BonusRemoved(
			game._id, removedActivatedBonusClass, removedBonusTargetPlayerKey, removedBonusClass, removedActivatorPlayerKey
		));
	}
});
