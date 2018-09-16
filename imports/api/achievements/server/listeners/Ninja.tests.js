import {ACHIEVEMENT_NINJA} from '/imports/api/achievements/constants.js';
import Ninja from '/imports/api/achievements/server/listeners/Ninja.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import GameFinished from '/imports/api/games/events/GameFinished.js';
import {Games} from '/imports/api/games/games.js';
import {assert} from 'chai';
import StubCollections from 'meteor/hwillson:stub-collections';
import {Random} from 'meteor/random';

describe('AchievementListener#Ninja', function() {
	const assertNinjaUserAchievementNumberEquals = function(userId, number) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_NINJA, achievement.achievementId);
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

	it('increment achievement if no activated bonus in the game', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new Ninja()).forGame(gameId, creatorUserId);

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 121000));

		assert.equal(1, UserAchievements.find().count());
		assertNinjaUserAchievementNumberEquals(creatorUserId, 1);
	});

	it('increment achievement if activated bonus in the game was from opposite player and user is host', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new Ninja()).forGame(gameId, creatorUserId);

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player2', bonusClass: 'a', activatorPlayerKey: 'player2'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 121000));

		assert.equal(1, UserAchievements.find().count());
		assertNinjaUserAchievementNumberEquals(creatorUserId, 1);
	});

	it('increment achievement if activated bonus in the game was from opposite player and user is client', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new Ninja()).forGame(gameId, opponentUserId);

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 121000));

		assert.equal(1, UserAchievements.find().count());
		assertNinjaUserAchievementNumberEquals(opponentUserId, 1);
	});

	it('do not increment achievement if no activated bonus in the game but game is under 2:00', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new Ninja()).forGame(gameId, creatorUserId);

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 120000));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment achievement if there was an activated bonus in the game and user is host', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new Ninja()).forGame(gameId, creatorUserId);

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 121000));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment achievement if there was an activated bonus in the game and user is client', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new Ninja()).forGame(gameId, opponentUserId);

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player2', bonusClass: 'a', activatorPlayerKey: 'player2'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 121000));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment achievement if no game', function() {
		const gameId = Random.id(5);
		const creatorUserId = Random.id(5);
		const opponentUserId = Random.id(5);
		Games.insert({_id: gameId, createdBy: creatorUserId, players: [{id: creatorUserId}, {id: opponentUserId}]});
		const listener = (new Ninja()).forGame(gameId, creatorUserId);

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(Random.id(5), 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment achievement if no player', function() {
		const gameId = Random.id(5);
		const userId = Random.id(5);
		const listener = (new Ninja()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: []});

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 121000));
		assert.equal(0, UserAchievements.find().count());
	});
});
