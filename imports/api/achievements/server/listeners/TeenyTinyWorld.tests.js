import {ACHIEVEMENT_TEENY_TINY_WORLD} from '/imports/api/achievements/constants.js';
import TeenyTinyWorld from '/imports/api/achievements/server/listeners/TeenyTinyWorld.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {BONUS_SMALL_BALL, BONUS_SMALL_MONSTER} from '/imports/api/games/bonusConstants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import BonusRemoved from '/imports/api/games/events/BonusRemoved.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {assert} from 'chai';
import {Random} from 'meteor/random';
import {resetDatabase} from 'meteor/xolvio:cleaner';

describe('AchievementListener#TeenyTinyWorld', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const opponentUserId = Random.id(5);
	const assertTeenyTinyWorldUserAchievementNumberEquals = function(number) {
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
		const listener = (new TeenyTinyWorld()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_BALL, {activatedBonusClass: BONUS_SMALL_BALL, bonusClass: BONUS_SMALL_BALL}));
		assert.equal(1, UserAchievements.find().count());
		assertTeenyTinyWorldUserAchievementNumberEquals(1);

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		assertTeenyTinyWorldUserAchievementNumberEquals(1);
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		assertTeenyTinyWorldUserAchievementNumberEquals(1);
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_BALL, {activatedBonusClass: BONUS_SMALL_BALL, bonusClass: BONUS_SMALL_BALL}));
		assertTeenyTinyWorldUserAchievementNumberEquals(2);

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_BALL, {activatedBonusClass: BONUS_SMALL_BALL, bonusClass: BONUS_SMALL_BALL}));
		assertTeenyTinyWorldUserAchievementNumberEquals(2);
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		assertTeenyTinyWorldUserAchievementNumberEquals(2);
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		assertTeenyTinyWorldUserAchievementNumberEquals(3);

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_BALL, {activatedBonusClass: BONUS_SMALL_BALL, bonusClass: BONUS_SMALL_BALL}));
		assertTeenyTinyWorldUserAchievementNumberEquals(3);
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		assertTeenyTinyWorldUserAchievementNumberEquals(3);
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		assertTeenyTinyWorldUserAchievementNumberEquals(4);
	});

	it('do not increment if all small monsters and small ball have been caught in the point but are not anymore simultaneously', function() {
		const listener = (new TeenyTinyWorld()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusRemoved(new BonusRemoved(gameId, BONUS_SMALL_MONSTER, 'player1', BONUS_SMALL_MONSTER, 'player1', BONUS_SMALL_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		listener.onBonusRemoved(new BonusRemoved(gameId, BONUS_SMALL_MONSTER, 'player2', BONUS_SMALL_MONSTER, 'player2', BONUS_SMALL_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_BALL, {activatedBonusClass: BONUS_SMALL_BALL, bonusClass: BONUS_SMALL_BALL}));
		listener.onBonusRemoved(new BonusRemoved(gameId, BONUS_SMALL_BALL, 'player2', BONUS_SMALL_BALL, 'player2', BONUS_SMALL_BALL));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		listener.onBonusRemoved(new BonusRemoved(gameId, BONUS_SMALL_MONSTER, 'player2', BONUS_SMALL_MONSTER, 'player2', BONUS_SMALL_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusRemoved(new BonusRemoved(gameId, BONUS_SMALL_MONSTER, 'player1', BONUS_SMALL_MONSTER, 'player1', BONUS_SMALL_MONSTER));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if all small monsters and small ball have been caught in the point but points have been scored in between', function() {
		const listener = (new TeenyTinyWorld()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_BALL, {activatedBonusClass: BONUS_SMALL_BALL, bonusClass: BONUS_SMALL_BALL}));
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());
	});
});
