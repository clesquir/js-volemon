import {Meteor} from 'meteor/meteor';
import {EloScores} from '/imports/api/games/eloscores.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {TournamentProfiles} from '/imports/api/tournaments/tournamentProfiles.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';

Meteor.publish('ranks', function() {
	const rankingsByUserId = {};
	const usernameByUserId = {};
	const updateRankings = function(userId, profile) {
		rankingsByUserId[userId] = profile;
		rankingsByUserId[userId].username = usernameByUserId[userId];
	};

	UserConfigurations.find().forEach((userConfiguration) => {
		usernameByUserId[userConfiguration.userId] = userConfiguration.name;
	});

	Profiles.find().forEach((profile) => {
		const userId = profile.userId;

		updateRankings(userId, profile);

		this.added('rankings', userId, rankingsByUserId[userId]);
	});

	this.profilesTracker = Profiles.find().observe({
		added: (profile) => {
			const userId = profile.userId;
			const isNew = (rankingsByUserId[userId] === undefined);

			updateRankings(userId, profile);

			if (isNew) {
				this.added('rankings', userId, rankingsByUserId[userId]);
			} else {
				this.changed('rankings', userId, rankingsByUserId[userId]);
			}
		},
		changed: (profile) => {
			const userId = profile.userId;

			updateRankings(userId, profile);

			this.changed('rankings', userId, rankingsByUserId[userId]);
		}
	});

	this.userConfigurationsTracker = UserConfigurations.find().observe({
		added: (userConfiguration) => {
			const userId = userConfiguration.userId;
			usernameByUserId[userId] = userConfiguration.name;
		},
		changed: (userConfiguration, oldUserConfiguration) => {
			if (userConfiguration.name !== oldUserConfiguration.name) {
				const userId = userConfiguration.userId;

				if (rankingsByUserId[userId]) {
					rankingsByUserId[userId].username = userConfiguration.name;

					this.changed('rankings', userId, rankingsByUserId[userId]);
				}
			}
		}
	});

	this.ready();

	this.onStop(() => {
		this.userConfigurationsTracker.stop();
		this.profilesTracker.stop();
	});
});

Meteor.publish('tournamentRanks', function(tournamentId) {
	const rankingsByUserId = {};
	const usernameByUserId = {};
	const updateRankings = function(userId, profile) {
		rankingsByUserId[userId] = profile;
		rankingsByUserId[userId].username = usernameByUserId[userId];
	};

	UserConfigurations.find().forEach((userConfiguration) => {
		usernameByUserId[userConfiguration.userId] = userConfiguration.name;
	});

	TournamentProfiles.find({tournamentId: tournamentId}).forEach((profile) => {
		const userId = profile.userId;

		updateRankings(userId, profile);

		this.added('tournamentrankings', userId, rankingsByUserId[userId]);
	});

	this.profilesTracker = TournamentProfiles.find({tournamentId: tournamentId}).observe({
		added: (profile) => {
			const userId = profile.userId;
			const isNew = (rankingsByUserId[userId] === undefined);

			updateRankings(userId, profile);

			if (isNew) {
				this.added('tournamentrankings', userId, rankingsByUserId[userId]);
			} else {
				this.changed('tournamentrankings', userId, rankingsByUserId[userId]);
			}
		},
		changed: (profile) => {
			const userId = profile.userId;

			updateRankings(userId, profile);

			this.changed('tournamentrankings', userId, rankingsByUserId[userId]);
		}
	});

	this.userConfigurationsTracker = UserConfigurations.find().observe({
		added: (userConfiguration) => {
			const userId = userConfiguration.userId;
			usernameByUserId[userId] = userConfiguration.name;
		},
		changed: (userConfiguration, oldUserConfiguration) => {
			if (userConfiguration.name !== oldUserConfiguration.name) {
				const userId = userConfiguration.userId;

				if (rankingsByUserId[userId]) {
					rankingsByUserId[userId].username = userConfiguration.name;

					this.changed('tournamentrankings', userId, rankingsByUserId[userId]);
				}
			}
		}
	});

	this.ready();

	this.onStop(() => {
		this.userConfigurationsTracker.stop();
		this.profilesTracker.stop();
	});
});

Meteor.publish('ranks-chart', function(minDate) {
	const usernameByUserId = {};

	UserConfigurations.find().forEach((userConfiguration) => {
		usernameByUserId[userConfiguration.userId] = userConfiguration.name;
	});

	EloScores.find({timestamp: {$gt: minDate}}).forEach((eloScore) => {
		const key = eloScore.userId + '_' + eloScore.timestamp;
		this.added(
			'rankchartdata',
			key,
			Object.assign(
				eloScore,
				{
					username: usernameByUserId[eloScore.userId]
				}
			)
		);
	});

	this.ready();
});
