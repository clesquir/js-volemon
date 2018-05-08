import {ACHIEVEMENT_TEENY_TINY_WORLD} from '/imports/api/achievements/constants.js';
import TeenyTinyWorld from '/imports/api/achievements/server/listeners/TeenyTinyWorld.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {BONUS_SMALL_BALL, BONUS_SMALL_MONSTER} from '/imports/api/games/bonusConstants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import BonusRemoved from '/imports/api/games/events/BonusRemoved.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';
import OneVersusOneStartedGameFixture from '/imports/api/games/fixture/OneVersusOneStartedGameFixture.js';
import {assert} from 'chai';
import {resetDatabase} from 'meteor/xolvio:cleaner';

describe('AchievementListener#TeenyTinyWorld', function() {
	const assertTeenyTinyWorldUserAchievementNumberEquals = function(userId, number) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_TEENY_TINY_WORLD, achievement.achievementId);
		assert.strictEqual(number, achievement.number);
	};

	beforeEach(function() {
		resetDatabase();
	});

	it('increment if both players are small monsters, ball is small in all orders', function() {
		const gameFixture = OneVersusOneStartedGameFixture.create();
		const listener = (new TeenyTinyWorld()).forGame(gameFixture.gameId, gameFixture.creatorUserId);

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, BONUS_SMALL_BALL, {activatedBonusClass: BONUS_SMALL_BALL, bonusClass: BONUS_SMALL_BALL}));
		assert.equal(1, UserAchievements.find().count());
		assertTeenyTinyWorldUserAchievementNumberEquals(gameFixture.creatorUserId, 1);

		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		assertTeenyTinyWorldUserAchievementNumberEquals(gameFixture.creatorUserId, 1);
		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		assertTeenyTinyWorldUserAchievementNumberEquals(gameFixture.creatorUserId, 1);
		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, BONUS_SMALL_BALL, {activatedBonusClass: BONUS_SMALL_BALL, bonusClass: BONUS_SMALL_BALL}));
		assertTeenyTinyWorldUserAchievementNumberEquals(gameFixture.creatorUserId, 2);

		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, BONUS_SMALL_BALL, {activatedBonusClass: BONUS_SMALL_BALL, bonusClass: BONUS_SMALL_BALL}));
		assertTeenyTinyWorldUserAchievementNumberEquals(gameFixture.creatorUserId, 2);
		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		assertTeenyTinyWorldUserAchievementNumberEquals(gameFixture.creatorUserId, 2);
		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		assertTeenyTinyWorldUserAchievementNumberEquals(gameFixture.creatorUserId, 3);

		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, BONUS_SMALL_BALL, {activatedBonusClass: BONUS_SMALL_BALL, bonusClass: BONUS_SMALL_BALL}));
		assertTeenyTinyWorldUserAchievementNumberEquals(gameFixture.creatorUserId, 3);
		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		assertTeenyTinyWorldUserAchievementNumberEquals(gameFixture.creatorUserId, 3);
		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		assertTeenyTinyWorldUserAchievementNumberEquals(gameFixture.creatorUserId, 4);
	});

	it('do not increment if all small monsters and small ball have been caught in the point but are not anymore simultaneously', function() {
		const gameFixture = OneVersusOneStartedGameFixture.create();
		const listener = (new TeenyTinyWorld()).forGame(gameFixture.gameId, gameFixture.creatorUserId);

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusRemoved(new BonusRemoved(gameFixture.gameId, BONUS_SMALL_MONSTER, 'player1', BONUS_SMALL_MONSTER, 'player1', BONUS_SMALL_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		listener.onBonusRemoved(new BonusRemoved(gameFixture.gameId, BONUS_SMALL_MONSTER, 'player2', BONUS_SMALL_MONSTER, 'player2', BONUS_SMALL_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, BONUS_SMALL_BALL, {activatedBonusClass: BONUS_SMALL_BALL, bonusClass: BONUS_SMALL_BALL}));
		listener.onBonusRemoved(new BonusRemoved(gameFixture.gameId, BONUS_SMALL_BALL, 'player2', BONUS_SMALL_BALL, 'player2', BONUS_SMALL_BALL));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		listener.onBonusRemoved(new BonusRemoved(gameFixture.gameId, BONUS_SMALL_MONSTER, 'player2', BONUS_SMALL_MONSTER, 'player2', BONUS_SMALL_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusRemoved(new BonusRemoved(gameFixture.gameId, BONUS_SMALL_MONSTER, 'player1', BONUS_SMALL_MONSTER, 'player1', BONUS_SMALL_MONSTER));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if all small monsters and small ball have been caught in the point but points have been scored in between', function() {
		const gameFixture = OneVersusOneStartedGameFixture.create();
		const listener = (new TeenyTinyWorld()).forGame(gameFixture.gameId, gameFixture.creatorUserId);

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onPointTaken(new PointTaken(gameFixture.gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		listener.onPointTaken(new PointTaken(gameFixture.gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, BONUS_SMALL_BALL, {activatedBonusClass: BONUS_SMALL_BALL, bonusClass: BONUS_SMALL_BALL}));
		listener.onPointTaken(new PointTaken(gameFixture.gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		listener.onPointTaken(new PointTaken(gameFixture.gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onPointTaken(new PointTaken(gameFixture.gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());
	});
});
