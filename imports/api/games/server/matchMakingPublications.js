import {MatchMakers} from '/imports/api/games/matchMakers.js';
import {Meteor} from 'meteor/meteor';

Meteor.publish('matchMakings', function() {
	return [
		MatchMakers.find()
	];
});
