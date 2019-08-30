import {ACHIEVEMENT_BONUSES_IN_A_LIFETIME} from '/imports/api/achievements/constants.js';
import BonusesInALifetime from '/imports/api/achievements/server/listeners/BonusesInALifetime.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import BonusCaught from '/imports/api/games/events/BonusCaught';
import {Games} from '/imports/api/games/games.js';
import {assert} from 'chai';
import StubCollections from 'meteor/hwillson:stub-collections';
import {Random} from 'meteor/random';

describe('AchievementListener#BonusesInALifetime', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const opponentUserId = Random.id(5);
	const listener = (new BonusesInALifetime()).forGame(gameId, userId);
	const assertBonusesInALifetimeUserAchievementNumberEquals = function(number) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_BONUSES_IN_A_LIFETIME, achievement.achievementId);
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

	it('creates achievement with 1 if not created on bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));

		assert.equal(1, UserAchievements.find().count());
		assertBonusesInALifetimeUserAchievementNumberEquals(1);
	});

	it('do not create achievement if not created if not gameId on bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(Random.id(5), 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if not created if player key is not the current user on bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player2', bonusClass: 'a', activatorPlayerKey: 'player2'}));
		assert.equal(0, UserAchievements.find().count());
	});

	it('increment achievement on bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_BONUSES_IN_A_LIFETIME, number: 1});

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));

		assertBonusesInALifetimeUserAchievementNumberEquals(2);
	});

	it('do not increment achievement if not gameId on bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_BONUSES_IN_A_LIFETIME, number: 1});

		listener.onBonusCaught(new BonusCaught(Random.id(5), 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));

		assertBonusesInALifetimeUserAchievementNumberEquals(1);
	});

	it('do not increment achievement if player key is not the current user on bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_BONUSES_IN_A_LIFETIME, number: 1});

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player2', bonusClass: 'a', activatorPlayerKey: 'player2'}));

		assertBonusesInALifetimeUserAchievementNumberEquals(1);
	});
});
