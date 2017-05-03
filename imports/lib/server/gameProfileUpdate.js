import {Meteor} from 'meteor/meteor';
import {EloScores} from '/imports/api/games/eloscores.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {Constants} from '/imports/lib/constants.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

/**
 * @param gameId
 * @param highestPointsColumn
 */
export const updateProfilesOnGameFinish = function(gameId, highestPointsColumn) {
	const game = Games.findOne(gameId);

	if (!game) {
		throw new Meteor.Error(404, 'Game not found');
	}

	if (game.status !== Constants.GAME_STATUS_FINISHED) {
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

	if (game.hostPoints === 5 && game.clientPoints === 0) {
		hostProfileData['numberOfShutouts'] = hostProfile.numberOfShutouts + 1;
	} else if (game.hostPoints === 0 && game.clientPoints === 5) {
		clientProfileData['numberOfShutouts'] = clientProfile.numberOfShutouts + 1;
	}

	Profiles.update({_id: hostProfile._id}, {$set: hostProfileData});
	Profiles.update({_id: clientProfile._id}, {$set: clientProfileData});

	let eloScoreTimestamp = getUTCTimeStamp();

	EloScores.insert({
		timestamp: eloScoreTimestamp,
		userId: hostProfile.userId,
		gameId: gameId,
		eloRating: hostProfileData['eloRating'],
		eloRatingChange: hostProfileData['eloRatingLastChange']
	});
	EloScores.insert({
		timestamp: eloScoreTimestamp,
		userId: clientProfile.userId,
		gameId: gameId,
		eloRating: clientProfileData['eloRating'],
		eloRatingChange: clientProfileData['eloRatingLastChange']
	});
};

/**
 * @param currentElo
 * @param opponentElo
 * @returns {number}
 */
export const getEloScore = function(currentElo, opponentElo) {
	return 1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));
};

/**
 * @param previousEloRating
 * @param eloScore
 * @param score
 * @param K
 * @returns {number}
 */
export const getEloRating = function(previousEloRating, eloScore, score, K = 32) {
	return previousEloRating + Math.round(K * (score - eloScore));
};
