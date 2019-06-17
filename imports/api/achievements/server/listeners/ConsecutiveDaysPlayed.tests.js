import {ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED} from '/imports/api/achievements/constants.js';
import ConsecutiveDaysPlayed from '/imports/api/achievements/server/listeners/ConsecutiveDaysPlayed.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import GameFinished from '/imports/api/games/events/GameFinished.js';
import {Games} from '/imports/api/games/games.js';
import {assert} from 'chai';
import StubCollections from 'meteor/hwillson:stub-collections';
import {Random} from 'meteor/random';
import sinon from 'sinon';

describe('AchievementListener#ConsecutiveDaysPlayed', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const assertConsecutiveDaysPlayedUserAchievementValuesEqual = function(number, lastDatePlayed, numberSinceLastReset) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED, achievement.achievementId);
		assert.strictEqual(number, achievement.number);
		assert.strictEqual(lastDatePlayed, achievement.lastDatePlayed);
		assert.strictEqual(numberSinceLastReset, achievement.numberSinceLastReset);
	};
	const stubTodaysDate = function(listener, lastDatePlayed) {
		stub = sinon.stub(listener, 'todaysDate').callsFake(function() {
			return lastDatePlayed;
		});
	};
	let stub;

	before(function() {
		StubCollections.add([Games, UserAchievements]);
	});

	beforeEach(function() {
		StubCollections.stub();
	});

	afterEach(function() {
		if (stub) {
			stub.restore();
			stub = null;
		}
		StubCollections.restore();
	});

	it('creates achievement if not created', function() {
		Games.insert({_id: gameId, players: [{id: userId}]});
		let lastDatePlayed = Date.UTC(2017, 0, 1).valueOf();
		const listener = (new ConsecutiveDaysPlayed()).forGame(gameId, userId);
		stubTodaysDate(listener, lastDatePlayed);

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 2000));

		assert.equal(1, UserAchievements.find().count());
		assertConsecutiveDaysPlayedUserAchievementValuesEqual(1, lastDatePlayed, 1);
	});

	it('do not create achievement if not gameId', function() {
		const listener = (new ConsecutiveDaysPlayed()).forGame(gameId, userId);
		Games.insert({_id: gameId, players: [{id: userId}]});

		listener.onGameFinished(new GameFinished(Random.id(5), 2000));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if user is not in game', function() {
		Games.insert({_id: gameId, players: [{id: Random.id(5)}]});
		const listener = (new ConsecutiveDaysPlayed()).forGame(gameId, userId);
		listener.onGameFinished(new GameFinished(gameId, 2000));
		assert.equal(0, UserAchievements.find().count());
	});

	it('increment achievement if last increment was yesterday', function() {
		Games.insert({_id: gameId, players: [{id: userId}]});
		let lastDatePlayed = Date.UTC(2017, 0, 1).valueOf();
		let listener = (new ConsecutiveDaysPlayed()).forGame(gameId, userId);
		stubTodaysDate(listener, lastDatePlayed);

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 2000));

		assert.equal(1, UserAchievements.find().count());
		assertConsecutiveDaysPlayedUserAchievementValuesEqual(1, lastDatePlayed, 1);

		lastDatePlayed = Date.UTC(2017, 0, 2).valueOf();
		listener = (new ConsecutiveDaysPlayed()).forGame(gameId, userId);
		stubTodaysDate(listener, lastDatePlayed);

		listener.onGameFinished(new GameFinished(gameId, 2000));

		assertConsecutiveDaysPlayedUserAchievementValuesEqual(2, lastDatePlayed, 2);
	});

	it('do not reset nor increase achievement if last increment was today', function() {
		Games.insert({_id: gameId, players: [{id: userId}]});
		let lastDatePlayed = Date.UTC(2017, 0, 1).valueOf();
		let listener = (new ConsecutiveDaysPlayed()).forGame(gameId, userId);
		stubTodaysDate(listener, lastDatePlayed);

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 2000));

		assert.equal(1, UserAchievements.find().count());
		assertConsecutiveDaysPlayedUserAchievementValuesEqual(1, lastDatePlayed, 1);

		listener = (new ConsecutiveDaysPlayed()).forGame(gameId, userId);
		stubTodaysDate(listener, lastDatePlayed);

		listener.onGameFinished(new GameFinished(gameId, 2000));

		assertConsecutiveDaysPlayedUserAchievementValuesEqual(1, lastDatePlayed, 1);
	});

	it('reset achievement if last increment was before yesterday', function() {
		Games.insert({_id: gameId, players: [{id: userId}]});
		let lastDatePlayed = Date.UTC(2017, 0, 1).valueOf();
		let listener = (new ConsecutiveDaysPlayed()).forGame(gameId, userId);
		stubTodaysDate(listener, lastDatePlayed);

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 2000));

		assert.equal(1, UserAchievements.find().count());
		assertConsecutiveDaysPlayedUserAchievementValuesEqual(1, lastDatePlayed, 1);

		lastDatePlayed = Date.UTC(2017, 0, 3).valueOf();
		listener = (new ConsecutiveDaysPlayed()).forGame(gameId, userId);
		stubTodaysDate(listener, lastDatePlayed);

		listener.onGameFinished(new GameFinished(gameId, 2000));

		assertConsecutiveDaysPlayedUserAchievementValuesEqual(1, lastDatePlayed, 1);
	});

	it('do not increment achievement if consecutive days have already been higher', function() {
		Games.insert({_id: gameId, players: [{id: userId}]});
		let lastDatePlayed = Date.UTC(2017, 0, 1).valueOf();
		let listener = (new ConsecutiveDaysPlayed()).forGame(gameId, userId);
		stubTodaysDate(listener, lastDatePlayed);

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 2000));

		assert.equal(1, UserAchievements.find().count());
		assertConsecutiveDaysPlayedUserAchievementValuesEqual(1, lastDatePlayed, 1);

		lastDatePlayed = Date.UTC(2017, 0, 2).valueOf();
		listener = (new ConsecutiveDaysPlayed()).forGame(gameId, userId);
		stubTodaysDate(listener, lastDatePlayed);

		listener.onGameFinished(new GameFinished(gameId, 2000));

		assertConsecutiveDaysPlayedUserAchievementValuesEqual(2, lastDatePlayed, 2);

		lastDatePlayed = Date.UTC(2017, 0, 4).valueOf();
		listener = (new ConsecutiveDaysPlayed()).forGame(gameId, userId);
		stubTodaysDate(listener, lastDatePlayed);

		listener.onGameFinished(new GameFinished(gameId, 2000));

		assertConsecutiveDaysPlayedUserAchievementValuesEqual(2, lastDatePlayed, 1);

		lastDatePlayed = Date.UTC(2017, 0, 5).valueOf();
		listener = (new ConsecutiveDaysPlayed()).forGame(gameId, userId);
		stubTodaysDate(listener, lastDatePlayed);

		listener.onGameFinished(new GameFinished(gameId, 2000));

		assertConsecutiveDaysPlayedUserAchievementValuesEqual(2, lastDatePlayed, 2);
	});
});
