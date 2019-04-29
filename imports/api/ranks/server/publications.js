import {Profiles} from '/imports/api/profiles/profiles.js';
import {TournamentProfiles} from '/imports/api/tournaments/tournamentProfiles.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import {Meteor} from 'meteor/meteor';

Meteor.publish('ranks', function() {
	rankings(
		'rankings',
		function(rankings, usernameByUserId, userId, profile) {
			rankings[userId] = profile;
			rankings[userId].username = usernameByUserId[userId];
			rankings[userId].numberOfWin = profile.soloNumberOfWin;
			rankings[userId].numberOfLost = profile.soloNumberOfLost;

			if (profile.soloNumberOfWin === 0 && profile.soloNumberOfLost === 0) {
				rankings[userId].eloRating = undefined;
				rankings[userId].eloRatingLastChange = undefined;
			}
		},
		this
	);
});

Meteor.publish('teamRanks', function() {
	rankings(
		'teamrankings',
		function(rankings, usernameByUserId, userId, profile) {
			rankings[userId] = profile;
			rankings[userId].username = usernameByUserId[userId];
			rankings[userId].numberOfWin = profile.teamNumberOfWin;
			rankings[userId].numberOfLost = profile.teamNumberOfLost;
			rankings[userId].eloRating = profile.teamEloRating;
			rankings[userId].eloRatingLastChange = profile.teamEloRatingLastChange;

			if (profile.teamNumberOfWin === 0 && profile.teamNumberOfLost === 0) {
				rankings[userId].eloRating = undefined;
				rankings[userId].eloRatingLastChange = undefined;
			}
		},
		this
	);
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

const rankings = function(collectionName, updateRankings, scope) {
	const rankings = {};
	const usernameByUserId = {};

	UserConfigurations.find().forEach((userConfiguration) => {
		usernameByUserId[userConfiguration.userId] = userConfiguration.name;
	});

	Profiles.find().forEach((profile) => {
		const userId = profile.userId;

		updateRankings(rankings, usernameByUserId, userId, profile);

		scope.added(collectionName, userId, rankings[userId]);
	});

	scope.profilesTracker = Profiles.find().observe({
		added: (profile) => {
			const userId = profile.userId;
			const isNew = (rankings[userId] === undefined);

			updateRankings(rankings, usernameByUserId, userId, profile);

			if (isNew) {
				scope.added(collectionName, userId, rankings[userId]);
			} else {
				scope.changed(collectionName, userId, rankings[userId]);
			}
		},
		changed: (profile) => {
			const userId = profile.userId;

			updateRankings(rankings, usernameByUserId, userId, profile);

			scope.changed(collectionName, userId, rankings[userId]);
		}
	});

	scope.userConfigurationsTracker = UserConfigurations.find().observe({
		added: (userConfiguration) => {
			const userId = userConfiguration.userId;
			usernameByUserId[userId] = userConfiguration.name;
		},
		changed: (userConfiguration, oldUserConfiguration) => {
			if (userConfiguration.name !== oldUserConfiguration.name) {
				const userId = userConfiguration.userId;

				if (rankings[userId]) {
					rankings[userId].username = userConfiguration.name;

					scope.changed(collectionName, userId, rankings[userId]);
				}
			}
		}
	});

	scope.ready();

	scope.onStop(() => {
		scope.userConfigurationsTracker.stop();
		scope.profilesTracker.stop();
	});
};
