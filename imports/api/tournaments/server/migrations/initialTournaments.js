import {TournamentModes} from '/imports/api/tournaments/tournamentModes.js';
import {TOURNAMENT_MODE_BONUS_OVERRIDE} from '/imports/api/tournaments/tournamentModesConstants.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';

Meteor.startup(function() {
	const tournaments = [
		{
			identifier: "tournament_2018-02-19",
			name: "Instant death bonus tournament",
			description: "Bonuses spawning are only instant death",
			mode: TOURNAMENT_MODE_BONUS_OVERRIDE,
			startDate: "2018-02-19 -04:00",
			endDate: "2018-02-26 -04:00",
			isPublished: true
		},
		{
			_id: Random.id(5),
			identifier: 'tournament_2018-04-30',
			mode: TOURNAMENT_MODE_BONUS_OVERRIDE,
			name: "Le parapluie!!!",
			description: 'Repellent, instant death and invincible bonuses',
			startDate: "2018-04-30 -04:00",
			endDate: "2018-05-07 -04:00",
			isPublished: false
		}
	];

	for (let expectedTournament of tournaments) {
		let actualTournament = Tournaments.findOne({identifier: expectedTournament.identifier});
		let tournamentMode = TournamentModes.findOne({_id: expectedTournament.mode});

		if (!actualTournament) {
			expectedTournament.mode = tournamentMode;

			Tournaments.insert(expectedTournament);
		} else {
			const updates = {};
			if (!_.isEqual(actualTournament.mode, tournamentMode)) {
				updates.mode = tournamentMode;
			}
			if (actualTournament.name !== expectedTournament.name) {
				updates.name = expectedTournament.name;
			}
			if (actualTournament.description !== expectedTournament.description) {
				updates.description = expectedTournament.description;
			}
			if (actualTournament.startDate !== expectedTournament.startDate) {
				updates.startDate = expectedTournament.startDate;
			}
			if (actualTournament.endDate !== expectedTournament.endDate) {
				updates.endDate = expectedTournament.endDate;
			}
			if (actualTournament.numberOfLostAllowed !== expectedTournament.numberOfLostAllowed) {
				updates.numberOfLostAllowed = expectedTournament.numberOfLostAllowed;
			}

			if (Object.keys(updates).length) {
				Tournaments.update({_id: actualTournament._id}, {$set: updates});
			}
		}
	}
});
