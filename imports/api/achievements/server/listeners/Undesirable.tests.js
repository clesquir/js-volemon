import {ACHIEVEMENT_UNDESIRABLE} from '/imports/api/achievements/constants.js';
import Undesirable from '/imports/api/achievements/server/listeners/Undesirable';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import BonusCaught from '/imports/api/games/events/BonusCaught';
import BonusCreated from '/imports/api/games/events/BonusCreated';
import PointTaken from '/imports/api/games/events/PointTaken';
import {Games} from '/imports/api/games/games.js';
import {assert} from 'chai';
import StubCollections from 'meteor/hwillson:stub-collections';
import {Random} from 'meteor/random';

describe('AchievementListener#Undesirable', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const opponentUserId = Random.id(5);
	const assertUndesirableUserAchievementNumberEquals = function(number) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_UNDESIRABLE, achievement.achievementId);
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

	it('increment achievement when bonus is caught', function() {
		const listener = (new Undesirable()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCreated(new BonusCreated(gameId, {bonusIdentifier: 'a', createdAt: 1000}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {bonusIdentifier: 'a'}));
		assert.equal(1, UserAchievements.find().count());
	});

	it('increment achievement when point is taken', function() {
		const listener = (new Undesirable()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCreated(new BonusCreated(gameId, {bonusIdentifier: 'a', createdAt: 1000}));
		assert.equal(0, UserAchievements.find().count());

		listener.onPointTaken(new PointTaken(gameId));
		assert.equal(1, UserAchievements.find().count());
	});

	it('increment achievement when point is taken with multiple bonuses', function() {
		const listener = (new Undesirable()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCreated(new BonusCreated(gameId, {bonusIdentifier: 'a', createdAt: 1000}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCreated(new BonusCreated(gameId, {bonusIdentifier: 'b', createdAt: 2000}));
		assert.equal(0, UserAchievements.find().count());

		listener.onPointTaken(new PointTaken(gameId));
		assert.equal(1, UserAchievements.find().count());
	});

	it('do not increment achievement if not game on caught', function() {
		const listener = (new Undesirable()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCreated(new BonusCreated(gameId, {bonusIdentifier: 'a', createdAt: 1000}));
		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCaught(new BonusCaught(Random.id(5), 'a', {bonusIdentifier: 'a'}));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment achievement if not game on point taken', function() {
		const listener = (new Undesirable()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		assert.equal(0, UserAchievements.find().count());

		listener.onBonusCreated(new BonusCreated(gameId, {bonusIdentifier: 'a', createdAt: 1000}));
		assert.equal(0, UserAchievements.find().count());

		listener.onPointTaken(new PointTaken(Random.id(5)));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment achievement if no bonuses on point taken', function() {
		const listener = (new Undesirable()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});

		assert.equal(0, UserAchievements.find().count());

		listener.onPointTaken(new PointTaken(gameId));
		assert.equal(0, UserAchievements.find().count());
	});
});
