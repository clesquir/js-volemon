import {assert} from 'chai';
import {resetDatabase} from 'meteor/xolvio:cleaner';
import {Random} from 'meteor/random';
import Ninja from '/imports/api/achievements/server/listeners/Ninja.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {ACHIEVEMENT_NINJA} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import GameFinished from '/imports/api/games/events/GameFinished.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';

describe('AchievementListener#Ninja', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const opponentUserId = Random.id(5);
	const assertNinjaUserAchievementNumberEquals = function(number) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_NINJA, achievement.achievementId);
		assert.strictEqual(number, achievement.number);
	};

	beforeEach(function() {
		resetDatabase();
	});

	afterEach(function() {
		resetDatabase();
	});

	it('increment achievement if no activated bonus in the game', function() {
		const listener = new Ninja(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 121000));

		assert.equal(1, UserAchievements.find().count());
		assertNinjaUserAchievementNumberEquals(1);
	});

	it('increment achievement if activated bonus in the game was from opposite player and user is host', function() {
		const listener = new Ninja(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player2', bonusClass: 'a', activatorPlayerKey: 'player2'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 121000));

		assert.equal(1, UserAchievements.find().count());
		assertNinjaUserAchievementNumberEquals(1);
	});

	it('increment achievement if activated bonus in the game was from opposite player and user is client', function() {
		const listener = new Ninja(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 121000));

		assert.equal(1, UserAchievements.find().count());
		assertNinjaUserAchievementNumberEquals(1);
	});

	it('do not increment achievement if no activated bonus in the game but game is under 2:00', function() {
		const listener = new Ninja(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 120000));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment achievement if there was an activated bonus in the game and user is host', function() {
		const listener = new Ninja(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player1', bonusClass: 'a', activatorPlayerKey: 'player1'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 121000));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment achievement if there was an activated bonus in the game and user is client', function() {
		const listener = new Ninja(gameId, userId);
		Games.insert({_id: gameId, createdBy: opponentUserId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		listener.onBonusCaught(new BonusCaught(gameId, 'a', {activatedBonusClass: 'a', targetPlayerKey: 'player2', bonusClass: 'a', activatorPlayerKey: 'player2'}));

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 121000));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment achievement if no game', function() {
		const listener = new Ninja(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		Players.insert({gameId: gameId, userId: opponentUserId});

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(Random.id(5), 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment achievement if no player', function() {
		const listener = new Ninja(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 121000));
		assert.equal(0, UserAchievements.find().count());
	});
});
