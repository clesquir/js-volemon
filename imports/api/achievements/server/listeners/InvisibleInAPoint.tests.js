import {ACHIEVEMENT_INVISIBLE_IN_A_POINT} from '/imports/api/achievements/constants.js';
import InvisibleInAPoint from '/imports/api/achievements/server/listeners/InvisibleInAPoint.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {BONUS_INVISIBLE_MONSTER, BONUS_INVISIBLE_OPPONENT_MONSTER} from '/imports/api/games/bonusConstants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';
import {Games} from '/imports/api/games/games.js';
import {assert} from 'chai';
import StubCollections from 'meteor/hwillson:stub-collections';
import {Random} from 'meteor/random';

describe('AchievementListener#InvisibleInAGame', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const opponentUserId = Random.id(5);
	const assertInvisibleInAPointUserAchievementNumberEquals = function(number) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_INVISIBLE_IN_A_POINT, achievement.achievementId);
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

	it('creates achievement if not created on invisible bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		const listener = (new InvisibleInAPoint()).forGame(gameId, userId);

		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: BONUS_INVISIBLE_MONSTER, targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));

		assert.equal(1, UserAchievements.find().count());
		assertInvisibleInAPointUserAchievementNumberEquals(1);
	});

	it('creates achievement if not created on invisible opponent bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		const listener = (new InvisibleInAPoint()).forGame(gameId, userId);

		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: BONUS_INVISIBLE_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_INVISIBLE_OPPONENT_MONSTER, activatorPlayerKey: 'player2'}));

		assert.equal(1, UserAchievements.find().count());
		assertInvisibleInAPointUserAchievementNumberEquals(1);
	});

	it('do not create achievement if not created if not gameId on invisible bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		const listener = (new InvisibleInAPoint()).forGame(gameId, userId);

		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(Random.id(5), 'a', {activatedBonusClass: BONUS_INVISIBLE_MONSTER, targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if not created if activated bonus is not invisible on bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		const listener = (new InvisibleInAPoint()).forGame(gameId, userId);

		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if not created if current user is not player key on invisible bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		const listener = (new InvisibleInAPoint()).forGame(gameId, userId);

		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: BONUS_INVISIBLE_MONSTER, targetPlayerKey: 'player2', bonusClass: 'a', activatorPlayerKey: 'player2'}));
		assert.equal(0, UserAchievements.find().count());
	});

	it('update achievement if higher on invisible bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_INVISIBLE_IN_A_POINT, number: 1});
		const listener = (new InvisibleInAPoint()).forGame(gameId, userId);

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: BONUS_INVISIBLE_MONSTER, targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));

		assertInvisibleInAPointUserAchievementNumberEquals(1);

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: BONUS_INVISIBLE_MONSTER, targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));

		assertInvisibleInAPointUserAchievementNumberEquals(2);
	});

	it('achievement should be 2 if invisible bonus caught then point is taken then caught twice', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		const listener = (new InvisibleInAPoint()).forGame(gameId, userId);

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: BONUS_INVISIBLE_MONSTER, targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));

		assertInvisibleInAPointUserAchievementNumberEquals(1);

		listener.onPointTaken(new PointTaken(gameId, 2000));

		assertInvisibleInAPointUserAchievementNumberEquals(1);

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: BONUS_INVISIBLE_MONSTER, targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));

		assertInvisibleInAPointUserAchievementNumberEquals(1);

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: BONUS_INVISIBLE_MONSTER, targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));

		assertInvisibleInAPointUserAchievementNumberEquals(2);
	});

	it('do not update achievement if not gameId on invisible bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		const listener = (new InvisibleInAPoint()).forGame(gameId, userId);

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: BONUS_INVISIBLE_MONSTER, targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));

		assertInvisibleInAPointUserAchievementNumberEquals(1);

		listener.onBonusCaught(new BonusCaught(Random.id(5), 'a', {activatedBonusClass: BONUS_INVISIBLE_MONSTER, targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));

		assertInvisibleInAPointUserAchievementNumberEquals(1);
	});

	it('do not update achievement if activated bonus is not invisible on bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		const listener = (new InvisibleInAPoint()).forGame(gameId, userId);

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: BONUS_INVISIBLE_MONSTER, targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));

		assertInvisibleInAPointUserAchievementNumberEquals(1);

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));

		assertInvisibleInAPointUserAchievementNumberEquals(1);
	});

	it('do not update achievement if current user is not player key on invisible bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		const listener = (new InvisibleInAPoint()).forGame(gameId, userId);

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: BONUS_INVISIBLE_MONSTER, targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));

		assertInvisibleInAPointUserAchievementNumberEquals(1);

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: BONUS_INVISIBLE_MONSTER, targetPlayerKey: 'player2', bonusClass: 'a', activatorPlayerKey: 'player2'}));

		assertInvisibleInAPointUserAchievementNumberEquals(1);
	});
});
