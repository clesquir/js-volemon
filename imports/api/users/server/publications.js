import {Meteor} from 'meteor/meteor';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import {UserKeymaps} from '/imports/api/users/userKeymaps.js';
import {UserReactions} from '/imports/api/users/userReactions.js';

Meteor.publish('userConfiguration', function() {
	return UserConfigurations.find({userId: this.userId});
});

Meteor.publish('userKeymaps', function() {
	return UserKeymaps.find({userId: this.userId});
});

Meteor.publish('userReactions', function() {
	return UserReactions.find({userId: this.userId});
});
