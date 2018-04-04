import {ACHIEVEMENT_CAREFULLY_RANDOMLY_PICKED} from '/imports/api/achievements/constants.js';
import CarefullyRandomlyPicked from '/imports/api/achievements/server/listeners/CarefullyRandomlyPicked.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {PLAYER_SHAPE_RANDOM} from '/imports/api/games/shapeConstants.js';
import {assert} from 'chai';
import {Random} from 'meteor/random';
import {resetDatabase} from 'meteor/xolvio:cleaner';
import sinon from 'sinon';

describe('AchievementListener#CarefullyRandomlyPicked', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	let listOfShapesFn = function() {return []};
	const stubListOfShapes = function(listener) {
		sinon.stub(listener, 'listOfShapes').callsFake(function() {
			return listOfShapesFn();
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

	it('creates achievement if not created on player won', function() {
		listOfShapesFn = function() {
			return ['a', 'b'];
		};
		const listener = (new CarefullyRandomlyPicked()).forGame(gameId, userId);
		stubListOfShapes(listener);
		Games.insert({_id: gameId, createdBy: userId, gameDuration: 59000});
		Players.insert({gameId: gameId, userId: userId, selectedShape: PLAYER_SHAPE_RANDOM, shape: 'a'});

		assert.equal(0, UserAchievements.find().count());
		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));

		assert.equal(1, UserAchievements.find().count());
		assertCarefullyRandomlyPickedUserAchievementNumberEquals(0);
	});

	it('update achievement on player won increment if all shapes have been played once', function() {
		listOfShapesFn = function() {
			return ['a', 'b'];
		};
		const listener = (new CarefullyRandomlyPicked()).forGame(gameId, userId);
		stubListOfShapes(listener);
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

	it('update achievement on player won increment when all shapes are at same level when shapes are added subsequently', function() {
		listOfShapesFn = function() {
			return ['a'];
		};
		let listener = (new CarefullyRandomlyPicked()).forGame(gameId, userId);
		stubListOfShapes(listener);
		Games.insert({_id: gameId, createdBy: userId, gameDuration: 59000});
		Players.insert({gameId: gameId, userId: userId, selectedShape: PLAYER_SHAPE_RANDOM, shape: 'b'});
		UserAchievements.insert({
			userId: userId,
			achievementId: ACHIEVEMENT_CAREFULLY_RANDOMLY_PICKED,
			shapes: {a: 2, b: 1},
			number: 1
		});

		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));
		assertCarefullyRandomlyPickedUserAchievementNumberEquals(2); //b2

		//d shape has been added
		listOfShapesFn = function() {
			return ['a', 'b', 'c'];
		};
		Players.update(
			{gameId: gameId, userId: userId},
			{$set: {shape: 'c'}}
		);

		listener = (new CarefullyRandomlyPicked()).forGame(gameId, userId);
		stubListOfShapes(listener);

		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));
		assertCarefullyRandomlyPickedUserAchievementNumberEquals(2); //c1

		listener = (new CarefullyRandomlyPicked()).forGame(gameId, userId);
		stubListOfShapes(listener);

		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));
		assertCarefullyRandomlyPickedUserAchievementNumberEquals(2); //c2

		listener = (new CarefullyRandomlyPicked()).forGame(gameId, userId);
		stubListOfShapes(listener);

		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));
		assertCarefullyRandomlyPickedUserAchievementNumberEquals(2); //c3

		Players.update(
			{gameId: gameId, userId: userId},
			{$set: {shape: 'b'}}
		);

		listener = (new CarefullyRandomlyPicked()).forGame(gameId, userId);
		stubListOfShapes(listener);

		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));
		assertCarefullyRandomlyPickedUserAchievementNumberEquals(2); //b3

		Players.update(
			{gameId: gameId, userId: userId},
			{$set: {shape: 'a'}}
		);

		listener = (new CarefullyRandomlyPicked()).forGame(gameId, userId);
		stubListOfShapes(listener);

		listener.onPlayerWon(new PlayerWon(gameId, userId, 5, 0));
		assertCarefullyRandomlyPickedUserAchievementNumberEquals(3); //a3
	});

	it('update achievement on player won do not increment if there is a shape never played with', function() {
		listOfShapesFn = function() {
			return ['a', 'b'];
		};
		const listener = (new CarefullyRandomlyPicked()).forGame(gameId, userId);
		stubListOfShapes(listener);
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
		listOfShapesFn = function() {
			return ['a', 'b'];
		};
		const listener = (new CarefullyRandomlyPicked()).forGame(gameId, userId);
		stubListOfShapes(listener);
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
		listOfShapesFn = function() {
			return ['a', 'b'];
		};
		const listener = (new CarefullyRandomlyPicked()).forGame(gameId, userId);
		stubListOfShapes(listener);
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
