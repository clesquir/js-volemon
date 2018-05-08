import {assert} from 'chai'
import {Random} from 'meteor/random';
import EloRatingCalculator from './EloRatingCalculator.js';

describe('EloRatingCalculator', function() {
	const calculator = new EloRatingCalculator();

	it('calculates elo ratings and last change for one vs one', function() {
		const expectedEloRatings = [
			{
				winner: 1000,
				loser: 1000,
				expected: [1016, 984]
			},
			{
				winner: 990,
				loser: 1010,
				expected: [1007, 993]
			},
			{
				winner: 1010,
				loser: 990,
				expected: [1025, 975]
			},
			{
				winner: 1100,
				loser: 1000,
				expected: [1112, 988]
			},
			{
				winner: 1000,
				loser: 1100,
				expected: [1020, 1080]
			},
			{
				winner: 1000,
				loser: 990,
				expected: [1016, 974]
			},
			{
				winner: 990,
				loser: 1000,
				expected: [1006, 984]
			},
			{
				winner: 1200,
				loser: 1164,
				expected: [1214, 1150]
			},
			{
				winner: 1164,
				loser: 1200,
				expected: [1182, 1182]
			},
			{
				winner: 1469,
				loser: 634,
				expected: [1469, 634]
			},
			{
				winner: 634,
				loser: 1469,
				expected: [666, 1437]
			}
		];

		for (let expectedEloRating of expectedEloRatings) {
			const winnerId = Random.id(5);
			const loserId = Random.id(5);

			let eloRating = calculator.calculate(
				[{id: winnerId, eloRating: expectedEloRating.winner}],
				[{id: loserId, eloRating: expectedEloRating.loser}]
			);

			assert.isArray(eloRating);
			assert.deepEqual(
				eloRating,
				[
					{
						id: winnerId,
						eloRating: expectedEloRating.expected[0],
						lastChange: expectedEloRating.expected[0] - expectedEloRating.winner
					},
					{
						id: loserId,
						eloRating: expectedEloRating.expected[1],
						lastChange: expectedEloRating.expected[1] - expectedEloRating.loser
					}
				]
			);
		}
	});

	it('calculates elo ratings and last change for two vs two', function() {
		const expectedEloRatings = [
			{
				winners: [1000, 1000],
				losers: [1000, 1000],
				expected: [1016, 1016, 984, 984]
			},
			{
				winners: [990, 990],
				losers: [1010, 1010],
				expected: [1008, 1008, 992, 992]
			},
			{
				winners: [1010, 1010],
				losers: [990, 990],
				expected: [1024, 1024, 976, 976]
			},
			{
				winners: [800, 1050],
				losers: [1000, 1000],
				expected: [823, 1073, 977, 977]
			},
			{
				winners: [1100, 1200],
				losers: [950, 975],
				expected: [1103, 1203, 947, 972]
			},
			{
				winners: [950, 975],
				losers: [1100, 1200],
				expected: [979, 1004, 1071, 1171]
			},
			{
				winners: [1200, 1300],
				losers: [800, 700],
				expected: [1200, 1300, 800, 700]
			},
			{
				winners: [800, 700],
				losers: [1200, 1300],
				expected: [832, 732, 1168, 1268]
			}
		];

		for (let expectedEloRating of expectedEloRatings) {
			const firstWinnerId = Random.id(5);
			const secondWinnerId = Random.id(5);
			const firstLoserId = Random.id(5);
			const secondLoserId = Random.id(5);

			let eloRating = calculator.calculate(
				[
					{id: firstWinnerId, eloRating: expectedEloRating.winners[0]},
					{id: secondWinnerId, eloRating: expectedEloRating.winners[1]}
				],
				[
					{id: firstLoserId, eloRating: expectedEloRating.losers[0]},
					{id: secondLoserId, eloRating: expectedEloRating.losers[1]}
				]
			);

			assert.isArray(eloRating);
			assert.deepEqual(
				eloRating,
				[
					{
						id: firstWinnerId,
						eloRating: expectedEloRating.expected[0],
						lastChange: expectedEloRating.expected[0] - expectedEloRating.winners[0]
					},
					{
						id: secondWinnerId,
						eloRating: expectedEloRating.expected[1],
						lastChange: expectedEloRating.expected[1] - expectedEloRating.winners[1]
					},
					{
						id: firstLoserId,
						eloRating: expectedEloRating.expected[2],
						lastChange: expectedEloRating.expected[2] - expectedEloRating.losers[0]
					},
					{
						id: secondLoserId,
						eloRating: expectedEloRating.expected[3],
						lastChange: expectedEloRating.expected[3] - expectedEloRating.losers[1]
					}
				]
			);
		}
	});
});
