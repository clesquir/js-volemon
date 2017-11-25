import GameFinished from '/imports/api/games/events/GameFinished.js';
import PlayerLost from '/imports/api/games/events/PlayerLost.js';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';
import {Games} from '/imports/api/games/games.js';
import EloRatingCalculator from '/imports/lib/EloRatingCalculator.js';
import {EventPublisher} from '/imports/lib/EventPublisher.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

export default class FinishedGameUpdater {
	/**
	 * @param {ProfileUpdater} profileUpdater
	 * @param {EloScoreCreator} eloScoreCreator
	 */
	constructor(profileUpdater, eloScoreCreator) {
		this.profileUpdater = profileUpdater;
		this.eloScoreCreator = eloScoreCreator;
	}

	updateStatistics(gameId, winnerUserId, loserUserId) {
		const winnerProfile = this.profileByUserId(winnerUserId);
		const loserProfile = this.profileByUserId(loserUserId);
		const game = this.gameById(gameId);
		const points = this.playerPoints(game.hostPoints, game.clientPoints);
		const winnerProfileData = {};
		const loserProfileData = {};

		winnerProfileData['numberOfWin'] = winnerProfile.numberOfWin + 1;
		loserProfileData['numberOfLost'] = loserProfile.numberOfLost + 1;

		if (game.maximumPoints > 1 && points.winnerPoints === game.maximumPoints && points.loserPoints === 0) {
			winnerProfileData['numberOfShutouts'] = winnerProfile.numberOfShutouts + 1;
			loserProfileData['numberOfShutoutLosses'] = loserProfile.numberOfShutoutLosses + 1;
		}

		this.profileUpdater.update(winnerUserId, winnerProfileData);
		this.profileUpdater.update(loserUserId, loserProfileData);
	}

	updateElo(gameId, winnerUserId, loserUserId) {
		const winnerProfile = this.profileByUserId(winnerUserId);
		const loserProfile = this.profileByUserId(loserUserId);
		const eloRatingCalculator = new EloRatingCalculator();
		const eloRating = eloRatingCalculator.calculateEloRating(winnerProfile.eloRating, loserProfile.eloRating);

		this.updateEloRatings(winnerUserId, loserUserId, eloRating);
		this.updateEloScores(gameId, winnerUserId, loserUserId, eloRating);
	}

	publishEvents(gameId, winnerUserId, loserUserId) {
		const game = this.gameById(gameId);
		const points = this.playerPoints(game.hostPoints, game.clientPoints);

		EventPublisher.publish(new PlayerWon(gameId, winnerUserId, points.winnerPoints, points.loserPoints));
		EventPublisher.publish(new PlayerLost(gameId, loserUserId, points.winnerPoints, points.loserPoints));
		EventPublisher.publish(new GameFinished(gameId, game.gameDuration));
	}

	/**
	 * @private
	 * @param userId
	 * @returns {*}
	 */
	profileByUserId(userId) {
		return this.profileUpdater.findOrCreate(userId);
	}

	/**
	 * @private
	 * @param gameId
	 * @returns {*}
	 */
	gameById(gameId) {
		return Games.findOne(gameId);
	}

	/**
	 * @private
	 * @param hostPoints
	 * @param clientPoints
	 * @returns {{winnerPoints, loserPoints}}
	 */
	playerPoints(hostPoints, clientPoints) {
		let winnerPoints = hostPoints;
		let loserPoints = clientPoints;
		if (clientPoints > hostPoints) {
			winnerPoints = clientPoints;
			loserPoints = hostPoints;
		}

		return {
			winnerPoints: winnerPoints,
			loserPoints: loserPoints
		};
	}

	/**
	 * @private
	 * @param winnerUserId
	 * @param loserUserId
	 * @param eloRating
	 */
	updateEloRatings(winnerUserId, loserUserId, eloRating) {
		this.profileUpdater.update(
			winnerUserId,
			{
				eloRating: eloRating.winnerEloRating,
				eloRatingLastChange: eloRating.winnerEloRatingLastChange
			}
		);
		this.profileUpdater.update(
			loserUserId,
			{
				eloRating: eloRating.loserEloRating,
				eloRatingLastChange: eloRating.loserEloRatingLastChange
			}
		);
	}

	/**
	 * @private
	 * @param gameId
	 * @param winnerUserId
	 * @param loserUserId
	 * @param eloRating
	 */
	updateEloScores(gameId, winnerUserId, loserUserId, eloRating) {
		const eloScoreTimestamp = getUTCTimeStamp();

		this.eloScoreCreator.insert({
			timestamp: eloScoreTimestamp,
			userId: winnerUserId,
			gameId: gameId,
			eloRating: eloRating.winnerEloRating,
			eloRatingChange: eloRating.winnerEloRatingLastChange
		});
		this.eloScoreCreator.insert({
			timestamp: eloScoreTimestamp,
			userId: loserUserId,
			gameId: gameId,
			eloRating: eloRating.loserEloRating,
			eloRatingChange: eloRating.loserEloRatingLastChange
		});
	}
}
