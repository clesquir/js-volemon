import {ACHIEVEMENT_SNOOZER} from '/imports/api/achievements/constants.js';
import Snoozer from '/imports/api/achievements/server/listeners/Snoozer.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import PlayerWon from '/imports/api/games/events/PlayerWon';
import PointTaken from '/imports/api/games/events/PointTaken';
import {Games} from '/imports/api/games/games.js';
import {assert} from 'chai';
import StubCollections from 'meteor/hwillson:stub-collections';
import {Random} from 'meteor/random';

describe('AchievementListener#Snoozer', function() {
	const assertSnoozerUserAchievementNumberEquals = function(userId, number) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_SNOOZER, achievement.achievementId);
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

	it('creates achievement if not created on player won if has been match point zero if user is host', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, forfeitMinimumPoints: 3, maximumPoints: 5, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new Snoozer()).forGame(gameId, creatorUserId);

		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 4));

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(gameId, creatorUserId, 5, 4));

		assert.equal(1, UserAchievements.find().count());
		assertSnoozerUserAchievementNumberEquals(creatorUserId, 1);
	});

	it('do not create achievement if not created if has not been match point zero on player won if user is host', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, forfeitMinimumPoints: 3, maximumPoints: 5, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new Snoozer()).forGame(gameId, creatorUserId);

		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(gameId, creatorUserId, 5, 4));
		assert.equal(0, UserAchievements.find().count());
	});

	it('creates achievement if not created on player won if has been match point zero if user is client', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, forfeitMinimumPoints: 3, maximumPoints: 5, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new Snoozer()).forGame(gameId, opponentUserId);

		listener.onPointTaken(new PointTaken(gameId, 0, false, 4, 0));

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(gameId, opponentUserId, 5, 4));

		assert.equal(1, UserAchievements.find().count());
		assertSnoozerUserAchievementNumberEquals(opponentUserId, 1);
	});

	it('do not create achievement if not created if has not been match point zero on player won if user is client', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, forfeitMinimumPoints: 3, maximumPoints: 5, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new Snoozer()).forGame(gameId, opponentUserId);

		listener.onPointTaken(new PointTaken(gameId, 0, false, 1, 0));

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(gameId, opponentUserId, 5, 4));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if not created if not gameId on player won', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, forfeitMinimumPoints: 3, maximumPoints: 5, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new Snoozer()).forGame(gameId, creatorUserId);

		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 4));

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(Random.id(5), creatorUserId, 5, 4));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if not created if not userId on player won', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, forfeitMinimumPoints: 3, maximumPoints: 5, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new Snoozer()).forGame(gameId, creatorUserId);

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(gameId, Random.id(5), 5, 4));
		assert.equal(0, UserAchievements.find().count());
	});

	it('update achievement on player won if has been match point zero if user is host', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, forfeitMinimumPoints: 3, maximumPoints: 5, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new Snoozer()).forGame(gameId, creatorUserId);
		UserAchievements.insert({userId: creatorUserId, achievementId: ACHIEVEMENT_SNOOZER, number: 1});

		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 4));
		listener.onPlayerWon(new PlayerWon(gameId, creatorUserId, 5, 4));

		assertSnoozerUserAchievementNumberEquals(creatorUserId, 2);
	});

	it('do not update achievement if has not been match point zero on player won if user is host', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, forfeitMinimumPoints: 3, maximumPoints: 5, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new Snoozer()).forGame(gameId, creatorUserId);
		UserAchievements.insert({userId: creatorUserId, achievementId: ACHIEVEMENT_SNOOZER, number: 1});

		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));
		listener.onPlayerWon(new PlayerWon(gameId, creatorUserId, 5, 4));

		assertSnoozerUserAchievementNumberEquals(creatorUserId, 1);
	});

	it('update achievement on player won if has been match point zero if user is client', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, forfeitMinimumPoints: 3, maximumPoints: 5, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new Snoozer()).forGame(gameId, opponentUserId);
		UserAchievements.insert({userId: opponentUserId, achievementId: ACHIEVEMENT_SNOOZER, number: 1});

		listener.onPointTaken(new PointTaken(gameId, 0, false, 4, 0));
		listener.onPlayerWon(new PlayerWon(gameId, opponentUserId, 5, 4));

		assertSnoozerUserAchievementNumberEquals(opponentUserId, 2);
	});

	it('do not update achievement if has not been match point zero on player won if user is client', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, forfeitMinimumPoints: 3, maximumPoints: 5, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new Snoozer()).forGame(gameId, opponentUserId);
		UserAchievements.insert({userId: opponentUserId, achievementId: ACHIEVEMENT_SNOOZER, number: 1});

		listener.onPointTaken(new PointTaken(gameId, 0, false, 1, 0));
		listener.onPlayerWon(new PlayerWon(gameId, opponentUserId, 5, 4));

		assertSnoozerUserAchievementNumberEquals(opponentUserId, 1);
	});

	it('do not update achievement if not gameId on player won', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, forfeitMinimumPoints: 3, maximumPoints: 5, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new Snoozer()).forGame(gameId, creatorUserId);
		UserAchievements.insert({userId: creatorUserId, achievementId: ACHIEVEMENT_SNOOZER, number: 1});

		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 4));
		listener.onPlayerWon(new PlayerWon(Random.id(5), creatorUserId, 5, 4));

		assertSnoozerUserAchievementNumberEquals(creatorUserId, 1);
	});

	it('do not update achievement if not userId on player won', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, forfeitMinimumPoints: 3, maximumPoints: 5, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new Snoozer()).forGame(gameId, creatorUserId);
		UserAchievements.insert({userId: creatorUserId, achievementId: ACHIEVEMENT_SNOOZER, number: 1});

		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 4));
		listener.onPlayerWon(new PlayerWon(gameId, Random.id(5), 5, 4));

		assertSnoozerUserAchievementNumberEquals(creatorUserId, 1);
	});
});
