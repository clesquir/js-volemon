import {chai} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {resetDatabase} from 'meteor/xolvio:cleaner';
import {Random} from 'meteor/random';
import InvisibleInAPoint from '/imports/api/achievements/server/listeners/InvisibleInAPoint.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {ACHIEVEMENT_INVISIBLE_IN_A_POINT} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {Constants} from '/imports/lib/constants.js';

describe('InvisibleInAGame', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const assertInvisibleInAPointUserAchievementNumberEquals = function(number) {
		const achievement = UserAchievements.findOne();
		chai.assert.notEqual(undefined, achievement);

		chai.assert.strictEqual(userId, achievement.userId);
		chai.assert.strictEqual(ACHIEVEMENT_INVISIBLE_IN_A_POINT, achievement.achievementId);
		chai.assert.strictEqual(number, achievement.number);
	};

	beforeEach(function() {
		resetDatabase();
	});

	it('creates achievement if not created on invisible bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		const listener = new InvisibleInAPoint(gameId, userId);

		chai.assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(gameId, Constants.BONUS_INVISIBLE_MONSTER, 'player1', 'a', 'player1'));

		chai.assert.equal(1, UserAchievements.find().count());
		assertInvisibleInAPointUserAchievementNumberEquals(1);
	});

	it('creates achievement if not created on invisible opponent bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		const listener = new InvisibleInAPoint(gameId, userId);

		chai.assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(gameId, Constants.BONUS_INVISIBLE_MONSTER, 'player1', Constants.BONUS_INVISIBLE_OPPONENT_MONSTER, 'player2'));

		chai.assert.equal(1, UserAchievements.find().count());
		assertInvisibleInAPointUserAchievementNumberEquals(1);
	});

	it('do not create achievement if not created if not gameId on invisible bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		const listener = new InvisibleInAPoint(gameId, userId);

		chai.assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(Random.id(5), Constants.BONUS_INVISIBLE_MONSTER, 'player1', 'a', 'player1'));
		chai.assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if not created if activated bonus is not invisible on bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		const listener = new InvisibleInAPoint(gameId, userId);

		chai.assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(gameId, 'a', 'player1', 'a', 'player1'));
		chai.assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if not created if current user is not player key on invisible bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		const listener = new InvisibleInAPoint(gameId, userId);

		chai.assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(gameId, Constants.BONUS_INVISIBLE_MONSTER, 'player2', 'a', 'player2'));
		chai.assert.equal(0, UserAchievements.find().count());
	});

	it('update achievement if higher on invisible bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_INVISIBLE_IN_A_POINT, number: 1});
		const listener = new InvisibleInAPoint(gameId, userId);

		listener.onBonusCaught(new BonusCaught(gameId, Constants.BONUS_INVISIBLE_MONSTER, 'player1', 'a', 'player1'));

		assertInvisibleInAPointUserAchievementNumberEquals(1);

		listener.onBonusCaught(new BonusCaught(gameId, Constants.BONUS_INVISIBLE_MONSTER, 'player1', 'a', 'player1'));

		assertInvisibleInAPointUserAchievementNumberEquals(2);
	});

	it('achievement should be 2 if invisible bonus caught then point is taken then caught twice', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		const listener = new InvisibleInAPoint(gameId, userId);

		listener.onBonusCaught(new BonusCaught(gameId, Constants.BONUS_INVISIBLE_MONSTER, 'player1', 'a', 'player1'));

		assertInvisibleInAPointUserAchievementNumberEquals(1);

		listener.onPointTaken(new PointTaken(gameId, 2000));

		assertInvisibleInAPointUserAchievementNumberEquals(1);

		listener.onBonusCaught(new BonusCaught(gameId, Constants.BONUS_INVISIBLE_MONSTER, 'player1', 'a', 'player1'));

		assertInvisibleInAPointUserAchievementNumberEquals(1);

		listener.onBonusCaught(new BonusCaught(gameId, Constants.BONUS_INVISIBLE_MONSTER, 'player1', 'a', 'player1'));

		assertInvisibleInAPointUserAchievementNumberEquals(2);
	});

	it('do not update achievement if not gameId on invisible bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		const listener = new InvisibleInAPoint(gameId, userId);

		listener.onBonusCaught(new BonusCaught(gameId, Constants.BONUS_INVISIBLE_MONSTER, 'player1', 'a', 'player1'));

		assertInvisibleInAPointUserAchievementNumberEquals(1);

		listener.onBonusCaught(new BonusCaught(Random.id(5), Constants.BONUS_INVISIBLE_MONSTER, 'player1', 'a', 'player1'));

		assertInvisibleInAPointUserAchievementNumberEquals(1);
	});

	it('do not update achievement if activated bonus is not invisible on bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		const listener = new InvisibleInAPoint(gameId, userId);

		listener.onBonusCaught(new BonusCaught(gameId, Constants.BONUS_INVISIBLE_MONSTER, 'player1', 'a', 'player1'));

		assertInvisibleInAPointUserAchievementNumberEquals(1);

		listener.onBonusCaught(new BonusCaught(gameId, 'a', 'player1', 'a', 'player1'));

		assertInvisibleInAPointUserAchievementNumberEquals(1);
	});

	it('do not update achievement if current user is not player key on invisible bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		const listener = new InvisibleInAPoint(gameId, userId);

		listener.onBonusCaught(new BonusCaught(gameId, Constants.BONUS_INVISIBLE_MONSTER, 'player1', 'a', 'player1'));

		assertInvisibleInAPointUserAchievementNumberEquals(1);

		listener.onBonusCaught(new BonusCaught(gameId, Constants.BONUS_INVISIBLE_MONSTER, 'player2', 'a', 'player2'));

		assertInvisibleInAPointUserAchievementNumberEquals(1);
	});
});