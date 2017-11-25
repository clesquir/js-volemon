import {Profiles} from '/imports/api/profiles/profiles.js';
import {TournamentProfiles} from '/imports/api/tournaments/tournamentProfiles.js';

export default class NumberOfGamesPlayed {
	static get(userId, tournamentId) {
		let numberOfWin = 0;
		let numberOfLost = 0;

		if (tournamentId) {
			const tournamentProfile = TournamentProfiles.findOne({userId: userId, tournamentId: tournamentId});

			if (tournamentProfile) {
				numberOfWin += tournamentProfile.numberOfWin;
				numberOfLost += tournamentProfile.numberOfLost;
			}
		} else {
			const profile = Profiles.findOne({userId: userId, tournamentId: tournamentId});

			if (profile) {
				numberOfWin += profile.numberOfWin;
				numberOfLost += profile.numberOfLost;
			}

			const tournamentProfiles = TournamentProfiles.find({userId: userId});

			tournamentProfiles.forEach(function(tournamentProfile) {
				numberOfWin += tournamentProfile.numberOfWin;
				numberOfLost += tournamentProfile.numberOfLost;
			});
		}

		return {
			numberOfGame: numberOfWin + numberOfLost,
			numberOfWin: numberOfWin,
			numberOfLost: numberOfLost
		};
	}
}
