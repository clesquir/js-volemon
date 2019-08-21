import {ACHIEVEMENT_HIT_THE_CEILING} from '/imports/api/achievements/constants';
import HitTheCeiling from '/imports/api/achievements/server/listeners/HitTheCeiling';
import {UserAchievements} from '/imports/api/achievements/userAchievements';
import {
	BONUS_BIG_JUMP_MONSTER,
	BONUS_LOW_GRAVITY,
	BONUS_SMALL_MONSTER
} from '/imports/api/games/bonusConstants';
import BonusCaught from '/imports/api/games/events/BonusCaught';
import BonusRemoved from '/imports/api/games/events/BonusRemoved';
import PointTaken from '/imports/api/games/events/PointTaken';
import {Games} from '/imports/api/games/games';
import {assert} from 'chai';
import StubCollections from 'meteor/hwillson:stub-collections';

describe('AchievementListener#HitTheCeiling', function() {
	const assertHitTheCeilingUserAchievementNumberEquals = function(userId, number) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_HIT_THE_CEILING, achievement.achievementId);
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

	it('increment if player is small monster, low gravity, big jump in all orders', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new HitTheCeiling()).forGame(gameId, creatorUserId);

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player1'}));
		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_LOW_GRAVITY, {activatedBonusClass: BONUS_LOW_GRAVITY, bonusClass: BONUS_LOW_GRAVITY}));
		assert.equal(1, UserAchievements.find().count());
		assertHitTheCeilingUserAchievementNumberEquals(creatorUserId, 1);

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player1'}));
		assertHitTheCeilingUserAchievementNumberEquals(creatorUserId, 1);
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		assertHitTheCeilingUserAchievementNumberEquals(creatorUserId, 1);
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_LOW_GRAVITY, {activatedBonusClass: BONUS_LOW_GRAVITY, bonusClass: BONUS_LOW_GRAVITY}));
		assertHitTheCeilingUserAchievementNumberEquals(creatorUserId, 2);

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_LOW_GRAVITY, {activatedBonusClass: BONUS_LOW_GRAVITY, bonusClass: BONUS_LOW_GRAVITY}));
		assertHitTheCeilingUserAchievementNumberEquals(creatorUserId, 2);
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player1'}));
		assertHitTheCeilingUserAchievementNumberEquals(creatorUserId, 2);
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		assertHitTheCeilingUserAchievementNumberEquals(creatorUserId, 3);

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_LOW_GRAVITY, {activatedBonusClass: BONUS_LOW_GRAVITY, bonusClass: BONUS_LOW_GRAVITY}));
		assertHitTheCeilingUserAchievementNumberEquals(creatorUserId, 3);
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		assertHitTheCeilingUserAchievementNumberEquals(creatorUserId, 3);
		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player1'}));
		assertHitTheCeilingUserAchievementNumberEquals(creatorUserId, 4);
	});

	it('do not increment if all small monster, low gravity, big jump have been caught in the point but are not anymore simultaneously', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new HitTheCeiling()).forGame(gameId, creatorUserId);

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusRemoved(new BonusRemoved(gameId, Random.id(5), BONUS_SMALL_MONSTER, 'player1', BONUS_SMALL_MONSTER, 'player1', BONUS_SMALL_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusRemoved(new BonusRemoved(gameId, Random.id(5), BONUS_BIG_JUMP_MONSTER, 'player1', BONUS_BIG_JUMP_MONSTER, 'player1', BONUS_BIG_JUMP_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_LOW_GRAVITY, {activatedBonusClass: BONUS_LOW_GRAVITY, bonusClass: BONUS_LOW_GRAVITY}));
		listener.onBonusRemoved(new BonusRemoved(gameId, Random.id(5), BONUS_LOW_GRAVITY, 'player1', BONUS_LOW_GRAVITY, 'player1', BONUS_LOW_GRAVITY));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusRemoved(new BonusRemoved(gameId, Random.id(5), BONUS_BIG_JUMP_MONSTER, 'player1', BONUS_BIG_JUMP_MONSTER, 'player1', BONUS_BIG_JUMP_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onBonusRemoved(new BonusRemoved(gameId, Random.id(5), BONUS_SMALL_MONSTER, 'player1', BONUS_SMALL_MONSTER, 'player1', BONUS_SMALL_MONSTER));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if all small monster, low gravity, big jump have been caught in the point but points have been scored in between', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new HitTheCeiling()).forGame(gameId, creatorUserId);

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_LOW_GRAVITY, {activatedBonusClass: BONUS_LOW_GRAVITY, bonusClass: BONUS_LOW_GRAVITY}));
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_BIG_JUMP_MONSTER, {activatedBonusClass: BONUS_BIG_JUMP_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_BIG_JUMP_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_SMALL_MONSTER, {activatedBonusClass: BONUS_SMALL_MONSTER, targetPlayerKey: 'player1', bonusClass: BONUS_SMALL_MONSTER, activatorPlayerKey: 'player1'}));
		listener.onPointTaken(new PointTaken(gameId, 0, true, 1, 0));
		assert.equal(0, UserAchievements.find().count());
	});
});
