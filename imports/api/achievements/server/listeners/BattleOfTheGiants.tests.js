import {ACHIEVEMENT_BATTLE_OF_THE_GIANTS} from '/imports/api/achievements/constants.js';
import BattleOfTheGiants from '/imports/api/achievements/server/listeners/BattleOfTheGiants.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {BONUS_BIG_MONSTER} from '/imports/api/games/bonusConstants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import BonusRemoved from '/imports/api/games/events/BonusRemoved.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {assert} from 'chai';
import {Random} from 'meteor/random';
import {resetDatabase} from 'meteor/xolvio:cleaner';

describe('AchievementListener#BattleOfTheGiants', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const opponentUserId = Random.id(5);
	const assertBattleOfTheGiantsUserAchievementNumberEquals = function(number) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_BATTLE_OF_THE_GIANTS, achievement.achievementId);
		assert.strictEqual(number, achievement.number);
	};

	beforeEach(function() {
		resetDatabase();
	});

	it('increment if both players are big monsters, point is scored by user and user is host', function() {
		const listener = (new BattleOfTheGiants()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player2'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));

		assert.equal(1, UserAchievements.find().count());
		assertBattleOfTheGiantsUserAchievementNumberEquals(1);
	});

	it('increment if both players are big monsters, point is scored by user and user is client', function() {
		const listener = (new BattleOfTheGiants()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId, players: [{id: opponentUserId}, {id: userId}]});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player2'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));

		assert.equal(1, UserAchievements.find().count());
		assertBattleOfTheGiantsUserAchievementNumberEquals(1);
	});

	it('do not increment if both players are big monsters, point is scored by opponent and user is host', function() {
		const listener = (new BattleOfTheGiants()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player2'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if both players are big monsters, point is scored by opponent and user is client', function() {
		const listener = (new BattleOfTheGiants()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId, players: [{id: opponentUserId}, {id: userId}]});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player2'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if opponent is not big monster, point is scored by user and user is host', function() {
		const listener = (new BattleOfTheGiants()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player1'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if opponent is not big monster, point is scored by user and user is client', function() {
		const listener = (new BattleOfTheGiants()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId, players: [{id: opponentUserId}, {id: userId}]});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player2'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if user is not big monster, point is scored by user and user is host', function() {
		const listener = (new BattleOfTheGiants()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player2'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if user is not big monster, point is scored by user and user is client', function() {
		const listener = (new BattleOfTheGiants()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId, players: [{id: opponentUserId}, {id: userId}]});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player1'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if opponent has caught big monster in the point but is not anymore, point is scored by user and user is host', function() {
		const listener = (new BattleOfTheGiants()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player2'}));
		listener.onBonusRemoved(new BonusRemoved(gameId, BONUS_BIG_MONSTER, 'player2', BONUS_BIG_MONSTER, 'player2', BONUS_BIG_MONSTER));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if opponent has caught big monster in the point but is not anymore, point is scored by user and user is client', function() {
		const listener = (new BattleOfTheGiants()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId, players: [{id: opponentUserId}, {id: userId}]});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player2'}));
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusRemoved(new BonusRemoved(gameId, BONUS_BIG_MONSTER, 'player1', BONUS_BIG_MONSTER, 'player1', BONUS_BIG_MONSTER));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if user has caught big monster in the point but is not anymore, point is scored by user and user is host', function() {
		const listener = (new BattleOfTheGiants()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player2'}));
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusRemoved(new BonusRemoved(gameId, BONUS_BIG_MONSTER, 'player1', BONUS_BIG_MONSTER, 'player1', BONUS_BIG_MONSTER));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if user has caught big monster in the point but is not anymore, point is scored by user and user is client', function() {
		const listener = (new BattleOfTheGiants()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId, players: [{id: opponentUserId}, {id: userId}]});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player2'}));
		listener.onBonusRemoved(new BonusRemoved(gameId, BONUS_BIG_MONSTER, 'player2', BONUS_BIG_MONSTER, 'player2', BONUS_BIG_MONSTER));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if opponent has caught big monster but a point was taken since, point is scored by user and user is host', function() {
		const listener = (new BattleOfTheGiants()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player2'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player1'}));

		//Does not increment
		listener.onPointTaken(new PointTaken(gameId, 0, true, 2, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if opponent has caught big monster but a point was taken since, point is scored by user and user is client', function() {
		const listener = (new BattleOfTheGiants()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId, players: [{id: opponentUserId}, {id: userId}]});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player1'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player2'}));

		//Does not increment
		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if user has caught big monster but a point was taken since, point is scored by user and user is host', function() {
		const listener = (new BattleOfTheGiants()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player1'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player2'}));

		//Does not increment
		listener.onPointTaken(new PointTaken(gameId, 0, true, 2, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if user has caught big monster but a point was taken since, point is scored by user and user is client', function() {
		const listener = (new BattleOfTheGiants()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId, players: [{id: opponentUserId}, {id: userId}]});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player2'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_MONSTER, {activatedBonusClass: BONUS_BIG_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_MONSTER, activatorPlayerKey: 'player1'}));

		//Does not increment
		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 2));
		assert.equal(0, UserAchievements.find().count());
	});
});
