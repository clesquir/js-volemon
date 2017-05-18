import {chai} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {resetDatabase} from 'meteor/xolvio:cleaner';
import {Random} from 'meteor/random';
import AllBonusesInAGame from '/imports/api/achievements/server/listeners/AllBonusesInAGame.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {ACHIEVEMENT_ALL_BONUSES_IN_A_GAME} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import {Games} from '/imports/api/games/games.js';

describe('AllBonusesInAGame', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const listener = new AllBonusesInAGame(gameId, userId);

	beforeEach(function() {
		resetDatabase();
	});

	afterEach(function() {
		listener.availableBonuses.restore();
	});

	it('add achievement if none is there and all bonuses are caught', function() {
		Games.insert({_id: gameId, createdBy: userId});
		sinon.stub(listener, 'availableBonuses', function() {
			return [
				'a',
				'b'
			];
		});

		chai.assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(gameId, 'a', 'player1', 'a', 'player1'));
		chai.assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(gameId, 'b', 'player1', 'b', 'player1'));

		chai.assert.equal(1, UserAchievements.find().count());
		const achievement = UserAchievements.findOne();
		chai.assert.notEqual(undefined, achievement);

		chai.assert.strictEqual(userId, achievement.userId);
		chai.assert.strictEqual(ACHIEVEMENT_ALL_BONUSES_IN_A_GAME, achievement.achievementId);
		chai.assert.strictEqual(1, achievement.number);
	});

	it('do not add achievement if different gameId', function() {
		Games.insert({_id: gameId, createdBy: userId});
		sinon.stub(listener, 'availableBonuses', function() {
			return [
				'a'
			];
		});

		chai.assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(Random.id(5), 'a', 'player1', 'a', 'player1'));
		chai.assert.equal(0, UserAchievements.find().count());
	});

	it('do not add achievement if different userId', function() {
		Games.insert({_id: gameId, createdBy: userId});
		sinon.stub(listener, 'availableBonuses', function() {
			return [
				'a'
			];
		});

		chai.assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(gameId, 'a', 'player2', 'a', 'player2'));
		chai.assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment achievement if same bonus twice but not all', function() {
		Games.insert({_id: gameId, createdBy: userId});
		sinon.stub(listener, 'availableBonuses', function() {
			return [
				'a',
				'b'
			];
		});

		chai.assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(gameId, 'a', 'player1', 'a', 'player1'));
		chai.assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(gameId, 'a', 'player1', 'a', 'player1'));
		chai.assert.equal(0, UserAchievements.find().count());
	});
});
