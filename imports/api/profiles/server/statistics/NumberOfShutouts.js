import {Profiles} from '/imports/api/profiles/profiles.js';
import {TournamentProfiles} from '/imports/api/tournaments/tournamentProfiles.js';

export default class NumberOfShutouts {
	static get(userId, tournamentId) {
		let numberOfShutouts = 0;
		let numberOfShutoutLosses = 0;

		if (tournamentId) {
			const tournamentProfile = TournamentProfiles.findOne({userId: userId, tournamentId: tournamentId});

			if (tournamentProfile) {
				numberOfShutouts += tournamentProfile.numberOfShutouts;
				numberOfShutoutLosses += tournamentProfile.numberOfShutoutLosses;
			}
		} else {
			const profile = Profiles.findOne({userId: userId, tournamentId: tournamentId});

			if (profile) {
				numberOfShutouts += profile.numberOfShutouts;
				numberOfShutoutLosses += profile.numberOfShutoutLosses;
			}

			const tournamentProfiles = TournamentProfiles.find({userId: userId});

			tournamentProfiles.forEach(function(tournamentProfile) {
				numberOfShutouts += tournamentProfile.numberOfShutouts;
				numberOfShutoutLosses += tournamentProfile.numberOfShutoutLosses;
			});
		}

		return {
			numberOfShutouts: numberOfShutouts,
			numberOfShutoutLosses: numberOfShutoutLosses
		};
	}
}
