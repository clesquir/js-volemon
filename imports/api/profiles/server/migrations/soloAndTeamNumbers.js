import {INITIAL_ELO_RATING} from '/imports/api/profiles/constants';
import {Profiles} from '/imports/api/profiles/profiles';
import {TournamentProfiles} from '/imports/api/tournaments/tournamentProfiles';
import {Meteor} from 'meteor/meteor';

Meteor.startup(function() {
	const profiles = Profiles.find({soloNumberOfWin: {$exists: false}});

	profiles.forEach(function(profile) {
		Profiles.update(
			{_id: profile._id},
			{$set: {
				soloNumberOfWin: profile.numberOfWin,
				soloNumberOfLost: profile.numberOfLost,
				soloNumberOfShutouts: profile.numberOfShutouts,
				soloNumberOfShutoutLosses: profile.numberOfShutoutLosses,

				teamEloRating: INITIAL_ELO_RATING,
				teamEloRatingLastChange: 0,
				teamNumberOfWin: 0,
				teamNumberOfLost: 0,
				teamNumberOfShutoutShutouts: 0,
				teamNumberOfShutoutLosses: 0,
			}}
		);

		const tournaments = TournamentProfiles.find({userId: profile.userId});

		let numberOfWin = profile.numberOfWin;
		let numberOfLost = profile.numberOfLost;
		let numberOfShutouts = profile.numberOfShutouts;
		let numberOfShutoutLosses = profile.numberOfShutoutLosses;
		tournaments.forEach(function(tournament) {
			numberOfWin += tournament.numberOfWin;
			numberOfLost += tournament.numberOfLost;
			numberOfShutouts += tournament.numberOfShutouts;
			numberOfShutoutLosses += tournament.numberOfShutoutLosses;
		});

		Profiles.update(
			{_id: profile._id},
			{$set: {
				numberOfWin: numberOfWin,
				numberOfLost: numberOfLost,
				numberOfShutouts: numberOfShutouts,
				numberOfShutoutLosses: numberOfShutoutLosses,
			}}
		);
	});
});
