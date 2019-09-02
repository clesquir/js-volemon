import {ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE} from '/imports/api/achievements/constants.js';
import GamesWonUnderAMinute from '/imports/api/achievements/server/listeners/GamesWonUnderAMinute.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import PlayerWon from '/imports/api/games/events/PlayerWon';
import {Games} from '/imports/api/games/games.js';
import {assert} from 'chai';
import StubCollections from 'meteor/hwillson:stub-collections';
import {Random} from 'meteor/random';

describe('AchievementListener#GamesWonUnderAMinute', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const opponentUserId = Random.id(5);
	const assertGamesWonUnderAMinuteUserAchievementNumberEquals = function(number) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE, achievement.achievementId);
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

	it('creates achievement if not created on player won', function() {
		Games.insert({_id: gameId, createdBy: userId, gameDuration: 59000, players: [{id: userId}, {id: opponentUserId}]});

		assert.equal(0, UserAchievements.find().count());
		const listener = (new GamesWonUnderAMinute()).forGame(gameId, userId);
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));

		assert.equal(1, UserAchievements.find().count());
		assertGamesWonUnderAMinuteUserAchievementNumberEquals(1);
	});

	it('do not create achievement if not created if game duration not under a minute on player won', function() {
		Games.insert({_id: gameId, createdBy: userId, gameDuration: 60000, players: [{id: userId}, {id: opponentUserId}]});

		assert.equal(0, UserAchievements.find().count());
		const listener = (new GamesWonUnderAMinute()).forGame(gameId, userId);
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if not created if not gameId on player won', function() {
		Games.insert({_id: gameId, createdBy: userId, gameDuration: 59000, players: [{id: userId}, {id: opponentUserId}]});

		assert.equal(0, UserAchievements.find().count());
		const listener = (new GamesWonUnderAMinute()).forGame(gameId, userId);
		listener.onPlayerWon(new PlayerWon(Random.id(5), userId, 5, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if not created if not userId on player won', function() {
		Games.insert({_id: gameId, createdBy: userId, gameDuration: 59000, players: [{id: userId}, {id: opponentUserId}]});

		assert.equal(0, UserAchievements.find().count());
		const listener = (new GamesWonUnderAMinute()).forGame(gameId, userId);
		listener.onPlayerWon(new PlayerWon(gameId, Random.id(5), 5, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('update achievement on player won', function() {
		Games.insert({_id: gameId, createdBy: userId, gameDuration: 59000, players: [{id: userId}, {id: opponentUserId}]});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE, number: 1});

		const listener = (new GamesWonUnderAMinute()).forGame(gameId, userId);
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));

		assertGamesWonUnderAMinuteUserAchievementNumberEquals(2);
	});

	it('do not update achievement if game duration not under a minute on player won', function() {
		Games.insert({_id: gameId, createdBy: userId, gameDuration: 60000, players: [{id: userId}, {id: opponentUserId}]});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE, number: 1});

		const listener = (new GamesWonUnderAMinute()).forGame(gameId, userId);
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));

		assertGamesWonUnderAMinuteUserAchievementNumberEquals(1);
	});

	it('do not update achievement if not gameId on player won', function() {
		Games.insert({_id: gameId, createdBy: userId, gameDuration: 59000, players: [{id: userId}, {id: opponentUserId}]});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE, number: 1});

		const listener = (new GamesWonUnderAMinute()).forGame(gameId, userId);
		listener.onPlayerWon(new PlayerWon(Random.id(5), userId, 5, 0));

		assertGamesWonUnderAMinuteUserAchievementNumberEquals(1);
	});

	it('do not update achievement if not userId on player won', function() {
		Games.insert({_id: gameId, createdBy: userId, gameDuration: 59000, players: [{id: userId}, {id: opponentUserId}]});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE, number: 1});

		const listener = (new GamesWonUnderAMinute()).forGame(gameId, userId);
		listener.onPlayerWon(new PlayerWon(gameId, Random.id(5), 5, 0));

		assertGamesWonUnderAMinuteUserAchievementNumberEquals(1);
	});
});
