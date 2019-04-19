import {TWO_VS_TWO_GAME_MODE} from '/imports/api/games/constants.js';
import {MatchMakers} from '/imports/api/games/matchMakers.js';
import EloMatchMaker from '/imports/api/games/server/matchMaking/EloMatchMaker.js';
import {Profiles} from '/imports/api/profiles/profiles';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {assert} from 'chai';
import StubCollections from 'meteor/hwillson:stub-collections';
import {Random} from 'meteor/random';

describe('EloMatchMaker', function() {
	const tests = [
		{
			name: 'all different',
			users: [
				{id: 1, name: 'a', eloRating: 800},
				{id: 2, name: 'b', eloRating: 900},
				{id: 3, name: 'c', eloRating: 1000},
				{id: 4, name: 'd', eloRating: 1100},
			],
			expected: [1100, 900, 800, 1000],
		},
		{
			name: 'half and half',
			users: [
				{id: 1, name: 'a', eloRating: 900},
				{id: 2, name: 'b', eloRating: 1100},
				{id: 3, name: 'c', eloRating: 1100},
				{id: 4, name: 'd', eloRating: 900},
			],
			expected: [1100, 900, 900, 1100],
		},
		{
			name: 'all high but one',
			users: [
				{id: 1, name: 'a', eloRating: 1100},
				{id: 2, name: 'b', eloRating: 1100},
				{id: 3, name: 'c', eloRating: 1100},
				{id: 4, name: 'd', eloRating: 900},
			],
			expected: [1100, 1100, 900, 1100],
		},
		{
			name: 'all low but one',
			users: [
				{id: 1, name: 'a', eloRating: 900},
				{id: 2, name: 'b', eloRating: 900},
				{id: 3, name: 'c', eloRating: 900},
				{id: 4, name: 'd', eloRating: 1000},
			],
			expected: [1000, 900, 900, 900],
		},
		{
			name: 'all equal',
			users: [
				{id: 1, name: 'a', eloRating: 1000},
				{id: 2, name: 'b', eloRating: 1000},
				{id: 3, name: 'c', eloRating: 1000},
				{id: 4, name: 'd', eloRating: 1000},
			],
			expected: [1000, 1000, 1000, 1000],
		},
		{
			name: 'first really high',
			users: [
				{id: 1, name: 'a', eloRating: 9999},
				{id: 2, name: 'b', eloRating: 1000},
				{id: 3, name: 'c', eloRating: 1000},
				{id: 4, name: 'd', eloRating: 1000},
			],
			expected: [9999, 1000, 1000, 1000],
		},
		{
			name: 'still 1, 2, 3, 4',
			users: [
				{id: 1, name: 'a', eloRating: 800},
				{id: 2, name: 'b', eloRating: 900},
				{id: 3, name: 'c', eloRating: 1100},
				{id: 4, name: 'd', eloRating: 1000},
			],
			expected: [1100, 900, 800, 1000],
		},
	];

	const tournamentId = Random.id(5);

	before(function() {
		StubCollections.add([Tournaments, Profiles, MatchMakers]);
	});

	beforeEach(function() {
		StubCollections.stub();
		Tournaments.insert({
			_id: tournamentId,
			gameMode : TWO_VS_TWO_GAME_MODE,
			mode: {},
			status: {id: 'approved', name: 'Approved'},
			startDate: '2000-01-01 -04:00',
			endDate: '2900-12-31 -04:00',
		});
	});

	afterEach(function() {
		StubCollections.restore();
	});

	const eloRatingForUser = function(users, id) {
		for (let user of users) {
			if (user.id === id) {
				return user.eloRating;
			}
		}

		return undefined;
	};

	for (let test of tests) {
		it('match 2v2 users depending on their elo scores - ' + test.name, function() {
			const matchMaker = new EloMatchMaker();

			Profiles.insert({userId: test.users[0].id, eloRating: test.users[0].eloRating});
			matchMaker.subscribe(test.users[0], TWO_VS_TWO_GAME_MODE, tournamentId);
			Profiles.insert({userId: test.users[1].id, eloRating: test.users[1].eloRating});
			matchMaker.subscribe(test.users[1], TWO_VS_TWO_GAME_MODE, tournamentId);
			Profiles.insert({userId: test.users[2].id, eloRating: test.users[2].eloRating});
			matchMaker.subscribe(test.users[2], TWO_VS_TWO_GAME_MODE, tournamentId);
			Profiles.insert({userId: test.users[3].id, eloRating: test.users[3].eloRating});
			matchMaker.subscribe(test.users[3], TWO_VS_TWO_GAME_MODE, tournamentId);

			const match = MatchMakers.findOne({modeSelection: TWO_VS_TWO_GAME_MODE, tournamentId: tournamentId});

			assert.isNotNull(match);
			assert.isNotNull(match.matched);
			assert.isArray(match.matched);
			assert.equal(1, match.matched.length);

			const matchedUsers = match.matched[0].users;

			assert.isNotNull(matchedUsers);
			assert.isArray(matchedUsers);
			assert.equal(4, matchedUsers.length);

			assert.equal(test.expected[0], eloRatingForUser(test.users, matchedUsers[0].id));
			assert.equal(test.expected[1], eloRatingForUser(test.users, matchedUsers[1].id));
			assert.equal(test.expected[2], eloRatingForUser(test.users, matchedUsers[2].id));
			assert.equal(test.expected[3], eloRatingForUser(test.users, matchedUsers[3].id));
		});
	}
});
