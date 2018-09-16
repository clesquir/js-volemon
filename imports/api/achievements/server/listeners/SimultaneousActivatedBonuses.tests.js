import {ACHIEVEMENT_SIMULTANEOUS_ACTIVATED_BONUSES} from '/imports/api/achievements/constants.js';
import SimultaneousActivatedBonuses from '/imports/api/achievements/server/listeners/SimultaneousActivatedBonuses.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import BonusRemoved from '/imports/api/games/events/BonusRemoved.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';
import {Games} from '/imports/api/games/games.js';
import {assert} from 'chai';
import StubCollections from 'meteor/hwillson:stub-collections';
import {Random} from 'meteor/random';

describe('AchievementListener#SimultaneousActivatedBonuses', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const opponentUserId = Random.id(5);
	const assertSimultaneousActivatedBonusesUserAchievementNumberEquals = function(number) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_SIMULTANEOUS_ACTIVATED_BONUSES, achievement.achievementId);
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

	it('increment if all different bonus', function() {
		const listener = (new SimultaneousActivatedBonuses()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));

		assert.strictEqual(1, listener.numberOfActivatedBonuses());
		assertSimultaneousActivatedBonusesUserAchievementNumberEquals(1);
	});

	it('do not increment if same bonus', function() {
		const listener = (new SimultaneousActivatedBonuses()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));

		assert.strictEqual(1, listener.numberOfActivatedBonuses());
		assert.equal(1, UserAchievements.find().count());
		assertSimultaneousActivatedBonusesUserAchievementNumberEquals(1);

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));

		assert.strictEqual(1, listener.numberOfActivatedBonuses());
		assertSimultaneousActivatedBonusesUserAchievementNumberEquals(1);
	});

	it('do not increment if not gameId', function() {
		const listener = (new SimultaneousActivatedBonuses()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(Random.id(5), 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if target is not current user', function() {
		const listener = (new SimultaneousActivatedBonuses()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player2', bonusClass: 'a', activatorPlayerKey: 'player2'}));
		assert.equal(0, UserAchievements.find().count());
	});

	it('number is reduced when calling remove on existent bonus', function() {
		const listener = (new SimultaneousActivatedBonuses()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));
		assert.strictEqual(1, listener.numberOfActivatedBonuses());

		listener.onBonusRemoved(new BonusRemoved(gameId, 'a', 'player1', 'a', 'player1'));
		assert.strictEqual(0, listener.numberOfActivatedBonuses());
	});

	it('number is not reduced when calling remove on not existent bonus', function() {
		const listener = (new SimultaneousActivatedBonuses()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));
		assert.strictEqual(1, listener.numberOfActivatedBonuses());

		listener.onBonusRemoved(new BonusRemoved(gameId, 'b', 'player1', 'b', 'player1'));
		assert.strictEqual(1, listener.numberOfActivatedBonuses());
	});

	it('do not reduce if not gameId', function() {
		const listener = (new SimultaneousActivatedBonuses()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));
		assert.strictEqual(1, listener.numberOfActivatedBonuses());

		listener.onBonusRemoved(new BonusRemoved(Random.id(5), 'a', 'player1', 'a', 'player1'));
		assert.strictEqual(1, listener.numberOfActivatedBonuses());
	});

	it('do not reduce if target is not current user', function() {
		const listener = (new SimultaneousActivatedBonuses()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));
		assert.strictEqual(1, listener.numberOfActivatedBonuses());

		listener.onBonusRemoved(new BonusRemoved(gameId, 'a', 'player2', 'a', 'player2'));
		assert.strictEqual(1, listener.numberOfActivatedBonuses());
	});

	it('number is 0 on point taken', function() {
		const listener = (new SimultaneousActivatedBonuses()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));
		assert.strictEqual(1, listener.numberOfActivatedBonuses());

		listener.onPointTaken(new PointTaken(gameId, 2000));
		assert.strictEqual(0, listener.numberOfActivatedBonuses());
	});

	it('do not reset if not gameId', function() {
		const listener = (new SimultaneousActivatedBonuses()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));
		assert.strictEqual(1, listener.numberOfActivatedBonuses());

		listener.onPointTaken(new PointTaken(Random.id(5), 2000));
		assert.strictEqual(1, listener.numberOfActivatedBonuses());
	});
});
