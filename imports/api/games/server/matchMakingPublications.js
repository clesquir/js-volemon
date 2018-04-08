import {MatchMakers} from '/imports/api/games/matchMakers.js';
import {Meteor} from 'meteor/meteor';

Meteor.publish('matchMakings', function(modeSelection, tournamentId) {
	return [
		MatchMakers.find({modeSelection: modeSelection, tournamentId: tournamentId})
	];
});
