import {ACHIEVEMENT_TO_THE_SKY} from '/imports/api/achievements/constants.js';
import ToTheSky from '/imports/api/achievements/server/listeners/ToTheSky.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {BONUS_BIG_JUMP_MONSTER, BONUS_BOUNCE_MONSTER, BONUS_SMALL_MONSTER} from '/imports/api/games/bonusConstants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import BonusRemoved from '/imports/api/games/events/BonusRemoved.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';
import {Games} from '/imports/api/games/games.js';
import {assert} from 'chai';
import StubCollections from 'meteor/hwillson:stub-collections';

describe('AchievementListener#ToTheSky', function() {
	const assertToTheSkyUserAchievementNumberEquals = function(userId, number) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_TO_THE_SKY, achievement.achievementId);
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

	it('increment if current player is small then big jump then bouncy and user is host', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new ToTheSky()).forGame(gameId, creatorUserId);

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BOUNCE_MONSTER, {activatedBonusClass: BONUS_BOUNCE_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BOUNCE_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(1, UserAchievements.find().count());
		assertToTheSkyUserAchievementNumberEquals(creatorUserId, 1);
	});

	it('increment if current player is small then bouncy then big jump and user is host', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new ToTheSky()).forGame(gameId, creatorUserId);

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BOUNCE_MONSTER, {activatedBonusClass: BONUS_BOUNCE_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BOUNCE_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(1, UserAchievements.find().count());
		assertToTheSkyUserAchievementNumberEquals(creatorUserId, 1);
	});

	it('increment if current player is big jump then small then bouncy and user is host', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new ToTheSky()).forGame(gameId, creatorUserId);

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BOUNCE_MONSTER, {activatedBonusClass: BONUS_BOUNCE_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BOUNCE_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(1, UserAchievements.find().count());
		assertToTheSkyUserAchievementNumberEquals(creatorUserId, 1);
	});

	it('increment if current player is big jump then bouncy then small and user is host', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new ToTheSky()).forGame(gameId, creatorUserId);

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BOUNCE_MONSTER, {activatedBonusClass: BONUS_BOUNCE_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BOUNCE_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(1, UserAchievements.find().count());
		assertToTheSkyUserAchievementNumberEquals(creatorUserId, 1);
	});

	it('increment if current player is bouncy then small then big jump and user is host', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new ToTheSky()).forGame(gameId, creatorUserId);

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BOUNCE_MONSTER, {activatedBonusClass: BONUS_BOUNCE_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BOUNCE_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(1, UserAchievements.find().count());
		assertToTheSkyUserAchievementNumberEquals(creatorUserId, 1);
	});

	it('increment if current player is bouncy then big jump then small and user is host', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new ToTheSky()).forGame(gameId, creatorUserId);

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BOUNCE_MONSTER, {activatedBonusClass: BONUS_BOUNCE_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BOUNCE_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(1, UserAchievements.find().count());
		assertToTheSkyUserAchievementNumberEquals(creatorUserId, 1);
	});

	it('increment if current player is small then big jump then bouncy and user is client', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new ToTheSky()).forGame(gameId, opponentUserId);

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player2'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BOUNCE_MONSTER, {activatedBonusClass: BONUS_BOUNCE_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BOUNCE_MONSTER, activatorPlayerKey: 'player2'}));
		assert.equal(1, UserAchievements.find().count());
		assertToTheSkyUserAchievementNumberEquals(opponentUserId, 1);
	});

	it('increment if current player is small then bouncy then big jump and user is client', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new ToTheSky()).forGame(gameId, opponentUserId);

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BOUNCE_MONSTER, {activatedBonusClass: BONUS_BOUNCE_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BOUNCE_MONSTER, activatorPlayerKey: 'player2'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player2'}));
		assert.equal(1, UserAchievements.find().count());
		assertToTheSkyUserAchievementNumberEquals(opponentUserId, 1);
	});

	it('increment if current player is big jump then small then bouncy and user is client', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new ToTheSky()).forGame(gameId, opponentUserId);

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player2'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BOUNCE_MONSTER, {activatedBonusClass: BONUS_BOUNCE_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BOUNCE_MONSTER, activatorPlayerKey: 'player2'}));
		assert.equal(1, UserAchievements.find().count());
		assertToTheSkyUserAchievementNumberEquals(opponentUserId, 1);
	});

	it('increment if current player is big jump then bouncy then small and user is client', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new ToTheSky()).forGame(gameId, opponentUserId);

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player2'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BOUNCE_MONSTER, {activatedBonusClass: BONUS_BOUNCE_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BOUNCE_MONSTER, activatorPlayerKey: 'player2'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		assert.equal(1, UserAchievements.find().count());
		assertToTheSkyUserAchievementNumberEquals(opponentUserId, 1);
	});

	it('increment if current player is bouncy then small then big jump and user is client', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new ToTheSky()).forGame(gameId, opponentUserId);

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BOUNCE_MONSTER, {activatedBonusClass: BONUS_BOUNCE_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BOUNCE_MONSTER, activatorPlayerKey: 'player2'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player2'}));
		assert.equal(1, UserAchievements.find().count());
		assertToTheSkyUserAchievementNumberEquals(opponentUserId, 1);
	});

	it('increment if current player is bouncy then big jump then small and user is client', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new ToTheSky()).forGame(gameId, opponentUserId);

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BOUNCE_MONSTER, {activatedBonusClass: BONUS_BOUNCE_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BOUNCE_MONSTER, activatorPlayerKey: 'player2'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player2'}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		assert.equal(1, UserAchievements.find().count());
		assertToTheSkyUserAchievementNumberEquals(opponentUserId, 1);
	});

	it('do not increment if current player has caught needed bonus in the point but is not active anymore and user is host', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new ToTheSky()).forGame(gameId, creatorUserId);

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusRemoved(new BonusRemoved(gameId, BONUS_SMALL_MONSTER, 'player1', BONUS_SMALL_MONSTER, 'player1', BONUS_SMALL_MONSTER));
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BOUNCE_MONSTER, {activatedBonusClass: BONUS_BOUNCE_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BOUNCE_MONSTER, activatorPlayerKey: 'player1'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusRemoved(new BonusRemoved(gameId, BONUS_BIG_JUMP_MONSTER, 'player1', BONUS_BIG_JUMP_MONSTER, 'player1', BONUS_BIG_JUMP_MONSTER));
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BOUNCE_MONSTER, {activatedBonusClass: BONUS_BOUNCE_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BOUNCE_MONSTER, activatorPlayerKey: 'player1'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BOUNCE_MONSTER, {activatedBonusClass: BONUS_BOUNCE_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BOUNCE_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusRemoved(new BonusRemoved(gameId, BONUS_BOUNCE_MONSTER, 'player1', BONUS_BOUNCE_MONSTER, 'player1', BONUS_BOUNCE_MONSTER));
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player1'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if current player has caught needed bonus in the point but is not active anymore, point is scored by user and user is client', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new ToTheSky()).forGame(gameId, opponentUserId);

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		listener.onBonusRemoved(new BonusRemoved(gameId, BONUS_SMALL_MONSTER, 'player2', BONUS_SMALL_MONSTER, 'player2', BONUS_SMALL_MONSTER));
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player2'}));
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BOUNCE_MONSTER, {activatedBonusClass: BONUS_BOUNCE_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BOUNCE_MONSTER, activatorPlayerKey: 'player2'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player2'}));
		listener.onBonusRemoved(new BonusRemoved(gameId, BONUS_BIG_JUMP_MONSTER, 'player2', BONUS_BIG_JUMP_MONSTER, 'player2', BONUS_BIG_JUMP_MONSTER));
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BOUNCE_MONSTER, {activatedBonusClass: BONUS_BOUNCE_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BOUNCE_MONSTER, activatorPlayerKey: 'player2'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BOUNCE_MONSTER, {activatedBonusClass: BONUS_BOUNCE_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BOUNCE_MONSTER, activatorPlayerKey: 'player2'}));
		listener.onBonusRemoved(new BonusRemoved(gameId, BONUS_BOUNCE_MONSTER, 'player2', BONUS_BOUNCE_MONSTER, 'player2', BONUS_BOUNCE_MONSTER));
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player2'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if current player has caught needed bonus but a point was taken since and user is host', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new ToTheSky()).forGame(gameId, creatorUserId);

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BOUNCE_MONSTER, {activatedBonusClass: BONUS_BOUNCE_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BOUNCE_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(1, UserAchievements.find().count());
		assertToTheSkyUserAchievementNumberEquals(creatorUserId, 1);

		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(1, UserAchievements.find().count());
		assertToTheSkyUserAchievementNumberEquals(creatorUserId, 1);

		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(1, UserAchievements.find().count());
		assertToTheSkyUserAchievementNumberEquals(creatorUserId, 1);

		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BOUNCE_MONSTER, {activatedBonusClass: BONUS_BOUNCE_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BOUNCE_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(1, UserAchievements.find().count());
		assertToTheSkyUserAchievementNumberEquals(creatorUserId, 1);
	});

	it('do not increment if current player has caught needed bonus but a point was taken since user and user is client', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new ToTheSky()).forGame(gameId, opponentUserId);

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player2'}));
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BOUNCE_MONSTER, {activatedBonusClass: BONUS_BOUNCE_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BOUNCE_MONSTER, activatorPlayerKey: 'player2'}));
		assert.equal(1, UserAchievements.find().count());
		assertToTheSkyUserAchievementNumberEquals(opponentUserId, 1);

		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player2'}));
		assert.equal(1, UserAchievements.find().count());
		assertToTheSkyUserAchievementNumberEquals(opponentUserId, 1);

		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 2));

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player2'}));
		assert.equal(1, UserAchievements.find().count());
		assertToTheSkyUserAchievementNumberEquals(opponentUserId, 1);

		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 2));

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BOUNCE_MONSTER, {activatedBonusClass: BONUS_BOUNCE_MONSTER, targetPlayerKey: 'player2', bonusClass: BONUS_BOUNCE_MONSTER, activatorPlayerKey: 'player2'}));
		assert.equal(1, UserAchievements.find().count());
		assertToTheSkyUserAchievementNumberEquals(opponentUserId, 1);
	});
});
