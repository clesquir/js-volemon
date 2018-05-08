import {assert, expect} from 'chai'
import {Random} from 'meteor/random';
import {resetDatabase} from 'meteor/xolvio:cleaner';
import {Games} from '/imports/api/games/games.js';
import {EloScores} from '/imports/api/games/eloscores.js';
import {finishGame} from '/imports/api/games/server/onGameFinished.js';
import {GAME_STATUS_STARTED, GAME_STATUS_FINISHED} from '/imports/api/games/statusConstants.js';
import {Profiles} from '/imports/api/profiles/profiles';
import {TournamentEloScores} from '/imports/api/tournaments/tournamentEloScores.js';
import {TournamentProfiles} from '/imports/api/tournaments/tournamentProfiles.js';

describe('finishGame', function() {
	it('throws 404 if game does not exist', function() {
		expect(() => {
			finishGame(Random.id(5));
		}).to.throw('Game not found');
	});

	it('throws not-allowed if game has not finished with a winner', function() {
		resetDatabase();

		const winnerUserId = Random.id(5);
		Meteor.users.insert({_id: winnerUserId});
		const loserUserId = Random.id(5);
		Meteor.users.insert({_id: loserUserId});
		const gameId = Random.id(5);
		Games.insert({_id: gameId, status: GAME_STATUS_STARTED});

		expect(() => {
			finishGame(gameId, [winnerUserId], [loserUserId]);
		}).to.throw('Game has not finished with a winner');
	});

	it('throws not-allowed if game has no winner user', function() {
		resetDatabase();

		const winnerUserId = Random.id(5);
		const loserUserId = Random.id(5);
		Meteor.users.insert({_id: loserUserId});
		const gameId = Random.id(5);
		Games.insert({_id: gameId, status: GAME_STATUS_FINISHED});

		expect(() => {
			finishGame(gameId, [winnerUserId], [loserUserId]);
		}).to.throw('Winner does not exist');
	});

	it('throws not-allowed if game has no loser user', function() {
		resetDatabase();

		const winnerUserId = Random.id(5);
		Meteor.users.insert({_id: winnerUserId});
		const loserUserId = Random.id(5);
		const gameId = Random.id(5);
		Games.insert({_id: gameId, status: GAME_STATUS_FINISHED});

		expect(() => {
			finishGame(gameId, [winnerUserId], [loserUserId]);
		}).to.throw('Loser does not exist');
	});

	it('updates profiles and eloscores on regular game', function() {
		resetDatabase();

		const gameId = Random.id(5);
		const winnerUserId = Random.id(5);
		Meteor.users.insert({_id: winnerUserId});
		const loserUserId = Random.id(5);
		Meteor.users.insert({_id: loserUserId});
		Games.insert({_id: gameId, status: GAME_STATUS_FINISHED});
		Profiles.insert({
			_id: Random.id(5),
			userId: winnerUserId,
			numberOfWin: 0,
			numberOfLost: 0,
			eloRating: 1000
		});
		Profiles.insert({
			_id: Random.id(5),
			userId: loserUserId,
			numberOfWin: 0,
			numberOfLost: 0,
			eloRating: 1000
		});

		finishGame(gameId, [winnerUserId], [loserUserId]);

		const winnerProfile = Profiles.findOne({userId: winnerUserId});
		assert.isObject(winnerProfile);
		assert.propertyVal(winnerProfile, 'numberOfWin', 1);
		assert.propertyVal(winnerProfile, 'numberOfLost', 0);

		const winnerEloScore = EloScores.findOne({userId: winnerUserId});
		assert.isObject(winnerEloScore);
		assert.propertyVal(winnerEloScore, 'eloRating', 1016);
	});

	it('updates tournamentProfiles and tournamentEloScores on tournament game', function() {
		resetDatabase();

		const gameId = Random.id(5);
		const tournamentId = Random.id(5);
		const winnerUserId = Random.id(5);
		Meteor.users.insert({_id: winnerUserId});
		const loserUserId = Random.id(5);
		Meteor.users.insert({_id: loserUserId});
		Games.insert({
			_id: gameId,
			tournamentId: tournamentId,
			status: GAME_STATUS_FINISHED
		});
		TournamentProfiles.insert({
			_id: Random.id(5),
			userId: winnerUserId,
			tournamentId: tournamentId,
			numberOfWin: 0,
			numberOfLost: 0,
			eloRating: 1000
		});
		TournamentProfiles.insert({
			_id: Random.id(5),
			userId: loserUserId,
			tournamentId: tournamentId,
			numberOfWin: 0,
			numberOfLost: 0,
			eloRating: 1000
		});

		finishGame(gameId, [winnerUserId], [loserUserId]);

		const winnerProfile = TournamentProfiles.findOne({userId: winnerUserId, tournamentId: tournamentId});
		assert.isObject(winnerProfile);
		assert.propertyVal(winnerProfile, 'numberOfWin', 1);
		assert.propertyVal(winnerProfile, 'numberOfLost', 0);

		const winnerEloScore = TournamentEloScores.findOne({userId: winnerUserId, tournamentId: tournamentId});
		assert.isObject(winnerEloScore);
		assert.propertyVal(winnerEloScore, 'eloRating', 1016);
	});
});
