import {assert} from 'chai';
import sinon from 'sinon';
import {resetDatabase} from 'meteor/xolvio:cleaner';
import {Random} from 'meteor/random';
import CarefullyRandomlyPicked from '/imports/api/achievements/server/listeners/CarefullyRandomlyPicked.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {ACHIEVEMENT_CAREFULLY_RANDOMLY_PICKED} from '/imports/api/achievements/constants.js';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {PLAYER_SHAPE_RANDOM} from '/imports/api/games/shapeConstants.js';

describe('AchievementListener#CarefullyRandomlyPicked', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const stubListOfShapes = function(listener, listOfShapes) {
		sinon.stub(listener, 'listOfShapes').callsFake(function() {
			return listOfShapes;
		});
	};
	const assertCarefullyRandomlyPickedUserAchievementNumberEquals = function(number) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_CAREFULLY_RANDOMLY_PICKED, achievement.achievementId);
		assert.strictEqual(number, achievement.number);
	};

	beforeEach(function() {
		resetDatabase();
	});

	afterEach(function() {
		resetDatabase();
	});

	it('creates achievement if not created on player won', function() {
		const listener = new CarefullyRandomlyPicked(gameId, userId);
		stubListOfShapes(listener, ['a', 'b']);
		Games.insert({_id: gameId, createdBy: userId, gameDuration: 59000});
		Players.insert({gameId: gameId, userId: userId, selectedShape: PLAYER_SHAPE_RANDOM, shape: 'a'});

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));

		assert.equal(1, UserAchievements.find().count());
		assertCarefullyRandomlyPickedUserAchievementNumberEquals(0);
	});

	it('update achievement on player won increment if all shapes have been played once', function() {
		const listener = new CarefullyRandomlyPicked(gameId, userId);
		stubListOfShapes(listener, ['a', 'b']);
		Games.insert({_id: gameId, createdBy: userId, gameDuration: 59000});
		Players.insert({gameId: gameId, userId: userId, selectedShape: PLAYER_SHAPE_RANDOM, shape: 'b'});
		UserAchievements.insert({
			userId: userId,
			achievementId: ACHIEVEMENT_CAREFULLY_RANDOMLY_PICKED,
			shapes: {a: 1},
			number: 0
		});

		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));

		assertCarefullyRandomlyPickedUserAchievementNumberEquals(1);
	});

	it('update achievement on player won do not increment if there is a shape never played with', function() {
		const listener = new CarefullyRandomlyPicked(gameId, userId);
		stubListOfShapes(listener, ['a', 'b']);
		Games.insert({_id: gameId, createdBy: userId, gameDuration: 59000});
		Players.insert({gameId: gameId, userId: userId, selectedShape: PLAYER_SHAPE_RANDOM, shape: 'a'});
		UserAchievements.insert({
			userId: userId,
			achievementId: ACHIEVEMENT_CAREFULLY_RANDOMLY_PICKED,
			shapes: {a: 1},
			number: 0
		});

		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));

		assertCarefullyRandomlyPickedUserAchievementNumberEquals(0);
	});

	it('update achievement on player won increment if this is the second won for all shapes', function() {
		const listener = new CarefullyRandomlyPicked(gameId, userId);
		stubListOfShapes(listener, ['a', 'b']);
		Games.insert({_id: gameId, createdBy: userId, gameDuration: 59000});
		Players.insert({gameId: gameId, userId: userId, selectedShape: PLAYER_SHAPE_RANDOM, shape: 'a'});
		UserAchievements.insert({
			userId: userId,
			achievementId: ACHIEVEMENT_CAREFULLY_RANDOMLY_PICKED,
			shapes: {a: 1, b: 2},
			number: 1
		});

		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));

		assertCarefullyRandomlyPickedUserAchievementNumberEquals(2);
	});

	it('update achievement on player won do not increment if one shape has not been won twice', function() {
		const listener = new CarefullyRandomlyPicked(gameId, userId);
		stubListOfShapes(listener, ['a', 'b']);
		Games.insert({_id: gameId, createdBy: userId, gameDuration: 59000});
		Players.insert({gameId: gameId, userId: userId, selectedShape: PLAYER_SHAPE_RANDOM, shape: 'a'});
		UserAchievements.insert({
			userId: userId,
			achievementId: ACHIEVEMENT_CAREFULLY_RANDOMLY_PICKED,
			shapes: {a: 1, b: 1},
			number: 1
		});

		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));

		assertCarefullyRandomlyPickedUserAchievementNumberEquals(1);
	});
});
