import {assert} from 'chai';
import {resetDatabase} from 'meteor/xolvio:cleaner';
import {Random} from 'meteor/random';
import IWasThereWaiting from '/imports/api/achievements/server/listeners/IWasThereWaiting.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {ACHIEVEMENT_I_WAS_THERE_WAITING} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import BonusRemoved from '/imports/api/games/events/BonusRemoved.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';
import {BONUS_FREEZE_MONSTER} from '/imports/api/games/bonusConstants.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';

describe('AchievementListener#IWasThereWaiting', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const opponentUserId = Random.id(5);
	const assertIWasThereWaitingUserAchievementNumberEquals = function(number) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_I_WAS_THERE_WAITING, achievement.achievementId);
		assert.strictEqual(number, achievement.number);
	};

	beforeEach(function() {
		resetDatabase();
	});

	afterEach(function() {
		resetDatabase();
	});

	it('increment if current player is paused, point is scored by user and user is host', function() {
		const listener = new IWasThereWaiting(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_FREEZE_MONSTER, {activatedBonusClass: BONUS_FREEZE_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_FREEZE_MONSTER, activatorPlayerKey: 'player1'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));

		assert.equal(1, UserAchievements.find().count());
		assertIWasThereWaitingUserAchievementNumberEquals(1);
	});

	it('increment if current player is paused, point is scored by user and user is client', function() {
		const listener = new IWasThereWaiting(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_FREEZE_MONSTER, {activatedBonusClass: BONUS_FREEZE_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_FREEZE_MONSTER, activatorPlayerKey: 'player2'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));

		assert.equal(1, UserAchievements.find().count());
		assertIWasThereWaitingUserAchievementNumberEquals(1);
	});

	it('do not increment if current player is paused, point is scored by opponent and user is host', function() {
		const listener = new IWasThereWaiting(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_FREEZE_MONSTER, {activatedBonusClass: BONUS_FREEZE_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_FREEZE_MONSTER, activatorPlayerKey: 'player1'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if current player is paused, point is scored by opponent and user is client', function() {
		const listener = new IWasThereWaiting(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_FREEZE_MONSTER, {activatedBonusClass: BONUS_FREEZE_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_FREEZE_MONSTER, activatorPlayerKey: 'player2'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if current player is not paused, point is scored by user and user is host', function() {
		const listener = new IWasThereWaiting(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_FREEZE_MONSTER, {activatedBonusClass: BONUS_FREEZE_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_FREEZE_MONSTER, activatorPlayerKey: 'player2'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if current player is not paused, point is scored by user and user is client', function() {
		const listener = new IWasThereWaiting(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_FREEZE_MONSTER, {activatedBonusClass: BONUS_FREEZE_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_FREEZE_MONSTER, activatorPlayerKey: 'player1'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if current player has caught paused in the point but is not anymore, point is scored by user and user is host', function() {
		const listener = new IWasThereWaiting(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_FREEZE_MONSTER, {activatedBonusClass: BONUS_FREEZE_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_FREEZE_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusRemoved(new BonusRemoved(gameId, BONUS_FREEZE_MONSTER, 'player1', BONUS_FREEZE_MONSTER, 'player1', BONUS_FREEZE_MONSTER));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if current player has caught paused in the point but is not anymore, point is scored by user and user is client', function() {
		const listener = new IWasThereWaiting(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_FREEZE_MONSTER, {activatedBonusClass: BONUS_FREEZE_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_FREEZE_MONSTER, activatorPlayerKey: 'player2'}));
		listener.onBonusRemoved(new BonusRemoved(gameId, BONUS_FREEZE_MONSTER, 'player2', BONUS_FREEZE_MONSTER, 'player2', BONUS_FREEZE_MONSTER));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if current player has caught paused but a point was taken since, point is scored by user and user is host', function() {
		const listener = new IWasThereWaiting(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_FREEZE_MONSTER, {activatedBonusClass: BONUS_FREEZE_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_FREEZE_MONSTER, activatorPlayerKey: 'player1'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(1, UserAchievements.find().count());
		assertIWasThereWaitingUserAchievementNumberEquals(1);

		//Does not increment
		listener.onPointTaken(new PointTaken(gameId, 0, true, 2, 0));
		assert.equal(1, UserAchievements.find().count());
		assertIWasThereWaitingUserAchievementNumberEquals(1);
	});

	it('do not increment if current player has caught paused but a point was taken since, point is scored by user and user is client', function() {
		const listener = new IWasThereWaiting(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_FREEZE_MONSTER, {activatedBonusClass: BONUS_FREEZE_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_FREEZE_MONSTER, activatorPlayerKey: 'player2'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));
		assert.equal(1, UserAchievements.find().count());
		assertIWasThereWaitingUserAchievementNumberEquals(1);

		//Does not increment
		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 2));
		assert.equal(1, UserAchievements.find().count());
		assertIWasThereWaitingUserAchievementNumberEquals(1);
	});
});
