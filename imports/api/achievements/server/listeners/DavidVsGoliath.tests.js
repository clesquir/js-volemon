import {ACHIEVEMENT_DAVID_VS_GOLIATH} from '/imports/api/achievements/constants.js';
import DavidVsGoliath from '/imports/api/achievements/server/listeners/DavidVsGoliath.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import PlayerWon from '/imports/api/games/events/PlayerWon';
import {Games} from '/imports/api/games/games.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {assert} from 'chai';
import StubCollections from 'meteor/hwillson:stub-collections';
import {Random} from 'meteor/random';

describe('AchievementListener#DavidVsGoliath', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const opponentUserId = Random.id(5);
	const assertDavidVsGoliathUserAchievementNumberEquals = function(number) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_DAVID_VS_GOLIATH, achievement.achievementId);
		assert.strictEqual(number, achievement.number);
	};

	before(function() {
		StubCollections.add([Games, UserAchievements, Profiles]);
	});

	beforeEach(function() {
		StubCollections.stub();
	});

	afterEach(function() {
		StubCollections.restore();
	});

	it('creates achievement if not created on player won against opponent with elo >= 150', function() {
		const listener = (new DavidVsGoliath()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		Profiles.insert({userId: userId, eloRating: 1000});
		Profiles.insert({userId: opponentUserId, eloRating: 1150});

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));

		assert.equal(1, UserAchievements.find().count());
		assertDavidVsGoliathUserAchievementNumberEquals(1);
	});

	it('do not create achievement if not created if opponent elo < 150 on player won', function() {
		const listener = (new DavidVsGoliath()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		Profiles.insert({userId: userId, eloRating: 1000});
		Profiles.insert({userId: opponentUserId, eloRating: 1149});

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if not created if not gameId on player won', function() {
		const listener = (new DavidVsGoliath()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		Profiles.insert({userId: userId, eloRating: 1000});
		Profiles.insert({userId: opponentUserId, eloRating: 1150});

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(Random.id(5), userId, 5, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if not created if not userId on player won', function() {
		const listener = (new DavidVsGoliath()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		Profiles.insert({userId: userId, eloRating: 1000});
		Profiles.insert({userId: opponentUserId, eloRating: 1150});

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(gameId, Random.id(5), 5, 0));
		assert.equal(0, UserAchievements.find().count());
	});

	it('update achievement on player won against opponent with elo >= 150', function() {
		const listener = (new DavidVsGoliath()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		Profiles.insert({userId: userId, eloRating: 1000});
		Profiles.insert({userId: opponentUserId, eloRating: 1150});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_DAVID_VS_GOLIATH, number: 1});

		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));

		assertDavidVsGoliathUserAchievementNumberEquals(2);
	});

	it('do not update achievement if opponent elo < 150 on player won', function() {
		const listener = (new DavidVsGoliath()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		Profiles.insert({userId: userId, eloRating: 1000});
		Profiles.insert({userId: opponentUserId, eloRating: 1149});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_DAVID_VS_GOLIATH, number: 1});

		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));

		assertDavidVsGoliathUserAchievementNumberEquals(1);
	});

	it('do not update achievement if not gameId on player won', function() {
		const listener = (new DavidVsGoliath()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		Profiles.insert({userId: userId, eloRating: 1000});
		Profiles.insert({userId: opponentUserId, eloRating: 1150});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_DAVID_VS_GOLIATH, number: 1});

		listener.onPlayerWon(new PlayerWon(Random.id(5), userId, 5, 0));

		assertDavidVsGoliathUserAchievementNumberEquals(1);
	});

	it('do not update achievement if not userId on player won', function() {
		const listener = (new DavidVsGoliath()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId}, {id: opponentUserId}]});
		Profiles.insert({userId: userId, eloRating: 1000});
		Profiles.insert({userId: opponentUserId, eloRating: 1150});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_DAVID_VS_GOLIATH, number: 1});

		listener.onPlayerWon(new PlayerWon(gameId, Random.id(5), 5, 0));

		assertDavidVsGoliathUserAchievementNumberEquals(1);
	});
});
