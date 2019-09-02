import {ACHIEVEMENT_GAME_TIME} from '/imports/api/achievements/constants.js';
import GameTime from '/imports/api/achievements/server/listeners/GameTime.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import GameFinished from '/imports/api/games/events/GameFinished';
import {Games} from '/imports/api/games/games.js';
import {assert} from 'chai';
import StubCollections from 'meteor/hwillson:stub-collections';
import {Random} from 'meteor/random';

describe('AchievementListener#GameTime', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const opponentUserId = Random.id(5);
	const assertGameTimeUserAchievementNumberEquals = function(number) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_GAME_TIME, achievement.achievementId);
		assert.strictEqual(number, achievement.number);
	};

	before(function() {
		StubCollections.add([Games, UserAchievements]);
	});

	beforeEach(function() {
		StubCollections.stub();
	});

	afterEach(function() {
		StubCollections.restore();
	});

	it('creates achievement if not created on game finished', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		assert.equal(0, UserAchievements.find().count());
		const listener = (new GameTime()).forGame(gameId, userId);
		listener.onGameFinished(new GameFinished(gameId, 2000));

		assert.equal(1, UserAchievements.find().count());
		assertGameTimeUserAchievementNumberEquals(2000);
	});

	it('do not create achievement if not created if not gameId on game finished', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		assert.equal(0, UserAchievements.find().count());
		const listener = (new GameTime()).forGame(gameId, userId);
		listener.onGameFinished(new GameFinished(Random.id(5), 2000));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if not created if current user is not game player on game finished', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: Random.id(5)}, {id: opponentUserId}]});

		assert.equal(0, UserAchievements.find().count());
		const listener = (new GameTime()).forGame(gameId, userId);
		listener.onGameFinished(new GameFinished(gameId, 2000));
		assert.equal(0, UserAchievements.find().count());
	});

	it('update achievement if higher on game finished', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_GAME_TIME, number: 2000});

		const listener = (new GameTime()).forGame(gameId, userId);
		listener.onGameFinished(new GameFinished(gameId, 3000));

		assertGameTimeUserAchievementNumberEquals(3000);
	});

	it('do not update achievement if not higher on game finished', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_GAME_TIME, number: 2000});

		const listener = (new GameTime()).forGame(gameId, userId);
		listener.onGameFinished(new GameFinished(gameId, 1500));

		assertGameTimeUserAchievementNumberEquals(2000);
	});

	it('do not update achievement if not gameId on game finished', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_GAME_TIME, number: 2000});

		const listener = (new GameTime()).forGame(gameId, userId);
		listener.onGameFinished(new GameFinished(Random.id(5), 3000));

		assertGameTimeUserAchievementNumberEquals(2000);
	});

	it('do not update achievement if current user is not game player on game finished', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: Random.id(5)}, {id: opponentUserId}]});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_GAME_TIME, number: 2000});

		const listener = (new GameTime()).forGame(gameId, userId);
		listener.onGameFinished(new GameFinished(gameId, 3000));

		assertGameTimeUserAchievementNumberEquals(2000);
	});
});
