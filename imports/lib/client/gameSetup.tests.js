import {Random} from 'meteor/random';
import {chai} from 'meteor/practicalmeteor:chai';
import {
	playerAcceptedRematch,
	playerDeclinedRematch,
	playerHasNotRepliedRematch,
	playerLeftGame,
	currentPlayerHasRepliedRematch,
	currentPlayerAcceptedRematch
} from '/imports/lib/client/gameSetup.js';

describe('lib/client/gameSetup#playerDeclinedRematch', function() {
	it('returns false', function() {
		const falseProvider = [
			[
				'has no players',
				[]
			],
			[
				'player has not the column',
				[{}]
			],
			[
				'player has column undefined',
				[{askedForRematch: undefined}]
			],
			[
				'player has column null',
				[{askedForRematch: null}]
			],
			[
				'player has accepted',
				[{askedForRematch: true}]
			]
		];

		for (let item of falseProvider) {
			chai.assert.isFalse(playerDeclinedRematch(item[1]), item[0]);
		}
	});
	it('returns true', function() {
		const trueProvider = [
			[
				'only one player declined',
				[{askedForRematch: undefined}, {askedForRematch: false}]
			],
			[
				'both players declined',
				[{askedForRematch: false}, {askedForRematch: false}]
			]
		];

		for (let item of trueProvider) {
			chai.assert.isTrue(playerDeclinedRematch(item[1]), item[0]);
		}
	});
});

describe('lib/client/gameSetup#playerLeftGame', function() {
	it('returns false', function() {
		const falseProvider = [
			[
				'has no players',
				[]
			],
			[
				'player has not quit',
				[{hasQuit: false}]
			]
		];

		for (let item of falseProvider) {
			chai.assert.isFalse(playerLeftGame(item[1]), item[0]);
		}
	});
	it('returns true', function() {
		const trueProvider = [
			[
				'one player has quit',
				[{hasQuit: false}, {hasQuit: true}]
			]
		];

		for (let item of trueProvider) {
			chai.assert.isTrue(playerLeftGame(item[1]), item[0]);
		}
	});
});

describe('lib/client/gameSetup#playerAcceptedRematch', function() {
	it('returns false', function() {
		const falseProvider = [
			[
				'has no players',
				[]
			],
			[
				'player column is undefined',
				[{askedForRematch: undefined}]
			],
			[
				'player column is null',
				[{askedForRematch: null}]
			],
			[
				'player has declined',
				[{askedForRematch: false}]
			]
		];

		for (let item of falseProvider) {
			chai.assert.isFalse(playerAcceptedRematch(item[1]), item[0]);
		}
	});
	it('returns true', function() {
		const trueProvider = [
			[
				'one player has accepted',
				[{askedForRematch: false}, {askedForRematch: true}]
			]
		];

		for (let item of trueProvider) {
			chai.assert.isTrue(playerAcceptedRematch(item[1]), item[0]);
		}
	});
});

describe('lib/client/gameSetup#playerHasNotRepliedRematch', function() {
	it('returns false', function() {
		const falseProvider = [
			[
				'has no players',
				[]
			],
			[
				'player has accepted',
				[{askedForRematch: true}]
			],
			[
				'player has declined',
				[{askedForRematch: false}]
			]
		];

		for (let item of falseProvider) {
			chai.assert.isFalse(playerHasNotRepliedRematch(item[1]), item[0]);
		}
	});
	it('returns true', function() {
		const trueProvider = [
			[
				'player column is undefined',
				[{askedForRematch: undefined}]
			],
			[
				'player column is null',
				[{askedForRematch: null}]
			],
			[
				'one player has accepted and the other player column is undefined',
				[{askedForRematch: true}, {askedForRematch: undefined}]
			],
			[
				'one player has accepted and the other player column is null',
				[{askedForRematch: true}, {askedForRematch: null}]
			],
			[
				'one player has declined and the other player column is undefined',
				[{askedForRematch: false}, {askedForRematch: undefined}]
			],
			[
				'one player has declined and the other player column is null',
				[{askedForRematch: false}, {askedForRematch: null}]
			]
		];

		for (let item of trueProvider) {
			chai.assert.isTrue(playerHasNotRepliedRematch(item[1]), item[0]);
		}
	});
});

describe('lib/client/gameSetup#currentPlayerAcceptedRematch', function() {
	it('returns false', function() {
		const falseProvider = [
			[
				'has no players',
				[],
				1
			],
			[
				'current player is not in list',
				[{userId: 1, askedForRematch: true}],
				2
			],
			[
				'player column is undefined',
				[{userId: 1, askedForRematch: undefined}],
				1
			],
			[
				'player column is null',
				[{userId: 1, askedForRematch: null}],
				1
			],
			[
				'player has declined',
				[{userId: 1, askedForRematch: false}],
				1
			],
			[
				'current player has declined and oppinent has accepted',
				[{userId: 1, askedForRematch: false},{userId: 2, askedForRematch: true}],
				1
			]
		];

		for (let item of falseProvider) {
			chai.assert.isFalse(currentPlayerAcceptedRematch(item[1], item[2]), item[0]);
		}
	});
	it('returns true', function() {
		const trueProvider = [
			[
				'both players have accepted',
				[{userId: 1, askedForRematch: true},{userId: 2, askedForRematch: true}],
				1
			],
			[
				'both players have accepted',
				[{userId: 1, askedForRematch: true},{userId: 2, askedForRematch: true}],
				2
			],
			[
				'player has accepted',
				[{userId: 1, askedForRematch: true}],
				1
			],
			[
				'player has accepted but opponent did not',
				[{userId: 1, askedForRematch: true},{userId: 2, askedForRematch: false}],
				1
			]
		];

		for (let item of trueProvider) {
			chai.assert.isTrue(currentPlayerAcceptedRematch(item[1], item[2]), item[0]);
		}
	});
});

describe('lib/client/gameSetup#currentPlayerHasRepliedRematch', function() {
	it('returns false', function() {
		const falseProvider = [
			[
				'has no players',
				[],
				1
			],
			[
				'current player is not in list',
				[{userId: 1, askedForRematch: true}],
				2
			],
			[
				'player column is undefined',
				[{userId: 1, askedForRematch: undefined}],
				1
			],
			[
				'player column is null',
				[{userId: 1, askedForRematch: null}],
				1
			],
			[
				'current player has not replied and oppinent has accepted',
				[{userId: 1, askedForRematch: undefined},{userId: 2, askedForRematch: true}],
				1
			]
		];

		for (let item of falseProvider) {
			chai.assert.isFalse(currentPlayerHasRepliedRematch(item[1], item[2]), item[0]);
		}
	});
	it('returns true', function() {
		const trueProvider = [
			[
				'both players have accepted',
				[{userId: 1, askedForRematch: true},{userId: 2, askedForRematch: true}],
				1
			],
			[
				'both players have accepted',
				[{userId: 1, askedForRematch: true},{userId: 2, askedForRematch: true}],
				2
			],
			[
				'player has accepted',
				[{userId: 1, askedForRematch: true}],
				1
			],
			[
				'player has declined',
				[{userId: 1, askedForRematch: false}],
				1
			],
			[
				'player has accepted but opponent did not reply',
				[{userId: 1, askedForRematch: true},{userId: 2, askedForRematch: undefined}],
				1
			]
		];

		for (let item of trueProvider) {
			chai.assert.isTrue(currentPlayerHasRepliedRematch(item[1], item[2]), item[0]);
		}
	});
});
