import {Meteor} from 'meteor/meteor';
import {EloScores} from '/imports/api/games/eloscores.js';
import {Profiles} from '/imports/api/profiles/profiles.js';

Meteor.publish('ranks', function() {
	return [
		Meteor.users.find({}, {fields: {'profile.name': 1}}),
		Profiles.find()
	];
});

Meteor.publish('ranks-chart', function(minDate) {
	return [
		EloScores.find({timestamp: {$gt: minDate}})
	];
});
