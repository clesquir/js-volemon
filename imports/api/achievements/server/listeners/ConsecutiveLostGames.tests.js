import {ACHIEVEMENT_CONSECUTIVE_LOST_GAMES} from '/imports/api/achievements/constants.js';
import ConsecutiveLostGames from '/imports/api/achievements/server/listeners/ConsecutiveLostGames.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import PlayerLost from '/imports/api/games/events/PlayerLost.js';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {assert} from 'chai';
import {Random} from 'meteor/random';
import {resetDatabase} from 'meteor/xolvio:cleaner';

describe('AchievementListener#ConsecutiveLostGames', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const opponentUserId = Random.id(5);
	const assertConsecutiveLostGamesUserAchievementNumberEquals = function(number) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_CONSECUTIVE_LOST_GAMES, achievement.achievementId);
		assert.strictEqual(number, achievement.number);
	};

	beforeEach(function() {
		resetDatabase();
	});

	it('creates achievement to 1 if not created on player lost', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		Players.insert({gameId: gameId, userId: userId});

		assert.equal(0, UserAchievements.find().count());
		const listener = (new ConsecutiveLostGames()).forGame(gameId, userId);
		listener.onPlayerLost(new PlayerLost(gameId, userId, 5, 0));

		assert.equal(1, UserAchievements.find().count());
		assertConsecutiveLostGamesUserAchievementNumberEquals(1);
		assert.equal(1, listener.numberSinceLastReset);
	});

	it('creates achievement to 0 if not created on player won', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		Players.insert({gameId: gameId, userId: userId});

		assert.equal(0, UserAchievements.find().count());
		const listener = (new ConsecutiveLostGames()).forGame(gameId, userId);
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));

		assert.equal(1, UserAchievements.find().count());
		assertConsecutiveLostGamesUserAchievementNumberEquals(0);
		assert.equal(0, listener.numberSinceLastReset);
	});

	it('do not create achievement if not created if not gameId on player lost', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		Players.insert({gameId: gameId, userId: userId});

		assert.equal(0, UserAchievements.find().count());
		const listener = (new ConsecutiveLostGames()).forGame(gameId, userId);
		listener.onPlayerLost(new PlayerLost(Random.id(5), userId, 5, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if not created if not gameId on player won', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		Players.insert({gameId: gameId, userId: userId});

		assert.equal(0, UserAchievements.find().count());
		const listener = (new ConsecutiveLostGames()).forGame(gameId, userId);
		listener.onPlayerWon(new PlayerWon(Random.id(5), userId, 5, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if not created if userId is not the current user on player lost', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		Players.insert({gameId: gameId, userId: userId});

		assert.equal(0, UserAchievements.find().count());
		const listener = (new ConsecutiveLostGames()).forGame(gameId, userId);
		listener.onPlayerLost(new PlayerLost(gameId, Random.id(5), 5, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if not created if userId is not the current user on player won', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		Players.insert({gameId: gameId, userId: userId});

		assert.equal(0, UserAchievements.find().count());
		const listener = (new ConsecutiveLostGames()).forGame(gameId, userId);
		listener.onPlayerWon(new PlayerWon(gameId, Random.id(5), 5, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('increment achievement on player lost for two consecutive games', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		Players.insert({gameId: gameId, userId: userId});

		assert.equal(0, UserAchievements.find().count());
		let listener = (new ConsecutiveLostGames()).forGame(gameId, userId);
		listener.onPlayerLost(new PlayerLost(gameId, userId, 5, 0));

		assert.equal(1, UserAchievements.find().count());
		assertConsecutiveLostGamesUserAchievementNumberEquals(1);
		assert.equal(1, listener.numberSinceLastReset);

		listener = (new ConsecutiveLostGames()).forGame(gameId, userId);
		listener.onPlayerLost(new PlayerLost(gameId, userId, 5, 0));

		assertConsecutiveLostGamesUserAchievementNumberEquals(2);
		assert.equal(2, listener.numberSinceLastReset);
	});

	it('achievement will be incremented only if loss streaks are greater than previous loss streaks after a win', function() {
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		Players.insert({gameId: gameId, userId: userId});

		assert.equal(0, UserAchievements.find().count());
		let listener = (new ConsecutiveLostGames()).forGame(gameId, userId);
		listener.onPlayerLost(new PlayerLost(gameId, userId, 5, 0));

		assert.equal(1, UserAchievements.find().count());
		assertConsecutiveLostGamesUserAchievementNumberEquals(1);
		assert.equal(1, listener.numberSinceLastReset);

		listener = (new ConsecutiveLostGames()).forGame(gameId, userId);
		listener.onPlayerLost(new PlayerLost(gameId, userId, 5, 0));

		assertConsecutiveLostGamesUserAchievementNumberEquals(2);
		assert.equal(2, listener.numberSinceLastReset);

		listener = (new ConsecutiveLostGames()).forGame(gameId, userId);
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));

		assertConsecutiveLostGamesUserAchievementNumberEquals(2);
		assert.equal(0, listener.numberSinceLastReset);

		listener = (new ConsecutiveLostGames()).forGame(gameId, userId);
		listener.onPlayerLost(new PlayerLost(gameId, userId, 5, 0));

		assertConsecutiveLostGamesUserAchievementNumberEquals(2);
		assert.equal(1, listener.numberSinceLastReset);

		listener = (new ConsecutiveLostGames()).forGame(gameId, userId);
		listener.onPlayerLost(new PlayerLost(gameId, userId, 5, 0));

		assertConsecutiveLostGamesUserAchievementNumberEquals(2);
		assert.equal(2, listener.numberSinceLastReset);

		listener = (new ConsecutiveLostGames()).forGame(gameId, userId);
		listener.onPlayerLost(new PlayerLost(gameId, userId, 5, 0));

		assertConsecutiveLostGamesUserAchievementNumberEquals(3);
		assert.equal(3, listener.numberSinceLastReset);
	});
});
