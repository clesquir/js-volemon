import {assert} from 'chai';
import sinon from 'sinon';
import {resetDatabase} from 'meteor/xolvio:cleaner';
import {Random} from 'meteor/random';
import Rakshasa from '/imports/api/achievements/server/listeners/Rakshasa.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {ACHIEVEMENT_RAKSHASA} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import {BONUS_SHAPE_SHIFT} from '/imports/api/games/bonusConstants.js'
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';

describe('AchievementListener#Rakshasa', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const opponentUserId = Random.id(5);
	const assertRakshasaUserAchievementNumberEquals = function(number) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_RAKSHASA, achievement.achievementId);
		assert.strictEqual(number, achievement.number);
	};

	beforeEach(function() {
		resetDatabase();
	});

	afterEach(function() {
		resetDatabase();
	});

	it('add achievement if none on caught all shapes', function() {
		const listener = new Rakshasa(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId, shape: 'a'});
		Players.insert({gameId: gameId, userId: opponentUserId, shape: 'a'});
		sinon.stub(listener, 'availableShapes').callsFake(function() {
			return [
				'a',
				'b',
				'c'
			];
		});

		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(
			new BonusCaught(
				gameId,
				BONUS_SHAPE_SHIFT,
				{
					activatedBonusClass: BONUS_SHAPE_SHIFT,
					targetPlayerKey: 'player1',
					bonusClass: BONUS_SHAPE_SHIFT,
					activatorPlayerKey: 'player1',
					playerShape: 'b'
				}
			)
		);
		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(
			new BonusCaught(
				gameId,
				BONUS_SHAPE_SHIFT,
				{
					activatedBonusClass: BONUS_SHAPE_SHIFT,
					targetPlayerKey: 'player1',
					bonusClass: BONUS_SHAPE_SHIFT,
					activatorPlayerKey: 'player1',
					playerShape: 'c'
				}
			)
		);
		assertRakshasaUserAchievementNumberEquals(1);
	});

	it('do not add achievement if different gameId', function() {
		const listener = new Rakshasa(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId, shape: 'a'});
		Players.insert({gameId: gameId, userId: opponentUserId, shape: 'a'});
		sinon.stub(listener, 'availableShapes').callsFake(function() {
			return [
				'a',
				'b'
			];
		});

		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(
			new BonusCaught(
				Random.id(5),
				BONUS_SHAPE_SHIFT,
				{
					activatedBonusClass: BONUS_SHAPE_SHIFT,
					targetPlayerKey: 'player1',
					bonusClass: BONUS_SHAPE_SHIFT,
					activatorPlayerKey: 'player1',
					playerShape: 'b'
				}
			)
		);
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not add achievement if different userId', function() {
		const listener = new Rakshasa(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId, shape: 'a'});
		Players.insert({gameId: gameId, userId: opponentUserId, shape: 'a'});
		sinon.stub(listener, 'availableShapes').callsFake(function() {
			return [
				'b'
			];
		});

		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(
			new BonusCaught(
				gameId,
				BONUS_SHAPE_SHIFT,
				{
					activatedBonusClass: BONUS_SHAPE_SHIFT,
					targetPlayerKey: 'player2',
					bonusClass: BONUS_SHAPE_SHIFT,
					activatorPlayerKey: 'player2',
					playerShape: 'b'
				}
			)
		);
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not increment achievement if same shape shift twice but not all', function() {
		const listener = new Rakshasa(gameId, userId);
		Games.insert({_id: gameId, createdBy: userId});
		sinon.stub(listener, 'availableShapes').callsFake(function() {
			return [
				'a',
				'b',
				'c'
			];
		});

		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(
			new BonusCaught(
				gameId,
				BONUS_SHAPE_SHIFT,
				{
					activatedBonusClass: BONUS_SHAPE_SHIFT,
					targetPlayerKey: 'player1',
					bonusClass: BONUS_SHAPE_SHIFT,
					activatorPlayerKey: 'player1',
					playerShape: 'b'
				}
			)
		);
		assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(
			new BonusCaught(
				gameId,
				BONUS_SHAPE_SHIFT,
				{
					activatedBonusClass: BONUS_SHAPE_SHIFT,
					targetPlayerKey: 'player1',
					bonusClass: BONUS_SHAPE_SHIFT,
					activatorPlayerKey: 'player1',
					playerShape: 'b'
				}
			)
		);
		assert.equal(0, UserAchievements.find().count());
	});
});
