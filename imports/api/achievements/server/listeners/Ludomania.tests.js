import {ACHIEVEMENT_LUDOMANIA} from '/imports/api/achievements/constants';
import Ludomania from '/imports/api/achievements/server/listeners/Ludomania';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import TournamentFinished from '/imports/api/tournaments/events/TournamentFinished';
import {TournamentProfiles} from '/imports/api/tournaments/tournamentProfiles';
import {Tournaments} from '/imports/api/tournaments/tournaments';
import {assert} from 'chai';
import StubCollections from 'meteor/hwillson:stub-collections';
import {Random} from 'meteor/random';

describe('AchievementListener#Ludomania', function() {
	const tournamentId = Random.id(5);
	const userId = Random.id(5);
	const assertLudomaniaUserAchievementNumberEquals = function(number) {
		const achievement = UserAchievements.findOne();
		assert.notEqual(undefined, achievement);

		assert.strictEqual(userId, achievement.userId);
		assert.strictEqual(ACHIEVEMENT_LUDOMANIA, achievement.achievementId);
		assert.strictEqual(number, achievement.number);
	};

	before(function() {
		StubCollections.add([Tournaments, TournamentProfiles]);
	});

	beforeEach(function() {
		StubCollections.stub();
	});

	afterEach(function() {
		StubCollections.restore();
	});

	it('increment if tournament is passed', function() {
		const listener = (new Ludomania()).forTournament(tournamentId, userId);
		Tournaments.insert({_id: tournamentId, endDate: '2000-01-01 -04:00'});
		TournamentProfiles.insert({tournamentId: tournamentId, userId: userId});

		assert.equal(0, UserAchievements.find().count());

		listener.onTournamentFinished(new TournamentFinished(tournamentId));

		assert.equal(1, UserAchievements.find().count());
		assertLudomaniaUserAchievementNumberEquals(1);
	});

	it('do not increment if tournament is not passed', function() {
		const listener = (new Ludomania()).forTournament(tournamentId, userId);
		Tournaments.insert({_id: tournamentId, endDate: '2200-01-01 -04:00'});
		TournamentProfiles.insert({tournamentId: tournamentId, userId: userId});

		assert.equal(0, UserAchievements.find().count());

		listener.onTournamentFinished(new TournamentFinished(tournamentId));

		assert.equal(0, UserAchievements.find().count());
	});
});
