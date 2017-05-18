import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';

Meteor.publish('achievements', function() {
	return Achievements.find();
});

Meteor.publish('userAchievements', function(userId) {
	return UserAchievements.find({userId: userId});
});
