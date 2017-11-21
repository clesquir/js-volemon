import {assert} from 'chai';
import {resetDatabase} from 'meteor/xolvio:cleaner';
import {Random} from 'meteor/random';
import Snoozer from '/imports/api/achievements/server/listeners/Snoozer.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {ACHIEVEMENT_SNOOZER} from '/imports/api/achievements/constants.js';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';

describe('AchievementListener#Snoozer', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const opponentUserId = Random.id(5);
	const assertSnoozerUserAchievementNumberEquals = function(number) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_SNOOZER, achievement.achievementId);
		assert.strictEqual(number, achievement.number);
	};

	beforeEach(function() {
		resetDatabase();
	});

	afterEach(function() {
		resetDatabase();
	});

	it('creates achievement if not created on player won if has been match point zero if user is host', function() {
		const listener = (new Snoozer()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, maximumPoints: 5});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 4));

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 4));

		assert.equal(1, UserAchievements.find().count());
		assertSnoozerUserAchievementNumberEquals(1);
	});

	it('do not create achievement if not created if has not been match point zero on player won if user is host', function() {
		const listener = (new Snoozer()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, maximumPoints: 5});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 4));
		assert.equal(0, UserAchievements.find().count());
	});

	it('creates achievement if not created on player won if has been match point zero if user is client', function() {
		const listener = (new Snoozer()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: 4, maximumPoints: 5});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onPointTaken(new PointTaken(gameId, 0, false, 4, 0));

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 4));

		assert.equal(1, UserAchievements.find().count());
		assertSnoozerUserAchievementNumberEquals(1);
	});

	it('do not create achievement if not created if has not been match point zero on player won if user is client', function() {
		const listener = (new Snoozer()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: 4, maximumPoints: 5});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onPointTaken(new PointTaken(gameId, 0, false, 1, 0));

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 4));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if not created if not gameId on player won', function() {
		const listener = (new Snoozer()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, maximumPoints: 5});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 4));

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(Random.id(5), userId, 5, 4));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if not created if not userId on player won', function() {
		const listener = (new Snoozer()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, maximumPoints: 5});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(gameId, Random.id(5), 5, 4));
		assert.equal(0, UserAchievements.find().count());
	});

	it('update achievement on player won if has been match point zero if user is host', function() {
		const listener = (new Snoozer()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, maximumPoints: 5});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_SNOOZER, number: 1});

		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 4));
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 4));

		assertSnoozerUserAchievementNumberEquals(2);
	});

	it('do not update achievement if has not been match point zero on player won if user is host', function() {
		const listener = (new Snoozer()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, maximumPoints: 5});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_SNOOZER, number: 1});

		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 4));

		assertSnoozerUserAchievementNumberEquals(1);
	});

	it('update achievement on player won if has been match point zero if user is client', function() {
		const listener = (new Snoozer()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: Random.id(5), maximumPoints: 5});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_SNOOZER, number: 1});

		listener.onPointTaken(new PointTaken(gameId, 0, false, 4, 0));
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 4));

		assertSnoozerUserAchievementNumberEquals(2);
	});

	it('do not update achievement if has not been match point zero on player won if user is client', function() {
		const listener = (new Snoozer()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: Random.id(5), maximumPoints: 5});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_SNOOZER, number: 1});

		listener.onPointTaken(new PointTaken(gameId, 0, false, 1, 0));
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 4));

		assertSnoozerUserAchievementNumberEquals(1);
	});

	it('do not update achievement if not gameId on player won', function() {
		const listener = (new Snoozer()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, maximumPoints: 5});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_SNOOZER, number: 1});

		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 4));
		listener.onPlayerWon(new PlayerWon(Random.id(5), userId, 5, 4));

		assertSnoozerUserAchievementNumberEquals(1);
	});

	it('do not update achievement if not userId on player won', function() {
		const listener = (new Snoozer()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, maximumPoints: 5});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_SNOOZER, number: 1});

		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 4));
		listener.onPlayerWon(new PlayerWon(gameId, Random.id(5), 5, 4));

		assertSnoozerUserAchievementNumberEquals(1);
	});
});
