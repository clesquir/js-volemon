export default class EloRatingCalculator {
	constructor(kFactor = 32) {
		this.kFactor = kFactor;
	}

	/**
	 * @param winnerCurrentEloRating
	 * @param loserCurrentEloRating
	 * @returns {{winnerEloRating: number, winnerEloRatingLastChange: number, loserEloRating: number, loserEloRatingLastChange: number}}
	 */
	calculateEloRating(winnerCurrentEloRating, loserCurrentEloRating) {
		const winnerEloRating = this.getEloRating(
			winnerCurrentEloRating,
			this.getEloScore(winnerCurrentEloRating, loserCurrentEloRating),
			1
		);

		const loserEloRating = this.getEloRating(
			loserCurrentEloRating,
			this.getEloScore(loserCurrentEloRating, winnerCurrentEloRating),
			0
		);

		return {
			winnerEloRating: winnerEloRating,
			winnerEloRatingLastChange: (winnerEloRating - winnerCurrentEloRating),
			loserEloRating: loserEloRating,
			loserEloRatingLastChange: (loserEloRating - loserCurrentEloRating)
		};
	}

	/**
	 * @private
	 * @param currentElo
	 * @param opponentElo
	 * @returns {number}
	 */
	getEloScore(currentElo, opponentElo) {
		return 1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));
	}

	/**
	 * @private
	 * @param previousEloRating
	 * @param eloScore
	 * @param score
	 * @returns {number}
	 */
	getEloRating(previousEloRating, eloScore, score) {
		return previousEloRating + Math.round(this.kFactor * (score - eloScore));
	}
}
