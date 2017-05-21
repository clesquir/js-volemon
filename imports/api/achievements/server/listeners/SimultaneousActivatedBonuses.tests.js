import {chai} from 'meteor/practicalmeteor:chai';
import {resetDatabase} from 'meteor/xolvio:cleaner';
import {Random} from 'meteor/random';
import SimultaneousActivatedBonuses from '/imports/api/achievements/server/listeners/SimultaneousActivatedBonuses.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {ACHIEVEMENT_SIMULTANEOUS_ACTIVATED_BONUSES} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import BonusRemoved from '/imports/api/games/events/BonusRemoved.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';

describe('SimultaneousActivatedBonuses', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const listener = new SimultaneousActivatedBonuses(gameId, userId);
	const assertSimultaneousActivatedBonusesUserAchievementNumberEquals = function(number) {
		const achievement = UserAchievements.findOne();
		chai.assert.notEqual(undefined, achievement);

		chai.assert.strictEqual(userId, achievement.userId);
		chai.assert.strictEqual(ACHIEVEMENT_SIMULTANEOUS_ACTIVATED_BONUSES, achievement.achievementId);
		chai.assert.strictEqual(number, achievement.number);
	};

	beforeEach(function() {
		resetDatabase();
	});

	it('increment if all different bonus', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});

		chai.assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(gameId, 'a', 'player1', 'a', 'player1'));

		chai.assert.strictEqual(1, listener.numberOfActivatedBonuses());
		assertSimultaneousActivatedBonusesUserAchievementNumberEquals(1);
	});

	it('do not increment if same bonus', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});

		chai.assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(gameId, 'a', 'player1', 'a', 'player1'));

		chai.assert.strictEqual(1, listener.numberOfActivatedBonuses());
		chai.assert.equal(1, UserAchievements.find().count());
		assertSimultaneousActivatedBonusesUserAchievementNumberEquals(1);

		listener.onBonusCaught(new BonusCaught(gameId, 'a', 'player1', 'a', 'player1'));

		chai.assert.strictEqual(1, listener.numberOfActivatedBonuses());
		assertSimultaneousActivatedBonusesUserAchievementNumberEquals(1);
	});

	it('do not increment if not gameId', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});

		chai.assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(Random.id(5), 'a', 'player1', 'a', 'player1'));
		chai.assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment if target is not current user', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});

		chai.assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(gameId, 'a', 'player2', 'a', 'player2'));
		chai.assert.equal(0, UserAchievements.find().count());
	});

	it('number is reduced when calling remove on existant bonus', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});

		listener.onBonusCaught(new BonusCaught(gameId, 'a', 'player1', 'a', 'player1'));
		chai.assert.strictEqual(1, listener.numberOfActivatedBonuses());

		listener.onBonusRemoved(new BonusRemoved(gameId, 'a', 'player1', 'a', 'player1'));
		chai.assert.strictEqual(0, listener.numberOfActivatedBonuses());
	});

	it('number is not reduced when calling remove on not existant bonus', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});

		listener.onBonusCaught(new BonusCaught(gameId, 'a', 'player1', 'a', 'player1'));
		chai.assert.strictEqual(1, listener.numberOfActivatedBonuses());

		listener.onBonusRemoved(new BonusRemoved(gameId, 'b', 'player1', 'b', 'player1'));
		chai.assert.strictEqual(1, listener.numberOfActivatedBonuses());
	});

	it('do not reduce if not gameId', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});

		listener.onBonusCaught(new BonusCaught(gameId, 'a', 'player1', 'a', 'player1'));
		chai.assert.strictEqual(1, listener.numberOfActivatedBonuses());

		listener.onBonusRemoved(new BonusRemoved(Random.id(5), 'a', 'player1', 'a', 'player1'));
		chai.assert.strictEqual(1, listener.numberOfActivatedBonuses());
	});

	it('do not reduce if target is not current user', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});

		listener.onBonusCaught(new BonusCaught(gameId, 'a', 'player1', 'a', 'player1'));
		chai.assert.strictEqual(1, listener.numberOfActivatedBonuses());

		listener.onBonusRemoved(new BonusRemoved(gameId, 'a', 'player2', 'a', 'player2'));
		chai.assert.strictEqual(1, listener.numberOfActivatedBonuses());
	});

	it('number is 0 on point taken', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});

		listener.onBonusCaught(new BonusCaught(gameId, 'a', 'player1', 'a', 'player1'));
		chai.assert.strictEqual(1, listener.numberOfActivatedBonuses());

		listener.onPointTaken(new PointTaken(gameId, 2000));
		chai.assert.strictEqual(0, listener.numberOfActivatedBonuses());
	});

	it('do not reset if not gameId', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});

		listener.onBonusCaught(new BonusCaught(gameId, 'a', 'player1', 'a', 'player1'));
		chai.assert.strictEqual(1, listener.numberOfActivatedBonuses());

		listener.onPointTaken(new PointTaken(Random.id(5), 2000));
		chai.assert.strictEqual(1, listener.numberOfActivatedBonuses());
	});

	it('do not reset if user is not game player', function() {
		Games.insert({_id: gameId, createdBy: userId});

		listener.onBonusCaught(new BonusCaught(gameId, 'a', 'player1', 'a', 'player1'));
		chai.assert.strictEqual(1, listener.numberOfActivatedBonuses());

		listener.onPointTaken(new PointTaken(gameId, 2000));
		chai.assert.strictEqual(1, listener.numberOfActivatedBonuses());
	});
});
