import {Meteor} from 'meteor/meteor';
import {Profiles} from '/imports/api/profiles/profiles.js';

Meteor.publish('profileData', function(userId) {
	return Profiles.find({userId: userId});
});
