import {Meteor} from 'meteor/meteor';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';

Meteor.publish('userConfiguration', function() {
	return UserConfigurations.find({userId: this.userId});
});
