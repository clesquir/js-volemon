import {ACHIEVEMENT_RAKSHASA} from '/imports/api/achievements/constants.js';
import Rakshasa from '/imports/api/achievements/server/listeners/Rakshasa.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {BONUS_SHAPE_SHIFT} from '/imports/api/games/bonusConstants'
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import {Games} from '/imports/api/games/games.js';
import {assert} from 'chai';
import StubCollections from 'meteor/hwillson:stub-collections';
import {Random} from 'meteor/random';
import sinon from 'sinon';

describe('AchievementListener#Rakshasa', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const opponentUserId = Random.id(5);
	const stubListOfShapes = function(listener, listOfShapes) {
		sinon.stub(listener, 'listOfShapes').callsFake(function() {
			return listOfShapes;
		});
	};
	const getBonusCaught = function(gameId, playerKey, playerShape) {
		return new BonusCaught(
			gameId,
			BONUS_SHAPE_SHIFT,
			{
				activatedBonusClass: BONUS_SHAPE_SHIFT,
				targetPlayerKey: playerKey,
				bonusClass: BONUS_SHAPE_SHIFT,
				activatorPlayerKey: playerKey,
				playerShape: playerShape
			}
		);
	};
	const assertRakshasaUserAchievementNumberEquals = function(number) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_RAKSHASA, achievement.achievementId);
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

	it('add achievement if none on caught all shapes', function() {
		const listener = (new Rakshasa()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId, shape: 'a'}, {id: opponentUserId, shape: 'a'}]});
		stubListOfShapes(listener, ['a', 'b', 'c']);

		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(getBonusCaught(gameId, 'player1', 'a'));
		assertRakshasaUserAchievementNumberEquals(0);
		listener.onBonusCaught(getBonusCaught(gameId, 'player1', 'b'));
		assertRakshasaUserAchievementNumberEquals(0);
		listener.onBonusCaught(getBonusCaught(gameId, 'player1', 'c'));
		assertRakshasaUserAchievementNumberEquals(1);
	});

	it('do not add achievement if different gameId', function() {
		const listener = (new Rakshasa()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId, shape: 'a'}, {id: opponentUserId, shape: 'a'}]});
		stubListOfShapes(listener, ['a', 'b']);

		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(getBonusCaught(Random.id(5), 'player1', 'a'));
		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(getBonusCaught(Random.id(5), 'player1', 'b'));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not add achievement if different player', function() {
		const listener = (new Rakshasa()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId, shape: 'a'}, {id: opponentUserId, shape: 'a'}]});
		stubListOfShapes(listener, ['a', 'b']);

		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(getBonusCaught(gameId, 'player2', 'a'));
		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(getBonusCaught(gameId, 'player2', 'b'));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment achievement if same shape shift twice but not all', function() {
		const listener = (new Rakshasa()).forGame(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId, players: [{id: userId, shape: 'a'}, {id: opponentUserId}]});
		stubListOfShapes(listener, ['a', 'b']);

		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(getBonusCaught(gameId, 'player1', 'b'));
		assertRakshasaUserAchievementNumberEquals(0);
		listener.onBonusCaught(getBonusCaught(gameId, 'player1', 'b'));
		assertRakshasaUserAchievementNumberEquals(0);
	});
});
