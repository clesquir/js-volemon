import { EloScores } from '/collections/eloscores.js';
import { Games } from '/collections/games.js';
import { Players } from '/collections/players.js';
import { Profiles } from '/collections/profiles.js';
import { Constants } from '/imports/lib/constants.js';
import { getUTCTimeStamp } from '/imports/lib/utils.js';

/**
 * @param gameId
 * @param highestPointsColumn
 */
updateProfilesOnGameFinish = function(gameId, highestPointsColumn) {
	var game = Games.findOne(gameId);

	if (!game) {
		throw new Meteor.Error(404, 'Game not found');
	}

	if (game.status != Constants.GAME_STATUS_FINISHED) {
		throw new Meteor.Error('not-allowed', 'Only finished games can be used for Elo calculations');
	}

	let hostProfile = Profiles.findOne({userId: game.createdBy});
	let hostProfileData = {};

	let clientPlayer = Players.findOne({gameId: game._id, userId: {$ne: game.createdBy}});
	let clientProfile = Profiles.findOne({userId: clientPlayer.userId});
	let clientProfileData = {};

	let hostEloScore = getEloScore(hostProfile.eloRating, clientProfile.eloRating);
	let hostScore = 0;
	let clientEloScore = getEloScore(clientProfile.eloRating, hostProfile.eloRating);
	let clientScore = 0;

	if (highestPointsColumn === Constants.HOST_POINTS_COLUMN) {
		hostScore = 1;
		hostProfileData['numberOfWin'] = hostProfile.numberOfWin + 1;
		clientProfileData['numberOfLost'] = clientProfile.numberOfLost + 1;
	} else {
		clientScore = 1;
		hostProfileData['numberOfLost'] = hostProfile.numberOfLost + 1;
		clientProfileData['numberOfWin'] = clientProfile.numberOfWin + 1;
	}

	hostProfileData['eloRating'] = getEloRating(hostProfile.eloRating, hostEloScore, hostScore);
	hostProfileData['eloRatingLastChange'] = hostProfileData['eloRating'] - hostProfile.eloRating;
	clientProfileData['eloRating'] = getEloRating(clientProfile.eloRating, clientEloScore, clientScore);
	clientProfileData['eloRatingLastChange'] = clientProfileData['eloRating'] - clientProfile.eloRating;

	Profiles.update({_id: hostProfile._id}, {$set: hostProfileData});
	Profiles.update({_id: clientProfile._id}, {$set: clientProfileData});

	let eloScoreTimestamp = getUTCTimeStamp();

	EloScores.insert({
		timestamp: eloScoreTimestamp,
		userId: hostProfile.userId,
		eloRating: hostProfileData['eloRating']
	});
	EloScores.insert({
		timestamp: eloScoreTimestamp,
		userId: clientProfile.userId,
		eloRating: clientProfileData['eloRating']
	});
};

/**
 * @param currentElo
 * @param opponentElo
 * @returns {number}
 */
getEloScore = function(currentElo, opponentElo) {
	return 1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));
};

/**
 * @param previousEloRating
 * @param eloScore
 * @param score
 * @param K
 * @returns {number}
 */
getEloRating = function(previousEloRating, eloScore, score, K = 32) {
	return previousEloRating + Math.round(K * (score - eloScore));
};
