import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {Meteor} from 'meteor/meteor';

Meteor.startup(function() {
	const tournaments = Tournaments.find({'mode.overriddenMaximumBallHit': {$exists: true}});

	tournaments.forEach(function(tournament) {
		const maximumBallHit = tournament.mode.overriddenMaximumBallHit;

		Tournaments.update({_id: tournament._id}, {$unset: {'mode.overriddenMaximumBallHit': ''}});
		Tournaments.update({_id: tournament._id}, {$set: {'mode.overriddenTeamMaximumBallHit': maximumBallHit}});
	})
});
