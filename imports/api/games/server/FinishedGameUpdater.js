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

	updateStatistics(gameId, winnerUserIds, loserUserIds) {
		const game = this.gameById(gameId);
		const points = this.playerPoints(game.hostPoints, game.clientPoints);

		for (let userId of winnerUserIds) {
			const winnerProfile = this.profileByUserId(userId);
			const winnerProfileData = {};

			winnerProfileData['numberOfWin'] = winnerProfile.numberOfWin + 1;

			if (game.maximumPoints > 1 && points.winnerPoints === game.maximumPoints && points.loserPoints === 0) {
				winnerProfileData['numberOfShutouts'] = winnerProfile.numberOfShutouts + 1;
			}

			this.profileUpdater.update(userId, winnerProfileData);
		}

		for (let userId of loserUserIds) {
			const loserProfile = this.profileByUserId(userId);
			const loserProfileData = {};

			loserProfileData['numberOfLost'] = loserProfile.numberOfLost + 1;

			if (game.maximumPoints > 1 && points.winnerPoints === game.maximumPoints && points.loserPoints === 0) {
				loserProfileData['numberOfShutoutLosses'] = loserProfile.numberOfShutoutLosses + 1;
			}

			this.profileUpdater.update(userId, loserProfileData);
		}
	}

	updateElo(gameId, winnerUserIds, loserUserIds) {
		const winnersCurrentEloRating = [];
		for (let userId of winnerUserIds) {
			winnersCurrentEloRating.push({id: userId, eloRating: this.profileByUserId(userId).eloRating});
		}
		const losersCurrentEloRating = [];
		for (let userId of loserUserIds) {
			losersCurrentEloRating.push({id: userId, eloRating: this.profileByUserId(userId).eloRating});
		}

		const eloRatingCalculator = new EloRatingCalculator();
		const eloRatings = eloRatingCalculator.calculate(winnersCurrentEloRating, losersCurrentEloRating);

		this.updateEloRatings(eloRatings);
		this.updateEloScores(gameId, eloRatings);
	}

	publishEvents(gameId, winnerUserIds, loserUserIds) {
		const game = this.gameById(gameId);
		const points = this.playerPoints(game.hostPoints, game.clientPoints);

		for (let userId of winnerUserIds) {
			EventPublisher.publish(new PlayerWon(gameId, userId, points.winnerPoints, points.loserPoints));
		}
		for (let userId of loserUserIds) {
			EventPublisher.publish(new PlayerLost(gameId, userId, points.winnerPoints, points.loserPoints));
		}
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
	 * @param {{id: string, eloRating: int, lastChange: int}[]} eloRatings
	 */
	updateEloRatings(eloRatings) {
		for (let rating of eloRatings) {
			this.profileUpdater.update(
				rating.id,
				{
					eloRating: rating.eloRating,
					eloRatingLastChange: rating.lastChange
				}
			);
		}
	}

	/**
	 * @private
	 * @param gameId
	 * @param {{id: string, eloRating: int, lastChange: int}[]} eloRatings
	 */
	updateEloScores(gameId, eloRatings) {
		const eloScoreTimestamp = getUTCTimeStamp();

		for (let rating of eloRatings) {
			this.eloScoreCreator.insert({
				timestamp: eloScoreTimestamp,
				userId: rating.id,
				gameId: gameId,
				eloRating: rating.eloRating,
				eloRatingChange: rating.lastChange
			});
		}
	}
}
