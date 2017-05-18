import {chai} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {resetDatabase} from 'meteor/xolvio:cleaner';
import {Random} from 'meteor/random';
import * as Moment from 'meteor/momentjs:moment';
import ConsecutiveDaysPlayed from '/imports/api/achievements/server/listeners/ConsecutiveDaysPlayed.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED} from '/imports/api/achievements/constants.js';
import GameFinished from '/imports/api/games/events/GameFinished.js';
import {Players} from '/imports/api/games/players.js';

describe('ConsecutiveDaysPlayed', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const listener = new ConsecutiveDaysPlayed(gameId, userId);
	let stub;

	beforeEach(function() {
		resetDatabase();
	});

	afterEach(function() {
		if (stub) {
			stub.restore();
			stub = null;
		}
	});

	it('creates achievement if not created', function() {
		Players.insert({gameId: gameId, userId: userId});
		let lastDatePlayed = Moment.moment([2017, 0, 1]).valueOf();
		stub = sinon.stub(listener, 'todaysDate', function() {
			return lastDatePlayed;
		});

		chai.assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 2000));

		chai.assert.equal(1, UserAchievements.find().count());
		const achievement = UserAchievements.findOne();
		chai.assert.notEqual(undefined, achievement);

		chai.assert.strictEqual(userId, achievement.userId);
		chai.assert.strictEqual(ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED, achievement.achievementId);
		chai.assert.strictEqual(1, achievement.number);
		chai.assert.strictEqual(1, achievement.consecutiveDays);
	});

	it('do not create achievement if not gameId', function() {
		Players.insert({gameId: gameId, userId: userId});

		listener.onGameFinished(new GameFinished(Random.id(5), 2000));
		chai.assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if user is not in game', function() {
		listener.onGameFinished(new GameFinished(gameId, 2000));
		chai.assert.equal(0, UserAchievements.find().count());
	});

	it('increment achievement if last increment was yesterday', function() {
		Players.insert({gameId: gameId, userId: userId});
		let lastDatePlayed = Moment.moment([2017, 0, 1]).valueOf();
		stub = sinon.stub(listener, 'todaysDate', function() {
			return lastDatePlayed;
		});

		chai.assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 2000));

		chai.assert.equal(1, UserAchievements.find().count());
		let achievement = UserAchievements.findOne();
		chai.assert.notEqual(undefined, achievement);

		chai.assert.strictEqual(userId, achievement.userId);
		chai.assert.strictEqual(ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED, achievement.achievementId);
		chai.assert.strictEqual(1, achievement.number);
		chai.assert.strictEqual(lastDatePlayed, achievement.lastDatePlayed);
		chai.assert.strictEqual(1, achievement.consecutiveDays);

		lastDatePlayed = Moment.moment([2017, 0, 2]).valueOf();

		listener.onGameFinished(new GameFinished(gameId, 2000));
		achievement = UserAchievements.findOne();
		chai.assert.notEqual(undefined, achievement);

		chai.assert.strictEqual(userId, achievement.userId);
		chai.assert.strictEqual(ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED, achievement.achievementId);
		chai.assert.strictEqual(lastDatePlayed, achievement.lastDatePlayed);
		chai.assert.strictEqual(2, achievement.number);
		chai.assert.strictEqual(2, achievement.consecutiveDays);
	});

	it('do not reset nor increase achievement if last increment was today', function() {
		Players.insert({gameId: gameId, userId: userId});
		let lastDatePlayed = Moment.moment([2017, 0, 1]).valueOf();
		stub = sinon.stub(listener, 'todaysDate', function() {
			return lastDatePlayed;
		});

		chai.assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 2000));

		chai.assert.equal(1, UserAchievements.find().count());
		let achievement = UserAchievements.findOne();
		chai.assert.notEqual(undefined, achievement);

		chai.assert.strictEqual(userId, achievement.userId);
		chai.assert.strictEqual(ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED, achievement.achievementId);
		chai.assert.strictEqual(1, achievement.number);
		chai.assert.strictEqual(lastDatePlayed, achievement.lastDatePlayed);
		chai.assert.strictEqual(1, achievement.consecutiveDays);

		listener.onGameFinished(new GameFinished(gameId, 2000));
		achievement = UserAchievements.findOne();
		chai.assert.notEqual(undefined, achievement);

		chai.assert.strictEqual(userId, achievement.userId);
		chai.assert.strictEqual(ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED, achievement.achievementId);
		chai.assert.strictEqual(lastDatePlayed, achievement.lastDatePlayed);
		chai.assert.strictEqual(1, achievement.number);
		chai.assert.strictEqual(1, achievement.consecutiveDays);
	});

	it('reset achievement if last increment was before yesterday', function() {
		Players.insert({gameId: gameId, userId: userId});
		let lastDatePlayed = Moment.moment([2017, 0, 1]).valueOf();
		stub = sinon.stub(listener, 'todaysDate', function() {
			return lastDatePlayed;
		});

		chai.assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 2000));

		chai.assert.equal(1, UserAchievements.find().count());
		let achievement = UserAchievements.findOne();
		chai.assert.notEqual(undefined, achievement);

		chai.assert.strictEqual(userId, achievement.userId);
		chai.assert.strictEqual(ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED, achievement.achievementId);
		chai.assert.strictEqual(1, achievement.number);
		chai.assert.strictEqual(lastDatePlayed, achievement.lastDatePlayed);
		chai.assert.strictEqual(1, achievement.consecutiveDays);

		lastDatePlayed = Moment.moment([2017, 0, 3]).valueOf();

		listener.onGameFinished(new GameFinished(gameId, 2000));
		achievement = UserAchievements.findOne();
		chai.assert.notEqual(undefined, achievement);

		chai.assert.strictEqual(userId, achievement.userId);
		chai.assert.strictEqual(ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED, achievement.achievementId);
		chai.assert.strictEqual(1, achievement.number);
		chai.assert.strictEqual(lastDatePlayed, achievement.lastDatePlayed);
		chai.assert.strictEqual(1, achievement.consecutiveDays);
	});

	it('do not increment achievement if consecutive days have already been higher', function() {
		Players.insert({gameId: gameId, userId: userId});
		let lastDatePlayed = Moment.moment([2017, 0, 1]).valueOf();
		stub = sinon.stub(listener, 'todaysDate', function() {
			return lastDatePlayed;
		});

		chai.assert.equal(0, UserAchievements.find().count());
		listener.onGameFinished(new GameFinished(gameId, 2000));

		chai.assert.equal(1, UserAchievements.find().count());
		let achievement = UserAchievements.findOne();
		chai.assert.notEqual(undefined, achievement);

		chai.assert.strictEqual(userId, achievement.userId);
		chai.assert.strictEqual(ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED, achievement.achievementId);
		chai.assert.strictEqual(1, achievement.number);
		chai.assert.strictEqual(lastDatePlayed, achievement.lastDatePlayed);
		chai.assert.strictEqual(1, achievement.consecutiveDays);

		lastDatePlayed = Moment.moment([2017, 0, 2]).valueOf();

		listener.onGameFinished(new GameFinished(gameId, 2000));
		achievement = UserAchievements.findOne();
		chai.assert.notEqual(undefined, achievement);

		chai.assert.strictEqual(userId, achievement.userId);
		chai.assert.strictEqual(ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED, achievement.achievementId);
		chai.assert.strictEqual(2, achievement.number);
		chai.assert.strictEqual(lastDatePlayed, achievement.lastDatePlayed);
		chai.assert.strictEqual(2, achievement.consecutiveDays);

		lastDatePlayed = Moment.moment([2017, 0, 4]).valueOf();

		listener.onGameFinished(new GameFinished(gameId, 2000));
		achievement = UserAchievements.findOne();
		chai.assert.notEqual(undefined, achievement);

		chai.assert.strictEqual(userId, achievement.userId);
		chai.assert.strictEqual(ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED, achievement.achievementId);
		chai.assert.strictEqual(2, achievement.number);
		chai.assert.strictEqual(lastDatePlayed, achievement.lastDatePlayed);
		chai.assert.strictEqual(1, achievement.consecutiveDays);

		lastDatePlayed = Moment.moment([2017, 0, 5]).valueOf();

		listener.onGameFinished(new GameFinished(gameId, 2000));
		achievement = UserAchievements.findOne();
		chai.assert.notEqual(undefined, achievement);

		chai.assert.strictEqual(userId, achievement.userId);
		chai.assert.strictEqual(ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED, achievement.achievementId);
		chai.assert.strictEqual(2, achievement.number);
		chai.assert.strictEqual(lastDatePlayed, achievement.lastDatePlayed);
		chai.assert.strictEqual(2, achievement.consecutiveDays);
	});
});
