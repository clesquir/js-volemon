import {Games} from '/imports/api/games/games.js';
import EloScoreCreator from '/imports/api/games/server/EloScoreCreator';
import {hasGameStatusEndedWithAWinner} from '/imports/api/games/utils.js';
import ProfileUpdater from '/imports/api/profiles/server/ProfileUpdater';
import TournamentEloScoreCreator from '/imports/api/tournaments/server/TournamentEloScoreCreator';
import TournamentProfileUpdater from '/imports/api/tournaments/server/TournamentProfileUpdater';
import {getUTCTimeStamp} from '/imports/lib/utils.js';
import {Meteor} from 'meteor/meteor';
import FinishedGameUpdater from './FinishedGameUpdater';

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

	let profileUpdater = new ProfileUpdater();
	let eloScoreCreator = new EloScoreCreator();
	let tournamentProfileUpdater = null;
	let tournamentEloScoreCreator = null;
	if (game.tournamentId) {
		tournamentProfileUpdater = new TournamentProfileUpdater(game.tournamentId);
		tournamentEloScoreCreator = new TournamentEloScoreCreator(game.tournamentId);
	}
	const finishedGameUpdater = new FinishedGameUpdater(
		profileUpdater,
		eloScoreCreator,
		tournamentProfileUpdater,
		tournamentEloScoreCreator
	);

	if (!game.isPracticeGame) {
		finishedGameUpdater.updateStatistics(gameId, winnerUserIds, loserUserIds);
		finishedGameUpdater.updateElo(gameId, winnerUserIds, loserUserIds);
	}

	finishedGameUpdater.publishEvents(gameId, winnerUserIds, loserUserIds);
};
