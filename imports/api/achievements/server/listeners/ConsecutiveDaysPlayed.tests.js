import {assert} from 'chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {resetDatabase} from 'meteor/xolvio:cleaner';
import {Random} from 'meteor/random';
import * as Moment from 'meteor/momentjs:moment';
import ConsecutiveDaysPlayed from '/imports/api/achievements/server/listeners/ConsecutiveDaysPlayed.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED} from '/imports/api/achievements/constants.js';
import GameFinished from '/imports/api/games/events/GameFinished.js';
import {Players} from '/imports/api/games/players.js';

describe('AchievementListener#ConsecutiveDaysPlayed', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const listener = new ConsecutiveDaysPlayed(gameId, userId);
	const assertConsecutiveDaysPlayedUserAchievementValuesEqual = function(number, lastDatePlayed, consecutiveDays) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED, achievement.achievementId);
		assert.strictEqual(number, achievement.number);
		assert.strictEqual(lastDatePlayed, achievement.lastDatePlayed);
		assert.strictEqual(consecutiveDays, achievement.consecutiveDays);
	};
	let stub;

	beforeEach(function() {
		resetDatabase();
	});

	afterEach(function() {
		if (stub) {
			stub.restore();
			stub = null;
		}
		resetDatabase();
	});

	it('creates achievement if not created', function() {
		Players.insert({gameId: gameId, userId: userId});
		let lastDatePlayed = Moment.moment([2017, 0, 1]).valueOf();
		stub = sinon.stub(listener, 'todaysDate', function() {
			return lastDatePlayed;
		});

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 2000));

		assert.equal(1, UserAchievements.find().count());
		assertConsecutiveDaysPlayedUserAchievementValuesEqual(1, lastDatePlayed, 1);
	});

	it('do not create achievement if not gameId', function() {
		Players.insert({gameId: gameId, userId: userId});

		listener.onGameFinished(new GameFinished(Random.id(5), 2000));
		assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if user is not in game', function() {
		listener.onGameFinished(new GameFinished(gameId, 2000));
		assert.equal(0, UserAchievements.find().count());
	});

	it('increment achievement if last increment was yesterday', function() {
		Players.insert({gameId: gameId, userId: userId});
		let lastDatePlayed = Moment.moment([2017, 0, 1]).valueOf();
		stub = sinon.stub(listener, 'todaysDate', function() {
			return lastDatePlayed;
		});

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 2000));

		assert.equal(1, UserAchievements.find().count());
		assertConsecutiveDaysPlayedUserAchievementValuesEqual(1, lastDatePlayed, 1);

		lastDatePlayed = Moment.moment([2017, 0, 2]).valueOf();

		listener.onGameFinished(new GameFinished(gameId, 2000));

		assertConsecutiveDaysPlayedUserAchievementValuesEqual(2, lastDatePlayed, 2);
	});

	it('do not reset nor increase achievement if last increment was today', function() {
		Players.insert({gameId: gameId, userId: userId});
		let lastDatePlayed = Moment.moment([2017, 0, 1]).valueOf();
		stub = sinon.stub(listener, 'todaysDate', function() {
			return lastDatePlayed;
		});

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 2000));

		assert.equal(1, UserAchievements.find().count());
		assertConsecutiveDaysPlayedUserAchievementValuesEqual(1, lastDatePlayed, 1);

		listener.onGameFinished(new GameFinished(gameId, 2000));

		assertConsecutiveDaysPlayedUserAchievementValuesEqual(1, lastDatePlayed, 1);
	});

	it('reset achievement if last increment was before yesterday', function() {
		Players.insert({gameId: gameId, userId: userId});
		let lastDatePlayed = Moment.moment([2017, 0, 1]).valueOf();
		stub = sinon.stub(listener, 'todaysDate', function() {
			return lastDatePlayed;
		});

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 2000));

		assert.equal(1, UserAchievements.find().count());
		assertConsecutiveDaysPlayedUserAchievementValuesEqual(1, lastDatePlayed, 1);

		lastDatePlayed = Moment.moment([2017, 0, 3]).valueOf();

		listener.onGameFinished(new GameFinished(gameId, 2000));

		assertConsecutiveDaysPlayedUserAchievementValuesEqual(1, lastDatePlayed, 1);
	});

	it('do not increment achievement if consecutive days have already been higher', function() {
		Players.insert({gameId: gameId, userId: userId});
		let lastDatePlayed = Moment.moment([2017, 0, 1]).valueOf();
		stub = sinon.stub(listener, 'todaysDate', function() {
			return lastDatePlayed;
		});

		assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 2000));

		assert.equal(1, UserAchievements.find().count());
		assertConsecutiveDaysPlayedUserAchievementValuesEqual(1, lastDatePlayed, 1);

		lastDatePlayed = Moment.moment([2017, 0, 2]).valueOf();

		listener.onGameFinished(new GameFinished(gameId, 2000));

		assertConsecutiveDaysPlayedUserAchievementValuesEqual(2, lastDatePlayed, 2);

		lastDatePlayed = Moment.moment([2017, 0, 4]).valueOf();

		listener.onGameFinished(new GameFinished(gameId, 2000));

		assertConsecutiveDaysPlayedUserAchievementValuesEqual(2, lastDatePlayed, 1);

		lastDatePlayed = Moment.moment([2017, 0, 5]).valueOf();

		listener.onGameFinished(new GameFinished(gameId, 2000));

		assertConsecutiveDaysPlayedUserAchievementValuesEqual(2, lastDatePlayed, 2);
	});
});
