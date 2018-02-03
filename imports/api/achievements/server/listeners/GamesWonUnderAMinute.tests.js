import {ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE} from '/imports/api/achievements/constants.js';
import GamesWonUnderAMinute from '/imports/api/achievements/server/listeners/GamesWonUnderAMinute.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {assert} from 'chai';
import {Random} from 'meteor/random';
import {resetDatabase} from 'meteor/xolvio:cleaner';

describe('AchievementListener#GamesWonUnderAMinute', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const listener = (new GamesWonUnderAMinute()).forGame(gameId, userId);
	const assertGamesWonUnderAMinuteUserAchievementNumberEquals = function(number) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE, achievement.achievementId);
		assert.strictEqual(number, achievement.number);
	};

	beforeEach(function() {
		resetDatabase();
	});

	it('creates achievement if not created on player won', function() {
		Games.insert({_id: gameId, createdBy: userId, gameDuration: 59000});
		Players.insert({gameId: gameId, userId: userId});

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));

		assert.equal(1, UserAchievements.find().count());
		assertGamesWonUnderAMinuteUserAchievementNumberEquals(1);
	});

	it('do not create achievement if not created if game duration not under a minute on player won', function() {
		Games.insert({_id: gameId, createdBy: userId, gameDuration: 60000});
		Players.insert({gameId: gameId, userId: userId});

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if not created if not gameId on player won', function() {
		Games.insert({_id: gameId, createdBy: userId, gameDuration: 59000});
		Players.insert({gameId: gameId, userId: userId});

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(Random.id(5), userId, 5, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if not created if not userId on player won', function() {
		Games.insert({_id: gameId, createdBy: userId, gameDuration: 59000});
		Players.insert({gameId: gameId, userId: userId});

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(gameId, Random.id(5), 5, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('update achievement on player won', function() {
		Games.insert({_id: gameId, createdBy: userId, gameDuration: 59000});
		Players.insert({gameId: gameId, userId: userId});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE, number: 1});

		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));

		assertGamesWonUnderAMinuteUserAchievementNumberEquals(2);
	});

	it('do not update achievement if game duration not under a minute on player won', function() {
		Games.insert({_id: gameId, createdBy: userId, gameDuration: 60000});
		Players.insert({gameId: gameId, userId: userId});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE, number: 1});

		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));

		assertGamesWonUnderAMinuteUserAchievementNumberEquals(1);
	});

	it('do not update achievement if not gameId on player won', function() {
		Games.insert({_id: gameId, createdBy: userId, gameDuration: 59000});
		Players.insert({gameId: gameId, userId: userId});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE, number: 1});

		listener.onPlayerWon(new PlayerWon(Random.id(5), userId, 5, 0));

		assertGamesWonUnderAMinuteUserAchievementNumberEquals(1);
	});

	it('do not update achievement if not userId on player won', function() {
		Games.insert({_id: gameId, createdBy: userId, gameDuration: 59000});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE, number: 1});

		listener.onPlayerWon(new PlayerWon(gameId, Random.id(5), 5, 0));

		assertGamesWonUnderAMinuteUserAchievementNumberEquals(1);
	});
});
