import {ACHIEVEMENT_ALL_BONUSES_IN_A_GAME} from '/imports/api/achievements/constants.js';
import AllBonusesInAGame from '/imports/api/achievements/server/listeners/AllBonusesInAGame.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import BonusCaught from '/imports/api/games/events/BonusCaught';
import {Games} from '/imports/api/games/games.js';
import {assert} from 'chai';
import StubCollections from 'meteor/hwillson:stub-collections';
import {Random} from 'meteor/random';
import sinon from 'sinon';

describe('AchievementListener#AllBonusesInAGame', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);

	before(function() {
		StubCollections.add([Games, UserAchievements]);
	});

	beforeEach(function() {
		StubCollections.stub();
	});

	afterEach(function() {
		StubCollections.restore();
	});

	it('add achievement if none is there and all bonuses are caught', function() {
		const listener = (new AllBonusesInAGame()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}]});
		sinon.stub(listener, 'availableBonuses').callsFake(function() {
			return [
				'a',
				'b'
			];
		});

		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(
			new BonusCaught(
				gameId,
				'a',
				{
					activatedBonusClass: 'a',
					targetPlayerKey: 'player1',
					bonusClass: 'a',
					activatorPlayerKey: 'player1'
				}
			)
		);
		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(
			new BonusCaught(
				gameId,
				'a',
				{
					activatedBonusClass: 'b',
					targetPlayerKey: 'player1',
					bonusClass: 'b',
					activatorPlayerKey: 'player1'
				}
			)
		);

		assert.equal(1, UserAchievements.find().count());
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_ALL_BONUSES_IN_A_GAME, achievement.achievementId);
		assert.strictEqual(1, achievement.number);
	});

	it('do not add achievement if different gameId', function() {
		const listener = (new AllBonusesInAGame()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}]});
		sinon.stub(listener, 'availableBonuses').callsFake(function() {
			return [
				'a'
			];
		});

		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(
			new BonusCaught(
				Random.id(5),
				'a',
				{
					activatedBonusClass: 'a',
					targetPlayerKey: 'player1',
					bonusClass: 'a',
					activatorPlayerKey: 'player1'
				}
			)
		);
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not add achievement if different userId', function() {
		const listener = (new AllBonusesInAGame()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}]});
		sinon.stub(listener, 'availableBonuses').callsFake(function() {
			return [
				'a'
			];
		});

		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(
			new BonusCaught(
				gameId,
				'a',
				{
					activatedBonusClass: 'a',
					targetPlayerKey: 'player2',
					bonusClass: 'a',
					activatorPlayerKey: 'player2'
				}
			)
		);
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment achievement if same bonus twice but not all', function() {
		const listener = (new AllBonusesInAGame()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}]});
		sinon.stub(listener, 'availableBonuses').callsFake(function() {
			return [
				'a',
				'b'
			];
		});

		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(
			new BonusCaught(
				gameId,
				'a',
				{
					activatedBonusClass: 'a',
					targetPlayerKey: 'player1',
					bonusClass: 'a',
					activatorPlayerKey: 'player1'
				}
			)
		);
		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(
			new BonusCaught(
				gameId,
				'a',
				{
					activatedBonusClass: 'a',
					targetPlayerKey: 'player1',
					bonusClass: 'a',
					activatorPlayerKey: 'player1'
				}
			)
		);
		assert.equal(0, UserAchievements.find().count());
	});
});
