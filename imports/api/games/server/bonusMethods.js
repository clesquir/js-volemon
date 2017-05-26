import {Meteor} from 'meteor/meteor';
import {Games} from '/imports/api/games/games.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import BonusRemoved from '/imports/api/games/events/BonusRemoved.js';
import {GAME_STATUS_STARTED} from '/imports/api/games/statusConstants.js';
import {EventPublisher} from '/imports/lib/EventPublisher.js';

Meteor.methods({
	updateGameHasBonuses: function(gameId, hasBonuses) {
		const user = Meteor.user();
		const game = Games.findOne(gameId);

		if (!user) {
			throw new Meteor.Error(401, 'You need to login to update game bonus property');
		}

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		if (game.createdBy !== user._id) {
			throw new Meteor.Error('not-allowed', 'Only the creator can update this game property');
		}

		Games.update({_id: game._id}, {$set: {hasBonuses: hasBonuses ? 1 : 0}});
	},

	addActiveBonusToGame: function(gameId, bonusIdentifier, activatedBonusClass, activatedAt, targetPlayerKey, bonusClass, activatorPlayerKey, initialBonusClass) {
		const game = Games.findOne(gameId);
		const data = {};

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		if (game.status !== GAME_STATUS_STARTED) {
			throw new Meteor.Error('not-allowed', 'Only active games can have active bonus added to');
		}

		data['activeBonuses'] = [].concat(game.activeBonuses).concat([{
			bonusIdentifier: bonusIdentifier,
			activatedBonusClass: activatedBonusClass,
			activatedAt: activatedAt,
			targetPlayerKey: targetPlayerKey,
			bonusClass: bonusClass,
			activatorPlayerKey: activatorPlayerKey,
			initialBonusClass: initialBonusClass
		}]);

		Games.update({_id: game._id}, {$set: data});

		EventPublisher.publish(new BonusCaught(
			game._id, activatedBonusClass, targetPlayerKey, bonusClass, activatorPlayerKey, initialBonusClass
		));
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
