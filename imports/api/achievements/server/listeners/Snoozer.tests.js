import {ACHIEVEMENT_SNOOZER} from '/imports/api/achievements/constants.js';
import Snoozer from '/imports/api/achievements/server/listeners/Snoozer.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';
import OneVersusOneStartedGameFixture from '/imports/api/games/fixture/OneVersusOneStartedGameFixture.js';
import {assert} from 'chai';
import {Random} from 'meteor/random';
import {resetDatabase} from 'meteor/xolvio:cleaner';

describe('AchievementListener#Snoozer', function() {
	const assertSnoozerUserAchievementNumberEquals = function(userId, number) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_SNOOZER, achievement.achievementId);
		assert.strictEqual(number, achievement.number);
	};

	beforeEach(function() {
		resetDatabase();
	});

	it('creates achievement if not created on player won if has been match point zero if user is host', function() {
		const gameFixture = OneVersusOneStartedGameFixture.create();
		const listener = (new Snoozer()).forGame(gameFixture.gameId, gameFixture.creatorUserId);

		listener.onPointTaken(new PointTaken(gameFixture.gameId, 0, false, 0, 4));

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(gameFixture.gameId, gameFixture.creatorUserId, 5, 4));

		assert.equal(1, UserAchievements.find().count());
		assertSnoozerUserAchievementNumberEquals(gameFixture.creatorUserId, 1);
	});

	it('do not create achievement if not created if has not been match point zero on player won if user is host', function() {
		const gameFixture = OneVersusOneStartedGameFixture.create();
		const listener = (new Snoozer()).forGame(gameFixture.gameId, gameFixture.creatorUserId);

		listener.onPointTaken(new PointTaken(gameFixture.gameId, 0, false, 0, 1));

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(gameFixture.gameId, gameFixture.creatorUserId, 5, 4));
		assert.equal(0, UserAchievements.find().count());
	});

	it('creates achievement if not created on player won if has been match point zero if user is client', function() {
		const gameFixture = OneVersusOneStartedGameFixture.create();
		const listener = (new Snoozer()).forGame(gameFixture.gameId, gameFixture.opponentUserId);

		listener.onPointTaken(new PointTaken(gameFixture.gameId, 0, false, 4, 0));

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(gameFixture.gameId, gameFixture.opponentUserId, 5, 4));

		assert.equal(1, UserAchievements.find().count());
		assertSnoozerUserAchievementNumberEquals(gameFixture.opponentUserId, 1);
	});

	it('do not create achievement if not created if has not been match point zero on player won if user is client', function() {
		const gameFixture = OneVersusOneStartedGameFixture.create();
		const listener = (new Snoozer()).forGame(gameFixture.gameId, gameFixture.opponentUserId);

		listener.onPointTaken(new PointTaken(gameFixture.gameId, 0, false, 1, 0));

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(gameFixture.gameId, gameFixture.opponentUserId, 5, 4));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if not created if not gameId on player won', function() {
		const gameFixture = OneVersusOneStartedGameFixture.create();
		const listener = (new Snoozer()).forGame(gameFixture.gameId, gameFixture.creatorUserId);

		listener.onPointTaken(new PointTaken(gameFixture.gameId, 0, false, 0, 4));

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(Random.id(5), gameFixture.creatorUserId, 5, 4));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if not created if not userId on player won', function() {
		const gameFixture = OneVersusOneStartedGameFixture.create();
		const listener = (new Snoozer()).forGame(gameFixture.gameId, gameFixture.creatorUserId);

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(gameFixture.gameId, Random.id(5), 5, 4));
		assert.equal(0, UserAchievements.find().count());
	});

	it('update achievement on player won if has been match point zero if user is host', function() {
		const gameFixture = OneVersusOneStartedGameFixture.create();
		const listener = (new Snoozer()).forGame(gameFixture.gameId, gameFixture.creatorUserId);
		UserAchievements.insert({userId: gameFixture.creatorUserId, achievementId: ACHIEVEMENT_SNOOZER, number: 1});

		listener.onPointTaken(new PointTaken(gameFixture.gameId, 0, false, 0, 4));
		listener.onPlayerWon(new PlayerWon(gameFixture.gameId, gameFixture.creatorUserId, 5, 4));

		assertSnoozerUserAchievementNumberEquals(gameFixture.creatorUserId, 2);
	});

	it('do not update achievement if has not been match point zero on player won if user is host', function() {
		const gameFixture = OneVersusOneStartedGameFixture.create();
		const listener = (new Snoozer()).forGame(gameFixture.gameId, gameFixture.creatorUserId);
		UserAchievements.insert({userId: gameFixture.creatorUserId, achievementId: ACHIEVEMENT_SNOOZER, number: 1});

		listener.onPointTaken(new PointTaken(gameFixture.gameId, 0, false, 0, 1));
		listener.onPlayerWon(new PlayerWon(gameFixture.gameId, gameFixture.creatorUserId, 5, 4));

		assertSnoozerUserAchievementNumberEquals(gameFixture.creatorUserId, 1);
	});

	it('update achievement on player won if has been match point zero if user is client', function() {
		const gameFixture = OneVersusOneStartedGameFixture.create();
		const listener = (new Snoozer()).forGame(gameFixture.gameId, gameFixture.opponentUserId);
		UserAchievements.insert({userId: gameFixture.opponentUserId, achievementId: ACHIEVEMENT_SNOOZER, number: 1});

		listener.onPointTaken(new PointTaken(gameFixture.gameId, 0, false, 4, 0));
		listener.onPlayerWon(new PlayerWon(gameFixture.gameId, gameFixture.opponentUserId, 5, 4));

		assertSnoozerUserAchievementNumberEquals(gameFixture.opponentUserId, 2);
	});

	it('do not update achievement if has not been match point zero on player won if user is client', function() {
		const gameFixture = OneVersusOneStartedGameFixture.create();
		const listener = (new Snoozer()).forGame(gameFixture.gameId, gameFixture.opponentUserId);
		UserAchievements.insert({userId: gameFixture.opponentUserId, achievementId: ACHIEVEMENT_SNOOZER, number: 1});

		listener.onPointTaken(new PointTaken(gameFixture.gameId, 0, false, 1, 0));
		listener.onPlayerWon(new PlayerWon(gameFixture.gameId, gameFixture.opponentUserId, 5, 4));

		assertSnoozerUserAchievementNumberEquals(gameFixture.opponentUserId, 1);
	});

	it('do not update achievement if not gameId on player won', function() {
		const gameFixture = OneVersusOneStartedGameFixture.create();
		const listener = (new Snoozer()).forGame(gameFixture.gameId, gameFixture.creatorUserId);
		UserAchievements.insert({userId: gameFixture.creatorUserId, achievementId: ACHIEVEMENT_SNOOZER, number: 1});

		listener.onPointTaken(new PointTaken(gameFixture.gameId, 0, false, 0, 4));
		listener.onPlayerWon(new PlayerWon(Random.id(5), gameFixture.creatorUserId, 5, 4));

		assertSnoozerUserAchievementNumberEquals(gameFixture.creatorUserId, 1);
	});

	it('do not update achievement if not userId on player won', function() {
		const gameFixture = OneVersusOneStartedGameFixture.create();
		const listener = (new Snoozer()).forGame(gameFixture.gameId, gameFixture.creatorUserId);
		UserAchievements.insert({userId: gameFixture.creatorUserId, achievementId: ACHIEVEMENT_SNOOZER, number: 1});

		listener.onPointTaken(new PointTaken(gameFixture.gameId, 0, false, 0, 4));
		listener.onPlayerWon(new PlayerWon(gameFixture.gameId, Random.id(5), 5, 4));

		assertSnoozerUserAchievementNumberEquals(gameFixture.creatorUserId, 1);
	});
});
