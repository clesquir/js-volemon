import {Games} from '/imports/api/games/games.js';
import FinishedGameUpdaterFactory from '/imports/api/games/server/FinishedGameUpdaterFactory';
import {hasGameStatusEndedWithAWinner} from '/imports/api/games/utils.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';
import {Meteor} from 'meteor/meteor';

export const finishGame = function(gameId, winnerUserIds, loserUserIds) {
	const game = Games.findOne(gameId);
	const data = {};

	if (!game) {
		throw new Meteor.Error(404, 'Game not found');
	}

	if (!hasGameStatusEndedWithAWinner(game.status)) {
		throw new Meteor.Error('not-allowed', 'Game has not finished with a winner');
	}

	for (let userId of winnerUserIds) {
		if (userId !== 'CPU' && !Meteor.users.findOne({_id: userId})) {
			throw new Meteor.Error('not-allowed', 'Winner does not exist');
		}
	}

	for (let userId of loserUserIds) {
		if (userId !== 'CPU' && !Meteor.users.findOne({_id: userId})) {
			throw new Meteor.Error('not-allowed', 'Loser does not exist');
		}
	}

	data['finishedAt'] = getUTCTimeStamp();
	data['gameDuration'] = data['finishedAt'] - game.startedAt;

	Games.update({_id: game._id}, {$set: data});

	const finishedGameUpdater = FinishedGameUpdaterFactory.fromGame(game);

	if (!game.isPracticeGame) {
		finishedGameUpdater.updateStatistics(gameId, winnerUserIds, loserUserIds);
		finishedGameUpdater.updateElo(gameId, winnerUserIds, loserUserIds);
	}

	finishedGameUpdater.publishEvents(gameId, winnerUserIds, loserUserIds);
};
