import {assert} from 'chai';
import {resetDatabase} from 'meteor/xolvio:cleaner';
import {Random} from 'meteor/random';
import BlankScreen from '/imports/api/achievements/server/listeners/BlankScreen.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {ACHIEVEMENT_BLANK_SCREEN} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import BonusRemoved from '/imports/api/games/events/BonusRemoved.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';
import {
	BONUS_CLOAKED_MONSTER,
	BONUS_INVISIBLE_BALL,
	BONUS_INVISIBLE_MONSTER
} from '/imports/api/games/bonusConstants.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';

describe('AchievementListener#BlankScreen', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const opponentUserId = Random.id(5);
	const assertBlankScreenUserAchievementNumberEquals = function(number) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_BLANK_SCREEN, achievement.achievementId);
		assert.strictEqual(number, achievement.number);
	};

	beforeEach(function() {
		resetDatabase();
	});

	afterEach(function() {
		resetDatabase();
	});

	it('increment if ball is invisible, user is invisible, opponent is invisible and user is host', function() {
		const listener = new BlankScreen(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_MONSTER, 'player1', BONUS_INVISIBLE_MONSTER, 'player1', BONUS_INVISIBLE_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_MONSTER, 'player2', BONUS_INVISIBLE_MONSTER, 'player2', BONUS_INVISIBLE_MONSTER));
		assert.equal(1, UserAchievements.find().count());
		assertBlankScreenUserAchievementNumberEquals(1);
	});

	it('increment if ball is invisible, user is cloaked, opponent is invisible and user is host', function() {
		const listener = new BlankScreen(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_CLOAKED_MONSTER, 'player1', BONUS_CLOAKED_MONSTER, 'player1', BONUS_CLOAKED_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_MONSTER, 'player2', BONUS_INVISIBLE_MONSTER, 'player2', BONUS_INVISIBLE_MONSTER));
		assert.equal(1, UserAchievements.find().count());
		assertBlankScreenUserAchievementNumberEquals(1);
	});

	it('increment if ball is invisible, user is invisible, opponent is cloaked and user is host', function() {
		const listener = new BlankScreen(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_MONSTER, 'player1', BONUS_INVISIBLE_MONSTER, 'player1', BONUS_INVISIBLE_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_CLOAKED_MONSTER, 'player2', BONUS_CLOAKED_MONSTER, 'player2', BONUS_CLOAKED_MONSTER));
		assert.equal(1, UserAchievements.find().count());
		assertBlankScreenUserAchievementNumberEquals(1);
	});

	it('increment if ball is invisible, user is cloaked, opponent is cloaked and user is host', function() {
		const listener = new BlankScreen(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_CLOAKED_MONSTER, 'player1', BONUS_CLOAKED_MONSTER, 'player1', BONUS_CLOAKED_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_CLOAKED_MONSTER, 'player2', BONUS_CLOAKED_MONSTER, 'player2', BONUS_CLOAKED_MONSTER));
		assert.equal(1, UserAchievements.find().count());
		assertBlankScreenUserAchievementNumberEquals(1);
	});

	it('increment if ball is invisible, user is invisible, opponent is invisible and user is client', function() {
		const listener = new BlankScreen(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_MONSTER, 'player2', BONUS_INVISIBLE_MONSTER, 'player2', BONUS_INVISIBLE_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_MONSTER, 'player1', BONUS_INVISIBLE_MONSTER, 'player1', BONUS_INVISIBLE_MONSTER));
		assert.equal(1, UserAchievements.find().count());
		assertBlankScreenUserAchievementNumberEquals(1);
	});

	it('increment if ball is invisible, user is cloaked, opponent is invisible and user is client', function() {
		const listener = new BlankScreen(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_CLOAKED_MONSTER, 'player2', BONUS_CLOAKED_MONSTER, 'player2', BONUS_CLOAKED_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_MONSTER, 'player1', BONUS_INVISIBLE_MONSTER, 'player1', BONUS_INVISIBLE_MONSTER));
		assert.equal(1, UserAchievements.find().count());
		assertBlankScreenUserAchievementNumberEquals(1);
	});

	it('increment if ball is invisible, user is invisible, opponent is cloaked and user is client', function() {
		const listener = new BlankScreen(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_MONSTER, 'player2', BONUS_INVISIBLE_MONSTER, 'player2', BONUS_INVISIBLE_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_CLOAKED_MONSTER, 'player1', BONUS_CLOAKED_MONSTER, 'player1', BONUS_CLOAKED_MONSTER));
		assert.equal(1, UserAchievements.find().count());
		assertBlankScreenUserAchievementNumberEquals(1);
	});

	it('increment if ball is invisible, user is cloaked, opponent is cloaked and user is client', function() {
		const listener = new BlankScreen(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_CLOAKED_MONSTER, 'player2', BONUS_CLOAKED_MONSTER, 'player2', BONUS_CLOAKED_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_CLOAKED_MONSTER, 'player1', BONUS_CLOAKED_MONSTER, 'player1', BONUS_CLOAKED_MONSTER));
		assert.equal(1, UserAchievements.find().count());
		assertBlankScreenUserAchievementNumberEquals(1);
	});

	it('do not increment if ball is not invisible', function() {
		const listener = new BlankScreen(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_MONSTER, 'player1', BONUS_INVISIBLE_MONSTER, 'player1', BONUS_INVISIBLE_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_CLOAKED_MONSTER, 'player1', BONUS_CLOAKED_MONSTER, 'player1', BONUS_CLOAKED_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_MONSTER, 'player2', BONUS_INVISIBLE_MONSTER, 'player2', BONUS_INVISIBLE_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_CLOAKED_MONSTER, 'player2', BONUS_CLOAKED_MONSTER, 'player2', BONUS_CLOAKED_MONSTER));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if user is neither cloaked nor invisible', function() {
		const listener = new BlankScreen(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_MONSTER, 'player2', BONUS_INVISIBLE_MONSTER, 'player2', BONUS_INVISIBLE_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_CLOAKED_MONSTER, 'player2', BONUS_CLOAKED_MONSTER, 'player2', BONUS_CLOAKED_MONSTER));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if opponent is neither cloaked nor invisible', function() {
		const listener = new BlankScreen(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_MONSTER, 'player1', BONUS_INVISIBLE_MONSTER, 'player1', BONUS_INVISIBLE_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_CLOAKED_MONSTER, 'player1', BONUS_CLOAKED_MONSTER, 'player1', BONUS_CLOAKED_MONSTER));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if invisible ball has been deactivated', function() {
		const listener = new BlankScreen(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL));
		assert.equal(0, UserAchievements.find().count());
		listener.onBonusRemoved(new BonusRemoved(gameId, BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL, 'player1'));

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_MONSTER, 'player1', BONUS_INVISIBLE_MONSTER, 'player1', BONUS_INVISIBLE_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_CLOAKED_MONSTER, 'player1', BONUS_CLOAKED_MONSTER, 'player1', BONUS_CLOAKED_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_MONSTER, 'player2', BONUS_INVISIBLE_MONSTER, 'player2', BONUS_INVISIBLE_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_CLOAKED_MONSTER, 'player2', BONUS_CLOAKED_MONSTER, 'player2', BONUS_CLOAKED_MONSTER));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if cloaked user has been deactivated', function() {
		const listener = new BlankScreen(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_CLOAKED_MONSTER, 'player1', BONUS_CLOAKED_MONSTER, 'player1', BONUS_CLOAKED_MONSTER));
		assert.equal(0, UserAchievements.find().count());
		listener.onBonusRemoved(new BonusRemoved(gameId, BONUS_CLOAKED_MONSTER, 'player1', BONUS_CLOAKED_MONSTER, 'player1'));

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_MONSTER, 'player2', BONUS_INVISIBLE_MONSTER, 'player2', BONUS_INVISIBLE_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_CLOAKED_MONSTER, 'player2', BONUS_CLOAKED_MONSTER, 'player2', BONUS_CLOAKED_MONSTER));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if invisible user has been deactivated', function() {
		const listener = new BlankScreen(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_MONSTER, 'player1', BONUS_INVISIBLE_MONSTER, 'player1', BONUS_INVISIBLE_MONSTER));
		assert.equal(0, UserAchievements.find().count());
		listener.onBonusRemoved(new BonusRemoved(gameId, BONUS_INVISIBLE_MONSTER, 'player1', BONUS_INVISIBLE_MONSTER, 'player1'));

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_MONSTER, 'player2', BONUS_INVISIBLE_MONSTER, 'player2', BONUS_INVISIBLE_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_CLOAKED_MONSTER, 'player2', BONUS_CLOAKED_MONSTER, 'player2', BONUS_CLOAKED_MONSTER));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if cloaked opponent has been deactivated', function() {
		const listener = new BlankScreen(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_CLOAKED_MONSTER, 'player2', BONUS_CLOAKED_MONSTER, 'player2', BONUS_CLOAKED_MONSTER));
		assert.equal(0, UserAchievements.find().count());
		listener.onBonusRemoved(new BonusRemoved(gameId, BONUS_CLOAKED_MONSTER, 'player2', BONUS_CLOAKED_MONSTER, 'player2'));

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_MONSTER, 'player1', BONUS_INVISIBLE_MONSTER, 'player1', BONUS_INVISIBLE_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_CLOAKED_MONSTER, 'player1', BONUS_CLOAKED_MONSTER, 'player1', BONUS_CLOAKED_MONSTER));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if invisible opponent has been deactivated', function() {
		const listener = new BlankScreen(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_MONSTER, 'player2', BONUS_INVISIBLE_MONSTER, 'player2', BONUS_INVISIBLE_MONSTER));
		assert.equal(0, UserAchievements.find().count());
		listener.onBonusRemoved(new BonusRemoved(gameId, BONUS_INVISIBLE_MONSTER, 'player2', BONUS_INVISIBLE_MONSTER, 'player2'));

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_MONSTER, 'player1', BONUS_INVISIBLE_MONSTER, 'player1', BONUS_INVISIBLE_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_CLOAKED_MONSTER, 'player1', BONUS_CLOAKED_MONSTER, 'player1', BONUS_CLOAKED_MONSTER));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if point has been taken', function() {
		const listener = new BlankScreen(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL, 'player1', BONUS_INVISIBLE_BALL));
		assert.equal(0, UserAchievements.find().count());

		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_MONSTER, 'player1', BONUS_INVISIBLE_MONSTER, 'player1', BONUS_INVISIBLE_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_CLOAKED_MONSTER, 'player1', BONUS_CLOAKED_MONSTER, 'player1', BONUS_CLOAKED_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_INVISIBLE_MONSTER, 'player2', BONUS_INVISIBLE_MONSTER, 'player2', BONUS_INVISIBLE_MONSTER));
		assert.equal(0, UserAchievements.find().count());

		listener.onPointTaken(new PointTaken(gameId, 0, false, 0, 1));

		listener.onBonusCaught(new BonusCaught(gameId, BONUS_CLOAKED_MONSTER, 'player2', BONUS_CLOAKED_MONSTER, 'player2', BONUS_CLOAKED_MONSTER));
		assert.equal(0, UserAchievements.find().count());
	});
});
