import {Meteor} from 'meteor/meteor';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';
import PlayerLost from '/imports/api/games/events/PlayerLost.js';
import {EloScores} from '/imports/api/games/eloscores.js';
import {Games} from '/imports/api/games/games.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {GAME_MAXIMUM_POINTS} from '/imports/api/games/constants.js';
import {GAME_STATUS_FINISHED} from '/imports/api/games/statusConstants.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';
import {EventPublisher} from '/imports/lib/EventPublisher.js';

/**
 * @param gameId
 * @param winnerUserId
 * @param loserUserId
 */
export const onGameFinished = function(gameId, winnerUserId, loserUserId) {
	const game = Games.findOne(gameId);

	if (!game) {
		throw new Meteor.Error(404, 'Game not found');
	}

	if (game.status !== GAME_STATUS_FINISHED) {
		throw new Meteor.Error('not-allowed', 'Only finished games can be used for Elo calculations');
	}

	let winnerProfile = Profiles.findOne({userId: winnerUserId});
	let loserProfile = Profiles.findOne({userId: loserUserId});

	updateProfilesOnGameFinished(game, winnerProfile, loserProfile);
	updateEloScoresOnGameFinished(game, winnerProfile, loserProfile);
};

/**
 * @private
 * @param game
 * @param winnerProfile
 * @param loserProfile
 */
export const updateProfilesOnGameFinished = function(game, winnerProfile, loserProfile) {
	const winnerProfileData = {};
	const loserProfileData = {};

	let winnerPoints = game.hostPoints;
	let loserPoints = game.clientPoints;
	if (game.clientPoints > game.hostPoints) {
		winnerPoints = game.clientPoints;
		loserPoints = game.hostPoints;
	}

	winnerProfileData['numberOfWin'] = winnerProfile.numberOfWin + 1;
	loserProfileData['numberOfLost'] = loserProfile.numberOfLost + 1;

	if (winnerPoints === GAME_MAXIMUM_POINTS && loserPoints === 0) {
		winnerProfileData['numberOfShutouts'] = winnerProfile.numberOfShutouts + 1;
		loserProfileData['numberOfShutoutLosses'] = loserProfile.numberOfShutoutLosses + 1;
	}

	Profiles.update({_id: winnerProfile._id}, {$set: winnerProfileData});
	Profiles.update({_id: loserProfile._id}, {$set: loserProfileData});

	EventPublisher.publish(new PlayerWon(game._id, winnerProfile.userId, winnerPoints, loserPoints));
	EventPublisher.publish(new PlayerLost(game._id, loserProfile.userId, winnerPoints, loserPoints));
};

/**
 * @private
 * @param game
 * @param winnerProfile
 * @param loserProfile
 */
export const updateEloScoresOnGameFinished = function(game, winnerProfile, loserProfile) {
	const winnerProfileData = {};
	const loserProfileData = {};
	const eloScoreTimestamp = getUTCTimeStamp();

	winnerProfileData['eloRating'] = getEloRating(
		winnerProfile.eloRating,
		getEloScore(winnerProfile.eloRating, loserProfile.eloRating),
		1
	);
	winnerProfileData['eloRatingLastChange'] = winnerProfileData['eloRating'] - winnerProfile.eloRating;

	loserProfileData['eloRating'] = getEloRating(
		loserProfile.eloRating,
		getEloScore(loserProfile.eloRating, winnerProfile.eloRating),
		0
	);
	loserProfileData['eloRatingLastChange'] = loserProfileData['eloRating'] - loserProfile.eloRating;

	Profiles.update({_id: winnerProfile._id}, {$set: winnerProfileData});
	Profiles.update({_id: loserProfile._id}, {$set: loserProfileData});

	EloScores.insert({
		timestamp: eloScoreTimestamp,
		userId: winnerProfile.userId,
		gameId: game._id,
		eloRating: winnerProfileData['eloRating'],
		eloRatingChange: winnerProfileData['eloRatingLastChange']
	});
	EloScores.insert({
		timestamp: eloScoreTimestamp,
		userId: loserProfile.userId,
		gameId: game._id,
		eloRating: loserProfileData['eloRating'],
		eloRatingChange: loserProfileData['eloRatingLastChange']
	});
};

/**
 * @private
 * @param currentElo
 * @param opponentElo
 * @returns {number}
 */
export const getEloScore = function(currentElo, opponentElo) {
	return 1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));
};

/**
 * @private
 * @param previousEloRating
 * @param eloScore
 * @param score
 * @param K
 * @returns {number}
 */
export const getEloRating = function(previousEloRating, eloScore, score, K = 32) {
	return previousEloRating + Math.round(K * (score - eloScore));
};
