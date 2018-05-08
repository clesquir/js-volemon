import {ACHIEVEMENT_NINJA} from '/imports/api/achievements/constants.js';
import Ninja from '/imports/api/achievements/server/listeners/Ninja.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import GameFinished from '/imports/api/games/events/GameFinished.js';
import OneVersusOneStartedGameFixture from '/imports/api/games/fixture/OneVersusOneStartedGameFixture.js';
import {Games} from '/imports/api/games/games.js';
import {assert} from 'chai';
import {Random} from 'meteor/random';
import {resetDatabase} from 'meteor/xolvio:cleaner';

describe('AchievementListener#Ninja', function() {
	const assertNinjaUserAchievementNumberEquals = function(userId, number) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_NINJA, achievement.achievementId);
		assert.strictEqual(number, achievement.number);
	};

	beforeEach(function() {
		resetDatabase();
	});

	it('increment achievement if no activated bonus in the game', function() {
		const gameFixture = OneVersusOneStartedGameFixture.create();
		const listener = (new Ninja()).forGame(gameFixture.gameId, gameFixture.creatorUserId);

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameFixture.gameId, 121000));

		assert.equal(1, UserAchievements.find().count());
		assertNinjaUserAchievementNumberEquals(gameFixture.creatorUserId, 1);
	});

	it('increment achievement if activated bonus in the game was from opposite player and user is host', function() {
		const gameFixture = OneVersusOneStartedGameFixture.create();
		const listener = (new Ninja()).forGame(gameFixture.gameId, gameFixture.creatorUserId);

		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player2', bonusClass: 'a', activatorPlayerKey: 'player2'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameFixture.gameId, 121000));

		assert.equal(1, UserAchievements.find().count());
		assertNinjaUserAchievementNumberEquals(gameFixture.creatorUserId, 1);
	});

	it('increment achievement if activated bonus in the game was from opposite player and user is client', function() {
		const gameFixture = OneVersusOneStartedGameFixture.create();
		const listener = (new Ninja()).forGame(gameFixture.gameId, gameFixture.opponentUserId);

		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameFixture.gameId, 121000));

		assert.equal(1, UserAchievements.find().count());
		assertNinjaUserAchievementNumberEquals(gameFixture.opponentUserId, 1);
	});

	it('do not increment achievement if no activated bonus in the game but game is under 2:00', function() {
		const gameFixture = OneVersusOneStartedGameFixture.create();
		const listener = (new Ninja()).forGame(gameFixture.gameId, gameFixture.creatorUserId);

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameFixture.gameId, 120000));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment achievement if there was an activated bonus in the game and user is host', function() {
		const gameFixture = OneVersusOneStartedGameFixture.create();
		const listener = (new Ninja()).forGame(gameFixture.gameId, gameFixture.creatorUserId);

		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameFixture.gameId, 121000));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment achievement if there was an activated bonus in the game and user is client', function() {
		const gameFixture = OneVersusOneStartedGameFixture.create();
		const listener = (new Ninja()).forGame(gameFixture.gameId, gameFixture.opponentUserId);

		listener.onBonusCaught(new BonusCaught(gameFixture.gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player2', bonusClass: 'a', activatorPlayerKey: 'player2'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameFixture.gameId, 121000));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment achievement if no game', function() {
		const gameFixture = OneVersusOneStartedGameFixture.create();
		const listener = (new Ninja()).forGame(gameFixture.gameId, gameFixture.userId);

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(Random.id(5), 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment achievement if no player', function() {
		const gameId = Random.id(5);
		const userId = Random.id(5);
		const listener = (new Ninja()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 121000));
		assert.equal(0, UserAchievements.find().count());
	});
});
