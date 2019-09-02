import {ACHIEVEMENT_I_WAS_THERE_WAITING} from '/imports/api/achievements/constants.js';
import IWasThereWaiting from '/imports/api/achievements/server/listeners/IWasThereWaiting.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {BONUS_FREEZE_MONSTER} from '/imports/api/games/bonusConstants';
import BonusCaught from '/imports/api/games/events/BonusCaught';
import BonusRemoved from '/imports/api/games/events/BonusRemoved';
import PointTaken from '/imports/api/games/events/PointTaken';
import {Games} from '/imports/api/games/games.js';
import {assert} from 'chai';
import StubCollections from 'meteor/hwillson:stub-collections';
import {Random} from 'meteor/random';

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

	before(function() {
		StubCollections.add([Games, UserAchievements]);
	});

	beforeEach(function() {
		StubCollections.stub();
	});

	afterEach(function() {
		StubCollections.restore();
	});

	it('increment if current player is paused, point is scored by user and user is host', function() {
		const listener = (new IWasThereWaiting()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_FREEZE_MONSTER, {activatedBonusClass: BONUS_FREEZE_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_FREEZE_MONSTER, activatorPlayerKey: 'player1'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));

		assert.equal(1, UserAchievements.find().count());
		assertIWasThereWaitingUserAchievementNumberEquals(1);
	});

	it('increment if current player is paused, point is scored by user and user is client', function() {
		const listener = (new IWasThereWaiting()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId, players: [{id: opponentUserId}, {id: userId}]});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_FREEZE_MONSTER, {activatedBonusClass: BONUS_FREEZE_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_FREEZE_MONSTER, activatorPlayerKey: 'player2'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));

		assert.equal(1, UserAchievements.find().count());
		assertIWasThereWaitingUserAchievementNumberEquals(1);
	});

	it('do not increment if current player is paused, point is scored by opponent and user is host', function() {
		const listener = (new IWasThereWaiting()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_FREEZE_MONSTER, {activatedBonusClass: BONUS_FREEZE_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_FREEZE_MONSTER, activatorPlayerKey: 'player1'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if current player is paused, point is scored by opponent and user is client', function() {
		const listener = (new IWasThereWaiting()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId, players: [{id: opponentUserId}, {id: userId}]});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_FREEZE_MONSTER, {activatedBonusClass: BONUS_FREEZE_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_FREEZE_MONSTER, activatorPlayerKey: 'player2'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if current player is not paused, point is scored by user and user is host', function() {
		const listener = (new IWasThereWaiting()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_FREEZE_MONSTER, {activatedBonusClass: BONUS_FREEZE_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_FREEZE_MONSTER, activatorPlayerKey: 'player2'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if current player is not paused, point is scored by user and user is client', function() {
		const listener = (new IWasThereWaiting()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId, players: [{id: opponentUserId}, {id: userId}]});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_FREEZE_MONSTER, {activatedBonusClass: BONUS_FREEZE_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_FREEZE_MONSTER, activatorPlayerKey: 'player1'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if current player has caught paused in the point but is not anymore, point is scored by user and user is host', function() {
		const listener = (new IWasThereWaiting()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_FREEZE_MONSTER, {activatedBonusClass: BONUS_FREEZE_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_FREEZE_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusRemoved(new BonusRemoved(gameId, Random.id(5), BONUS_FREEZE_MONSTER, 'player1', BONUS_FREEZE_MONSTER, 'player1', BONUS_FREEZE_MONSTER));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if current player has caught paused in the point but is not anymore, point is scored by user and user is client', function() {
		const listener = (new IWasThereWaiting()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId, players: [{id: opponentUserId}, {id: userId}]});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_FREEZE_MONSTER, {activatedBonusClass: BONUS_FREEZE_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_FREEZE_MONSTER, activatorPlayerKey: 'player2'}));
		listener.onBonusRemoved(new BonusRemoved(gameId, Random.id(5), BONUS_FREEZE_MONSTER, 'player2', BONUS_FREEZE_MONSTER, 'player2', BONUS_FREEZE_MONSTER));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if current player has caught paused but a point was taken since, point is scored by user and user is host', function() {
		const listener = (new IWasThereWaiting()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

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
		const listener = (new IWasThereWaiting()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId, players: [{id: opponentUserId}, {id: userId}]});

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
