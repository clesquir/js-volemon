export default class EloRatingCalculator {
	constructor(kFactor = 32) {
		this.kFactor = kFactor;
	}

	/**
	 * @param {{id: string, eloRating: int}[]} winners
	 * @param {{id: string, eloRating: int}[]} losers
	 * @returns {{id: string, eloRating: int, lastChange: int}[]}
	 */
	calculate(winners, losers) {
		let winnerSum = this.eloRatingSum(winners);
		let loserSum = this.eloRatingSum(losers);

		const eloRatings = [];
		for (let user of winners) {
			eloRatings.push(this.userEloRating(user, this.eloScore(winnerSum, loserSum), 1));
		}
		for (let user of losers) {
			eloRatings.push(this.userEloRating(user, this.eloScore(loserSum, winnerSum), 0));
		}

		return eloRatings;
	}

	/**
	 * @private
	 * @param {{id: string, eloRating: int}[]} users
	 * @returns {number}
	 */
	eloRatingSum(users) {
		let eloRatingSum = 0;

		for (let user of users) {
			eloRatingSum += user.eloRating;
		}

		return eloRatingSum;
	}

	/**
	 * @private
	 * @param {{id: string, eloRating: int}} user
	 * @param {number} eloScore
	 * @param {number} score
	 * @returns {{id: string, eloRating: number, lastChange: number}}
	 */
	userEloRating(user, eloScore, score) {
		let newRating = this.eloRating(user.eloRating, eloScore, score);

		return {id: user.id, eloRating: newRating, lastChange: newRating - user.eloRating};
	}

	/**
	 * @private
	 * @param {number} currentElo
	 * @param {number} opponentElo
	 * @returns {number}
	 */
	eloScore(currentElo, opponentElo) {
		return 1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));
	}

	/**
	 * @private
	 * @param {number} previousEloRating
	 * @param {number} eloScore
	 * @param {number} score
	 * @returns {number}
	 */
	eloRating(previousEloRating, eloScore, score) {
		return previousEloRating + Math.round(this.kFactor * (score - eloScore));
	}
}
