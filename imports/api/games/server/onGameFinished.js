import {Meteor} from 'meteor/meteor';
import EloScoreCreator from '/imports/api/games/server/EloScoreCreator.js';
import {Games} from '/imports/api/games/games.js';
import {hasGameStatusEndedWithAWinner} from '/imports/api/games/utils.js';
import ProfileUpdater from '/imports/api/profiles/server/ProfileUpdater.js';
import TournamentEloScoreCreator from '/imports/api/tournaments/server/TournamentEloScoreCreator';
import TournamentProfileUpdater from '/imports/api/tournaments/server/TournamentProfileUpdater.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';
import FinishedGameUpdater from './FinishedGameUpdater.js';

export const finishGame = function(gameId, winnerUserId, loserUserId) {
	const game = Games.findOne(gameId);
	const data = {};

	if (!game) {
		throw new Meteor.Error(404, 'Game not found');
	}

	if (!hasGameStatusEndedWithAWinner(game.status)) {
		throw new Meteor.Error('not-allowed', 'Game has not finished with a winner');
	}

	if (!Meteor.users.findOne({_id: winnerUserId})) {
		throw new Meteor.Error('not-allowed', 'Winner does not exist');
	}

	if (!Meteor.users.findOne({_id: loserUserId})) {
		throw new Meteor.Error('not-allowed', 'Loser does not exist');
	}

	data['finishedAt'] = getUTCTimeStamp();
	data['gameDuration'] = data['finishedAt'] - game.startedAt;

	Games.update({_id: game._id}, {$set: data});

	let profileUpdater = new ProfileUpdater();
	let eloScoreCreator = new EloScoreCreator();
	if (game.tournamentId) {
		profileUpdater = new TournamentProfileUpdater(game.tournamentId);
		eloScoreCreator = new TournamentEloScoreCreator(game.tournamentId);
	}
	const finishedGameUpdater = new FinishedGameUpdater(profileUpdater, eloScoreCreator);

	if (!game.isPracticeGame) {
		finishedGameUpdater.updateStatistics(gameId, winnerUserId, loserUserId);
		finishedGameUpdater.updateElo(gameId, winnerUserId, loserUserId);
	}

	finishedGameUpdater.publishEvents(gameId, winnerUserId, loserUserId);
};
