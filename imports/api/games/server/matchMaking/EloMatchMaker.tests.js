import {TWO_VS_TWO_GAME_MODE} from '/imports/api/games/constants.js';
import {MatchMakers} from '/imports/api/games/matchMakers.js';
import EloMatchMaker from '/imports/api/games/server/matchMaking/EloMatchMaker.js';
import {TournamentProfiles} from '/imports/api/tournaments/tournamentProfiles.js';
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
			expected: [4, 2, 1, 3],
		},
		{
			name: 'half and half',
			users: [
				{id: 1, name: 'a', eloRating: 900},
				{id: 2, name: 'b', eloRating: 1100},
				{id: 3, name: 'c', eloRating: 1100},
				{id: 4, name: 'd', eloRating: 900},
			],
			expected: [3, 4, 1, 2],
		},
		{
			name: 'all high but one',
			users: [
				{id: 1, name: 'a', eloRating: 1100},
				{id: 2, name: 'b', eloRating: 1100},
				{id: 3, name: 'c', eloRating: 1100},
				{id: 4, name: 'd', eloRating: 900},
			],
			expected: [3, 1, 4, 2],
		},
		{
			name: 'all low but one',
			users: [
				{id: 1, name: 'a', eloRating: 900},
				{id: 2, name: 'b', eloRating: 900},
				{id: 3, name: 'c', eloRating: 900},
				{id: 4, name: 'd', eloRating: 1000},
			],
			expected: [4, 2, 1, 3],
		},
		{
			name: 'all equal',
			users: [
				{id: 1, name: 'a', eloRating: 1000},
				{id: 2, name: 'b', eloRating: 1000},
				{id: 3, name: 'c', eloRating: 1000},
				{id: 4, name: 'd', eloRating: 1000},
			],
			expected: [4, 2, 1, 3],
		},
		{
			name: 'first really high',
			users: [
				{id: 1, name: 'a', eloRating: 9999},
				{id: 2, name: 'b', eloRating: 1000},
				{id: 3, name: 'c', eloRating: 1000},
				{id: 4, name: 'd', eloRating: 1000},
			],
			expected: [1, 3, 2, 4],
		},
		{
			name: 'still 1, 2, 3, 4',
			users: [
				{id: 1, name: 'a', eloRating: 800},
				{id: 2, name: 'b', eloRating: 900},
				{id: 3, name: 'c', eloRating: 1100},
				{id: 4, name: 'd', eloRating: 1000},
			],
			expected: [3, 2, 1, 4],
		},
	];

	const tournamentId = Random.id(5);

	before(function() {
		StubCollections.add([Tournaments, TournamentProfiles, MatchMakers]);
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

	for (let test of tests) {
		it('match 2v2 users depending on their elo scores - ' + test.name, function() {
			const matchMaker = new EloMatchMaker();

			TournamentProfiles.insert({tournamentId: tournamentId, userId: test.users[0].id, eloRating: test.users[0].eloRating});
			matchMaker.subscribe(test.users[0].id, test.users[0].name, TWO_VS_TWO_GAME_MODE, tournamentId);
			TournamentProfiles.insert({tournamentId: tournamentId, userId: test.users[1].id, eloRating: test.users[1].eloRating});
			matchMaker.subscribe(test.users[1].id, test.users[1].name, TWO_VS_TWO_GAME_MODE, tournamentId);
			TournamentProfiles.insert({tournamentId: tournamentId, userId: test.users[2].id, eloRating: test.users[2].eloRating});
			matchMaker.subscribe(test.users[2].id, test.users[2].name, TWO_VS_TWO_GAME_MODE, tournamentId);
			TournamentProfiles.insert({tournamentId: tournamentId, userId: test.users[3].id, eloRating: test.users[3].eloRating});
			matchMaker.subscribe(test.users[3].id, test.users[3].name, TWO_VS_TWO_GAME_MODE, tournamentId);

			const match = MatchMakers.findOne({modeSelection: TWO_VS_TWO_GAME_MODE, tournamentId: tournamentId});

			assert.isNotNull(match);
			assert.isNotNull(match.matched);
			assert.isArray(match.matched);
			assert.equal(1, match.matched.length);

			const matchedUsers = match.matched[0].users;

			assert.isNotNull(matchedUsers);
			assert.isArray(matchedUsers);
			assert.equal(4, matchedUsers.length);

			assert.equal(test.expected[0], matchedUsers[0].id);
			assert.equal(test.expected[1], matchedUsers[1].id);
			assert.equal(test.expected[2], matchedUsers[2].id);
			assert.equal(test.expected[3], matchedUsers[3].id);
		});
	}
});
