import {chai} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {resetDatabase} from 'meteor/xolvio:cleaner';
import {Random} from 'meteor/random';
import BonusesInALifetime from '/imports/api/achievements/server/listeners/BonusesInALifetime.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {ACHIEVEMENT_BONUSES_IN_A_LIFETIME} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';

describe('BonusesInALifetime', function() {
	const gameId = Random.id(5);
	const userId = Random.id(5);
	const listener = new BonusesInALifetime(gameId, userId);
	const assertBonusesInALifetimeUserAchievementNumberEquals = function(number) {
		const achievement = UserAchievements.findOne();
		chai.assert.notEqual(undefined, achievement);

		chai.assert.strictEqual(userId, achievement.userId);
		chai.assert.strictEqual(ACHIEVEMENT_BONUSES_IN_A_LIFETIME, achievement.achievementId);
		chai.assert.strictEqual(number, achievement.number);
	};

	beforeEach(function() {
		resetDatabase();
	});

	it('creates achievement with 1 if not created on bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});

		chai.assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(gameId, 'a', 'player1', 'a', 'player1'));

		chai.assert.equal(1, UserAchievements.find().count());
		assertBonusesInALifetimeUserAchievementNumberEquals(1);
	});

	it('do not create achievement if not created if not gameId on bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});

		chai.assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(Random.id(5), 'a', 'player1', 'a', 'player1'));
		chai.assert.equal(0, UserAchievements.find().count());
	});

	it('do not create achievement if not created if player key is not the current user on bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});

		chai.assert.equal(0, UserAchievements.find().count());
		listener.onBonusCaught(new BonusCaught(gameId, 'a', 'player2', 'a', 'player2'));
		chai.assert.equal(0, UserAchievements.find().count());
	});

	it('increment achievement on bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_BONUSES_IN_A_LIFETIME, number: 1});

		listener.onBonusCaught(new BonusCaught(gameId, 'a', 'player1', 'a', 'player1'));

		assertBonusesInALifetimeUserAchievementNumberEquals(2);
	});

	it('do not increment achievement if not gameId on bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_BONUSES_IN_A_LIFETIME, number: 1});

		listener.onBonusCaught(new BonusCaught(Random.id(5), 'a', 'player1', 'a', 'player1'));

		assertBonusesInALifetimeUserAchievementNumberEquals(1);
	});

	it('do not increment achievement if player key is not the current user on bonus caught', function() {
		Games.insert({_id: gameId, createdBy: userId});
		Players.insert({gameId: gameId, userId: userId});
		UserAchievements.insert({userId: userId, achievementId: ACHIEVEMENT_BONUSES_IN_A_LIFETIME, number: 1});

		listener.onBonusCaught(new BonusCaught(gameId, 'a', 'player2', 'a', 'player2'));

		assertBonusesInALifetimeUserAchievementNumberEquals(1);
	});
});