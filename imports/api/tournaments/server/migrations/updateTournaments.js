import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {Meteor} from 'meteor/meteor';

Meteor.startup(function() {
	const tournaments = Tournaments.find({'mode': {$exists: true}});

	tournaments.forEach(function(tournament) {
		Tournaments.update({_id: tournament._id}, {$set: {gameOverride: tournament.mode}});
		Tournaments.update({_id: tournament._id}, {$unset: {mode: ''}});
	})
});
