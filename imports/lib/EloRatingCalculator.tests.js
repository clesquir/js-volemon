import {assert} from 'chai'
import EloRatingCalculator from './EloRatingCalculator.js';

describe('EloRatingCalculator', function() {
	const calculator = new EloRatingCalculator();

	it('calculates elo ratings and last change', function() {
		const expectedEloRatings = [
			{
				currentWinner: 1000,
				currentLoser: 1000,
				expectedWinner: 1016,
				expectedLoser: 984
			},
			{
				currentWinner: 990,
				currentLoser: 1010,
				expectedWinner: 1007,
				expectedLoser: 993
			},
			{
				currentWinner: 1010,
				currentLoser: 990,
				expectedWinner: 1025,
				expectedLoser: 975
			},
			{
				currentWinner: 1100,
				currentLoser: 1000,
				expectedWinner: 1112,
				expectedLoser: 988
			},
			{
				currentWinner: 1000,
				currentLoser: 1100,
				expectedWinner: 1020,
				expectedLoser: 1080
			},
			{
				currentWinner: 1000,
				currentLoser: 990,
				expectedWinner: 1016,
				expectedLoser: 974
			},
			{
				currentWinner: 990,
				currentLoser: 1000,
				expectedWinner: 1006,
				expectedLoser: 984
			},
			{
				currentWinner: 1200,
				currentLoser: 1164,
				expectedWinner: 1214,
				expectedLoser: 1150
			},
			{
				currentWinner: 1164,
				currentLoser: 1200,
				expectedWinner: 1182,
				expectedLoser: 1182
			},
			{
				currentWinner: 1469,
				currentLoser: 634,
				expectedWinner: 1469,
				expectedLoser: 634
			},
			{
				currentWinner: 634,
				currentLoser: 1469,
				expectedWinner: 666,
				expectedLoser: 1437
			}
		];

		for (let expectedEloRating of expectedEloRatings) {
			const currentWinnerEloRating = expectedEloRating.currentWinner;
			const currentLoserEloRating = expectedEloRating.currentLoser;
			const expectedWinnerEloRating = expectedEloRating.expectedWinner;
			const expectedLoserEloRating = expectedEloRating.expectedLoser;

			let eloRating = calculator.calculateEloRating(
				currentWinnerEloRating,
				currentLoserEloRating
			);

			assert.isObject(eloRating);
			assert.propertyVal(eloRating, 'winnerEloRating', expectedWinnerEloRating);
			assert.propertyVal(eloRating, 'winnerEloRatingLastChange', expectedWinnerEloRating - currentWinnerEloRating);
			assert.propertyVal(eloRating, 'loserEloRating', expectedLoserEloRating);
			assert.propertyVal(eloRating, 'loserEloRatingLastChange', expectedLoserEloRating - currentLoserEloRating);
		}
	});
});
