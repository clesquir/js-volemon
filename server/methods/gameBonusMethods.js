import {Meteor} from 'meteor/meteor';
import {Games} from '/imports/api/games/games.js';
import {Constants} from '/imports/lib/constants.js';

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

	addActiveBonusToGame: function(gameId, bonusIdentifier, bonusClass, activatedAt, targetPlayerKey) {
		const game = Games.findOne(gameId);
		const data = {};

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		if (game.status !== Constants.GAME_STATUS_STARTED) {
			throw new Meteor.Error('not-allowed', 'Only active games can have active bonus added to');
		}

		data['activeBonuses'] = [].concat(game.activeBonuses).concat([{
			bonusIdentifier: bonusIdentifier,
			bonusClass: bonusClass,
			activatedAt: activatedAt,
			targetPlayerKey: targetPlayerKey
		}]);

		Games.update({_id: game._id}, {$set: data});
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
		for (let activeBonus of game.activeBonuses) {
			if (activeBonus.bonusIdentifier !== bonusIdentifier) {
				data.activeBonuses.push(activeBonus);
			}
		}

		Games.update({_id: game._id}, {$set: data});
	}
});
