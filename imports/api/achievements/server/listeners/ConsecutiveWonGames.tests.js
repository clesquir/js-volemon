import {chai} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {resetDatabase} from 'meteor/xolvio:cleaner';
import {Random} from 'meteor/random';
import ConsecutiveWonGames from '/imports/api/achievements/server/listeners/ConsecutiveWonGames.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {ACHIEVEMENT_CONSECUTIVE_WON_GAMES} from '/imports/api/achievements/constants.js';
import PlayerLost from '/imports/api/games/events/PlayerLost.js';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';

describe('ConsecutiveWonGames', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const assertConsecutiveWonGamesUserAchievementNumberEquals = function(number) {
		const achievement = UserAchievements.findOne();
		chai.assert.notEqual(undefined, achievement);

		chai.assert.strictEqual(userId, achievement.userId);
		chai.assert.strictEqual(ACHIEVEMENT_CONSECUTIVE_WON_GAMES, achievement.achievementId);
		chai.assert.strictEqual(number, achievement.number);
	};

	beforeEach(function() {
		resetDatabase();
	});

	it('creates achievement to 1 if not created on player won', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});

		chai.assert.equal(0, UserAchievements.find().count());
		const listener = new ConsecutiveWonGames(gameId, userId);
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));

		chai.assert.equal(1, UserAchievements.find().count());
		assertConsecutiveWonGamesUserAchievementNumberEquals(1);
		chai.assert.equal(1, listener.numberSinceLastReset);
	});

	it('creates achievement to 0 if not created on player won', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});

		chai.assert.equal(0, UserAchievements.find().count());
		const listener = new ConsecutiveWonGames(gameId, userId);
		listener.onPlayerLost(new PlayerLost(gameId, userId, 5, 0));

		chai.assert.equal(1, UserAchievements.find().count());
		assertConsecutiveWonGamesUserAchievementNumberEquals(0);
		chai.assert.equal(0, listener.numberSinceLastReset);
	});

	it('do not create achievement if not created if not gameId on player won', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});

		chai.assert.equal(0, UserAchievements.find().count());
		const listener = new ConsecutiveWonGames(gameId, userId);
		listener.onPlayerWon(new PlayerWon(Random.id(5), userId, 5, 0));
		chai.assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if not created if not gameId on player lost', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});

		chai.assert.equal(0, UserAchievements.find().count());
		const listener = new ConsecutiveWonGames(gameId, userId);
		listener.onPlayerLost(new PlayerLost(Random.id(5), userId, 5, 0));
		chai.assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if not created if userId is not the current user on player won', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});

		chai.assert.equal(0, UserAchievements.find().count());
		const listener = new ConsecutiveWonGames(gameId, userId);
		listener.onPlayerWon(new PlayerWon(gameId, Random.id(5), 5, 0));
		chai.assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if not created if userId is not the current user on player lost', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});

		chai.assert.equal(0, UserAchievements.find().count());
		const listener = new ConsecutiveWonGames(gameId, userId);
		listener.onPlayerLost(new PlayerLost(gameId, Random.id(5), 5, 0));
		chai.assert.equal(0, UserAchievements.find().count());
	});

	it('increment achievement on player won for two consecutive games', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});

		chai.assert.equal(0, UserAchievements.find().count());
		let listener = new ConsecutiveWonGames(gameId, userId);
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));

		chai.assert.equal(1, UserAchievements.find().count());
		assertConsecutiveWonGamesUserAchievementNumberEquals(1);
		chai.assert.equal(1, listener.numberSinceLastReset);

		listener = new ConsecutiveWonGames(gameId, userId);
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));

		assertConsecutiveWonGamesUserAchievementNumberEquals(2);
		chai.assert.equal(2, listener.numberSinceLastReset);
	});

	it('achievement will be incremented only if win strikes are greater than previous win strikes after a loss', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});

		chai.assert.equal(0, UserAchievements.find().count());
		let listener = new ConsecutiveWonGames(gameId, userId);
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));

		chai.assert.equal(1, UserAchievements.find().count());
		assertConsecutiveWonGamesUserAchievementNumberEquals(1);
		chai.assert.equal(1, listener.numberSinceLastReset);

		listener = new ConsecutiveWonGames(gameId, userId);
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));

		assertConsecutiveWonGamesUserAchievementNumberEquals(2);
		chai.assert.equal(2, listener.numberSinceLastReset);

		listener = new ConsecutiveWonGames(gameId, userId);
		listener.onPlayerLost(new PlayerLost(gameId, userId, 5, 0));

		assertConsecutiveWonGamesUserAchievementNumberEquals(2);
		chai.assert.equal(0, listener.numberSinceLastReset);

		listener = new ConsecutiveWonGames(gameId, userId);
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));

		assertConsecutiveWonGamesUserAchievementNumberEquals(2);
		chai.assert.equal(1, listener.numberSinceLastReset);

		listener = new ConsecutiveWonGames(gameId, userId);
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));

		assertConsecutiveWonGamesUserAchievementNumberEquals(2);
		chai.assert.equal(2, listener.numberSinceLastReset);

		listener = new ConsecutiveWonGames(gameId, userId);
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));

		assertConsecutiveWonGamesUserAchievementNumberEquals(3);
		chai.assert.equal(3, listener.numberSinceLastReset);
	});
});