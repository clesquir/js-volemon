import GameFinished from '../events/GameFinished';
import PlayerLost from '../events/PlayerLost';
import PlayerWon from '../events/PlayerWon';
import {Games} from '../games';
import EloRatingCalculator from '../../../lib/EloRatingCalculator';
import EventPublisher from '../../../lib/EventPublisher';
import {getUTCTimeStamp} from "../../../lib/utils";
import EloScoreCreator from "./EloScoreCreator";
import ProfileUpdater from "../../profiles/server/ProfileUpdater";
import TournamentProfileUpdater from "../../tournaments/server/TournamentProfileUpdater";
import TournamentEloScoreCreator from "../../tournaments/server/TournamentEloScoreCreator";

export default class FinishedGameUpdater {
	profileUpdater: ProfileUpdater;
	eloScoreCreator: EloScoreCreator;
	tournamentProfileUpdater: TournamentProfileUpdater | null;
	tournamentEloScoreCreator: TournamentEloScoreCreator | null;

	constructor(
		profileUpdater: ProfileUpdater,
		eloScoreCreator: EloScoreCreator,
		tournamentProfileUpdater?: TournamentProfileUpdater,
		tournamentEloScoreCreator?: TournamentEloScoreCreator
	) {
		this.profileUpdater = profileUpdater;
		this.eloScoreCreator = eloScoreCreator;
		this.tournamentProfileUpdater = tournamentProfileUpdater;
		this.tournamentEloScoreCreator = tournamentEloScoreCreator;
	}

	updateStatistics(gameId: string, winnerUserIds: string[], loserUserIds: string[]) {
		const game = this.gameById(gameId);
		const points = this.playerPoints(game.hostPoints, game.clientPoints);

		this.updateWinnerStatistics(this.profileUpdater, game, points, winnerUserIds);
		this.updateLoserStatistics(this.profileUpdater, game, points, loserUserIds);

		if (this.tournamentProfileUpdater) {
			this.updateWinnerStatistics(this.tournamentProfileUpdater, game, points, winnerUserIds);
			this.updateLoserStatistics(this.tournamentProfileUpdater, game, points, loserUserIds);
		}
	}

	updateElo(gameId: string, winnerUserIds: string[], loserUserIds: string[]) {
		this.updateEloWithUpdaterAndCreator(
			this.profileUpdater,
			this.eloScoreCreator,
			gameId,
			winnerUserIds,
			loserUserIds
		);
		if (this.tournamentProfileUpdater) {
			this.updateEloWithUpdaterAndCreator(
				this.tournamentProfileUpdater,
				this.tournamentEloScoreCreator,
				gameId,
				winnerUserIds,
				loserUserIds
			);
		}
	}

	publishEvents(gameId: string, winnerUserIds: string[], loserUserIds: string[]) {
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

	private updateWinnerStatistics(profileUpdater: ProfileUpdater, game, points, winnerUserIds: string[]) {
		for (let userId of winnerUserIds) {
			profileUpdater.increateNumberOfWin(userId);

			if (game.maximumPoints > 1 && points.winnerPoints === game.maximumPoints && points.loserPoints === 0) {
				profileUpdater.increateNumberOfShutouts(userId);
			}
		}
	}

	private updateLoserStatistics(profileUpdater: ProfileUpdater, game, points, loserUserIds: string[]) {
		for (let userId of loserUserIds) {
			profileUpdater.increateNumberOfLost(userId);

			if (game.maximumPoints > 1 && points.winnerPoints === game.maximumPoints && points.loserPoints === 0) {
				profileUpdater.increateNumberOfShutoutLosses(userId);
			}
		}
	}

	private gameById(gameId: string) {
		return Games.findOne(gameId);
	}

	private playerPoints(hostPoints: number, clientPoints: number): {winnerPoints: number, loserPoints: number} {
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

	private updateEloWithUpdaterAndCreator(
		profileUpdater: ProfileUpdater,
		eloScoreCreator: EloScoreCreator,
		gameId: string,
		winnerUserIds: string[],
		loserUserIds: string[]
	) {
		const winnersCurrentEloRating = [];
		for (let userId of winnerUserIds) {
			winnersCurrentEloRating.push({id: userId, eloRating: profileUpdater.getEloRating(userId)});
		}
		const losersCurrentEloRating = [];
		for (let userId of loserUserIds) {
			losersCurrentEloRating.push({id: userId, eloRating: profileUpdater.getEloRating(userId)});
		}

		const eloRatingCalculator = new EloRatingCalculator();
		const eloRatings = eloRatingCalculator.calculate(winnersCurrentEloRating, losersCurrentEloRating);

		this.updateEloRatings(profileUpdater, eloRatings);
		this.updateEloScores(eloScoreCreator, gameId, eloRatings);
	}

	private updateEloRatings(
		profileUpdater: ProfileUpdater,
		eloRatings: {id: string, eloRating: number, lastChange: number}[]
	) {
		for (let rating of eloRatings) {
			profileUpdater.updateElo(
				rating.id,
				rating.eloRating,
				rating.lastChange
			);
		}
	}

	private updateEloScores(
		eloScoreCreator: EloScoreCreator,
		gameId: string,
		eloRatings: {id: string, eloRating: number, lastChange: number}[]
	) {
		const eloScoreTimestamp = getUTCTimeStamp();

		for (let rating of eloRatings) {
			eloScoreCreator.insert({
				timestamp: eloScoreTimestamp,
				userId: rating.id,
				gameId: gameId,
				eloRating: rating.eloRating,
				eloRatingChange: rating.lastChange
			});
		}
	}
}
